import React from 'react';
import { Home, Calendar, Bell, Image as ImageIcon, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onNavigate: (section: string) => void;
  onOpenMenu: () => void;
  activeSection?: string;
}

/**
 * Bottom navigation bar fixa e estável no mobile (<lg).
 * 5 slots: Início, Avisos, Programação, Fotos, Menu.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onNavigate,
  onOpenMenu,
  activeSection,
}) => {
  const items = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'announcements', label: 'Avisos', icon: Bell },
    { id: 'programs', label: 'Agenda', icon: Calendar },
    { id: 'photos', label: 'Fotos', icon: ImageIcon },
  ] as const;

  return (
    <nav
      aria-label="Navegação inferior móvel"
      className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-[#c5a059]/40 bg-[#200303] shadow-none lg:hidden"
      style={{
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <ul className="grid grid-cols-5 h-15 items-center max-w-lg mx-auto">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <li key={id} className="h-full flex items-center justify-center">
              <button
                onClick={() => onNavigate(id)}
                className={`w-full h-full flex flex-col items-center justify-center gap-0.5 touch-manipulation transition-all duration-150 ${
                  active
                    ? 'text-[#e8c872] font-semibold'
                    : 'text-stone-300 hover:text-[#e8c872] active:text-[#e8c872]'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon size={20} strokeWidth={active ? 2.3 : 1.75} />
                <span className="text-[10px] tracking-tight font-sans truncate max-w-[64px] text-center">
                  {label}
                </span>
                <span
                  className={`h-0.5 w-5 rounded-full transition-all duration-200 ${
                    active ? 'bg-[#e8c872] opacity-100 scale-100' : 'bg-transparent opacity-0 scale-50'
                  }`}
                />
              </button>
            </li>
          );
        })}
        <li className="h-full flex items-center justify-center">
          <button
            onClick={onOpenMenu}
            className="w-full h-full flex flex-col items-center justify-center gap-0.5 text-stone-300 hover:text-[#e8c872] active:text-[#e8c872] touch-manipulation transition-all duration-150"
            aria-label="Abrir menu completo"
            style={{ touchAction: 'manipulation' }}
          >
            <Menu size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-sans">Menu</span>
            <span className="h-0.5 w-5 rounded-full bg-transparent" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
