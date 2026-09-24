import * as store from '../store.js';
import { t, tc, isRTL } from '../i18n.js';
import { esc, $, $$, icon, img, card, tile, fmt, arrow, reduceMotion, modal, hydrate } from '../ui.js';

export const STYLES = [
  ['Modern', 'img/t-modern.webp'], ['DIY', 'img/t-diy.webp'], ['Family', 'img/t-family.webp'], ['Small Space', 'img/t-small.webp'],
  ['Luxury', 'img/t-luxury.webp'], ['Creative', 'img/t-creative.webp'], ['Outdoor', 'img/t-outdoor.webp'], ['Balcony', 'img/t-balcony.webp'],
];
export const FILTERS = ['Trending', 'New', 'Most Voted', 'Modern', 'DIY', 'Family', 'Creative', 'Small Space', 'Luxury', 'Outdoor'];
const SORT_FILTERS = { Trending: 'trending', New: 'new', 'Most Voted': 'voted' };
const filterLabel = (f) => (SORT_FILTERS[f] ? t({ Trending: 'tabs.trending', New: 'tabs.new', 'Most Voted': 'tabs.voted' }[f]) : tc(f));

function heroSet() {
  const all = store.list();
  const featured = all.filter((s) => s.featured);
  const rest = all.filter((s) => !s.featured);
  return [...featured, ...rest].slice(0, 4);
}

function heroHTML() {
  const set = heroSet();
  const main = set[0];
  const eb = t('hero.eyebrow');
  return `<section class="hero" data-hero>
    <div class="hero-top">
      <p class="crumbs">${eb.map((x) => `<span>${esc(x)}</span>`).join('<i>/</i>')}</p>
      <h1 class="hero-h" aria-label="${esc(`${t('hero.h1')} ${t('hero.h2')} ${t('hero.h3a')} ${t('hero.h3b')}`)}">
        <span class="ln"><span>${t('hero.h1')}</span></span>
        <span class="ln"><span>${t('hero.h2')}</span></span>
        <span class="ln"><span>${t('hero.h3a')} <span class="story-word">${t('hero.h3b')}<svg class="swash" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><path d="M4 28 C 60 12, 150 8, 296 18 L 294 34 C 170 22, 80 26, 6 38 Z"/></svg></span></span></span>
      </h1>
    </div>

    <div class="hero-stage">
      ${main ? `<figure class="hero-main" data-parallax="0.35">
        <div class="hero-main-img">${img(store.heroOf(main).src, main.title, 'fetchpriority="high"')}</div>
        <p class="hand-note" aria-hidden="true">Real sukkahs.<br>Real inspiration.<svg viewBox="0 0 80 60"><path d="M72 6 C 50 18, 30 30, 12 50 M12 50 l 3 -12 M12 50 l 12 -3"/></svg></p>
        <a class="now-showing" href="#/sukkah/${main.slug}"><span>${t('hero.viewing')}</span><strong>${esc(main.title)}</strong><em>${arrow()}</em></a>
      </figure>` : ''}
      <div class="floats">
        ${set.slice(1).map((s, i) => `<button class="float f${i + 1}" data-float="${i + 1}" aria-label="${esc(s.title)}" data-parallax="${0.9 + i * 0.35}">
            <span class="float-inner">${img(store.heroOf(s).src, s.title, 'draggable="false"')}</span>
          </button>`).join('')}
      </div>
      <div class="stat-badge"><strong dir="ltr">${esc(store.settings().heroStat)}</strong><span>${t('hero.stat')}</span></div>
      <span class="hand-explore" aria-hidden="true">Explore<svg viewBox="0 0 70 30"><path d="M4 24 C 20 6, 44 2, 64 10 M64 10 l -10 -6 M64 10 l -8 8"/></svg></span>
    </div>

    <div class="hero-bottom">
      <p class="hero-sub">${t('hero.sub')}</p>
      <div class="hero-actions">
        <a class="btn btn-lime btn-lg" href="#/explore">${t('hero.cta')} <span aria-hidden="true">${arrow()}</span></a>
        <button class="play" data-video><span class="play-ring">${icon.play}</span><span>${t('hero.video')}</span></button>
      </div>
      <div class="community">
        <div class="avatars" aria-hidden="true"><span>G</span><span>S</span><span>K</span><span class="plus">+</span></div>
        <p>${t('hero.join')}</p>
      </div>
    </div>

    <button class="scroll-cue" data-scroll-cue aria-label="${t('hero.scroll').join(' ')}"><span class="mouse"><i></i></span><span>${t('hero.scroll').join('<br>')}</span></button>
  </section>`;
}

