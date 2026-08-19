-- =====================================================
-- BACKUP COMPLETO DO SCHEMA DO BANCO DE DADOS
-- Paróquia Senhor Santo Cristo dos Milagres
-- Data: 2025-01-13
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Não há enums customizados no schema atual

-- =====================================================
-- TABELAS
-- =====================================================

-- Tabela: parishes
CREATE TABLE IF NOT EXISTS public.parishes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  history text NOT NULL DEFAULT ''::text,
  address text DEFAULT ''::text,
  email text DEFAULT ''::text,
  phone text DEFAULT ''::text,
  whatsapp_phone text,
  landline_phone text,
  founded_year integer DEFAULT 1984,
  logo_url text,
  cloudinary_public_id text,
  confession_hours text,
  office_hours text,
  spiritual_direction_hours text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: priests
CREATE TABLE IF NOT EXISTS public.priests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  title text NOT NULL DEFAULT 'Pároco'::text,
  short_bio text NOT NULL DEFAULT ''::text,
  full_bio text NOT NULL DEFAULT ''::text,
  photo_url text,
  cloudinary_public_id text,
  video_url text,
  video_thumbnail_url text,
  video_description text,
  ordination_year integer,
  parish_since integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: slides
CREATE TABLE IF NOT EXISTS public.slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  image_url text NOT NULL DEFAULT ''::text,
  cloudinary_public_id text,
  button_text text,
  button_link text,
  button_link_type text,
  button_open_new_tab text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela: timeline_events
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year integer NOT NULL DEFAULT 1984,
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  image_url text,
  cloudinary_public_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela: photo_albums
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  description text DEFAULT ''::text,
  cover_image_url text,
  cloudinary_public_id text,
  slug text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: photos
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  description text,
  image_url text NOT NULL DEFAULT ''::text,
  cloudinary_public_id text,
  category text NOT NULL DEFAULT 'community'::text,
  album_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela: schedules
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week text NOT NULL DEFAULT 'sunday'::text,
  time text NOT NULL DEFAULT ''::text,
  description text DEFAULT ''::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela: celebrations
CREATE TABLE IF NOT EXISTS public.celebrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week text NOT NULL DEFAULT 'sunday'::text,
  time text NOT NULL DEFAULT ''::text,
  celebration_type text NOT NULL DEFAULT 'Missa'::text,
  community_name text NOT NULL DEFAULT ''::text,
  celebrant_name text NOT NULL DEFAULT ''::text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: pastorals
CREATE TABLE IF NOT EXISTS public.pastorals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  coordinator text NOT NULL DEFAULT ''::text,
  contact_phone text DEFAULT ''::text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  slug text,
  excerpt text DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  author text NOT NULL DEFAULT 'Administrador'::text,
  featured_image text,
  cloudinary_public_id text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  slug text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  goal_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  featured_image text,
  cloudinary_public_id text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: campaign_donations
CREATE TABLE IF NOT EXISTS public.campaign_donations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  donor_phone text,
  amount numeric NOT NULL,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending'::text,
  payment_id text,
  payment_type text,
  mercadopago_preference_id text,
  mercadopago_payment_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: parish_announcements
CREATE TABLE IF NOT EXISTS public.parish_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  slug text,
  content text NOT NULL DEFAULT ''::text,
  type text NOT NULL DEFAULT 'announcement'::text,
  flyer_url text,
  event_date timestamp with time zone,
  whatsapp_contact text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: programs
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  featured_image text,
  time text NOT NULL,
  days_of_week jsonb DEFAULT '[]'::jsonb,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: video_testimonials
CREATE TABLE IF NOT EXISTS public.video_testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  video_type text NOT NULL DEFAULT 'upload'::text,
  video_url text,
  youtube_id text,
  thumbnail_url text,
  cloudinary_public_id text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: urgent_popups
CREATE TABLE IF NOT EXISTS public.urgent_popups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  image_url text,
  cloudinary_public_id text,
  link_url text,
  link_text text DEFAULT 'Saiba mais'::text,
  priority integer DEFAULT 1,
  auto_close_seconds integer DEFAULT 10,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: payment_settings
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'infinitypay'::text,
  api_key text NOT NULL,
  public_key text,
  client_id text,
  client_secret text,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: mercadopago_webhooks
