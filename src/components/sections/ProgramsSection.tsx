import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
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
    const fetchPrograms = async () => {
      try {
        const { data } = await supabase
          .from('programs')
          .select('id, title, slug, description, time, days_of_week, featured_image')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (data) setPrograms(data as unknown as Program[]);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

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
      <section id="programs" className="py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto" />
        </div>
      </section>
    );
  }

  if (programs.length === 0) return null;

  return (
    <section id="programs" className="py-8 md:py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — editorial style */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="eyebrow mb-4">Agenda Paroquial</p>
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-14 bg-gold-400/60" />
            <Calendar className="h-5 w-5 text-gold-500" strokeWidth={1.5} />
            <div className="h-px w-14 bg-gold-400/60" />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-semibold text-wine-700 mb-5 tracking-tight">
            Programações
          </h2>
          <p className="font-serif italic text-xl text-wine-600/70 max-w-3xl mx-auto">
            Conheça as atividades e celebrações da nossa comunidade.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card
                className="h-full cursor-pointer group relative overflow-hidden bg-white hover:border-gold-400 transition-all duration-300"
                onClick={() => handleNavigateToProgram(program.slug)}
              >
                {/* Agenda-style top block: time badge */}
                <div className="flex items-center justify-between px-5 pt-5">
                  <div className="inline-flex items-baseline gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold-500 self-center" strokeWidth={1.5} />
                    <span className="font-serif text-2xl font-semibold text-wine-700 leading-none">
                      {program.time}
                    </span>
                  </div>
                  <span className="eyebrow text-[0.6rem]">Programa</span>
                </div>
                <div className="mx-5 mt-3 h-px bg-gold-400/40" />

                <div className="p-5">
                  <h3 className="font-serif text-xl font-semibold text-wine-700 mb-2 group-hover:text-wine-500 transition-colors line-clamp-2">
                    {program.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {program.description}
                  </p>

                  {/* Days */}
                  <div className="flex flex-wrap gap-1.5">
                    {(program.days_of_week ?? []).map((day: string) => (
                      <span
                        key={day}
                        className="px-2.5 py-1 text-[0.7rem] tracking-wide bg-cream-100 text-wine-700 rounded-full font-medium border border-gold-400/40"
                      >
                        {daysMap[day]?.short || day}
                      </span>
                    ))}
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-1 mt-4 text-sm text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver detalhes</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA to see all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10"
        >
          <button
            onClick={handleNavigateToAll}
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold-400 text-wine-700 hover:bg-cream-100 font-medium rounded-xl transition-all duration-200 tracking-wide"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            Ver todas as programações
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
