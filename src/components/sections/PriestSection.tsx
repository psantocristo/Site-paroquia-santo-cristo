import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Church, Mail, Phone, Heart, Award, ChevronRight } from 'lucide-react';
import { supabase, Priest } from '../../lib/supabase';

export const PriestSection: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      const { data, error } = await supabase
        .from('priests')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setPriests(data);
    } catch (error) {
      console.error('Error fetching priests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || priests.length === 0) return null;

  const mainPriest = priests[0];
  const otherPriests = priests.slice(1);

  return (
    <section id="priest" className="py-10 md:py-16 bg-white overflow-hidden border-t border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#240404]/5 border border-[#c5a059]/30 rounded-full text-[#240404] text-xs font-semibold uppercase tracking-widest mb-3">
            <Church className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Pastoral & Clero</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#240404] tracking-tight">
            Nossos Sacerdotes
          </h2>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px w-12 bg-[#c5a059]/40" />
            <span className="text-[#c5a059] text-xs">✦</span>
            <div className="h-px w-12 bg-[#c5a059]/40" />
          </div>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Conheça os sacerdotes dedicados ao cuidado pastoral e espiritual da nossa paróquia.
          </p>
        </div>

        {/* Main Priest Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#faf7f2] rounded-3xl border border-[#c5a059]/40 p-6 sm:p-8 lg:p-10 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
            {/* Photo with refined frame */}
            <div className="relative shrink-0">
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-2 border-[#c5a059] shadow-md bg-stone-100">
                {mainPriest.photo_url ? (
                  <img
                    src={mainPriest.photo_url}
                    alt={mainPriest.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                    <Church className="h-16 w-16 text-[#c5a059]" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#240404] text-[#e8c872] text-[11px] font-bold uppercase tracking-wider rounded-full shadow border border-[#c5a059]/40 whitespace-nowrap">
                {mainPriest.title || 'Pároco'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#240404] mb-1">
                  {mainPriest.name}
                </h3>
                {mainPriest.ordination_date && (
                  <p className="text-xs sm:text-sm font-semibold text-[#c5a059]">
                    Ordenação Sacerdotal: {new Date(mainPriest.ordination_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-light">
                {mainPriest.bio || 'Dedicado ao anúncio do Evangelho e ao acolhimento de toda a comunidade paroquial.'}
              </p>

              {mainPriest.quote && (
                <blockquote className="p-3 bg-white/70 rounded-xl border-l-4 border-[#c5a059] italic text-stone-600 text-xs sm:text-sm font-serif">
                  "{mainPriest.quote}"
                </blockquote>
              )}
            </div>
          </div>
        </motion.div>

        {/* Other Priests Grid */}
        {otherPriests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherPriests.map((priest, idx) => (
              <motion.div
                key={priest.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="bg-[#faf7f2] rounded-2xl p-5 border border-stone-200/80 hover:border-[#c5a059] shadow-sm flex items-center gap-4 transition-all"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#c5a059]/50 shrink-0 bg-stone-100">
                  {priest.photo_url ? (
                    <img src={priest.photo_url} alt={priest.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Church className="h-6 w-6 text-[#c5a059]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059]">
                    {priest.title || 'Vigário Paroquial'}
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#240404] truncate">
                    {priest.name}
                  </h4>
                  {priest.bio && (
                    <p className="text-xs text-stone-600 line-clamp-1 font-light">
                      {priest.bio}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
