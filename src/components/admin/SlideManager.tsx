import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard as Edit, Trash2, Save, X, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase, Slide } from '../../lib/supabase';
import { deleteFromCloudinary } from '../../lib/cloudinary';
import toast from 'react-hot-toast';
const availablePages = [
  { id: '', label: 'Selecione uma página' },
  { id: 'home', label: 'Início' },
  { id: 'history', label: 'História' },
  { id: 'priest', label: 'Padre' },
  { id: 'timeline', label: 'Linha do Tempo' },
  { id: 'photos', label: 'Fotos' },
  { id: 'announcements', label: 'Eventos' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contato' },
  { id: 'pastorals', label: 'Pastorais (Página)' },
  { id: 'celebrations', label: 'Celebrações (Página)' }
];

export const SlideManager: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transitionTime, setTransitionTime] = useState(8);
  const [isSavingTransition, setIsSavingTransition] = useState(false);

  useEffect(() => {
    fetchSlides();
    fetchTransitionTime();
  }, []);

  const fetchTransitionTime = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'slide_transition_time')
        .single();
      
      if (data?.value) {
        const seconds = parseInt(data.value, 10);
        if (!isNaN(seconds) && seconds > 0) {
          setTransitionTime(seconds);
        }
      }
    } catch (error) {
      // Use default if not configured
    }
  };

  const handleSaveTransitionTime = async () => {
    if (transitionTime < 1 || transitionTime > 60) {
      toast.error('O tempo deve estar entre 1 e 60 segundos');
      return;
    }

    setIsSavingTransition(true);
    try {
      // Try to update existing setting
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', 'slide_transition_time')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: transitionTime.toString() })
          .eq('key', 'slide_transition_time');
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert([{
            key: 'slide_transition_time',
            value: transitionTime.toString(),
            description: 'Tempo de transição automática dos slides em segundos'
          }]);
        
        if (error) throw error;
      }

      toast.success('Tempo de transição salvo!');
    } catch (error) {
      console.error('Error saving transition time:', error);
      toast.error('Erro ao salvar tempo de transição');
    } finally {
      setIsSavingTransition(false);
    }
  };

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setSlides(data as Slide[]);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Erro ao buscar slides');
    }
  };

  const handleCreateSlide = () => {
    const newSlide: Slide = {
      id: '',
      title: '',
      description: '',
      image_url: '',
      cloudinary_public_id: null,
      order_index: slides.length,
      is_active: true,
      button_text: '',
      button_link: '',
      button_link_type: 'internal',
      button_open_new_tab: null,
      created_at: new Date().toISOString()
    };
    setEditingSlide(newSlide);
    setIsCreating(true);
  };

  const handleSaveSlide = async () => {
    if (!editingSlide || !editingSlide.title || !editingSlide.description) {
      toast.error('Preencha título e descrição');
      return;
    }

    try {
      if (isCreating) {
        const newOrderIndex = slides.length > 0 ? Math.max(...slides.map(s => s.order_index ?? 0)) + 1 : 0;
        const { data, error } = await supabase
          .from('slides')
          .insert([{
            title: editingSlide.title,
            description: editingSlide.description,
            image_url: editingSlide.image_url || '',
            order_index: newOrderIndex,
            is_active: editingSlide.is_active,
            button_text: editingSlide.button_text || null,
            button_link: editingSlide.button_link || null,
            button_link_type: editingSlide.button_link_type || 'internal',
            button_open_new_tab: editingSlide.button_open_new_tab
          }])
          .select()
          .single();

        if (error) throw error;
        setSlides(prev => [...prev, data as Slide].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
      } else {
        const { error } = await supabase
          .from('slides')
          .update({
            title: editingSlide.title,
            description: editingSlide.description,
            image_url: editingSlide.image_url,
            order_index: editingSlide.order_index,
            is_active: editingSlide.is_active,
            button_text: editingSlide.button_text || null,
            button_link: editingSlide.button_link || null,
            button_link_type: editingSlide.button_link_type || 'internal',
            button_open_new_tab: editingSlide.button_open_new_tab
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
        setSlides(prev => prev.map(s =>
          s.id === editingSlide.id ? editingSlide : s
        ).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
      }

      setEditingSlide(null);
      setIsCreating(false);
      toast.success('Slide salvo com sucesso!');
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Erro ao salvar slide');
    }
  };

  const handleDeleteSlide = async (slide: Slide) => {
    if (!confirm('Tem certeza que deseja excluir este slide?')) return;

    try {
      // Deletar imagem do Cloudinary primeiro (se tiver)
      if (slide.cloudinary_public_id) {
        const deleted = await deleteFromCloudinary(slide.cloudinary_public_id);
        if (!deleted) {
          console.warn('Aviso: Não foi possível deletar imagem do Cloudinary');
        }
      }

      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slide.id);

      if (error) throw error;

      setSlides(prev => prev.filter(s => s.id !== slide.id));
      toast.success('Slide excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Erro ao excluir slide');
    }
  };

  const handleToggleActive = async (slide: Slide) => {
    try {
      const { error } = await supabase
        .from('slides')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);

      if (error) throw error;

      setSlides(prev => prev.map(s =>
        s.id === slide.id ? { ...s, is_active: !s.is_active } : s
      ));
      toast.success('Status do slide atualizado!');
    } catch (error) {
      console.error('Error toggling slide:', error);
      toast.error('Erro ao atualizar slide');
    }
  };

  const handleMoveSlide = async (slide: Slide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const targetSlide = slides[targetIndex];

    try {
      const updatedSlides = [...slides];
      updatedSlides[currentIndex] = { ...slide, order_index: targetSlide.order_index };
      updatedSlides[targetIndex] = { ...targetSlide, order_index: slide.order_index };

      const { error: error1 } = await supabase
        .from('slides')
        .update({ order_index: targetSlide.order_index })
        .eq('id', slide.id);

      const { error: error2 } = await supabase
        .from('slides')
        .update({ order_index: slide.order_index })
        .eq('id', targetSlide.id);

      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message);
      }

      setSlides(updatedSlides.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));

      toast.success('Ordem dos slides atualizada!');
    } catch (error) {
      console.error('Error moving slide:', error);
      toast.error('Erro ao mover slide');
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    if (!editingSlide) return;
    setEditingSlide(prev => prev ? { 
      ...prev, 
      image_url: result.secureUrl,
      cloudinary_public_id: result.publicId 
    } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    if (!editingSlide) return;
    setEditingSlide(prev => prev ? { ...prev, image_url: result.url } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const handleImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !editingSlide) return;

    setIsUploading(true);
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Imagem muito grande (máximo 10MB)');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `slide-${Date.now()}.${fileExt}`;
      const filePath = `slides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setEditingSlide(prev => prev ? { ...prev, image_url: urlData.publicUrl } : null);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Slides</h3>
        <Button onClick={handleCreateSlide}>
          <Plus className="h-4 w-4" />
          Novo Slide
        </Button>
      </div>

      {/* Configuração de Tempo de Transição */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Tempo de transição automática:
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="60"
              value={transitionTime}
              onChange={(e) => setTransitionTime(parseInt(e.target.value, 10) || 8)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center"
            />
            <span className="text-sm text-gray-600">segundos</span>
          </div>
          <Button
            size="sm"
            onClick={handleSaveTransitionTime}
            disabled={isSavingTransition}
          >
            <Save className="h-4 w-4" />
            {isSavingTransition ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Define o intervalo entre cada troca automática de slides (1-60 segundos)
        </p>
      </Card>

      {slides.length === 0 && (
        <Card className="p-8 text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum slide encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando o primeiro slide para o carrossel principal
          </p>
          <Button onClick={handleCreateSlide}>
            <Plus className="h-4 w-4" />
            Criar Primeiro Slide
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!slide.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {slide.image_url && (
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{slide.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{slide.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Ordem: {slide.order_index}</span>
                      <span>•</span>
                      <span>{slide.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveSlide(slide, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveSlide(slide, 'down')}
                        disabled={index === slides.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(slide)}
                      >
                        {slide.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSlide(slide);
                          setIsCreating(false);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSlide(slide)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingSlide && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex-1 pr-4">
                  {isCreating ? 'Novo Slide' : 'Editar Slide'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSlide(null);
                    setIsCreating(false);
                  }}
                  className="w-8 h-8 p-0 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Título do slide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingSlide.description}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição do slide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem
                  </label>
                  {editingSlide.image_url && (
                    <div className="mb-3">
                      <img
                        src={editingSlide.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <FileUpload
                      onCloudinaryUpload={handleCloudinaryUpload}
                      onSupabaseUpload={handleSupabaseUpload}
                      onFileSelect={handleImageUpload}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {isUploading ? 'Carregando...' : 'Carregar Imagem'}
                      </Button>
                    </FileUpload>
                    {editingSlide.image_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSlide(prev => prev ? { ...prev, image_url: '' } : null)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Botão (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingSlide.button_text || ''}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, button_text: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Saiba Mais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Link
                  </label>
                  <select
                    value={editingSlide.button_link_type || 'internal'}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, button_link_type: e.target.value, button_link: '' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="internal">Link Interno (Seção da Página)</option>
                    <option value="external">Link Externo (URL)</option>
                  </select>
                </div>

                {editingSlide.button_link_type === 'internal' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seção da Página
                    </label>
                    <select
                      value={editingSlide.button_link || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, button_link: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      {availablePages.map(page => (
                        <option key={page.id} value={page.id}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Externa
                    </label>
                    <input
                      type="url"
                      value={editingSlide.button_link || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, button_link: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="https://exemplo.com"
                    />
                  </div>
                )}

                {editingSlide.button_link_type === 'external' && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingSlide.button_open_new_tab === 'true'}
                        onChange={(e) => setEditingSlide(prev => prev ? { ...prev, button_open_new_tab: e.target.checked ? 'true' : null } : null)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Abrir em nova aba</span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingSlide.is_active || false}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Slide ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingSlide(null);
                    setIsCreating(false);
                  }}
                  className="flex-1"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveSlide}
                  className="flex-1"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
