import * as store from '../store.js';
import { t, tc } from '../i18n.js';
import { esc, $, $$, icon, arrow, toast, hydrate } from '../ui.js';
import { detailHTML, bindProject } from './detail.js';

export const PHOTO_LABELS = ['Outside', 'Inside', 'Table', 'Lighting', 'Schach', 'Details', 'Night'];
export const SUBMIT_CATS = ['Modern', 'DIY', 'Family', 'Small Space', 'Luxury', 'Creative', 'Lighting', 'Themed', 'Custom', 'Balcony / Patio'];
export const PRODUCT_CATS = ['Table', 'Seating', 'Lighting', 'Walls', 'Panels', 'Flooring', 'Rugs', 'Bedding', 'Decor', 'Kids', 'Structure', 'DIY', 'Judaica / Sukkos Decor'];
const MAX_PHOTOS = 8, MAX_TAGS = 8, STEPS = 5;

const blank = () => ({
  step: 1, photos: [], cover: 0, title: '', location: '', description: '', special: '', categories: [],
  name: '', email: '', phone: '', showName: true, display: '', activePhoto: 0,
  year: store.thisYear(), visit: { open: false, address: '', times: '', contact: '' },
  video: null, // { file, name, size, src } for an upload, or { link, kind, url } for YouTube/Vimeo
});
const mb = (n) => `${(n / 1048576).toFixed(n < 10485760 ? 1 : 0)} MB`;
let draft = blank();

const totalTags = () => draft.photos.reduce((n, p) => n + p.hotspots.length, 0);

/** Downscale on the phone before anything is stored: fast previews, small uploads. */
async function prepare(file) {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return null;
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = Object.assign(document.createElement('canvas'), { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) });
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
  return { id: store.uid(), blob, src: URL.createObjectURL(blob), label: '', hotspots: [] };
}

function head() {
  const titles = ['sub.s1', 'sub.s2', 'sub.s3', 'sub.s4', 'sub.s5'];
  return `<div class="wiz-head">
    <div class="wiz-progress" aria-hidden="true">${Array.from({ length: STEPS }, (_, i) => `<i class="${i < draft.step ? 'on' : ''}"></i>`).join('')}</div>
    <p class="eyebrow">${t('sub.step')} ${String(draft.step).padStart(2, '0')} <span class="muted">/ 0${STEPS}</span></p>
    <h1 class="display">${t(titles[draft.step - 1])}</h1>
    <p class="muted lede">${t(titles[draft.step - 1] + 'sub')}</p>
  </div>`;
}

function nav({ next = true, skip = false, nextLabel } = {}) {
  return `<div class="wiz-nav">
    ${draft.step > 1 ? `<button class="btn btn-ghost" data-back>${t('sub.back')}</button>` : '<span></span>'}
    <div class="wiz-nav-r">
      ${skip ? `<button class="btn btn-text" data-next>${t('sub.skip')}</button>` : ''}
      ${next ? `<button class="btn btn-lime btn-lg" data-next>${nextLabel || t('sub.next')} <span aria-hidden="true">${arrow()}</span></button>` : ''}
    </div>
  </div>`;
}

/* ---------------- Steps ---------------- */

