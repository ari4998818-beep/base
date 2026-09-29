// notify-pending — emails the admins when a sukkah is waiting for approval.
// Called by the database (trigger sp_notify_pending → pg_net) with { id }, or by an
// admin from the site with { test: true } to check the setup.
//
// Mail settings come from Supabase Vault via sp_mail_config() (resend_api_key, notify_from);
// Edge Function secrets RESEND_API_KEY / NOTIFY_FROM override them if set.
// Optional secrets: NOTIFY_TO (comma-separated; default = everyone in sp_admins), SITE_URL.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE = (Deno.env.get('SITE_URL') ?? 'https://sukkahpin.com').replace(/\/$/, '');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const abs = (src?: string) => (!src ? '' : /^https?:/.test(src) ? src : `${SITE}/${src.replace(/^\//, '')}`);

// deno-lint-ignore no-explicit-any
async function mailConfig(admin: any) {
  const { data } = await admin.rpc('sp_mail_config');
  return {
    key: Deno.env.get('RESEND_API_KEY') || data?.key || '',
    from: Deno.env.get('NOTIFY_FROM') || data?.from || 'SukkahPin <onboarding@resend.dev>',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  let body: { id?: string; test?: boolean } = {};
  try { body = await req.json(); } catch { /* empty */ }

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  if (body.test) {
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: isAdmin } = await asUser.rpc('sp_is_admin');
    if (!isAdmin) return json({ ok: false, error: 'admins only' }, 403);
  } else if (!body.id) {
    return json({ ok: false, error: 'missing id' }, 400);
  }

  const mail = await mailConfig(admin);
  if (!mail.key) return json({ ok: false, error: 'Resend API key is not set yet' }, body.test ? 424 : 200);

  // deno-lint-ignore no-explicit-any
  let s: Record<string, any> | null = null;
  if (body.test) {
    const { data } = await admin.from('sp_sukkahs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    s = data;
  } else {
    const { data } = await admin.from('sp_sukkahs').select('*').eq('id', body.id).maybeSingle();
    s = data;
    if (!s || s.status !== 'pending') return json({ ok: true, skipped: 'not pending' });
    if (s.notified_at && Date.now() - Date.parse(s.notified_at) < 10 * 60e3) return json({ ok: true, skipped: 'already notified' });
  }

  const { data: c } = s ? await admin.from('sp_contacts').select('*').eq('sukkah_id', s.id).maybeSingle() : { data: null };
  let to = (Deno.env.get('NOTIFY_TO') ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!to.length) {
    const { data: admins } = await admin.from('sp_admins').select('email');
    to = (admins ?? []).map((a: { email: string }) => a.email);
  }
  if (!to.length) return json({ ok: false, error: 'no recipients' });

  const title = s?.title ?? 'Sample sukkah';
  const photos: { src: string }[] = s?.photos ?? [];
  const cover = abs((photos[s?.cover ?? 0] ?? photos[0])?.src);
  const review = `${SITE}/#/admin?tab=pending`;
  const visit = s?.visit?.open ? `Open to visitors · ${esc(s.visit.address)}${s.visit.times ? ` · ${esc(s.visit.times)}` : ''}` : '';
  const subject = `${body.test ? '[Test] ' : ''}New sukkah waiting: ${title}`;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#f6f5f1;font-family:Helvetica,Arial,sans-serif;color:#0b0b0b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:10px;overflow:hidden" cellpadding="0" cellspacing="0">
    <tr><td style="padding:22px 28px 0"><img src="${SITE}/brand/png/sukkahpin-logo.png" alt="SukkahPin" height="26" style="display:block;height:26px"></td></tr>
    <tr><td style="padding:18px 28px 6px"><span style="display:inline-block;background:#d8f23a;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:5px 9px">${body.test ? 'Test email' : 'Waiting for approval'}</span></td></tr>
    <tr><td style="padding:6px 28px 4px;font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1.1">${esc(title)}</td></tr>
    <tr><td style="padding:0 28px 16px;color:#6f6f69;font-size:15px">${esc(s?.location ?? '')}${s?.year ? ` · Sukkos ${s.year}` : ''} · ${photos.length} photo${photos.length === 1 ? '' : 's'}${s?.video?.url ? ' + video' : ''}</td></tr>
    ${cover ? `<tr><td><img src="${esc(cover)}" alt="" width="560" style="display:block;width:100%;max-height:360px;object-fit:cover"></td></tr>` : ''}
    <tr><td style="padding:20px 28px 4px;font-size:15px;line-height:1.5">${esc(s?.description ?? '')}</td></tr>
    ${visit ? `<tr><td style="padding:4px 28px;font-size:14px;color:#2b2b28">${visit}</td></tr>` : ''}
    <tr><td style="padding:14px 28px;font-size:14px;color:#2b2b28;line-height:1.6"><b>Submitted by</b> ${esc(c?.name ?? '—')}${c?.email ? ` · <a href="mailto:${esc(c.email)}" style="color:#0b0b0b">${esc(c.email)}</a>` : ''}${c?.phone ? ` · ${esc(c.phone)}` : ''}<br><b>Shown as</b> ${esc(s?.owner_name ?? '')}</td></tr>
    <tr><td style="padding:10px 28px 28px"><a href="${review}" style="display:inline-block;background:#0b0b0b;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 22px;border-radius:999px">Review in admin →</a></td></tr>
  </table>
  <p style="color:#9a9993;font-size:12px;margin:14px 0 0">You get this because you're a SukkahPin admin.</p>
  </td></tr></table></body></html>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${mail.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: mail.from, to, subject, html, ...(c?.email ? { reply_to: c.email } : {}) }),
  });
  if (!r.ok) return json({ ok: false, error: await r.text() }, 502);
  if (!body.test && s) await admin.from('sp_sukkahs').update({ notified_at: new Date().toISOString() }).eq('id', s.id);
  return json({ ok: true, sent: to.length });
});
