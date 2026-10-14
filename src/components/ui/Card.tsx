import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'wine' | 'glass' | 'pergaminho';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true, variant = 'default', onClick }) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -2 },
    transition: { duration: 0.2, ease: 'easeOut' as const }
  } : {};

  const variantStyles = {
    default: 'bg-white rounded-xl shadow-[0_4px_20px_rgba(36,4,4,0.06)] border border-stone-200 hover:border-stone-300 hover:shadow-[0_10px_30px_rgba(36,4,4,0.09)]',
    wine: 'bg-[#2a0808] text-white rounded-xl shadow-lg border border-[#8f6d25]/35 hover:border-[#c9a84c]/60',
    glass: 'bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-stone-200 hover:border-stone-300',
    pergaminho: 'bg-[#fdfbf7] rounded-xl shadow-sm border border-[#e4dcc9] hover:border-[#dcbf6d]'
  };

  return (
    <Component
      {...hoverProps}
      onClick={onClick}
      className={`group/card relative ${variantStyles[variant]} overflow-hidden transition-all duration-200 ${className}`}
    >
      {children}
    </Component>
  );
};
