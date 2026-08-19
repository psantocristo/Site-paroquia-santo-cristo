# Proxy mTLS Sicredi

A API PIX oficial da Sicredi (padrão Bacen) exige autenticação mútua TLS com
certificado digital emitido pela cooperativa. Como as Supabase Edge Functions
não suportam anexar certificados cliente em `fetch`, você precisa hospedar
este pequeno servidor Node.js em uma máquina própria (Railway, Fly.io, VPS,
Render ou um droplet).

## O que ele faz

- Recebe chamadas autenticadas por Bearer token do seu backend Supabase.
- Anexa o certificado `.pem` da Sicredi em cada requisição HTTPS.
- Faz OAuth `client_credentials` e chama os endpoints PIX/Cartão.
- Devolve a resposta bruta para o Supabase persistir.

## Endpoints expostos

| Método | Path              | Uso                                    |
| ------ | ----------------- | -------------------------------------- |
| POST   | `/health`         | Testa OAuth (usado no botão "Testar")  |
| POST   | `/pix/cob`        | Cria cobrança PIX imediata             |
| POST   | `/pix/cob/:txid`  | Consulta status da cobrança            |
| POST   | `/card/charge`    | Cobrança via cartão de crédito         |

Todos exigem o header `Authorization: Bearer <PROXY_TOKEN>` — o mesmo token
configurado em **Admin → Pagamentos → Token de acesso ao proxy**.

## Variáveis de ambiente

```
PORT=3000
PROXY_TOKEN=um-token-forte-e-aleatorio
SICREDI_CERT_PATH=/etc/sicredi/cert.pem
SICREDI_KEY_PATH=/etc/sicredi/key.pem
SICREDI_CA_PATH=/etc/sicredi/ca.pem
SICREDI_API_SANDBOX=https://api-pix-h.sicredi.com.br
SICREDI_API_PRODUCTION=https://api-pix.sicredi.com.br
```

## Deploy rápido (Railway/Fly)

```
cd docs/sicredi-proxy
npm install
node server.js
```

Faça o upload do certificado como *secret file* na plataforma e ajuste os
caminhos `SICREDI_*_PATH`. Depois cole a URL pública gerada em
**Admin → Pagamentos → URL do proxy**.

## Segurança

- Restrinja o firewall para aceitar apenas chamadas do domínio do Supabase.
- Rotacione o `PROXY_TOKEN` periodicamente.
- Nunca coloque o certificado da Sicredi em repositório Git.