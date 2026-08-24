import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Church, Clock, Calendar, ShieldCheck, MessageCircle, MapPin, HeartHandshake, Sparkles } from 'lucide-react';
import { supabase, Celebration } from '../../lib/supabase';

export const MassScheduleSection: React.FC = () => {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [activeTab, setActiveTab] = useState<'domingo' | 'semana' | 'confissoes'>('domingo');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCelebrations();
  }, []);

  const fetchCelebrations = async () => {
    try {
      const { data } = await supabase
        .from('celebrations')
        .select('*')
        .eq('is_active', true)
        .order('time', { ascending: true });
      if (data) setCelebrations(data);
    } catch (e) {
      console.error('Error fetching celebrations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const sundayCelebrations = celebrations.filter(c => c.day_of_week === 'sunday');
  const times = Array.from(new Set(sundayCelebrations.map(c => c.time))).sort();

  const filteredSunday = selectedTimeFilter === 'todos'
    ? sundayCelebrations
    : sundayCelebrations.filter(c => c.time === selectedTimeFilter);

  return (
    <section id="horarios-missas" className="py-10 md:py-16 bg-[#faf7f2] border-y border-[#c5a059]/25 relative overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3b0808]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#240404]/5 border border-[#c5a059]/30 rounded-full text-[#240404] text-xs font-semibold uppercase tracking-widest mb-3">
            <Clock className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Vida Comunitária & Sacramentos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#240404] tracking-tight mb-3">
            Horários de Missas & Atendimento
          </h2>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px w-12 bg-[#c5a059]/40" />
            <span className="text-[#c5a059] text-xs">✦</span>
            <div className="h-px w-12 bg-[#c5a059]/40" />
          </div>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Participe da Santa Missa, encontros de oração e atendimento sacramental na Igreja Matriz e nas Comunidades.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-stone-200/70 backdrop-blur-sm rounded-2xl border border-[#c5a059]/30 shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('domingo')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'domingo'
                  ? 'bg-[#240404] text-[#e8c872] shadow-md'
                  : 'text-stone-700 hover:text-[#240404] hover:bg-white/40'
              }`}
            >
              <Church className="h-4 w-4" />
              <span>Missas de Domingo</span>
            </button>

            <button
              onClick={() => setActiveTab('semana')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'semana'
                  ? 'bg-[#240404] text-[#e8c872] shadow-md'
                  : 'text-stone-700 hover:text-[#240404] hover:bg-white/40'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Durante a Semana</span>
            </button>

            <button
              onClick={() => setActiveTab('confissoes')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'confissoes'
                  ? 'bg-[#240404] text-[#e8c872] shadow-md'
                  : 'text-stone-700 hover:text-[#240404] hover:bg-white/40'
              }`}
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Confissões & Atendimento</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Missas de Domingo */}
        {activeTab === 'domingo' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Quick time filter pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mr-1">Filtrar horário:</span>
              <button
                onClick={() => setSelectedTimeFilter('todos')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedTimeFilter === 'todos'
                    ? 'bg-[#240404] text-white border border-[#240404]'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-[#c5a059]'
                }`}
              >
                Todos os Horários
              </button>
              {times.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTimeFilter(t)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedTimeFilter === t
                      ? 'bg-[#240404] text-white border border-[#240404]'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-[#c5a059]'
                  }`}
                >
                  {t}h
                </button>
              ))}
            </div>

            {/* Sunday Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSunday.map((item, idx) => {
                const isMatriz = item.community_name.toLowerCase().includes('matriz');
                const isMissa = item.celebration_type.toLowerCase() === 'missa';

                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
                      isMatriz
                        ? 'bg-gradient-to-br from-[#2b0606] to-[#1c0303] text-white border-[#c5a059]/50 shadow-md ring-1 ring-[#c5a059]/20'
                        : 'bg-white text-stone-900 border-stone-200/80 hover:border-[#c5a059]/60 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-sans tracking-wide ${
                            isMatriz
                              ? 'bg-[#e8c872] text-[#240404]'
                              : 'bg-[#240404]/10 text-[#240404]'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {item.time}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                            isMissa
                              ? isMatriz ? 'bg-white/15 text-[#e8c872]' : 'bg-red-50 text-red-800 border border-red-200'
                              : isMatriz ? 'bg-white/10 text-stone-300' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {item.celebration_type}
                        </span>
                      </div>

                      <h3 className={`font-serif font-bold text-lg sm:text-xl leading-snug mb-1.5 ${isMatriz ? 'text-white' : 'text-[#240404]'}`}>
                        {item.community_name}
                      </h3>

                      {item.celebrant_name && (
                        <p className={`text-xs flex items-center gap-1.5 ${isMatriz ? 'text-stone-300' : 'text-stone-600'}`}>
                          <span className="opacity-60">Presidente:</span>
                          <span className="font-semibold">{item.celebrant_name}</span>
                        </p>
                      )}
                    </div>

                    {isMatriz && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#e8c872]">
                        <span>Igreja Matriz Paroquial</span>
                        <span>✦ Matriz</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 2: Missas Durante a Semana */}
        {activeTab === 'semana' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">
                <Calendar className="h-3.5 w-3.5 text-amber-700" />
                Terça a Sexta-feira
              </div>
              <h3 className="font-serif font-bold text-xl text-[#240404]">Santa Missa na Matriz</h3>
              <p className="text-stone-600 text-sm">
                Celebração diária da Eucaristia para a comunidade paroquial.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-[#240404]">19h30</span>
                <span className="text-xs text-stone-500">• Igreja Matriz</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                1ª Sexta-feira do Mês
              </div>
              <h3 className="font-serif font-bold text-xl text-[#240404]">Sagrado Coração de Jesus</h3>
              <p className="text-stone-600 text-sm">
                Missa votiva ao Sagrado Coração de Jesus e adoração ao Santíssimo Sacramento.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-[#240404]">19h30</span>
                <span className="text-xs text-stone-500">• Igreja Matriz</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">
                <Calendar className="h-3.5 w-3.5 text-amber-700" />
                Sábado
              </div>
              <h3 className="font-serif font-bold text-xl text-[#240404]">Missa Vespertina</h3>
              <p className="text-stone-600 text-sm">
                Missa preceitual de sábado com as comunidades paroquiais.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-[#240404]">17h00</span>
                <span className="text-xs text-stone-500">• Igreja Matriz / Comunidades</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: Confissões & Atendimento */}
        {activeTab === 'confissoes' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Confissões Card */}
            <div className="bg-gradient-to-br from-[#240404] to-[#360808] text-white rounded-2xl p-6 sm:p-8 border border-[#c5a059]/40 shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8c872]/20 border border-[#e8c872]/40 rounded-lg text-[#e8c872] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  Sacramento da Reconciliação
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Horários de Confissões
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed font-light">
                  Encontre a misericórdia e o perdão de Deus no Sacramento da Confissão com nossos sacerdotes.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#e8c872] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Quinta-feira</h4>
                      <p className="text-xs text-stone-300">Manhã: 09h00 às 11h30 | Tarde: 14h00 às 16h30</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#e8c872] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Sábado</h4>
                      <p className="text-xs text-stone-300">Manhã: 09h00 às 11h30</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secretaria & Direção Espiritual Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#240404]/10 border border-[#240404]/20 rounded-lg text-[#240404] text-xs font-bold uppercase tracking-wider">
                  <MessageCircle className="h-4 w-4 text-[#c5a059]" />
                  Secretaria Paroquial
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#240404]">
                  Atendimento & Orientações
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Informações sobre certidões de batismo, casamento, intenções de missa e agendamento de direção espiritual.
                </p>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2 text-xs sm:text-sm text-stone-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#c5a059] shrink-0" />
                    <span><strong>Segunda a Sexta:</strong> 08h00 às 17h00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#c5a059] shrink-0" />
                    <span>R. dos Têxteis, 653 - Cidade Tiradentes</span>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/5511985888816?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20da%20Par%C3%B3quia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#240404] hover:bg-[#380909] text-[#e8c872] font-bold rounded-xl text-center text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Falar com a Secretaria via WhatsApp</span>
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
