import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase, Slide } from '../../lib/supabase';

export const SlidesSection: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [transitionTime, setTransitionTime] = useState(8000);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSlides();
    fetchTransitionTime();
  }, []);

  const fetchTransitionTime = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'slide_transition_time')
        .single();
      
      if (data?.value) {
        const seconds = parseInt(data.value, 10);
        if (!isNaN(seconds) && seconds > 0) {
          setTransitionTime(seconds * 1000);
        }
      }
    } catch (error) {
      console.log('Using default slide transition time');
    }
  };

  useEffect(() => {
    if (slides.length > 1) {
      const nextIndex = (currentSlide + 1) % slides.length;
      const nextSlide = slides[nextIndex];
      if (nextSlide?.image_url && !imageLoaded[nextIndex]) {
        const img = new Image();
        img.onload = () => setImageLoaded(prev => ({ ...prev, [nextIndex]: true }));
        img.src = nextSlide.image_url;
      }
    }
  }, [currentSlide, slides, imageLoaded]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, transitionTime);

    return () => clearInterval(interval);
  }, [slides.length, transitionTime]);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (data && data.length > 0) {
        setSlides(data);
        if (data[0]?.image_url) {
          const img = new Image();
          img.onload = () => setImageLoaded(prev => ({ ...prev, 0: true }));
          img.src = data[0].image_url;
        }
      } else {
        const defaultSlides: Slide[] = [
          {
            id: '1',
            title: 'Paróquia Senhor Santo Cristo',
            description: 'Comunidade de fé, esperança e amor em Cidade Tiradentes',
            image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            cloudinary_public_id: null,
            order_index: 0,
            is_active: true,
            button_text: null,
            button_link: null,
            button_link_type: null,
            button_open_new_tab: null,
            created_at: new Date().toISOString()
          }
        ];
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleButtonClick = (slide: Slide) => {
    if (!slide.button_link) return;

    if (slide.button_link_type === 'external' || slide.button_link.startsWith('http')) {
      if (slide.button_open_new_tab) {
        window.open(slide.button_link, '_blank');
      } else {
        window.location.href = slide.button_link;
      }
    } else {
      window.history.pushState(null, '', slide.button_link);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden bg-stone-900 mt-16 sm:mt-20 aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[620px]">
        <div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e8c872] border-t-transparent" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden group mt-16 sm:mt-20 aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[620px] bg-stone-950">
      {/* Slides with smooth transition */}
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => {
          if (index !== currentSlide) return null;

          return (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                width={1920}
                height={1080}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />

              {/* Gradient Overlays for perfect legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#200303]/70 via-transparent to-transparent hidden md:block" />

              {/* Slide Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-12 lg:p-16 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="space-y-2.5 sm:space-y-3.5"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#240404]/80 backdrop-blur-md border border-[#c5a059]/40 text-[#e8c872] text-[11px] font-bold tracking-widest uppercase">
                    <span>✦ Destaque</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
                    {slide.title}
                  </h1>

                  {slide.description && (
                    <p className="text-stone-200 text-xs sm:text-sm md:text-lg max-w-2xl font-light line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow">
                      {slide.description}
                    </p>
                  )}

                  {slide.button_text && slide.button_link && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleButtonClick(slide)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-[#e8c872] to-[#c9a84c] text-[#240404] font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:from-[#f3db92] hover:to-[#c9a84c] transition-all cursor-pointer border border-[#f5ecd0]/60 active:scale-95"
                      >
                        <span>{slide.button_text}</span>
                        {slide.button_link_type === 'external' ? (
                          <ExternalLink size={15} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Navigation Arrows (Desktop) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#240404]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 hover:border-[#c5a059] backdrop-blur-sm cursor-pointer z-20"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#240404]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 hover:border-[#c5a059] backdrop-blur-sm cursor-pointer z-20"
            aria-label="Próximo slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 sm:bottom-5 right-5 sm:right-8 flex items-center gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-6 bg-[#e8c872]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
