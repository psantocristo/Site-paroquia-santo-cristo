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
            title: '40 Anos de Fé e Comunhão',
            description: 'Celebrando quatro décadas de bênçãos, milagres e união em Cristo',
            image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            cloudinary_public_id: null,
            order_index: 0,
            is_active: true,
            button_text: null,
            button_link: null,
            button_link_type: null,
            button_open_new_tab: null,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Nossa Comunidade Unida',
            description: 'Fiéis de todas as idades unidos pela fé no Senhor Santo Cristo dos Milagres',
            image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            cloudinary_public_id: null,
            order_index: 1,
            is_active: true,
            button_text: null,
            button_link: null,
            button_link_type: null,
            button_open_new_tab: null,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Tradição e Modernidade',
            description: 'Preservando nossa rica tradição enquanto abraçamos o futuro com esperança',
            image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            cloudinary_public_id: null,
            order_index: 2,
            is_active: true,
            button_text: null,
            button_link: null,
            button_link_type: null,
            button_open_new_tab: null,
            created_at: new Date().toISOString()
          }
        ];
        setSlides(defaultSlides);
        const img = new Image();
        img.onload = () => setImageLoaded(prev => ({ ...prev, 0: true }));
        img.src = defaultSlides[0].image_url;
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleButtonClick = (slide: Slide) => {
    if (!slide.button_link) return;

    if (slide.button_link_type === 'external') {
      if (slide.button_open_new_tab === 'true') {
        window.open(slide.button_link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = slide.button_link;
      }
    } else {
      const targetId = slide.button_link.replace('#', '');
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = slide.button_link;
      }
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden mt-14 sm:mt-16" style={{ aspectRatio: '16/10', maxHeight: '600px' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-red-800">
          <img 
            src="/capa.webp" 
            alt="Carregando..." 
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
            <div className="max-w-3xl">
              <div className="h-5 w-24 bg-white/20 rounded-full mb-4 animate-pulse" />
              <div className="h-10 md:h-14 lg:h-16 bg-white/20 rounded-lg w-3/4 mb-4 animate-pulse" />
              <div className="h-4 md:h-5 bg-white/15 rounded w-full max-w-xl mb-2 animate-pulse" />
              <div className="h-4 md:h-5 bg-white/15 rounded w-2/3 max-w-md mb-6 animate-pulse" />
              <div className="h-12 w-36 bg-white/25 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800 mt-14 sm:mt-16" style={{ aspectRatio: '16/10', maxHeight: '600px' }}>
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Paróquia Senhor Santo Cristo dos Milagres
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-amber-200 mb-2">
            40 Anos de Fé e Comunhão
          </p>
          <p className="text-sm sm:text-base md:text-lg text-amber-100">
            Cid. Tiradentes, São Paulo
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden group mt-14 sm:mt-16" style={{ aspectRatio: '16/10', maxHeight: '600px' }}>
      {/* CLS prevention: fixed container with aspect-ratio */}
      {/* Slides com transição de fade */}
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => {
          if (index !== currentSlide) return null;
          
          return (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              {/* Imagem de fundo */}
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-full h-full object-cover"
                width={1920}
                height={1080}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding={index === 0 ? 'sync' : 'async'}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)';
                  }
                }}
              />

              {/* Overlays para legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Conteúdo do slide */}
              <div className="absolute inset-0 flex items-end">
                <div className="w-full px-5 sm:px-8 md:px-10 lg:px-12 pb-10 sm:pb-12 md:pb-20 pt-4">
                  <div className="max-w-3xl">
                    {/* Badge decorativo */}
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="inline-block bg-red-600/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4 shadow-lg"
                    >
                      ✦ Destaque
                    </motion.span>

                    {/* Título */}
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg leading-tight"
                    >
                      {slide.title}
                    </motion.h2>

                    {/* Descrição */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className={`text-sm sm:text-base md:text-lg text-gray-100/90 mb-5 md:mb-6 drop-shadow-md max-w-2xl ${
                        isMobile ? 'line-clamp-2' : 'line-clamp-3'
                      }`}
                    >
                      {slide.description}
                    </motion.p>

                    {/* Botão CTA */}
                    {slide.button_text && slide.button_link && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <Button
                          onClick={() => handleButtonClick(slide)}
                          variant="secondary"
                          className="px-6 py-3 md:px-8 md:py-3.5 text-sm md:text-base font-semibold shadow-xl hover:shadow-2xl"
                        >
                          {slide.button_text}
                          {slide.button_link_type === 'external' && (
                            <ExternalLink className="ml-2 h-4 w-4 inline-block" />
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Navegação - Setas (aparecem no hover) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 
                       bg-black/30 backdrop-blur-sm border border-white/20 
                       text-white hover:bg-black/50 hover:border-white/40
                       rounded-full w-10 h-10 md:w-12 md:h-12 
                       flex items-center justify-center 
                       transition-all duration-300 
                       opacity-0 group-hover:opacity-100
                       focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 
                       bg-black/30 backdrop-blur-sm border border-white/20 
                       text-white hover:bg-black/50 hover:border-white/40
                       rounded-full w-10 h-10 md:w-12 md:h-12 
                       flex items-center justify-center 
                       transition-all duration-300 
                       opacity-0 group-hover:opacity-100
                       focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Indicadores (Dots) - apenas desktop */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentSlide
                  ? 'w-8 h-2 bg-white shadow-lg'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Barra de progresso */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <motion.div
            key={currentSlide}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: transitionTime / 1000, ease: 'linear' }}
            className="h-full bg-red-500"
          />
        </div>
      )}
    </section>
  );
};
