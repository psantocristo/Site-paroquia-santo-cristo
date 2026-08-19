import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true, onClick }) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -4 },
    transition: { duration: 0.25, ease: 'easeOut' as const }
  } : {};

  return (
    <Component
      {...hoverProps}
      onClick={onClick}
      className={`group/card relative bg-white rounded-2xl shadow-elegant border border-gold-200/60 overflow-hidden transition-shadow duration-300 hover:shadow-gold ${className}`}
    >
      {/* Gold hairline top edge that lights up on hover */}
      <span className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent opacity-60 group-hover/card:opacity-100 transition-opacity" />
      {children}
    </Component>
  );
};