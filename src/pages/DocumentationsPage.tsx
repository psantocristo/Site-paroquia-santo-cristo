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

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-red-900 to-red-800 text-white py-20">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container mx-auto px-4 relative z-10">
            <button
              onClick={() => window.location.pathname = '/'}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para início</span>
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <FileText className="w-12 h-12" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  Documentações e Procedimentos
                </h1>
              </div>
              <p className="text-xl text-white/90">
                Documentações e procedimentos para ministração dos sacramentos e processos na paróquia
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : documentations.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">
                Nenhuma documentação disponível no momento.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {documentations.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(doc.id)}
                    className="w-full px-6 py-5 flex items-start justify-between hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-xl font-bold text-foreground">
                          {doc.title}
                        </h2>
                        {doc.file_url && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <FileText className="w-3 h-3 mr-1" />
                            Arquivo disponível
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedId === doc.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-6 h-6 text-primary" />
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
                        <div className="px-6 py-5 border-t border-border bg-muted/20">
                          {doc.file_url && (
                            <div className="mb-6 p-4 bg-card border border-primary/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-primary" />
                                <div className="flex-1">
                                  <p className="font-medium text-foreground mb-1">Arquivo Disponível</p>
                                  <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                                </div>
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg hover:from-red-900 hover:to-red-800 transition-all shadow-sm hover:shadow-md font-medium"
                                >
                                  <Download className="w-4 h-4" />
                                  Baixar Arquivo
                                </a>
                              </div>
                            </div>
                          )}
                          
                          <div
                            className="prose prose-sm max-w-none 
                              prose-headings:text-foreground 
                              prose-p:text-foreground 
                              prose-strong:text-foreground
                              prose-li:text-foreground
                              prose-a:text-primary"
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
