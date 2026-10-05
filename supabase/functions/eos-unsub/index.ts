// eos-unsub — one-click unsubscribe for the List-Unsubscribe header (Gmail / Apple Mail "Unsubscribe" button).
// Public on purpose: it only acts on a valid private token, and only adds that address to sp_email_suppress.
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('t') ?? '';
  // Only a POST (the mail app's one-click button) unsubscribes; a plain visit just opens the confirm page,
  // so link scanners that fetch URLs can't unsubscribe anyone.
  if (req.method === 'POST' && /^[a-f0-9]{32}$/.test(token)) {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.rpc('sp_eos_unsub', { p_token: token });
  }
  if (req.method === 'POST') return new Response('ok');
  return Response.redirect(`https://sukkahpin.com/#/unsub/${token}`, 302);
});
