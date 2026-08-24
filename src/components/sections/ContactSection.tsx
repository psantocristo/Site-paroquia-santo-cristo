import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation, Church, ArrowUpRight } from 'lucide-react';
import { supabase, Parish } from '../../lib/supabase';

export const ContactSection: React.FC = () => {
  const [parishData, setParishData] = useState<Parish | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParishInfo();
  }, []);

  const fetchParishInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select('*')
        .maybeSingle();

      if (data) setParishData(data);
    } catch (error) {
      console.error('Error fetching parish data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const address = parishData?.address || 'R. dos Têxteis, 653 - Chacara Santa Etelvina, São Paulo - SP, 08490-582 - Cidade Tiradentes';
  const whatsapp = parishData?.whatsapp_phone || '(11) 98588-8816';
  const email = parishData?.email || 'paroqsantocristo@bol.com';
  const officeHours = parishData?.office_hours || 'Seg - Sex das 08h às 17h';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Paróquia Senhor Santo Cristo dos Milagres ' + address)}`;

  return (
    <section id="contact" className="py-10 md:py-16 bg-[#faf7f2] border-t border-stone-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#240404]/5 border border-[#c5a059]/30 rounded-full text-[#240404] text-xs font-semibold uppercase tracking-widest mb-3">
            <MapPin className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Atendimento & Localização</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#240404] tracking-tight">
            Fale com a Paróquia
          </h2>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px w-12 bg-[#c5a059]/40" />
            <span className="text-[#c5a059] text-xs">✦</span>
            <div className="h-px w-12 bg-[#c5a059]/40" />
          </div>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Estamos de portas abertas para acolher você e sua família.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {/* Card 1: Endereço */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 hover:border-[#c5a059] shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#240404]/5 flex items-center justify-center text-[#240404]">
                <MapPin className="h-5 w-5 text-[#c5a059]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#240404]">Endereço</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                {address}
              </p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 pt-3 border-t border-stone-100 inline-flex items-center gap-1.5 text-xs font-bold text-[#240404] hover:text-[#931515]"
            >
              <span>Abrir no Google Maps</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 hover:border-[#c5a059] shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#240404]">WhatsApp</h3>
              <p className="text-stone-900 font-semibold text-sm sm:text-base">
                {whatsapp}
              </p>
              <p className="text-stone-500 text-xs font-light">
                Atendimento rápido pela secretaria
              </p>
            </div>
            <a
              href="https://wa.me/5511985888816?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20da%20Par%C3%B3quia"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 pt-3 border-t border-stone-100 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Iniciar conversa</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 3: E-mail */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 hover:border-[#c5a059] shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#240404]/5 flex items-center justify-center text-[#240404]">
                <Mail className="h-5 w-5 text-[#c5a059]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#240404]">E-mail</h3>
              <p className="text-stone-900 font-medium text-xs sm:text-sm break-all">
                {email}
              </p>
              <p className="text-stone-500 text-xs font-light">
                Solicitações e certidões
              </p>
            </div>
            <a
              href={`mailto:${email}`}
              className="mt-4 pt-3 border-t border-stone-100 inline-flex items-center gap-1.5 text-xs font-bold text-[#240404] hover:text-[#931515]"
            >
              <span>Enviar e-mail</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 4: Horário da Secretaria */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 hover:border-[#c5a059] shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#240404]/5 flex items-center justify-center text-[#240404]">
                <Clock className="h-5 w-5 text-[#c5a059]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#240404]">Secretaria</h3>
              <p className="text-stone-900 font-semibold text-xs sm:text-sm">
                {officeHours}
              </p>
              <p className="text-stone-500 text-xs font-light">
                Atendimento presencial e telefônico
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs text-[#c5a059] font-semibold">
              <Church className="h-3.5 w-3.5" />
              <span>Igreja Matriz</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
