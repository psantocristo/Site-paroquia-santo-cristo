import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import parishLogo from '../../assets/logo-paroquia-white.png';

interface HeaderProps {
  onNavigate: (section: string) => void;
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(parishLogo);
  const [logoAlt, setLogoAlt] = useState('Logo da Paróquia');

  useEffect(() => {
    fetchLogo();
  }, []);

  useEffect(() => {
    const openMenu = () => setIsMenuOpen(true);
    window.addEventListener('open-site-menu', openMenu);
    return () => window.removeEventListener('open-site-menu', openMenu);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const fetchLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('logo_url, logo_alt')
        .eq('key', 'logo_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLogoUrl(data.logo_url || parishLogo);
        setLogoAlt(data.logo_alt || 'Logo da Paróquia');
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const desktopMenuItems = [
    { id: 'home', label: 'Início' },
    { id: 'announcements', label: 'Avisos' },
    { id: 'programs', label: 'Programações' },
    { id: 'documentacoes', label: 'Sacramentos' },
    { id: 'contact', label: 'Contato' }
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#240404] border-b border-[#c5a059]/35 shadow-lg safe-area-inset-top will-change-transform w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 w-full">
          {/* Logo / Brand */}
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 sm:gap-3 cursor-pointer py-2"
            onClick={() => handleNavigate('home')}
            aria-label="Ir para o início"
          >
            <img
              src={logoUrl}
              alt={logoAlt}
              className="h-10 w-auto max-w-[145px] object-contain sm:h-14 sm:max-w-[280px]"
              onError={(event) => {
                if (event.currentTarget.src !== parishLogo) {
                  event.currentTarget.src = parishLogo;
                }
              }}
            />
          </button>

          {/* Desktop Navigation Links (Início, Avisos, Programações) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Navegação principal">
            {desktopMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-150 border-b-2 cursor-pointer ${
                  activeSection === item.id
                    ? 'border-[#e8c872] text-[#e8c872]'
                    : 'border-transparent text-stone-100 hover:border-white/30 hover:text-white'
                }`}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              className="text-stone-100 hover:text-white p-2.5 rounded-md hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors cursor-pointer"
              onClick={() => {
                window.location.pathname = '/pesquisar';
              }}
              style={{ touchAction: 'manipulation' }}
              aria-label="Buscar no site"
              title="Pesquisar"
            >
              <Search size={20} />
            </button>

            {/* Hamburger Menu Button (Available for desktop and mobile to access all other pages) */}
            <button
              id="site-menu-button"
              className="text-white p-2.5 rounded-md hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ touchAction: 'manipulation' }}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu com todas as páginas'}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu-panel"
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
              id="site-menu-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4 border-t border-[#c5a059]/30 bg-[#240404] w-full max-w-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain shadow-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 px-2">
                {allMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-full"
                  >
                    <button
                      onClick={(e) => handleMobileNavigate(e, item.id)}
                      className="block w-full text-left px-4 py-3 font-medium transition-colors duration-150 rounded-md touch-manipulation text-stone-100 hover:text-white hover:bg-white/10 text-sm sm:text-base border-b border-white/5"
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                        minHeight: '46px'
                      }}
                    >
                      {item.label}
                    </button>
                  </div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
