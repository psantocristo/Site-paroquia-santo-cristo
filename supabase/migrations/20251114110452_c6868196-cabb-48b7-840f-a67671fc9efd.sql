-- Add file attachment fields to documentation_procedures table
ALTER TABLE public.documentation_procedures
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT;