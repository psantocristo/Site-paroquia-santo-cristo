import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    qrCodeBase64?: string;
    copyPasteCode: string;
    expirationDate?: string;
  };
  donationId: string;
  amount: number;
  onPaymentConfirmed: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  pixData,
  donationId,
  amount,
  onPaymentConfirmed
}) => {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Calcular tempo restante
  useEffect(() => {
    if (!pixData.expirationDate) return;

    const updateTimeLeft = () => {
      const expirationTime = new Date(pixData.expirationDate!).getTime();
      const now = Date.now();
      const diff = expirationTime - now;

      if (diff <= 0) {
        setTimeLeft(0);
        return;
      }

      setTimeLeft(Math.floor(diff / 1000));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [pixData.expirationDate]);

  // Polling para verificar pagamento
  useEffect(() => {
    if (!isOpen) return;

    const checkPaymentStatus = async () => {
      setChecking(true);
      try {
        const { data, error } = await supabase.functions.invoke('sicredi-check-status', {
          body: { donationId }
        });

        if (error) throw error;

        if (data.status === 'paid') {
          toast.success('Pagamento confirmado!');
          onPaymentConfirmed();
          onClose();
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setChecking(false);
      }
    };

    // Verificar a cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [isOpen, donationId, onPaymentConfirmed, onClose]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixData.copyPasteCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-2">Pagar com PIX</h2>
        <p className="text-muted-foreground mb-6">
          Valor: <span className="font-bold text-foreground">R$ {amount.toFixed(2)}</span>
        </p>

        {timeLeft !== null && timeLeft > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-900 dark:text-orange-200">
              Tempo restante: <strong>{formatTime(timeLeft)}</strong>
            </span>
          </div>
        )}

        {timeLeft === 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-200">
              O código PIX expirou. Por favor, gere um novo código.
            </p>
          </div>
        )}

        {/* QR Code */}
        {pixData.qrCodeBase64 && (
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-lg">
              <img
                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>
          </div>
        )}

        {/* Código Copia e Cola */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Código PIX (Copia e Cola)
          </label>
          <div className="relative">
            <input
              type="text"
              value={pixData.copyPasteCode}
              readOnly
              className="w-full px-3 py-2 pr-12 border border-border rounded-md bg-muted text-foreground font-mono text-sm"
            />
            <button
              onClick={handleCopyCode}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-md transition-colors"
            >
              {copied ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <Copy size={20} className="text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use este código para pagar pelo app do seu banco
          </p>
        </div>

        {/* Status de verificação */}
        {checking && (
          <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-900 dark:text-blue-200">
              Verificando pagamento...
            </span>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Como pagar:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar com PIX</li>
            <li>Escaneie o QR Code ou cole o código</li>
            <li>Confirme o pagamento</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">
            O pagamento será confirmado automaticamente em alguns segundos.
          </p>
        </div>
      </div>
    </div>
  );
};
