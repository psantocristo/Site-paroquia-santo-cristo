import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const payload = await req.json();
    // Formato Sicredi PIX: { pix: [{ endToEndId, txid, valor, horario, ... }] }
    const events = payload?.pix ?? [payload];

    for (const ev of events) {
      if (!ev?.txid) continue;
      const { data: donation } = await supabase
        .from('campaign_donations')
        .select('*')
        .eq('txid', ev.txid)
        .maybeSingle();
      if (!donation || donation.status === 'paid') continue;

      await supabase.from('campaign_donations').update({
        status: 'paid',
        paid_at: ev.horario ?? new Date().toISOString(),
        end_to_end_id: ev.endToEndId ?? null,
        provider_response: ev,
      }).eq('id', donation.id);

      await supabase.rpc('increment_campaign_amount', {
        campaign_id: donation.campaign_id,
        increment_value: donation.amount,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});