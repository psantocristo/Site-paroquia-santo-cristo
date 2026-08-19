import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Save, X, Image as ImageIcon, Cloud, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase, Photo, PhotoAlbum } from '../../lib/supabase';
import { uploadToCloudinary, getCloudinaryConfig, deleteFromCloudinary } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

export const PhotoManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const categories = [
    { id: 'history', label: 'História' },
    { id: 'events', label: 'Eventos' },
    { id: 'celebrations', label: 'Celebrações' },
    { id: 'community', label: 'Comunidade' }
  ];

  useEffect(() => {
    fetchPhotos();
    fetchAlbums();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setPhotos(data as Photo[]);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_albums')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setAlbums(data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };


  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

    try {
      // Deletar do Cloudinary primeiro (se tiver public_id)
      if (photo.cloudinary_public_id) {
        const deleted = await deleteFromCloudinary(photo.cloudinary_public_id);
        if (!deleted) {
          console.warn('Aviso: Não foi possível deletar do Cloudinary, mas continuando com deleção do banco');
        }
      }

      // Depois deletar do banco
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      toast.success('Foto excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir foto');
    }
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    try {
      const { error } = await supabase
        .from('photos')
        .update({
          title: editingPhoto.title,
          description: editingPhoto.description,
          category: editingPhoto.category,
          album_id: editingPhoto.album_id
        })
        .eq('id', editingPhoto.id);

      if (error) throw error;

      setPhotos(prev => prev.map(p => 
        p.id === editingPhoto.id ? editingPhoto : p
      ));
      setEditingPhoto(null);
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Erro ao atualizar foto');
    }
  };

  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Verificar se Cloudinary está configurado
    const config = await getCloudinaryConfig();
    if (!config.enabled || !config.cloudName) {
      toast.error('Configure o Cloudinary primeiro para fazer upload de fotos!');
      return;
    }

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: Não é uma imagem válida`);
        return false;
      }
      if (file.size > 1024 * 1024) {
        toast.error(`${file.name}: Arquivo muito grande (máximo 1MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      toast.error('Nenhum arquivo válido selecionado');
      return;
    }

    const limitedFiles = validFiles.slice(0, 10);
    if (validFiles.length > 10) {
      toast.error(`Máximo 10 arquivos por vez. ${validFiles.length - 10} arquivos foram ignorados.`);
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < limitedFiles.length; i++) {
        const file = limitedFiles[i];
        
        try {
          // Upload para Cloudinary
          const cloudinaryResult = await uploadToCloudinary(file, 'photos');

          // Salvar no banco
          const { data, error } = await supabase
            .from('photos')
            .insert([{
              title: file.name.replace(/\.[^/.]+$/, ''),
              description: '',
              image_url: cloudinaryResult.secureUrl,
              cloudinary_public_id: cloudinaryResult.publicId,
              category: 'community',
              album_id: null
            }])
            .select()
            .single();

          if (error) throw error;
          setPhotos(prev => [data as Photo, ...prev]);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Erro ao enviar ${file.name}`);
        }
      }

      toast.success(`${limitedFiles.length} fotos adicionadas via Cloudinary!`);
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast.error('Erro no upload em lote');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Fotos Individuais</h3>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleBulkUpload(e.target.files)}
            className="hidden"
            id="bulk-photo-upload"
            disabled={isUploading}
          />
          <Button 
            variant="primary" 
            disabled={isUploading}
            onClick={() => document.getElementById('bulk-photo-upload')?.click()}
          >
            <Cloud className="h-4 w-4" />
            {isUploading ? 'Enviando...' : 'Adicionar Fotos (Cloudinary)'}
          </Button>
        </div>
      </div>

      {/* Aviso sobre sistema unificado */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">💡 Sistema Unificado de Álbuns</p>
            <p>Recomendamos usar o <strong>Gerenciador de Álbuns</strong> para organizar melhor as fotos. Aqui você pode gerenciar fotos individuais e organizá-las em álbuns existentes.</p>
          </div>
        </div>
      </Card>

      {photos.length === 0 && (
        <Card className="p-8 text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma foto encontrada
          </h4>
          <p className="text-gray-500 mb-4">
            Comece adicionando algumas fotos da paróquia via Cloudinary
          </p>
          <Button 
            variant="primary"
            onClick={() => document.getElementById('bulk-photo-upload')?.click()}
            disabled={isUploading}
          >
            <Cloud className="h-4 w-4" />
            Adicionar Primeira Foto (Cloudinary)
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                    {photo.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-gray-600">
                      {categories.find(c => c.id === photo.category)?.label}
                    </p>
                    {photo.cloudinary_public_id && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Cloud className="h-3 w-3" />
                        <span>Cloudinary</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPhoto(photo)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePhoto(photo)}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex-1 pr-4">Editar Foto</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPhoto(null)}
                  className="w-8 h-8 p-0 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <img
                    src={editingPhoto.image_url}
                    alt={editingPhoto.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  {editingPhoto.cloudinary_public_id && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      Cloudinary: {editingPhoto.cloudinary_public_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingPhoto.title}
                    onChange={(e) => setEditingPhoto(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Título da foto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingPhoto.description || ''}
                    onChange={(e) => setEditingPhoto(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição da foto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto(prev => prev ? { ...prev, category: e.target.value as Photo['category'] } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Álbum
                  </label>
                  <select
                    value={editingPhoto.album_id || ''}
                    onChange={(e) => setEditingPhoto(prev => prev ? { 
                      ...prev, 
                      album_id: e.target.value || null 
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Sem álbum</option>
                    {albums.map(album => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPhoto(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpdatePhoto}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
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