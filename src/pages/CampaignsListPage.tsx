import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Target, TrendingUp, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/ui/SEO';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  featured_image?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean | null;
}

interface CampaignsListPageProps {
  onBack: () => void;
}

export const CampaignsListPage: React.FC<CampaignsListPageProps> = ({ onBack }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_published', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleCampaignClick = (slug: string) => {
    window.location.pathname = `/campanha/${slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            <p className="mt-4 text-gray-600">Carregando campanhas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <SEO
      title="Campanhas - Paróquia Senhor Santo Cristo dos Milagres"
      description="Colabore com as campanhas da Paróquia Senhor Santo Cristo. Ajude a fazer a diferença na nossa comunidade."
      url="https://paroquiasantocristo.com.br/campanhas"
      keywords="campanhas, doações, paróquia, ajuda, colaboração"
    />
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f5] via-white to-[#f5f0e6]">
      {/* Institutional Header */}
      <div className="bg-gradient-to-b from-red-950 via-[#3a0a0a] to-[#240404] text-white pt-24 pb-16 border-b border-gold-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-gold-300 hover:text-gold-200 mb-8 transition-colors text-sm font-medium cursor-pointer"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft size={18} />
            <span>Voltar para o Início</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-400/10 border border-gold-400/30 rounded-2xl mb-4 backdrop-blur-sm">
              <Heart className="w-8 h-8 text-gold-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-gold-400/10 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              ✦ Solidariedade & Fé ✦
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
              Campanhas & Doações
            </h1>
            <p className="text-base sm:text-lg text-stone-300 leading-relaxed font-light">
              Contribua com as obras, reformas e projetos sociais da Paróquia Senhor Santo Cristo dos Milagres. Sua generosidade transforma vidas.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 max-w-xl mx-auto shadow-sm"
          >
            <Heart className="w-14 h-14 mx-auto mb-4 text-stone-300" />
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">
              Nenhuma campanha ativa no momento
            </h3>
            <p className="text-stone-500 text-sm">
              Fique atento às próximas campanhas e necessidades da nossa comunidade paroquial.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col cursor-pointer hover:border-gold-400 transition-all duration-300" onClick={() => handleCampaignClick(campaign.slug)}>
                  {/* Campaign Image */}
                  {campaign.featured_image && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                      <img
                        src={campaign.featured_image}
                        alt={campaign.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 bg-red-950/80 backdrop-blur-md text-gold-300 text-xs font-semibold rounded-full border border-gold-400/30">
                        Campanha Oficial
                      </span>
                    </div>
                  )}

                  {/* Campaign Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-red-950 mb-2.5 line-clamp-2 hover:text-red-800 transition-colors">
                        {campaign.title}
                      </h3>
                      
                      <p className="text-stone-600 text-sm mb-5 line-clamp-3 leading-relaxed font-light">
                        {campaign.description}
                      </p>
                    </div>

                    <div>
                      {/* Progress Bar */}
                      <div className="mb-5 bg-stone-50 p-4 rounded-xl border border-stone-200/70">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Arrecadado</span>
                          <span className="text-base font-bold text-red-950 font-serif">
                            {calculateProgress(campaign.current_amount, campaign.goal_amount).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-gold-500 to-amber-500 h-3 rounded-full transition-all duration-700 relative"
                            style={{ width: `${calculateProgress(campaign.current_amount, campaign.goal_amount)}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-4 border-b border-stone-100">
                        {campaign.start_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gold-600" />
                            <span>Início: {new Date(campaign.start_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        {campaign.end_date && (
                          <div className="flex items-center gap-1.5">
                            <Target size={14} className="text-gold-600" />
                            <span>Término: {new Date(campaign.end_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button 
                        variant="secondary" 
                        size="md"
                        className="w-full"
                        onClick={() => handleCampaignClick(campaign.slug)}
                      >
                        <Heart className="h-4 w-4 fill-red-950" />
                        Apoiar Campanha
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
