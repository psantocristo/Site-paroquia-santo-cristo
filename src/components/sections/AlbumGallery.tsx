import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Folder, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, X, Images, Calendar, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, PhotoAlbum, Photo } from '../../lib/supabase';

interface AlbumGalleryProps {
  onBack: () => void;
}

interface AlbumWithCount extends PhotoAlbum {
  photoCount?: number;
}

export const AlbumGallery: React.FC<AlbumGalleryProps> = ({ onBack }) => {
  const [albums, setAlbums] = useState<AlbumWithCount[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithCount | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAlbums();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const { data: albumsData, error: albumsError } = await supabase
        .from('photo_albums')
        .select(`
          *,
          photos(count)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (albumsError) throw albumsError;
      
      if (albumsData && albumsData.length > 0) {
        const albumsWithCount = albumsData.map(album => ({
          ...album,
          photoCount: (album.photos as any)?.[0]?.count || 0
        }));
        setAlbums(albumsWithCount);
      } else {
        const defaultAlbums: AlbumWithCount[] = [
          {
            id: '1',
            name: '40 Anos de História',
            description: 'Fotos históricas da paróquia desde sua fundação até os dias atuais',
            cover_image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 1,
            slug: '40-anos-de-historia',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photoCount: 24
          },
          {
            id: '2',
            name: 'Celebrações Especiais',
            description: 'Momentos marcantes das principais celebrações e festividades',
            cover_image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 2,
            slug: 'celebracoes-especiais',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photoCount: 18
          },
          {
            id: '3',
            name: 'Vida Comunitária',
            description: 'O dia a dia da nossa comunidade paroquial',
            cover_image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 3,
            slug: 'vida-comunitaria',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photoCount: 32
          },
          {
            id: '4',
            name: 'Eventos Especiais',
            description: 'Festividades e eventos marcantes da paróquia',
            cover_image_url: 'https://images.pexels.com/photos/8468456/pexels-photo-8468456.jpeg',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 4,
            slug: 'eventos-especiais',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photoCount: 15
          }
        ];
        setAlbums(defaultAlbums);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId: string) => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbumPhotos(data || []);
    } catch (error) {
      console.error('Error fetching album photos:', error);
      setAlbumPhotos([]);
    }
  };

  const handleAlbumSelect = async (album: AlbumWithCount) => {
    if (album.slug) {
      window.location.hash = `#album/${album.slug}`;
    } else {
      setSelectedAlbum(album);
      await fetchAlbumPhotos(album.id);
    }
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
    setSelectedPhoto(null);
  };

  const handlePhotoSelect = (photo: Photo) => {
    const index = albumPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(index);
    setSelectedPhoto(photo);
    resetZoom();
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleNextPhoto = useCallback(() => {
    const nextIndex = (currentPhotoIndex + 1) % albumPhotos.length;
    setSlideDirection('right');
    setCurrentPhotoIndex(nextIndex);
    setSelectedPhoto(albumPhotos[nextIndex]);
    resetZoom();
  }, [currentPhotoIndex, albumPhotos]);

  const handlePrevPhoto = useCallback(() => {
    const prevIndex = (currentPhotoIndex - 1 + albumPhotos.length) % albumPhotos.length;
    setSlideDirection('left');
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(albumPhotos[prevIndex]);
    resetZoom();
  }, [currentPhotoIndex, albumPhotos]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhoto) {
        if (e.key === 'ArrowRight') handleNextPhoto();
        if (e.key === 'ArrowLeft') handlePrevPhoto();
        if (e.key === 'Escape') setSelectedPhoto(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, handleNextPhoto, handlePrevPhoto]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-700 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando álbuns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto pt-14 sm:pt-16 pb-20">
      {/* Header Refinado */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm fixed top-14 sm:top-16 left-0 right-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <Button
                variant="outline"
                onClick={selectedAlbum ? handleBackToAlbums : onBack}
                className="flex items-center gap-2 flex-shrink-0 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {selectedAlbum ? 'Álbuns' : 'Voltar'}
                </span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {selectedAlbum ? selectedAlbum.name : 'Galeria de Fotos'}
                </h1>
                <p className="text-sm text-gray-500 truncate">
                  {selectedAlbum 
                    ? `${albumPhotos.length} foto${albumPhotos.length !== 1 ? 's' : ''}`
                    : `${albums.length} álbum${albums.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
            
            {/* Contador visual */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <Images className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {selectedAlbum ? albumPhotos.length : albums.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 sm:pt-28">
        {!selectedAlbum ? (
          /* Albums Grid */
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Explore Nossos Álbuns</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Clique em um álbum para ver todas as fotos</p>
            </motion.div>

            {albums.length === 0 ? (
              <Card className="p-12 text-center">
                <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum álbum encontrado
                </h3>
                <p className="text-gray-500">
                  Use o painel administrativo para criar álbuns
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {albums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <button
                      onClick={() => handleAlbumSelect(album)}
                      className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-2xl group"
                    >
                      <Card className="relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                        {/* Imagem */}
                        <div className="aspect-[4/3] overflow-hidden">
                          {album.cover_image_url ? (
                            <img
                              src={album.cover_image_url}
                              alt={album.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Folder className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        {/* Conteúdo sobreposto */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                          {/* Badge de quantidade */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-2">
                            <Images className="h-3.5 w-3.5" />
                            {album.photoCount || 0} fotos
                          </span>
                          
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-200 transition-colors line-clamp-1">
                            {album.name}
                          </h3>
                          
                          <p className="text-white/70 text-sm line-clamp-1">
                            {album.description}
                          </p>
                          
                          {album.created_at && (
                            <div className="flex items-center gap-1.5 mt-2 text-white/50 text-xs">
                              <Calendar className="h-3 w-3" />
                              {formatDate(album.created_at)}
                            </div>
                          )}
                        </div>
                        
                        {/* Ícone central no hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="h-6 w-6 text-red-700 ml-1" />
                          </div>
                        </div>
                      </Card>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Album Photos Grid */
          <>
            {selectedAlbum.description && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 text-center"
              >
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {selectedAlbum.description}
                </p>
              </motion.div>
            )}

            {albumPhotos.length === 0 ? (
              <Card className="p-12 text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma foto neste álbum
                </h3>
                <p className="text-gray-500">
                  Use o painel administrativo para adicionar fotos
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {albumPhotos.map((photo, index) => {
                  // Layout masonry-like
                  const isLarge = index % 7 === 0;
                  const isMedium = index % 5 === 0 && !isLarge;
                  
                  return (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                      className={`
                        ${isLarge ? 'col-span-2 row-span-2' : ''}
                        ${isMedium ? 'col-span-2' : ''}
                      `}
                    >
                      <button
                        onClick={() => handlePhotoSelect(photo)}
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
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <ZoomIn className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
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
          </>
        )}

        {/* Photo Modal Cinematográfico */}
        <AnimatePresence>
          {selectedPhoto && (
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
                      {selectedPhoto.title || 'Sem título'}
                    </h3>
                    <p className="text-sm text-white/60">
                      {currentPhotoIndex + 1} de {albumPhotos.length}
                    </p>
                  </div>
                  
                  {/* Controles */}
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
                      onClick={() => setSelectedPhoto(null)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                      <X className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Imagem principal */}
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
                    key={selectedPhoto.id}
                    src={selectedPhoto.image_url}
                    alt={selectedPhoto.title || ''}
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

              {/* Navegação lateral */}
              {albumPhotos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Thumbnails + Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* Thumbnails */}
                <div className="flex items-center justify-center gap-1.5 md:gap-2 overflow-x-auto max-w-4xl mx-auto pb-2 scrollbar-hide">
                  {albumPhotos.map((thumb, index) => (
                    <button
                      key={thumb.id}
                      onClick={() => {
                        setSlideDirection(index > currentPhotoIndex ? 'right' : 'left');
                        setCurrentPhotoIndex(index);
                        setSelectedPhoto(thumb);
                        resetZoom();
                      }}
                      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentPhotoIndex 
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
                
                {/* Descrição da foto */}
                {selectedPhoto.description && (
                  <div className="text-center mt-3 max-w-2xl mx-auto">
                    <p className="text-white/70 text-sm">
                      {selectedPhoto.description}
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
    </div>
  );
};
