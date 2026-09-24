// Internal admin. NOTE: V1 has no server, so the passcode only keeps casual
// visitors out of the UI; it is not security. Put this behind real auth
// (e.g. Supabase Auth + row-level security) when the backend lands.

import * as store from '../store.js';
import { esc, $, $$, icon, img, fmt, toast, modal, hydrate } from '../ui.js';
import { PHOTO_LABELS, PRODUCT_CATS } from './submit.js';

const CATS = ['Modern', 'DIY', 'Family', 'Small Space', 'Luxury', 'Creative', 'Outdoor', 'Balcony', 'Lighting', 'Themed', 'Custom'];
const authed = () => sessionStorage.getItem('its:admin') === '1';
const when = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function gate(root, done) {
  root.innerHTML = `<section class="section admin-gate">
    <p class="eyebrow">Admin</p>
    <h1 class="display">Staff only.</h1>
    <form class="form narrow" data-gate>
      <label class="field"><span>Passcode</span><input type="password" name="code" autocomplete="current-password" required></label>
      <p class="err" hidden>Wrong passcode.</p>
      <button class="btn btn-dark">Enter</button>
      <p class="small muted">Demo passcode: <code>sukkah</code> (change it under Samples &amp; settings).</p>
    </form>
  </section>`;
  $('[data-gate]', root).onsubmit = (e) => {
    e.preventDefault();
    if (e.target.code.value === (store.settings().adminCode || 'sukkah')) { sessionStorage.setItem('its:admin', '1'); done(); }
    else $('.err', root).hidden = false;
  };
}

function row(s) {
  const c = store.coverOf(s);
  return `<tr data-id="${s.id}">
    <td><span class="a-thumb">${c ? img(c.src, '', 'loading="lazy"') : ''}</span></td>
    <td><a href="#/sukkah/${s.slug}" class="a-title">${esc(s.title)}</a><div class="small muted">${esc(s.location)} · ${esc(s.ownerName || '')}${s.contact?.email ? ` · ${esc(s.contact.email)}` : ''}</div>
      <div class="a-flags">${s.sample ? '<b class="flag">Sample</b>' : ''}${s.featured ? '<b class="flag lime">Featured</b>' : ''}${s.editorsPick ? '<b class="flag dark">Editor’s Pick</b>' : ''}<b class="flag st-${s.status}">${s.status}</b></div></td>
    <td class="num">${fmt(s.votes)}</td>
    <td class="num">${s.photos.length}</td>
    <td class="small muted">${when(s.createdAt)}</td>
    <td class="a-actions">
      ${s.status === 'pending' ? `<button class="btn btn-lime btn-sm" data-act="approve">Approve</button><button class="btn btn-ghost btn-sm" data-act="reject">Reject</button>` : ''}
      <button class="btn btn-ghost btn-sm" data-act="edit">Edit</button>
    </td>
  </tr>`;
}

