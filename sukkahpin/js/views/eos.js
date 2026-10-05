// End-of-season campaign: the pages behind the email buttons, plus the admin tab.
//   #/r/<token>/<answer>  one-click answer ("What would you want from it?") — saved when the page opens
//   #/nu/<token>          the short "Nu, tell us" feedback form
//   #/unsub/<token>       unsubscribe (asks first, so link scanners can't unsubscribe anyone)
// The token is each recipient's private key; nobody needs to sign in.

import * as store from '../store.js';
import { esc, $, $$, img, toast, modal } from '../ui.js';

export const ANSWERS = {
  submitter: [['browse', 'I’d come to get ideas'], ['share', 'I’d share my own ideas'], ['both', 'I’d do both'], ['maybe', 'Not sure yet'], ['sukkahs', 'I’d keep it just for Sukkos']],
  general: [['browse', 'I’d come to get ideas'], ['share', 'I’d share my own ideas'], ['both', 'I’d do both'], ['maybe', 'Not sure yet'], ['sukkahs', 'I’d keep it just for Sukkos']],
};
const AGAIN = [['definitely', 'Definitely'], ['probably', 'Probably'], ['maybe', 'Maybe'], ['no', 'Probably not']];
const WANTS = [['chanukah', 'Chanukah setups'], ['parties', 'Parties / events'], ['tables', 'Tables'], ['purim', 'Purim ideas'], ['home', 'Home / decor ideas'], ['diy', 'DIY / creative projects'], ['sukkahs', 'Sukkahs only'], ['other', 'Other']];

const shell = (inner) => `<section class="section eos-page"><div class="eos-card">${inner}</div></section>`;
const badLink = () => shell(`<p class="eyebrow">SukkahPin</p><h1 class="display-sm">This link doesn’t look right.</h1>
  <p class="muted">Try the button in the email again — or just <a href="#/">have a look around</a>.</p>`);
const check = '<span class="eos-burst" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

/* ---------------- One-click answer ---------------- */

export async function renderEosAnswer(root, token, answer) {
  root.innerHTML = shell('<div class="boot"><span></span></div>');
  let seg;
  try { seg = await store.eosAnswer(token, answer); } catch { seg = null; }
  if (!root.isConnected) return;
  if (!seg) { root.innerHTML = badLink(); return; }
  const draw = (current) => {
    root.innerHTML = shell(`${check}
      <h1 class="display-sm eos-h">Got it.<br><span class="eos-he" dir="rtl" lang="he">יישר כח</span></h1>
      <p class="muted">This really helps us figure out what to do next.</p>
      <p class="eyebrow eos-label">Your answer — tap to change</p>
      <div class="eos-choices">${ANSWERS[seg].map(([k, l]) => `<button class="eos-choice ${k === current ? 'on' : ''}" data-a="${k}">${l}</button>`).join('')}</div>
      <div class="eos-more">
        <h2 class="display-sm">Have another minute?</h2>
        <a class="btn btn-lime" href="#/nu/${token}">Tell us what you’d want to see →</a>
      </div>`);
    $$('[data-a]', root).forEach((b) => (b.onclick = async () => {
      try { await store.eosAnswer(token, b.dataset.a); draw(b.dataset.a); toast('Updated'); } catch { toast('Couldn’t save — try again'); }
    }));
  };
  draw(answer);
}

/* ---------------- Feedback ---------------- */

export async function renderEosFeedback(root, token) {
  root.innerHTML = shell('<div class="boot"><span></span></div>');
  let me = null;
  try { me = await store.eosGet(token); } catch {}
  if (!root.isConnected) return;
  if (!me) { root.innerHTML = badLink(); return; }
  const sub = me.segment === 'submitter';
  const wants = new Set(me.wants || []);
  root.innerHTML = shell(`<p class="eyebrow">SukkahPin</p>
    <h1 class="display-sm eos-h">Nu, tell us.</h1>
    <p class="muted">Three quick questions. Skip whatever you want.</p>
    <form class="form eos-form" data-fb>
      ${sub ? `<fieldset class="field"><legend>Would you send your sukkah in again next year?</legend>
        <div class="eos-choices row">${AGAIN.map(([k, l]) => `<label class="eos-choice ${me.again === k ? 'on' : ''}"><input type="radio" name="again" value="${k}" ${me.again === k ? 'checked' : ''} hidden>${l}</label>`).join('')}</div></fieldset>` : ''}
      <fieldset class="field"><legend>What else would you actually want to see or share?</legend>
        <p class="small muted">Pick as many as you like.</p>
        <div class="chips">${WANTS.map(([k, l]) => `<label class="chip ${wants.has(k) ? 'on' : ''}"><input type="checkbox" name="wants" value="${k}" ${wants.has(k) ? 'checked' : ''} hidden>${l}</label>`).join('')}</div></fieldset>
      <label class="field"><span>Nu, tell us what you’re thinking.</span>
        <textarea name="note" rows="5" maxlength="4000" placeholder="What should we add, change, or do better?">${esc(me.note || '')}</textarea></label>
      <button class="btn btn-dark">Send it →</button>
    </form>`);
  const f = $('[data-fb]', root);
  f.addEventListener('change', (e) => {
    if (e.target.name === 'wants') e.target.closest('.chip').classList.toggle('on', e.target.checked);
    if (e.target.name === 'again') $$('[name="again"]', f).forEach((r) => r.closest('.eos-choice').classList.toggle('on', r.checked));
  });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = new FormData(f);
    const btn = $('button', f);
    btn.disabled = true;
    try {
      await store.eosFeedback(token, d.get('again'), d.getAll('wants'), (d.get('note') || '').trim());
      root.innerHTML = shell(`${check}<h1 class="display-sm eos-h"><span class="eos-he" dir="rtl" lang="he">יישר כח</span></h1>
        <p class="muted">We read these — and this is exactly the kind of feedback we need.</p>
        <a class="btn btn-ghost" href="#/">Back to SukkahPin</a>`);
      scrollTo(0, 0);
    } catch { btn.disabled = false; toast('Couldn’t send — try again'); }
  });
}

