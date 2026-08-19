-- Add provider column to identify the gateway type (mercadopago or userede)
-- This allows multiple payment gateway configurations

-- First, let's modify the payment_settings table to support multiple providers
ALTER TABLE payment_settings 
ADD COLUMN IF NOT EXISTS webhook_url text,
ADD COLUMN IF NOT EXISTS environment text DEFAULT 'production';

-- Add a unique constraint on provider to ensure only one config per provider
-- Drop the old constraint if it exists and add the new one
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_settings_provider_key'
    ) THEN
        ALTER TABLE payment_settings ADD CONSTRAINT payment_settings_provider_key UNIQUE (provider);
    END IF;
END $$;

-- Create a comment to document the table
COMMENT ON TABLE payment_settings IS 'Stores configuration for multiple payment gateways. Only one can be active at a time.';