CREATE TABLE IF NOT EXISTS public.mercadopago_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id text,
  type text NOT NULL,
  action text NOT NULL,
  api_version text,
  date_created timestamp with time zone,
  user_id text,
  data jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  logo_url text,
  logo_alt text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela: system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  value text NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- FUNÇÕES
-- =====================================================

-- Função: generate_slug
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  slug TEXT;
BEGIN
  -- Converte para minúsculas, remove caracteres especiais e substitui espaços por hífens
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Garante que não é vazio
  IF slug = '' THEN
    slug := 'post-' || extract(epoch from now())::text;
  END IF;
  
  RETURN slug;
END;
$function$;

-- Função: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Função: update_celebrations_updated_at
CREATE OR REPLACE FUNCTION public.update_celebrations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Função: update_mercadopago_webhooks_updated_at
CREATE OR REPLACE FUNCTION public.update_mercadopago_webhooks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: set_blog_post_slug
CREATE OR REPLACE FUNCTION public.set_blog_post_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate slug if it's empty or null
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE slug = final_slug 
      AND id != COALESCE(NEW.id, '')
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Função: set_campaign_slug
CREATE OR REPLACE FUNCTION public.set_campaign_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
$function$;

-- Função: set_photo_album_slug
CREATE OR REPLACE FUNCTION public.set_photo_album_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.name);
    final_slug := base_slug;

    WHILE EXISTS (
      SELECT 1 FROM photo_albums
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
$function$;

-- Função: set_parish_announcement_slug
CREATE OR REPLACE FUNCTION public.set_parish_announcement_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  exists_conflict BOOLEAN;
BEGIN
  -- If slug is NULL/empty, generate from title
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;

    LOOP
      IF TG_OP = 'UPDATE' AND NEW.id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM parish_announcements
          WHERE slug = final_slug AND id <> NEW.id
        ) INTO exists_conflict;
      ELSE
        SELECT EXISTS(
          SELECT 1 FROM parish_announcements
          WHERE slug = final_slug
        ) INTO exists_conflict;
      END IF;

      EXIT WHEN NOT exists_conflict;

      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;

  -- If user supplied a slug, clean it
  ELSE
    NEW.slug := generate_slug(NEW.slug);
  END IF;

  RETURN NEW;
END;
$function$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_parishes_updated_at
  BEFORE UPDATE ON public.parishes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_priests_updated_at
  BEFORE UPDATE ON public.priests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photo_albums_updated_at
  BEFORE UPDATE ON public.photo_albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_celebrations_updated_at
  BEFORE UPDATE ON public.celebrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_celebrations_updated_at();

CREATE TRIGGER update_pastorals_updated_at
  BEFORE UPDATE ON public.pastorals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_donations_updated_at
  BEFORE UPDATE ON public.campaign_donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parish_announcements_updated_at
  BEFORE UPDATE ON public.parish_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_testimonials_updated_at
  BEFORE UPDATE ON public.video_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_urgent_popups_updated_at
  BEFORE UPDATE ON public.urgent_popups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mercadopago_webhooks_updated_at
  BEFORE UPDATE ON public.mercadopago_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mercadopago_webhooks_updated_at();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers para slugs
CREATE TRIGGER set_blog_post_slug_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_blog_post_slug();

CREATE TRIGGER set_campaign_slug_trigger
  BEFORE INSERT OR UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_campaign_slug();

CREATE TRIGGER set_photo_album_slug_trigger
  BEFORE INSERT OR UPDATE ON public.photo_albums
  FOR EACH ROW
  EXECUTE FUNCTION public.set_photo_album_slug();

CREATE TRIGGER set_parish_announcement_slug_trigger
  BEFORE INSERT OR UPDATE ON public.parish_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_parish_announcement_slug();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastorals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parish_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgent_popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercadopago_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para parishes
CREATE POLICY "Public can read parishes" ON public.parishes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage parishes" ON public.parishes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para priests
CREATE POLICY "Public can read active priests" ON public.priests FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage priests" ON public.priests FOR ALL USING (true) WITH CHECK (true);

-- Políticas para slides
CREATE POLICY "Public can read active slides" ON public.slides FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage slides" ON public.slides FOR ALL USING (true) WITH CHECK (true);

