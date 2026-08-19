import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const {
      campaignId, amount, donorName, donorEmail, donorPhone,
      cardNumber, cardholderName, expirationMonth, expirationYear,
      securityCode, cpf, installments,
    } = body;

    if (!campaignId || !amount || !cardNumber || !securityCode) {
      return json({ error: 'Dados do cartão incompletos' }, 400);
    }

    const { data: cfg } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('provider', 'sicredi')
      .eq('is_active', true)
      .maybeSingle();
    if (!cfg?.proxy_url) return json({ error: 'Gateway Sicredi não configurado' }, 400);

    const { data: donation, error: dErr } = await supabase
      .from('campaign_donations')
      .insert({
        campaign_id: campaignId,
        amount,
        donor_name: donorName,
        donor_email: donorEmail ?? null,
        donor_phone: donorPhone ?? null,
        donor_document: cpf,
        payment_method: 'credit_card',
        card_last4: String(cardNumber).slice(-4),
        installments: installments || 1,
        status: 'pending',
      })
      .select()
      .single();
    if (dErr) return json({ error: dErr.message }, 500);

    const r = await fetch(cfg.proxy_url.replace(/\/$/, '') + '/card/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.proxy_token ?? ''}`,
      },
      body: JSON.stringify({
        clientId: cfg.client_id,
        clientSecret: cfg.client_secret,
        environment: cfg.environment || 'sandbox',
        payload: {
          amount: Math.round(Number(amount) * 100),
          installments: installments || 1,
          card: {
            number: String(cardNumber).replace(/\s/g, ''),
            holder: cardholderName,
            expMonth: expirationMonth,
            expYear: expirationYear,
            cvv: securityCode,
          },
          holder: { name: donorName, document: cpf, email: donorEmail },
          reference: donation.id,
        },
      }),
    });

    const text = await r.text();
    if (!r.ok) {
      await supabase.from('campaign_donations').update({
        status: 'failed',
        provider_response: { error: text, status: r.status },
      }).eq('id', donation.id);
      return json({ success: false, message: `Falha (${r.status})`, details: text }, 200);
    }

    const data = JSON.parse(text);
    const approved = data?.status === 'APPROVED' || data?.status === 'approved';

    await supabase.from('campaign_donations').update({
      status: approved ? 'paid' : 'failed',
      paid_at: approved ? new Date().toISOString() : null,
      txid: data?.transactionId ?? data?.id ?? null,
      authorization_code: data?.authorizationCode ?? null,
      card_brand: data?.brand ?? null,
      provider_response: data,
    }).eq('id', donation.id);

    if (approved) {
      await supabase.rpc('increment_campaign_amount', {
        campaign_id: campaignId,
        increment_value: amount,
      });
    }

    return json({
      success: approved,
      donationId: donation.id,
      message: data?.message ?? (approved ? 'Aprovado' : 'Recusado'),
    });
  } catch (e) {
    return json({ success: false, error: (e as Error).message }, 500);
  }
});

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), {
    status: s,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}