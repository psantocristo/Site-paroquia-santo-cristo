import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-gold' | 'ghost' | 'wine-gradient' | 'gold-solid';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  title
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 tracking-wide cursor-pointer select-none active:translate-y-px';
  
  const variantClasses = {
    primary: 'bg-gradient-to-b from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 text-white shadow-md hover:shadow-lg border border-gold-400/30 hover:border-gold-400/60 font-medium',
    'wine-gradient': 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-gold-300 hover:text-gold-200 border border-gold-400/40 hover:border-gold-400 shadow-elegant hover:shadow-gold',
    secondary: 'bg-gradient-to-b from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-red-950 shadow-gold hover:shadow-lg font-semibold border border-gold-200/50',
    'gold-solid': 'bg-gold-500 hover:bg-gold-400 text-red-950 font-bold shadow-md hover:shadow-gold border border-gold-300',
    outline: 'bg-white/95 backdrop-blur-sm border border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-red-900 hover:border-red-900/30 shadow-sm',
    'outline-gold': 'bg-white/80 backdrop-blur-sm border border-gold-400/80 text-red-950 hover:bg-gold-50/80 hover:border-gold-500 shadow-sm font-medium',
    ghost: 'bg-transparent text-red-900 hover:bg-red-900/10 active:bg-red-900/15'
  };
  
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs sm:text-sm min-h-[38px] rounded-lg',
    md: 'px-5 sm:px-6 py-2.5 text-sm sm:text-base min-h-[44px]',
    lg: 'px-7 sm:px-8 py-3.5 text-base sm:text-lg min-h-[50px] font-semibold'
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} touch-manipulation ${className}`}
      title={title}
    >
      {children}
    </motion.button>
  );
};
