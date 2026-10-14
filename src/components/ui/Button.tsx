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
  const baseClasses = 'font-semibold rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 tracking-[0.01em] cursor-pointer select-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6d25]/40 focus-visible:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[#4a1414] hover:bg-[#611a1a] text-white border-[#4a1414] shadow-sm',
    'wine-gradient': 'bg-[#2a0808] text-[#f5dfa0] hover:bg-[#3c0d0d] border-[#8f6d25]/60 shadow-sm',
    secondary: 'bg-[#f5ecd0] hover:bg-[#ecd89f] text-[#3c0d0d] border-[#dcbf6d]',
    'gold-solid': 'bg-[#b58f34] hover:bg-[#a27e2d] text-white border-[#a27e2d] shadow-sm',
    outline: 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-[#4a1414] hover:border-stone-400 shadow-sm',
    'outline-gold': 'bg-white border-[#c9a84c] text-[#4a1414] hover:bg-[#fbf7ec] shadow-sm',
    ghost: 'bg-transparent border-transparent text-[#4a1414] hover:bg-[#4a1414]/7'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs sm:text-sm min-h-[36px]',
    md: 'px-4 sm:px-5 py-2.5 text-sm min-h-[42px]',
    lg: 'px-6 sm:px-7 py-3 text-base min-h-[48px]'
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.985 }}
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
