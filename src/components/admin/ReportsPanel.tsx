import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { Download, Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Donation {
  id: string;
  donor_name: string;
  donor_email: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  campaigns: { title: string; slug?: string; } | null;
}

export const ReportsPanel: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('campaign_donations')
        .select('*, campaigns(title)')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Erro ao carregar doações');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(139, 0, 0); // Cor vermelha da paróquia
      doc.text('Paróquia Senhor Santo Cristo dos Milagres', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Doações', 105, 30, { align: 'center' });
      
      // Period
      const periodText = startDate && endDate 
        ? `Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`
        : 'Período: Todas as transações';
      doc.setFontSize(10);
      doc.text(periodText, 105, 38, { align: 'center' });
      
      // Summary
      const totalPaid = donations.filter(d => d.status === 'paid');
      const totalAmount = totalPaid.reduce((sum, d) => sum + d.amount, 0);
      const totalPending = donations.filter(d => d.status === 'pending').length;
      const totalFailed = donations.filter(d => d.status === 'failed').length;
      
      doc.setFontSize(11);
      doc.text('Resumo:', 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Arrecadado: R$ ${totalAmount.toFixed(2)}`, 14, 56);
      doc.text(`Doações Pagas: ${totalPaid.length}`, 14, 62);
      doc.text(`Doações Pendentes: ${totalPending}`, 14, 68);
      doc.text(`Doações Falhadas: ${totalFailed}`, 14, 74);
      
      // Table
      const tableData = donations.map(d => [
        new Date(d.created_at || '').toLocaleDateString('pt-BR'),
        d.donor_name,
        d.campaigns?.title || 'N/A',
        `R$ ${d.amount.toFixed(2)}`,
        d.status === 'paid' ? 'Pago' : d.status === 'pending' ? 'Pendente' : 'Falhou',
        d.payment_method ? d.payment_method.replace('_', ' ') : '-'
      ]);

      doc.autoTable({
        startY: 82,
        head: [['Data', 'Doador', 'Campanha', 'Valor', 'Status', 'Método']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [139, 0, 0] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 45 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 }
        }
      });
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`relatorio-doacoes-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    }
  };

  const stats = {
    totalAmount: donations.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0),
    totalPaid: donations.filter(d => d.status === 'paid').length,
    totalPending: donations.filter(d => d.status === 'pending').length,
    totalFailed: donations.filter(d => d.status === 'failed').length,
  };

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
        <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Filtrar por Período
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchDonations} className="w-full">
              Aplicar Filtro
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Arrecadado</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {stats.totalAmount.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Doações Pagas</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPaid}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPending}</p>
            </div>
            <FileText className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Falhadas</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalFailed}</p>
            </div>
            <FileText className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={generatePDF} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Table Preview */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Data</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Doador</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Campanha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donations.slice(0, 10).map((donation) => (
                <tr key={donation.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm text-foreground">
                    {donation.created_at ? new Date(donation.created_at).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{donation.donor_name}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{donation.campaigns?.title}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">
                    R$ {donation.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      donation.status === 'paid' ? 'bg-green-600 text-white' :
                      donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-600 text-white'
                    }`}>
                      {donation.status === 'paid' ? 'Pago' :
                       donation.status === 'pending' ? 'Pendente' : 'Falhou'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {donations.length > 10 && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
            Mostrando 10 de {donations.length} transações. Exporte o PDF para ver todas.
          </div>
        )}
      </div>
    </div>
  );
};
