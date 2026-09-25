// Internal admin. Sign-in is a Supabase email code; what an account can read or
// change is decided by Row Level Security (emails listed in sp_admins).

import * as store from '../store.js';
import { esc, $, $$, icon, img, fmt, toast, modal } from '../ui.js';
import { PHOTO_LABELS, PRODUCT_CATS } from './submit.js';

const CATS = ['Modern', 'DIY', 'Family', 'Small Space', 'Luxury', 'Creative', 'Outdoor', 'Balcony', 'Lighting', 'Themed', 'Custom'];
const when = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function gate(root, done) {
  const signedIn = store.isMember(); // one-tap guest voters count as signed out here
  if (signedIn) {
    root.innerHTML = `<section class="section admin-gate">
      <p class="eyebrow">Admin</p><h1 class="display">Not an admin.</h1>
      <p class="muted">${esc(store.voterEmail())} isn’t on the admin list.</p>
      <div class="row-btns" style="margin-top:24px"><button class="btn btn-dark" data-signout>Sign out</button><a class="btn btn-ghost" href="#/">Home</a></div>
    </section>`;
    $('[data-signout]', root).onclick = async () => { await store.signOut(); done(); };
    return;
  }
  root.innerHTML = `<section class="section admin-gate">
    <p class="eyebrow">Admin</p>
    <h1 class="display">Staff only.</h1>
    <form class="form narrow" data-gate>
      <label class="field"><span>Admin email</span><input type="email" name="email" autocomplete="username" required dir="ltr"></label>
      <label class="field"><span>Password</span><input type="password" name="password" autocomplete="current-password" dir="ltr"></label>
      <p class="err" hidden></p>
      <button class="btn btn-dark">Sign in</button>
      <button type="button" class="btn btn-text" data-magic>No password? Email me a sign-in link</button>
    </form>
  </section>`;
  const f = $('[data-gate]', root);
  const err = (m) => { const e = $('.err', root); e.hidden = false; e.textContent = m; };
  f.onsubmit = async (e) => {
    e.preventDefault();
    if (!f.password.value) return err('Enter your password — or tap “Email me a sign-in link”.');
    const b = $('button', f); b.disabled = true;
    try { await store.signInPassword(f.email.value, f.password.value); done(); }
    catch (x) { b.disabled = false; err(store.authMessage(x)); }
  };
  $('[data-magic]', f).onclick = async () => {
    const email = f.email.value.trim();
    if (!store.validEmail(email)) return err('Enter your admin email first.');
    try { localStorage.setItem('sp:returnTo', '#/admin'); } catch {}
    try { await store.requestCode(email); } catch (x) { return err(store.authMessage(x)); }
    f.innerHTML = `<p class="muted">Check <strong>${esc(email)}</strong> and tap the sign-in link. Open it on this device.</p>`;
  };
}

function row(s) {
  const c = store.coverOf(s);
  return `<tr data-id="${s.id}">
    <td><span class="a-thumb">${c ? img(c.src, '', 'loading="lazy"') : ''}</span></td>
    <td><a href="#/sukkah/${s.slug}" class="a-title">${esc(s.title)}</a><div class="small muted">${esc(s.location)} · ${esc(s.ownerName || '')}${store.contactOf(s.id)?.email ? ` · ${esc(store.contactOf(s.id).email)}` : ''}${store.contactOf(s.id)?.phone ? ` · ${esc(store.contactOf(s.id).phone)}` : ''}</div>
      <div class="a-flags">${s.sample ? '<b class="flag">Sample</b>' : ''}${s.featured ? '<b class="flag lime">Featured</b>' : ''}${s.editorsPick ? '<b class="flag dark">Editor’s Pick</b>' : ''}<b class="flag st-${s.status}">${s.status}</b>${s.editedAt ? `<b class="flag" title="${new Date(s.editedAt).toLocaleString()}">Edited by owner</b>` : ''}</div></td>
    <td class="num">${fmt(s.votes)}</td>
    <td class="num">${fmt(s.views || 0)}</td>
    <td class="small muted">${when(s.createdAt)}</td>
    <td class="a-actions">
      ${s.status === 'pending' ? `<button class="btn btn-lime btn-sm" data-act="approve">Approve</button><button class="btn btn-ghost btn-sm" data-act="reject">Reject</button>` : ''}
      <button class="btn btn-ghost btn-sm" data-act="edit">Edit</button>
      <button class="btn btn-ghost btn-sm" data-act="owner-link" title="Make a private link the owner can use to edit">Owner link</button>
    </td>
  </tr>`;
}

