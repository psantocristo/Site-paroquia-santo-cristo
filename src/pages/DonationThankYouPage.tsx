import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { generateDonationReceipt } from '../components/ui/DonationReceipt';
import { SEO } from '../components/ui/SEO';

export const DonationThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donationId');
  const [donation, setDonation] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!donationId) {
      navigate('/');
      return;
    }

    fetchDonationDetails();
  }, [donationId, navigate]);

  const fetchDonationDetails = async () => {
    if (!donationId) return;
    
    try {
      const { data: donationData, error: donationError } = await supabase
        .from('campaign_donations')
        .select('*')
        .eq('id', donationId)
        .single();

      if (donationError) throw donationError;

      setDonation(donationData);

      if (donationData.campaign_id) {
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', donationData.campaign_id)
          .single();

        if (campaignError) throw campaignError;
        setCampaign(campaignData);
      }
    } catch (error) {
      console.error('Error fetching donation:', error);
      toast.error('Erro ao carregar detalhes da doação');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Acabei de fazer uma doação!',
      text: `Apoiei a campanha "${campaign?.title}" com uma doação de R$ ${donation?.amount.toFixed(2)}. Você também pode ajudar!`,
      url: window.location.origin + '/campanhas/' + campaign?.slug
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!donation || !campaign) {
    return null;
  }

  return (
    <>
      <SEO
        title="Obrigado pela sua doação!"
        description="Sua doação foi recebida com sucesso. Obrigado por fazer a diferença!"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Doação Realizada!
            </h1>
            <p className="text-lg text-muted-foreground">
              Obrigado por fazer a diferença. Sua contribuição é muito importante!
            </p>
          </div>

          {/* Donation Summary */}
          <div className="bg-background border border-border rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Campanha</p>
                <p className="font-semibold text-foreground">{campaign.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor da Doação</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {donation.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Método de Pagamento</p>
                <p className="font-semibold text-foreground capitalize">
                  {donation.payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                  {donation.status === 'paid' ? 'Confirmado' : 'Processando'}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">ID da Transação</p>
              <p className="font-mono text-sm text-foreground">{donation.id}</p>
            </div>
          </div>

          {/* Receipt Download */}
          <div className="bg-background border border-border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Comprovante</h2>
            <Button
              onClick={() => generateDonationReceipt({
                donationId: donation.id,
                donorName: donation.donor_name,
                donorEmail: donation.donor_email,
                amount: donation.amount,
                campaignTitle: campaign.title,
                paymentMethod: donation.payment_method,
                date: donation.created_at
              })}
              variant="outline"
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar Comprovante (PDF)
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              className="flex-1"
            >
              <Home size={18} className="mr-2" />
              Voltar ao Início
            </Button>
            <Button
              onClick={() => navigate(`/campanhas/${campaign.slug}`)}
              variant="outline"
              className="flex-1"
            >
              Ver Campanha
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
            >
              <Share2 size={18} className="mr-2" />
              Compartilhar
            </Button>
          </div>

          {/* Additional Message */}
          <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              Sua doação faz a diferença!
            </h3>
            <p className="text-sm text-muted-foreground">
              Cada contribuição nos ajuda a continuar nosso trabalho e fazer mais pelo bem da comunidade. 
              Você receberá uma confirmação por e-mail em breve com todos os detalhes da sua doação.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
