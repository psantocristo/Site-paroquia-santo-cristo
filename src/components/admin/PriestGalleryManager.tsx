import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, User, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { supabase } from '../../integrations/supabase/client';
import toast from 'react-hot-toast';

interface PriestGallery {
  id: string;
  name: string;
  was_parish_priest: boolean | null;
  date_at_parish: string | null;
  photo_url: string | null;
  description: string;
  video_url: string | null;
  video_thumbnail_url: string | null;
  cloudinary_public_id: string | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const PriestGalleryManager: React.FC = () => {
  const [priests, setPriests] = useState<PriestGallery[]>([]);
  const [editingPriest, setEditingPriest] = useState<PriestGallery | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      const { data, error } = await supabase
        .from('priests_gallery' as any)
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setPriests(data as any);
    } catch (error) {
      console.error('Error fetching priests gallery:', error);
    }
  };

  const handleCreatePriest = () => {
    const newPriest: PriestGallery = {
      id: '',
      name: '',
      was_parish_priest: false,
      date_at_parish: null,
      photo_url: null,
      description: '',
      video_url: null,
      video_thumbnail_url: null,
      cloudinary_public_id: null,
      is_active: true,
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingPriest(newPriest);
    setIsCreating(true);
  };

  const handleSavePriest = async () => {
    if (!editingPriest || !editingPriest.name) {
      toast.error('Preencha o nome do padre');
      return;
    }

    try {
      const priestData = {
        name: editingPriest.name,
        was_parish_priest: editingPriest.was_parish_priest,
        date_at_parish: editingPriest.date_at_parish,
        photo_url: editingPriest.photo_url,
        description: editingPriest.description,
        video_url: editingPriest.video_url,
        video_thumbnail_url: editingPriest.video_thumbnail_url,
        cloudinary_public_id: editingPriest.cloudinary_public_id,
        is_active: editingPriest.is_active,
        order_index: editingPriest.order_index,
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('priests_gallery' as any)
          .insert([priestData])
          .select()
          .single();

        if (error) throw error;
        setPriests((prev: any) => [...prev, data]);
      } else {
        const { error } = await supabase
          .from('priests_gallery' as any)
          .update(priestData)
          .eq('id', editingPriest.id);

        if (error) throw error;
        setPriests((prev: any) => prev.map((p: any) =>
          p.id === editingPriest.id ? { ...editingPriest, ...priestData } : p
        ));
      }

      setEditingPriest(null);
      setIsCreating(false);
      toast.success('Informações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving priest:', error);
      toast.error('Erro ao salvar informações');
    }
  };

  const handleDeletePriest = async (priest: PriestGallery) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const { error } = await supabase
        .from('priests_gallery' as any)
        .delete()
        .eq('id', priest.id);

      if (error) throw error;
      setPriests((prev: any) => prev.filter((p: any) => p.id !== priest.id));
      toast.success('Registro excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting priest:', error);
      toast.error('Erro ao excluir registro');
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    if (!editingPriest) return;
    setEditingPriest(prev => prev ? { 
      ...prev, 
      photo_url: result.secureUrl,
      cloudinary_public_id: result.publicId 
    } : null);
    toast.success('Foto carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    if (!editingPriest) return;
    setEditingPriest(prev => prev ? { ...prev, photo_url: result.url } : null);
    toast.success('Foto carregada com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Galeria dos Padres</h3>
        <Button onClick={handleCreatePriest}>
          <Plus className="h-4 w-4" />
          Adicionar à Galeria
        </Button>
      </div>

      {priests.length === 0 && (
        <Card className="p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum registro encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Adicione padres que passaram pela paróquia à galeria
          </p>
          <Button onClick={handleCreatePriest}>
            <Plus className="h-4 w-4" />
            Adicionar Primeiro Registro
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {priests.map((priest) => (
            <motion.div
              key={priest.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!priest.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {priest.photo_url && (
                    <img
                      src={priest.photo_url}
                      alt={priest.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{priest.name}</h4>
                    {priest.was_parish_priest && priest.date_at_parish && (
                      <p className="text-red-800 font-medium text-sm mb-2">
                        Foi Pároco - {priest.date_at_parish}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{priest.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {priest.video_url && <span>📹 Com vídeo</span>}
                      <span>{priest.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPriest(priest);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePriest(priest)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingPriest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h4 className="text-lg font-semibold flex-1 pr-4">
                  {isCreating ? 'Adicionar à Galeria' : 'Editar Informações'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPriest(null);
                    setIsCreating(false);
                  }}
                  className="w-8 h-8 p-0 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={editingPriest.name}
                    onChange={(e) => setEditingPriest(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Nome completo do padre"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPriest.was_parish_priest ?? false}
                      onChange={(e) => setEditingPriest(prev => prev ? { 
                        ...prev, 
                        was_parish_priest: e.target.checked,
                        date_at_parish: e.target.checked ? prev.date_at_parish : null
                      } : null)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Foi Pároco
                    </span>
                  </label>
                </div>

                {editingPriest.was_parish_priest && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data que passou pela paróquia
                    </label>
                    <input
                      type="text"
                      value={editingPriest.date_at_parish || ''}
                      onChange={(e) => setEditingPriest(prev => prev ? { ...prev, date_at_parish: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: 2010-2015"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto
                  </label>
                  {editingPriest.photo_url && (
                    <div className="mb-3">
                      <img
                        src={editingPriest.photo_url}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <FileUpload
                      accept="image/*"
                      folder="priests-gallery"
                      onCloudinaryUpload={handleCloudinaryUpload}
                      onSupabaseUpload={handleSupabaseUpload}
                        disabled={false}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                      disabled={false}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {false ? 'Carregando...' : 'Carregar Foto'}
                      </Button>
                    </FileUpload>
                    {editingPriest.photo_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPriest(prev => prev ? { ...prev, photo_url: null } : null)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingPriest.description}
                    onChange={(e) => setEditingPriest(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição sobre o padre"
                  />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800">Vídeo (Opcional)</h5>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vídeo (até 20MB)
                    </label>
                    {editingPriest.video_url && (
                      <div className="mb-3 relative aspect-video max-w-md bg-gray-100 rounded-lg overflow-hidden">
                        <video
                          src={editingPriest.video_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <FileUpload
                        accept="video/*"
                        folder="priests-gallery"
                        useCloudinary={true}
                        onCloudinaryUpload={(result) => {
                          const isVideo = result.secureUrl.includes('/video/');
                          const thumbnailUrl = isVideo 
                            ? result.secureUrl.replace(/\.(mp4|mov|avi|webm)$/, '.jpg')
                            : result.secureUrl;
                          
                          setEditingPriest(prev => prev ? { 
                            ...prev, 
                            video_url: result.secureUrl,
                            video_thumbnail_url: thumbnailUrl,
                            cloudinary_public_id: result.publicId
                          } : null);
                          toast.success('Vídeo carregado!');
                        }}
                        onSupabaseUpload={(result) => {
                          setEditingPriest(prev => prev ? { ...prev, video_url: result.url } : null);
                          toast.success('Vídeo carregado!');
                        }}
                        disabled={false}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={false}
                          className="w-full"
                        >
                          <Video className="h-4 w-4" />
                          {false ? 'Carregando...' : 'Carregar Vídeo'}
                        </Button>
                      </FileUpload>
                      {editingPriest.video_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPriest(prev => prev ? { 
                            ...prev, 
                            video_url: null, 
                            video_thumbnail_url: null 
                          } : null)}
                          className="text-red-600"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPriest.is_active ?? true}
                      onChange={(e) => setEditingPriest(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Ativo (visível no site)
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSavePriest} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPriest(null);
                      setIsCreating(false);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
