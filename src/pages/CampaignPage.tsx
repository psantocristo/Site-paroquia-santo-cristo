import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/ui/SEO';
import { Button } from '../components/ui/Button';
import { Heart, Calendar, Target, ArrowLeft, Share2, Facebook, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import pixLogo from '../assets/pix-logo.png';
import sicrediLogo from '../assets/sicredi-logo.png.asset.json';
import { PixPaymentModal } from '../components/payment/PixPaymentModal';

interface CampaignPageProps {
  slug: string | null;
  onBack: () => void;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  featured_image: string | null;
  start_date: string | null;
  end_date: string | null;
}

export const CampaignPage: React.FC<CampaignPageProps> = ({ slug, onBack }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [installments, setInstallments] = useState('1');
  const [cpf, setCpf] = useState('');
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [donationId, setDonationId] = useState<string>('');
  const [pixEnabled, setPixEnabled] = useState(true);
  const [creditCardEnabled, setCreditCardEnabled] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCampaign();
      fetchPaymentMethodSettings();
    }
  }, [slug]);

  // Realtime subscription for campaign updates
  useEffect(() => {
    if (!campaign?.id) return;

    const channel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${campaign.id}`
        },
        (payload) => {
          setCampaign(payload.new as Campaign);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaign?.id]);

  const fetchPaymentMethodSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['payment_pix_enabled', 'payment_credit_card_enabled']);

      if (error) throw error;

      const settings = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value === 'true';
        return acc;
      }, {} as Record<string, boolean>);

      const pixEnabledValue = settings?.payment_pix_enabled ?? true;
      const creditCardEnabledValue = settings?.payment_credit_card_enabled ?? true;
      
      setPixEnabled(pixEnabledValue);
      setCreditCardEnabled(creditCardEnabledValue);

      if (paymentMethod === 'pix' && !pixEnabledValue) {
        setPaymentMethod('credit_card');
      } else if (paymentMethod === 'credit_card' && !creditCardEnabledValue) {
        setPaymentMethod('pix');
      }
    } catch (error) {
      console.error('Error fetching payment method settings:', error);
    }
  };

  const fetchCampaign = async () => {
    if (!slug) return;
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Campanha não encontrada');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(donationAmount);
    if (amount < 1) {
      toast.error('O valor mínimo é R$ 1,00');
      return;
    }

    if (paymentMethod === 'pix') {
      handlePixPayment();
    } else {
      setShowCreditCardForm(true);
    }
  };

  const handlePixPayment = async () => {
    if (!campaign) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sicredi-create-pix', {
        body: {
          campaignId: campaign.id,
          amount: parseFloat(donationAmount),
          donorName,
          donorEmail,
          donorPhone
        }
      });

      if (error) throw error;

      if (data.pixData) {
        setPixData(data.pixData);
        setDonationId(data.donationId);
        setShowPixModal(true);
      }
    } catch (error: any) {
      console.error('Error processing PIX payment:', error);
      toast.error(error.message || 'Erro ao processar pagamento PIX');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreditCardPayment = async () => {
    if (!campaign) return;

    setProcessing(true);
    try {
      const [expMonth, expYear] = expirationDate.split('/');
      
      const { data, error } = await supabase.functions.invoke('sicredi-create-card', {
        body: {
          campaignId: campaign.id,
          amount: parseFloat(donationAmount),
          donorName,
          donorEmail,
          donorPhone,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardholderName,
          expirationMonth: expMonth,
          expirationYear: `20${expYear}`,
          securityCode,
          cpf: cpf.replace(/\D/g, ''),
          installments: parseInt(installments)
        }
      });

      if (error) {
        window.location.href = `/doacao-falha?reason=${encodeURIComponent(error.message || 'Erro ao processar pagamento')}`;
        return;
      }

      if (data.success) {
        toast.success('Pagamento aprovado com sucesso!');
        setTimeout(() => {
          window.location.href = `/doacao-sucesso?donationId=${data.donationId}&slug=${campaign.slug}`;
        }, 1000);
      } else {
        window.location.href = `/doacao-falha?reason=${encodeURIComponent(data.message || 'Pagamento recusado')}`;
      }
    } catch (error: any) {
      console.error('Error processing credit card payment:', error);
      window.location.href = `/doacao-falha?reason=${encodeURIComponent(error.message || 'Erro ao processar pagamento')}`;
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
  };

  const formatExpirationDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 9) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
    } else if (cleaned.length >= 6) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const shareOnWhatsApp = () => {
    const text = `Confira esta campanha: ${campaign?.title}`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handlePaymentConfirmed = () => {
    if (campaign) {
      window.location.href = `/doacao-sucesso?donationId=${donationId}&slug=${campaign.slug}`;
    }
  };

  const calculateProgress = () => {
    if (!campaign || campaign.goal_amount === 0) return 0;
    return (campaign.current_amount / campaign.goal_amount) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <>
      <SEO 
        title={`${campaign.title} - Paróquia Senhor Santo Cristo`}
        description={campaign.description.replace(/<[^>]*>/g, '').substring(0, 160)}
        image={campaign.featured_image || 'https://paroquiasantocristo.com.br/capa.webp'}
        url={`https://paroquiasantocristo.com.br/campanha/${slug}`}
      />

      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {campaign.featured_image && (
                <div className="relative h-96 rounded-lg overflow-hidden mb-6">
                  <img
                    src={campaign.featured_image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="bg-card rounded-lg p-6 shadow-lg">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {campaign.title}
                </h1>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Progresso da Campanha</span>
                    <span className="text-lg font-bold text-primary">
                      {calculateProgress().toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-300 ${
                        calculateProgress() > 100 
                          ? 'bg-gradient-to-r from-green-600 to-green-400' 
                          : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Faltam {(100 - calculateProgress()).toFixed(1)}% para atingir a meta
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  {campaign.start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Início: {new Date(campaign.start_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {campaign.end_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>Término: {new Date(campaign.end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <div 
                  className="prose prose-lg max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: campaign.description }}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 shadow-lg sticky top-24">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-primary" />
                  Faça sua doação
                </h2>

                {!showCreditCardForm ? (
                  <form onSubmit={handleSubmitDonation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Valor da doação (R$)
                      </label>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        min="1"
                        step="0.01"
                        required
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Telefone (opcional)
                      </label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Forma de pagamento
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => pixEnabled && setPaymentMethod('pix')}
                          disabled={!pixEnabled}
                          className={`p-4 border-2 rounded-lg transition-all relative ${
                            !pixEnabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : paymentMethod === 'pix'
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <img src={pixLogo} alt="PIX" className="h-8" />
                            <span className="font-medium text-sm">PIX</span>
                            {!pixEnabled && (
                              <span className="text-xs text-red-600">Indisponível</span>
                            )}
                            {paymentMethod === 'pix' && pixEnabled && (
                              <Check className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => creditCardEnabled && setPaymentMethod('credit_card')}
                          disabled={!creditCardEnabled}
                          className={`p-4 border-2 rounded-lg transition-all relative ${
                            !creditCardEnabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : paymentMethod === 'credit_card'
                              ? 'border-red-900 bg-red-50'
                              : 'border-gray-300 hover:border-red-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <img src={sicrediLogo.url} alt="Sicredi" className="h-8" />
                            <span className="font-medium text-sm">Cartão</span>
                            {!creditCardEnabled && (
                              <span className="text-xs text-red-600">Indisponível</span>
                            )}
                            {paymentMethod === 'credit_card' && creditCardEnabled && (
                              <Check className="w-5 h-5 text-red-900" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-full"
                      disabled={processing}
                    >
                      {processing ? 'Processando...' : 'Continuar'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Dados do cartão</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Número do cartão
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        maxLength={19}
                        required
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome no cartão
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        required
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="NOME COMO NO CARTÃO"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Validade
                        </label>
                        <input
                          type="text"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(formatExpirationDate(e.target.value))}
                          maxLength={5}
                          required
                          className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={securityCode}
                          onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ''))}
                          maxLength={4}
                          required
                          className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        maxLength={14}
                        required
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Parcelas
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                      >
                        <option value="1">1x sem juros</option>
                        <option value="2">2x sem juros</option>
                        <option value="3">3x sem juros</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreditCardForm(false)}
                        className="flex-1"
                        disabled={processing}
                      >
                        Voltar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleCreditCardPayment}
                        className="flex-1"
                        disabled={processing}
                      >
                        {processing ? 'Processando...' : 'Pagar'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar campanha
                  </button>

                  {showShareOptions && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={shareOnWhatsApp}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={shareOnFacebook}
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPixModal && pixData && (
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => setShowPixModal(false)}
          pixData={pixData}
          donationId={donationId}
          amount={parseFloat(donationAmount)}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </>
  );
};
