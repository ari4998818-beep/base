// The "see this year's top picks first" pop-up. Gentle by design:
// never on landing, only after ~30s on the site, most of a page scrolled, or a
// 2nd sukkah opened; once per visit; 14 days quiet after "Not now"; never again
// after signing up; never on Submit / Edit / Admin.
import * as store from './store.js';
import { t } from './i18n.js';
import { modal, pickForm, esc, img } from './ui.js';

const DISMISS_KEY = 'sp:picksDismissed';
const QUIET_DAYS = 14;
const SKIP_ROUTES = new Set(['submit', 'admin']);
let shownThisVisit = false, sukkahViews = 0, route = 'home', timer, scrollBound = false;

function eligible() {
  if (shownThisVisit || store.isSubscribed() || SKIP_ROUTES.has(route) || document.querySelector('.modal')) return false;
  try {
    const d = localStorage.getItem(DISMISS_KEY);
    if (d && Date.now() - +d < QUIET_DAYS * 864e5) return false;
  } catch {}
  return true;
}

function show(reason) {
  if (!eligible()) return;
  shownThisVisit = true;
  const pick = store.list({ sort: 'trending' }).find((s) => s.year === store.thisYear()) || store.list()[0];
  const photo = pick ? store.coverOf(pick)?.src : 'img/hero-pergola.webp';
  const m = modal(`<div class="picks-pop">
      <div class="picks-photo">${img(photo, pick ? pick.title : '', '')}<span class="picks-tag">${t('picks.tag')} · ${store.thisYear()}</span></div>
      <div class="picks-body">
        <p class="eyebrow">SukkahPin</p>
        <h2 class="display-sm">${t('picks.h')}</h2>
        <p class="muted">${t('picks.sub')}</p>
        ${pickForm(`popup-${reason}`)}
        <button class="btn btn-text picks-later" data-close>${t('picks.later')}</button>
      </div>
    </div>`, {
    cls: 'modal-picks',
    onClose: () => { if (!store.isSubscribed()) { try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {} } },
  });
  document.addEventListener('sp:subscribed', () => setTimeout(m.close, 2600), { once: true });
}

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (max > 600 && scrollY / max > 0.7) show('scroll');
}

/** Called by the router on every page change. */
export function onRoute(key) {
  route = key;
  if (key === 'detail' && ++sukkahViews === 2) setTimeout(() => show('second-sukkah'), 1500);
  if (!timer) timer = setTimeout(() => show('time'), 30000);
  if (!scrollBound) { addEventListener('scroll', onScroll, { passive: true }); scrollBound = true; }
}
