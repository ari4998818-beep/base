import * as store from '../store.js';
import { t, tc, isRTL } from '../i18n.js';
import { esc, $, $$, icon, img, card, fmt, arrow, shareButtons, hydrate } from '../ui.js';
import { zoom } from './home.js';

const pad = (n) => String(n).padStart(2, '0');

/** Cover first, then the rest in the owner's order. */
function orderedPhotos(s) {
  const c = s.photos[s.cover] || s.photos[0];
  return c ? [c, ...s.photos.filter((p) => p !== c)] : [];
}

function spots(ph) {
  return ph.hotspots.map((h, i) => `<button class="spot" style="left:${h.x}%;top:${h.y}%;--d:${i * 60}ms" data-spot="${ph.id}|${h.id}" aria-label="${esc(h.name)}"><span>${icon.spark}</span></button>`).join('');
}

function shot(ph, i, cls = '') {
  return `<figure class="shot ${cls}">
    <div class="shot-img" data-photo="${ph.id}">${img(ph.src, ph.label || '', i ? 'loading="lazy"' : 'fetchpriority="high"')}${spots(ph)}</div>
    <figcaption><span>${pad(i + 1)}</span>${esc(ph.label || '')}</figcaption>
  </figure>`;
}

/** Full / pair / offset rhythm so the story reads like a design project, not a grid. */
function storyHTML(photos) {
  let html = '', i = 1, beat = 0;
  while (i < photos.length) {
    const kind = ['pair', 'offset', 'full'][beat++ % 3];
    if (kind === 'pair' && photos[i + 1]) {
      html += `<div class="row-pair">${shot(photos[i], i, 'pair-a')}${shot(photos[i + 1], i + 1, 'pair-b')}</div>`;
      i += 2;
    } else if (kind === 'offset') {
      html += `<div class="row-offset">${shot(photos[i], i, 'portrait')}<p class="offset-label" aria-hidden="true">${esc(photos[i].label || '')}</p></div>`;
      i += 1;
    } else {
      html += shot(photos[i], i, 'full');
      i += 1;
    }
  }
  return html;
}

export function sukkahProducts(s) {
  const seen = new Map();
  s.photos.forEach((ph) => ph.hotspots.forEach((h) => {
    const k = store.productKey(h);
    if (!seen.has(k)) seen.set(k, { ...h, key: k, photo: ph });
  }));
  return [...seen.values()];
}

function titleLines(title) {
  // "The Sunset Sukkah" → "The Sunset / Sukkah" so the last word gets its own oversized line.
  const w = title.trim().split(/\s+/);
  if (w.length < 2) return esc(title);
  return `${esc(w.slice(0, -1).join(' '))}<br>${esc(w[w.length - 1])}`;
}

/** International digits for wa.me / tel: (10-digit numbers are assumed US/Canada). */
function phoneDigits(raw) {
  const d = (raw || '').replace(/[^\d+]/g, '');
  const n = d.replace(/^\+/, '');
  if (n.length < 7) return '';
  return n.length === 10 ? `1${n}` : n;
}

function visitHTML(s) {
  if (!store.isOpenToVisit(s)) return '';
  const v = s.visit;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address || s.location)}`;
  const tel = phoneDigits(v.contact);
  return `<div class="visit-card">
    <p class="eyebrow"><i class="dot" aria-hidden="true"></i>${t('visit.open')} · ${s.year}</p>
    <a class="visit-addr" href="${maps}" target="_blank" rel="noopener">${icon.pin}<span>${esc(v.address || s.location)}</span></a>
    ${v.times ? `<p class="visit-times"><b>${t('visit.when')}</b> ${esc(v.times)}</p>` : ''}
    <div class="visit-actions">
      <a class="btn btn-dark btn-sm" href="${maps}" target="_blank" rel="noopener">${t('visit.directions')} <span aria-hidden="true">${arrow()}</span></a>
      ${tel ? `<a class="btn btn-wa btn-sm" href="https://wa.me/${tel}?text=${encodeURIComponent(t('visit.waText').replace('{title}', s.title))}" target="_blank" rel="noopener">${icon.wa}<span>${t('visit.whatsapp')}</span></a>
        <a class="btn btn-ghost btn-sm" href="tel:+${tel}" dir="ltr">${esc(v.contact)}</a>` : v.contact ? `<span class="muted small">${esc(v.contact)}</span>` : ''}
    </div>
  </div>`;
}

function videoHTML(s) {
  const v = s.video;
  if (!v?.url) return '';
  const player = v.kind === 'youtube' || v.kind === 'vimeo'
    ? `<iframe src="${esc(v.url)}" title="${esc(s.title)}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
    : `<video src="${esc(v.url)}" controls playsinline preload="metadata"></video>`;
  return `<section class="project-video"><p class="eyebrow">${t('detail.video')}</p><div class="video-frame">${player}</div></section>`;
}

