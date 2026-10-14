import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight, ChevronLeft, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
        .limit(8);

      if (error) throw error;
      setVideos((data || []).map(video => ({
        ...video,
        description: video.description || null,
        video_type: video.video_type === 'youtube' ? 'youtube' : 'upload',
        is_active: video.is_active === true,
        order_index: video.order_index || 0,
      })));
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  };

  if (loading) {
    return (
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#240404] mx-auto" />
        </div>
      </section>
    );
  }

  if (videos.length === 0) return null;

  return (
    <section id="videos-carousel" className="py-10 md:py-16 bg-[#faf7f2] border-t border-stone-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#240404]/5 border border-[#c5a059]/30 rounded-full text-[#240404] text-xs font-semibold uppercase tracking-wider mb-2.5">
              <Video className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Multimídia & Evangelização</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#240404] tracking-tight">
              Eventos & Vídeos
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Scroll navigation buttons for desktop */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full border border-stone-300 hover:border-[#c5a059] bg-white hover:bg-[#240404] text-stone-700 hover:text-[#e8c872] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                aria-label="Rolar para esquerda"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full border border-stone-300 hover:border-[#c5a059] bg-white hover:bg-[#240404] text-stone-700 hover:text-[#e8c872] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                aria-label="Rolar para direita"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              onClick={onNavigateToVideosPage}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#240404] hover:text-[#931515] transition-colors group cursor-pointer ml-2"
            >
              <span>Ver todos os vídeos</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videos.map((video, index) => {
            const thumbnail = video.thumbnail_url || (video.youtube_id ? getYouTubeThumbnail(video.youtube_id) : null);

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.35 }}
                className="flex-shrink-0 w-72 sm:w-80 snap-start"
              >
                <div
                  onClick={onNavigateToVideosPage}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-[#c5a059] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
                >
                  {/* Thumbnail & Play Overlay */}
                  <div className="relative aspect-video overflow-hidden bg-stone-900">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={video.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#240404] to-[#1c0303] flex items-center justify-center">
                        <Video className="text-[#e8c872]/40 h-12 w-12" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#240404]/90 group-hover:bg-[#e8c872] text-[#e8c872] group-hover:text-[#240404] flex items-center justify-center transition-all duration-300 shadow-xl border border-[#c5a059]/60 group-hover:scale-110">
                        <Play size={20} className="ml-0.5" fill="currentColor" />
                      </div>
                    </div>

                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-stone-200 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      {video.video_type === 'youtube' ? 'YouTube' : 'Vídeo'}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#240404] group-hover:text-[#931515] transition-colors line-clamp-2 leading-snug mb-1.5">
                        {video.name}
                      </h3>
                      {video.description && (
                        <p className="text-stone-600 text-xs line-clamp-2 font-light leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#240404]">
                      <span className="group-hover:text-[#931515] transition-colors">Assistir gravação</span>
                      <ChevronRight className="h-4 w-4 text-[#c5a059] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
