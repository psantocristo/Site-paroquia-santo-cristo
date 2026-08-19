import React from 'react';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import logoParoquia from '../../assets/logo-paroquia.png';

interface DonationReceiptProps {
  donationId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  campaignTitle: string;
  paymentMethod: string;
  date: string;
}

export const generateDonationReceipt = async (props: DonationReceiptProps) => {
  const { donationId, donorName, donorEmail, amount, campaignTitle, paymentMethod, date } = props;
  
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Load and add logo
    const img = new Image();
    img.src = logoParoquia;
    
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
      // Add logo
      doc.addImage(img, 'PNG', pageWidth / 2 - 40, 10, 80, 30);
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(139, 0, 0);
      doc.text('Comprovante de Doação', pageWidth / 2, 50, { align: 'center' });
      
      // Line
      doc.setDrawColor(139, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(20, 55, pageWidth - 20, 55);
      
      // Donation info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 70;
      
      // ID
      doc.setFont('helvetica', 'bold');
      doc.text('ID da Doação:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(donationId, 20, yPos + 6);
      yPos += 20;
      
      // Donor
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Doador:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(donorName, 20, yPos + 6);
      yPos += 15;
      
      // Email
      doc.setFont('helvetica', 'bold');
      doc.text('E-mail:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(donorEmail, 20, yPos + 6);
      yPos += 20;
      
      // Campaign
      doc.setFont('helvetica', 'bold');
      doc.text('Campanha:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      const splitCampaign = doc.splitTextToSize(campaignTitle, pageWidth - 40);
      doc.text(splitCampaign, 20, yPos + 6);
      yPos += 15 + (splitCampaign.length * 5);
      
      // Amount - Highlight
      doc.setFillColor(220, 240, 220);
      doc.rect(15, yPos - 5, pageWidth - 30, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 0);
      doc.text('Valor da Doação:', 20, yPos + 5);
      doc.setFontSize(20);
      doc.text(`R$ ${amount.toFixed(2)}`, 20, yPos + 15);
      yPos += 35;
      
      // Payment method
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Método de Pagamento:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'credit_card' ? 'Cartão de Crédito' : paymentMethod, 20, yPos + 6);
      yPos += 15;
      
      // Date
      doc.setFont('helvetica', 'bold');
      doc.text('Data:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(date).toLocaleString('pt-BR'), 20, yPos + 6);
      yPos += 25;
      
      // Thank you message
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 5, pageWidth - 30, 35, 'F');
      doc.setFontSize(11);
      doc.setTextColor(139, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Muito Obrigado!', pageWidth / 2, yPos + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const thankYouText = 'Sua generosidade faz toda a diferença para nossa comunidade paroquial. Que Deus abençoe você e sua família!';
      const splitThankYou = doc.splitTextToSize(thankYouText, pageWidth - 50);
      doc.text(splitThankYou, pageWidth / 2, yPos + 13, { align: 'center' });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Paróquia Senhor Santo Cristo dos Milagres', pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' });
      doc.text(`Comprovante gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });
      doc.text('Este documento é um comprovante de doação e não possui validade fiscal.', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      
          // Save
          doc.save(`comprovante-doacao-${donationId.substring(0, 8)}.pdf`);
          resolve();
        } catch (error) {
          console.error('Erro ao gerar PDF:', error);
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar logo'));
      };
    });
  } catch (error) {
    console.error('Erro ao gerar comprovante:', error);
    throw error;
  }
};

interface DownloadReceiptButtonProps {
  donation: DonationReceiptProps;
}

export const DownloadReceiptButton: React.FC<DownloadReceiptButtonProps> = ({ donation }) => {
  const [downloading, setDownloading] = React.useState(false);
  
  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateDonationReceipt(donation);
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={downloading} className="gap-2">
      <Download className="w-5 h-5" />
      {downloading ? 'Gerando...' : 'Baixar Comprovante'}
    </Button>
  );
};
