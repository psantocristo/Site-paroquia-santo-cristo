import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'lgpd_cookie_consent_v1';

type ConsentValue = 'accepted' | 'rejected';

export const getCookieConsent = (): ConsentValue | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'accepted' || v === 'rejected' ? v : null;
  } catch {
    return null;
  }
};

interface CookieConsentProps {
  onNavigate?: (section: 'privacy' | 'terms') => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onNavigate }) => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!getCookieConsent()) setVisible(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const setConsent = (value: ConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      localStorage.setItem(STORAGE_KEY + '_date', new Date().toISOString());
    } catch {
      /* ignore */
    }
    if (value === 'rejected') {
      try {
        // Disable Google Analytics
        (window as unknown as { [k: string]: unknown })['ga-disable-G-'] = true;
      } catch {
        /* ignore */
      }
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4 pb-safe"
          role="dialog"
          aria-label="Aviso de cookies"
        >
          <div className="max-w-4xl mx-auto bg-white border border-red-900/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-900/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-red-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Sua privacidade é importante
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos
                    (Google Analytics) para entender como você navega. Conforme a LGPD (Lei nº 13.709/2018),
                    você pode aceitar ou recusar os cookies não essenciais.{' '}
                    <button
                      onClick={() => setShowDetails((s) => !s)}
                      className="text-red-900 underline font-medium"
                    >
                      {showDetails ? 'Ocultar detalhes' : 'Saiba mais'}
                    </button>
                  </p>
                  {showDetails && (
                    <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-2">
                      <p><strong>Essenciais:</strong> necessários ao funcionamento do site (sessão, preferências).</p>
                      <p><strong>Analíticos:</strong> Google Analytics — medem audiência de forma agregada.</p>
                      <p>
                        Consulte nossa{' '}
                        <button onClick={() => onNavigate?.('privacy')} className="text-red-900 underline">
                          Política de Privacidade
                        </button>{' '}e{' '}
                        <button onClick={() => onNavigate?.('terms')} className="text-red-900 underline">
                          Termos de Uso
                        </button>.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setConsent('rejected')}
                  aria-label="Fechar"
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => setConsent('rejected')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Recusar
                </button>
                <button
                  onClick={() => setConsent('accepted')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-900 text-white text-sm font-medium hover:bg-red-800 transition-colors shadow-sm"
                >
                  Aceitar todos
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;