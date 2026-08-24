import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Bookmark, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  time: string;
  days_of_week: string[] | null;
  featured_image: string | null;
}

const daysMap: Record<string, { label: string; short: string }> = {
  sunday: { label: 'Domingo', short: 'Dom' },
  monday: { label: 'Segunda', short: 'Seg' },
  tuesday: { label: 'Terça', short: 'Ter' },
  wednesday: { label: 'Quarta', short: 'Qua' },
  thursday: { label: 'Quinta', short: 'Qui' },
  friday: { label: 'Sexta', short: 'Sex' },
  saturday: { label: 'Sábado', short: 'Sáb' },
};

export const ProgramsSection: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data } = await supabase
        .from('programs')
        .select('id, title, slug, description, time, days_of_week, featured_image')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(8);

      if (data) setPrograms(data as unknown as Program[]);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToProgram = (slug: string) => {
    window.history.pushState(null, '', `/programacao/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAll = () => {
    window.history.pushState(null, '', '/programacoes');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section id="programs" className="py-10 bg-[#faf7f2]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#240404] mx-auto" />
        </div>
      </section>
    );
  }

  if (programs.length === 0) return null;

  return (
    <section id="programs" className="py-10 md:py-16 bg-[#faf7f2] border-t border-stone-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#240404]/5 border border-[#c5a059]/30 rounded-full text-[#240404] text-xs font-semibold uppercase tracking-wider mb-2.5">
              <Bookmark className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Pastorais & Grupos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#240404] tracking-tight">
              Programações & Encontros
            </h2>
          </div>

          <button
            onClick={handleNavigateToAll}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#240404] hover:text-[#931515] transition-colors group cursor-pointer"
          >
            <span>Ver todas as programações</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              onClick={() => handleNavigateToProgram(program.slug)}
              className="group bg-white rounded-2xl p-5 border border-stone-200/80 hover:border-[#c5a059] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#240404]/10 text-[#240404] text-xs font-bold font-sans">
                    <Clock className="h-3.5 w-3.5 text-[#c5a059]" />
                    {program.time}
                  </span>

                  <div className="flex flex-wrap gap-1">
                    {(program.days_of_week ?? []).slice(0, 2).map((day: string) => (
                      <span
                        key={day}
                        className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-stone-100 text-stone-600 rounded-md"
                      >
                        {daysMap[day]?.short || day}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#240404] group-hover:text-[#931515] transition-colors line-clamp-2 mb-2 leading-snug">
                  {program.title}
                </h3>

                <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-light mb-3">
                  {program.description ? program.description.replace(/<[^>]*>/g, '') : ''}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#240404]">
                <span className="group-hover:text-[#931515] transition-colors">Detalhes do grupo</span>
                <ChevronRight className="h-4 w-4 text-[#c5a059] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
