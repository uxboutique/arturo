/** "Decidi tu" tile: Manuale / Automatica radio group (WAI-ARIA radio pattern). */
export function initApprovalToggle(): void {
  const root = document.querySelector<HTMLElement>('[data-approval]');
  const label = root?.querySelector<HTMLElement>('[data-approval-label]');
  const radios = Array.from(root?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []);
  if (!root || !label || radios.length === 0) return;

  const labels: Record<string, string> = {
    manual: 'Approvata',
    auto: 'Approvata in automatico',
  };

  const select = (radio: HTMLButtonElement, focus: boolean): void => {
    for (const item of radios) {
      const checked = item === radio;
      item.setAttribute('aria-checked', String(checked));
      item.tabIndex = checked ? 0 : -1;
    }
    label.textContent = labels[radio.dataset.mode ?? 'manual'] ?? labels.manual!;
    if (focus) radio.focus();
  };

  root.addEventListener('click', (event) => {
    const radio = (event.target as HTMLElement).closest<HTMLButtonElement>('[role="radio"]');
    if (radio) select(radio, false);
  });

  root.addEventListener('keydown', (event) => {
    const index = radios.indexOf(event.target as HTMLButtonElement);
    if (index === -1) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = radios[(index + step + radios.length) % radios.length];
    if (next) select(next, true);
  });
}
