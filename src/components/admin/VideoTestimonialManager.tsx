import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { VideoTestimonial } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { Trash2, Edit2, Save, X, Video, Youtube, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export const VideoTestimonialManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    video_type: 'upload' as 'upload' | 'youtube',
    video_url: '',
    youtube_id: '',
    thumbnail_url: '',
    order_index: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_testimonials')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      // @ts-expect-error - Supabase returns string for enum, interface expects literal type
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    const isVideo = result.secureUrl.includes('/video/');
    const thumbnailUrl = isVideo 
      ? result.secureUrl.replace(/\.(mp4|mov|avi|webm)$/, '.jpg')
      : result.secureUrl;
    
    setFormData(prev => ({
      ...prev,
      video_url: result.secureUrl,
      thumbnail_url: thumbnailUrl
    }));
    setShowThumbnailPreview(true);
    setUploadProgress(0);
    toast.success('Vídeo enviado com sucesso!');
  };

  const extractYouTubeId = (url: string) => {
    // Suporta URLs regulares do YouTube e Shorts
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYouTubeUrlChange = (url: string) => {
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
      setFormData(prev => ({
        ...prev,
        youtube_id: youtubeId,
        thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.video_type === 'upload' && !formData.video_url) {
      toast.error('Faça upload do vídeo');
      return;
    }

    if (formData.video_type === 'youtube' && !formData.youtube_id) {
      toast.error('Insira um link válido do YouTube');
      return;
    }

    setIsUploading(true);

    try {
      const videoData = {
        name: formData.name,
        description: formData.description,
        video_type: formData.video_type,
        video_url: formData.video_type === 'upload' ? formData.video_url : null,
        youtube_id: formData.video_type === 'youtube' ? formData.youtube_id : null,
        thumbnail_url: formData.thumbnail_url,
        order_index: formData.order_index,
        is_active: true
      };

      if (editingId) {
        const { error } = await supabase
          .from('video_testimonials')
          .update(videoData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Vídeo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('video_testimonials')
          .insert([videoData]);

        if (error) throw error;
        toast.success('Vídeo adicionado com sucesso!');
      }

      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Erro ao salvar vídeo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (video: VideoTestimonial) => {
    setEditingId(video.id);
    setFormData({
      name: video.name,
      description: video.description,
      video_type: video.video_type,
      video_url: video.video_url || '',
      youtube_id: video.youtube_id || '',
      thumbnail_url: video.thumbnail_url || '',
      order_index: video.order_index || 0
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      const { error } = await supabase
        .from('video_testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Vídeo excluído com sucesso!');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Erro ao excluir vídeo');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('video_testimonials')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(isActive ? 'Vídeo desativado' : 'Vídeo ativado');
      fetchVideos();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      video_type: 'upload',
      video_url: '',
      youtube_id: '',
      thumbnail_url: '',
      order_index: 0
    });
    setUploadProgress(0);
    setShowThumbnailPreview(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Vídeos Testemunhais</h2>
      </div>

      {/* Formulário */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome / Título *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Testemunho de Maria Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Descreva o testemunho..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Vídeo *
            </label>
            <div className="flex gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="upload"
                  checked={formData.video_type === 'upload'}
                  onChange={(e) => setFormData({ ...formData, video_type: e.target.value as 'upload' })}
                  className="text-red-600"
                />
                <Upload size={20} />
                <span>Upload MP4 (máx 50MB)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="youtube"
                  checked={formData.video_type === 'youtube'}
                  onChange={(e) => setFormData({ ...formData, video_type: e.target.value as 'youtube' })}
                  className="text-red-600"
                />
                <Youtube size={20} />
                <span>YouTube</span>
              </label>
            </div>
          </div>

          {formData.video_type === 'upload' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload de Vídeo (MP4 - máx 50MB)
              </label>
              <FileUpload
                accept="video/mp4"
                onCloudinaryUpload={handleCloudinaryUpload}
                onProgress={setUploadProgress}
                folder="videos"
                useCloudinary={true}
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 cursor-pointer transition-colors">
                  <Video className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.video_url ? 'Vídeo carregado! Clique para trocar' : 'Clique para fazer upload do vídeo'}
                  </p>
                </div>
              </FileUpload>
              
              {/* Barra de progresso */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Enviando vídeo...</span>
                    <span className="text-sm font-medium text-red-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-300 ease-out animate-pulse"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Preview da Thumbnail */}
              {showThumbnailPreview && formData.thumbnail_url && (
                <div className="mt-4 animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview da Thumbnail
                  </label>
                  <div className="relative inline-block">
                    <img 
                      src={formData.thumbnail_url} 
                      alt="Thumbnail do vídeo"
                      className="w-48 h-auto rounded-lg border-2 border-green-500 shadow-lg"
                      onError={(e) => {
                        // Fallback se a thumbnail não carregar
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EThumbnail%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Pronto
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link do YouTube
              </label>
              <input
                type="text"
                value={formData.youtube_id}
                onChange={(e) => {
                  const value = e.target.value;
                  // Se for uma URL do YouTube, extrair o ID
                  if (value.includes('youtube.com') || value.includes('youtu.be')) {
                    handleYouTubeUrlChange(value);
                  } else {
                    // Caso contrário, atualizar diretamente o campo
                    setFormData({ ...formData, youtube_id: value });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Cole o link do YouTube ou o ID do vídeo"
              />
              {formData.youtube_id && (
                <p className="text-sm text-green-600 mt-2">✓ ID do YouTube: {formData.youtube_id}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              min="0"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isUploading}>
              <Save size={20} />
              {editingId ? 'Atualizar' : 'Adicionar'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X size={20} />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Lista de Vídeos */}
      <div className="grid gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {video.video_type === 'youtube' ? (
                    <Youtube className="text-red-600" size={20} />
                  ) : (
                    <Video className="text-blue-600" size={20} />
                  )}
                  <h3 className="font-semibold text-lg">{video.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${video.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {video.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                <p className="text-xs text-gray-500">Ordem: {video.order_index}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleActive(video.id, video.is_active || false)}>
                  {video.is_active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(video)}>
                  <Edit2 size={16} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(video.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {videos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Video className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhum vídeo cadastrado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
};
