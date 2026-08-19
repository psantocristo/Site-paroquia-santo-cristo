import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { campaignId, amount, donorName, donorEmail, donorPhone } = await req.json();
    if (!campaignId || !amount || !donorName) {
      return json({ error: 'campaignId, amount e donorName são obrigatórios' }, 400);
    }
    if (amount < 1) return json({ error: 'Valor mínimo é R$ 1,00' }, 400);

    const { data: cfg, error: cfgErr } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('provider', 'sicredi')
      .eq('is_active', true)
      .maybeSingle();

    if (cfgErr || !cfg) return json({ error: 'Gateway Sicredi não está ativo' }, 400);
    if (!cfg.proxy_url || !cfg.client_id || !cfg.client_secret || !cfg.pix_key) {
      return json({ error: 'Configuração incompleta do Sicredi' }, 400);
    }

    // Cria registro pendente da doação
    const { data: donation, error: dErr } = await supabase
      .from('campaign_donations')
      .insert({
        campaign_id: campaignId,
        amount,
        donor_name: donorName,
        donor_email: donorEmail ?? null,
        donor_phone: donorPhone ?? null,
        payment_method: 'pix',
        status: 'pending',
      })
      .select()
      .single();
    if (dErr) return json({ error: dErr.message }, 500);

    // Chama o proxy mTLS
    const proxyResp = await fetch(cfg.proxy_url.replace(/\/$/, '') + '/pix/cob', {
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
          calendario: { expiracao: 3600 },
          valor: { original: Number(amount).toFixed(2) },
          chave: cfg.pix_key,
          solicitacaoPagador: `Doação - ${donorName}`,
          infoAdicionais: [
            { nome: 'donation_id', valor: donation.id },
            { nome: 'campaign_id', valor: campaignId },
          ],
        },
      }),
    });

    const proxyBody = await proxyResp.text();
    if (!proxyResp.ok) {
      await supabase.from('campaign_donations').update({
        status: 'failed',
        provider_response: { error: proxyBody, status: proxyResp.status },
      }).eq('id', donation.id);
      return json({ error: 'Falha ao gerar PIX', status: proxyResp.status, details: proxyBody }, 502);
    }

    const proxyData = JSON.parse(proxyBody);
    // Esperado: { txid, qrcode, imagemQrcode, expiracao }
    const expiration = proxyData.expiracao
      ? new Date(Date.now() + Number(proxyData.expiracao) * 1000).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    await supabase.from('campaign_donations').update({
      txid: proxyData.txid,
      qr_code: proxyData.qrcode || proxyData.pixCopiaECola,
      qr_code_image: proxyData.imagemQrcode,
      pix_expiration: expiration,
      provider_response: proxyData,
    }).eq('id', donation.id);

    return json({
      donationId: donation.id,
      pixData: {
        copyPasteCode: proxyData.qrcode || proxyData.pixCopiaECola,
        qrCodeBase64: (proxyData.imagemQrcode || '').replace(/^data:image\/png;base64,/, ''),
        expirationDate: expiration,
      },
    });
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