-- Políticas para timeline_events
CREATE POLICY "Public can read timeline events" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage timeline events" ON public.timeline_events FOR ALL USING (true) WITH CHECK (true);

-- Políticas para photo_albums
CREATE POLICY "Public can read active albums" ON public.photo_albums FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage albums" ON public.photo_albums FOR ALL USING (true) WITH CHECK (true);

-- Políticas para photos
CREATE POLICY "Public can read photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage photos" ON public.photos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para schedules
CREATE POLICY "Public can read active schedules" ON public.schedules FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);

-- Políticas para celebrations
CREATE POLICY "Public can read active celebrations" ON public.celebrations FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage celebrations" ON public.celebrations FOR ALL USING (true) WITH CHECK (true);

-- Políticas para pastorals
CREATE POLICY "Public can read active pastorals" ON public.pastorals FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage pastorals" ON public.pastorals FOR ALL USING (true) WITH CHECK (true);

-- Políticas para blog_posts
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can manage blog posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Políticas para campaigns
CREATE POLICY "Public can read published campaigns" ON public.campaigns FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can manage campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);

-- Políticas para campaign_donations
CREATE POLICY "Authenticated users can view all donations" ON public.campaign_donations FOR SELECT USING (true);
CREATE POLICY "Anyone can create donations" ON public.campaign_donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update donations" ON public.campaign_donations FOR UPDATE USING (true);

-- Políticas para parish_announcements
CREATE POLICY "Public can read published announcements" ON public.parish_announcements FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can manage announcements" ON public.parish_announcements FOR ALL USING (true) WITH CHECK (true);

-- Políticas para programs
CREATE POLICY "Anyone can view active programs" ON public.programs FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert programs" ON public.programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update programs" ON public.programs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete programs" ON public.programs FOR DELETE USING (true);

-- Políticas para video_testimonials
CREATE POLICY "Public can read active testimonials" ON public.video_testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage testimonials" ON public.video_testimonials FOR ALL USING (true) WITH CHECK (true);

-- Políticas para urgent_popups
CREATE POLICY "Public can read active urgent popups" ON public.urgent_popups FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active popups" ON public.urgent_popups FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage urgent popups" ON public.urgent_popups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage popups" ON public.urgent_popups FOR ALL USING (true) WITH CHECK (true);

-- Políticas para payment_settings
CREATE POLICY "Authenticated users can manage payment settings" ON public.payment_settings FOR ALL USING (true) WITH CHECK (true);

-- Políticas para mercadopago_webhooks
CREATE POLICY "Authenticated users can view webhooks" ON public.mercadopago_webhooks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert webhooks" ON public.mercadopago_webhooks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update webhooks" ON public.mercadopago_webhooks FOR UPDATE USING (true);

-- Políticas para site_settings
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update site settings" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete site settings" ON public.site_settings FOR DELETE USING (true);

-- Políticas para system_settings
CREATE POLICY "Authenticated users can manage settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Bucket: parish-photos (público)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('parish-photos', 'parish-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para parish-photos
CREATE POLICY "Public can view parish photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'parish-photos');

CREATE POLICY "Authenticated users can upload parish photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'parish-photos');

CREATE POLICY "Authenticated users can update parish photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'parish-photos');

CREATE POLICY "Authenticated users can delete parish photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'parish-photos');

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES
-- =====================================================

-- 1. Este arquivo contém apenas o SCHEMA do banco de dados
-- 2. Para fazer backup dos DADOS, use pg_dump:
--    pg_dump -h db.gjcmtlmyjaizibhbgiqp.supabase.co -U postgres -d postgres --data-only > backup-data.sql
--
-- 3. Para backup completo (schema + dados):
--    pg_dump -h db.gjcmtlmyjaizibhbgiqp.supabase.co -U postgres -d postgres > backup-completo.sql
--
-- 4. Certifique-se de configurar as variáveis de ambiente no novo servidor:
--    - SUPABASE_URL
--    - SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY
--    - MERCADOPAGO_ACCESS_TOKEN
--    - MERCADOPAGO_PUBLIC_KEY
--
-- 5. Edge Functions precisam ser redeployadas no novo servidor
--
-- 6. Configurações do Cloudinary também precisam ser recriadas
