import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { supabase, UrgentPopup as UrgentPopupType } from '../../lib/supabase';

export const UrgentPopup: React.FC = () => {
  const [popup, setPopup] = useState<UrgentPopupType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    fetchActivePopup();
  }, []);

  useEffect(() => {
    if (popup && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (popup && timeLeft === 0) {
      handleAutoClose();
    }
  }, [popup, timeLeft]);

  const fetchActivePopup = async () => {
    try {
      const { data, error } = await supabase
        .from('urgent_popups')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const activePopup = data[0];
        const seenKey = `popup_seen_${activePopup.id}`;
        const hasSeenPermanently = localStorage.getItem(seenKey) === 'true';
        const hasSeenThisSession = sessionStorage.getItem(seenKey) === 'true';

        if (!hasSeenPermanently && !hasSeenThisSession) {
          setPopup(activePopup);
          setTimeLeft(activePopup.auto_close_seconds || 0);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error fetching popup:', error);
    }
  };

  const handleClose = (permanent: boolean = false) => {
    if (!popup) return;
    setIsClosing(true);
    const seenKey = `popup_seen_${popup.id}`;
    if (permanent) {
      localStorage.setItem(seenKey, 'true');
    } else {
      sessionStorage.setItem(seenKey, 'true');
    }
    setTimeout(() => {
      setIsVisible(false);
      setPopup(null);
      setIsClosing(false);
    }, 300);
  };

  const handleAutoClose = () => handleClose(false);

  const handleLinkClick = () => {
    if (popup?.link_url) {
      window.open(popup.link_url, '_blank', 'noopener,noreferrer');
    }
    handleClose(false);
  };

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      keys.forEach(key => {
        if (key.startsWith('popup_seen_')) {
          const timestamp = localStorage.getItem(`${key}_timestamp`);
          if (timestamp && parseInt(timestamp) < thirtyDaysAgo) {
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_timestamp`);
          }
        }
      });
    } catch (error) {
      console.warn('Error cleaning old popup data:', error);
    }
  }, []);

  if (!popup || !isVisible) return null;

  const autoCloseSeconds = popup.auto_close_seconds || 0;
  const progressPercentage = autoCloseSeconds > 0 ? ((autoCloseSeconds - timeLeft) / autoCloseSeconds) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ 
            scale: isClosing ? 0.9 : 1, 
            opacity: isClosing ? 0 : 1, 
            y: isClosing ? 20 : 0 
          }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-2xl w-full sm:max-w-sm max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-red-800"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">Aviso Importante</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">{timeLeft}s</span>
              <button
                onClick={() => handleClose(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content - scrollable */}
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 3rem)' }}>
            {popup.image_url && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img
                  src={popup.image_url}
                  alt={popup.title}
                  className="w-full max-h-[30vh] object-contain bg-gray-50"
                  loading="eager"
                />
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {popup.title}
            </h3>

            <div className="mb-4">
              {popup.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 text-sm mb-1.5 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Actions - always stacked on mobile */}
            <div className="flex flex-col gap-2">
              {popup.link_url && (
                <Button
                  variant="primary"
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center gap-2 text-sm"
                >
                  {popup.link_text}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleClose(true)}
                  className="flex-1 text-xs py-2"
                >
                  Não mostrar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className="flex-1 text-xs py-2"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
