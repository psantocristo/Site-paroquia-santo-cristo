-- 1. Drop old Rede tables completely
DROP TABLE IF EXISTS public.campaign_donations CASCADE;
DROP TABLE IF EXISTS public.payment_settings CASCADE;

-- 2. Reset campaign totals (data is gone)
UPDATE public.campaigns SET current_amount = 0;

-- 3. New payment_settings for Sicredi
CREATE TABLE public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'sicredi',
  environment TEXT NOT NULL DEFAULT 'sandbox', -- 'sandbox' | 'production'
  client_id TEXT,
  client_secret TEXT,
  pix_key TEXT,
  pix_key_type TEXT, -- 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  beneficiary_name TEXT,
  beneficiary_city TEXT,
  proxy_url TEXT,        -- URL do proxy mTLS externo (ex: https://sicredi-proxy.paroquia.com)
  proxy_token TEXT,      -- Bearer token compartilhado com o proxy
  webhook_secret TEXT,   -- assinatura HMAC opcional
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage payment_settings"
  ON public.payment_settings FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_payment_settings_updated
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. New campaign_donations for Sicredi
CREATE TABLE public.campaign_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  payment_method TEXT NOT NULL DEFAULT 'pix', -- 'pix' | 'credit_card'
  status TEXT NOT NULL DEFAULT 'pending',    -- 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'
  -- Sicredi PIX identifiers
  txid TEXT UNIQUE,              -- txid gerado (26-35 chars)
  end_to_end_id TEXT,            -- E2E id do Bacen quando pago
  qr_code TEXT,                  -- payload copia-e-cola
  qr_code_image TEXT,            -- base64 PNG do QR
  pix_expiration TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  -- Card fields (optional, for future card via same proxy)
  card_last4 TEXT,
  card_brand TEXT,
  installments INT,
  authorization_code TEXT,
  -- Raw
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.campaign_donations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_donations TO authenticated;
GRANT ALL ON public.campaign_donations TO service_role;

ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create donations"
  ON public.campaign_donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read own donation by id"
  ON public.campaign_donations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update donation status (webhook context)"
  ON public.campaign_donations FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX idx_donations_txid ON public.campaign_donations(txid);
CREATE INDEX idx_donations_campaign ON public.campaign_donations(campaign_id);
CREATE INDEX idx_donations_status ON public.campaign_donations(status);

CREATE TRIGGER trg_donations_updated
  BEFORE UPDATE ON public.campaign_donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();