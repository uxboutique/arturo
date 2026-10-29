import { config } from './config';

type Status = { tone: 'success' | 'error'; text: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * "Parla con un consulente" dialog. Every [data-contact] trigger opens it;
 * a non-empty data-contact value pre-selects the plan.
 *
 * Delivery is configured through env vars (see .env.example). No endpoint is
 * invented: without configuration the form says so instead of faking success.
 */
export function initContactDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-contact-dialog]');
  const form = dialog?.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!dialog || !form) return;

  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const planNote = form.querySelector<HTMLElement>('[data-contact-plan-note]')!;
  const planName = form.querySelector<HTMLElement>('[data-contact-plan]')!;
  const planInput = form.elements.namedItem('plan') as HTMLInputElement;
  const nameInput = form.elements.namedItem('name') as HTMLInputElement;
  const emailInput = form.elements.namedItem('email') as HTMLInputElement;

  let opener: HTMLElement | null = null;
  let submitting = false;

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
    if (input === emailInput) {
      if (!value) return setFieldError(input, 'Scrivi la tua email.');
      return setFieldError(input, EMAIL_RE.test(value) ? null : 'Inserisci un indirizzo email valido.');
    }
    return true;
  };

  const open = (trigger: HTMLElement): void => {
    if (dialog.open) return;
    opener = trigger;
    const plan = trigger.dataset.contact ?? '';
    planInput.value = plan;
    planName.textContent = plan;
    planNote.hidden = plan === '';
    setStatus(null);
    dialog.showModal();
    nameInput.focus();
  };

  const close = (): void => {
    if (dialog.open) dialog.close();
  };

  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-contact]');
    if (!trigger) return;
    event.preventDefault();
    open(trigger);
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    // Backdrop clicks land on the <dialog> element itself.
    if (target === dialog || target.closest('[data-dialog-close]')) close();
  });

  dialog.addEventListener('close', () => {
    // Keep what was typed (accidental close), but clear transient states.
    if (status.dataset.tone === 'success') {
      form.reset();
      [nameInput, emailInput].forEach((input) => setFieldError(input, null));
    }
    setStatus(null);
    opener?.focus();
    opener = null;
  });

  // Validate on blur once the user has interacted; clear errors while typing.
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
        setStatus({ tone: 'success', text: 'Grazie! Un consulente ti scriverà entro un giorno lavorativo.' });
      } catch {
        setStatus({ tone: 'error', text: 'Invio non riuscito. Controlla la connessione e riprova.' });
      } finally {
        submitting = false;
        submit.removeAttribute('aria-busy');
        submit.textContent = 'Invia richiesta';
      }
      return;
    }

    if (config.contactEmail) {
      const subject = `Richiesta consulenza Arturo${data.plan ? ` · ${data.plan}` : ''}`;
      const body = [
        `Nome: ${data.name}`,
        `Email: ${data.email}`,
        data.company ? `Azienda: ${data.company}` : '',
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
