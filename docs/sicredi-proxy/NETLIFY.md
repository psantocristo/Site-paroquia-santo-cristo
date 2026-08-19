# Proxy mTLS Sicredi hospedado no próprio Netlify

Se você já publica o site no Netlify, não precisa contratar Railway/Fly/VPS.
A função `netlify/functions/sicredi-proxy.mjs` roda em Node.js (AWS Lambda)
e suporta anexar o certificado mTLS emitido pela Sicredi.

## 1. Prepare o certificado

Você vai receber da Sicredi:

- `cert.pem` (ou `.crt`) — certificado do cliente
- `key.pem` — chave privada
- `ca.pem` — cadeia da autoridade certificadora (opcional em produção)

Converta cada arquivo em **base64 numa única linha** (o Netlify aceita valores
longos em env vars):

```
base64 -w0 cert.pem   # Linux
base64 -i cert.pem    # macOS
```

## 2. Configure as variáveis no Netlify

Vá em **Site settings → Environment variables** e adicione:

| Nome                     | Valor                                  |
| ------------------------ | -------------------------------------- |
| `SICREDI_CERT_BASE64`    | Conteúdo base64 do `cert.pem`          |
| `SICREDI_KEY_BASE64`     | Conteúdo base64 do `key.pem`           |
| `SICREDI_CA_BASE64`      | (Opcional) base64 do `ca.pem`          |
| `SICREDI_PROXY_TOKEN`    | Token forte que o Supabase vai enviar  |
| `SICREDI_API_SANDBOX`    | (Opcional) override do endpoint sandbox|
| `SICREDI_API_PRODUCTION` | (Opcional) override do endpoint prod   |

> ⚠️ Marque **Contains secret values** ao criar `SICREDI_*_BASE64` e o token.

## 3. Publique o site

Após o próximo deploy, o proxy fica disponível em:

```
https://<seu-site>.netlify.app/proxy/sicredi/health
https://<seu-site>.netlify.app/proxy/sicredi/pix/cob
https://<seu-site>.netlify.app/proxy/sicredi/pix/cob/<txid>
```

## 4. Configure no admin

Em **Admin → Pagamentos**:

- **URL do proxy**: `https://<seu-site>.netlify.app/proxy/sicredi`
- **Token de acesso ao proxy**: o mesmo valor de `SICREDI_PROXY_TOKEN`

Clique em **Testar Conexão**. Se retornar `ok: true`, ative o gateway.

## Como funciona

O Supabase Edge Function `sicredi-create-pix` chama
`POST /proxy/sicredi/pix/cob` com `Authorization: Bearer <SICREDI_PROXY_TOKEN>`.
A Netlify Function decodifica os certificados, faz OAuth `client_credentials`
na Sicredi via `https.request` com `https.Agent({ cert, key, ca })`, cria a
cobrança PIX, busca o QR Code e devolve o JSON para o Supabase salvar.

Netlify Edge Functions **não** funcionam para isso (rodam em Deno Deploy sem
suporte a mTLS). Use apenas Netlify Functions (Node), que é o que este arquivo
configura.