const table = (list, empty) => list.length
  ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th></th><th>Sukkah</th><th class="num">Votes</th><th class="num">Views</th><th>Added</th><th></th></tr></thead><tbody>${list.map(row).join('')}</tbody></table></div>`
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
let votesCache = [];
let subsCache = [];
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
function tabSubs() {
  const v = subsCache;
  const phones = v.filter((x) => x.kind === 'phone').map((x) => x.contact);
  const emails = v.filter((x) => x.kind === 'email').map((x) => x.contact);
  const csv = 'contact,type,language,signed_up_from,date\n' + v.map((x) => [x.contact, x.kind, x.lang, x.source, x.created_at].map(csvCell).join(',')).join('\n');
  return `<div class="a-subs-head">
      <p><strong class="a-big">${v.length}</strong> signed up for this year's top picks · ${phones.length} phone · ${emails.length} email</p>
      <div class="row-btns">
        <a class="btn btn-dark btn-sm" download="sukkahpin-subscribers.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent(csv)}">Download CSV</a>
        <button class="btn btn-ghost btn-sm" data-copy="${esc(phones.join('\n'))}" ${phones.length ? '' : 'disabled'}>Copy all phone numbers</button>
        <button class="btn btn-ghost btn-sm" data-copy="${esc(emails.join(', '))}" ${emails.length ? '' : 'disabled'}>Copy all emails</button>
      </div>
      <p class="muted small">Send the picks yourself: paste the phone numbers into a WhatsApp broadcast list, or import the CSV into an email tool (Mailchimp, etc.).</p>
    </div>
    ${v.length ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th>Phone / email</th><th>Language</th><th>Signed up from</th><th>When</th><th></th></tr></thead><tbody>
      ${v.map((x) => `<tr data-sub-id="${x.id}"><td dir="ltr">${esc(x.contact)}</td><td>${x.lang === 'yi' ? 'Yiddish' : 'English'}</td><td class="small muted">${esc(x.source)}</td><td class="small muted">${new Date(x.created_at).toLocaleString()}</td><td class="a-actions"><button class="btn btn-ghost btn-sm" data-act="remove-sub">Remove</button></td></tr>`).join('')}
    </tbody></table></div>` : '<p class="empty">No sign-ups yet.</p>'}`;
}
function tabVotes() {
  const v = votesCache;
  const byId = (id) => store.get(id)?.title || '(deleted)';
  return `<p class="muted small">Latest 500 votes. Guests are one-tap voters; the code after “Guest” is their network (same code = same Wi-Fi / connection). Sample sukkahs start with seeded totals that aren’t individual votes — adjust those in Edit.</p>
  ${v.length ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th>Email</th><th>Sukkah</th><th>When</th><th></th></tr></thead><tbody>
    ${v.map((x) => `<tr data-vote-id="${x.id}" data-vote-sukkah="${x.sukkahId}"><td>${x.email ? esc(x.email) : `<span class="muted">Guest · ${esc((x.ip || '').slice(0, 6) || '—')}</span>`}</td><td>${esc(byId(x.sukkahId))}</td><td class="small muted">${new Date(x.at).toLocaleString()}</td><td class="a-actions"><button class="btn btn-ghost btn-sm" data-act="remove-vote">Remove</button></td></tr>`).join('')}
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
        <button class="btn btn-dark btn-sm">Save settings</button>
      </form>
      <hr>
      <p class="small muted">Signed in as ${esc(store.voterEmail())}. Admins are the emails in the <code>sp_admins</code> table.</p>
      <form class="form" data-password>
        <label class="field"><span>New admin password (8+ characters)</span><input type="password" name="pw" minlength="8" autocomplete="new-password" required></label>
        <button class="btn btn-dark btn-sm">Change password</button>
      </form>
    </div>
  </div>`;
}