const table = (list, empty) => list.length
  ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th></th><th>Sukkah</th><th class="num">Votes</th><th class="num">Photos</th><th>Added</th><th></th></tr></thead><tbody>${list.map(row).join('')}</tbody></table></div>`
  : `<p class="empty">${empty}</p>`;

function tabPending() {
  return table(store.list({ status: 'pending', sort: 'new' }), 'Nothing waiting for review. ✦');
}
function tabAll() {
  return table(store.list({ status: 'all', sort: 'new' }), 'No sukkahs yet.');
}
function tabLinks() {
  const all = store.allHotspots();
  const bad = (u) => !u || !/^https:\/\//i.test(u);
  return `<p class="muted small">Every tagged product across every sukkah. Links that are missing or not https are flagged.</p>
  <div class="a-table-wrap"><table class="a-table"><thead><tr><th>Product</th><th>Sukkah</th><th>Link</th><th></th></tr></thead><tbody>
  ${all.map(({ s, ph, h }) => `<tr data-hs="${s.id}|${h.id}" class="${bad(h.url) ? 'is-bad' : ''}">
    <td><strong>${esc(h.name)}</strong><div class="small muted">${esc(h.vendor || '')} · ${esc(h.category || '')}${h.price ? ` · ${esc(h.price)}` : ''}</div></td>
    <td class="small"><a href="#/sukkah/${s.slug}">${esc(s.title)}</a><div class="muted">${esc(ph.label || '')}</div></td>
    <td><input class="a-url" value="${esc(h.url || '')}" placeholder="https://" data-url dir="ltr"></td>
    <td class="a-actions"><button class="btn btn-ghost btn-sm" data-act="remove-link">Remove link</button><button class="btn btn-ghost btn-sm" data-act="remove-hs">Delete tag</button></td>
  </tr>`).join('')}
  </tbody></table></div>`;
}
function tabVotes() {
  const v = store.votes();
  const byId = (id) => store.get(id)?.title || '(deleted)';
  return `<p class="muted small">Verified votes cast on this site. Seeded vote totals on sample sukkahs aren’t individual records — adjust those in Edit.</p>
  ${v.length ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th>Email</th><th>Sukkah</th><th>When</th><th></th></tr></thead><tbody>
    ${v.map((x) => `<tr data-vote-id="${x.id}"><td>${esc(x.email)}</td><td>${esc(byId(x.sukkahId))}</td><td class="small muted">${new Date(x.at).toLocaleString()}</td><td class="a-actions"><button class="btn btn-ghost btn-sm" data-act="remove-vote">Remove</button></td></tr>`).join('')}
  </tbody></table></div>` : '<p class="empty">No votes yet.</p>'}`;
}
function tabSamples() {
  const samples = store.list({ status: 'all' }).filter((s) => s.sample);
  const real = store.list({ status: 'all' }).filter((s) => !s.sample);
  const st = store.settings();
  return `<div class="a-cards">
    <div class="a-card">
      <h3>Sample sukkahs <em>${samples.length}</em></h3>
      <p class="muted small">Placeholder content so the site launches populated. Replace one with a real submission (it inherits the Featured / Editor’s Pick slot), or clear them all once real sukkahs are in.</p>
      <ul class="a-mini">${samples.map((s) => `<li data-id="${s.id}"><span>${esc(s.title)}</span>
        <select data-replace aria-label="Replace with"><option value="">Replace with…</option>${real.map((r) => `<option value="${r.id}">${esc(r.title)} (${r.status})</option>`).join('')}</select>
        <button class="icon-btn" data-act="delete" aria-label="Delete">${icon.close}</button></li>`).join('')}</ul>
      <div class="row-btns"><button class="btn btn-ghost btn-sm" data-act="remove-samples" ${samples.length ? '' : 'disabled'}>Delete all samples</button><button class="btn btn-ghost btn-sm" data-act="restore-samples">Restore samples</button></div>
    </div>
    <div class="a-card">
      <h3>Settings</h3>
      <form class="form" data-settings>
        <label class="field"><span>Hero stat (circle badge)</span><input name="heroStat" value="${esc(st.heroStat)}"></label>
        <label class="field"><span>Contest line (Winners page)</span><input name="contestLine" value="${esc(st.contestLine)}"></label>
        <label class="field"><span>Admin passcode</span><input name="adminCode" value="${esc(st.adminCode || 'sukkah')}"></label>
        <button class="btn btn-dark btn-sm">Save settings</button>
      </form>
      <hr>
      <button class="btn btn-ghost btn-sm" data-act="reset-all">Reset everything to demo data</button>
    </div>
  </div>`;
}

const TABS = { pending: ['Pending', tabPending], all: ['All sukkahs', tabAll], links: ['Products & links', tabLinks], votes: ['Votes', tabVotes], samples: ['Samples & settings', tabSamples] };

/* ---------------- Edit drawer ---------------- */

