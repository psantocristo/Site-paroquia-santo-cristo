import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface PriestGallery {
  id: string;
  name: string;
  was_parish_priest: boolean | null;
  date_at_parish: string | null;
  photo_url: string | null;
  description: string;
  is_active: boolean | null;
  order_index: number | null;
}

interface PriestsCarouselSectionProps {
  onNavigateToPriestsGallery: () => void;
}

export const PriestsCarouselSection: React.FC<PriestsCarouselSectionProps> = ({
  onNavigateToPriestsGallery,
}) => {
  const [priests, setPriests] = useState<PriestGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('priests_gallery' as any)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPriests((data || []) as any);
    } catch (error) {
      console.error('Error fetching priests:', error);
      toast.error('Erro ao carregar galeria de padres');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
          </div>
        </div>
      </section>
    );
  }

  if (priests.length === 0) {
    return null;
  }

  return (
    <section id="priests-carousel" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Galeria dos Padres
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Conheça os sacerdotes que servem com dedicação à nossa comunidade
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onNavigateToPriestsGallery}
            className="inline-flex items-center gap-2"
          >
            Ver Galeria Completa
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none hidden md:block" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none hidden md:block" />

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {priests.map((priest, index) => (
              <motion.div
                key={priest.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-72 snap-center"
              >
                <div
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
                  onClick={onNavigateToPriestsGallery}
                >
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-red-100 to-red-200">
                    {priest.photo_url ? (
                      <img
                        src={priest.photo_url}
                        alt={priest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl text-red-800">👤</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Badge if was parish priest */}
                    {priest.was_parish_priest && (
                      <div className="absolute top-4 right-4 bg-red-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Foi Pároco
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-800 transition-colors">
                      {priest.name}
                    </h3>
                    {priest.date_at_parish && (
                      <p className="text-red-700 font-medium text-sm mb-3">
                        {priest.date_at_parish}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {priest.description}
                    </p>
                    <div className="flex items-center text-red-800 font-semibold text-sm group-hover:gap-2 transition-all">
                      <span>Ver mais</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* "Ver mais" card at the end */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: priests.length * 0.1 }}
              className="flex-shrink-0 w-72 snap-center"
            >
              <div
                className="group relative bg-gradient-to-br from-red-800 to-red-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex items-center justify-center p-8"
                onClick={onNavigateToPriestsGallery}
              >
                <div className="text-center text-white">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Ver Galeria Completa</h3>
                  <p className="text-red-200">
                    Conheça todos os padres que servem nossa comunidade
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="text-center mt-6 md:hidden">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span>Deslize para ver mais</span>
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </p>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};