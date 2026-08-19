import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-gold' | 'ghost';
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
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 tracking-wide';
  
  const variantClasses = {
    primary: 'bg-red-900 hover:bg-red-800 text-white shadow-elegant hover:shadow-lg border border-red-950/20',
    secondary: 'bg-gold-400 hover:bg-gold-500 text-red-950 shadow-gold hover:shadow-lg font-semibold',
    outline: 'bg-white/90 backdrop-blur-sm border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    'outline-gold': 'bg-transparent border border-gold-400 text-red-900 hover:bg-gold-50 hover:border-gold-500',
    ghost: 'bg-transparent text-red-900 hover:bg-red-900/5'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-2.5 text-base min-h-[44px]',
    lg: 'px-8 py-3 text-lg min-h-[48px]'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} touch-manipulation ${className}`}
      title={title}
    >
      {children}
    </motion.button>
  );
};
