import React, { useEffect, useState } from 'react';
import { Church } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// 1. Definindo a interface para a propriedade handleNavigate
interface FooterProps {
  onNavigate: (section: string) => void;
}

// 2. Recebendo a propriedade no componente
export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavigate = onNavigate;
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoAlt, setLogoAlt] = useState('Logo da Paróquia');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('logo_url, logo_alt')
          .eq('key', 'logo_settings')
          .maybeSingle();
        if (data) {
          setLogoUrl(data.logo_url);
          setLogoAlt(data.logo_alt || 'Logo da Paróquia');
        }
      } catch (e) {
        console.error('Error fetching footer logo:', e);
      }
    })();
  }, []);

  return (
    // Mantendo o estilo de fundo e margem
    <footer className="bg-gradient-to-r from-red-950 to-red-900 text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* A tag <motion.div> foi removida pois o componente Footer geralmente não lida com a 
          animação inicial/final do Fáramer Motion. Se for essencial, deve ser adicionada 
          aqui e 'motion' deve ser importado.
        */}
        <div className="text-center flex flex-col items-center">
          
          {/* Logo da Paróquia (mesma do cabeçalho para manter qualidade) */}
          <div className="flex items-center justify-center mb-3" style={{ minHeight: '48px' }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-12 sm:h-14 w-auto object-contain max-w-[240px]"
                loading="lazy"
              />
            ) : (
              <Church className="h-10 w-10 text-amber-400" />
            )}
          </div>
          
          {/* Direitos Autorais */}
          <p className="text-sm text-red-200 mb-2">
            © 2024 Paróquia Senhor Santo Cristo dos Milagres. Cidade Cid. Tiradentes, SP.
          </p>
          
          {/* Links de Política e Termos */}
          <div className="flex items-center justify-center gap-4 text-xs text-red-300/80 mb-2">
            <button
              onClick={() => handleNavigate('privacy')} // Usando a prop onNavigate
              className="hover:text-red-200 transition-colors duration-200 underline"
            >
              Política de Privacidade
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('terms')} // Usando a prop onNavigate
              className="hover:text-red-200 transition-colors duration-200 underline"
            >
              Termos de Uso
            </button>
          </div>
          
          {/* Desenvolvedor */}
          <div className="mt-4 pt-3 border-t border-red-700/30">
            <p className="text-xs text-red-300/80">
              Desenvolvido por 
              <a 
                href="https://instagram.com/guthierresc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-red-200 transition-colors duration-200 ml-1"
              >
                Sem. Guthierres
              </a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
