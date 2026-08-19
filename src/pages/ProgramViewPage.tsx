import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/ui/SEO';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  time: string;
  days_of_week: string[] | null;
  featured_image: string | null;
  created_at: string | null;
}

const daysMap: Record<string, string> = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
};

interface ProgramViewPageProps {
  slug: string;
  onBack: () => void;
}

export const ProgramViewPage: React.FC<ProgramViewPageProps> = ({ slug, onBack }) => {
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        if (data) setProgram(data as unknown as Program);
      } catch (error) {
        console.error('Error fetching program:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgram();
  }, [slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/programacao/${slug}`;
    const text = program ? `${program.title} - Paróquia Senhor Santo Cristo dos Milagres` : '';

    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-800 mx-auto mb-4" />
          <p className="text-gray-600">Carregando programação...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Programação não encontrada</h2>
          <p className="text-gray-500 mb-6">Esta programação pode ter sido removida ou desativada.</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${program.title} - Paróquia Senhor Santo Cristo dos Milagres`}
        description={program.description}
        url={`https://paroquiasantocristo.com.br/programacao/${slug}`}
        keywords={`programação, ${program.title}, paróquia, santo cristo, tiradentes`}
        image={program.featured_image || undefined}
      />

      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Voltar</span>
              </Button>
              <button
                onClick={handleShare}
                className="ml-auto p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Compartilhar"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-200 text-sm font-medium">Programação</p>
                  <h1 className="text-2xl sm:text-4xl font-bold">{program.title}</h1>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Featured Image */}
            {program.featured_image && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={program.featured_image}
                  alt={program.title}
                  className="w-full h-auto max-h-[400px] object-cover"
                />
              </div>
            )}

            {/* Info Card */}
            <Card className="p-6 sm:p-8 mb-8 bg-white/90 backdrop-blur-sm" hover={false}>
              {/* Decorative top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-800 via-amber-600 to-red-800 rounded-t-xl" />

              <div className="space-y-6">
                {/* Schedule info */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-center gap-3 bg-red-50 rounded-lg px-4 py-3 border border-red-100">
                    <Clock className="h-5 w-5 text-red-800" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Horário</p>
                      <p className="text-lg font-bold text-red-900">{program.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-50 rounded-lg px-4 py-3 border border-amber-100 flex-1">
                    <Calendar className="h-5 w-5 text-amber-700 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Dias</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(program.days_of_week ?? []).map((day: string) => (
                          <span
                            key={day}
                            className="px-3 py-1 text-sm bg-white text-amber-800 rounded-full font-medium border border-amber-200"
                          >
                            {daysMap[day] || day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-lg max-w-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                    <span className="text-sm text-gray-400 font-medium">Sobre</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
                  </div>
                  {program.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-3 text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Card>

            {/* CTA */}
            <Card className="p-6 bg-gradient-to-r from-red-50 to-amber-50 border border-red-100" hover={false}>
              <div className="text-center">
                <Calendar className="h-8 w-8 text-red-800 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Participe!</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Venha participar desta programação da nossa paróquia.
                  Para mais informações, entre em contato conosco.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};