function step1() {
  const full = draft.photos.length >= MAX_PHOTOS;
  return `${head()}
  <div class="upload ${draft.photos.length ? 'has' : ''}" data-drop>
    <div class="upload-btns">
      <label class="btn btn-dark ${full ? 'disabled' : ''}">${icon.camera}<span>${t('sub.camera')}</span><input type="file" accept="image/*" capture="environment" data-files hidden ${full ? 'disabled' : ''}></label>
      <label class="btn btn-ghost ${full ? 'disabled' : ''}">${icon.image}<span>${t('sub.library')}</span><input type="file" accept="image/*" multiple data-files hidden ${full ? 'disabled' : ''}></label>
    </div>
    <p class="muted small">${full ? t('sub.max') : t('sub.drop')} · ${draft.photos.length}/${MAX_PHOTOS}</p>
  </div>
  <ol class="thumbs" data-thumbs>
    ${draft.photos.map((p, i) => `<li class="thumb ${i === draft.cover ? 'is-cover' : ''}" draggable="true" data-i="${i}">
      <div class="thumb-img"><img src="${p.src}" alt="" draggable="false"><span class="thumb-n">${String(i + 1).padStart(2, '0')}</span>
        <button class="t-star" data-cover="${i}" aria-label="${t('sub.cover')}" aria-pressed="${i === draft.cover}">${icon.star(i === draft.cover)}${i === draft.cover ? `<em>${t('sub.cover')}</em>` : ''}</button>
        <button class="t-x" data-del="${i}" aria-label="${t('sub.delete')}">${icon.close}</button>
      </div>
      <div class="thumb-row">
        <button class="t-mv" data-mv="${i}|-1" aria-label="Move earlier" ${i === 0 ? 'disabled' : ''}>${icon.chev('l')}</button>
        <select data-label="${i}" aria-label="${t('sub.label')}"><option value="">${t('sub.label')}</option>${PHOTO_LABELS.map((l) => `<option ${p.label === l ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <button class="t-mv" data-mv="${i}|1" aria-label="Move later" ${i === draft.photos.length - 1 ? 'disabled' : ''}>${icon.chev('r')}</button>
      </div>
    </li>`).join('')}
  </ol>
  <section class="video-add">
    <h3>${t('sub.video')} <em>${t('sub.optional')}</em></h3>
    ${draft.video ? `<div class="video-chosen">
        ${draft.video.file ? `<video src="${draft.video.src}" muted playsinline preload="metadata"></video><div><strong>${esc(draft.video.name)}</strong><span class="muted small">${mb(draft.video.size)}</span></div>`
          : `<span class="vid-ico">${icon.play}</span><div><strong>${esc(draft.video.kind === 'vimeo' ? 'Vimeo' : draft.video.kind === 'youtube' ? 'YouTube' : 'Video')}</strong><span class="muted small" dir="ltr">${esc(draft.video.link)}</span></div>`}
        <button type="button" class="icon-btn" data-video-remove aria-label="${t('sub.delete')}">${icon.close}</button>
      </div>`
    : `<p class="muted small">${t('sub.videoSub')}</p>
      <div class="video-options">
        <label class="btn btn-ghost">${icon.play}<span>${t('sub.videoUpload')}</span><input type="file" accept="video/*" data-video-file hidden></label>
        <span class="muted small">${t('sub.or')}</span>
        <input class="video-link" data-video-link type="url" inputmode="url" placeholder="${t('sub.videoLinkPh')}" dir="ltr">
      </div>`}
  </section>
  <p class="err" data-err hidden></p>
  ${nav()}`;
}

function step2() {
  return `${head()}
  <form class="form" data-form autocomplete="on">
    <div class="form-grid">
      <label class="field"><span>${t('sub.name')}</span><input name="title" value="${esc(draft.title)}" placeholder="${t('sub.namePh')}" required maxlength="60"></label>
      <label class="field"><span>${t('sub.loc')}</span><input name="location" value="${esc(draft.location)}" placeholder="${t('sub.locPh')}" required maxlength="60" autocomplete="address-level2"></label>
    </div>
    <label class="field"><span>${t('sub.desc')}</span><textarea name="description" rows="3" maxlength="400" placeholder="${t('sub.descPh')}">${esc(draft.description)}</textarea></label>
    <label class="field"><span>${t('sub.special')}</span><input name="special" value="${esc(draft.special)}" placeholder="${t('sub.specialPh')}" maxlength="140"></label>
    <fieldset class="field"><legend>${t('sub.cats')}</legend>
      <div class="chips">${SUBMIT_CATS.map((c) => `<button type="button" class="chip ${draft.categories.includes(c) ? 'on' : ''}" data-cat="${esc(c)}" aria-pressed="${draft.categories.includes(c)}">${esc(tc(c))}</button>`).join('')}</div>
    </fieldset>
    ${yearVisitFields()}
  </form>
  <p class="err" data-err hidden></p>
  ${nav()}`;
}

function yearVisitFields() {
  const y = store.thisYear();
  const years = [y, y - 1, y - 2, y - 3, y - 4];
  const current = draft.year === y;
  const v = draft.visit;
  return `<fieldset class="field"><legend>${t('sub.year')}</legend>
      <div class="chips">${years.map((yr, i) => `<button type="button" class="chip ${draft.year === yr ? 'on' : ''}" data-year="${yr}" aria-pressed="${draft.year === yr}">${i === 0 ? `${t('sub.thisYear')} · ${yr}` : i === 4 ? `${yr} ${t('sub.orEarlier')}` : yr}</button>`).join('')}</div>
    </fieldset>
    ${current ? `<fieldset class="field visit-q"><legend>${t('sub.visitQ')}</legend>
      <div class="chips">
        <button type="button" class="chip ${v.open ? 'on' : ''}" data-open="1" aria-pressed="${v.open}">${t('sub.visitYes')}</button>
        <button type="button" class="chip ${!v.open ? 'on' : ''}" data-open="0" aria-pressed="${!v.open}">${t('sub.visitNo')}</button>
      </div>
      ${v.open ? `<div class="visit-fields">
        <p class="note">${icon.pin} ${t('sub.visitPublic')}</p>
        <label class="field"><span>${t('sub.address')}</span><input name="vaddress" value="${esc(v.address)}" placeholder="${t('sub.addressPh')}" maxlength="160" autocomplete="street-address" required></label>
        <div class="form-grid">
          <label class="field"><span>${t('sub.times')}</span><input name="vtimes" value="${esc(v.times)}" placeholder="${t('sub.timesPh')}" maxlength="160"></label>
          <label class="field"><span>${t('sub.visitContact')}</span><input name="vcontact" value="${esc(v.contact)}" placeholder="${t('sub.visitContactPh')}" maxlength="60" type="tel" inputmode="tel" dir="ltr"></label>
        </div>
      </div>` : ''}
    </fieldset>` : ''}`;
}

function step3() {
  const p = draft.photos[draft.activePhoto];
  const full = totalTags() >= MAX_TAGS;
  return `${head()}
  <p class="tip">${icon.spark} ${full ? t('sub.maxTags') : t('sub.s3tip')} <b>${totalTags()}/${MAX_TAGS}</b></p>
  <div class="tagger">
    <div class="tag-stage">
      <div class="tag-img ${full ? 'full' : ''}" data-tag-img>
        <img src="${p.src}" alt="" draggable="false">
        ${p.hotspots.map((h, i) => `<span class="spot always" style="left:${h.x}%;top:${h.y}%"><span>${i + 1}</span></span>`).join('')}
        <span class="spot pending" data-pending hidden><span>${icon.spark}</span></span>
      </div>
      <div class="tag-strip">${draft.photos.map((ph, i) => `<button class="${i === draft.activePhoto ? 'on' : ''}" data-pick="${i}"><img src="${ph.src}" alt="">${ph.hotspots.length ? `<em>${ph.hotspots.length}</em>` : ''}</button>`).join('')}</div>
    </div>
    <div class="tag-side">
      <form class="form tag-form" data-tag-form hidden>
        <label class="field"><span>${t('sub.what')}</span><input name="name" required placeholder="${t('sub.whatPh')}" maxlength="60"></label>
        <label class="field"><span>${t('sub.where')}</span><input name="vendor" required placeholder="${t('sub.wherePh')}" maxlength="40"></label>
        <label class="field"><span>${t('sub.link')}</span><input name="url" type="text" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="https://" dir="ltr"></label>
        <div class="form-grid">
          <label class="field"><span>${t('sub.price')}</span><input name="price" placeholder="$39" maxlength="20" dir="ltr"></label>
          <label class="field"><span>${t('sub.category')}</span><select name="category">${PRODUCT_CATS.map((c) => `<option>${c}</option>`).join('')}</select></label>
        </div>
        <label class="field"><span>${t('sub.note')}</span><input name="note" placeholder="${t('sub.notePh')}" maxlength="100"></label>
        <div class="row-btns"><button class="btn btn-dark">${t('sub.save')}</button><button type="button" class="btn btn-text" data-tag-cancel>${t('sub.cancel')}</button></div>
      </form>
      <ol class="tag-list">
        ${p.hotspots.map((h, i) => `<li><b>${i + 1}</b><div><strong>${esc(h.name)}</strong><em>${esc(h.vendor)}${h.price ? ` · ${esc(h.price)}` : ''}</em></div><button class="icon-btn" data-untag="${i}" aria-label="${t('sub.delete')}">${icon.close}</button></li>`).join('')}
      </ol>
    </div>
  </div>
  ${nav({ skip: totalTags() === 0, next: totalTags() > 0 })}`;
}

function step4() {
  return `${head()}
  <form class="form narrow" data-form>
    <div class="form-grid">
      <label class="field"><span>${t('sub.yourName')}</span><input name="name" value="${esc(draft.name)}" required autocomplete="name"></label>
      <label class="field"><span>${t('sub.email')}</span><input name="email" type="email" value="${esc(draft.email)}" required autocomplete="email" inputmode="email" dir="ltr"></label>
    </div>
    <label class="field"><span>${t('sub.phone')}</span><input name="phone" type="tel" value="${esc(draft.phone)}" autocomplete="tel" dir="ltr"></label>
    <div class="radio-cards">
      <label class="radio"><input type="radio" name="show" value="1" ${draft.showName ? 'checked' : ''}><span>${t('sub.showName')}</span></label>
      <label class="radio"><input type="radio" name="show" value="0" ${!draft.showName ? 'checked' : ''}><span>${t('sub.useDisplay')}</span></label>
    </div>
    <label class="field" data-display ${draft.showName ? 'hidden' : ''}><input name="display" value="${esc(draft.display)}" placeholder="${t('sub.displayPh')}" maxlength="40"></label>
  </form>
  <p class="err" data-err hidden></p>
  ${nav()}`;
}

function draftAsSukkah() {
  const cats = draft.categories.map((c) => (c === 'Balcony / Patio' ? 'Balcony' : c));
  return {
    id: 'preview', slug: 'preview', title: draft.title || 'Your Sukkah', location: draft.location, description: draft.description, special: draft.special,
    categories: cats.length ? cats : ['Creative'], tags: cats.slice(0, 3), votes: 0, editorsPick: false,
    ownerName: draft.showName ? draft.name : draft.display || draft.name, cover: draft.cover,
    photos: draft.photos.map((p) => ({ id: p.id, src: p.src, label: p.label, hotspots: p.hotspots })),
    year: draft.year, visit: draft.year === store.thisYear() ? draft.visit : { open: false },
    video: draft.video ? (draft.video.file ? { kind: 'file', url: draft.video.src } : { kind: draft.video.kind, url: draft.video.url }) : null,
  };
}

function step5() {
  return `${head()}
  <div class="preview-frame">${detailHTML(draftAsSukkah(), { preview: true })}</div>
  ${nav({ nextLabel: t('sub.submit') })}`;
}

function done(s) {
  const shareText = `${t('share.text')}\n${location.origin}${location.pathname}`;
  return `<div class="done">
    <div class="done-mark">${icon.spark}</div>
    <h1 class="display-xl">${t('sub.done')}</h1>
    <p class="lede muted">${t('sub.doneSub')}</p>
    <div class="stack-btns">
      <a class="btn btn-wa" href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener">${icon.wa}<span>${t('sub.doneShare')}</span></a>
      <a class="btn btn-ghost" href="#/explore">${t('sub.another')}</a>
    </div>
    <p class="small muted ref">#${esc(s.slug)}</p>
  </div>`;
}

/* ---------------- Controller ---------------- */

export function renderSubmit(root) {
  const views = [step1, step2, step3, step4, step5];
  const draw = () => {
    root.innerHTML = `<section class="wizard step-${draft.step}">${views[draft.step - 1]()}</section>`;
    hydrate(root);
    if (draft.step === 5) bindProject(root, draftAsSukkah());
  };
  const err = (k) => { const e = $('[data-err]', root); if (e) { e.hidden = false; e.textContent = t(k); } };
  const go = (n) => { draft.step = n; draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const saveForm = () => {
    const f = $('[data-form]', root);
    if (!f) return;
    const d = Object.fromEntries(new FormData(f));
    if (draft.step === 2) {
      Object.assign(draft, { title: d.title.trim(), location: d.location.trim(), description: d.description.trim(), special: d.special.trim() });
      if (draft.visit.open && 'vaddress' in d) Object.assign(draft.visit, { address: d.vaddress.trim(), times: d.vtimes.trim(), contact: d.vcontact.trim() });
    }
    if (draft.step === 4) Object.assign(draft, { name: d.name.trim(), email: d.email.trim(), phone: d.phone.trim(), showName: d.show === '1', display: (d.display || '').trim() });
  };

  const next = async () => {
    saveForm();
    if (draft.step === 1 && !draft.photos.length) return err('sub.needPhoto');
    if (draft.step === 2 && (!draft.title || !draft.location)) return err('sub.need2');
    if (draft.step === 2 && draft.year === store.thisYear() && draft.visit.open && !draft.visit.address) return err('sub.needAddr');
    if (draft.step === 4 && (!draft.name || !store.validEmail(draft.email))) return err('sub.need4');
    if (draft.step < STEPS) return go(draft.step + 1);
    await finish();
  };

  const finish = async () => {
    const btn = $('[data-next]', root);
    if (btn) { btn.disabled = true; btn.classList.add('is-busy'); }
    let s;
    try {
      for (const p of draft.photos) p.stored ||= await store.uploadPhoto(p.blob);
      if (draft.video?.file) draft.video.url ||= await store.uploadVideo(draft.video.file);
      s = await store.submit({
        ...draftAsSukkah(),
        video: draft.video ? { kind: draft.video.file ? 'file' : draft.video.kind, url: draft.video.url } : null,
        contact: { name: draft.name, email: draft.email, phone: draft.phone },
        photos: draft.photos.map((p) => ({ id: p.id, src: p.stored, label: p.label, hotspots: p.hotspots })),
      });
    } catch (e) {
      console.error(e);
      if (btn) { btn.disabled = false; btn.classList.remove('is-busy'); }
      return toast(t('sub.failed'));
    }
    draft.photos.forEach((p) => URL.revokeObjectURL(p.src));
    draft = blank();
    root.innerHTML = `<section class="wizard">${done(s)}</section>`;
    window.scrollTo({ top: 0 });
  };

  const addFiles = async (files) => {
    const room = MAX_PHOTOS - draft.photos.length;
    const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, room);
    if (files.length > room) toast(t('sub.max'));
    for (const f of list) { const p = await prepare(f); if (p) draft.photos.push(p); }
    draw();
  };

  root.onclick = (e) => {
    const el = e.target.closest('button, [data-pick]');
    if (!el) {
      // Step 3: tap on the photo to drop a hotspot.
      const stage = e.target.closest('[data-tag-img]');
      if (stage && !stage.classList.contains('full')) {
        const r = stage.getBoundingClientRect();
        const x = +(((e.clientX - r.left) / r.width) * 100).toFixed(1);
        const y = +(((e.clientY - r.top) / r.height) * 100).toFixed(1);
        const pend = $('[data-pending]', root);
        Object.assign(pend.style, { left: x + '%', top: y + '%' });
        pend.hidden = false;
        pend.dataset.x = x; pend.dataset.y = y;
        const f = $('[data-tag-form]', root);
        f.hidden = false;
        f.name.focus({ preventScroll: matchMedia('(min-width: 900px)').matches });
        if (!matchMedia('(min-width: 900px)').matches) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (el.matches('[data-next]')) return next();
    if (el.matches('[data-back]')) { saveForm(); return go(draft.step - 1); }
    if (el.dataset.cover != null) { draft.cover = +el.dataset.cover; return draw(); }
    if (el.dataset.del != null) {
      const i = +el.dataset.del;
      URL.revokeObjectURL(draft.photos[i].src);
      draft.photos.splice(i, 1);
      if (draft.cover >= draft.photos.length || draft.cover === i) draft.cover = 0;
      else if (draft.cover > i) draft.cover--;
      draft.activePhoto = 0;
      return draw();
    }
    if (el.dataset.mv) { const [i, d] = el.dataset.mv.split('|').map(Number); return move(i, i + d); }
    if (el.dataset.cat) {
      const c = el.dataset.cat;
      saveForm();
      draft.categories = draft.categories.includes(c) ? draft.categories.filter((x) => x !== c) : [...draft.categories, c];
      el.classList.toggle('on'); el.setAttribute('aria-pressed', draft.categories.includes(c));
      return;
    }
    if (el.dataset.pick != null) { draft.activePhoto = +el.dataset.pick; return draw(); }
    if (el.dataset.year) { saveForm(); draft.year = +el.dataset.year; return draw(); }
    if (el.dataset.open) { saveForm(); draft.visit.open = el.dataset.open === '1'; draw(); if (draft.visit.open) $('[name=vaddress]', root)?.focus(); return; }
    if (el.matches('[data-video-remove]')) { if (draft.video?.src) URL.revokeObjectURL(draft.video.src); draft.video = null; return draw(); }
    if (el.dataset.untag != null) { draft.photos[draft.activePhoto].hotspots.splice(+el.dataset.untag, 1); return draw(); }
    if (el.matches('[data-tag-cancel]')) { $('[data-tag-form]', root).hidden = true; $('[data-pending]', root).hidden = true; }
  };

  const move = (from, to) => {
    if (to < 0 || to >= draft.photos.length) return;
    const coverId = draft.photos[draft.cover]?.id;
    const [p] = draft.photos.splice(from, 1);
    draft.photos.splice(to, 0, p);
    draft.cover = Math.max(0, draft.photos.findIndex((x) => x.id === coverId));
    draw();
  };

  root.onchange = (e) => {
    if (e.target.matches('[data-files]')) addFiles(e.target.files);
    if (e.target.matches('[data-video-file]')) {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > store.MAX_VIDEO_MB * 1048576) return toast(t('sub.videoBig'));
      draft.video = { file: f, name: f.name, size: f.size, src: URL.createObjectURL(f) };
      return draw();
    }
    if (e.target.matches('[data-video-link]')) {
      const v = store.parseVideoLink(e.target.value);
      if (!e.target.value.trim()) return;
      if (!v) return err('sub.videoBad');
      draft.video = { link: e.target.value.trim(), ...v };
      return draw();
    }
    if (e.target.dataset.label != null) draft.photos[+e.target.dataset.label].label = e.target.value;
    if (e.target.name === 'show') { const d = $('[data-display]', root); d.hidden = e.target.value === '1'; if (!d.hidden) $('input', d).focus(); }
  };

  root.onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.matches('[data-tag-form]')) {
      const d = Object.fromEntries(new FormData(f));
      const pend = $('[data-pending]', root);
      const url = d.url.trim();
      draft.photos[draft.activePhoto].hotspots.push({
        id: store.uid(), x: +pend.dataset.x, y: +pend.dataset.y,
        name: d.name.trim(), vendor: d.vendor.trim(), url: url && !/^https?:\/\//i.test(url) ? 'https://' + url : url,
        price: d.price.trim(), category: d.category, note: d.note.trim(),
      });
      return draw();
    }
    next();
  };

  // Desktop drag-and-drop: files onto the drop zone, thumbnails to reorder.
  let dragFrom = null;
  root.ondragstart = (e) => { const li = e.target.closest('.thumb'); if (li) { dragFrom = +li.dataset.i; li.classList.add('dragging'); } };
  root.ondragend = () => { dragFrom = null; $$('.thumb', root).forEach((x) => x.classList.remove('dragging', 'over')); };
  root.ondragover = (e) => {
    e.preventDefault();
    const li = e.target.closest('.thumb');
    $$('.thumb', root).forEach((x) => x.classList.toggle('over', x === li && dragFrom != null));
    $('[data-drop]', root)?.classList.toggle('hover', dragFrom == null);
  };
  root.ondragleave = (e) => { if (!e.relatedTarget || !root.contains(e.relatedTarget)) $('[data-drop]', root)?.classList.remove('hover'); };
  root.ondrop = (e) => {
    e.preventDefault();
    $('[data-drop]', root)?.classList.remove('hover');
    const li = e.target.closest('.thumb');
    if (dragFrom != null && li) return move(dragFrom, +li.dataset.i);
    if (e.dataTransfer.files?.length && draft.step === 1) addFiles(e.dataTransfer.files);
  };

  draw();
}
