import React, { useEffect, useState } from 'react';
import { SEO } from '../components/ui/SEO';
import { Button } from '../components/ui/Button';
import { CheckCircle, Heart, Home, Download, MessageCircle, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { supabase } from '../integrations/supabase/client';
import pixLogo from '../assets/pix-logo.png';

interface DonationSuccessPageProps {
  onBack: () => void;
}

export const DonationSuccessPage: React.FC<DonationSuccessPageProps> = ({ onBack }) => {
  const [donationData, setDonationData] = useState<any>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Obter parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const campaign = params.get('campaign');
    const amount = params.get('amount');
    const method = params.get('method');
    const donationId = params.get('donationId');

    if (donationId) {
      fetchDonationData(donationId);
    } else if (campaign && amount && method) {
      // Criar dados temporários se não tiver donationId
      setDonationData({
        amount: parseFloat(amount),
        payment_method: method,
        created_at: new Date().toISOString(),
      });
      fetchCampaignData(campaign);
    }
  }, []);

  const fetchDonationData = async (donationId: string) => {
    try {
      const { data, error } = await supabase
        .from('campaign_donations')
        .select('*, campaigns(title, slug)')
        .eq('id', donationId)
        .single();

      if (error) throw error;
      setDonationData(data);
      setCampaignData(data.campaigns);
    } catch (error) {
      console.error('Error fetching donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignData = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('title, slug')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setCampaignData(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!donationData || !campaignData) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(139, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Comprovante de Doação', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Paróquia Senhor Santo Cristo dos Milagres', 105, 30, { align: 'center' });
    
    // Dados da doação
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Dados da Doação:', 20, 60);
    
    doc.setFontSize(12);
    const date = new Date(donationData.created_at);
    const formattedDate = date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR');
    
    doc.text(`Data: ${formattedDate}`, 20, 75);
    doc.text(`Campanha: ${campaignData.title}`, 20, 85);
    doc.text(`Valor: R$ ${donationData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 95);
    doc.text(`Método de Pagamento: ${donationData.payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito'}`, 20, 105);
    
    if (donationData.donor_name) {
      doc.text(`Doador: ${donationData.donor_name}`, 20, 115);
    }
    
    if (donationData.txid) {
      doc.text(`ID da Transação: ${donationData.txid}`, 20, 125);
    }
    
    // Mensagem de agradecimento
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Obrigado por sua generosidade! Sua contribuição faz toda a diferença', 105, 160, { align: 'center' });
    doc.text('para nossa comunidade paroquial.', 105, 167, { align: 'center' });
    
    // Footer
    doc.setFontSize(8);
    doc.text('Este é um comprovante gerado automaticamente.', 105, 280, { align: 'center' });
    
    doc.save(`comprovante-doacao-${donationData.id || Date.now()}.pdf`);
  };

  const shareOnWhatsApp = () => {
    if (!campaignData) return;
    const url = window.location.origin + '/campanha/' + campaignData.slug;
    const text = `Acabei de doar para a campanha "${campaignData.title}"! Você também pode contribuir:`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    if (!campaignData) return;
    const url = window.location.origin + '/campanha/' + campaignData.slug;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Doação Realizada com Sucesso | Paróquia Senhor Santo Cristo dos Milagres"
        description="Obrigado por sua doação! Sua contribuição faz a diferença."
        type="website"
      />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-lg p-8 md:p-12 text-center shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <CheckCircle className="w-24 h-24 text-green-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <Heart className="w-8 h-8 text-primary fill-current" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Doação Realizada com Sucesso!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Muito obrigado por sua generosidade! Sua contribuição faz toda a diferença 
              para nossa comunidade paroquial e nos ajuda a continuar nossa missão.
            </motion.p>

            {/* Resumo da Doação */}
            {donationData && campaignData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-muted/50 rounded-lg p-6 mb-8 border border-border"
              >
                <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
                  Resumo da Doação
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Campanha:</span>
                    <span className="font-medium text-foreground">{campaignData.title}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-bold text-2xl text-primary">
                      R$ {donationData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Método de Pagamento:</span>
                    <div className="flex items-center gap-2">
                      {donationData.payment_method === 'pix' ? (
                        <>
                          <img src={pixLogo} alt="PIX" className="h-5" />
                          <span className="font-medium text-foreground">PIX</span>
                        </>
                      ) : (
                        <span className="font-medium text-foreground">Cartão de Crédito</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium text-foreground">
                      {new Date(donationData.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Botões de Ação */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <Button
                onClick={downloadReceipt}
                variant="primary"
                size="lg"
                className="w-full"
              >
                <Download className="w-5 h-5" />
                Baixar Comprovante
              </Button>

              {/* Compartilhamento */}
              <div className="border-t border-border pt-4">
                <p className="text-center text-sm text-muted-foreground mb-3">
                  Compartilhe esta campanha e inspire outras pessoas a contribuir:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={shareOnWhatsApp}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </Button>
                  
                  <Button
                    onClick={shareOnFacebook}
                    variant="outline"
                    className="w-full"
                  >
                    <Facebook className="w-5 h-5" />
                    Facebook
                  </Button>
                </div>
              </div>

              {/* Botão Voltar */}
              <Button
                onClick={onBack}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Home className="w-5 h-5" />
                Voltar ao Início
              </Button>
            </motion.div>

            {/* Mensagem bíblica */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-muted-foreground mt-8 italic text-center"
            >
              "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, 
              pois Deus ama quem dá com alegria." - 2 Coríntios 9,7
            </motion.p>
          </motion.div>
        </div>
      </main>
    </>
  );
};
