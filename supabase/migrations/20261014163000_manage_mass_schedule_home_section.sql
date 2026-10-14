insert into public.home_sections (section_key, section_name, is_active, order_index)
values ('mass_schedule', 'Missas e atendimento paroquial', true, 3)
on conflict (section_key) do nothing;
