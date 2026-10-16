import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, X, Facebook, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PriestDetailsDialog } from '../components/ui/PriestDetailsDialog';
import { SEO } from '../components/ui/SEO';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

interface PriestGallery {
  id: string;
  name: string;
  was_parish_priest: boolean | null;
  date_at_parish: string | null;
  photo_url: string | null;
  description: string;
  video_url: string | null;
  video_thumbnail_url: string | null;
  cloudinary_public_id: string | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PriestsGalleryPageProps {
  onBack: () => void;
}

export const PriestsGalleryPage: React.FC<PriestsGalleryPageProps> = ({ onBack }) => {
  const [priests, setPriests] = React.useState<PriestGallery[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPriest, setSelectedPriest] = React.useState<PriestGallery | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string>('');
  const [showShareOptions, setShowShareOptions] = React.useState(false);
  const [playingVideo, setPlayingVideo] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPriests();
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('logo_url')
        .eq('key', 'site_logo')
        .single();
      
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const fetchPriests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('priests_gallery')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPriests(data || []);
    } catch (error) {
      console.error('Error fetching priests:', error);
      toast.error('Erro ao carregar galeria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Galeria dos Padres - Paróquia Senhor Santo Cristo dos Milagres',
      text: 'Conheça os padres que servem nossa paróquia',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      setShowShareOptions(true);
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent('Conheça os padres da Paróquia Senhor Santo Cristo dos Milagres');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    setShowShareOptions(false);
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareOptions(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado!');
    setShowShareOptions(false);
  };


  return (
    <>
      <SEO
        title="Galeria dos Padres - Paróquia Senhor Santo Cristo dos Milagres"
        description="Conheça os padres que servem nossa paróquia com dedicação e amor. Histórias de fé, vocação e serviço à comunidade."
        keywords="padres, clero, pároco, paróquia, santo cristo, tiradentes, vocação, sacerdócio"
        image="https://paroquiasantocristo.com.br/capa.webp"
        url="https://paroquiasantocristo.com.br/galeria-dos-padres"
      />

      <div className="min-h-dvh bg-stone-50">
        <header className="sticky top-0 z-40 border-b border-[#c5a059]/35 bg-[#240404] py-4 text-white shadow-none md:py-6 md:shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              {logoUrl && (
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="h-12 md:h-16 w-auto object-contain"
                  />
                </div>
              )}

              <div className="relative">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Compartilhar</span>
                </Button>

                <AnimatePresence>
                  {showShareOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50"
                    >
                      <button
                        onClick={shareToWhatsApp}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={shareToFacebook}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Facebook className="h-5 w-5 text-blue-600" />
                        Facebook
                      </button>
                      <button
                        onClick={copyLink}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar Link
                      </button>
                      <button
                        onClick={() => setShowShareOptions(false)}
                        className="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-100 flex items-center gap-2 border-t mt-1"
                      >
                        <X className="h-4 w-4" />
                        Fechar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Title Section */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Galeria dos Padres
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conheça os sacerdotes que servem com dedicação e amor à nossa comunidade paroquial
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && priests.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600">Nenhum padre cadastrado no momento</p>
            </div>
          )}

          {/* Timeline Grid */}
          {!isLoading && priests.length > 0 && (
            <div className="max-w-6xl mx-auto">
              {priests.map((priest, index) => (
                <motion.div
                  key={priest.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative mb-16 last:mb-0"
                >
                  {/* Timeline Line */}
                  {index < priests.length - 1 && (
                    <div className="absolute left-1/2 top-full h-16 w-0.5 bg-gradient-to-b from-red-800 to-red-600 transform -translate-x-1/2 hidden md:block" />
                  )}

                  <div className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Image Side */}
                    <motion.div 
                      className="w-full md:w-1/2 flex justify-center"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedPriest(priest)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-red-600/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                        {priest.photo_url ? (
                          <img
                            src={priest.photo_url}
                            alt={priest.name}
                            className="relative w-64 h-64 rounded-2xl object-cover shadow-xl ring-4 ring-white"
                          />
                        ) : (
                          <div className="relative w-64 h-64 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-xl ring-4 ring-white">
                            <span className="text-6xl text-red-800">👤</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-colors duration-300 flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                            Ver Detalhes
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/2 text-center md:text-left">
                      <div className="relative">
                        {/* Timeline Dot */}
                        <div className="hidden md:block absolute top-0 w-4 h-4 bg-red-800 rounded-full shadow-lg" 
                          style={{ 
                            [index % 2 === 0 ? 'right' : 'left']: '-2rem',
                            top: '0.5rem'
                          }} 
                        />
                        
                        <motion.h2 
                          className="text-3xl font-bold text-gray-900 mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          {priest.name}
                        </motion.h2>
                        
                        {priest.was_parish_priest && priest.date_at_parish && (
                          <p className="text-red-800 font-semibold text-lg mb-4">
                            Foi Pároco - {priest.date_at_parish}
                          </p>
                        )}

                        <p className="text-gray-700 leading-relaxed mb-6">
                          {priest.description}
                        </p>

                        <Button
                          onClick={() => setSelectedPriest(priest)}
                          variant="primary"
                          size="md"
                        >
                          Ver Mais Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Video Section */}
                  {priest.video_url && (
                    <div className="mt-8 max-w-4xl mx-auto">
                      <div className="relative rounded-2xl overflow-hidden shadow-xl">
                        {playingVideo === priest.id ? (
                          <div className="aspect-video bg-black">
                            <video
                              controls
                              autoPlay
                              className="w-full h-full"
                              poster={priest.video_thumbnail_url || undefined}
                            >
                              <source src={priest.video_url} type="video/mp4" />
                              Seu navegador não suporta reprodução de vídeos.
                            </video>
                          </div>
                        ) : (
                          <div 
                            className="relative cursor-pointer group aspect-video"
                            onClick={() => setPlayingVideo(priest.id)}
                          >
                            <img
                              src={priest.video_thumbnail_url || '/placeholder-video.jpg'}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                <Play className="w-10 h-10 text-red-800 ml-1" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <PriestDetailsDialog
          open={Boolean(selectedPriest)}
          name={selectedPriest?.name || ''}
          title={selectedPriest?.was_parish_priest ? 'Pároco da comunidade' : 'Clero paroquial'}
          photoUrl={selectedPriest?.photo_url}
          description={selectedPriest?.description}
          metadata={selectedPriest?.date_at_parish ? [`Período na paróquia: ${selectedPriest.date_at_parish}`] : []}
          videoUrl={selectedPriest?.video_url}
          onClose={() => setSelectedPriest(null)}
        />
      </div>
    </>
  );
};
