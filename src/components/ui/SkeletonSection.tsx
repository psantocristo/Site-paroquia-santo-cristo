import React from 'react';

interface SkeletonSectionProps {
  height?: string;
  className?: string;
}

export const SkeletonSection: React.FC<SkeletonSectionProps> = ({ 
  height = "400px", 
  className = "" 
}) => (
  <div 
    className={`animate-pulse bg-gradient-to-br from-red-900 to-red-800 ${className}`}
    style={{ height, minHeight: height }}
  />
);

export const SlidesSkeleton: React.FC = () => (
  <section className="relative w-full aspect-[16/10] md:aspect-auto md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-red-900 to-red-800 mt-14 sm:mt-16">
    <div className="absolute inset-0">
      {/* Background skeleton */}
      <div className="w-full h-full animate-pulse bg-gradient-to-br from-red-800 to-red-700" />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      {/* Content skeleton - bottom left aligned */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12 pb-16 md:pb-20">
        <div className="max-w-3xl">
          {/* Badge skeleton */}
          <div className="h-6 w-24 bg-white/20 rounded-full mb-4 animate-pulse" />
          
          {/* Title skeleton */}
          <div className="h-10 md:h-14 lg:h-16 bg-white/20 rounded-lg w-3/4 mb-4 animate-pulse" />
          
          {/* Description skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-4 md:h-5 bg-white/15 rounded w-full max-w-xl animate-pulse" />
            <div className="h-4 md:h-5 bg-white/15 rounded w-2/3 max-w-md animate-pulse" />
          </div>
          
          {/* Button skeleton */}
          <div className="h-12 w-36 bg-white/25 rounded-lg animate-pulse" />
        </div>
      </div>
      
      {/* Dots skeleton - apenas desktop */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
        <div className="w-8 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse" />
      </div>
      
      {/* Progress bar skeleton */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full w-1/3 bg-red-500/50 animate-pulse" />
      </div>
    </div>
  </section>
);
