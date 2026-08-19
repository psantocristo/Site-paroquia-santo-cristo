import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/ui/SEO';

interface NotFoundPageProps {
  onBack: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBack }) => {
  return (
    <>
    <SEO
      title="Página Não Encontrada - Paróquia Senhor Santo Cristo dos Milagres"
      description="A página que você procura não foi encontrada. Volte para a página inicial."
    />
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <img 
            src="/footer.webp" 
            alt="Paróquia Senhor Santo Cristo dos Milagres" 
            className="h-24 w-auto"
          />
        </motion.div>

        {/* 404 Number */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-9xl font-bold text-red-900 mb-4"
        >
          404
        </motion.h1>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Página Não Encontrada
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida. 
            Que tal retornar à página inicial?
          </p>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-red-100 p-6 rounded-full">
            <Search className="h-16 w-16 text-red-900" />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={onBack}
            className="bg-red-900 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            Voltar para Início
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-red-900 text-red-900 hover:bg-red-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Página Anterior
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-900 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-900 rounded-full blur-3xl opacity-20"></div>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};
