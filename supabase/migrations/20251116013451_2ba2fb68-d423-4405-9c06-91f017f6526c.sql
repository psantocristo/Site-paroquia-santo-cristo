-- Remover colunas do Mercado Pago
ALTER TABLE campaign_donations 
DROP COLUMN IF EXISTS mercadopago_payment_id,
DROP COLUMN IF EXISTS mercadopago_preference_id;

-- Remover tabela de webhooks do Mercado Pago
DROP TABLE IF EXISTS mercadopago_webhooks;

-- Remover configurações do Mercado Pago
DELETE FROM payment_settings WHERE provider = 'mercadopago';