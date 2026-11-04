# Arturo — landing page

Landing page di **Arturo, AI Content Agent**, implementata dal frame Figma
"Landing · Brand C · Sfera Istituzionale" (file `Arturo-Agent`, nodo `160:12863`).

Stack: Vite + TypeScript + CSS (nessun framework UI). Font self-hosted via Fontsource (Inter, Sora, Nunito).

Pagine:

- `/` — landing (testi definitivi dal documento "Landing Arturo - testi", sezione 3)
- `/app/` — il tool: demo interattiva a schermo intero (desktop: prototipo "Tool - Desktop · Brand C"; mobile: schermate "Tool - App · Brand C")

La demo è in `partials/demo.html` ed è inclusa in entrambe le pagine (`<!--#include … -->`, plugin in `vite.config.ts`).

## Segnaposto da completare

Marcati in pagina con bordo tratteggiato giallo "Segnaposto":

- invio del modulo contatti → `VITE_CONTACT_ENDPOINT` o `VITE_CONTACT_EMAIL`
- informativa privacy e cookie policy → `VITE_PRIVACY_URL`, `VITE_COOKIE_URL`
- recensioni dei clienti (6 card vuote)
- loghi ufficiali di "Scelto da"
- card consulente nella demo: "Ha aggiornato il tuo profilo de…"

## Comandi

```bash
npm install
npm run dev        # sviluppo
npm run typecheck  # tsc --noEmit
npm run build      # type-check + build di produzione in dist/
npm run preview    # serve dist/
```

## Configurazione

Copia `.env.example` in `.env` e imposta:

| Variabile | Uso |
| --- | --- |
| `VITE_CONTACT_ENDPOINT` | POST JSON del form contatti (`name`, `email`, `phone`, `message`, `plan`) |
| `VITE_CONTACT_EMAIL` | alternativa: apre il client di posta verso questo indirizzo |
| `VITE_PRIVACY_URL`, `VITE_COOKIE_URL` | link legali nel footer (vuoti = testo semplice) |

Senza endpoint né email il form valida i dati ma dichiara che l'invio non è attivo.

## Struttura

```
index.html                 markup di tutte le sezioni
src/main.ts                entry: font, stili, inizializzazione moduli
src/styles/tokens.css      design token (colori, tipografia, easing)
src/styles/components.css  bottoni, mockup telefono, dialog, form…
src/styles/sections.css    layout delle sezioni + responsive
src/styles/demo.css        prototipo interattivo "Prova Arturo"
src/styles/motion.css      animazioni (timeline Figma + reveal stile Apple)
src/scripts/*.ts           nav, reveal, dialog contatti, prototipo, toggle
src/assets/                asset esportati da Figma
```

## Logo animato

Ogni `[data-logo]` diventa un SVG inline animabile (`src/scripts/logo.ts`, `src/styles/logo.css`).
Stati, dai nomi della mascotte in Figma, impostabili con `data-logo="…"` o `setLogoState(el, stato)`:

| Stato | Comportamento |
| --- | --- |
| `rest` (Riposo) | respira, sbatte le palpebre, il guscio orbita; al passaggio del mouse guarda e sorride |
| `listen` (Ascolto) | onde sonore, occhi aperti, bocca a "o" |
| `think` (Pensiero) | guarda in alto, tre puntini, si inclina |
| `talk` (Parla) | la bocca si muove |
| `happy` (Felice) | occhi a ^ ^, salto e scintille |

La card "Chiedi ad Arturo" li mostra in sequenza; nel prototipo seguono la conversazione.

Tutte le animazioni rispettano `prefers-reduced-motion` e si mettono in pausa fuori schermo.
Lo scroll è sempre immediato (niente smooth scroll).
