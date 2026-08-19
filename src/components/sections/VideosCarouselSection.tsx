import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface VideoTestimonial {
  id: string;
  name: string;
  description: string | null;
  video_type: 'upload' | 'youtube';
  video_url: string | null;
  youtube_id: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
}

interface VideosCarouselSectionProps {
  onNavigateToVideosPage: () => void;
}

export const VideosCarouselSection: React.FC<VideosCarouselSectionProps> = ({ onNavigateToVideosPage }) => {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(6);

      if (error) throw error;
      // @ts-expect-error - Supabase returns string for enum, interface expects literal type
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-red-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section id="videos-carousel" className="py-12 bg-gradient-to-br from-red-50 via-white to-amber-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full mb-4">
            <Video size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">Multimídia</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Eventos e Informativos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Acompanhe os vídeos de eventos, celebrações e informações importantes da nossa comunidade
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Gradient Overlay Left */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-red-50 to-transparent z-10 pointer-events-none" />
          
          {/* Gradient Overlay Right */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-72 md:w-80 snap-start"
              >
                <div
                  onClick={onNavigateToVideosPage}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    {video.thumbnail_url || (video.video_type === 'youtube' && video.youtube_id) ? (
                      <img
                        src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id!)}
                        alt={video.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center">
                        <Video className="text-white/50" size={48} />
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/90 group-hover:bg-white group-hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg">
                        <Play size={24} className="text-red-800 ml-1" fill="currentColor" />
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-red-800 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {video.video_type === 'youtube' ? 'YouTube' : 'Vídeo'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-red-800 transition-colors">
                      {video.name}
                    </h3>
                    {video.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Ver Todos Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: videos.length * 0.1, duration: 0.5 }}
              className="flex-shrink-0 w-72 md:w-80 snap-start"
            >
              <div
                onClick={onNavigateToVideosPage}
                className="group cursor-pointer h-full bg-gradient-to-br from-red-800 to-red-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center min-h-[280px] p-6"
              >
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ChevronRight size={40} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2 text-center">
                  Ver Todos os Vídeos
                </h3>
                <p className="text-white/80 text-sm text-center">
                  Acesse a galeria completa de eventos e informativos
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Scroll Hint */}
        <div className="flex md:hidden justify-center mt-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>Deslize para ver mais</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Desktop CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="hidden md:flex justify-center mt-8"
        >
          <button
            onClick={onNavigateToVideosPage}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Video size={20} />
            <span className="font-semibold">Ver Galeria Completa</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
