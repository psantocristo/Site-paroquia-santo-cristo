import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { DollarSign, Calendar, User, CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { DonationDetailsModal } from './DonationDetailsModal';

interface Donation {
  id: string;
  campaign_id: string | null;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  txid: string | null;
  created_at: string | null;
  updated_at?: string | null;
  campaigns: { title: string; slug?: string; } | null;
}

export const TransactionsPanel: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_donations')
        .select('*, campaigns(title, slug)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Erro ao carregar doações');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-600 text-white';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    return donation.status === filter;
  });

  const totalAmount = filteredDonations.reduce((sum, d) => 
    d.status === 'paid' ? sum + d.amount : sum, 0
  );

  const totalPaid = donations.filter(d => d.status === 'paid').length;
  const totalPending = donations.filter(d => d.status === 'pending').length;
  const totalFailed = donations.filter(d => d.status === 'failed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Transações</h2>
        <Button onClick={fetchDonations} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Arrecadado</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {totalAmount.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagas</p>
              <p className="text-2xl font-bold text-foreground">{totalPaid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-foreground">{totalPending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Falhadas</p>
              <p className="text-2xl font-bold text-foreground">{totalFailed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background border border-border text-foreground hover:bg-muted'
          }`}
          onClick={() => setFilter('all')}
        >
          Todas ({donations.length})
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'paid' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background border border-border text-foreground hover:bg-muted'
          }`}
          onClick={() => setFilter('paid')}
        >
          Pagas ({totalPaid})
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'pending' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background border border-border text-foreground hover:bg-muted'
          }`}
          onClick={() => setFilter('pending')}
        >
          Pendentes ({totalPending})
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'failed' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background border border-border text-foreground hover:bg-muted'
          }`}
          onClick={() => setFilter('failed')}
        >
          Falhadas ({totalFailed})
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        ) : (
          filteredDonations.map((donation) => (
            <div
              key={donation.id}
              onClick={() => setSelectedDonation(donation)}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{donation.campaigns?.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                      {getStatusText(donation.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{donation.donor_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{donation.created_at ? new Date(donation.created_at).toLocaleString('pt-BR') : 'Data não disponível'}</span>
                    </div>
                    {donation.payment_method && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="capitalize">{donation.payment_method.replace('_', ' ')}</span>
                      </div>
                    )}
                    {donation.txid && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono">ID: {donation.txid}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusIcon(donation.status)}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      R$ {donation.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedDonation && (
        <DonationDetailsModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}
    </div>
  );
};
