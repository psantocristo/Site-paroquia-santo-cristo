-- Create documentation_procedures table
CREATE TABLE public.documentation_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documentation_procedures ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read active documentation procedures"
ON public.documentation_procedures
FOR SELECT
USING (is_active = true);

-- Create policies for authenticated users (admin)
CREATE POLICY "Authenticated users can manage documentation procedures"
ON public.documentation_procedures
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documentation_procedures_updated_at
BEFORE UPDATE ON public.documentation_procedures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();