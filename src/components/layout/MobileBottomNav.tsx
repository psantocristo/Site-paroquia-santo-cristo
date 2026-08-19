import React from 'react';
import { Home, Calendar, Users, Image as ImageIcon, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onNavigate: (section: string) => void;
  onOpenMenu: () => void;
  activeSection?: string;
}

/**
 * Bottom navigation bar visível apenas em mobile (<lg).
 * 5 slots: Início, Programações, Eventos, Fotos, Menu.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onNavigate,
  onOpenMenu,
  activeSection,
}) => {
  const items = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'programs', label: 'Programação', icon: Calendar },
    { id: 'announcements', label: 'Eventos', icon: Users },
    { id: 'photos', label: 'Fotos', icon: ImageIcon },
  ] as const;

  return (
    <nav
      aria-label="Navegação inferior"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-red-950/98 to-red-900/95 backdrop-blur-md border-t border-gold-500/25 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] safe-area-inset-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <li key={id}>
              <button
                onClick={() => onNavigate(id)}
                className={`w-full flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] touch-manipulation transition-colors ${
                  active
                    ? 'text-gold-300'
                    : 'text-white/80 active:text-gold-200 hover:text-gold-200'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={1.75} />
                <span className="text-[10px] font-medium tracking-wide font-sans">
                  {label}
                </span>
                <span
                  className={`h-0.5 w-6 rounded-full mt-0.5 transition-all ${
                    active ? 'bg-gold-400' : 'bg-transparent'
                  }`}
                />
              </button>
            </li>
          );
        })}
        <li>
          <button
            onClick={onOpenMenu}
            className="w-full flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-white/80 hover:text-gold-200 active:text-gold-200 touch-manipulation transition-colors"
            aria-label="Abrir menu completo"
          >
            <Menu size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium tracking-wide font-sans">Menu</span>
            <span className="h-0.5 w-6 rounded-full mt-0.5 bg-transparent" />
          </button>
        </li>
      </ul>
    </nav>
  );
};