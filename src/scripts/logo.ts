import { prefersReducedMotion } from './config';

/**
 * Animated Arturo logo ("Brand C · Icona Sfera").
 *
 * Geometry is the Figma vector (55 × 57.08 viewBox). Every [data-logo] slot
 * keeps its <img> as the no-JS fallback; with JS it is swapped for an inline
 * SVG whose parts can be animated.
 *
 * States (data-state on the svg), after the mascot states named in Figma:
 *   rest   – Riposo: breathing, blinking, the shell drifts around the sphere
 *   listen – Ascolto: sound waves, wide eyes, small open mouth
 *   think  – Pensiero: looks up, three dots, slow tilt
 *   talk   – Parla: mouth moves
 *   happy  – Felice: ^ ^ eyes, a hop and sparkles
 * plus a hover reaction on .logo-host links (looks at you and smiles).
 */
export type LogoState = 'rest' | 'listen' | 'think' | 'talk' | 'happy';

const STATES: readonly LogoState[] = ['rest', 'listen', 'think', 'talk', 'happy'];

const DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="logo-sphere-fill" x1="12.9167" y1="12.5" x2="42.0833" y2="41.6667" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1E3A8A"/><stop offset="0.55" stop-color="#4F46E5"/><stop offset="1" stop-color="#38BDF8"/>
    </linearGradient>
    <filter id="logo-f-shell" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.15625"/>
    </filter>
    <filter id="logo-f-sphere" x="0" y="2.08333" width="55" height="55" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="bg"/>
      <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a"/>
      <feOffset dy="2.5"/><feGaussianBlur stdDeviation="3.54167"/>
      <feColorMatrix values="0 0 0 0 0.22 0 0 0 0 0.74 0 0 0 0 0.97 0 0 0 0.35 0"/>
      <feBlend in2="bg" result="drop"/>
      <feBlend in="SourceGraphic" in2="drop" result="shape"/>
      <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a2"/>
      <feOffset dy="-3.75"/><feGaussianBlur stdDeviation="3.125"/>
      <feComposite in2="a2" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix values="0 0 0 0 0.66 0 0 0 0 0.55 0 0 0 0 0.98 0 0 0 0.55 0"/>
      <feBlend in2="shape" result="in1"/>
      <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a3"/>
      <feOffset dy="1.66667"/><feGaussianBlur stdDeviation="1.66667"/>
      <feComposite in2="a3" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
      <feBlend in2="in1"/>
    </filter>
    <filter id="logo-f-shine" x="-40%" y="-60%" width="180%" height="220%">
      <feGaussianBlur stdDeviation="0.9375"/>
    </filter>
    <filter id="logo-f-glow" x="-100%" y="-100%" width="300%" height="300%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
      <feColorMatrix values="0 0 0 0 0.73 0 0 0 0 0.9 0 0 0 0 1 0 0 0 0.95 0"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
