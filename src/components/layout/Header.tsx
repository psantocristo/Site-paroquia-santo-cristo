import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Church, Search, Heart } from 'lucide-react';
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

  const desktopMenuItems = [
    { id: 'home', label: 'Início' },
    { id: 'announcements', label: 'Avisos' },
    { id: 'programs', label: 'Programações' }
  ];

  const allMenuItems = [
    { id: 'home', label: 'Início' },
    { id: 'announcements', label: 'Avisos' },
    { id: 'programs', label: 'Programações' },
    { id: 'history', label: 'Nossa História' },
    { id: 'pastorals', label: 'Pastorais & Movimentos' },
    { id: 'documentacoes', label: 'Documentações & Sacramentos' },
    { id: 'eventos-informativos', label: 'Vídeos & Informativos' },
    { id: 'photos', label: 'Galeria de Fotos' },
    { id: 'contact', label: 'Fale Conosco' }
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#240404] border-b border-[#c5a059]/40 shadow-2xl safe-area-inset-top will-change-transform w-full max-w-full overflow-hidden">
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
                <div className="p-2 bg-gradient-to-br from-[#e8c872]/20 to-[#c9a84c]/10 rounded-xl border border-[#c5a059]/40 shadow-inner">
                  <Church className="h-6 w-6 sm:h-8 sm:w-8 text-[#e8c872]" />
                </div>
                <div>
                  <h1 className="text-white font-serif font-bold text-base sm:text-xl tracking-tight leading-tight">
                    Paróquia Senhor Santo Cristo
                  </h1>
                  <p className="text-[#e8c872]/90 text-[10px] sm:text-xs tracking-[0.25em] uppercase font-sans font-medium">
                    Diocese de São Miguel Paulista
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Desktop Navigation Links (Início, Avisos, Programações) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            {desktopMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="px-3.5 py-2 text-sm text-stone-100 hover:text-[#e8c872] font-semibold tracking-wide transition-all duration-150 rounded-lg hover:bg-white/10 relative group cursor-pointer"
              >
                {item.label}
                <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#e8c872] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="text-stone-100 hover:text-[#e8c872] p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-[#c5a059]/40 transition-all cursor-pointer"
              onClick={() => {
                window.location.pathname = '/pesquisar';
              }}
              style={{ touchAction: 'manipulation' }}
              aria-label="Buscar no site"
              title="Pesquisar"
            >
              <Search size={20} />
            </motion.button>

            {/* Direct Oferta CTA */}
            <button
              onClick={() => {
                window.location.pathname = '/campanhas';
              }}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-b from-[#e8c872] via-[#c9a84c] to-[#b58f34] hover:from-[#f3db92] hover:to-[#c9a84c] text-[#240404] font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-[#f5ecd0]/60 active:scale-95"
            >
              <Heart className="h-4 w-4 fill-[#240404]" />
              <span>Oferta</span>
            </button>

            {/* Hamburger Menu Button (Available for desktop and mobile to access all other pages) */}
            <button
              className="text-white hover:text-[#e8c872] p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-[#c5a059]/40 transition-all cursor-pointer flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ touchAction: 'manipulation' }}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu com todas as páginas'}
              title="Menu completo"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Dropdown Menu (Full list of sections) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4 border-t border-[#c5a059]/30 bg-[#240404] w-full max-w-full overflow-hidden shadow-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 px-2">
                {allMenuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="w-full"
                    whileHover={{ x: 6 }}
                  >
                    <button
                      onClick={(e) => handleMobileNavigate(e, item.id)}
                      className="block w-full text-left px-4 py-3 font-medium transition-colors duration-150 rounded-xl touch-manipulation text-stone-100 hover:text-[#e8c872] hover:bg-white/10 text-sm sm:text-base border-b border-white/5"
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
              <div className="p-3 mt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    window.location.pathname = '/campanhas';
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#e8c872] to-[#c9a84c] text-[#240404] font-bold text-center rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
                >
                  <Heart className="h-4 w-4 fill-[#240404]" />
                  <span>Fazer uma Oferta / Dízimo Paroquial</span>
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