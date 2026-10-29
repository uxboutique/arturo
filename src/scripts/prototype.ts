import { prefersReducedMotion } from './config';

type DraftStatus = 'pending' | 'approved';
type ViewId = 'oggi' | 'radar' | 'approvare' | 'archivio' | 'profilo';

interface Draft {
  id: string;
  channel: string;
  text: string;
  status: DraftStatus;
  editing: boolean;
}

/** Example data, as shown in the Figma prototype frame. */
const initialDrafts = (): Draft[] => [
  {
    id: 'linkedin',
    channel: 'LinkedIn',
    text: 'Il fotovoltaico conviene alla tua azienda? Dipende da tre cose…',
    status: 'pending',
    editing: false,
  },
  {
    id: 'instagram',
    channel: 'Instagram',
    text: 'Carosello · Le tre domande da farsi prima del preventivo',
    status: 'pending',
    editing: false,
  },
  {
    id: 'newsletter',
    channel: 'Newsletter',
    text: 'Oggetto: prima del preventivo, cosa controllare',
    status: 'pending',
    editing: false,
  },
];

/** Canned answers: the prototype only uses sample data, it calls no AI. */
const answerFor = (question: string): { text: string; action?: { label: string; view: ViewId } } => {
  const q = question.toLowerCase();
  if (/(radar|argoment|settiman|parl|tema|idea)/.test(q)) {
    return {
      text: 'Questa settimana ti propongo «Fotovoltaico per l’azienda» (84) e «Packaging sostenibile» (78). Li trovi nel radar.',
      action: { label: 'Apri il radar', view: 'radar' },
    };
  }
  if (/(bozz|approv|post|linkedin|instagram|newsletter)/.test(q)) {
    return {
      text: 'Le bozze di oggi sono pronte: LinkedIn, Instagram e Newsletter. Puoi approvarle o modificarle.',
      action: { label: 'Rivedi le bozze', view: 'approvare' },
    };
  }
  if (/(tono|voce|brand|profilo|parole)/.test(q)) {
    return {
      text: 'Scrivo con il tono del tuo Profilo del brand: diretto e semplice, senza «soluzioni a 360 gradi».',
      action: { label: 'Vedi il profilo', view: 'profilo' },
    };
  }
  return {
    text: 'Bella domanda. Nel prodotto vero guardo il tuo settore e ti rispondo con argomenti e fonti. Qui è un esempio: prova a chiedermi «di cosa parliamo questa settimana?»',
  };
};

