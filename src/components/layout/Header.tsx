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
    { id: 'announcements', label: 'Avisos' },
    { id: 'programs', label: 'Programações' },
    { id: 'pastorals', label: 'Pastorais' },
    { id: 'documentacoes', label: 'Documentações' },
    { id: 'eventos-informativos', label: 'Vídeos' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-950/98 via-red-900/95 to-red-950/98 backdrop-blur-md border-b border-gold-400/25 shadow-lg safe-area-inset-top will-change-transform w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 w-full">
          {/* Logo / Brand */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer py-2"
            onClick={() => handleNavigate('home')}
            whileHover={{ scale: 1.02 }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-10 sm:h-14 w-auto object-contain max-w-[180px] sm:max-w-[280px]"
              />
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-gold-400/20 to-gold-600/10 rounded-xl border border-gold-400/40 shadow-inner">
                  <Church className="h-6 w-6 sm:h-8 sm:w-8 text-gold-400" />
                </div>
                <div>
                  <h1 className="text-white font-serif font-bold text-base sm:text-xl tracking-tight leading-tight">
                    Paróquia Senhor Santo Cristo
                  </h1>
                  <p className="text-gold-300/90 text-[10px] sm:text-xs tracking-[0.25em] uppercase font-sans font-medium">
                    40 Anos de Fé • 1985 - 2025
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Desktop Navigation Links (Visible on lg+ screens) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="px-3 py-2 text-sm text-stone-200 hover:text-gold-300 font-medium tracking-wide transition-all duration-150 rounded-lg hover:bg-white/5 relative group cursor-pointer"
              >
                {item.label}
                <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gold-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="text-stone-200 hover:text-gold-300 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-gold-400/30 transition-all cursor-pointer"
              onClick={() => {
                window.location.pathname = '/pesquisar';
              }}
              style={{ touchAction: 'manipulation' }}
              aria-label="Buscar no site"
              title="Pesquisar"
            >
              <Search size={19} />
            </motion.button>

            {/* Direct Campaign/Donation CTA (Desktop) */}
            <button
              onClick={() => {
                window.location.pathname = '/campanhas';
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-b from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-red-950 font-bold text-xs sm:text-sm rounded-xl shadow-gold hover:shadow-lg transition-all duration-200 cursor-pointer border border-gold-200/50"
            >
              Campanhas & Doações
            </button>

            {/* Mobile Hamburger Menu Button (Hidden on lg+) */}
            <button
              className="lg:hidden text-white hover:text-gold-300 p-2 rounded-lg hover:bg-white/10 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ touchAction: 'manipulation' }}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t border-gold-400/20 bg-red-950/98 backdrop-blur-md w-full max-w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-2">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="w-full"
                    whileHover={{ x: 6 }}
                  >
                    <button
                      onClick={(e) => handleMobileNavigate(e, item.id)}
                      className="block w-full text-left px-4 py-3 font-medium transition-colors duration-150 rounded-xl touch-manipulation text-stone-100 hover:text-gold-300 hover:bg-white/10 text-sm sm:text-base border-b border-white/5"
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                        minHeight: '46px'
                      }}
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 mt-2 border-t border-white/10 sm:hidden">
                <button
                  onClick={() => {
                    window.location.pathname = '/campanhas';
                  }}
                  className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-red-950 font-bold text-center rounded-xl shadow-gold text-sm"
                >
                  Fazer Doação / Campanhas
                </button>
              </div>
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