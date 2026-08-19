import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, ChevronLeft, ChevronRight, Church, Facebook, Share2, Video, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VideoTestimonial } from '../lib/supabase';
import { SEO } from '../components/ui/SEO';
import { Footer } from '../components/layout/Footer';
import { toast } from 'react-hot-toast';

interface VideoTestimonialsPageProps {
  onBack: () => void;
  onNavigate: (section: string) => void;
}

export const VideoTestimonialsPage: React.FC<VideoTestimonialsPageProps> = ({ onBack, onNavigate }) => {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    fetchVideos();
    fetchLogo();
  }, []);

  useEffect(() => {
    if (videoPlayerRef.current) {
      const headerOffset = 20;
      const elementPosition = videoPlayerRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const fetchLogo = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('logo_url')
        .eq('key', 'logo_settings')
        .maybeSingle();

      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      // @ts-expect-error - Supabase returns string for enum, interface expects literal type
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const getYouTubeEmbedUrl = (youtubeId: string) => {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&cc_load_policy=1`;
  };

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  };

  const currentVideo = videos[currentIndex];

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent(`Assista: ${currentVideo?.name || 'Eventos e Informativos'}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${currentVideo?.name || 'Eventos e Informativos'}\n\n${currentVideo?.description || ''}\n\n`);
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextVideo();
    } else if (isRightSwipe) {
      prevVideo();
    }
  };

  return (
    <>
      <SEO
        title={`${currentVideo?.name || 'Eventos e Informativos'} - Paróquia Senhor Santo Cristo`}
        description={currentVideo?.description || 'Acompanhe os vídeos de eventos, celebrações e informações importantes da Paróquia Senhor Santo Cristo'}
        keywords="eventos, informativos, vídeos, paróquia, celebrações, comunidade"
        image={currentVideo?.thumbnail_url || undefined}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
        {/* Header */}
        <header className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0zNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZNMTYgMTRjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02TTQgMzRjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-white/90 hover:text-amber-300 mb-6 transition-all duration-300"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Voltar</span>
            </button>
            
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {logoUrl ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={logoUrl}
                  alt="Logo da Paróquia"
                  className="h-20 md:h-28 w-auto object-contain drop-shadow-2xl"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Church className="h-16 md:h-20 w-16 md:w-20 text-amber-300 drop-shadow-lg" />
                </motion.div>
              )}
              
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Video size={18} className="text-amber-300" />
                  <span className="text-amber-100 text-sm font-medium">Galeria de Vídeos</span>
                </div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 tracking-tight"
                >
                  Eventos e Informativos
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-amber-100 text-lg md:text-xl font-light"
                >
                  Vídeos de eventos, celebrações e informações da comunidade
                </motion.p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
          {loading ? (
            <div className="flex flex-col justify-center items-center min-h-[500px]">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-red-800 absolute top-0"></div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">Carregando vídeos...</p>
            </div>
          ) : videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
              <Video className="mx-auto h-20 w-20 text-red-300 mb-6" />
              <p className="text-2xl text-gray-700 font-semibold mb-2">Nenhum vídeo disponível</p>
              <p className="text-gray-500">Em breve teremos novos vídeos para compartilhar</p>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Video Player - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    ref={videoPlayerRef}
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {/* Video Player */}
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative">
                      {currentVideo.video_type === 'youtube' && currentVideo.youtube_id ? (
                        <iframe
                          src={getYouTubeEmbedUrl(currentVideo.youtube_id)}
                          title={currentVideo.name}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : currentVideo.video_url ? (
                        <video
                          controls
                          className="w-full h-full"
                          poster={currentVideo.thumbnail_url || undefined}
                        >
                          <source src={currentVideo.video_url} type="video/mp4" />
                          Seu navegador não suporta reprodução de vídeos.
                        </video>
                      ) : null}
                    </div>

                    {/* Video Info */}
                    <div className="p-6 md:p-8 bg-gradient-to-b from-white to-gray-50">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-800 to-red-900 rounded-xl flex items-center justify-center shadow-lg">
                          <Play className="text-white" size={24} fill="white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                            {currentVideo.name}
                          </h2>
                          <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                            {currentVideo.description}
                          </p>
                        </div>
                      </div>

                      {/* Share Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600 font-medium hidden sm:inline">Compartilhar:</span>
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <button
                            onClick={shareOnFacebook}
                            className="group flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex-1 sm:flex-initial"
                            aria-label="Compartilhar no Facebook"
                          >
                            <Facebook size={20} fill="white" className="flex-shrink-0" />
                            <span className="text-sm font-medium hidden sm:inline">Facebook</span>
                          </button>
                          <button
                            onClick={shareOnWhatsApp}
                            className="group flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex-1 sm:flex-initial"
                            aria-label="Compartilhar no WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
                          </button>
                          <button
                            onClick={copyLink}
                            className="group flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex-1 sm:flex-initial"
                            aria-label="Copiar link"
                          >
                            <Share2 size={20} className="flex-shrink-0" />
                            <span className="text-sm font-medium hidden sm:inline">Copiar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                {videos.length > 1 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <button
                        onClick={prevVideo}
                        className="group flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                        aria-label="Vídeo anterior"
                      >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline font-semibold">Anterior</span>
                      </button>

                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        {videos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`transition-all duration-300 rounded-full ${
                              index === currentIndex
                                ? 'bg-gradient-to-r from-red-800 to-red-900 w-8 h-2.5 shadow-lg'
                                : 'bg-gray-300 hover:bg-red-400 w-2.5 h-2.5 hover:scale-125'
                            }`}
                            aria-label={`Ir para vídeo ${index + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={nextVideo}
                        className="group flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                        aria-label="Próximo vídeo"
                      >
                        <span className="hidden sm:inline font-semibold">Próximo</span>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                        <div className="w-2 h-2 bg-red-800 rounded-full animate-pulse"></div>
                        <span className="text-gray-700 font-semibold text-sm">
                          Vídeo {currentIndex + 1} de {videos.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Video List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
                  <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-red-800" />
                    Outros Vídeos
                  </h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {videos.map((video, index) => (
                      <motion.button
                        key={video.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                          index === currentIndex
                            ? 'bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden relative">
                            {video.thumbnail_url || (video.video_type === 'youtube' && video.youtube_id) ? (
                              <img
                                src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id!)}
                                alt={video.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center">
                                <Play size={16} className="text-white" fill="white" />
                              </div>
                            )}
                            {index === currentIndex && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <Play size={12} className="text-red-800 ml-0.5" fill="currentColor" />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm line-clamp-2 ${
                              index === currentIndex ? 'text-white' : 'text-gray-900'
                            }`}>
                              {video.name}
                            </h4>
                            <span className={`text-xs ${
                              index === currentIndex ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer onNavigate={onNavigate} />
      </div>
    </>
  );
};
