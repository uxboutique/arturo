import { config } from './config';

type Status = { tone: 'success' | 'error'; text: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * "Parla con un consulente": every [data-contact] trigger leads to the
 * contact section (#contatti). A non-empty data-contact value pre-selects
 * the plan. On pages without the form (the tool page) it goes to the
 * landing's form instead.
 *
 * Delivery is configured through env vars (see .env.example). No endpoint is
 * invented: without configuration the form says so instead of faking success.
 */
export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-contact]');
    if (!trigger) return;
    const plan = trigger.dataset.contact ?? '';
    if (!form) {
      event.preventDefault();
      window.location.href = `../${plan ? `?piano=${encodeURIComponent(plan)}` : ''}#contatti`;
      return;
    }
    event.preventDefault();
    openForm(plan);
  });

  if (!form) return;

  const section = form.closest<HTMLElement>('section') ?? form;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const planNote = form.querySelector<HTMLElement>('[data-contact-plan-note]')!;
  const planName = form.querySelector<HTMLElement>('[data-contact-plan]')!;
  const unconfigured = form.querySelector<HTMLElement>('[data-contact-unconfigured]');
  const planInput = form.elements.namedItem('plan') as HTMLInputElement;
  const nameInput = form.elements.namedItem('name') as HTMLInputElement;
  const emailInput = form.elements.namedItem('email') as HTMLInputElement;
  const submitLabel = submit.textContent ?? '';
  let submitting = false;

  // Placeholder notice while no delivery is configured.
  if (unconfigured) unconfigured.hidden = Boolean(config.contactEndpoint || config.contactEmail);

  function setPlan(plan: string): void {
    planInput.value = plan;
    planName.textContent = plan;
    planNote.hidden = plan === '';
  }

  function openForm(plan: string): void {
    setPlan(plan);
    if (location.hash !== '#contatti') history.pushState(null, '', '#contatti');
    section.scrollIntoView({ block: 'start' });
    section.querySelector('[data-reveal]')?.classList.add('is-revealed');
    nameInput.focus({ preventScroll: true });
  }

  // Arriving from the tool page with ?piano=…
  const fromQuery = new URLSearchParams(location.search).get('piano');
  if (fromQuery) setPlan(fromQuery);

  const setStatus = (next: Status | null): void => {
    status.hidden = next === null;
    status.textContent = next?.text ?? '';
    if (next) status.dataset.tone = next.tone;
  };

  const setFieldError = (input: HTMLInputElement, message: string | null): boolean => {
    const error = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', String(message !== null));
    if (error) {
      error.hidden = message === null;
      if (message) error.textContent = message;
    }
    return message === null;
  };

  const validate = (input: HTMLInputElement): boolean => {
    const value = input.value.trim();
    if (input === nameInput) return setFieldError(input, value ? null : 'Scrivi il tuo nome.');
    if (!value) return setFieldError(input, 'Scrivi la tua email.');
    return setFieldError(input, EMAIL_RE.test(value) ? null : 'Inserisci un indirizzo email valido.');
  };

  for (const input of [nameInput, emailInput]) {
    input.addEventListener('blur', () => {
      if (input.value.trim() !== '' || input.getAttribute('aria-invalid') === 'true') validate(input);
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validate(input);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const valid = [nameInput, emailInput].map(validate);
    const firstInvalid = [nameInput, emailInput].find((_, i) => !valid[i]);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (config.contactEndpoint) {
      submitting = true;
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = 'Invio in corso…';
      setStatus(null);
      try {
        const response = await fetch(config.contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        setPlan('');
        setStatus({ tone: 'success', text: 'Grazie! Ti ricontatta un consulente.' });
      } catch {
        setStatus({ tone: 'error', text: 'Invio non riuscito. Controlla la connessione e riprova.' });
      } finally {
        submitting = false;
        submit.removeAttribute('aria-busy');
        submit.textContent = submitLabel;
      }
      return;
    }

    if (config.contactEmail) {
      const subject = `Richiesta preventivo Arturo${data.plan ? ` · ${data.plan}` : ''}`;
      const body = [
        `Nome: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Cellulare: ${data.phone}` : '',
        data.message ? `\n${data.message}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      window.location.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus({ tone: 'success', text: 'Si è aperto il tuo programma di posta con il messaggio pronto da inviare.' });
      return;
    }

    setStatus({
      tone: 'error',
      text: 'L’invio online non è ancora attivo su questa pagina. Riprova più tardi.',
    });
  });
}
