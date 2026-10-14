import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import parishLogo from '../../assets/logo-paroquia.png';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [logoUrl, setLogoUrl] = useState(parishLogo);
  const [logoAlt, setLogoAlt] = useState('Logo da Paróquia');
  const [parishInfo, setParishInfo] = useState<{
    phone?: string | null;
    whatsapp_phone?: string | null;
    email?: string | null;
    address?: string | null;
    office_hours?: string | null;
    confession_hours?: string | null;
  }>({});

  useEffect(() => {
    (async () => {
      try {
        const { data: logoData } = await supabase
          .from('site_settings')
          .select('logo_url, logo_alt')
          .eq('key', 'logo_settings')
          .maybeSingle();
        if (logoData) {
          setLogoUrl(logoData.logo_url || parishLogo);
          setLogoAlt(logoData.logo_alt || 'Logo da Paróquia');
        }

        const { data: pData } = await supabase
          .from('parishes')
          .select('phone, whatsapp_phone, email, address, office_hours, confession_hours')
          .maybeSingle();
        if (pData) {
          setParishInfo(pData);
        }
      } catch (e) {
        console.error('Error fetching footer data:', e);
      }
    })();
  }, []);

  return (
    <footer className="bg-[#1c0303] text-stone-300 pt-10 md:pt-14 pb-24 lg:pb-10 border-t border-[#c5a059]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MOBILE FOOTER: Compact, Clean & Essential (Visible only on <md) */}
        <div className="md:hidden space-y-6 pb-8 border-b border-white/10 text-center">
          <div className="flex flex-col items-center gap-3">
            <img
              src={logoUrl}
              alt={logoAlt}
              className="h-12 w-auto object-contain max-w-[220px]"
              loading="lazy"
              onError={(event) => { event.currentTarget.src = parishLogo; }}
            />
            <div>
              <h2 className="text-white font-serif font-bold text-lg">Paróquia Senhor Santo Cristo</h2>
              <p className="text-[#e8c872] text-xs font-sans tracking-wide">Cidade Tiradentes • São Paulo - SP</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-xs space-y-2 text-stone-300 text-left">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#e8c872] shrink-0 mt-0.5" />
              <span>{parishInfo.address || 'R. dos Têxteis, 653 - Cidade Tiradentes, SP'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[#e8c872] shrink-0" />
              <span>WhatsApp / Secretaria: {parishInfo.whatsapp_phone || parishInfo.phone || '(11) 98588-8816'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-stone-400">
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1.5 hover:text-[#e8c872] transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              <span>Acesso Administrativo</span>
            </button>
          </div>
        </div>

        {/* DESKTOP FOOTER */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Parish Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-12 w-auto object-contain max-w-[200px]"
                loading="lazy"
                onError={(event) => { event.currentTarget.src = parishLogo; }}
              />
            </div>
            <p className="text-sm text-stone-300 leading-relaxed font-light">
              Paróquia Senhor Santo Cristo dos Milagres. Evangelização, comunhão e acolhimento pastoral em Cidade Tiradentes.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-lg tracking-wide text-[#e8c872] border-b border-[#c5a059]/20 pb-2">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'home', label: 'Página Inicial' },
                { id: 'announcements', label: 'Avisos & Eventos' },
                { id: 'programs', label: 'Programações de Missas' },
                { id: 'history', label: 'Nossa História' },
                { id: 'pastorals', label: 'Pastorais e Movimentos' },
                { id: 'documentacoes', label: 'Sacramentos & Guias' },
                { id: 'photos', label: 'Galeria de Fotos' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="hover:text-[#e8c872] transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="text-[#e8c872] text-xs">›</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Secretariat & Schedule */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-lg tracking-wide text-[#e8c872] border-b border-[#c5a059]/20 pb-2">
              Atendimento
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#e8c872] shrink-0 mt-1" />
                <span>{parishInfo.address || 'R. dos Têxteis, 653 - Chácara Santa Etelvina, São Paulo - SP'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#e8c872] shrink-0" />
                <span>{parishInfo.whatsapp_phone || parishInfo.phone || '(11) 98588-8816'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#e8c872] shrink-0" />
                <span>{parishInfo.email || 'contato@paroquiasantocristo.com.br'}</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="h-4 w-4 text-[#e8c872] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-200">Secretaria Paroquial:</p>
                  <p className="text-xs text-stone-400">{parishInfo.office_hours || 'Terça a Sábado: 09h às 17h'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Paróquia Senhor Santo Cristo dos Milagres.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-[#e8c872] transition-colors underline"
            >
              Privacidade
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-[#e8c872] transition-colors underline"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <a
              href="https://instagram.com/guthierresc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#e8c872] transition-colors"
            >
              Desenvolvido por <span className="text-stone-300 font-medium">Sem. Guthierres</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