</svg>`;

const LOGO = `
<svg class="logo" viewBox="0 0 55 57.0833" aria-hidden="true" focusable="false">
  <g class="logo__float">
    <g class="logo__waves" fill="none" stroke="#7DD3FC">
      <circle class="logo__wave" cx="27.5" cy="27.0833" r="20.4167"/>
      <circle class="logo__wave" cx="27.5" cy="27.0833" r="20.4167"/>
      <circle class="logo__wave" cx="27.5" cy="27.0833" r="20.4167"/>
    </g>
    <g class="logo__shell" filter="url(#logo-f-shell)">
      <circle cx="29.1667" cy="26.25" r="20.7292" stroke="#7DD3FC" stroke-opacity="0.55" stroke-width="1.04167" fill="none"/>
    </g>
    <g class="logo__body">
      <g filter="url(#logo-f-sphere)">
        <circle cx="27.5" cy="27.0833" r="20.4167" fill="url(#logo-sphere-fill)"/>
        <circle cx="27.5" cy="27.0833" r="20.1042" stroke="#BAE6FD" stroke-opacity="0.6" stroke-width="0.625" fill="none"/>
      </g>
      <g class="logo__shine" filter="url(#logo-f-shine)">
        <ellipse cx="21.8436" cy="13.3965" rx="7.29167" ry="3.75" transform="rotate(-18 21.8436 13.3965)" fill="white" fill-opacity="0.75"/>
      </g>
      <g class="logo__face" filter="url(#logo-f-glow)">
        <g class="logo__eyes">
          <rect class="logo__eye" x="21.6667" y="20.8333" width="4.16667" height="8.33333" rx="2.08333" fill="white"/>
          <rect class="logo__eye" x="30.8333" y="20.8333" width="4.16667" height="8.33333" rx="2.08333" fill="white"/>
        </g>
        <path class="logo__happy" d="M21.9 26.2q1.85-2.9 3.7 0M31.05 26.2q1.85-2.9 3.7 0" stroke="white" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        <path class="logo__smile" d="M24.1667 32.9167C26.3889 34.5833 28.6111 34.5833 30.8333 32.9167" stroke="white" stroke-width="1.25" stroke-linecap="round" fill="none"/>
        <ellipse class="logo__mouth" cx="27.5" cy="33.5" rx="2.1" ry="1.5" fill="white"/>
      </g>
    </g>
    <g class="logo__dots" fill="#BAE6FD">
      <circle cx="40.5" cy="9" r="1.35"/><circle cx="44.2" cy="6.6" r="1.35"/><circle cx="47.9" cy="4.2" r="1.35"/>
    </g>
    <g class="logo__sparks" fill="#E0F2FE">
      <path d="M46 8l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>
      <path d="M8.5 11.5l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z"/>
      <path d="M47.5 37l.45 1.25 1.25.45-1.25.45-.45 1.25-.45-1.25-1.25-.45 1.25-.45z"/>
    </g>
  </g>
</svg>`;

let defsMounted = false;

const mountDefs = (): void => {
  if (defsMounted) return;
  document.body.insertAdjacentHTML('afterbegin', DEFS);
  defsMounted = true;
};

const isState = (value: string | undefined): value is LogoState =>
  value !== undefined && (STATES as readonly string[]).includes(value);

export function setLogoState(slot: HTMLElement, state: LogoState): void {
  const svg = slot.querySelector<SVGSVGElement>('svg.logo');
  if (!svg) return;
  if (svg.dataset.state === state) return;
  svg.dataset.state = state;
}

/** Swap every [data-logo] <img> for the animatable inline logo. */
export function initLogos(): void {
  const slots = document.querySelectorAll<HTMLElement>('[data-logo]');
  if (slots.length === 0) return;
  mountDefs();

  slots.forEach((slot, index) => {
    const img = slot.querySelector('img');
    if (!img || slot.querySelector('svg.logo')) return;
    img.insertAdjacentHTML('afterend', LOGO);
    img.remove();
    const initial = slot.dataset.logo;
    setLogoState(slot, isState(initial) ? initial : 'rest');
    // Desynchronise blinks so a page full of logos doesn't blink in unison.
    slot.style.setProperty('--blink-delay', `${-((index * 1.37) % 5.2).toFixed(2)}s`);
  });

  initCycle();
}

/**
 * "Chiedi ad Arturo" tile: walks the logo through a short conversation so
 * every state is visible. Runs only while the tile is on screen.
 */
function initCycle(): void {
  const slot = document.querySelector<HTMLElement>('[data-logo-cycle]');
  const label = document.querySelector<HTMLElement>('[data-logo-label]');
  if (!slot || !label || prefersReducedMotion()) return;

  const steps: { state: LogoState; text: string; ms: number }[] = [
    { state: 'listen', text: 'Ti ascolto', ms: 3200 },
    { state: 'think', text: 'Ci penso…', ms: 2400 },
    { state: 'talk', text: 'Ti propongo 3 argomenti', ms: 2600 },
    { state: 'happy', text: 'Fatto!', ms: 2000 },
    { state: 'rest', text: 'Quando vuoi', ms: 2400 },
  ];

  let index = 0;
  let timer: number | undefined;

  const show = (i: number): void => {
    const step = steps[i]!;
    setLogoState(slot, step.state);
    label.classList.remove('is-swapping');
    void label.offsetWidth;
    label.classList.add('is-swapping');
    label.textContent = step.text;
  };

  const tick = (): void => {
    index = (index + 1) % steps.length;
    show(index);
    timer = window.setTimeout(tick, steps[index]!.ms);
  };

  new IntersectionObserver(([entry]) => {
    window.clearTimeout(timer);
    if (entry?.isIntersecting) timer = window.setTimeout(tick, steps[index]!.ms);
  }).observe(slot);
}
