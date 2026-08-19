import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { donationId } = await req.json();
    if (!donationId) return json({ error: 'donationId obrigatório' }, 400);

    const { data: donation, error } = await supabase
      .from('campaign_donations')
      .select('*')
      .eq('id', donationId)
      .maybeSingle();
    if (error || !donation) return json({ error: 'Doação não encontrada' }, 404);

    // Se já confirmado no banco, responde direto
    if (donation.status === 'paid') return json({ status: 'paid', donation });
    if (!donation.txid) return json({ status: donation.status });

    const { data: cfg } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('provider', 'sicredi')
      .eq('is_active', true)
      .maybeSingle();
    if (!cfg?.proxy_url) return json({ status: donation.status });

    const r = await fetch(cfg.proxy_url.replace(/\/$/, '') + `/pix/cob/${donation.txid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.proxy_token ?? ''}`,
      },
      body: JSON.stringify({
        clientId: cfg.client_id,
        clientSecret: cfg.client_secret,
        environment: cfg.environment || 'sandbox',
      }),
    });

    if (!r.ok) return json({ status: donation.status });
    const data = await r.json();

    if (data?.status === 'CONCLUIDA') {
      const endToEnd = data?.pix?.[0]?.endToEndId ?? null;
      await supabase.from('campaign_donations').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        end_to_end_id: endToEnd,
      }).eq('id', donationId);
      await supabase.rpc('increment_campaign_amount', {
        campaign_id: donation.campaign_id,
        increment_value: donation.amount,
      });
      return json({ status: 'paid' });
    }

    return json({ status: donation.status, sicrediStatus: data?.status });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), {
    status: s,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}