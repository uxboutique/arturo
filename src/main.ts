import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/sora/wght.css';
import '@fontsource/nunito/latin-800.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/demo.css';
import './styles/motion.css';
import './styles/logo.css';
import './styles/animations.css';

import { initNav } from './scripts/nav';
import { initReveal, initOffscreenPause } from './scripts/visibility';
import { initApprovalToggle } from './scripts/approval';
import { initContactDialog } from './scripts/contact';
import { initPrototype } from './scripts/prototype';
import { initLegalLinks } from './scripts/legal';
import { initLogos } from './scripts/logo';
import { initSplitHeadings, initCounters } from './scripts/text';

initLogos();
initSplitHeadings();
initNav();
initReveal();
initOffscreenPause();
initApprovalToggle();
initContactDialog();
initPrototype();
initLegalLinks();
initCounters();