/* Hero motion: cursor parallax + tilt, draggable prints, scroll drift, click-to-swap. */
function initHero(root, cleanup) {
  const hero = $('[data-hero]', root);
  if (!hero) return;
  const set = heroSet();
  const order = set.map((_, i) => i); // order[0] is the main image
  const floats = $$('.float', hero);
  const mainImg = $('.hero-main-img img', hero);
  const nowShowing = $('.now-showing', hero);
  const still = reduceMotion();

  let mx = 0, my = 0, cx = 0, cy = 0, sy = 0, raf;
  const drag = new Map(); // el -> {x,y}

  const onMove = (e) => {
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5;
    my = (e.clientY - r.top) / r.height - 0.5;
  };
  const onLeave = () => { mx = 0; my = 0; };
  const onScroll = () => { sy = Math.min(window.scrollY, 900); };

  const loop = () => {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    const main = $('.hero-main', hero);
    if (main) main.style.transform = `translate3d(${cx * -14}px, ${cy * -10 + sy * 0.06}px, 0)`;
    floats.forEach((f) => {
      const k = parseFloat(f.dataset.parallax);
      const d = drag.get(f) || { x: 0, y: 0 };
      f.style.transform = `translate3d(${cx * 26 * k + d.x}px, ${cy * 18 * k - sy * 0.08 * k + d.y}px, 0) rotateX(${cy * -10}deg) rotateY(${cx * 12}deg)`;
    });
    raf = requestAnimationFrame(loop);
  };

  if (!still) {
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(loop);
  }

  // Drag a few pixels, spring back. A tap (no real movement) swaps the main image.
  floats.forEach((f) => {
    let start = null, moved = 0;
    f.addEventListener('pointerdown', (e) => {
      start = { x: e.clientX, y: e.clientY };
      moved = 0;
      f.setPointerCapture(e.pointerId);
      f.classList.add('grab');
    });
    f.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      moved = Math.max(moved, Math.hypot(dx, dy));
      const damp = (v) => Math.sign(v) * Math.min(22, Math.abs(v) * 0.35);
      if (!still) drag.set(f, { x: damp(dx), y: damp(dy) });
    });
    const end = () => {
      if (!start) return;
      start = null;
      f.classList.remove('grab');
      drag.set(f, { x: 0, y: 0 });
      if (moved < 6) swap(+f.dataset.float);
    };
    f.addEventListener('pointerup', end);
    f.addEventListener('pointercancel', () => { start = null; f.classList.remove('grab'); drag.set(f, { x: 0, y: 0 }); });
    f.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), swap(+f.dataset.float)));
    f.addEventListener('click', (e) => e.preventDefault());
  });

  function swap(slot) {
    [order[0], order[slot]] = [order[slot], order[0]];
    const main = set[order[0]], other = set[order[slot]];
    const f = floats[slot - 1];
    mainImg.classList.add('fade');
    setTimeout(() => {
      mainImg.src = store.heroOf(main).src;
      mainImg.alt = main.title;
      mainImg.onload = () => mainImg.classList.remove('fade');
      setTimeout(() => mainImg.classList.remove('fade'), 700);
    }, 220);
    const fi = $('img', f);
    fi.src = store.heroOf(other).src;
    fi.alt = other.title;
    f.setAttribute('aria-label', other.title);
    f.classList.remove('flip'); void f.offsetWidth; f.classList.add('flip');
    nowShowing.href = `#/sukkah/${main.slug}`;
    $('strong', nowShowing).textContent = main.title;
  }

  $('[data-video]', hero)?.addEventListener('click', openFilm);
  $('[data-scroll-cue]', hero)?.addEventListener('click', () => $('#trending')?.scrollIntoView({ behavior: 'smooth' }));

  cleanup(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
  });
}

/* "Watch Video": until there's a real video, a quiet slideshow of the gallery. */
function openFilm() {
  const photos = store.list().flatMap((s) => s.photos.slice(0, 2).map((p) => ({ p, s })));
  const m = modal(`<div class="film">
      <div class="film-stage">${photos.map(({ p, s }, i) => `<figure class="${i === 0 ? 'on' : ''}">${img(p.src, s.title)}<figcaption><strong>${esc(s.title)}</strong> · ${esc(s.location)}</figcaption></figure>`).join('')}</div>
      <p class="film-title">${t('video.title')}</p>
    </div>`, { cls: 'modal-film', onClose: () => clearInterval(timer) });
  const figs = $$('.film-stage figure', m.el);
  let i = 0;
  const timer = setInterval(() => { figs[i].classList.remove('on'); i = (i + 1) % figs.length; figs[i].classList.add('on'); }, 2600);
}

/* ---------------- Sections ---------------- */

function trendingHTML() {
  return `<section class="section trending" id="trending">
    <div class="tabs-row">
      <div class="tabs" role="tablist">
        ${[['trending', 'tabs.trending'], ['new', 'tabs.new'], ['voted', 'tabs.voted']].map(([k, l], i) => `<button role="tab" aria-selected="${i === 0}" data-sort="${k}">${t(l)}</button>`).join('')}
      </div>
      <a class="link-arrow" href="#/explore">${t('tabs.all')} <span aria-hidden="true">${arrow()}</span></a>
    </div>
    <div class="cards rail" data-cards>${store.list({ sort: 'trending' }).slice(0, 4).map(card).join('')}</div>
  </section>`;
}