export function initPrototype(): void {
  const app = document.querySelector<HTMLElement>('[data-app]');
  const template = document.querySelector<HTMLTemplateElement>('#draft-template');
  if (!app || !template) return;

  const views = new Map<ViewId, HTMLElement>(
    Array.from(app.querySelectorAll<HTMLElement>('[data-view]')).map((el) => [el.dataset.view as ViewId, el]),
  );
  const navItems = Array.from(app.querySelectorAll<HTMLButtonElement>('.app__nav [data-view-target]'));
  const slots = Array.from(app.querySelectorAll<HTMLElement>('[data-drafts-slot]'));
  const pendingCount = app.querySelector<HTMLElement>('[data-pending-count]')!;
  const pendingLabel = app.querySelector<HTMLElement>('[data-pending-label]')!;
  const pendingSub = app.querySelector<HTMLElement>('[data-pending-sub]')!;
  const pendingSummary = app.querySelector<HTMLElement>('[data-pending-summary]')!;
  const archive = app.querySelector<HTMLElement>('[data-archive]')!;
  const archiveEmpty = app.querySelector<HTMLElement>('[data-archive-empty]')!;
  const message = app.querySelector<HTMLElement>('.app-message')!;
  const messageText = app.querySelector<HTMLElement>('[data-arturo-message]')!;
  const messageAction = app.querySelector<HTMLButtonElement>('[data-message-action]')!;
  const mascot = app.querySelector<HTMLElement>('[data-mascot]')!;
  const askForm = app.querySelector<HTMLFormElement>('[data-ask]')!;
  const askInput = askForm.querySelector<HTMLInputElement>('input')!;
  const askSend = askForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const drafts = initialDrafts();
  let current: ViewId = 'oggi';
  let thinkingTimer: number | undefined;
  let moodTimer: number | undefined;

  // ------------------------------------------------------------- views
  const showView = (id: ViewId, { focus = false } = {}): void => {
    const target = views.get(id);
    if (!target) return;
    current = id;
    for (const [viewId, el] of views) {
      el.hidden = viewId !== id;
      el.classList.remove('is-entering');
    }
    if (!prefersReducedMotion()) {
      // Restart the entrance animation on every switch.
      void target.offsetWidth;
      target.classList.add('is-entering');
    }
    target.scrollTop = 0;
    for (const item of navItems) {
      if (item.dataset.viewTarget === id) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    }
    if (focus) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  };

  app.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-view-target]');
    if (!trigger || !app.contains(trigger)) return;
    const isNav = navItems.includes(trigger as HTMLButtonElement);
    showView(trigger.dataset.viewTarget as ViewId, { focus: !isNav });
  });

  // ------------------------------------------------------------- drafts
  const approvedIcon = new URL('../assets/icons/check-approved.svg', import.meta.url).href;

  const button =(label: string, action: string, id: string, variant = ''): HTMLButtonElement => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `chip-btn ${variant}`.trim();
    el.textContent = label;
    el.dataset.action = action;
    el.dataset.id = id;
    return el;
  };

  const renderDraft = (draft: Draft, expanded: boolean): HTMLElement => {
    const node = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    node.dataset.id = draft.id;
    node.classList.toggle('is-approved', draft.status === 'approved');
    node.querySelector('.app-draft__channel')!.textContent = draft.channel;
    const text = node.querySelector<HTMLElement>('.app-draft__text')!;
    text.textContent = draft.text;
    const edit = node.querySelector<HTMLElement>('.app-draft__edit')!;
    const textarea = edit.querySelector('textarea')!;
    const editId = `draft-edit-${draft.id}-${expanded ? 'full' : 'card'}`;
    textarea.id = editId;
    edit.querySelector('label')!.htmlFor = editId;
    edit.querySelector('label')!.textContent = `Modifica bozza ${draft.channel}`;

    const actions = node.querySelector<HTMLElement>('.app-draft__actions')!;

    if (draft.editing) {
      text.hidden = true;
      edit.hidden = false;
      textarea.value = draft.text;
      actions.append(
        button('Salva', 'save', draft.id, 'chip-btn--primary'),
        button('Annulla', 'cancel-edit', draft.id, 'chip-btn--ghost'),
      );
    } else if (draft.status === 'approved') {
      const badge = document.createElement('span');
      badge.className = 'app-draft__approved';
      badge.innerHTML = `<img src="${approvedIcon}" alt="" width="14" height="14" />Approvata`;
      actions.append(badge, button('Annulla', 'undo', draft.id, 'chip-btn--ghost'));
    } else {
      actions.append(
        button('Approva', 'approve', draft.id, 'chip-btn--primary'),
        button('Modifica', 'edit', draft.id),
      );
    }
    return node;
  };

  const render = (focus?: { id: string; action: string }): void => {
    for (const slot of slots) {
      const expanded = slot.dataset.draftsSlot === 'approvare';
      slot.replaceChildren(...drafts.map((draft) => renderDraft(draft, expanded)));
    }

    const pending = drafts.filter((d) => d.status === 'pending');
    const approved = drafts.filter((d) => d.status === 'approved');
    pendingCount.textContent = String(pending.length);
    pendingLabel.textContent = pending.length === 1 ? '1 bozza' : `${pending.length} bozze`;
    pendingSub.textContent =
      pending.length === 0 ? 'Tutto approvato per oggi' : 'La migliore vale 84 · ' + pending[0]!.channel;
    pendingSummary.textContent =
      pending.length === 0
        ? 'Hai approvato tutte le bozze di oggi.'
        : `${pending.length === 1 ? '1 bozza' : `${pending.length} bozze`} su «Fotovoltaico per l’azienda»`;

    archive.replaceChildren(
      ...approved.map((draft) => {
        const li = document.createElement('li');
        li.className = 'app-card';
        const label = document.createElement('small');
        label.textContent = `${draft.channel} · approvata`;
        const p = document.createElement('p');
        p.textContent = draft.text;
        li.append(label, p);
        return li;
      }),
    );
    archiveEmpty.hidden = approved.length > 0;

    // Keep keyboard focus on the equivalent control after re-rendering.
    if (focus) {
      const scope = views.get(current) ?? app;
      const card = scope.querySelector<HTMLElement>(`.app-draft[data-id="${focus.id}"]`);
      const target =
        card?.querySelector<HTMLElement>(focus.action === 'edit' ? 'textarea' : 'button') ?? null;
      target?.focus();
    }
  };

  app.addEventListener('click', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if (!el) return;
    const draft = drafts.find((d) => d.id === el.dataset.id);
    if (!draft) return;
    const action = el.dataset.action!;

    switch (action) {
      case 'approve':
        draft.status = 'approved';
        break;
      case 'undo':
        draft.status = 'pending';
        break;
      case 'edit':
        drafts.forEach((d) => (d.editing = d === draft));
        break;
      case 'save': {
        const value = el.closest('.app-draft')?.querySelector('textarea')?.value.trim();
        if (value) draft.text = value;
        draft.editing = false;
        break;
      }
      case 'cancel-edit':
        draft.editing = false;
        break;
      default:
        return;
    }
    render({ id: draft.id, action });
  });

  app.addEventListener('keydown', (event) => {
    const textarea = event.target as HTMLElement;
    if (!(textarea instanceof HTMLTextAreaElement) || !textarea.closest('.app-draft')) return;
    const id = textarea.closest<HTMLElement>('.app-draft')!.dataset.id!;
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      draft.editing = false;
      render({ id, action: 'cancel-edit' });
    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      const value = textarea.value.trim();
      if (value) draft.text = value;
      draft.editing = false;
      render({ id, action: 'save' });
    }
  });

  // ------------------------------------------------------------- ask Arturo
  const setMood = (state: 'think' | 'happy' | null): void => {
    if (state) mascot.dataset.state = state;
    else delete mascot.dataset.state;
  };

  askForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = askInput.value.trim();
    if (!question || askSend.disabled) return;

    window.clearTimeout(thinkingTimer);
    window.clearTimeout(moodTimer);
    if (current !== 'oggi') showView('oggi');

    askInput.value = '';
    askSend.disabled = true;
    message.classList.add('is-thinking');
    message.setAttribute('aria-busy', 'true');
    messageText.textContent = 'Ci penso';
    messageAction.hidden = true;
    setMood('think');

    // Simulated latency so the "thinking" state is perceivable.
    thinkingTimer = window.setTimeout(() => {
      const answer = answerFor(question);
      message.classList.remove('is-thinking');
      message.removeAttribute('aria-busy');
      messageText.textContent = answer.text;
      if (answer.action) {
        messageAction.textContent = answer.action.label;
        messageAction.dataset.viewTarget = answer.action.view;
        messageAction.hidden = false;
      }
      askSend.disabled = false;
      setMood('happy');
      moodTimer = window.setTimeout(() => setMood(null), 2400);
    }, prefersReducedMotion() ? 300 : 900);
  });

  render();
}
