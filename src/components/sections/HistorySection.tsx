import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Heart, Award, Church, type LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { supabase, Parish } from '../../lib/supabase';

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const milestones: Milestone[] = [
  {
    year: '1985',
    title: 'Fundação da Paróquia',
    description: 'Início das atividades religiosas na comunidade',
    icon: Calendar
  },
  {
    year: '1990',
    title: 'Construção do Templo',
    description: 'Inauguração do novo templo para acolher mais fiéis',
    icon: Award
  },
  {
    year: '2000',
    title: 'Expansão da Comunidade',
    description: 'Crescimento significativo do número de paroquianos',
    icon: Users
  },
  {
    year: '2025',
    title: '40 Anos de Fé',
    description: 'Celebração de quatro décadas de bênçãos e milagres',
    icon: Heart
  }
];

export const HistorySection: React.FC = () => {
  const [parishData, setParishData] = useState<Parish | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParishData();
  }, []);

  const fetchParishData = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('parishes')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setParishData(data);
      } else {
        setParishData({
          id: '1',
          name: 'Paróquia Senhor Santo Cristo dos Milagres',
          history: `Nossa paróquia foi fundada em 1984, nascendo do sonho e da fé de uma comunidade unida em Cristo. Ao longo destes 40 anos, temos sido testemunhas de inúmeros milagres e bênçãos.

Iniciamos nossas atividades em uma pequena capela, que com o tempo e o crescimento da comunidade, se transformou no belo templo que conhecemos hoje. Nossa história é marcada por momentos de alegria, celebrações memoráveis e o crescimento espiritual de toda nossa família paroquial.

Durante estas quatro décadas, tivemos o privilégio de celebrar milhares de batismos, casamentos, primeiras comunhões e crismas. Cada sacramento celebrado fortaleceu ainda mais os laços de nossa comunidade e nossa fé no Senhor Santo Cristo dos Milagres.

Nossa paróquia sempre esteve comprometida com as obras sociais, ajudando famílias em situação de vulnerabilidade e promovendo a educação cristã para crianças e jovens. Mantemos grupos de oração, pastoral da criança, e diversas atividades que fortalecem nossa comunhão.

Hoje, olhamos para o futuro com esperança, gratos por tudo que o Senhor nos concedeu e prontos para continuar sendo instrumentos de Sua paz e amor em nossa cidade de Tiradentes.`,
          founded_year: 1984,
          address: 'Cid. Tiradentes, São Paulo',
          phone: '',
          email: '',
          logo_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching parish data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="history" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando história...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!parishData) {
    return (
      <section id="history" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent mb-4">
              Nossa História
            </h2>
            <Card className="p-12 max-w-2xl mx-auto">
              <Church className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                História em construção
              </h3>
              <p className="text-gray-500">
                Use o painel administrativo para adicionar a história da paróquia
              </p>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="history" className="py-20 md:py-28 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="eyebrow mb-4">Desde 1984</p>
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-14 bg-gold-400/60" />
            <Church className="h-5 w-5 text-gold-500" strokeWidth={1.5} />
            <div className="h-px w-14 bg-gold-400/60" />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-semibold text-wine-700 mb-5 tracking-tight">
            Nossa História
          </h2>
          <p className="font-serif italic text-xl text-wine-600/70 max-w-3xl mx-auto">
            Quatro décadas de fé, comunhão e milagres em nossa querida Tiradentes.
          </p>
        </motion.div>

        {/* Timeline - Desktop */}
        <div className="hidden md:block relative mb-16">
          {/* Linha vertical central */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-gold-400 to-transparent" />
          
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            const isLeft = index % 2 === 0;
            
            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-center mb-10 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Ícone central no círculo */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-12 h-12 rounded-full bg-cream-50 flex items-center justify-center border border-gold-400 shadow-gold">
                    <Icon className="h-4 w-4 text-gold-500" strokeWidth={1.5} />
                  </div>
                </div>
                
                {/* Card do evento */}
                <div className={`w-5/12 ${isLeft ? 'pr-10 text-right' : 'pl-10 text-left'}`}>
                  <Card className="p-6 bg-white">
                    <span className="font-serif text-3xl font-semibold text-gold-500 block leading-none mb-2">
                      {milestone.year}
                    </span>
                    <h4 className="font-serif text-xl font-semibold text-wine-700">{milestone.title}</h4>
                    <p className="text-gray-600 mt-1 text-sm leading-relaxed">{milestone.description}</p>
                  </Card>
                </div>
                
                {/* Espaço vazio do outro lado */}
                <div className="w-5/12" />
              </motion.div>
            );
          })}
        </div>

        {/* Timeline - Mobile */}
        <div className="md:hidden space-y-5 mb-12">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center border border-gold-400">
                    <Icon className="h-4 w-4 text-gold-500" strokeWidth={1.5} />
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-px flex-1 bg-gold-300 mt-1" />
                  )}
                </div>
                <Card className="flex-1 p-4">
                  <span className="font-serif text-2xl font-semibold text-gold-500 leading-none">{milestone.year}</span>
                  <h4 className="font-serif font-semibold text-wine-700 mt-1">{milestone.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{milestone.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* History Text Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative overflow-hidden bg-white">
            {/* Delicate gold corner ornaments */}
            <div className="absolute top-0 left-0 w-24 h-px bg-gold-400/60" />
            <div className="absolute top-0 left-0 w-px h-24 bg-gold-400/60" />
            <div className="absolute bottom-0 right-0 w-24 h-px bg-gold-400/60" />
            <div className="absolute bottom-0 right-0 w-px h-24 bg-gold-400/60" />
            
            <div className="relative z-10 p-8 lg:p-12">
              {/* Logo with glow effect */}
              {parishData.logo_url && (
                <div className="flex justify-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <img
                      src={parishData.logo_url}
                      alt="Logo da Paróquia"
                      className="relative w-28 h-28 object-contain rounded-full border-2 border-gold-400 shadow-elegant bg-white p-2"
                    />
                  </motion.div>
                </div>
              )}
              
              {/* Title with ornament */}
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="h-px w-12 md:w-20 bg-gold-400/50" />
                  <Church className="h-4 w-4 text-gold-500" strokeWidth={1.5} />
                  <div className="h-px w-12 md:w-20 bg-gold-400/50" />
                </div>
                <h3 className="font-serif text-3xl md:text-4xl font-semibold text-wine-700">
                  {parishData.name}
                </h3>
                {parishData.founded_year && (
                  <p className="eyebrow mt-3">
                    Fundada em {parishData.founded_year}
                  </p>
                )}
              </div>
              
              {/* History paragraphs with drop cap effect */}
              <div className="prose prose-lg max-w-none">
                {parishData.history.split('\n\n').map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`text-gray-700 mb-6 leading-[1.85] text-justify text-[1.05rem] ${
                      index === 0 
                        ? 'first-letter:font-serif first-letter:text-6xl first-letter:font-semibold first-letter:text-gold-500 first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:leading-none' 
                        : ''
                    }`}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
