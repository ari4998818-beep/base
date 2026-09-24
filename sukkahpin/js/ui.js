import * as store from './store.js';
import { t, tc, isRTL } from './i18n.js';

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const fmt = (n) => Number(n).toLocaleString('en-US');
export const arrow = () => (isRTL() ? '←' : '→');
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const icon = {
  heart: (filled) => `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.8 4 7.4 4c2 0 3.4 1.1 4.6 2.7C13.2 5.1 14.6 4 16.6 4c3.6 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4z" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 1113 0c0 5-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
  search: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2.5c.6 4.9 2.6 7 7.5 7.5v.1c-4.9.6-6.9 2.6-7.5 7.5h-.1c-.5-4.9-2.6-6.9-7.4-7.5v-.1c4.8-.5 6.9-2.6 7.4-7.5z" fill="currentColor"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2.2a9.7 9.7 0 00-8.4 14.6L2.3 21.7l5-1.3A9.7 9.7 0 1012 2.2zm0 17.7c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.4z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  chev: (dir) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${dir === 'l' ? 'M14.5 6l-6 6 6 6' : 'M9.5 6l6 6-6 6'}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
  image: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 16l5-5 4 4 3-3 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  star: (on) => `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
};

/** <img> that also works for uploaded (IndexedDB) photos. Call hydrate() after inserting. */
export function img(src, alt = '', attrs = '') {
  return `<img src="${esc(src)}" alt="${esc(alt)}" ${attrs}>`;
}
export function hydrate() {} // photos are plain URLs now (Supabase Storage / static)

/* ---------------- Cards ---------------- */

export function voteChip(s, cls = '') {
  const voted = store.hasVoted(s.id);
  return `<button class="vote-chip ${cls} ${voted ? 'is-voted' : ''}" data-vote="${s.id}" aria-pressed="${voted}" aria-label="${t('vote.vote')}: ${esc(s.title)}">${icon.heart(voted)}<span data-count>${fmt(s.votes)}</span></button>`;
}

export function card(s) {
  const c = store.coverOf(s);
  return `<article class="card">
    <a class="card-media" href="#/sukkah/${s.slug}">${img(c.src, s.title, 'loading="lazy"')}</a>
    ${voteChip(s, 'on-media')}
    <div class="card-body">
      <h3><a href="#/sukkah/${s.slug}">${esc(s.title)}</a></h3>
      <p class="loc">${icon.pin}${esc(s.location)}</p>
      <ul class="tags">${(s.tags || s.categories).slice(0, 3).map((x) => `<li>${esc(tc(x))}</li>`).join('')}</ul>
    </div>
  </article>`;
}

const SHAPES = ['tall', 'square', 'wide', 'tall', 'portrait', 'square', 'portrait', 'tall', 'wide'];
export function tile(s, i) {
  const c = store.coverOf(s);
  return `<a class="tile shape-${SHAPES[i % SHAPES.length]}" href="#/sukkah/${s.slug}">
    ${img(c.src, s.title, 'loading="lazy"')}
    <span class="tile-meta"><strong>${esc(s.title)}</strong><em>${esc(s.location)}</em></span>
    <span class="tile-votes">${icon.heart(store.hasVoted(s.id))}${fmt(s.votes)}</span>
    ${s.editorsPick ? `<span class="pick">${t('detail.pick')}</span>` : ''}
  </a>`;
}

/* ---------------- Toast / Modal ---------------- */

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, 2200);
}

export function modal(inner, { cls = '', onClose } = {}) {
  const wrap = document.createElement('div');
  wrap.className = `modal ${cls}`;
  wrap.innerHTML = `<div class="modal-scrim" data-close></div><div class="modal-panel" role="dialog" aria-modal="true"><button class="icon-btn modal-x" data-close aria-label="${t('close')}">${icon.close}</button><div class="modal-inner">${inner}</div></div>`;
  const prevFocus = document.activeElement;
  const close = () => {
    wrap.classList.remove('in');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => wrap.remove(), 250);
    document.body.classList.remove('no-scroll');
    prevFocus?.focus?.();
    onClose?.();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  wrap.addEventListener('click', (e) => e.target.closest('[data-close]') && close());
  document.addEventListener('keydown', onKey);
  document.body.append(wrap);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => { wrap.classList.add('in'); $('input, button:not(.modal-x)', wrap)?.focus(); });
  hydrate(wrap);
  return { el: $('.modal-inner', wrap), close };
}

/* ---------------- Sharing ---------------- */

export const sukkahURL = (s) => `${location.origin}${location.pathname}#/sukkah/${s.slug}`;
export const waLink = (s) => `https://wa.me/?text=${encodeURIComponent(`${t('share.text')}\n${s.title} · ${s.location}\n${sukkahURL(s)}`)}`;

