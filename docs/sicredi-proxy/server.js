import express from 'express';
import https from 'node:https';
import fs from 'node:fs';
import fetch from 'node-fetch';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const PROXY_TOKEN = process.env.PROXY_TOKEN;
const CERT = process.env.SICREDI_CERT_PATH && fs.readFileSync(process.env.SICREDI_CERT_PATH);
const KEY = process.env.SICREDI_KEY_PATH && fs.readFileSync(process.env.SICREDI_KEY_PATH);
const CA = process.env.SICREDI_CA_PATH && fs.readFileSync(process.env.SICREDI_CA_PATH);

const BASE = {
  sandbox: process.env.SICREDI_API_SANDBOX || 'https://api-pix-h.sicredi.com.br',
  production: process.env.SICREDI_API_PRODUCTION || 'https://api-pix.sicredi.com.br',
};

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  if (!PROXY_TOKEN || h !== `Bearer ${PROXY_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function agent() {
  if (!CERT || !KEY) throw new Error('Certificado Sicredi não configurado');
  return new https.Agent({ cert: CERT, key: KEY, ca: CA, rejectUnauthorized: true });
}

async function oauth({ clientId, clientSecret, environment }) {
  const base = BASE[environment || 'sandbox'];
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const r = await fetch(`${base}/oauth/token`, {
    method: 'POST',
    agent: agent(),
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=cob.write cob.read pix.read pix.write',
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`OAuth ${r.status}: ${body}`);
  return JSON.parse(body);
}

app.post('/health', auth, async (req, res) => {
  try {
    const tk = await oauth(req.body);
    res.json({ ok: true, access_token: tk.access_token, expires_in: tk.expires_in });
  } catch (e) {
    res.status(200).json({ ok: false, message: e.message });
  }
});

app.post('/pix/cob', auth, async (req, res) => {
  try {
    const { clientId, clientSecret, environment, payload } = req.body;
    const tk = await oauth({ clientId, clientSecret, environment });
    const base = BASE[environment || 'sandbox'];
    const r = await fetch(`${base}/api/v2/cob`, {
      method: 'POST',
      agent: agent(),
      headers: {
        Authorization: `Bearer ${tk.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    // pega o QRCode
    if (data.location) {
      const qr = await fetch(`${base}/api/v2/loc/${data.loc.id}/qrcode`, {
        agent: agent(),
        headers: { Authorization: `Bearer ${tk.access_token}` },
      });
      const qrData = await qr.json();
      data.qrcode = qrData.qrcode;
      data.imagemQrcode = qrData.imagemQrcode;
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/pix/cob/:txid', auth, async (req, res) => {
  try {
    const { clientId, clientSecret, environment } = req.body;
    const tk = await oauth({ clientId, clientSecret, environment });
    const base = BASE[environment || 'sandbox'];
    const r = await fetch(`${base}/api/v2/cob/${req.params.txid}`, {
      agent: agent(),
      headers: { Authorization: `Bearer ${tk.access_token}` },
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/card/charge', auth, async (req, res) => {
  // Sicredi cartão: adapte a URL e o payload conforme sua contratação.
  res.status(501).json({ error: 'Endpoint de cartão: adapte para sua API contratada com a Sicredi' });
});

app.listen(PORT, () => console.log(`Sicredi proxy on :${PORT}`));