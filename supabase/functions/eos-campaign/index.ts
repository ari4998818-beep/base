// eos-campaign — the end-of-Sukkos emails (admins only).
//   { action: 'status' }                    → audience counts, send status, winner
//   { action: 'preview', segment }          → { subject, html } (sample links, nothing saved)
//   { action: 'test', segment }             → sends that email to the signed-in admin (test links work, kept out of results)
//   { action: 'send', segment }             → sends to everyone in that segment who hasn't had it yet
// Segments: 'submitter' (approved, non-sample sukkahs) and 'general' (email subscribers who aren't submitters).
// Audience + dedupe + unsubscribes live in sp_eos_audience(). Winner + campaign id live in sp_settings.data.eos.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE = (Deno.env.get('SITE_URL') ?? 'https://sukkahpin.com').replace(/\/$/, '');
const FN = `${Deno.env.get('SUPABASE_URL')}/functions/v1`;
const ADDRESS = 'SukkahPin · PO Box 220 · Monsey, NY 10952';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const abs = (src?: string) => (!src ? '' : /^https?:/.test(src) ? src : `${SITE}/${src.replace(/^\//, '')}`);
// Photos go through the site's image service: resized, cached, light on email.
const photo = (src: string, w = 828) => (/supabase\.co\/storage/.test(src) ? `${SITE}/_vercel/image?url=${encodeURIComponent(src)}&w=${w}&q=75` : abs(src));
const SUBJECT = { submitter: 'What a Sukkos.', general: 'What a Sukkos.' } as const;
const PREHEADER = { submitter: 'The $250 winner — and one question before we go.', general: 'The winner — and maybe what’s next.' } as const;

type Seg = 'submitter' | 'general';
// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

/* ---------------- Email building blocks ---------------- */

const P = (html: string, pad = '14px 28px 0', extra = '') => `<tr><td style="padding:${pad};font-size:17px;line-height:1.6;color:#2b2b28;${extra}">${html}</td></tr>`;
const H = (text: string, size = 40, pad = '34px 28px 0') => `<tr><td style="padding:${pad};font-size:${size}px;font-weight:800;letter-spacing:-.035em;line-height:1.02;color:#0b0b0b">${text}</td></tr>`;
const EYEBROW = (text: string, pad = '34px 28px 0') => `<tr><td style="padding:${pad};font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#0b0b0b">${text}</td></tr>`;
const RULE = `<tr><td style="padding:34px 28px 0"><div style="height:1px;background:#eae9e4;line-height:1px;font-size:0">&nbsp;</div></td></tr>`;
const BTN = (href: string, label: string, kind: 'dark' | 'lime' | 'line' = 'dark', pad = '22px 28px 0') => {
  const [bg, fg, bd] = kind === 'dark' ? ['#0b0b0b', '#ffffff', '#0b0b0b'] : kind === 'lime' ? ['#d8f23a', '#0b0b0b', '#d8f23a'] : ['#ffffff', '#0b0b0b', '#0b0b0b'];
  return `<tr><td style="padding:${pad}"><a href="${esc(href)}" style="display:block;background:${bg};color:${fg};border:2px solid ${bd};text-decoration:none;font-weight:700;font-size:16px;padding:15px 20px;border-radius:999px;text-align:center">${label}</a></td></tr>`;
};
const LIST = (items: string[]) => P(items.map((x) => `${x}<br>`).join(''), '14px 28px 0', 'font-weight:700;color:#0b0b0b');

const ANSWERS: Record<Seg, [string, string][]> = {
  submitter: [['share', 'I’d share mine'], ['browse', 'I’d definitely browse'], ['both', 'I’d do both'], ['maybe', 'Maybe…'], ['sukkahs', 'I’m mostly here for sukkahs']],
  general: [['browse', 'Yes — I’d browse'], ['share', 'I’d share mine too'], ['both', 'Both'], ['maybe', 'Maybe…'], ['sukkahs', 'Keep it to sukkahs']],
};

function strip(others: Row[]) {
  if (!others.length) return '';
  const cells = others.slice(0, 3).map((s) => {
    const src = (s.photos?.[s.cover ?? 0] ?? s.photos?.[0])?.src;
    return src ? `<td width="33%" style="padding:0 3px"><a href="${SITE}/#/sukkah/${esc(s.slug)}"><img src="${esc(photo(src, 384))}" alt="${esc(s.title)}" width="150" style="display:block;width:100%;height:110px;object-fit:cover;border-radius:4px"></a></td>` : '';
  }).join('');
  return `<tr><td style="padding:24px 25px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table></td></tr>`;
}

