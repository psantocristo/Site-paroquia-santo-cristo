import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface HomeSection {
  id: string;
  section_key: string;
  section_name: string;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const HomeSectionManager: React.FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Erro ao carregar seções');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (section: HomeSection) => {
    try {
      const { error } = await supabase
        .from('home_sections')
        .update({ is_active: !section.is_active, updated_at: new Date().toISOString() })
        .eq('id', section.id);

      if (error) throw error;

      toast.success(section.is_active ? 'Seção desativada' : 'Seção ativada');
      fetchSections();
    } catch (error) {
      console.error('Error toggling section:', error);
      toast.error('Erro ao atualizar seção');
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const section1 = sections[index];
    const section2 = sections[newIndex];

    try {
      // Swap order_index values
      const { error: error1 } = await supabase
        .from('home_sections')
        .update({ order_index: section2.order_index, updated_at: new Date().toISOString() })
        .eq('id', section1.id);

      const { error: error2 } = await supabase
        .from('home_sections')
        .update({ order_index: section1.order_index, updated_at: new Date().toISOString() })
        .eq('id', section2.id);

      if (error1 || error2) throw error1 || error2;

      toast.success('Ordem atualizada');
      fetchSections();
    } catch (error) {
      console.error('Error moving section:', error);
      toast.error('Erro ao mover seção');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Seções da Página Inicial</h2>
        <p className="text-gray-600">
          Ative/desative e reordene as seções que aparecem na página inicial do site
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Section Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full font-semibold text-sm">
                      {section.order_index}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{section.section_name}</h3>
                      <p className="text-sm text-gray-500">{section.section_key}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Move Up/Down */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveSection(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Toggle Active */}
                  <Button
                    variant={section.is_active ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleActive(section)}
                    className="min-w-[100px]"
                  >
                    {section.is_active ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Inativo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> Use os botões de seta para reordenar as seções. As seções inativas não
          aparecerão na página inicial do site.
        </p>
      </div>
    </div>
  );
};