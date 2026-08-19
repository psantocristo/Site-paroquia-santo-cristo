import React from 'react';
import { X, User, Mail, Phone, Calendar, CreditCard, DollarSign, Hash } from 'lucide-react';
import { Button } from '../ui/Button';

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

interface DonationDetailsModalProps {
  donation: Donation;
  onClose: () => void;
}

export const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({ donation, onClose }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white">Pago</span>;
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pendente</span>;
      case 'failed':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white">Falhou</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Desconhecido</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Detalhes da Transação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
          {/* Status and Amount */}
          <div className="flex items-center justify-between">
            {getStatusBadge(donation.status)}
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor da Doação</p>
              <p className="text-3xl font-bold text-primary">R$ {donation.amount.toFixed(2)}</p>
            </div>
          </div>

          {/* Campaign Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Campanha</h3>
            <p className="text-gray-800 dark:text-gray-200">{donation.campaigns?.title}</p>
          </div>

          {/* Donor Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Informações do Doador</h3>
            
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Nome</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{donation.donor_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">E-mail</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{donation.donor_email}</p>
              </div>
            </div>

            {donation.donor_phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Telefone</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{donation.donor_phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Informações de Pagamento</h3>
            
            {donation.payment_method && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Método de Pagamento</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">{donation.payment_method.replace('_', ' ')}</p>
                </div>
              </div>
            )}

            {donation.payment_method && (
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tipo de Pagamento</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">{donation.payment_method.replace('_', ' ')}</p>
                </div>
              </div>
            )}

            {donation.txid && (
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">ID do Pagamento</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium font-mono text-sm">{donation.txid}</p>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Datas</h3>
            
            {donation.created_at && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Data de Criação</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {new Date(donation.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {donation.updated_at && donation.updated_at !== donation.created_at && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Última Atualização</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {new Date(donation.updated_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Transaction ID */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ID da Transação</p>
            <p className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all">{donation.id}</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
