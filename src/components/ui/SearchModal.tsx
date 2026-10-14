import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Folder, User, FileText, Megaphone, Calendar, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Validação do termo de busca
const searchSchema = z.object({
  query: z.string().trim().min(2, 'Digite pelo menos 2 caracteres').max(100, 'Máximo de 100 caracteres')
});

interface SearchResult {
  id: string;
  type: 'album' | 'priest' | 'blog' | 'announcement' | 'program';
  title: string;
  description?: string;
  slug?: string;
  url: string;
  image?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpar ao fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Debounce para busca
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
      // Validar entrada
      const validation = searchSchema.safeParse({ query });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        setResults([]);
        return;
      }

      const safeQuery = query.replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();
      if (safeQuery.length < 2) {
        setError('Digite pelo menos 2 caracteres válidos');
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);
      const searchResults: SearchResult[] = [];

      // Buscar em álbuns
      const { data: albums } = await supabase
        .from('photo_albums')
        .select('id, name, description, slug, cover_image_url')
        .eq('is_active', true)
        .or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
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

      // Buscar em padres da galeria
      const { data: priests } = await supabase
        .from('priests_gallery')
        .select('id, name, description, photo_url')
        .eq('is_active', true)
        .or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
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

      // Buscar em posts do blog
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, featured_image')
        .eq('is_published', true)
        .or(`title.ilike.%${safeQuery}%,excerpt.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`)
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

      // Buscar em avisos
      const { data: announcements } = await supabase
        .from('parish_announcements')
        .select('id, title, content, slug, flyer_url')
        .eq('is_published', true)
        .or(`title.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`)
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

      // Buscar em programações
      const { data: programs } = await supabase
        .from('programs')
        .select('id, title, description, slug')
        .eq('is_active', true)
        .or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
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
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="max-w-3xl mx-auto mt-20 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Search className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por álbuns, padres, posts, avisos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-lg outline-none"
                  autoFocus
                  maxLength={100}
                />
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching && (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-red-600" />
                </div>
              )}

              {!isSearching && error && (
                <div className="text-center py-12 px-6">
                  <p className="text-gray-500">{error}</p>
                </div>
              )}

              {!isSearching && !error && searchQuery.trim().length >= 2 && results.length === 0 && (
                <div className="text-center py-12 px-6">
                  <p className="text-gray-500">Nenhum resultado encontrado</p>
                </div>
              )}

              {!isSearching && results.length > 0 && (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left flex items-start gap-4"
                    >
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getIcon(result.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {getTypeName(result.type)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {result.title}
                        </h3>
                        {result.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim().length === 0 && (
                <div className="text-center py-12 px-6">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Digite para começar a buscar</p>
                </div>
              )}
            </div>
          </div>

          {/* Tip */}
          <div className="text-center mt-4">
            <p className="text-sm text-white/80">
              Pressione <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd> para fechar
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