function stylesHTML() {
  return `<section class="section styles">
    <div class="split-head">
      <div>
        <p class="eyebrow">${t('style.eyebrow')}</p>
        <h2 class="display">${t('style.h1')}<br>${t('style.h2')}</h2>
      </div>
      <div class="split-aside">
        <p class="muted">${t('style.sub')}</p>
        <div class="rail-arrows">
          <button class="icon-btn round" data-rail="-1" aria-label="Previous">${icon.chev(isRTL() ? 'r' : 'l')}</button>
          <button class="icon-btn round dark" data-rail="1" aria-label="Next">${icon.chev(isRTL() ? 'l' : 'r')}</button>
        </div>
      </div>
    </div>
    <div class="style-rail rail" data-style-rail>
      ${STYLES.map(([c, src]) => `<a class="style-tile" href="#/explore?f=${encodeURIComponent(c)}">${img(src, tc(c), 'loading="lazy"')}<span>${esc(tc(c))}</span></a>`).join('')}
    </div>
  </section>`;
}

export function galleryItems(filter) {
  const sort = SORT_FILTERS[filter];
  return sort ? store.list({ sort }) : store.list({ category: filter, sort: 'voted' });
}

export function galleryHTML(active = 'Trending', { heading = true } = {}) {
  const items = galleryItems(active);
  return `<section class="section gallery" data-gallery>
    ${heading ? `<div class="split-head tight"><div><p class="eyebrow">${t('gallery.eyebrow')}</p><h2 class="display">${t('gallery.h')}</h2></div></div>` : ''}
    <div class="chips" role="toolbar">
      ${FILTERS.map((f) => `<button class="chip ${f === active ? 'on' : ''}" data-filter="${esc(f)}" aria-pressed="${f === active}">${esc(filterLabel(f))}</button>`).join('')}
    </div>
    <div class="masonry" data-masonry>${items.length ? items.map(tile).join('') : `<p class="empty">${t('gallery.empty')}</p>`}</div>
  </section>`;
}

export function bindGallery(root, onFilter) {
  const g = $('[data-gallery]', root);
  if (!g) return;
  g.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    const f = b.dataset.filter;
    $$('[data-filter]', g).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    const items = galleryItems(f);
    const m = $('[data-masonry]', g);
    m.classList.add('swap');
    setTimeout(() => {
      m.innerHTML = items.length ? items.map(tile).join('') : `<p class="empty">${t('gallery.empty')}</p>`;
      hydrate(m);
      m.classList.remove('swap');
    }, 160);
    onFilter?.(f);
  });
}

function sourcesTeaserHTML() {
  const items = store.products().slice(0, 4);
  return `<section class="section teaser">
    <div class="teaser-copy">
      <p class="eyebrow">${t('sources.teaser.eyebrow')}</p>
      <h2 class="display">${t('sources.teaser.h')}</h2>
      <p class="muted">${t('sources.teaser.sub')}</p>
      <a class="btn btn-dark" href="#/sources">${t('sources.teaser.cta')} <span aria-hidden="true">${arrow()}</span></a>
    </div>
    <div class="teaser-grid">
      ${items.map((p) => `<a class="product-mini" href="#/sources/${p.key}">
        ${zoom(p.seen[0])}
        <span class="pm-meta"><strong>${esc(p.name)}</strong><em>${esc(p.vendor)}${p.price ? ` · ${esc(p.price)}` : ''}</em></span>
      </a>`).join('')}
    </div>
  </section>`;
}

/** A crop zoomed onto a hotspot, so product tiles show the real thing in the real sukkah. */
export function zoom(seen, cls = '') {
  const pos = `${seen.x}% ${seen.y}%`;
  return `<span class="zoom ${cls}" style="--pos:${pos}">${img(seen.photo.src, '', 'loading="lazy" aria-hidden="true"')}</span>`;
}

export function bandHTML() {
  return `<section class="band">
    <h2 class="display-xl">${t('band.h1')}<br><span class="hl">${t('band.h2')}</span></h2>
    <div class="band-side">
      <p class="muted">${t('band.sub')}</p>
      <a class="btn btn-lime btn-lg" href="#/submit">${t('band.cta')} <span aria-hidden="true">${arrow()}</span></a>
    </div>
  </section>`;
}

export function renderHome(root, cleanup) {
  root.innerHTML = heroHTML() + trendingHTML() + stylesHTML() + galleryHTML() + sourcesTeaserHTML() + bandHTML();
  initHero(root, cleanup);

  const tabs = $('.trending .tabs', root);
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sort]');
    if (!b) return;
    $$('[data-sort]', tabs).forEach((x) => x.setAttribute('aria-selected', x === b));
    const c = $('[data-cards]', root);
    c.classList.add('swap');
    setTimeout(() => { c.innerHTML = store.list({ sort: b.dataset.sort }).slice(0, 4).map(card).join(''); hydrate(c); c.classList.remove('swap'); }, 160);
  });

  const rail = $('[data-style-rail]', root);
  $$('[data-rail]', root).forEach((b) => b.addEventListener('click', () => {
    const dir = +b.dataset.rail * (isRTL() ? -1 : 1);
    rail.scrollBy({ left: dir * rail.clientWidth * 0.6, behavior: 'smooth' });
  }));

  bindGallery(root);
}
