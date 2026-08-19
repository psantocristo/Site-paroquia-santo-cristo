-- Create home_sections table to manage homepage sections
CREATE TABLE public.home_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read active sections"
ON public.home_sections
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can manage sections"
ON public.home_sections
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default sections
INSERT INTO public.home_sections (section_key, section_name, is_active, order_index) VALUES
('hero', 'Banner Principal', true, 1),
('announcements', 'Eventos e Avisos', true, 2),
('history', 'Nossa História', true, 3),
('priest', 'Clero', true, 4),
('blog', 'Blog', true, 5),
('albums', 'Álbuns de Fotos', true, 6),
('priests_carousel', 'Galeria dos Padres', true, 7),
('contact', 'Contato', true, 8);