import * as store from './store.js';
import { t, lang, setLang, applyLang } from './i18n.js';
import { $, $$, icon, esc, refreshVotes, hydrate, fmt, modal, finishVote } from './ui.js';
import { renderHome } from './views/home.js';
import { renderDetail } from './views/detail.js';
import { renderSubmit, renderEdit } from './views/submit.js';
import { renderExplore, renderSources, renderWinners, renderAbout } from './views/pages.js';
import { renderAdmin } from './views/admin.js';
import * as popup from './popup.js';
import { pickForm } from './ui.js';

const ROUTES = [
  [/^\/?$/, (root, p, _m, c) => renderHome(root, c), 'home'],
  [/^\/explore$/, (root, p) => renderExplore(root, p), 'explore'],
  [/^\/sukkah\/([\w-]+)$/, (root, p, m) => renderDetail(root, m[1]), 'detail'],
  [/^\/submit$/, (root) => renderSubmit(root), 'submit'],
  [/^\/edit\/([\w-]+)$/, (root, p, m) => renderEdit(root, m[1], p.get('k')), 'submit'],
  [/^\/sources$/, (root, p) => renderSources(root, p), 'sources'],
  [/^\/sources\/([\w-]+)$/, (root, p, m) => renderSources(root, p, m[1]), 'sources'],
  [/^\/winners$/, (root) => renderWinners(root), 'winners'],
  [/^\/about$/, (root) => renderAbout(root), 'about'],
  [/^\/admin$/, (root, p) => renderAdmin(root, p), 'admin'],
];

function chrome() {
  const links = [['explore', '#/explore', 'nav.explore'], ['submit', '#/submit', 'nav.submit'], ['sources', '#/sources', 'nav.sources'], ['winners', '#/winners', 'nav.winners'], ['about', '#/about', 'nav.about']];
  $('#nav').innerHTML = `
    <a class="logo" href="#/" aria-label="SukkahPin — home"><img src="brand/sukkahpin-logo.svg" alt="SukkahPin" width="135" height="30"></a>
    <nav class="nav-links" aria-label="Main">${links.map(([k, h, l]) => `<a href="${h}" data-nav="${k}">${t(l)}</a>`).join('')}</nav>
    <div class="nav-r">
      <button class="icon-btn" data-search aria-label="Search">${icon.search}</button>
      <button class="lang" data-lang aria-label="Switch language">${t('nav.lang')}</button>
      <a class="btn btn-lime btn-sm nav-cta" href="#/submit">${t('nav.cta')}</a>
      <button class="burger" data-menu aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
    </div>`;
  $('#menu').innerHTML = `<nav>${links.map(([k, h, l]) => `<a href="${h}">${t(l)}</a>`).join('')}</nav>
    <div class="menu-foot"><a class="btn btn-lime btn-lg" href="#/submit">${t('nav.cta')}</a><button class="lang big" data-lang>${t('nav.lang')}</button></div>`;
  const samples = store.list().some((s) => s.sample);
  $('#footer').innerHTML = `
    <section class="f-picks">
      <div><p class="eyebrow">${t('picks.tag')} · ${new Date().getFullYear()}</p><h2 class="display-sm">${t('picks.h')}</h2></div>
      <div>${pickForm('footer', { compact: true })}</div>
    </section>
    <div class="f-big">${esc(t('footer.line'))}</div>
    <div class="f-row">
      <a class="logo" href="#/"><img src="brand/sukkahpin-logo.svg" alt="SukkahPin" width="135" height="30"></a>
      <nav>${links.map(([, h, l]) => `<a href="${h}">${t(l)}</a>`).join('')}<a href="#/admin">${t('footer.admin')}</a></nav>
      <p class="small muted">© ${new Date().getFullYear()} SukkahPin${samples ? ` · ${t('footer.sample')}` : ''}</p>
    </div>`;
}

