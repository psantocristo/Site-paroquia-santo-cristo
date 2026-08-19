import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, Megaphone } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface ParishAnnouncement {
  id: string;
  type: 'event' | 'announcement';
  title: string;
  content: string;
  event_date?: string;
  flyer_url?: string;
  whatsapp_contact?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  slug?: string; 
}

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('parish_announcements')
        .select('*') 
        .eq('is_published', true)
        .order('event_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const navigateToAnnouncement = (announcement: ParishAnnouncement) => {
    if (announcement.slug) {
      window.history.pushState(null, '', `/aviso/${announcement.slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToAllAnnouncements = () => {
    window.location.hash = '#avisos';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isUpcoming = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  const displayedAnnouncements = announcements.slice(0, 10);

  if (loading) {
    return (
      <section id="announcements" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando avisos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="announcements" className="py-8 md:py-12 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-900/10 border border-gold-400/30 rounded-full text-red-900 text-xs sm:text-sm font-semibold tracking-wider uppercase font-sans mb-3">
            <Megaphone className="h-3.5 w-3.5 text-gold-600" />
            Comunicados & Agenda
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-red-950 mb-3 tracking-tight">
            Avisos Paroquiais
          </h2>
          <div className="sacred-divider max-w-xs mx-auto my-2">
            <span className="text-gold-500 text-xs">✦</span>
          </div>
          <p className="text-stone-600 max-w-2xl mx-auto text-sm md:text-base font-light">
            Fique por dentro das celebrações, formações, eventos e comunicados oficiais da nossa comunidade.
          </p>
        </motion.div>

        {announcements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Megaphone className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum aviso no momento</h3>
            <p className="text-gray-500">Novos avisos e eventos serão publicados aqui</p>
          </motion.div>
        ) : (
          <>
            {/* MOBILE: Lista compacta */}
            <div className="flex flex-col gap-3 sm:hidden">
              <AnimatePresence>
                {displayedAnnouncements.map((announcement, index) => (
                  <motion.button
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => navigateToAnnouncement(announcement)}
                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-red-500/30 rounded-xl"
                  >
                    <div className="flex gap-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      {announcement.flyer_url ? (
                        <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-gray-100">
                          <img
                            src={announcement.flyer_url}
                            alt={announcement.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={`w-24 h-24 flex-shrink-0 flex items-center justify-center ${
                          announcement.type === 'event' ? 'bg-blue-50' : 'bg-amber-50'
                        }`}>
                          {announcement.type === 'event' ? (
                            <Calendar className="h-8 w-8 text-blue-400" />
                          ) : (
                            <Megaphone className="h-8 w-8 text-amber-400" />
                          )}
                        </div>
                      )}
                      
                      <div className="flex-1 py-2.5 pr-3 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            announcement.type === 'event'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                          </span>
                          {isUpcoming(announcement.event_date) && (
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                          {announcement.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {announcement.content}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {formatRelativeDate(announcement.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center pr-2">
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* DESKTOP/TABLET: Grid de cards */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {displayedAnnouncements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.07 }}
                    layout
                  >
                    <button
                      onClick={() => navigateToAnnouncement(announcement)}
                      className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 rounded-xl"
                    >
                      <div className="group h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        {announcement.flyer_url ? (
                          <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                            <img
                              src={announcement.flyer_url}
                              alt={announcement.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-semibold rounded-full backdrop-blur-sm shadow-sm ${
                              announcement.type === 'event'
                                ? 'bg-white/90 text-blue-700'
                                : 'bg-white/90 text-amber-700'
                            }`}>
                              {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                            </span>
                            {announcement.event_date && (
                              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-white text-xs">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="font-medium">{formatDate(announcement.event_date)}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                              announcement.type === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {announcement.type === 'event' ? <Calendar className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${
                              announcement.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {announcement.type === 'event' ? 'Evento' : 'Aviso'}
                            </span>
                          </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col">
                          {isUpcoming(announcement.event_date) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 mb-1.5">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Próximo evento
                            </span>
                          )}
                          <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-red-700 transition-colors duration-300">
                            {announcement.title}
                          </h3>
                          <p className="text-gray-500 text-xs line-clamp-2 flex-1 leading-relaxed">
                            {announcement.content}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                            <span className="text-[10px] text-gray-400">
                              {formatRelativeDate(announcement.created_at)}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs font-medium text-red-600 group-hover:gap-1.5 transition-all duration-300">
                              Ler mais
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Botão Ver Mais Avisos */}
            {announcements.length > 10 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-8 md:mt-12"
              >
                <Button
                  variant="outline"
                  onClick={navigateToAllAnnouncements}
                  className="px-6 py-2.5 rounded-full border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all duration-300 text-sm"
                >
                  Ver mais avisos ({announcements.length - 10} restantes)
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
