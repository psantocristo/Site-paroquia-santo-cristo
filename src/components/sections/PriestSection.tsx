import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Church } from 'lucide-react';
import { supabase, Priest } from '../../lib/supabase';
import { PriestDetailsDialog } from '../ui/PriestDetailsDialog';

export const PriestSection: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      const { data, error } = await supabase
        .from('priests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

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
    <>
    <section id="priest" className="py-10 md:py-16 bg-white overflow-hidden border-t border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="institutional-kicker">
            <Church className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Clero paroquial</span>
          </div>
          <h2 className="institutional-title text-balance">
            Nossos Sacerdotes
          </h2>
          <p className="text-pretty text-stone-600 text-sm sm:text-base font-light">
            Conheça os sacerdotes dedicados ao cuidado pastoral e espiritual da nossa paróquia.
          </p>
        </div>

        {/* Main Priest Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="institutional-card bg-[#faf7f2] p-6 sm:p-8 lg:p-10 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
            {/* Photo with refined frame */}
            <div className="relative shrink-0">
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-md overflow-hidden border border-[#c5a059] bg-stone-100">
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
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#240404] text-[#e8c872] text-[11px] font-bold uppercase tracking-wider rounded-sm border border-[#c5a059]/40 whitespace-nowrap">
                {mainPriest.title || 'Pároco'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#240404] mb-1">
                  {mainPriest.name}
                </h3>
                {mainPriest.ordination_year && (
                  <p className="text-xs sm:text-sm font-semibold text-[#c5a059]">
                    Ordenação Sacerdotal: {mainPriest.ordination_year}
                  </p>
                )}
              </div>

              <p className="text-pretty text-stone-700 text-sm sm:text-base leading-relaxed font-light">
                {mainPriest.short_bio || 'Dedicado ao anúncio do Evangelho e ao acolhimento de toda a comunidade paroquial.'}
              </p>
              <button
                type="button"
                onClick={() => setSelectedPriest(mainPriest)}
                className="inline-flex items-center gap-2 rounded-md bg-[#611a1a] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#4b1212] focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:ring-offset-2"
              >
                Conhecer o pároco
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Other Priests Grid */}
        {otherPriests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherPriests.map((priest, idx) => (
              <motion.button
                type="button"
                key={priest.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                onClick={() => setSelectedPriest(priest)}
                className="bg-[#faf7f2] rounded-xl p-5 border border-stone-200/80 hover:border-[#c5a059] shadow-sm flex items-center gap-4 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:ring-offset-2"
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
                  {priest.short_bio && (
                    <p className="text-xs text-stone-600 line-clamp-1 font-light">
                      {priest.short_bio}
                    </p>
                  )}
                </div>
                <ChevronRight className="ml-auto size-4 shrink-0 text-stone-400" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
    <PriestDetailsDialog
      open={Boolean(selectedPriest)}
      name={selectedPriest?.name || ''}
      title={selectedPriest?.title}
      photoUrl={selectedPriest?.photo_url}
      description={selectedPriest?.full_bio || selectedPriest?.short_bio}
      metadata={selectedPriest ? [
        selectedPriest.ordination_year ? `Ordenação sacerdotal: ${selectedPriest.ordination_year}` : '',
        selectedPriest.parish_since ? `Na paróquia desde ${selectedPriest.parish_since}` : '',
      ].filter(Boolean) : []}
      videoUrl={selectedPriest?.video_url}
      onClose={() => setSelectedPriest(null)}
    />
    </>
  );
};
