-- Create video testimonials table
CREATE TABLE public.video_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  video_type TEXT NOT NULL DEFAULT 'upload', -- 'upload' or 'youtube'
  video_url TEXT,
  cloudinary_public_id TEXT,
  youtube_id TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read active testimonials
CREATE POLICY "Public can read active testimonials"
ON public.video_testimonials
FOR SELECT
USING (is_active = true);

-- Authenticated users can manage testimonials
CREATE POLICY "Authenticated users can manage testimonials"
ON public.video_testimonials
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_video_testimonials_updated_at
BEFORE UPDATE ON public.video_testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();