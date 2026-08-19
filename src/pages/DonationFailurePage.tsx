import React, { useEffect } from 'react';
import { SEO } from '../components/ui/SEO';
import { Button } from '../components/ui/Button';
import { XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface DonationFailurePageProps {
  onRetry: () => void;
}

export const DonationFailurePage: React.FC<DonationFailurePageProps> = ({ 
  onRetry 
}) => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO
        title="Pagamento Não Autorizado | Paróquia Senhor Santo Cristo dos Milagres"
        description="Não foi possível processar seu pagamento. Por favor, tente novamente."
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
              <XCircle className="w-24 h-24 text-red-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Pagamento Não Autorizado
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Infelizmente, não foi possível processar seu pagamento. 
              Isso pode ter ocorrido por diversos motivos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6 mb-8"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Possíveis motivos:
                </h2>
              </div>
              <ul className="text-left space-y-2 text-gray-800 dark:text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-500">•</span>
                  <span>Dados do cartão incorretos ou cartão expirado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-500">•</span>
                  <span>Saldo ou limite insuficiente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-500">•</span>
                  <span>Pagamento recusado pelo banco emissor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-500">•</span>
                  <span>Cancelamento durante o processo de pagamento</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/50 rounded-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                O que você pode fazer:
              </h3>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Verifique os dados do seu cartão e tente novamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Utilize outro método de pagamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Entre em contato com seu banco para verificar restrições</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Aguarde alguns minutos e tente novamente</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={onRetry}
                size="lg"
                className="gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Tentar Novamente
              </Button>
              <Button
                onClick={() => window.location.href = 'https://paroquiasantocristo.com.br'}
                size="lg"
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Ir para Página Inicial
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-muted-foreground mt-8"
            >
              Se o problema persistir, entre em contato conosco pelo WhatsApp ou e-mail. 
              Teremos prazer em ajudá-lo!
            </motion.p>
          </motion.div>
        </div>
      </main>
    </>
  );
};