/* ---------------- Unsubscribe ---------------- */

export async function renderEosUnsub(root, token) {
  root.innerHTML = shell('<div class="boot"><span></span></div>');
  let me = null;
  try { me = await store.eosGet(token); } catch {}
  if (!root.isConnected) return;
  if (!me) { root.innerHTML = badLink(); return; }
  const done = () => (root.innerHTML = shell(`<p class="eyebrow">SukkahPin</p><h1 class="display-sm eos-h">You’re off the list.</h1>
    <p class="muted">No more emails from us.</p><a class="btn btn-ghost" href="#/">Back to SukkahPin</a>`));
  if (me.unsubscribed) return done();
  root.innerHTML = shell(`<p class="eyebrow">SukkahPin</p><h1 class="display-sm eos-h">Unsubscribe from SukkahPin emails?</h1>
    <p class="muted">We’ll stop sending you emails. Your sukkah (if you sent one in) stays on the site.</p>
    <div class="row-btns"><button class="btn btn-dark" data-yes>Yes, unsubscribe me</button><a class="btn btn-ghost" href="#/">Never mind</a></div>`);
  $('[data-yes]', root).onclick = async () => { try { await store.eosUnsub(token); done(); } catch { toast('Couldn’t save — try again'); } };
}

/* ---------------- Admin tab ---------------- */

const SEGS = [['submitter', 'Submitter email', 'Everyone with an approved sukkah'], ['general', 'General email', 'Email subscribers who didn’t submit']];
const LABELS = { browse: 'Come to get ideas', share: 'Share their own ideas', both: 'Both', maybe: 'Not sure yet', sukkahs: 'Keep it just for Sukkos' };
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const bar = (label, n, d) => `<tr><td>${label}</td><td class="num">${n}</td><td class="eos-bar-cell"><span class="eos-bar"><i style="width:${pct(n, d)}%"></i></span><span class="small muted">${pct(n, d)}%</span></td></tr>`;

export const eosAdminHTML = () => '<div data-eos-admin><div class="boot"><span></span></div></div>';

