import { supabase } from '../integrations/supabase/client';

// Gerar ou recuperar session ID
const getSessionId = (): string => {
  const SESSION_KEY = 'parish_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

// Registrar visualização de página
export const trackPageView = async (path: string, title?: string) => {
  try {
    const sessionId = getSessionId();
    
    // Obter informações do navegador de forma segura
    const referrer = document.referrer || null;
    const userAgent = navigator.userAgent || null;
    
    await supabase.from('page_views').insert({
      page_path: path,
      page_title: title || document.title,
      referrer,
      user_agent: userAgent,
      session_id: sessionId,
      ip_address: null // IP será registrado pelo servidor se necessário
    });
  } catch (error) {
    console.error('Erro ao registrar visita:', error);
    // Não mostrar erro ao usuário para não afetar a experiência
  }
};

// Limpar sessão antiga (chamado ao fechar a aba)
export const clearSession = () => {
  sessionStorage.removeItem('parish_session_id');
};
