import React from 'react';

interface OrnamentProps {
  className?: string;
  variant?: 'cross' | 'fleur' | 'diamond';
  color?: string;
}

/**
 * Divisor ornamental litúrgico: duas linhas douradas com um símbolo central.
 * Uso: <Ornament /> entre seções para dar identidade católica editorial.
 */
export const Ornament: React.FC<OrnamentProps> = ({
  className = '',
  variant = 'cross',
  color = 'currentColor',
}) => {
  const Icon = () => {
    if (variant === 'fleur') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6zm0 20c-1.5-2-1.5-4 0-6 1.5 2 1.5 4 0 6zM2 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0zm14 0c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0zM12 8a4 4 0 100 8 4 4 0 000-8z"
            stroke={color}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    if (variant === 'diamond') {
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1l6 6-6 6-6-6 6-6z" stroke={color} strokeWidth="1" />
          <circle cx="7" cy="7" r="1.5" fill={color} />
        </svg>
      );
    }
    // cross (default)
    return (
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true">
        <path
          d="M9 1v20M2 8h14"
          stroke={color}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <circle cx="9" cy="11" r="2.2" stroke={color} strokeWidth="1" fill="none" />
      </svg>
    );
  };

  return (
    <div
      className={`flex items-center justify-center gap-4 text-gold-500 ${className}`}
      aria-hidden="true"
    >
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-gold-400/60 to-gold-500/80" />
      <Icon />
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent via-gold-400/60 to-gold-500/80" />
    </div>
  );
};