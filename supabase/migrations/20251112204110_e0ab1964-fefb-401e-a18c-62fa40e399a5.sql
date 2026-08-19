-- Add video fields to priests table
ALTER TABLE priests 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS video_thumbnail_url text,
ADD COLUMN IF NOT EXISTS video_description text;