function editor(s, rerender) {
  const m = modal(`<form class="form a-edit" data-edit>
    <p class="eyebrow">Edit sukkah</p>
    <div class="form-grid">
      <label class="field"><span>Title</span><input name="title" value="${esc(s.title)}"></label>
      <label class="field"><span>Location</span><input name="location" value="${esc(s.location)}"></label>
      <label class="field"><span>Shown as (owner)</span><input name="ownerName" value="${esc(s.ownerName || '')}"></label>
      <label class="field"><span>Votes</span><input name="votes" type="number" min="0" value="${s.votes}"></label>
    </div>
    <label class="field"><span>Description</span><textarea name="description" rows="3">${esc(s.description || '')}</textarea></label>
    <label class="field"><span>What makes it special</span><input name="special" value="${esc(s.special || '')}"></label>
    <fieldset class="field"><legend>Categories</legend><div class="chips">${CATS.map((c) => `<label class="chip ${s.categories.includes(c) ? 'on' : ''}"><input type="checkbox" name="cat" value="${c}" ${s.categories.includes(c) ? 'checked' : ''} hidden>${c}</label>`).join('')}</div></fieldset>
    <div class="a-toggles">
      <label><input type="checkbox" name="featured" ${s.featured ? 'checked' : ''}> Featured (hero)</label>
      <label><input type="checkbox" name="editorsPick" ${s.editorsPick ? 'checked' : ''}> Editor’s Pick</label>
      <label><input type="checkbox" name="sample" ${s.sample ? 'checked' : ''}> Sample content</label>
      <label>Status <select name="status">${['pending', 'approved', 'rejected'].map((x) => `<option ${s.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
    </div>
    <p class="eyebrow">Photos — reorder, cover, labels, product tags</p>
    <ol class="a-photos">${s.photos.map((p, i) => `<li data-pi="${i}">
      <span class="a-thumb big">${img(p.src, '')}${i === s.cover ? '<b class="flag lime">Cover</b>' : ''}</span>
      <div class="a-photo-ctl">
        <select data-plabel="${i}">${['', ...PHOTO_LABELS].map((l) => `<option ${p.label === l ? 'selected' : ''} value="${l}">${l || '—'}</option>`).join('')}</select>
        <div class="row-btns">
          <button type="button" class="icon-btn" data-pmv="${i}|-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon.chev('l')}</button>
          <button type="button" class="icon-btn" data-pmv="${i}|1" ${i === s.photos.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon.chev('r')}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-pcover="${i}">Set cover</button>
          <button type="button" class="btn btn-ghost btn-sm" data-pdel="${i}">Remove</button>
        </div>
        <ul class="a-hs">${p.hotspots.map((h) => `<li>${icon.spark} ${esc(h.name)} <span class="muted">· ${esc(h.vendor || '')}</span> <select data-hcat="${i}|${h.id}">${PRODUCT_CATS.map((c) => `<option ${h.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select><button type="button" class="icon-btn" data-hdel="${i}|${h.id}" aria-label="Delete tag">${icon.close}</button></li>`).join('')}</ul>
      </div>
    </li>`).join('')}</ol>
    <div class="row-btns sticky-save">
      <button class="btn btn-dark">Save changes</button>
      <button type="button" class="btn btn-text danger" data-edel>Delete sukkah</button>
    </div>
  </form>`, { cls: 'modal-wide', onClose: rerender });

  const f = $('[data-edit]', m.el);
  // Photo operations mutate a working copy; Save commits everything at once.
  const work = { photos: JSON.parse(JSON.stringify(s.photos)), cover: s.cover };

  f.addEventListener('change', (e) => {
    if (e.target.name === 'cat') e.target.closest('.chip').classList.toggle('on', e.target.checked);
    if (e.target.dataset.plabel != null) work.photos[+e.target.dataset.plabel].label = e.target.value;
    if (e.target.dataset.hcat) { const [i, id] = e.target.dataset.hcat.split('|'); work.photos[+i].hotspots.find((h) => h.id === id).category = e.target.value; }
  });
  f.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const coverId = work.photos[work.cover]?.id;
    const keepCover = () => (work.cover = Math.max(0, work.photos.findIndex((p) => p.id === coverId)));
    if (b.dataset.pmv) { const [i, d] = b.dataset.pmv.split('|').map(Number); const [p] = work.photos.splice(i, 1); work.photos.splice(i + d, 0, p); keepCover(); commitPhotos(); }
    if (b.dataset.pcover) { work.cover = +b.dataset.pcover; commitPhotos(); }
    if (b.dataset.pdel && work.photos.length > 1 && confirm('Remove this photo?')) { work.photos.splice(+b.dataset.pdel, 1); keepCover(); commitPhotos(); }
    if (b.dataset.hdel) { const [i, id] = b.dataset.hdel.split('|'); work.photos[+i].hotspots = work.photos[+i].hotspots.filter((h) => h.id !== id); commitPhotos(); }
    if (b.matches('[data-edel]') && confirm(`Delete “${s.title}” permanently?`)) { store.remove(s.id); m.close(); toast('Deleted'); }
  });
  // Photo edits save immediately (along with any typed changes) and redraw the drawer.
  const commitPhotos = () => { collect(); const fresh = store.get(s.id); m.close(); editor(fresh, rerender); };

  const collect = () => {
    const d = new FormData(f);
    store.update(s.id, {
      title: d.get('title').trim(), location: d.get('location').trim(), ownerName: d.get('ownerName').trim(),
      votes: Math.max(0, parseInt(d.get('votes'), 10) || 0), description: d.get('description').trim(), special: d.get('special').trim(),
      categories: d.getAll('cat'), tags: d.getAll('cat').slice(0, 3),
      featured: d.has('featured'), editorsPick: d.has('editorsPick'), sample: d.has('sample'), status: d.get('status'),
      photos: work.photos, cover: work.cover, hero: work.cover,
    });
  };
  f.addEventListener('submit', (e) => { e.preventDefault(); collect(); toast('Saved'); m.close(); });
}

/* ---------------- Page ---------------- */

export function renderAdmin(root, params) {
  if (!authed()) return gate(root, () => renderAdmin(root, params));
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'pending';
  const pending = store.list({ status: 'pending' }).length;
  const draw = () => renderAdmin(root, new URLSearchParams(location.hash.split('?')[1] || ''));
  root.innerHTML = `<section class="section admin">
    <div class="split-head tight"><div><p class="eyebrow">Admin</p><h1 class="display">Inside the Sukkah</h1></div>
      <button class="btn btn-text" data-act="logout">Log out</button></div>
    <nav class="a-tabs">${Object.entries(TABS).map(([k, [l]]) => `<a href="#/admin?tab=${k}" class="${k === tab ? 'on' : ''}">${l}${k === 'pending' && pending ? ` <em>${pending}</em>` : ''}</a>`).join('')}</nav>
    <div class="a-body">${TABS[tab][1]()}</div>
  </section>`;
  hydrate(root);

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.closest('[data-id]')?.dataset.id;
    const act = b.dataset.act;
    if (act === 'logout') { sessionStorage.removeItem('its:admin'); location.hash = '#/'; return; }
    if (act === 'approve') { store.update(id, { status: 'approved' }); toast('Approved — it’s live'); }
    if (act === 'reject') { store.update(id, { status: 'rejected' }); toast('Rejected'); }
    if (act === 'edit') return editor(store.get(id), draw);
    if (act === 'delete' && confirm('Delete this sukkah?')) store.remove(id);
    if (act === 'remove-samples' && confirm('Delete every sample sukkah? Real submissions stay.')) store.removeSamples();
    if (act === 'restore-samples') store.restoreSamples();
    if (act === 'reset-all' && confirm('Reset all data to the demo state? This removes submissions and votes on this device.')) store.resetAll();
    if (act === 'remove-vote') store.removeVote(b.closest('[data-vote-id]').dataset.voteId);
    if (act === 'remove-link' || act === 'remove-hs') {
      const [sid, hid] = b.closest('[data-hs]').dataset.hs.split('|');
      act === 'remove-hs' ? store.removeHotspot(sid, hid) : store.patchHotspot(sid, hid, { url: '' });
    }
    draw();
  };
  root.onchange = (e) => {
    if (e.target.matches('[data-url]')) {
      const [sid, hid] = e.target.closest('[data-hs]').dataset.hs.split('|');
      store.patchHotspot(sid, hid, { url: e.target.value.trim() });
      toast('Link updated');
    }
    if (e.target.matches('[data-replace]') && e.target.value) {
      const sid = e.target.closest('[data-id]').dataset.id;
      if (confirm('Give this sample’s slot to the selected sukkah and delete the sample?')) { store.replaceSample(sid, e.target.value); toast('Replaced'); draw(); }
    }
  };
  root.onsubmit = (e) => {
    if (!e.target.matches('[data-settings]')) return;
    e.preventDefault();
    store.setSettings(Object.fromEntries(new FormData(e.target)));
    toast('Settings saved');
  };
}
