import React from 'react';
import { Home, Calendar, Bell, Image as ImageIcon, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onNavigate: (section: string) => void;
  onOpenMenu: () => void;
  activeSection?: string;
}

/**
 * Bottom navigation bar visível apenas em mobile (<lg).
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
    { id: 'programs', label: 'Programação', icon: Calendar },
    { id: 'photos', label: 'Fotos', icon: ImageIcon },
  ] as const;

  return (
    <nav
      aria-label="Navegação inferior"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#240404] border-t border-[#c5a059]/40 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] safe-area-inset-bottom"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <ul className="grid grid-cols-5 h-16 items-center">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <li key={id} className="h-full">
              <button
                onClick={() => onNavigate(id)}
                className={`w-full h-full flex flex-col items-center justify-center gap-1 touch-manipulation transition-colors ${
                  active
                    ? 'text-[#e8c872] font-semibold'
                    : 'text-stone-300 hover:text-[#e8c872] active:text-[#e8c872]'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.75} />
                <span className="text-[10px] tracking-tight font-sans">
                  {label}
                </span>
                <span
                  className={`h-0.5 w-5 rounded-full transition-all ${
                    active ? 'bg-[#e8c872]' : 'bg-transparent'
                  }`}
                />
              </button>
            </li>
          );
        })}
        <li className="h-full">
          <button
            onClick={onOpenMenu}
            className="w-full h-full flex flex-col items-center justify-center gap-1 text-stone-300 hover:text-[#e8c872] active:text-[#e8c872] touch-manipulation transition-colors"
            aria-label="Abrir menu completo"
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