export function detailHTML(s, { preview = false } = {}) {
  const photos = orderedPhotos(s);
  const prods = sukkahProducts(s);
  const more = preview ? [] : store.list().filter((x) => x.id !== s.id).slice(0, 4);
  const cover = photos[0];
  return `<article class="project ${preview ? 'is-preview' : ''}" data-project="${s.id}">
    <header class="project-head">
      ${preview ? `<p class="preview-flag">${t('detail.preview')}</p>` : `<a class="back-link" href="#/explore"><span aria-hidden="true">${isRTL() ? '→' : '←'}</span> ${t('detail.back')}</a>`}
      <p class="eyebrow">${s.categories.map((c) => esc(tc(c))).join(' <i>/</i> ')}${s.editorsPick ? `<b class="pick-badge">${icon.spark} ${t('detail.pick')}</b>` : ''}</p>
      <h1 class="project-title">${titleLines(s.title)}</h1>
      <div class="project-meta">
        <dl>
          <div><dt>${t('detail.by')}</dt><dd>${esc(s.ownerName || '—')}</dd></div>
          <div><dt>${icon.pin}</dt><dd>${esc(s.location)}</dd></div>
          <div><dt>${t('detail.votes')}</dt><dd data-vote-count="${s.id}">${fmt(s.votes)}</dd></div>
          <div><dt>${t('detail.year')}</dt><dd>${s.year || store.thisYear()} <span class="muted">· ${store.hebrewYear(s.year || store.thisYear())}</span>${(s.year || store.thisYear()) === store.thisYear() ? ` <b class="now-badge">${t('detail.thisYear')}</b>` : ''}</dd></div>
        </dl>
        <div class="project-intro">
          <p class="project-desc">${esc(s.description || '')}</p>
          ${preview ? '' : `<div class="project-actions">
            <button class="btn btn-vote ${store.hasVoted(s.id) ? 'is-voted' : ''}" data-vote="${s.id}">${icon.heart(store.hasVoted(s.id))}<span data-vote-label>${store.hasVoted(s.id) ? t('vote.voted') : t('vote.vote')}</span><span class="count" data-count>${fmt(s.votes)}</span></button>
            ${shareButtons(s)}
            ${store.myKey(s.slug) ? `<a class="btn btn-ghost" href="#/edit/${s.slug}">✎ <span>${t('detail.edit')}</span></a>` : ''}
          </div>`}
          ${visitHTML(s)}
        </div>
      </div>
    </header>

    ${prods.length ? `<div class="shop-bar">
      <button class="shop-toggle" data-shop aria-pressed="false">${icon.spark}<span data-shop-label>${t('detail.shop')}</span><em>${prods.length}</em></button>
      <p class="shop-hint">${t('detail.shopHint')}</p>
    </div>` : ''}

    ${cover ? `<div class="project-cover">${shot(cover, 0, 'cover')}</div>` : ''}

    ${videoHTML(s)}

    <section class="story">${storyHTML(photos)}</section>

    ${s.special ? `<section class="special"><p class="eyebrow">${t('detail.special')}</p><blockquote>“${esc(s.special)}”</blockquote></section>` : ''}

    <section class="shop-list" id="shop">
      <div class="split-head tight"><h2 class="display">${t('detail.shopSection')}</h2><p class="muted">${prods.length ? `${prods.length} ${t('sub.tagged')}` : t('detail.shopEmpty')}</p></div>
      <div class="product-grid">
        ${prods.map((p) => `<article class="product">
          ${zoom({ photo: p.photo, x: p.x, y: p.y })}
          <p class="p-cat">${esc(p.category || '')}</p>
          <h3>${esc(p.name)}</h3>
          <p class="p-vendor">${esc(p.vendor || '')}${p.price ? ` <b>${esc(p.price)}</b>` : ''}</p>
          ${p.note ? `<p class="p-note">“${esc(p.note)}”</p>` : ''}
          ${p.url ? `<a class="link-arrow" href="${esc(p.url)}" target="_blank" rel="noopener nofollow">${t('detail.view')} <span aria-hidden="true">${arrow()}</span></a>` : ''}
        </article>`).join('')}
      </div>
    </section>

    ${more.length ? `<section class="section more"><div class="tabs-row"><h2 class="eyebrow">${t('detail.more')}</h2><a class="link-arrow" href="#/explore">${t('tabs.all')} <span aria-hidden="true">${arrow()}</span></a></div><div class="cards rail">${more.map(card).join('')}</div></section>` : ''}

    ${preview ? '' : `<div class="mobile-bar">
      <button class="mb-vote ${store.hasVoted(s.id) ? 'is-voted' : ''}" data-vote="${s.id}">${icon.heart(store.hasVoted(s.id))}<span data-count>${fmt(s.votes)}</span></button>
      <a class="mb-wa" href="${`https://wa.me/?text=${encodeURIComponent(`${t('share.text')}\n${s.title} · ${s.location}\n${location.origin}${location.pathname}#/sukkah/${s.slug}`)}`}" target="_blank" rel="noopener">${icon.wa}<span>WhatsApp</span></a>
      ${prods.length ? `<button class="mb-shop" data-shop aria-pressed="false">${icon.spark}<span>${t('detail.shop')}</span></button>` : ''}
    </div>`}
  </article>`;
}

