// $250 drawing poster: shows once per visit, 5s after arriving. Tapping it opens Submit.
// Skipped on Submit / Edit / Admin / status-post pages and if another pop-up is already open.
import { modal } from './ui.js';

const SEEN_KEY = 'sp:posterSeen';
const SRC = 'img/drawing-250.jpg';
const SKIP_ROUTES = new Set(['submit', 'admin', 'share']);
let route = 'home', timer;

function seen() { try { return !!sessionStorage.getItem(SEEN_KEY); } catch { return false; } }

function show() {
  if (seen() || SKIP_ROUTES.has(route) || document.querySelector('.modal')) return;
  try { sessionStorage.setItem(SEEN_KEY, '1'); } catch {}
  const m = modal(`<a class="poster-link" href="#/submit" data-close><img src="${SRC}" width="720" height="1280" alt="Submit your sukkah. Win $250. Every approved submission is entered automatically."></a>`, { cls: 'modal-poster' });
  m.el.closest('.modal').querySelector('.modal-panel').setAttribute('aria-label', 'Submit your sukkah — $250 drawing');
}

/** Called by the router on every page change. */
export function onRoute(key) {
  route = key;
  if (timer || seen()) return;
  timer = setTimeout(() => {
    const pre = new Image();
    pre.onload = show;
    pre.src = SRC;
  }, 5000);
}
