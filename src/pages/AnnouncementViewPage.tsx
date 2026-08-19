import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Importação de AnimatePresence adicionada
import { ArrowLeft, Calendar, Share2, MessageCircle, Loader, X, ZoomIn } from 'lucide-react'; // Importação de X e ZoomIn adicionada
import { Button } from '../components/ui/Button';
import { supabase, ParishAnnouncement } from '../lib/supabase';
import toast from 'react-hot-toast';
import { SEO } from '../components/ui/SEO';

interface AnnouncementViewPageProps {
  slug: string;
  onBack: () => void;
}

export const AnnouncementViewPage: React.FC<AnnouncementViewPageProps> = ({ slug, onBack }) => {
  const [announcement, setAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  // NOVO ESTADO: Armazena a URL da imagem para visualização em tela cheia
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncement();
  }, [slug]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Aviso não encontrado');
        onBack();
        return;
      }
      // @ts-expect-error - Type mismatch with database types
      setAnnouncement(data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
      toast.error('Erro ao carregar aviso');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const shareAnnouncement = () => {
    if (!announcement) return;

    const url = `${window.location.origin}/aviso/${announcement.slug}`;
    const text = `${announcement.title}`;

    if (navigator.share) {
      navigator.share({ title: announcement.title, text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  const contactWhatsApp = () => {
    if (!announcement?.whatsapp_contact) return;

    const phone = announcement.whatsapp_contact.replace(/\D/g, ' ');
    const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${announcement.title}`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-red-800" />
      </div>
    );
  }

  if (!announcement) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12 px-3 sm:px-4">
      <SEO
        title={`${announcement.title} | Avisos Paroquiais`}
        description={announcement.content.substring(0, 160)}
        image={announcement.flyer_url || 'https://paroquiasantocristo.com.br/capa.webp'}
        url={`https://paroquiasantocristo.com.br/aviso/${slug}`}
        type="article"
      />
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {announcement.flyer_url && (
            <div 
              className="w-full overflow-hidden relative cursor-pointer group"
              onClick={() => setFullscreenImage(announcement.flyer_url!)}
            >
              <img
                src={announcement.flyer_url}
                alt={announcement.title}
                className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain bg-gray-100"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                announcement.type === 'event'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {announcement.type === 'event' ? 'Evento' : 'Aviso'}
              </span>
              {announcement.event_date && (
                <div className="flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(announcement.event_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {announcement.title}
            </h1>

            <div className="prose prose-lg max-w-none mb-8">
              {announcement.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                variant="primary"
                onClick={shareAnnouncement}
                className="flex items-center justify-center gap-2 text-sm"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>

              {announcement.whatsapp_contact && (
                <Button
                  variant="outline"
                  onClick={contactWhatsApp}
                  className="flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Entrar em Contato
                </Button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t text-sm text-gray-500">
              {/* @ts-expect-error - created_at is not null here */}
              Publicado em {new Date(announcement.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </motion.article>
      </div>
      
      {/* NOVO: Modal de Imagem em Tela Cheia */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <Button
              variant="outline"
              onClick={() => setFullscreenImage(null)}
              className="fixed top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 p-0 rounded-full bg-white hover:bg-gray-100 shadow-lg z-10 border-2 border-gray-300"
            >
              <X className="h-5 w-5" />
            </Button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenImage}
                alt="Imagem do Flyer em tela cheia"
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};
