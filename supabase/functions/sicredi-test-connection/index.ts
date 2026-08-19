import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { proxyUrl, proxyToken, clientId, clientSecret, environment } = await req.json();
    if (!proxyUrl || !clientId || !clientSecret) {
      return json({ success: false, message: 'proxyUrl, clientId e clientSecret são obrigatórios' }, 400);
    }

    const url = proxyUrl.replace(/\/$/, '') + '/health';
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${proxyToken ?? ''}`,
      },
      body: JSON.stringify({ clientId, clientSecret, environment: environment || 'sandbox' }),
    });

    const body = await r.text();
    if (!r.ok) {
      return json({ success: false, message: `Proxy respondeu ${r.status}`, details: body }, 200);
    }

    const data = JSON.parse(body);
    if (data?.access_token) {
      return json({ success: true, message: 'Token OAuth obtido com sucesso via proxy mTLS' });
    }
    return json({ success: false, message: data?.message || 'Proxy retornou resposta inesperada', details: body });
  } catch (e) {
    return json({ success: false, message: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}