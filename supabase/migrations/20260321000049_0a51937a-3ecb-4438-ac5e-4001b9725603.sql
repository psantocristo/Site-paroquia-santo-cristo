INSERT INTO public.home_sections (section_key, section_name, is_active, order_index)
VALUES ('programs', 'Programações', true, 6)
ON CONFLICT (section_key) DO NOTHING;