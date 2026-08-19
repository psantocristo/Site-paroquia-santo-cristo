import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Download, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/ui/SEO';
import toast from 'react-hot-toast';

interface Documentation {
  id: string;
  title: string;
  description: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  order_index: number | null;
}

export const DocumentationsPage: React.FC = () => {
  const [documentations, setDocumentations] = useState<Documentation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentations();
  }, []);

  const fetchDocumentations = async () => {
    try {
      const { data, error } = await supabase
        .from('documentation_procedures' as any)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setDocumentations(data as any || []);
    } catch (error) {
      console.error('Error fetching documentations:', error);
      toast.error('Erro ao carregar documentações');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <SEO
        title="Documentações e Procedimentos - Paróquia Santo Cristo dos Milagres"
        description="Documentações e procedimentos para ministração dos sacramentos e processos na paróquia."
        image="https://paroquiasantocristo.com.br/procedimentos.webp"
        keywords="documentações, procedimentos, sacramentos, batismo, casamento, primeira comunhão"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#faf8f5] via-white to-[#f5f0e6]">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-red-950 via-[#3a0a0a] to-[#240404] text-white pt-24 pb-16 border-b border-gold-400/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <button
              onClick={() => window.location.pathname = '/'}
              className="flex items-center gap-2 text-gold-300 hover:text-gold-200 mb-8 transition-colors text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o início</span>
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-400/10 border border-gold-400/30 rounded-2xl mb-4 backdrop-blur-sm">
                <FileText className="w-8 h-8 text-gold-400" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-gold-400/10 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                ✦ Orientações Paroquiais ✦
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
                Documentações & Procedimentos
              </h1>
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl mx-auto font-light">
                Orientações, requisitos e formulários necessários para a celebração dos Santos Sacramentos e serviços pastorais.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
          ) : documentations.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
              <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-xl font-serif font-bold text-stone-700">
                Nenhuma documentação disponível no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documentations.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white border border-stone-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(doc.id)}
                    className="w-full px-6 py-5 flex items-start justify-between hover:bg-stone-50/80 transition-colors gap-4 text-left cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-red-950">
                          {doc.title}
                        </h2>
                        {doc.file_url && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-800 border border-gold-300/40">
                            <FileText className="w-3 h-3 mr-1 text-gold-700" />
                            Arquivo para Download
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 font-light leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedId === doc.id ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex-shrink-0 mt-1 p-1 rounded-full bg-stone-100 text-stone-600"
                    >
                      <ChevronDown className="w-5 h-5 text-red-900" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedId === doc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-6 border-t border-stone-100 bg-[#fbf9f5]">
                          {doc.file_url && (
                            <div className="mb-6 p-4 bg-white border border-gold-300/60 rounded-xl shadow-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-red-900/10 rounded-xl border border-red-900/20 text-red-900">
                                    <FileText className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-stone-800 text-sm">{doc.file_name || 'Documento Oficial'}</p>
                                    <p className="text-xs text-stone-500">Clique ao lado para fazer o download gratuito</p>
                                  </div>
                                </div>
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-900 to-red-950 text-gold-300 hover:text-white rounded-xl hover:from-red-800 hover:to-red-900 transition-all shadow-sm font-semibold text-xs sm:text-sm border border-gold-400/30"
                                >
                                  <Download className="w-4 h-4" />
                                  Baixar Arquivo
                                </a>
                              </div>
                            </div>
                          )}
                          
                          <div
                            className="prose prose-sm max-w-none 
                              prose-headings:text-red-950 prose-headings:font-serif
                              prose-p:text-stone-700 prose-p:leading-relaxed
                              prose-strong:text-red-950
                              prose-li:text-stone-700
                              prose-a:text-red-800 prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: doc.content }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
