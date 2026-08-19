-- Atualizar tabela de configurações de pagamento para Mercado Pago
ALTER TABLE payment_settings 
  DROP COLUMN IF EXISTS api_secret,
  ADD COLUMN IF NOT EXISTS public_key text,
  ADD COLUMN IF NOT EXISTS client_id text,
  ADD COLUMN IF NOT EXISTS client_secret text;

-- Atualizar provider padrão
UPDATE payment_settings SET provider = 'mercadopago' WHERE provider = 'infinitypay';

-- Atualizar tabela de doações para usar Mercado Pago
ALTER TABLE campaign_donations
  DROP COLUMN IF EXISTS infinitypay_transaction_id,
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id text,
  ADD COLUMN IF NOT EXISTS mercadopago_preference_id text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_type text;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_campaign_donations_mercadopago_payment 
  ON campaign_donations(mercadopago_payment_id);

-- Criar tabela para rastrear webhooks do Mercado Pago
CREATE TABLE IF NOT EXISTS mercadopago_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id text,
  action text NOT NULL,
  api_version text,
  data jsonb NOT NULL,
  date_created timestamp with time zone,
  type text NOT NULL,
  user_id text,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de webhooks
ALTER TABLE mercadopago_webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas para webhooks (somente autenticados podem ver)
CREATE POLICY "Authenticated users can view webhooks"
  ON mercadopago_webhooks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert webhooks"
  ON mercadopago_webhooks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update webhooks"
  ON mercadopago_webhooks FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_mercadopago_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mercadopago_webhooks_updated_at
  BEFORE UPDATE ON mercadopago_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_mercadopago_webhooks_updated_at();