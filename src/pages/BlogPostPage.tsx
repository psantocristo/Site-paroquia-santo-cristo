import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Loader, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase, BlogPost } from '../lib/supabase';
import toast from 'react-hot-toast';
import { SEO } from '../components/ui/SEO';

interface BlogPostPageProps {
  slug: string;
  onBack: () => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onBack }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Post não encontrado');
        onBack();
        return;
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Erro ao carregar post');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post?.title || '',
      text: post?.excerpt || '',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Compartilhado com sucesso!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Erro ao copiar link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-red-800" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 sm:pt-16">
      <SEO
        title={`${post.title} | Blog Paróquia Santo Cristo`}
        description={post.excerpt || post.title}
        image={post.featured_image || 'https://paroquiasantocristo.com.br/capa.webp'}
        type="article"
        url={`https://paroquiasantocristo.com.br/blog/${slug}`}
        article={{
          publishedTime: post.created_at || undefined,
          modifiedTime: post.updated_at || undefined,
          author: post.author
        }}
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Botões de navegação */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </Button>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {post.featured_image && (
            <div className="w-full overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-cover"
              />
            </div>
          )}

          <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(post.created_at || '').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </motion.article>
      </div>
    </div>
  );
};