let cleanups = [];
function route() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  const [path, qs] = location.hash.slice(1).split('?');
  const params = new URLSearchParams(qs || '');
  const match = ROUTES.map(([re, fn, key]) => [path.match(re), fn, key]).find(([m]) => m) || [null, ROUTES[0][1], 'home'];
  const [m, fn, key] = match;

  // Fresh container per route so view-level handlers never leak between pages.
  const old = $('#app');
  const root = document.createElement('main');
  root.id = 'app';
  root.className = `view view-${key}`;
  old.replaceWith(root);

  document.title = 'SukkahPin — every sukkah has a story';
  document.body.dataset.route = key;
  $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === key));
  closeMenu();
  fn(root, params, m, (c) => cleanups.push(c));
  popup.onRoute(key);
  // Vercel Web Analytics: this site routes with #hash, so report each page ourselves.
  window.va?.('pageview', { route: key === 'detail' ? '/sukkah/[slug]' : key === 'sources' && m?.[1] ? '/sources/[item]' : '/' + (path.replace(/^\//, '') || ''), path: '/' + path.replace(/^\//, '') });
  hydrate(root);
  reveal(root);
  if (!sessionStorage.getItem('sp:keepScroll')) window.scrollTo(0, 0);
  sessionStorage.removeItem('sp:keepScroll');
}

/* Subtle reveal-on-scroll for sections and images. */
let io;
function reveal(root) {
  io?.disconnect();
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' });
  $$('.section, .shot, .band, .project-cover', root).forEach((el) => { el.classList.add('rv'); io.observe(el); });
}

/* ---------------- Menu, search, language ---------------- */

const closeMenu = () => { document.body.classList.remove('menu-open'); $('[data-menu]')?.setAttribute('aria-expanded', 'false'); };

function openSearch() {
  const el = $('#search');
  el.innerHTML = `<form class="search-form" role="search">
      <span aria-hidden="true">${icon.search}</span>
      <input name="q" type="search" placeholder="${t('nav.search')}" autocomplete="off" aria-label="Search">
      <button type="button" class="icon-btn" data-search-close aria-label="${t('close')}">${icon.close}</button>
    </form>
    <div class="search-quick"></div>`;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('in'));
  const input = $('input', el);
  input.focus();
  const quick = $('.search-quick', el);
  const draw = () => {
    const q = input.value.trim();
    const res = q ? store.list({ q }).slice(0, 5) : [];
    quick.innerHTML = res.map((s) => `<a href="#/sukkah/${s.slug}"><strong>${esc(s.title)}</strong><em>${esc(s.location)}</em><span>♡ ${fmt(s.votes)}</span></a>`).join('');
  };
  input.oninput = draw;
  $('form', el).onsubmit = (e) => { e.preventDefault(); if (input.value.trim()) location.hash = `#/explore?q=${encodeURIComponent(input.value.trim())}`; closeSearch(); };
  quick.onclick = (e) => e.target.closest('a') && closeSearch();
}
function closeSearch() { const el = $('#search'); el.classList.remove('in'); setTimeout(() => (el.hidden = true), 200); }

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-menu]')) {
    const open = document.body.classList.toggle('menu-open');
    $('[data-menu]').setAttribute('aria-expanded', open);
  }
  if (e.target.closest('[data-search]')) openSearch();
  if (e.target.closest('[data-search-close]') || e.target.id === 'search') closeSearch();
  if (e.target.closest('[data-lang]')) {
    setLang(lang === 'yi' ? 'en' : 'yi');
    chrome();
    sessionStorage.setItem('sp:keepScroll', '1');
    const y = window.scrollY;
    route();
    window.scrollTo(0, y);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeSearch(); closeMenu(); }
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});

/* Nav gets a hairline once you scroll. */
const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 12);
window.addEventListener('scroll', onScroll, { passive: true });

store.onChange(() => {
  refreshVotes();
  $$('[data-vote-count]').forEach((d) => { const s = store.get(d.dataset.voteCount); if (s) d.textContent = fmt(s.votes); });
});

/* ---------------- Boot ---------------- */

async function boot() {
  applyLang();
  chrome();
  $('#app').innerHTML = '<div class="boot" aria-busy="true"><span></span></div>';
  // Returning from the emailed sign-in link: Supabase reads the tokens from the URL hash.
  const fromEmail = /access_token=|error_description=/.test(location.hash);
  try {
    await store.init();
  } catch (e) {
    console.error(e);
    $('#app').innerHTML = `<section class="section notfound"><h1 class="display">${t('vote.error')}</h1><button class="btn btn-dark" onclick="location.reload()">↻</button></section>`;
    return;
  }
  let pending = null;
  try { pending = localStorage.getItem('sp:pendingVote'); } catch {}
  let returnTo = null;
  try { returnTo = localStorage.getItem('sp:returnTo'); localStorage.removeItem('sp:returnTo'); } catch {}
  if (fromEmail) history.replaceState(null, '', location.pathname + (pending ? `#/sukkah/${pending}` : returnTo || '#/'));
  window.addEventListener('hashchange', route);
  route();
  onScroll();
  if (pending && store.session()) {
    try { localStorage.removeItem('sp:pendingVote'); } catch {}
    const s = store.get(pending);
    if (s) finishVote(modal('', { cls: 'modal-sm' }), s);
  }
}
boot();
