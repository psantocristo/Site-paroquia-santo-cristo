import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Bell, ArrowRight } from 'lucide-react';
import { supabase, ParishAnnouncement } from '../../lib/supabase';

export const AnnouncementsSection: React.FC = () => {
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
        .order('event_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      if (data) {
        setAnnouncements(data.map(item => ({
          ...item,
          type: item.type === 'event' ? 'event' : 'announcement'
        })));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAnnouncement = (announcement: ParishAnnouncement) => {
    const slug = announcement.slug || announcement.id;
    window.history.pushState(null, '', `/aviso/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAll = () => {
    window.history.pushState(null, '', '/avisos');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <section id="announcements" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#240404] mx-auto" />
        </div>
      </section>
    );
  }

  if (announcements.length === 0) return null;

  return (
    <section id="announcements" className="py-10 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="institutional-kicker">
              <Bell className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Avisos & Comunicados</span>
            </div>
            <h2 className="institutional-title">
              Avisos Paroquiais
            </h2>
          </div>

          <button
            onClick={navigateToAll}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#240404] hover:text-[#931515] transition-colors group cursor-pointer"
          >
            <span>Ver todos os avisos</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid of Announcements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {announcements.map((announcement, index) => {
            const hasImage = !!announcement.flyer_url;
            const categoryLabel = announcement.type === 'event' ? 'Evento' : 'Aviso';
            return (
              <motion.article
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => navigateToAnnouncement(announcement)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') navigateToAnnouncement(announcement);
                }}
                role="link"
                tabIndex={0}
                className="institutional-card group overflow-hidden flex flex-col justify-between cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f6d25]"
              >
                <div>
                  {hasImage ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                      <img
                        src={announcement.flyer_url!}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category badge over image */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-sm bg-[#240404] text-[#e8c872] text-[11px] font-bold tracking-wide uppercase border border-[#c5a059]/40">
                        {categoryLabel}
                      </span>

                      {announcement.event_date && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[#240404] text-[11px] font-bold flex items-center gap-1 shadow">
                          <Calendar className="h-3 w-3 text-[#c5a059]" />
                          {formatDate(announcement.event_date)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#240404] text-white flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-[#e8c872] text-xs font-semibold uppercase">
                        {categoryLabel}
                      </span>
                      {announcement.event_date && (
                        <span className="text-xs text-stone-300 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#e8c872]" />
                          {formatDate(announcement.event_date)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#240404] group-hover:text-[#931515] transition-colors line-clamp-2 leading-snug mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-light">
                      {announcement.content ? announcement.content.replace(/<[^>]*>/g, '') : ''}
                    </p>
                  </div>
                </div>

                {/* Footer link */}
                <div className="px-5 pb-5 pt-1 border-t border-stone-200/50 flex items-center justify-between text-xs font-bold text-[#240404]">
                  <span className="group-hover:text-[#931515] transition-colors">Ler comunicado completo</span>
                  <div className="h-7 w-7 rounded-full bg-stone-200/70 group-hover:bg-[#240404] group-hover:text-[#e8c872] flex items-center justify-center transition-all duration-200">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
