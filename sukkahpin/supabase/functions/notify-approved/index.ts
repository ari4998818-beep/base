// notify-approved — "Your sukkah is live" email to the submitter.
// Called by the database when a sukkah goes pending → approved ({ id }); sent once
// (sp_sukkahs.approved_email_at). An admin can resend from the site ({ id, resend: true }).
// { id, preview: true } returns the HTML without sending (public info only, no edit key).
//
// Mail settings come from Supabase Vault via sp_mail_config() (resend_api_key, notify_from);
// Edge Function secrets RESEND_API_KEY / NOTIFY_FROM override them if set. SITE_URL optional.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE = (Deno.env.get('SITE_URL') ?? 'https://sukkahpin.com').replace(/\/$/, '');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const abs = (src?: string) => (!src ? '' : /^https?:/.test(src) ? src : `${SITE}/${src.replace(/^\//, '')}`);
const btn = (href: string, label: string, bg: string, fg: string, border = bg) =>
  `<a href="${href}" style="display:block;background:${bg};color:${fg};border:2px solid ${border};text-decoration:none;font-weight:700;font-size:16px;padding:15px 20px;border-radius:999px;text-align:center">${label}</a>`;

// deno-lint-ignore no-explicit-any
async function mailConfig(admin: any) {
  const { data } = await admin.rpc('sp_mail_config');
  return {
    key: Deno.env.get('RESEND_API_KEY') || data?.key || '',
    from: Deno.env.get('NOTIFY_FROM') || data?.from || 'SukkahPin <onboarding@resend.dev>',
  };
}

// deno-lint-ignore no-explicit-any
function emailHTML(s: Record<string, any>, key: string) {
  const photos: { src: string }[] = s.photos ?? [];
  const cover = abs((photos[s.cover ?? 0] ?? photos[0])?.src);
  const view = `${SITE}/#/sukkah/${s.slug}`;
  const status = `${SITE}/#/share/${s.slug}${key ? `?k=${key}` : ''}`;
  const voteLink = `${SITE}/l/${s.slug}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`My sukkah is on SukkahPin — take a look and vote for it 👇\n${SITE}/w/${s.slug}`)}`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#f6f5f1;font-family:Helvetica,Arial,sans-serif;color:#0b0b0b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden" cellpadding="0" cellspacing="0">
  <tr><td style="padding:24px 28px 0"><img src="${SITE}/brand/png/sukkahpin-logo.png" alt="SukkahPin" height="26" style="display:block;height:26px"></td></tr>
  <tr><td style="padding:22px 28px 0"><span style="display:inline-block;background:#d8f23a;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:5px 9px">● Live now</span></td></tr>
  <tr><td style="padding:12px 28px 0;font-size:34px;font-weight:800;letter-spacing:-.03em;line-height:1.05">Your sukkah is live.</td></tr>
  <tr><td style="padding:12px 28px 0;font-size:17px;line-height:1.5"><b>${esc(s.title)}</b> is now on SukkahPin.<br>Share it with your friends and get the votes going.</td></tr>
  ${cover ? `<tr><td style="padding:20px 28px 0"><a href="${view}"><img src="${esc(cover)}" alt="${esc(s.title)}" width="464" style="display:block;width:100%;height:auto;max-height:300px;object-fit:cover;border-radius:6px"></a></td></tr>` : ''}
  ${s.location ? `<tr><td style="padding:10px 28px 0;font-size:14px;color:#6f6f69">${esc(s.location)}</td></tr>` : ''}
  <tr><td style="padding:22px 28px 0">${btn(view, 'View My Sukkah', '#0b0b0b', '#ffffff')}</td></tr>
  <tr><td style="padding:10px 28px 0">${btn(status, 'Make My Status Post', '#d8f23a', '#0b0b0b')}</td></tr>
  <tr><td style="padding:10px 28px 0">${btn(wa, 'Share My Voting Link', '#ffffff', '#0b0b0b', '#0b0b0b')}</td></tr>
  <tr><td style="padding:16px 28px 26px;font-size:13px;color:#6f6f69;line-height:1.5">Your voting link — copy and send it anywhere:<br><a href="${voteLink}" style="color:#0b0b0b;font-weight:700">${voteLink.replace(/^https?:\/\//, '')}</a></td></tr>
</table>
<p style="color:#9a9993;font-size:12px;margin:14px 0 0;max-width:520px">The “Make My Status Post” button is your private link — please don’t forward this email.</p>
</td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  let body: { id?: string; resend?: boolean; preview?: boolean } = {};
  try { body = await req.json(); } catch { /* empty */ }
  if (!body.id) return json({ ok: false, error: 'missing id' }, 400);

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: s } = await admin.from('sp_sukkahs').select('*').eq('id', body.id).maybeSingle();
  if (!s || s.status !== 'approved') return json({ ok: true, skipped: 'not approved' });

  if (body.preview) return new Response(emailHTML(s, ''), { headers: { 'Content-Type': 'text/html; charset=utf-8', ...cors } });

  if (body.resend) {
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: isAdmin } = await asUser.rpc('sp_is_admin');
    if (!isAdmin) return json({ ok: false, error: 'admins only' }, 403);
  } else if (s.approved_email_at) {
    return json({ ok: true, skipped: 'already sent' });
  }

  const { data: c } = await admin.from('sp_contacts').select('email, name').eq('sukkah_id', s.id).maybeSingle();
  if (!c?.email) return json({ ok: false, error: 'no submitter email' }, body.resend ? 422 : 200);
  const mail = await mailConfig(admin);
  if (!mail.key) return json({ ok: false, error: 'Resend API key is not set yet' }, body.resend ? 424 : 200);

  // Claim it first so two quick triggers can't both send.
  if (!body.resend) {
    const { data: claimed } = await admin.from('sp_sukkahs').update({ approved_email_at: new Date().toISOString() })
      .eq('id', s.id).is('approved_email_at', null).select('id');
    if (!claimed?.length) return json({ ok: true, skipped: 'already sent' });
  }

  const { data: key } = await admin.rpc('sp_add_key', { sid: s.id });
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${mail.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: mail.from, to: [c.email], subject: `Your sukkah is live: ${s.title}`, html: emailHTML(s, key ?? '') }),
  });
  if (!r.ok) {
    const err = await r.text();
    if (!body.resend) await admin.from('sp_sukkahs').update({ approved_email_at: null }).eq('id', s.id); // let an admin retry
    return json({ ok: false, error: err }, 502);
  }
  if (body.resend) await admin.from('sp_sukkahs').update({ approved_email_at: new Date().toISOString() }).eq('id', s.id);
  return json({ ok: true, to: c.email });
});
