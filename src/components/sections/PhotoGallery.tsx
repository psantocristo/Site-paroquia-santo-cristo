import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Folder, Camera, Images, ChevronRight } from 'lucide-react';
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
      const { data: albumsData, error: albumsError } = await supabase
        .from('photo_albums')
        .select(`
          *,
          photos(count)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(6);

      if (albumsError) throw albumsError;

      if (albumsData && albumsData.length > 0) {
        const albumsWithCount = albumsData.map(album => {
          const counts = album.photos as Array<{ count?: number }> | null;
          return {
            ...album,
            photoCount: counts?.[0]?.count || 0
          };
        });
        setAlbums(albumsWithCount);
      } else {
        const defaultAlbums: AlbumWithCount[] = [
          {
            id: '1',
            name: 'Celebrações & Missas',
            description: 'Momentos de oração e fé da comunidade paroquial',
            cover_image_url: 'https://images.pexels.com/photos/8468459/pexels-photo-8468459.jpeg?auto=compress&cs=tinysrgb&w=800',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 1,
            slug: 'celebracoes-e-missas',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photoCount: 24
          },
          {
            id: '2',
            name: 'Vida em Comunidade',
            description: 'Encontros de pastorais, jovens e famílias',
            cover_image_url: 'https://images.pexels.com/photos/7220900/pexels-photo-7220900.jpeg?auto=compress&cs=tinysrgb&w=800',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 2,
            slug: 'vida-em-comunidade',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photoCount: 18
          },
          {
            id: '3',
            name: 'Festas & Jubileu',
            description: 'Comemorações e festividades de nossa paróquia',
            cover_image_url: 'https://images.pexels.com/photos/6608313/pexels-photo-6608313.jpeg?auto=compress&cs=tinysrgb&w=800',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 3,
            slug: 'festas-e-jubileu',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            photoCount: 32
          },
          {
            id: '4',
            name: 'Ações de Solidariedade',
            description: 'Nossa missão e caridade cristã',
            cover_image_url: 'https://images.pexels.com/photos/8468456/pexels-photo-8468456.jpeg?auto=compress&cs=tinysrgb&w=800',
            cloudinary_public_id: null,
            is_active: true,
            order_index: 4,
            slug: 'acoes-de-solidariedade',
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigateToFullGallery();
    }
  };

  if (isLoading) {
    return (
      <section id="photos" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#240404] mx-auto" />
        </div>
      </section>
    );
  }

  if (albums.length === 0) return null;

  return (
    <section id="photos" className="py-10 md:py-16 bg-white border-t border-stone-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="institutional-kicker">
              <Camera className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Acervo paroquial</span>
            </div>
            <h2 className="institutional-title">
              Galeria de Fotos
            </h2>
          </div>

          <button
            onClick={onNavigateToFullGallery}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#240404] hover:text-[#931515] transition-colors group cursor-pointer"
          >
            <span>Ver todos os álbuns</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {albums.slice(0, 3).map((album, index) => (
            <motion.article
              key={album.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              onClick={() => handleAlbumClick(album)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') handleAlbumClick(album);
              }}
              role="link"
              tabIndex={0}
              className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(36,4,4,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c5a059]/70 hover:shadow-[0_16px_40px_rgba(36,4,4,0.12)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f6d25]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                {album.cover_image_url ? (
                  <img
                    src={album.cover_image_url}
                    alt={album.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#f4efe7] to-[#e8dfd1]">
                    <Folder className="h-12 w-12 text-[#8f6d25]/45" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-[#1c1111]/85 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-md">
                  <Images className="h-3.5 w-3.5 text-[#e8c872]" />
                  {album.photoCount || 0} fotos
                </span>
              </div>

              <div className="flex min-h-[190px] flex-col p-5 sm:p-6">
                <h3 className="font-serif text-xl font-semibold leading-snug text-[#240404] transition-colors group-hover:text-[#7a2020] line-clamp-2">
                  {album.name}
                </h3>
                {album.description && (
                  <p className="mt-2 text-sm leading-6 text-stone-600 line-clamp-3">
                    {album.description}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-2 border-t border-stone-100 pt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#7a2020]">
                  <span>Abrir álbum</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