const TABS = { pending: ['Pending', tabPending], all: ['All sukkahs', tabAll], links: ['Products & links', tabLinks], votes: ['Votes', tabVotes], subs: ['Subscribers', tabSubs], samples: ['Samples & settings', tabSamples] };

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
    <div class="form-grid">
      <label class="field"><span>Year (Sukkos)</span><input name="year" type="number" min="1990" max="${store.thisYear()}" value="${s.year || store.thisYear()}"></label>
      <label class="field"><span>Video (YouTube / Vimeo / .mp4 link — blank = none)</span><input name="video" value="${esc(s.video?.url || '')}" dir="ltr"></label>
    </div>
    <fieldset class="field"><legend>Open to visitors (shown only while the year is ${store.thisYear()})</legend>
      <div class="a-toggles"><label><input type="checkbox" name="vopen" ${s.visit?.open ? 'checked' : ''}> Open to visit</label></div>
      <div class="form-grid">
        <label class="field"><span>Address (public)</span><input name="vaddress" value="${esc(s.visit?.address || '')}"></label>
        <label class="field"><span>Times</span><input name="vtimes" value="${esc(s.visit?.times || '')}"></label>
        <label class="field"><span>Contact phone / WhatsApp (public)</span><input name="vcontact" value="${esc(s.visit?.contact || '')}" dir="ltr"></label>
      </div>
    </fieldset>
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
    if (b.matches('[data-edel]') && confirm(`Delete “${s.title}” permanently?`)) store.remove(s.id).then(() => { m.close(); toast('Deleted'); }, fail);
  });
  // Photo edits save immediately (along with any typed changes) and redraw the drawer.
  const commitPhotos = async () => { try { const fresh = await collect(); m.close(); editor(fresh, rerender); } catch (x) { fail(x); } };

  const collect = () => {
    const d = new FormData(f);
    return store.update(s.id, {
      title: d.get('title').trim(), location: d.get('location').trim(), ownerName: d.get('ownerName').trim(),
      votes: Math.max(0, parseInt(d.get('votes'), 10) || 0), description: d.get('description').trim(), special: d.get('special').trim(),
      categories: d.getAll('cat'), tags: d.getAll('cat').slice(0, 3),
      featured: d.has('featured'), editorsPick: d.has('editorsPick'), sample: d.has('sample'), status: d.get('status'),
      photos: work.photos, cover: work.cover, hero: work.cover,
      year: Math.min(store.thisYear(), Math.max(1990, parseInt(d.get('year'), 10) || store.thisYear())),
      visit: { open: d.has('vopen'), address: d.get('vaddress').trim(), times: d.get('vtimes').trim(), contact: d.get('vcontact').trim() },
      video: videoFrom(d.get('video'), s.video),
    });
  };
  f.addEventListener('submit', async (e) => { e.preventDefault(); try { await collect(); toast('Saved'); m.close(); } catch (x) { fail(x); } });
}

/** Keep an uploaded file as-is, parse a pasted link, or clear it. */
function videoFrom(raw, current) {
  const u = (raw || '').trim();
  if (!u) return null;
  if (current?.url === u) return current;
  return store.parseVideoLink(u) || current || null;
}

/* ---------------- Page ---------------- */

const fail = (x) => { console.error(x); toast(`Couldn’t save: ${x?.message || x}`); };

