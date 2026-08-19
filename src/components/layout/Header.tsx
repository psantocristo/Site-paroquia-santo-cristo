import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Church, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MobileBottomNav } from './MobileBottomNav';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoAlt, setLogoAlt] = useState('Logo da Paróquia');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('logo_url, logo_alt')
        .eq('key', 'logo_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLogoUrl(data.logo_url);
        setLogoAlt(data.logo_alt || 'Logo da Paróquia');
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'history', label: 'História' },
    { id: 'eventos-informativos', label: 'Eventos e Informativos' },
    { id: 'pastorals', label: 'Pastorais' },
    { id: 'programs', label: 'Programações' },
    
    { id: 'documentacoes', label: 'Documentações' },
    { id: 'announcements', label: 'Eventos' },
    { id: 'photos', label: 'Fotos' },
    { id: 'contact', label: 'Contato' }
  ];

  const handleNavigate = (section: string) => {
    if (section === 'eventos-informativos') {
      window.location.pathname = '/eventos-informativos';
      setIsMenuOpen(false);
      return;
    }
    if (section === 'documentacoes') {
      window.location.pathname = '/documentacoes';
      setIsMenuOpen(false);
      return;
    }
    onNavigate(section);
    setIsMenuOpen(false);
  };

  const handleMobileNavigate = (e: React.MouseEvent, section: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (section === 'eventos-informativos') {
      setIsMenuOpen(false);
      setTimeout(() => {
        window.location.pathname = '/eventos-informativos';
      }, 100);
      return;
    }
    
    if (section === 'documentacoes') {
      setIsMenuOpen(false);
      setTimeout(() => {
        window.location.pathname = '/documentacoes';
      }, 100);
      return;
    }
    
    setIsMenuOpen(false);
    setTimeout(() => {
      onNavigate(section);
    }, 100);
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-950/95 to-red-900/95 backdrop-blur-md shadow-lg safe-area-inset-top will-change-transform w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 w-full">
          <motion.div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => handleNavigate('home')}
            whileHover={{ scale: 1.05 }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-8 sm:h-12 w-auto object-contain max-w-[200px] sm:max-w-[300px]"
              />
            ) : (
              <>
                <Church className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
                <div className="hidden sm:block">
                  <h1 className="text-white font-serif font-semibold text-base sm:text-xl leading-tight">Paróquia Senhor Santo Cristo</h1>
                  <p className="text-amber-200 text-[10px] sm:text-xs tracking-[0.22em] uppercase font-sans">40 Anos de Fé</p>
                </div>
                <div className="block sm:hidden">
                  <h1 className="text-white font-serif font-semibold text-sm">Paróquia Santo Cristo</h1>
                </div>
              </>
            )}
          </motion.div>

          {/* Search and Menu Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-white hover:text-amber-300 p-2 rounded-full hover:bg-red-800/50 transition-colors"
              onClick={() => {
                window.location.pathname = '/pesquisar';
              }}
              style={{ touchAction: 'manipulation' }}
              aria-label="Buscar"
            >
              <Search size={20} />
            </motion.button>

            {/* Hamburger Menu Button */}
            <button
              className="text-white hover:text-amber-300 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ touchAction: 'manipulation' }}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4 border-t border-red-800/50 bg-red-950/98 backdrop-blur-md w-full max-w-full overflow-hidden"
            >
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="mx-2 w-auto max-w-full"
                  whileHover={{ x: 10 }}
                >
                  <button
                    onClick={(e) => handleMobileNavigate(e, item.id)}
                    className="block w-full text-left px-4 py-3 font-medium transition-colors duration-200 rounded-lg touch-manipulation max-w-full overflow-hidden text-white hover:text-amber-300 hover:bg-red-800/50"
                    style={{ 
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: '48px'
                    }}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
    <MobileBottomNav
      onNavigate={(id) => handleNavigate(id)}
      onOpenMenu={() => setIsMenuOpen(true)}
    />
    </>
  );
};