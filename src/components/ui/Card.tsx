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
    whileHover: { y: -4 },
    transition: { duration: 0.25, ease: 'easeOut' as const }
  } : {};

  const variantStyles = {
    default: 'bg-white rounded-2xl shadow-elegant border border-gold-200/60 hover:shadow-gold',
    wine: 'bg-gradient-to-br from-red-950 via-red-900 to-red-950 text-white rounded-2xl shadow-xl border border-gold-400/30 hover:border-gold-400/60',
    glass: 'bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-stone-200/80 hover:border-gold-300',
    pergaminho: 'bg-gradient-to-b from-[#fdfbf7] to-[#f7f2e7] rounded-2xl shadow-elegant border border-gold-300/50 hover:border-gold-400'
  };

  return (
    <Component
      {...hoverProps}
      onClick={onClick}
      className={`group/card relative ${variantStyles[variant]} overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Gold hairline top edge that lights up on hover */}
      <span className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent opacity-60 group-hover/card:opacity-100 transition-opacity" />
      {children}
    </Component>
  );
};