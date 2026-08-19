-- Tabela de campanhas
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  goal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  featured_image TEXT,
  cloudinary_public_id TEXT,
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de doações
CREATE TABLE public.campaign_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  infinitypay_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de configurações do InfinityPay
CREATE TABLE public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'infinitypay',
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para campaigns
CREATE POLICY "Public can read published campaigns"
  ON public.campaigns
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage campaigns"
  ON public.campaigns
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para donations
CREATE POLICY "Anyone can create donations"
  ON public.campaign_donations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all donations"
  ON public.campaign_donations
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update donations"
  ON public.campaign_donations
  FOR UPDATE
  USING (true);

-- Políticas para payment_settings
CREATE POLICY "Authenticated users can manage payment settings"
  ON public.payment_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para gerar slug automático
CREATE OR REPLACE FUNCTION public.set_campaign_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;

    WHILE EXISTS (
      SELECT 1 FROM campaigns
      WHERE slug = final_slug
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_campaign_slug_trigger
  BEFORE INSERT OR UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_campaign_slug();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.campaign_donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();