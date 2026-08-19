-- Create priests_gallery table for priest gallery feature
CREATE TABLE public.priests_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  was_parish_priest BOOLEAN DEFAULT false,
  date_at_parish TEXT,
  photo_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  video_thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.priests_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage
CREATE POLICY "Authenticated users can manage priests gallery"
ON public.priests_gallery
FOR ALL
USING (true)
WITH CHECK (true);

-- Create policy for public to read active entries
CREATE POLICY "Public can read active priests gallery"
ON public.priests_gallery
FOR SELECT
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_priests_gallery_updated_at
BEFORE UPDATE ON public.priests_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();