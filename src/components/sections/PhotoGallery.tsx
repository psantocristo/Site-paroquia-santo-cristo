import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Folder, Camera, Images, Eye, ChevronRight } from 'lucide-react';
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
        const albumsWithCount = albumsData.map(album => ({
          ...album,
          photoCount: (album.photos as any)?.[0]?.count || 0
        }));
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#240404]/5 border border-[#c5a059]/30 rounded-full text-[#240404] text-xs font-semibold uppercase tracking-wider mb-2.5">
              <Camera className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Memórias & Comunidade</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#240404] tracking-tight">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {albums.slice(0, 4).map((album, index) => (
            <motion.article
              key={album.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              onClick={() => handleAlbumClick(album)}
              className="group relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-200/80 hover:border-[#c5a059] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end aspect-[4/5]"
            >
              {/* Background Photo */}
              {album.cover_image_url ? (
                <img
                  src={album.cover_image_url}
                  alt={album.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#240404] to-[#1c0303] flex items-center justify-center">
                  <Folder className="h-12 w-12 text-[#c5a059]/40" />
                </div>
              )}

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-300" />

              {/* Card Top Pill: Count */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[#e8c872] text-[11px] font-bold tracking-wide border border-white/15">
                  <Images className="h-3 w-3 text-[#e8c872]" />
                  {album.photoCount || 0} fotos
                </span>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 p-5 space-y-1.5">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white group-hover:text-[#e8c872] transition-colors leading-snug line-clamp-2">
                  {album.name}
                </h3>
                {album.description && (
                  <p className="text-stone-300 text-xs font-light line-clamp-2 leading-relaxed">
                    {album.description}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#e8c872] opacity-90 group-hover:opacity-100 transition-opacity">
                  <span>Abrir álbum</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