export async function renderAdmin(root, params) {
  if (!store.isAdmin()) return gate(root, () => renderAdmin(root, params));
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'pending';
  root.innerHTML = '<div class="boot"><span></span></div>';
  try {
    await store.adminLoad();
    if (tab === 'votes') votesCache = await store.votes();
    if (tab === 'subs') subsCache = await store.subscribers();
  } catch (x) { fail(x); }
  if (!root.isConnected) return;
  const pending = store.list({ status: 'pending' }).length;
  const draw = () => renderAdmin(root, new URLSearchParams(location.hash.split('?')[1] || ''));
  root.innerHTML = `<section class="section admin">
    <div class="split-head tight"><div><p class="eyebrow">Admin</p><h1 class="display">SukkahPin</h1></div>
      <button class="btn btn-text" data-act="logout">Sign out</button></div>
    <nav class="a-tabs">${Object.entries(TABS).map(([k, [l]]) => `<a href="#/admin?tab=${k}" class="${k === tab ? 'on' : ''}">${l}${k === 'pending' && pending ? ` <em>${pending}</em>` : ''}</a>`).join('')}</nav>
    <div class="a-body">${TABS[tab][1]()}</div>
  </section>`;

  const run = async (fn, msg) => { try { await fn(); if (msg) toast(msg); } catch (x) { fail(x); } draw(); };

  root.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.closest('[data-id]')?.dataset.id;
    const act = b.dataset.act;
    if (act === 'logout') return store.signOut().then(() => (location.hash = '#/'));
    if (act === 'approve') return run(() => store.update(id, { status: 'approved' }), 'Approved — it’s live');
    if (act === 'reject') return run(() => store.update(id, { status: 'rejected' }), 'Rejected');
    if (act === 'edit') return editor(store.get(id), draw);
    if (act === 'owner-link') return store.ownerLink(id).then((link) => {
      const sk = store.get(id);
      modal(`<p class="eyebrow">Owner edit link</p><h2 class="display-sm">${esc(sk.title)}</h2>
        <p class="muted small">Send this to the owner only. Anyone with it can edit this sukkah. Making a new link turns off the old one.</p>
        <input class="a-url" value="${esc(link)}" readonly dir="ltr" onclick="this.select()" style="margin:16px 0">
        <div class="stack-btns"><button class="btn btn-dark btn-sm" data-copy="${esc(link)}">Copy link</button>
        <a class="btn btn-wa btn-sm" href="https://wa.me/?text=${encodeURIComponent('Here’s your link to edit ' + sk.title + ' on SukkahPin:\n' + link)}" target="_blank" rel="noopener">${icon.wa}<span>Send on WhatsApp</span></a></div>`, { cls: 'modal-sm' });
    }, fail);
    if (act === 'delete' && confirm('Delete this sukkah?')) return run(() => store.remove(id), 'Deleted');
    if (act === 'remove-samples' && confirm('Delete every sample sukkah? Real submissions stay.')) return run(() => store.removeSamples(), 'Samples removed');
    if (act === 'restore-samples') return run(() => store.restoreSamples(), 'Samples restored');
    if (act === 'remove-sub' && confirm('Remove this subscriber?')) return run(() => store.removeSubscriber(b.closest('[data-sub-id]').dataset.subId), 'Removed');
    if (act === 'remove-vote') { const tr = b.closest('[data-vote-id]'); return run(() => store.removeVote(tr.dataset.voteId, tr.dataset.voteSukkah), 'Vote removed'); }
    if (act === 'remove-link' || act === 'remove-hs') {
      const [sid, hid] = b.closest('[data-hs]').dataset.hs.split('|');
      return run(() => (act === 'remove-hs' ? store.removeHotspot(sid, hid) : store.patchHotspot(sid, hid, { url: '' })));
    }
  };
  root.onchange = (e) => {
    if (e.target.matches('[data-url]')) {
      const [sid, hid] = e.target.closest('[data-hs]').dataset.hs.split('|');
      store.patchHotspot(sid, hid, { url: e.target.value.trim() }).then(() => toast('Link updated'), fail);
    }
    if (e.target.matches('[data-replace]') && e.target.value) {
      const sid = e.target.closest('[data-id]').dataset.id;
      if (confirm('Give this sample’s slot to the selected sukkah and delete the sample?')) run(() => store.replaceSample(sid, e.target.value), 'Replaced');
    }
  };
  root.onsubmit = (e) => {
    if (e.target.matches('[data-password]')) {
      e.preventDefault();
      return store.setPassword(e.target.pw.value).then(() => { e.target.reset(); toast('Password changed'); }, (x) => toast(store.authMessage(x)));
    }
    if (!e.target.matches('[data-settings]')) return;
    e.preventDefault();
    store.setSettings(Object.fromEntries(new FormData(e.target))).then(() => toast('Settings saved'), fail);
  };
}
