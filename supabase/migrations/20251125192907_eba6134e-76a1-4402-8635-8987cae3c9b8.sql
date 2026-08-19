-- Criar tabela para armazenar visitas
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);

-- Habilitar RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer pessoa crie visitas
CREATE POLICY "Anyone can create page views"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir que usuários autenticados leiam todas as visitas
CREATE POLICY "Authenticated users can read all page views"
  ON public.page_views
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Criar tabela para estatísticas agregadas (cache)
CREATE TABLE IF NOT EXISTS public.analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_views INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  top_pages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para a data
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON public.analytics_summary(date DESC);

-- Habilitar RLS
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados leiam estatísticas
CREATE POLICY "Authenticated users can read analytics summary"
  ON public.analytics_summary
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política para permitir que o sistema atualize estatísticas
CREATE POLICY "Service role can manage analytics summary"
  ON public.analytics_summary
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Função para atualizar estatísticas diárias (executada periodicamente)
CREATE OR REPLACE FUNCTION public.update_daily_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_date DATE := CURRENT_DATE;
  view_count INTEGER;
  session_count INTEGER;
  pages_data JSONB;
BEGIN
  -- Contar visitas do dia
  SELECT COUNT(*), COUNT(DISTINCT session_id)
  INTO view_count, session_count
  FROM page_views
  WHERE DATE(created_at) = target_date;

  -- Top páginas do dia
  SELECT jsonb_agg(
    jsonb_build_object(
      'path', page_path,
      'views', view_count
    )
  )
  INTO pages_data
  FROM (
    SELECT page_path, COUNT(*) as view_count
    FROM page_views
    WHERE DATE(created_at) = target_date
    GROUP BY page_path
    ORDER BY view_count DESC
    LIMIT 10
  ) top_pages;

  -- Inserir ou atualizar estatísticas
  INSERT INTO analytics_summary (date, total_views, unique_sessions, top_pages)
  VALUES (target_date, view_count, session_count, COALESCE(pages_data, '[]'::jsonb))
  ON CONFLICT (date)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_sessions = EXCLUDED.unique_sessions,
    top_pages = EXCLUDED.top_pages,
    updated_at = NOW();
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_analytics_summary_updated_at
  BEFORE UPDATE ON public.analytics_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.page_views IS 'Armazena cada visita individual ao site';
COMMENT ON TABLE public.analytics_summary IS 'Armazena estatísticas agregadas diárias para melhor performance';