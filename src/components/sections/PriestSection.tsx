import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, Calendar, BookOpen, X, Quote, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, Priest } from '../../lib/supabase';

export const PriestSection: React.FC = () => {
  const [priests, setPriests] = useState<Priest[]>([]);
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('priests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setPriests(data);
      } else {
        setPriests([{
          id: '1',
          name: 'Pe. José da Silva',
          title: 'Pároco',
          short_bio: 'Com 25 anos de sacerdócio, Pe. José lidera nossa comunidade com dedicação e amor pastoral, sempre buscando fortalecer a fé e a união entre os paroquianos.',
          full_bio: 'Padre José da Silva nasceu em São Paulo em 1965. Foi ordenado sacerdote em 1999 após completar seus estudos no Seminário Arquidiocesano. Desde então, dedicou sua vida ao serviço pastoral em diversas comunidades.\n\nEm 2015, foi nomeado pároco de nossa paróquia, onde tem desenvolvido um trabalho significativo de evangelização e promoção social. Sob sua liderança, a comunidade cresceu e se fortaleceu.',
          photo_url: null,
          ordination_year: 1999,
          parish_since: 2015,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error fetching priests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="priest" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando informações...</p>
          </div>
        </div>
      </section>
    );
  }

  if (priests.length === 0) {
    return (
      <section id="priest" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-800 mb-4">Nosso Pároco</h2>
            <Card className="p-12 max-w-2xl mx-auto">
              <Church className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Informações em breve</p>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const mainPriest = priests[0];
  const otherPriests = priests.slice(1);

  return (
    <section id="priest" className="py-20 md:py-28 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="eyebrow mb-4">Nossa Liderança</p>
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-14 bg-gold-400/60" />
            <Church className="h-5 w-5 text-gold-500" strokeWidth={1.5} />
            <div className="h-px w-14 bg-gold-400/60" />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-semibold text-wine-700 mb-5 tracking-tight">
            Nosso Pároco
          </h2>
          <p className="font-serif italic text-xl text-wine-600/70 max-w-2xl mx-auto">
            Conheça o sacerdote que guia nossa comunidade.
          </p>
        </motion.div>

        {/* Main Priest Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Card className="relative overflow-hidden bg-white">
            {/* Delicate gold corner ornaments */}
            <div className="absolute top-0 left-0 w-20 h-px bg-gold-400/60" />
            <div className="absolute top-0 left-0 w-px h-20 bg-gold-400/60" />
            <div className="absolute bottom-0 right-0 w-20 h-px bg-gold-400/60" />
            <div className="absolute bottom-0 right-0 w-px h-20 bg-gold-400/60" />
            
            <div className="relative p-6 md:p-10 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                
                {/* Photo with elegant frame */}
                <div className="flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {/* Golden frame */}
                    <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full p-1 bg-gold-400 shadow-elegant">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-gray-100">
                        {mainPriest.photo_url ? (
                          <img
                            src={mainPriest.photo_url}
                            alt={mainPriest.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                            <Church className="h-20 w-20 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Title badge - centered and visible */}
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="inline-block bg-wine-700 text-white px-6 py-1.5 rounded-full text-[0.7rem] tracking-[0.22em] uppercase font-semibold shadow-elegant whitespace-nowrap border border-gold-400/40">
                        {mainPriest.title}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Info section */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="font-serif text-4xl lg:text-5xl font-semibold text-wine-700 mb-4 tracking-tight">
                    {mainPriest.name}
                  </h3>
                  
                  {/* Decorative separator */}
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                    <div className="h-px w-12 bg-gold-400" />
                    <Church className="h-3.5 w-3.5 text-gold-500" strokeWidth={1.5} />
                    <div className="h-px w-12 bg-gold-400" />
                  </div>
                  
                  {/* Info badges */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                    {mainPriest.ordination_year && (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cream-100 text-wine-700 rounded-full text-sm font-medium border border-gold-400/40">
                        <Church className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Ordenado em {mainPriest.ordination_year}
                      </span>
                    )}
                    {mainPriest.parish_since && (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cream-100 text-wine-700 rounded-full text-sm font-medium border border-gold-400/40">
                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Na paróquia desde {mainPriest.parish_since}
                      </span>
                    )}
                  </div>
                  
                  {/* Bio with quote decoration */}
                  <div className="relative mb-8">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-gold-300 hidden lg:block" strokeWidth={1.5} />
                    <p className="font-serif italic text-gray-700 leading-relaxed text-lg lg:pl-8">
                      {mainPriest.short_bio}
                    </p>
                  </div>
                  
                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    onClick={() => setSelectedPriest(mainPriest)}
                    className="group px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span>Ler Biografia Completa</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Other Priests */}
        {otherPriests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <p className="eyebrow mb-3">Também Servem</p>
              <h3 className="font-serif text-3xl font-semibold text-wine-700">
                Outros Sacerdotes
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPriests.map((priest, index) => (
                <motion.div
                  key={priest.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="p-6 cursor-pointer group"
                    onClick={() => setSelectedPriest(priest)}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-400 bg-gray-100 flex-shrink-0 p-0.5">
                        {priest.photo_url ? (
                          <img
                            src={priest.photo_url}
                            alt={priest.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Church className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-semibold text-wine-700 group-hover:text-wine-500 transition-colors">
                          {priest.name}
                        </h4>
                        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-gold-600 font-semibold">{priest.title}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{priest.short_bio}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Biography Modal */}
        <AnimatePresence>
          {selectedPriest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedPriest(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25 }}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with gradient background */}
                <div className="relative h-40 md:h-48 bg-gradient-to-br from-red-800 via-red-700 to-amber-600">
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div 
                      className="absolute inset-0" 
                      style={{ 
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '24px 24px' 
                      }} 
                    />
                  </div>
                  
                  {/* Photo overlapping header */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl">
                      {selectedPriest.photo_url ? (
                        <img 
                          src={selectedPriest.photo_url} 
                          alt={selectedPriest.name}
                          className="w-full h-full rounded-full object-cover border-4 border-white" 
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-100 border-4 border-white flex items-center justify-center">
                          <Church className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedPriest(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                {/* Content with spacing for photo */}
                <div className="pt-20 px-6 md:px-8 pb-8 bg-white overflow-y-auto max-h-[calc(90vh-12rem)]">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedPriest.name}</h3>
                    <p className="text-red-800 font-semibold mt-1">{selectedPriest.title}</p>
                  </div>
                  
                  {/* Info grid */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {selectedPriest.ordination_year && (
                      <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Church className="h-6 w-6 text-red-800" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ordenação Sacerdotal</p>
                          <p className="text-xl font-bold text-gray-800">{selectedPriest.ordination_year}</p>
                        </div>
                      </div>
                    )}
                    {selectedPriest.parish_since && (
                      <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-amber-700" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Na Paróquia</p>
                          <p className="text-xl font-bold text-gray-800">Desde {selectedPriest.parish_since}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Biography */}
                  <div>
                    <h4 className="text-xl font-bold flex items-center gap-2 text-gray-800 mb-4">
                      <BookOpen className="h-5 w-5 text-red-800" />
                      Biografia
                    </h4>
                    <div className="prose prose-lg max-w-none">
                      {selectedPriest.full_bio.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-gray-600 mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Video section if available */}
                  {selectedPriest.video_url && (
                    <div className="mt-8">
                      <h4 className="text-xl font-bold text-gray-800 mb-4">Mensagem em Vídeo</h4>
                      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                        <iframe
                          src={selectedPriest.video_url}
                          title={`Vídeo de ${selectedPriest.name}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
