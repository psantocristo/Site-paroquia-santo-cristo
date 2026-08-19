import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Folder, Camera, Images, Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase, PhotoAlbum } from '../../lib/supabase';

interface PhotoGalleryProps {
  onNavigateToFullGallery: () => void;
}

interface AlbumWithCount extends PhotoAlbum {
  photoCount?: number;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onNavigateToFullGallery }) => {
  const [albums, setAlbums] = useState<AlbumWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlbumsWithCount();
  }, []);

  const fetchAlbumsWithCount = async () => {
    setIsLoading(true);
    try {
      // Buscar álbuns com contagem de fotos
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
        // Álbuns padrão se não existirem
        const defaultAlbums: AlbumWithCount[] = [
          {
            id: '1',
            name: '40 Anos de História',
            description: 'Fotos históricas da paróquia desde sua fundação',
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
            description: 'Momentos marcantes das principais celebrações',
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

  const handleAlbumClick = (album: AlbumWithCount) => {
    if (album.slug) {
      window.history.pushState(null, '', `/album/${album.slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      onNavigateToFullGallery();
    }
  };

  if (isLoading) {
    return (
      <section id="photos" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-4">
              <Camera className="h-4 w-4" />
              Memórias
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Galeria de Fotos
            </h2>
          </div>
          {/* Skeleton Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${i === 1 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="photos" className="py-8 md:py-12 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Elegante */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Badge decorativo */}
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-4">
            <Camera className="h-4 w-4" />
            Memórias
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Galeria de Fotos
          </h2>
          
          <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg">
            Explore nossos álbuns com momentos especiais e memórias preciosas
          </p>
        </motion.div>

        {albums.length === 0 ? (
          <Card className="p-12 text-center">
            <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum álbum encontrado
            </h3>
            <p className="text-gray-500">
              Use o painel administrativo para criar álbuns de fotos
            </p>
          </Card>
        ) : (
          <>
            {/* Grid Moderno com Hierarquia Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {albums.slice(0, 4).map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                >
                  <button
                    onClick={() => handleAlbumClick(album)}
                    className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-2xl group"
                  >
                    <Card className="relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                      {/* Imagem com aspect ratio dinâmico */}
                      <div className={`overflow-hidden ${index === 0 ? 'aspect-square md:aspect-[4/3]' : 'aspect-[4/3]'}`}>
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
                      
                      {/* Overlay gradiente elegante */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                      
                      {/* Conteúdo sobreposto na parte inferior */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        {/* Badge de quantidade de fotos */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-3">
                          <Images className="h-3.5 w-3.5" />
                          {album.photoCount || 0} fotos
                        </span>
                        
                        <h3 className={`font-bold text-white mb-1 group-hover:text-red-200 transition-colors ${index === 0 ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>
                          {album.name}
                        </h3>
                        
                        <p className={`text-white/70 line-clamp-1 ${index === 0 ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`}>
                          {album.description}
                        </p>
                      </div>
                      
                      {/* Ícone de play/ver no centro (hover) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className={`bg-white/95 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform ${index === 0 ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12 md:w-14 md:h-14'}`}>
                          <Play className={`text-red-700 ml-1 ${index === 0 ? 'h-7 w-7 md:h-8 md:w-8' : 'h-5 w-5 md:h-6 md:w-6'}`} />
                        </div>
                      </div>
                    </Card>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Ver Todos os Álbuns Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-10 md:mt-12"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={onNavigateToFullGallery}
                className="px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <span>Ver Todos os Álbuns</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                  {albums.length}
                </span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};