export function shareButtons(s, { compact = false } = {}) {
  return `<a class="btn btn-wa ${compact ? 'btn-sm' : ''}" href="${waLink(s)}" target="_blank" rel="noopener">${icon.wa}<span>${t('share.wa')}</span></a>
    <button class="btn btn-ghost ${compact ? 'btn-sm' : ''}" data-copy="${esc(sukkahURL(s))}">${icon.link}<span>${t('share.copy')}</span></button>`;
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]');
  if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch {
    const i = Object.assign(document.createElement('input'), { value: b.dataset.copy }); document.body.append(i); i.select(); document.execCommand('copy'); i.remove();
  }
  toast(t('share.copied'));
});

/* ---------------- Voting ---------------- */

function voteDone(m, s, dup) {
  m.el.innerHTML = `<div class="vote-done">
    <div class="vote-burst">${icon.heart(true)}</div>
    <h2 class="display-sm">${dup ? t('vote.dup') : t('vote.done')}</h2>
    <p class="muted">${dup ? t('vote.dupSub') : t('vote.doneSub')}</p>
    <div class="stack-btns">${shareButtons(s)}</div>
  </div>`;
}

/** Entry point for every vote button on the site. */
export async function vote(sukkahId) {
  const s = store.get(sukkahId);
  if (!s) return;
  if (store.hasVoted(s.id)) return voteDone(modal('', { cls: 'modal-sm' }), s, true);
  // One tap: signed in already, or sign in as a guest on the spot.
  if (store.session() || (await store.ensureVoter())) return finishVote(modal('<div class="boot"><span></span></div>', { cls: 'modal-sm' }), s);

  // Guest sign-in switched off in Supabase → fall back to email code / link.
  const m = modal(`<div class="vote-flow">
      <p class="eyebrow">${t('vote.title')}</p>
      <h2 class="display-sm">${esc(s.title)}</h2>
      <p class="muted small">${t('vote.why')}</p>
      <form class="vf-email">
        <label class="field"><span>${t('vote.email')}</span><input type="email" name="email" autocomplete="email" inputmode="email" required placeholder="name@email.com" dir="ltr"></label>
        <p class="err" hidden></p>
        <button class="btn btn-lime btn-block">${t('vote.send')} <span aria-hidden="true">${arrow()}</span></button>
      </form>
    </div>`, { cls: 'modal-sm' });

  const f = $('.vf-email', m.el);
  const showErr = (form, k, detail) => { const e = $('.err', form); e.hidden = false; e.textContent = t(k) + (detail ? ` (${detail})` : ''); };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = f.email.value.trim();
    if (!store.validEmail(email)) return showErr(f, 'vote.badEmail');
    const btn = $('button', f); btn.disabled = true;
    try {
      // If they tap the link in the email instead, the site finishes the vote on return.
      try { localStorage.setItem('sp:pendingVote', s.slug); } catch {}
      await store.requestCode(email);
    } catch (err) {
      btn.disabled = false;
      return showErr(f, /rate|seconds/i.test(err.message) ? 'vote.slow' : 'vote.error', err.message);
    }
    $('.vote-flow', m.el).innerHTML = `
      <p class="eyebrow">${t('vote.title')}</p>
      <h2 class="display-sm">${t('vote.sent')}</h2>
      <p class="muted small">${t('vote.sentSub')} <strong dir="ltr">${esc(email)}</strong></p>
      <form class="vf-code">
        <label class="field"><span>${t('vote.code')}</span><input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" pattern="[0-9]{6,10}" required class="code-input" dir="ltr"></label>
        <p class="err" hidden></p>
        <button class="btn btn-lime btn-block">${icon.heart(true)} ${t('vote.check')}</button>
      </form>`;
    const cf = $('.vf-code', m.el);
    cf.code.focus();
    cf.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const b = $('button', cf); b.disabled = true;
      const ok = await store.verifyCode(email, cf.code.value);
      if (!ok) { b.disabled = false; return showErr(cf, 'vote.bad'); }
      try { localStorage.removeItem('sp:pendingVote'); } catch {}
      finishVote(m, s);
    });
  });
}

export async function finishVote(m, s) {
  const res = await store.castVote(s.id);
  if (res === 'error' || res === 'unverified' || res === 'limit') {
    m.el.innerHTML = `<div class="vote-done"><h2 class="display-sm">${t(res === 'limit' ? 'vote.limit' : 'vote.error')}</h2></div>`;
    return;
  }
  if (res === 'ok') burst(s.id);
  voteDone(m, s, res === 'duplicate');
}

function burst(id) {
  $$(`[data-vote="${id}"]`).forEach((b) => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-vote]');
  if (!b) return;
  e.preventDefault();
  vote(b.dataset.vote);
});

/** Keep every vote chip on screen in sync after a vote. */
export function refreshVotes() {
  $$('[data-vote]').forEach((b) => {
    const s = store.get(b.dataset.vote);
    if (!s) return;
    const voted = store.hasVoted(s.id);
    b.classList.toggle('is-voted', voted);
    b.setAttribute('aria-pressed', voted);
    const svg = b.querySelector('svg');
    if (svg) svg.outerHTML = icon.heart(voted);
    const n = b.querySelector('[data-count]');
    if (n) n.textContent = fmt(s.votes);
    const lbl = b.querySelector('[data-vote-label]');
    if (lbl) lbl.textContent = voted ? t('vote.voted') : t('vote.vote');
  });
}
