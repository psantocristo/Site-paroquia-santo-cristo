import https from 'node:https';

export const config = {
  path: [
    '/proxy/sicredi/health',
    '/proxy/sicredi/pix/cob',
    '/proxy/sicredi/pix/cob/:txid',
    '/proxy/sicredi/card/charge',
  ],
};

const BASE = {
  sandbox: process.env.SICREDI_API_SANDBOX || 'https://api-pix-h.sicredi.com.br',
  production: process.env.SICREDI_API_PRODUCTION || 'https://api-pix.sicredi.com.br',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

function decode(b64) {
  if (!b64) return null;
  return Buffer.from(b64, 'base64');
}

function loadCerts() {
  const cert = decode(process.env.SICREDI_CERT_BASE64);
  const key = decode(process.env.SICREDI_KEY_BASE64);
  const ca = decode(process.env.SICREDI_CA_BASE64);
  if (!cert || !key) {
    throw new Error('Certificado Sicredi não configurado (defina SICREDI_CERT_BASE64 e SICREDI_KEY_BASE64 no Netlify).');
  }
  return { cert, key, ca };
}

function agent() {
  const { cert, key, ca } = loadCerts();
  return new https.Agent({ cert, key, ca, rejectUnauthorized: true, keepAlive: false });
}

function mtlsRequest(url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        method,
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        headers,
        agent: agent(),
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode || 500, text });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function oauth({ clientId, clientSecret, environment }) {
  const base = BASE[environment || 'sandbox'];
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const r = await mtlsRequest(`${base}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=cob.write cob.read pix.read pix.write',
  });
  if (r.status < 200 || r.status >= 300) throw new Error(`OAuth ${r.status}: ${r.text}`);
  return JSON.parse(r.text);
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const auth = request.headers.get('authorization') || '';
  const expected = process.env.SICREDI_PROXY_TOKEN;
  if (!expected || auth !== `Bearer ${expected}`) {
    return json(401, { error: 'Unauthorized' });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/proxy\/sicredi/, '');
  let body = {};
  try { body = await request.json(); } catch {}

  try {
    if (path === '/health') {
      try {
        const tk = await oauth(body);
        return json(200, { ok: true, access_token: tk.access_token, expires_in: tk.expires_in });
      } catch (e) {
        return json(200, { ok: false, message: e.message });
      }
    }

    if (path === '/pix/cob') {
      const { clientId, clientSecret, environment, payload } = body;
      const tk = await oauth({ clientId, clientSecret, environment });
      const base = BASE[environment || 'sandbox'];
      const r = await mtlsRequest(`${base}/api/v2/cob`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tk.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = JSON.parse(r.text || '{}');
      if (r.status < 200 || r.status >= 300) return json(r.status, data);
      if (data.loc?.id) {
        const qr = await mtlsRequest(`${base}/api/v2/loc/${data.loc.id}/qrcode`, {
          headers: { Authorization: `Bearer ${tk.access_token}` },
        });
        try {
          const qrData = JSON.parse(qr.text);
          data.qrcode = qrData.qrcode;
          data.imagemQrcode = qrData.imagemQrcode;
        } catch {}
      }
      return json(200, data);
    }

    const cobMatch = path.match(/^\/pix\/cob\/([^/]+)$/);
    if (cobMatch) {
      const txid = cobMatch[1];
      const { clientId, clientSecret, environment } = body;
      const tk = await oauth({ clientId, clientSecret, environment });
      const base = BASE[environment || 'sandbox'];
      const r = await mtlsRequest(`${base}/api/v2/cob/${txid}`, {
        headers: { Authorization: `Bearer ${tk.access_token}` },
      });
      return json(r.status, JSON.parse(r.text || '{}'));
    }

    if (path === '/card/charge') {
      return json(501, { error: 'Endpoint de cartão: adapte para a API contratada com a Sicredi' });
    }

    return json(404, { error: 'Not found' });
  } catch (e) {
    return json(500, { error: e.message });
  }
};