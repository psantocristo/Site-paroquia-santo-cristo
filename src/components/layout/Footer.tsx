import React, { useEffect, useState } from 'react';
import { Church, MapPin, Phone, Mail, Clock, Heart, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoAlt, setLogoAlt] = useState('Logo da Paróquia');
  const [parishInfo, setParishInfo] = useState<{
    phone?: string;
    whatsapp_phone?: string;
    email?: string;
    address?: string;
    office_hours?: string;
    confession_hours?: string;
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
          setLogoUrl(logoData.logo_url);
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
    <footer className="bg-gradient-to-b from-red-950 via-[#2e0909] to-[#1e0404] text-stone-300 pt-14 pb-8 border-t border-gold-400/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Parish Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  className="h-12 w-auto object-contain max-w-[200px]"
                  loading="lazy"
                />
              ) : (
                <div className="p-2 bg-gradient-to-br from-gold-400/20 to-gold-600/10 rounded-xl border border-gold-400/30">
                  <Church className="h-8 w-8 text-gold-400" />
                </div>
              )}
            </div>
            <p className="text-sm text-stone-300 leading-relaxed font-light">
              Paróquia Senhor Santo Cristo dos Milagres. Celebrando 40 anos de evangelização, comunhão e serviço à comunidade de Cidade Tiradentes.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-gold-400/20 text-gold-300 text-xs font-serif font-semibold tracking-wider">
              ✦ 40 ANOS DE FÉ • 1985 - 2025
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-lg tracking-wide text-gold-300 border-b border-gold-400/20 pb-2">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'home', label: 'Página Inicial' },
                { id: 'history', label: 'Nossa História (40 Anos)' },
                { id: 'announcements', label: 'Avisos & Eventos' },
                { id: 'programs', label: 'Programações de Missas' },
                { id: 'pastorals', label: 'Pastorais e Movimentos' },
                { id: 'documentacoes', label: 'Sacramentos & Guias' },
                { id: 'photos', label: 'Galeria de Fotos' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="hover:text-gold-300 transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="text-gold-500 text-xs">›</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Secretariat & Schedule */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-lg tracking-wide text-gold-300 border-b border-gold-400/20 pb-2">
              Atendimento
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0 mt-1" />
                <span>{parishInfo.address || 'R. dos Têxteis, 653 - Chácara Santa Etelvina, São Paulo - SP'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <span>{parishInfo.whatsapp_phone || parishInfo.phone || '(11) 98588-8816'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                <span>{parishInfo.email || 'contato@paroquiasantocristo.com.br'}</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-200">Secretaria Paroquial:</p>
                  <p className="text-xs text-stone-400">{parishInfo.office_hours || 'Terça a Sábado: 09h às 17h'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Donations & Admin */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-lg tracking-wide text-gold-300 border-b border-gold-400/20 pb-2">
              Contribuição
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Ajude a manter nossas obras sociais, manutenções e atividades evangelizadoras através do dízimo ou doações online.
            </p>
            <button
              onClick={() => {
                window.location.pathname = '/campanhas';
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-red-950 font-bold rounded-xl shadow-gold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-red-950" />
              Doar via PIX / Cartão
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  window.location.pathname = '/login';
                }}
                className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-gold-300 transition-colors"
                title="Área Administrativa"
              >
                <Lock className="h-3 w-3" />
                <span>Acesso Administrativo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Paróquia Senhor Santo Cristo dos Milagres. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-gold-300 transition-colors underline"
            >
              Privacidade
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-gold-300 transition-colors underline"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <a
              href="https://instagram.com/guthierresc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-300 transition-colors"
            >
              Desenvolvido por <span className="text-stone-300 font-medium">Sem. Guthierres</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
