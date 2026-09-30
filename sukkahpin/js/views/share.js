// #/share/:slug — "Share My Sukkah" (owner) / "Share this sukkah" (everyone else).
// Mobile-first: big 9:16 preview, swipe the template rail, tap Share to WhatsApp.

import * as store from '../store.js';
import { t, lang as siteLang } from '../i18n.js';
import { esc, $, $$, icon, toast, optSrc } from '../ui.js';
import { TEMPLATES, COPY, W, H, renderCard, loadImage, ensureFonts, makeQR, toBlob } from '../sharecard.js';

const BLURRY = 1.5; // photo enlarged more than this → warn it may look soft

export async function renderShare(root, slug, params) {
  root.innerHTML = '<div class="boot"><span></span></div>';

  // Who is sharing? The owner holds the private edit key (remembered on their phone or in ?k=).
  const key = params.get('k') || store.myKey(slug);
  let s = store.get(slug), owner = false, stats = null;
  if (key) {
    const mine = await store.ownerGet(slug, key);
    if (mine) { s = mine; owner = true; store.saveKey(slug, key); stats = await store.ownerStats(slug, key); }
  }
  if (!root.isConnected) return;
  if (!s || (s.status !== 'approved' && !owner)) {
    root.innerHTML = `<section class="section notfound"><h1 class="display">${t('detail.notFound')}</h1><a class="btn btn-dark" href="#/explore">${t('detail.back')}</a></section>`;
    return;
  }

  const cfg = store.shareSettings();
  const templates = TEMPLATES.filter((x) => cfg.templates[x.id] !== false);
  if (!templates.length) templates.push(TEMPLATES[0]);
  const photos = s.photos.length ? s.photos : [{ src: 'img/hero-pergola.webp' }];
  const st = {
    tpl: templates[0].id, photo: Math.min(s.cover || 0, photos.length - 1), lang: siteLang === 'yi' ? 'yi' : 'en',
    preset: 0, custom: '', headlineTouched: false, showLoc: true, showVotes: cfg.showVotes,
    crops: {}, // per photo: { zoom, fx, fy }
  };
  const crop = () => (st.crops[st.photo] ||= { zoom: 1, fx: 0.5, fy: 0.45 });
  const copy = (L) => ({ ...COPY[L], ...(cfg.copy[L] || {}) });
  const presets = (L) => {
    const c = copy(L);
    const list = owner ? [c.headline, ...COPY[L].presets] : COPY[L].presetsV;
    return [...new Set(list)];
  };

  store.track(slug, 'open', '', owner ? key : null);

  const liveNote = owner
    ? s.status === 'approved'
      ? `<div class="share-live"><p class="eyebrow"><i class="dot" aria-hidden="true"></i>${t('share.live')}</p><p>${t('share.liveSub')}</p></div>`
      : `<div class="share-live pending"><p class="eyebrow">${t('share.pending')}</p><p>${t('share.pendingSub')}</p></div>`
    : '';
  const statsRow = owner && stats
    ? `<dl class="share-stats"><div><dt>${t('share.views')}</dt><dd>${stats.views ?? 0}</dd></div><div><dt>${t('share.votes')}</dt><dd>${stats.votes ?? 0}</dd></div><div><dt>${t('share.shares')}</dt><dd>${stats.shares ?? 0}</dd></div></dl>`
    : '';

  root.innerHTML = `<section class="share-page">
    <header class="share-head">
      <a class="back-link" href="#/sukkah/${esc(s.slug)}"><span aria-hidden="true">${siteLang === 'yi' ? '→' : '←'}</span> ${esc(s.title)}</a>
      <h1 class="display">${owner ? t('share.titleMine') : t('share.titleTheirs')}</h1>
      ${liveNote}${statsRow}
    </header>

    <div class="share-grid">
      <div class="share-stage">
        <div class="share-preview"><canvas data-main width="${W}" height="${H}" aria-label="${esc(t('share.previewAlt'))}"></canvas></div>
        <p class="share-hint">${icon.image} ${t('share.drag')}</p>
        <p class="share-warn" data-warn hidden>${t('share.blurry')}</p>
        <div class="share-rail" role="tablist">
          ${templates.map((x) => `<button role="tab" class="share-tpl" data-tpl="${x.id}"><canvas width="216" height="384"></canvas><span>${x.name[siteLang === 'yi' ? 'yi' : 'en']}</span></button>`).join('')}
        </div>
      </div>

      <div class="share-controls">
        ${photos.length > 1 ? `<div class="sc-group"><p class="sc-label">${t('share.photo')}</p>
          <div class="share-photos">${photos.map((p, i) => `<button data-photo="${i}" aria-label="${t('share.photo')} ${i + 1}"><img src="${esc(optSrc(p.src, 384))}" alt="" loading="lazy"></button>`).join('')}</div></div>` : ''}

        <div class="sc-group"><p class="sc-label">${t('share.zoom')}</p>
          <input type="range" min="1" max="2.5" step="0.01" value="1" data-zoom aria-label="${t('share.zoom')}"></div>

        <div class="sc-group"><p class="sc-label">${t('share.language')}</p>
          <div class="seg"><button data-lang="en">English</button><button data-lang="yi">אידיש</button></div></div>

        <div class="sc-group"><p class="sc-label">${t('share.headline')}</p>
          <div class="chips" data-presets></div>
          <input class="share-custom" data-custom maxlength="42" placeholder="${t('share.customPh')}"></div>

        <div class="sc-group sc-toggles">
          <label><input type="checkbox" data-loc checked> ${t('share.showLoc')}</label>
          <label><input type="checkbox" data-votes ${st.showVotes ? 'checked' : ''}> ${t('share.showVotes')}</label>
        </div>
    <div class="share-actions">
          <button class="btn btn-wa-solid btn-lg" data-act="whatsapp">${icon.wa}<span>${t('share.toWhatsApp')}</span></button>
          <div class="share-actions-row">
            <button class="btn btn-ghost" data-act="download">${icon.image}<span>${t('share.download')}</span></button>
            <button class="btn btn-ghost" data-act="copy">${icon.link}<span>${t('share.copyLink')}</span></button>
            ${navigator.share ? `<button class="btn btn-ghost" data-act="native"><span>${t('share.more')}</span></button>` : ''}
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const main = $('[data-main]', root);
  const fileName = `sukkahpin-${s.slug}.jpg`;
  const warn = $('[data-warn]', root);

  await ensureFonts();
  const [logo, qr] = await Promise.all([
    loadImage('brand/png/sukkahpin-logo.png').catch(() => null),
    Promise.resolve(makeQR(store.shortLink(s.slug, 's'), 520)),
  ]);
  const imgs = {};
  const getImg = async (i) => (imgs[i] ||= await loadImage(optSrc(photos[i].src, 1600)).catch(() => loadImage(photos[i].src)).catch(() => loadImage('img/hero-pergola.webp')));

  const data = async (tpl) => {
    const L = st.lang, c = copy(L);
    const list = presets(L);
    const headline = st.custom.trim() || list[st.preset] || list[0];
    return {
      template: tpl, img: await getImg(st.photo), logo, qr, lang: L, owner,
      title: s.title, location: s.location, votes: s.votes, year: s.year || store.thisYear(),
      headline, headlineOn: tpl === 'bold' || st.headlineTouched,
      voteLine: owner ? c.vote : c.voteV, button: c.button,
      showLoc: st.showLoc, showVotes: st.showVotes, shortUrl: store.shortHost(s.slug), crop: crop(),
    };
  };

  let lastInfo = null, readyFile = null, fileTimer = 0;
  const drawMain = async () => {
    lastInfo = renderCard(main, await data(st.tpl));
    warn.hidden = !(lastInfo.scale > BLURRY);
    // Keep a finished JPG ready: phones only open the share sheet if it's called right after the tap.
    readyFile = null;
    clearTimeout(fileTimer);
    fileTimer = setTimeout(async () => { readyFile = new File([await toBlob(main)], fileName, { type: 'image/jpeg' }); }, 350);
  };
  const off = document.createElement('canvas');
  const drawThumbs = async () => {
    for (const b of $$('[data-tpl]', root)) {
      renderCard(off, await data(b.dataset.tpl));
      const c = $('canvas', b);
      c.getContext('2d').drawImage(off, 0, 0, c.width, c.height);
    }
  };
  const syncUI = () => {
    $$('[data-tpl]', root).forEach((b) => b.setAttribute('aria-selected', b.dataset.tpl === st.tpl));
    $$('[data-photo]', root).forEach((b) => b.classList.toggle('on', +b.dataset.photo === st.photo));
    $$('[data-lang]', root).forEach((b) => b.classList.toggle('on', b.dataset.lang === st.lang));
    $('[data-zoom]', root).value = crop().zoom;
    const list = presets(st.lang);
    $('[data-presets]', root).innerHTML = list.map((p, i) => `<button type="button" class="chip ${!st.custom && st.preset === i ? 'on' : ''}" data-preset="${i}" dir="auto">${esc(p)}</button>`).join('');
    $('[data-custom]', root).dir = st.lang === 'yi' ? 'rtl' : 'ltr';
  };
  const redraw = async ({ thumbs = true } = {}) => { syncUI(); await drawMain(); if (thumbs) drawThumbs(); };
  await redraw();

  /* ---------- Controls ---------- */

  root.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tpl) { st.tpl = b.dataset.tpl; return redraw({ thumbs: false }); }
    if (b.dataset.photo != null) { st.photo = +b.dataset.photo; return redraw(); }
    if (b.dataset.lang) { st.lang = b.dataset.lang; st.preset = 0; return redraw(); }
    if (b.dataset.preset != null) { st.preset = +b.dataset.preset; st.custom = ''; $('[data-custom]', root).value = ''; st.headlineTouched = true; return redraw(); }
    if (b.dataset.act) return act(b.dataset.act, b);
  });
  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-zoom]')) { crop().zoom = +e.target.value; drawMain(); }
    if (e.target.matches('[data-custom]')) { st.custom = e.target.value; st.headlineTouched = true; syncUIChips(); drawMain(); }
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('[data-custom]')) drawThumbs();
    if (e.target.matches('[data-loc]')) { st.showLoc = e.target.checked; redraw(); }
    if (e.target.matches('[data-votes]')) { st.showVotes = e.target.checked; redraw(); }
  });
  const syncUIChips = () => $$('[data-preset]', root).forEach((c) => c.classList.toggle('on', !st.custom && +c.dataset.preset === st.preset));

  // Drag the preview to reposition the photo inside the card.
  let drag = null, raf = 0;
  main.addEventListener('pointerdown', (e) => {
    if (!lastInfo) return;
    drag = { x: e.clientX, y: e.clientY, c: { ...crop() } };
    main.setPointerCapture(e.pointerId);
    main.classList.add('dragging');
  });
  main.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const k = W / main.clientWidth; // CSS px → canvas px
    const img = imgs[st.photo];
    const scale = lastInfo.scale;
    const c = crop();
    c.fx = Math.max(0, Math.min(1, drag.c.fx - ((e.clientX - drag.x) * k) / (scale * img.naturalWidth)));
    c.fy = Math.max(0, Math.min(1, drag.c.fy - ((e.clientY - drag.y) * k) / (scale * img.naturalHeight)));
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(drawMain);
  });
  const endDrag = () => { if (drag) { drag = null; main.classList.remove('dragging'); drawThumbs(); } };
  main.addEventListener('pointerup', endDrag);
  main.addEventListener('pointercancel', endDrag);

  /* ---------- Sharing ---------- */

  const message = () => {
    const L = st.lang;
    const line = owner
      ? (L === 'yi' ? 'מיין סוכה איז אויף SukkahPin — קוקט אריין און גיבט א שטימע 👇' : 'My sukkah is on SukkahPin — take a look and vote for it 👇')
      : (L === 'yi' ? 'קוקט אויף די סוכה אויף SukkahPin — גיבט א שטימע 👇' : 'Look at this sukkah on SukkahPin — take a look and vote for it 👇');
    return `${line}\n${store.shortLink(s.slug, 'w')}`;
  };
  const makeFile = async () => readyFile || new File([await toBlob(main)], fileName, { type: 'image/jpeg' });
  const download = (file) => {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(file), download: fileName });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const ev = (name) => store.track(s.slug, name, 'status', owner ? key : null);

  async function act(kind, btn) {
    btn.disabled = true;
    try {
      if (kind === 'whatsapp') {
        const file = await makeFile();
        if (navigator.canShare?.({ files: [file] })) {
          // Phone: the share sheet sends the image (and text) straight to WhatsApp — Status or a chat.
          await navigator.share({ files: [file], text: message() }).catch((x) => { if (x.name !== 'AbortError') throw x; });
        } else {
          // Desktop / older phones: save the image, then open WhatsApp with the link ready.
          download(file);
          window.open(`https://wa.me/?text=${encodeURIComponent(message())}`, '_blank', 'noopener');
          toast(t('share.savedTip'));
        }
        ev('whatsapp');
      }
      if (kind === 'download') { download(await makeFile()); ev('download'); toast(t('share.saved')); }
      if (kind === 'copy') {
        const url = store.shortLink(s.slug, 'l');
        try { await navigator.clipboard.writeText(url); } catch { prompt('', url); }
        ev('copy'); toast(t('share.copied'));
      }
      if (kind === 'native') {
        await navigator.share({ title: s.title, text: message().split('\n')[0], url: store.shortLink(s.slug, 'l') }).catch((x) => { if (x.name !== 'AbortError') throw x; });
        ev('native');
      }
    } catch (x) {
      console.error(x);
      toast(t('vote.error'));
    } finally {
      btn.disabled = false;
    }
  }
}