function winnerBlock(w: Row, seg: Seg) {
  const src = (w.photos?.[w.cover ?? 0] ?? w.photos?.[0])?.src;
  const view = `${SITE}/#/sukkah/${w.slug}`;
  return [
    RULE,
    EYEBROW('And now…'),
    H('The $250 winner', 44, '10px 28px 0'),
    P(`Mazel Tov to`, '18px 28px 0', 'color:#6f6f69;font-size:15px'),
    H(esc(w.owner_name || w.title), 30, '4px 28px 0'),
    P(`<b style="color:#0b0b0b">${esc(w.title)}</b>${w.location ? ` · ${esc(w.location)}` : ''}`, '6px 28px 0', 'font-size:16px'),
    src ? `<tr><td style="padding:20px 28px 0"><a href="${esc(view)}"><img src="${esc(photo(src, 1600))}" alt="${esc(w.title)}" width="464" style="display:block;width:100%;height:auto;border-radius:6px"></a></td></tr>` : '',
    P(`<b style="color:#0b0b0b">Picked at random</b> from all approved submissions.`, '12px 28px 0', 'font-size:14px;color:#6f6f69'),
    BTN(view, seg === 'submitter' ? 'View the sukkah →' : 'See the winning sukkah →'),
    seg === 'submitter'
      ? P(`Mazel Tov!<br><br>And a big thank you to everyone who sent theirs in. There may be one drawing winner, but SukkahPin wouldn’t have been much of anything without all the sukkahs people shared.`, '22px 28px 0')
      : P(`And an especially big thank you to everyone who opened up their sukkah and shared it with everyone.`, '22px 28px 0'),
  ].join('');
}

function answerButtons(seg: Seg, token: string) {
  return ANSWERS[seg].map(([k, label], i) => BTN(`${SITE}/#/r/${token}/${k}`, label, 'line', i ? '10px 28px 0' : '20px 28px 0')).join('')
    + P('One tap is enough.', '12px 28px 0', 'font-size:13px;color:#9a9993;text-align:center');
}

