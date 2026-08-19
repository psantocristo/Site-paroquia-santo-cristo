import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MessageCircle, Share2, ChevronRight, Megaphone, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/ui/SEO';
import { supabase, ParishAnnouncement } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AnnouncementsPageProps {
  onBack: () => void;
}

const formatFullDateTime = (dateString?: string | null) => {
  if (!dateString) return 'Data não definida';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatRelativeDate = (dateString: string) => {
  const diffDays = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`;
  return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const contactWhatsApp = (announcement: ParishAnnouncement) => {
  if (!announcement.whatsapp_contact) return;
  const phone = announcement.whatsapp_contact.replace(/\D/g, '');
  const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${announcement.title}`);
  window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
};

const shareAnnouncement = (announcement: ParishAnnouncement) => {
  const url = `${window.location.origin}/#avisos/${encodeURIComponent(announcement.slug || '')}`;
  if (navigator.share) {
    navigator.share({ title: announcement.title, text: announcement.title, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => toast.success('Link copiado!'));
  }
};

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ParishAnnouncement | null>(null);
  const [filter, setFilter] = useState<'all' | 'event' | 'announcement'>('all');
  const [loading, setLoading] = useState(true);
  const [showImageFull, setShowImageFull] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      // @ts-expect-error - Type mismatch with database types
      setAnnouncements(data || []);
    } catch {
      toast.error('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (a: ParishAnnouncement) => {
    setSelectedAnnouncement(null); 
    window.location.hash = `#avisos/${a.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClose = () => {
    setSelectedAnnouncement(null);
    onBack(); 
    window.location.hash = '#avisos'; 
  };

  useEffect(() => {
    if (!announcements.length) return;
    const hash = window.location.hash;
    if (hash.startsWith('#avisos/')) {
      const slug = decodeURIComponent(hash.replace('#avisos/', ''));
      const found = announcements.find(a => a.slug === slug);
      if (found) setSelectedAnnouncement(found);
    }
  }, [announcements]);

  // ======== DETALHE DO AVISO ========
  if (selectedAnnouncement) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col"> 
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg pt-16 sm:pt-18">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 border border-white/30 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </button>
                <h2 className="text-base sm:text-lg font-bold truncate">
                  {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => shareAnnouncement(selectedAnnouncement)}
                className="flex items-center gap-1.5 text-xs border-white/30 text-white hover:bg-white/20 py-1.5 px-3"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto w-full">
          {selectedAnnouncement.flyer_url && (
            <div
              className="w-full max-w-3xl mx-auto bg-gray-100 overflow-hidden cursor-zoom-in"
              style={{ maxHeight: '60vh' }} 
              onClick={() => setShowImageFull(true)}
            >
              <img
                src={selectedAnnouncement.flyer_url}
                alt={selectedAnnouncement.title}
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                selectedAnnouncement.type === 'event' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedAnnouncement.type === 'event' ? 'Evento' : 'Aviso'}
              </span>
              {selectedAnnouncement.event_date && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatFullDateTime(selectedAnnouncement.event_date)}
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 text-center">
              {selectedAnnouncement.title}
            </h1>

            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed text-justify">
              {selectedAnnouncement.content?.split('\n').map((p, i) => <p key={i} className="mb-3">{p}</p>)}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t mt-6 justify-center">
              <Button
                variant="primary"
                onClick={() => shareAnnouncement(selectedAnnouncement)}
                className="flex items-center justify-center gap-2 text-sm"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              {selectedAnnouncement.whatsapp_contact && (
                <Button
                  variant="outline"
                  onClick={() => contactWhatsApp(selectedAnnouncement)}
                  className="flex items-center justify-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {showImageFull && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-2"
              onClick={() => setShowImageFull(false)}
            >
              <motion.img
                src={selectedAnnouncement.flyer_url || ''}
                alt={selectedAnnouncement.title}
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10" onClick={() => setShowImageFull(false)}>
                <X className="w-7 h-7" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ======== LISTA DE AVISOS ========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-800"></div>
      </div>
    );
  }

  const filtered = announcements.filter(a => filter === 'all' || a.type === filter);

  return (
    <>
    <SEO
      title="Avisos e Eventos - Paróquia Senhor Santo Cristo dos Milagres"
      description="Fique por dentro dos avisos, eventos e novidades da Paróquia Senhor Santo Cristo dos Milagres."
      url="https://paroquiasantocristo.com.br/eventos-informativos"
      keywords="avisos, eventos, paróquia, santo cristo, tiradentes"
    />
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-18 pb-12 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto pt-4 sm:pt-6">
        <Button variant="outline" onClick={onBack} className="mb-4 text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1.5">Avisos e Eventos</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-5">Fique por dentro das novidades da paróquia</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'event', 'announcement'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)} className="text-xs sm:text-sm px-3 py-1.5">
              {f === 'all' ? 'Todos' : f === 'event' ? 'Eventos' : 'Avisos'}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base text-gray-600">Nenhum aviso encontrado</h3>
          </div>
        ) : (
          <>
            {/* MOBILE: Lista compacta */}
            <div className="flex flex-col gap-2.5 sm:hidden">
              {filtered.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleOpen(a)}
                  className="w-full text-left"
                >
                  <div className="flex gap-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {a.flyer_url ? (
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-gray-100">
                        <img src={a.flyer_url} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-24 h-24 flex-shrink-0 flex items-center justify-center ${
                        a.type === 'event' ? 'bg-blue-50' : 'bg-amber-50'
                      }`}>
                        {a.type === 'event' ? <Calendar className="h-8 w-8 text-blue-400" /> : <Megaphone className="h-8 w-8 text-amber-400" />}
                      </div>
                    )}
                    <div className="flex-1 py-2.5 pr-2 flex flex-col justify-center min-w-0">
                      <span className={`self-start px-2 py-0.5 text-[10px] font-semibold rounded-full mb-1 ${
                        a.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.type === 'event' ? 'Evento' : 'Aviso'}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{a.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{a.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">{formatRelativeDate(a.created_at || new Date().toISOString())}</span>
                        {a.event_date && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(a.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center pr-2">
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* TABLET/DESKTOP: Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleOpen(a)}
                  className="cursor-pointer group"
                >
                  <div className="overflow-hidden h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                    {a.flyer_url && (
                      <div className="aspect-[3/2] overflow-hidden bg-gray-100">
                        <img
                          src={a.flyer_url}
                          alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <span className={`self-start px-2.5 py-0.5 text-[10px] font-semibold rounded-full mb-2 ${
                        a.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.type === 'event' ? 'Evento' : 'Aviso'}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 mb-1.5 group-hover:text-red-800 transition line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 flex-1">{a.content}</p>
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{formatRelativeDate(a.created_at || new Date().toISOString())}</span>
                        {a.event_date && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(a.event_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default AnnouncementsPage;