/** Wires the shop toggle + hotspot popovers inside a rendered project. */
export function bindProject(root, s) {
  const art = $('.project', root);
  if (!art) return;
  let pop;
  const closePop = () => { pop?.remove(); pop = null; $$('.spot.on', art).forEach((x) => x.classList.remove('on')); };

  const setShop = (on) => {
    art.classList.toggle('shop-on', on);
    $$('[data-shop]', art).forEach((b) => b.setAttribute('aria-pressed', on));
    const l = $('[data-shop-label]', art);
    if (l) l.textContent = on ? t('detail.shopOn') : t('detail.shop');
    if (!on) closePop();
  };
  art.addEventListener('click', (e) => {
    const tog = e.target.closest('[data-shop]');
    if (tog) {
      const on = !art.classList.contains('shop-on');
      setShop(on);
      if (on && tog.classList.contains('mb-shop')) $('.story .spot, .project-cover .spot', art)?.closest('figure')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const sp = e.target.closest('.spot');
    if (sp) {
      e.stopPropagation();
      const wasOn = sp.classList.contains('on');
      closePop();
      if (wasOn) return;
      const [pid, hid] = sp.dataset.spot.split('|');
      const h = s.photos.find((p) => p.id === pid)?.hotspots.find((x) => x.id === hid);
      if (!h) return;
      sp.classList.add('on');
      pop = document.createElement('div');
      const x = parseFloat(sp.style.left), y = parseFloat(sp.style.top);
      pop.className = `pop ${x > 60 ? 'pop-left' : ''} ${y > 62 ? 'pop-up' : ''}`;
      pop.style.left = x + '%';
      pop.style.top = y + '%';
      pop.innerHTML = `<p class="p-cat">${esc(h.category || '')}</p>
        <h4>${esc(h.name)}</h4>
        <p class="p-vendor">${esc(h.vendor || '')}${h.price ? ` <b>${esc(h.price)}</b>` : ''}</p>
        ${h.note ? `<p class="p-note">“${esc(h.note)}”</p>` : ''}
        ${h.url ? `<a class="link-arrow" href="${esc(h.url)}" target="_blank" rel="noopener nofollow">${t('detail.view')} <span aria-hidden="true">${arrow()}</span></a>` : ''}`;
      sp.parentElement.append(pop);
      requestAnimationFrame(() => pop?.classList.add('in'));
      return;
    }
    if (!e.target.closest('.pop')) closePop();
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closePop());
}

export function renderDetail(root, slug) {
  const s = store.get(slug);
  if (!s || (s.status !== 'approved' && !store.isAdmin())) {
    root.innerHTML = `<section class="section notfound"><h1 class="display">${t('detail.notFound')}</h1><a class="btn btn-dark" href="#/explore">${t('detail.back')}</a></section>`;
    return;
  }
  document.title = `${s.title} · SukkahPin`;
  if (s.status === 'approved') store.countView(s.slug);
  root.innerHTML = detailHTML(s);
  hydrate(root);
  bindProject(root, s);
}