export async function mountEosAdmin(el) {
  const st = store.settings().eos || {};
  const campaign = st.campaign || 'eos-2026';
  let status = null, results = { recipients: [], responses: [] }, err = '';
  try { [status, results] = await Promise.all([store.eosAdmin('status'), store.eosResults(campaign)]); } catch (x) { err = x.message; }
  if (!el.isConnected) return;
  const live = store.list({ status: 'approved' }).filter((s) => !s.sample);
  const w = live.find((s) => s.slug === st.winner);
  const cover = w && store.coverOf(w);

  // Results
  const seg = Object.fromEntries(results.recipients.map((r) => [r.id, r.segment]));
  const resp = results.responses.filter((r) => seg[r.recipient_id]);
  const answered = (g) => resp.filter((r) => r.answer && (!g || seg[r.recipient_id] === g));
  const respondents = resp.filter((r) => r.answer || r.feedback_at).length;
  const fbs = resp.filter((r) => r.feedback_at);
  const again = resp.filter((r) => r.again);
  const notes = resp.filter((r) => r.note).sort((a, b) => (b.feedback_at || '').localeCompare(a.feedback_at || ''));
  const answerTable = (g) => { const a = answered(g); return `<table class="a-table eos-table"><tbody>${Object.keys(LABELS).map((k) => bar(LABELS[k], a.filter((r) => r.answer === k).length, a.length)).join('')}</tbody></table><p class="small muted">${a.length} answered</p>`; };

  el.innerHTML = `${err ? `<p class="eos-err">Couldn’t load everything: ${esc(err)}</p>` : ''}
  <div class="a-cards">
    <div class="a-card">
      <h3>1 · The $250 winner</h3>
      <label class="field"><span>Winning sukkah</span><select data-eos-winner><option value="">Choose…</option>${live.map((s) => `<option value="${s.slug}" ${s.slug === st.winner ? 'selected' : ''}>${esc(s.title)} — ${esc(s.ownerName || '')}</option>`).join('')}</select></label>
      ${w ? `<div class="eos-winner">${cover ? `<span class="eos-winner-img">${img(cover.src, w.title)}</span>` : ''}<div><strong>${esc(w.ownerName || '—')}</strong><br>${esc(w.title)}<br><span class="muted small">${esc(w.location || 'No location')}</span><br><a class="small" href="#/sukkah/${w.slug}" target="_blank">View sukkah ↗</a></div></div>
        <p class="small muted">Check the name, photo and location — this is exactly what both emails show. The photo is the sukkah’s cover (change it under All sukkahs → Edit).</p>` : '<p class="small muted">Pick the winner to unlock previews and sending.</p>'}
    </div>
    <div class="a-card">
      <h3>2 · Send</h3>
      <p class="small muted">Subject: <strong>What a Sukkos.</strong> Nobody gets both emails — people who sent in a sukkah only get the submitter email. Unsubscribed addresses are skipped${status ? ` (${status.suppressed || 0} so far)` : ''}.</p>
      ${SEGS.map(([k, name, who]) => { const c = status?.counts?.[k] || { audience: 0, sent: 0, failed: 0 }; const left = Math.max(0, c.audience - c.sent);
        return `<div class="eos-seg">
          <div><strong>${name}</strong> <span class="muted small">· ${who}</span><br>
          <span class="small">${c.audience} people · <b>${c.sent} sent</b>${c.failed ? ` · <span class="eos-err">${c.failed} failed</span>` : ''}</span></div>
          <div class="row-btns">
            <button class="btn btn-ghost btn-sm" data-eos="preview" data-seg="${k}" ${w ? '' : 'disabled'}>Preview</button>
            <button class="btn btn-ghost btn-sm" data-eos="test" data-seg="${k}" ${w ? '' : 'disabled'}>Send test to me</button>
            <button class="btn btn-dark btn-sm" data-eos="send" data-seg="${k}" data-left="${left}" ${w && left ? '' : 'disabled'}>${left ? `Send to ${left}` : 'All sent'}</button>
          </div></div>`; }).join('')}
    </div>
  </div>

  <div class="eos-results">
    <p class="eyebrow">End of season results</p>
    <div class="eos-total"><b>${respondents}</b><span>people answered<br><span class="muted small">of ${results.recipients.filter((r) => r.sent_at).length} emailed</span></span></div>
    <div class="a-cards">
      <div class="a-card"><h3>What would you want from it? <em>everyone</em></h3>${answerTable()}</div>
      <div class="a-card"><h3>Submitters vs. general</h3><p class="eyebrow">Submitters</p>${answerTable('submitter')}<p class="eyebrow">General</p>${answerTable('general')}</div>
      <div class="a-card"><h3>Would submit again next Sukkos</h3><table class="a-table eos-table"><tbody>${AGAIN.map(([k, l]) => bar(l, again.filter((r) => r.again === k).length, again.length)).join('')}</tbody></table><p class="small muted">${again.length} submitters answered</p></div>
      <div class="a-card"><h3>What people want next</h3><table class="a-table eos-table"><tbody>${WANTS.map(([k, l]) => bar(l, fbs.filter((r) => (r.wants || []).includes(k)).length, fbs.length)).join('')}</tbody></table><p class="small muted">${fbs.length} filled in the form · people can pick more than one</p></div>
    </div>
    <div class="a-card eos-notes"><h3>In their words <em>${notes.length}</em></h3>
      ${notes.length ? notes.map((r) => `<blockquote><p>${esc(r.note)}</p><span class="small muted">${seg[r.recipient_id] === 'submitter' ? 'Submitter' : 'General'} · ${new Date(r.feedback_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></blockquote>`).join('') : '<p class="muted small">Nothing yet.</p>'}
    </div>
  </div>`;

  const remount = () => mountEosAdmin(el);
  $('[data-eos-winner]', el).onchange = async (e) => {
    try { await store.setSettings({ eos: { ...st, campaign, winner: e.target.value } }); toast('Winner saved'); } catch (x) { toast(`Couldn’t save: ${x.message}`); }
    remount();
  };
  $$('[data-eos]', el).forEach((b) => (b.onclick = async () => {
    const k = b.dataset.seg, act = b.dataset.eos, name = SEGS.find((s) => s[0] === k)[1];
    if (act === 'send' && !confirm(`Send the ${name.toLowerCase()} to ${b.dataset.left} people now?\n\nThis can’t be undone.`)) return;
    b.disabled = true;
    try {
      const r = await store.eosAdmin(act, k);
      if (act === 'preview') {
        const m = modal(`<p class="eyebrow">${name} · preview</p><p class="small muted">Subject: <strong>${esc(r.subject)}</strong> · buttons don’t save anything in the preview.</p><iframe class="eos-preview" title="Email preview"></iframe>`, { cls: 'modal-wide' });
        $('iframe', m.el).srcdoc = r.html;
      }
      if (act === 'test') toast(`Test sent to ${r.to}`);
      if (act === 'send') { toast(`${r.sent} sent${r.failed ? ` · ${r.failed} failed` : ''}`); remount(); }
    } catch (x) { toast(`Not sent: ${x.message}`); }
    b.disabled = false;
  }));
}
