import React from 'react';
import { motion } from 'framer-motion';
import { Church, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative flex items-center justify-center overflow-hidden py-8 sm:py-12 md:py-14">
      {/* Liturgical Sacred Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a0606] via-[#481010] to-[#200404]"></div>
      
      {/* Decorative Radial Gold Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Subtle sacred pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #f5ecd0 1px, transparent 0)`,
        backgroundSize: '36px 36px'
      }}></div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Main Header Content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Emblem Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gold-400/20 to-gold-600/10 rounded-2xl mb-6 backdrop-blur-md border border-gold-400/40 shadow-gold">
            <Church className="h-8 w-8 sm:h-10 sm:w-10 text-gold-300 drop-shadow" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-400/10 border border-gold-400/30 rounded-full text-gold-300 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase font-sans mb-4 backdrop-blur-sm">
            ✦ Diocese de São Miguel Paulista ✦
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 tracking-tight leading-tight">
            Paróquia Senhor Santo Cristo
            <span className="block text-gold-300 font-serif italic text-2xl sm:text-3xl md:text-4xl font-normal mt-1">
              dos Milagres
            </span>
          </h1>
          
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/30 border border-white/10 rounded-full text-stone-300 text-xs sm:text-sm mb-8 backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-gold-400" />
            <span>Cidade Tiradentes • São Paulo, SP</span>
          </div>
        </motion.div>

        {/* 40 Years Celebration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-wine rounded-3xl p-6 sm:p-8 mb-8 border border-gold-400/30 shadow-2xl relative overflow-hidden"
        >
          {/* Hairline top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400" />
            <span className="text-gold-300 text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.2em]">Jubileu Paroquial</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-3 tracking-tight">
            40 Anos de Fé, Esperança e Comunhão
          </h2>
          
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-6 font-light">
            Quatro décadas dedicadas à evangelização, ao acolhimento fraterno e ao testemunho do amor de Cristo em nossa comunidade.
          </p>
          
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 border border-gold-400/20 rounded-full text-gold-200 text-xs sm:text-sm font-medium">
              <Calendar className="h-4 w-4 text-gold-400" />
              Fundação: 1985
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 border border-gold-400/20 rounded-full text-gold-200 text-xs sm:text-sm font-medium">
              <Church className="h-4 w-4 text-gold-400" />
              1985 - 2025 • 40 Anos
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate('history')}
              className="w-full sm:w-auto"
            >
              Conheça Nossa História
            </Button>
            <Button
              variant="outline-gold"
              size="md"
              onClick={() => onNavigate('programs')}
              className="w-full sm:w-auto text-white bg-black/40 border-gold-400/50 hover:bg-gold-400/20"
            >
              Horários de Missa
            </Button>
          </div>
        </motion.div>

        {/* Sacred Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-stone-300/80 text-xs sm:text-sm italic font-serif"
        >
          "Onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles."
          <span className="text-gold-400 not-italic ml-1 font-sans font-semibold text-xs">— Mt 18, 20</span>
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border-2 border-gold-400/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-gold-400/60 rounded-full mt-1.5"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
