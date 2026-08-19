import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Folder, User, FileText, Megaphone, Heart, Calendar, Loader, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { SEO } from '../components/ui/SEO';

interface SearchPageProps {
  onBack: () => void;
}

const searchSchema = z.object({
  query: z.string().trim().min(2, 'Digite pelo menos 2 caracteres').max(100, 'Máximo de 100 caracteres')
});

interface SearchResult {
  id: string;
  type: 'album' | 'priest' | 'blog' | 'announcement' | 'campaign' | 'program';
  title: string;
  description?: string;
  slug?: string;
  url: string;
  image?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = useCallback(async (query: string) => {
    try {
      const validation = searchSchema.safeParse({ query });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);
      const searchResults: SearchResult[] = [];

      const { data: albums } = await supabase
        .from('photo_albums')
        .select('id, name, description, slug, cover_image_url')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (albums) {
        albums.forEach(album => {
          searchResults.push({
            id: album.id,
            type: 'album',
            title: album.name,
            description: album.description || undefined,
            slug: album.slug || undefined,
            url: album.slug ? `#album/${album.slug}` : '#photos',
            image: album.cover_image_url || undefined
          });
        });
      }

      const { data: priests } = await supabase
        .from('priests_gallery')
        .select('id, name, description, photo_url')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (priests) {
        priests.forEach(priest => {
          searchResults.push({
            id: priest.id,
            type: 'priest',
            title: priest.name,
            description: priest.description.substring(0, 100) + '...',
            url: '/galeria-dos-padres',
            image: priest.photo_url || undefined
          });
        });
      }

      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, featured_image')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(5);

      if (posts) {
        posts.forEach(post => {
          searchResults.push({
            id: post.id,
            type: 'blog',
            title: post.title,
            description: post.excerpt || undefined,
            slug: post.slug || undefined,
            url: post.slug ? `#post/${post.slug}` : '#blog',
            image: post.featured_image || undefined
          });
        });
      }

      const { data: announcements } = await supabase
        .from('parish_announcements')
        .select('id, title, content, slug, flyer_url')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(5);

      if (announcements) {
        announcements.forEach(announcement => {
          searchResults.push({
            id: announcement.id,
            type: 'announcement',
            title: announcement.title,
            description: announcement.content.substring(0, 100).replace(/<[^>]*>/g, '') + '...',
            slug: announcement.slug || undefined,
            url: announcement.slug ? `#avisos/${announcement.slug}` : '#avisos',
            image: announcement.flyer_url || undefined
          });
        });
      }

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, title, description, slug, featured_image')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (campaigns) {
        campaigns.forEach(campaign => {
          searchResults.push({
            id: campaign.id,
            type: 'campaign',
            title: campaign.title,
            description: campaign.description.substring(0, 100) + '...',
            slug: campaign.slug,
            url: `/campanha/${campaign.slug}`,
            image: campaign.featured_image || undefined
          });
        });
      }

      const { data: programs } = await supabase
        .from('programs')
        .select('id, title, description, slug')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (programs) {
        programs.forEach(program => {
          searchResults.push({
            id: program.id,
            type: 'program',
            title: program.title,
            description: program.description.substring(0, 100) + '...',
            url: '/programacoes'
          });
        });
      }

      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError('Nenhum resultado encontrado');
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao realizar busca. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'album': return <Folder className="h-5 w-5 text-red-600" />;
      case 'priest': return <User className="h-5 w-5 text-purple-600" />;
      case 'blog': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'announcement': return <Megaphone className="h-5 w-5 text-amber-600" />;
      case 'campaign': return <Heart className="h-5 w-5 text-pink-600" />;
      case 'program': return <Calendar className="h-5 w-5 text-green-600" />;
      default: return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'album': return 'Álbum';
      case 'priest': return 'Padre';
      case 'blog': return 'Blog';
      case 'announcement': return 'Aviso';
      case 'campaign': return 'Campanha';
      case 'program': return 'Programação';
      default: return 'Resultado';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.url.startsWith('#')) {
      window.location.hash = result.url.substring(1);
    } else {
      window.location.pathname = result.url;
    }
    onBack();
  };

  return (
    <>
      <SEO 
        title="Pesquisar"
        description="Busque por álbuns, padres, posts do blog, avisos, campanhas e programações"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 pt-14 sm:pt-16">
        {/* Header */}
        <div className="sticky top-14 sm:top-16 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por álbuns, padres, posts, avisos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                  maxLength={100}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isSearching && (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-12 w-12 animate-spin text-red-600" />
            </div>
          )}

          {!isSearching && error && searchQuery.trim().length >= 2 && (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600">{error}</p>
            </div>
          )}

          {!isSearching && searchQuery.trim().length === 0 && (
            <div className="text-center py-20">
              <Search className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Digite para começar a buscar
              </h2>
              <p className="text-gray-500">
                Busque por álbuns, padres, posts, avisos, campanhas e programações
              </p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </h2>
              <div className="grid gap-4">
                {results.map((result) => (
                  <motion.button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-left flex items-start gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {result.image ? (
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getIcon(result.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {getTypeName(result.type)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                        {result.title}
                      </h3>
                      {result.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
