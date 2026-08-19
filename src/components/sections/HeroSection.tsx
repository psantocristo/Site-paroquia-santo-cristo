import React from 'react';
import { motion } from 'framer-motion';
import { Church, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative flex items-center justify-center overflow-hidden py-16 sm:py-20 md:py-24">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-amber-800"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }}></div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/20 rounded-2xl mb-5 backdrop-blur-sm border border-amber-400/30">
            <Church className="h-7 w-7 sm:h-8 sm:w-8 text-amber-400" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
            Paróquia Senhor Santo Cristo
            <span className="block text-amber-300 text-lg sm:text-xl md:text-2xl font-medium mt-1">
              dos Milagres
            </span>
          </h1>
          
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-amber-100 text-sm mb-6 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span>Cid. Tiradentes, São Paulo</span>
          </div>
        </motion.div>

        {/* Celebration Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-5 sm:p-6 mb-6 border border-white/15"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-8 bg-amber-400/50" />
            <span className="text-amber-400 text-sm font-medium">Celebração Especial</span>
            <div className="h-px w-8 bg-amber-400/50" />
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">
            40 Anos de Fé e Comunhão
          </h2>
          
          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-5">
            Celebrando quatro décadas de fé, esperança e amor. Uma jornada de milagres, bênçãos e união em Cristo.
          </p>
          
          {/* Info badges inline */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-white/90 text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              Fundada em 1985
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-white/90 text-xs sm:text-sm">
              <Church className="h-3.5 w-3.5 text-amber-400" />
              40 anos de história
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate('history')}
              className="text-sm"
            >
              Conheça Nossa História
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('photos')}
              className="text-sm"
            >
              Ver Fotos
            </Button>
          </div>
        </motion.div>

        {/* Quote - Minimal */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-white/60 text-xs sm:text-sm italic"
        >
          "Onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles" 
          <span className="text-amber-300/80 not-italic ml-1">— Mt 18,20</span>
        </motion.p>
      </div>

      {/* Scroll indicator - Smaller */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-white/50 rounded-full mt-1.5"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
