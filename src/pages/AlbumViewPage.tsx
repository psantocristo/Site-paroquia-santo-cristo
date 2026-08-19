import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Loader, Images, Calendar, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { supabase, PhotoAlbum, Photo } from '../lib/supabase';
import toast from 'react-hot-toast';
import { SEO } from '../components/ui/SEO';

interface AlbumViewPageProps {
  slug: string;
  onBack: () => void;
}

export const AlbumViewPage: React.FC<AlbumViewPageProps> = ({ slug, onBack }) => {
  const [album, setAlbum] = useState<PhotoAlbum | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    fetchAlbumAndPhotos();
  }, [slug]);

  const fetchAlbumAndPhotos = async () => {
    try {
      setLoading(true);

      const { data: albumData, error: albumError } = await supabase
        .from('photo_albums')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (albumError) throw albumError;

      if (!albumData) {
        toast.error('Álbum não encontrado');
        onBack();
        return;
      }

      setAlbum(albumData);

      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumData.id)
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;
      setPhotos(photosData || []);
    } catch (error) {
      console.error('Error fetching album:', error);
      toast.error('Erro ao carregar álbum');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSlideDirection('left');
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
      resetZoom();
    }
  }, [selectedPhotoIndex]);

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSlideDirection('right');
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
      resetZoom();
    }
  }, [selectedPhotoIndex, photos.length]);

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || zoomLevel > 1) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNextPhoto();
      else handlePrevPhoto();
    }
    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex !== null) {
        if (e.key === 'ArrowRight') handleNextPhoto();
        if (e.key === 'ArrowLeft') handlePrevPhoto();
        if (e.key === 'Escape') setSelectedPhotoIndex(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handleNextPhoto, handlePrevPhoto]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin text-red-700 mx-auto mb-4" />
          <p className="text-gray-500">Carregando álbum...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-14 sm:pt-16">
      <SEO
        title={`${album.name} | Galeria de Fotos`}
        description={album.description || `Veja as fotos do álbum ${album.name}`}
        image={album.cover_image_url || 'https://paroquiasantocristo.com.br/capa.webp'}
        url={`https://paroquiasantocristo.com.br/album/${slug}`}
        type="website"
      />

      {/* Hero Header com imagem de fundo - ocupa o topo completo */}
      <div className="relative h-[24rem] md:h-[30rem] lg:h-[34rem] overflow-hidden">
        <img 
          src={album.cover_image_url || 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg'} 
          alt={album.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/30" />
        
        {/* Botão voltar flutuante no topo */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
        
        {/* Info do álbum sobreposta */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight font-bold text-white mb-3 max-w-4xl"
            >
              {album.name}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/85"
            >
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                <Images className="h-4 w-4" />
                {photos.length} fotos
              </span>
              {album.created_at && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(album.created_at)}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Grid de fotos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {album.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-gray-700 mb-6 max-w-3xl text-sm sm:text-base leading-relaxed"
          >
            {album.description}
          </motion.p>
        )}
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Images className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma foto neste álbum
            </h3>
            <p className="text-gray-500">
              Este álbum ainda não possui fotos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {photos.map((photo, index) => {
              // Variar tamanhos para visual dinâmico (masonry-like)
              const isLarge = index % 7 === 0;
              const isMedium = index % 5 === 0 && !isLarge;
              
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                  className={`
                    ${isLarge ? 'col-span-2 row-span-2' : ''}
                    ${isMedium ? 'col-span-2' : ''}
                  `}
                >
                  <button
                    onClick={() => setSelectedPhotoIndex(index)}
                    className="relative aspect-square w-full overflow-hidden rounded-xl group cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.title || `Foto ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Overlay no hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-gray-800" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Número da foto */}
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de visualização cinematográfico */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header do modal */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Info da foto */}
                <div className="text-white flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {photos[selectedPhotoIndex]?.title || 'Sem título'}
                  </h3>
                  <p className="text-sm text-white/60">
                    {selectedPhotoIndex + 1} de {photos.length}
                  </p>
                </div>
                
                {/* Controles de zoom */}
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    disabled={zoomLevel <= 1}
                  >
                    <ZoomOut className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <span className="text-white/60 text-sm min-w-[3rem] text-center hidden md:block">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <div className="w-px h-6 bg-white/20 mx-1 md:mx-2 hidden md:block" />
                  <button
                    onClick={() => setSelectedPhotoIndex(null)}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Imagem principal com transição suave */}
            <div 
              className="flex-1 flex items-center justify-center p-4 overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={photos[selectedPhotoIndex]?.id}
                  src={photos[selectedPhotoIndex]?.image_url}
                  alt={photos[selectedPhotoIndex]?.title || ''}
                  initial={{ 
                    opacity: 0, 
                    x: slideDirection === 'right' ? 100 : -100,
                    scale: 0.95
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ 
                    opacity: 0, 
                    x: slideDirection === 'right' ? -100 : 100,
                    scale: 0.95
                  }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                  }}
                  draggable={false}
                />
              </AnimatePresence>
            </div>

            {/* Navegação lateral elegante */}
            {selectedPhotoIndex > 0 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {selectedPhotoIndex < photos.length - 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Thumbnails na parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="flex items-center justify-center gap-1.5 md:gap-2 overflow-x-auto max-w-4xl mx-auto pb-2 scrollbar-hide">
                {photos.map((thumb, index) => (
                  <button
                    key={thumb.id}
                    onClick={() => {
                      setSlideDirection(index > selectedPhotoIndex ? 'right' : 'left');
                      setSelectedPhotoIndex(index);
                      resetZoom();
                    }}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === selectedPhotoIndex 
                        ? 'border-white w-14 h-14 md:w-16 md:h-16 scale-110' 
                        : 'border-transparent w-10 h-10 md:w-12 md:h-12 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img 
                      src={thumb.image_url} 
                      alt=""
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
              
              {/* Info da foto atual */}
              {photos[selectedPhotoIndex]?.description && (
                <div className="text-center mt-3 max-w-2xl mx-auto">
                  <p className="text-white/70 text-sm">
                    {photos[selectedPhotoIndex].description}
                  </p>
                </div>
              )}
              
              {/* Dica de navegação */}
              <p className="text-center text-white/40 text-xs mt-2 hidden md:block">
                Use ← → para navegar | ESC para fechar | Deslize no mobile
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
