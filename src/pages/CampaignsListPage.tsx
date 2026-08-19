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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Heart className="w-16 h-16 mx-auto mb-4 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Campanhas
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Colabore com as campanhas da nossa paróquia e ajude a fazer a diferença na comunidade
            </p>
          </motion.div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="container mx-auto px-4 py-12">
        {campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Nenhuma campanha ativa no momento
            </h3>
            <p className="text-gray-600">
              Fique atento às próximas campanhas da nossa paróquia
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col cursor-pointer" onClick={() => handleCampaignClick(campaign.slug)}>
                  {/* Campaign Image */}
                  {campaign.featured_image && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={campaign.featured_image}
                        alt={campaign.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Campaign Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {campaign.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Progresso da Campanha</span>
                        <span className="text-lg font-bold text-red-800">
                          {calculateProgress(campaign.current_amount, campaign.goal_amount).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                        <div
                          className="bg-gradient-to-r from-red-600 to-red-800 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${calculateProgress(campaign.current_amount, campaign.goal_amount)}%` }}
                        >
                          <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-sm text-gray-600">
                          Faltam <strong className="text-red-800">
                            {(100 - calculateProgress(campaign.current_amount, campaign.goal_amount)).toFixed(1)}%
                          </strong> para atingir a meta
                        </span>
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {campaign.start_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} className="text-red-800" />
                          <span>Início: {new Date(campaign.start_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {campaign.end_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target size={16} className="text-red-800" />
                          <span>Fim: {new Date(campaign.end_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleCampaignClick(campaign.slug);
                      }}
                    >
                      <TrendingUp size={18} />
                      Colaborar Agora
                    </Button>
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
