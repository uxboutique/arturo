import { setLogoState } from './logo';

/**
 * Mobile demo ("Prova Arturo" below 768px): the five "Tool - App · Brand C"
 * screens in a swipe track, with tabs and in-screen links between them.
 * Example data only.
 */
export function initMobileDemo(): void {
  const root = document.querySelector<HTMLElement>('[data-mdemo]');
  const track = root?.querySelector<HTMLElement>('[data-mdemo-track]');
  if (!root || !track) return;

  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const slides = Array.from(track.querySelectorAll<HTMLElement>('[data-slide]'));
  let current = 0;
  let frame = 0;

  const select = (index: number, focusTab = false): void => {
    current = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus({ preventScroll: true });
      // Keep the active tab visible inside the tab strip (horizontal only).
      const strip = tab.parentElement;
      if (on && strip) {
        const left = tab.offsetLeft - strip.offsetLeft;
        if (left < strip.scrollLeft) strip.scrollLeft = left - 12;
        else if (left + tab.offsetWidth > strip.scrollLeft + strip.clientWidth)
          strip.scrollLeft = left + tab.offsetWidth - strip.clientWidth + 12;
      }
    });
    // Keep keyboard focus out of slides that aren't on screen.
    slides.forEach((slide, i) => slide.toggleAttribute('inert', i !== index));
  };

  const goTo = (index: number, focusTab = false): void => {
    const slide = slides[index];
    if (!slide) return;
    track.scrollLeft = slide.offsetLeft - track.offsetLeft;
    select(index, focusTab);
  };

  track.addEventListener(
    'scroll',
    () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const index = Math.round(track.scrollLeft / track.clientWidth);
        if (index !== current) select(index);
      });
    },
    { passive: true },
  );

  root.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLElement>('[data-go]');
    if (!link) return;
    const index = slides.findIndex((s) => s.dataset.slide === link.dataset.go);
    if (index !== -1) goTo(index, link.getAttribute('role') === 'tab');
  });

  // Tabs: arrow keys move between screens (WAI-ARIA tabs pattern).
  root.querySelector('[role="tablist"]')?.addEventListener('keydown', (event) => {
    const e = event as KeyboardEvent;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step === undefined && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? slides.length - 1 : (current + step! + slides.length) % slides.length;
    goTo(next, true);
  });

  // ---- Bozza screen: approval mode, approve and edit.
  const bozza = track.querySelector<HTMLElement>('[data-slide="bozza"]');
  const pending = track.querySelector<HTMLElement>('[data-mdemo-pending]');
  const draft = bozza?.querySelector<HTMLElement>('[data-mdemo-draft]');
  const approve = bozza?.querySelector<HTMLButtonElement>('[data-mdemo-approve]');
  const edit = bozza?.querySelector<HTMLButtonElement>('[data-mdemo-edit]');
  const statusEl = bozza?.querySelector<HTMLElement>('[data-mdemo-status]');
  const bozzaLogo = bozza?.querySelector<HTMLElement>('.m-ask [data-logo]');
  const fullDraft = draft?.innerHTML ?? '';
  const shortDraft =
    'Il fotovoltaico conviene alla tua azienda? Tre controlli: consumi di giorno, spazio sul tetto, incentivi. Tu li hai già fatti?';
  let approved = false;
  let short = false;

  bozza?.querySelectorAll<HTMLButtonElement>('[role="radio"]').forEach((radio, _i, all) => {
    radio.addEventListener('click', () => {
      all.forEach((r) => r.setAttribute('aria-checked', String(r === radio)));
      if (statusEl)
        statusEl.textContent =
          radio.dataset.mode === 'auto' ? 'Le prossime bozze si approvano da sole' : 'Approvi tu ogni bozza';
    });
  });

  approve?.addEventListener('click', () => {
    approved = !approved;
    approve.textContent = approved ? 'Approvata ✓' : 'Approva';
    approve.classList.toggle('is-done', approved);
    approve.classList.toggle('is-primary', !approved);
    if (pending) pending.textContent = approved ? '2 bozze' : '3 bozze';
    if (statusEl) statusEl.textContent = approved ? 'Bozza approvata · pronta da pubblicare' : 'Approvazione annullata';
    if (bozzaLogo) {
      setLogoState(bozzaLogo, approved ? 'happy' : 'rest');
      if (approved) window.setTimeout(() => setLogoState(bozzaLogo, 'rest'), 2200);
    }
  });

  edit?.addEventListener('click', () => {
    if (!draft) return;
    short = !short;
    if (short) draft.textContent = shortDraft;
    else draft.innerHTML = fullDraft;
    edit.textContent = short ? 'Versione lunga' : 'Modifica';
    if (statusEl) statusEl.textContent = short ? 'Arturo l’ha resa più breve' : 'Ripristinata la versione completa';
  });

  select(0);
}