function buildEmail(seg: Seg, w: Row, others: Row[], token: string) {
  const fb = `${SITE}/#/nu/${token}`;
  const unsub = `${SITE}/#/unsub/${token}`;
  const body = seg === 'submitter' ? [
    H('What a Sukkos.', 46, '30px 28px 0'),
    P(`We started SukkahPin with a pretty simple idea.`, '18px 28px 0'),
    P(`There are so many beautiful, creative sukkahs out there — why isn’t there one place where everyone can see them?`),
    P(`Then you sent yours in.`, '14px 28px 0', 'font-weight:700;color:#0b0b0b'),
    P(`People shared them, voted, got ideas, sent them around — and before we knew it, it was going around everywhere.`),
    strip(others),
    P(`A big thank you for being part of it.`, '20px 28px 0'),
    winnerBlock(w, seg),
    RULE,
    H('So… should we do this again?', 34),
    P(`And maybe not wait until next Sukkos.`, '12px 28px 0', 'font-weight:700;color:#0b0b0b'),
    P(`We keep thinking — there are so many good ideas out there that never get seen.`),
    LIST(['Chanukah setups.', 'Parties.', 'Tables.', 'Purim ideas.', 'Home projects.', 'Things people make themselves.']),
    P(`What if there was one place for all of it?`),
    P(`We’re not saying we’re doing it yet. We want to hear from you first.`),
    H('Would you use it?', 28, '28px 28px 0'),
    answerButtons(seg, token),
    RULE,
    H('Nu, tell us.', 34),
    P(`You were here from the beginning.`, '12px 28px 0'),
    P(`What did you like?<br>What was annoying?<br>What’s missing?<br>What would make you send yours in again?`),
    BTN(fb, 'Tell us what you think →', 'lime'),
    RULE,
    H('A groisen dank.', 28),
    P(`To everyone who sent in a sukkah, shared their page, got their friends voting, or helped spread the word — thank you for making the first one happen.`),
    P(`See you next year.<br>Maybe sooner.`, '14px 28px 0', 'font-weight:700;color:#0b0b0b'),
    P(`— SukkahPin`, '14px 28px 30px'),
  ] : [
    H('What a Sukkos.', 46, '30px 28px 0'),
    P(`So many sukkahs.<br>So many ideas.<br>And a lot of voting.`, '18px 28px 0', 'font-weight:700;color:#0b0b0b'),
    strip(others),
    P(`Thank you to everyone who came to browse, vote, share and get ideas.`, '20px 28px 0'),
    winnerBlock(w, seg),
    RULE,
    H('Sukkos is over.<br>But maybe the idea isn’t.', 32),
    P(`There are plenty of great ideas around us that never make it past a WhatsApp status.`, '16px 28px 0'),
    LIST(['Chanukah setups.', 'Parties.', 'Tables.', 'Purim.', 'DIY projects.', 'Home ideas.']),
    P(`What if the idea behind SukkahPin kept going all year — one place to see and share them?`),
    H('Would you use it?', 28, '28px 28px 0'),
    answerButtons(seg, token),
    P(`Have an idea for us?`, '26px 28px 0', 'text-align:center'),
    BTN(fb, 'Nu, tell us →', 'lime', '10px 28px 0'),
    RULE,
    P(`A groisen dank to everyone who browsed, voted and shared. Thanks for being part of the first SukkahPin.`, '24px 28px 0'),
    P(`See you next year.<br>Maybe sooner.`, '14px 28px 0', 'font-weight:700;color:#0b0b0b'),
    P(`— SukkahPin`, '14px 28px 30px'),
  ];
  const why = seg === 'submitter' ? 'You’re getting this because you sent your sukkah in to SukkahPin.' : 'You’re getting this because you signed up for SukkahPin updates.';
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"></head>
<body style="margin:0;background:#f6f5f1;font-family:Helvetica,Arial,sans-serif;color:#0b0b0b">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(PREHEADER[seg])}${'&nbsp;&zwnj;'.repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden" cellpadding="0" cellspacing="0">
  <tr><td style="padding:26px 28px 0"><a href="${SITE}"><img src="${SITE}/brand/png/sukkahpin-logo.png" alt="SukkahPin" height="26" style="display:block;height:26px;border:0"></a></td></tr>
  ${body.join('\n  ')}
</table>
<p style="color:#9a9993;font-size:12px;line-height:1.6;margin:16px 0 0;max-width:520px;text-align:center">${why}<br>
<a href="${esc(unsub)}" style="color:#6f6f69">Unsubscribe</a> · ${ADDRESS}</p>
</td></tr></table></body></html>`;
}

/* ---------------- Data ---------------- */

// deno-lint-ignore no-explicit-any
async function context(admin: any) {
  const { data: st } = await admin.from('sp_settings').select('data').eq('id', 1).maybeSingle();
  const eos = st?.data?.eos ?? {};
  const campaign: string = eos.campaign || 'eos-2026';
  const { data: live } = await admin.from('sp_sukkahs').select('id, slug, title, owner_name, location, photos, cover, votes, sample, status')
    .eq('status', 'approved').order('votes', { ascending: false });
  const real = (live ?? []).filter((s: Row) => !s.sample && s.photos?.length);
  const winner = real.find((s: Row) => s.slug === eos.winner) ?? null;
  // Photo strip: eos.strip (list of slugs) if set, otherwise the top-voted sukkahs besides the winner.
  const picked = (eos.strip ?? []).map((slug: string) => real.find((s: Row) => s.slug === slug)).filter(Boolean);
  const others = (picked.length ? picked : real.filter((s: Row) => s.slug !== eos.winner)).slice(0, 3);
  return { campaign, winner, others };
}

// deno-lint-ignore no-explicit-any
async function mailConfig(admin: any) {
  const { data } = await admin.rpc('sp_mail_config');
  return { key: Deno.env.get('RESEND_API_KEY') || data?.key || '', from: Deno.env.get('NOTIFY_FROM') || data?.from || 'SukkahPin <onboarding@resend.dev>' };
}

async function send(mail: { key: string; from: string }, to: string, seg: Seg, html: string, token: string, test = false) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${mail.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: mail.from, to: [to], subject: (test ? '[TEST] ' : '') + SUBJECT[seg], html,
      headers: { 'List-Unsubscribe': `<${FN}/eos-unsub?t=${token}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    }),
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(out?.message || `Resend ${r.status}`);
  return out.id as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  let body: { action?: string; segment?: Seg } = {};
  try { body = await req.json(); } catch { /* empty */ }

  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: isAdmin } = await asUser.rpc('sp_is_admin');
  if (!isAdmin) return json({ ok: false, error: 'admins only' }, 403);
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const seg = body.segment;
  if (body.action !== 'status' && seg !== 'submitter' && seg !== 'general') return json({ ok: false, error: 'pick a segment' }, 400);
  const { campaign, winner, others } = await context(admin);

  if (body.action === 'status') {
    const { data: aud } = await admin.rpc('sp_eos_audience');
    const { data: rows } = await admin.from('sp_eos_recipients').select('segment, sent_at, error').eq('campaign', campaign).eq('test', false);
    const { count: suppressed } = await admin.from('sp_email_suppress').select('*', { count: 'exact', head: true });
    const counts: Record<string, Row> = {};
    for (const s of ['submitter', 'general']) {
      const mine = (rows ?? []).filter((r: Row) => r.segment === s);
      counts[s] = { audience: (aud ?? []).filter((a: Row) => a.segment === s).length, sent: mine.filter((r: Row) => r.sent_at).length, failed: mine.filter((r: Row) => !r.sent_at && r.error).length };
    }
    return json({ ok: true, campaign, counts, suppressed, winner: winner && { slug: winner.slug, title: winner.title, owner: winner.owner_name, location: winner.location, photo: (winner.photos[winner.cover ?? 0] ?? winner.photos[0])?.src } });
  }

  if (!winner) return json({ ok: false, error: 'Choose the winning sukkah first' }, 422);

  if (body.action === 'preview') return json({ ok: true, subject: SUBJECT[seg!], html: buildEmail(seg!, winner, others, 'preview') });

  const mail = await mailConfig(admin);
  if (!mail.key) return json({ ok: false, error: 'Resend API key is not set' }, 424);

  if (body.action === 'test') {
    const { data: u } = await asUser.auth.getUser();
    const email = u?.user?.email?.toLowerCase();
    if (!email) return json({ ok: false, error: 'no email on your admin account' }, 422);
    // Test rows live under their own campaign id, so test clicks never reach the real results.
    const { data: row, error } = await admin.from('sp_eos_recipients')
      .upsert({ campaign: `${campaign}-test-${seg}`, email, segment: seg, test: true }, { onConflict: 'campaign,email' }).select('token').single();
    if (error) return json({ ok: false, error: error.message }, 500);
    try { await send(mail, email, seg!, buildEmail(seg!, winner, others, row.token), row.token, true); }
    catch (x) { return json({ ok: false, error: (x as Error).message }, 502); }
    return json({ ok: true, to: email });
  }

  if (body.action === 'send') {
    const { data: aud, error: aerr } = await admin.rpc('sp_eos_audience');
    if (aerr) return json({ ok: false, error: aerr.message }, 500);
    const people = (aud ?? []).filter((a: Row) => a.segment === seg);
    // One row per person per campaign: someone already in the other segment is skipped here.
    if (people.length) await admin.from('sp_eos_recipients').upsert(people.map((p: Row) => ({ campaign, email: p.email, name: p.name, segment: seg })), { onConflict: 'campaign,email', ignoreDuplicates: true });
    const { data: todo } = await admin.from('sp_eos_recipients').select('id, email, token').eq('campaign', campaign).eq('segment', seg).eq('test', false).is('sent_at', null)
      .in('email', people.map((p: Row) => p.email).concat(['—']));
    let sent = 0, failed = 0;
    for (const r of todo ?? []) {
      // Claim the row first so a double-tapped Send can never email anyone twice.
      const { data: claimed } = await admin.from('sp_eos_recipients').update({ sent_at: new Date().toISOString(), error: null })
        .eq('id', r.id).is('sent_at', null).select('id');
      if (!claimed?.length) continue;
      try {
        const id = await send(mail, r.email, seg!, buildEmail(seg!, winner, others, r.token), r.token);
        await admin.from('sp_eos_recipients').update({ resend_id: id }).eq('id', r.id);
        sent++;
      } catch (x) {
        await admin.from('sp_eos_recipients').update({ sent_at: null, error: (x as Error).message.slice(0, 500) }).eq('id', r.id);
        failed++;
      }
      await new Promise((ok) => setTimeout(ok, 600)); // stay under Resend's rate limit
    }
    return json({ ok: true, sent, failed });
  }
  return json({ ok: false, error: 'unknown action' }, 400);
});
