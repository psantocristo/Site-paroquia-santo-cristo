import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/Button';
import { Plus, Trash2, Eye, EyeOff, Calendar, Copy, Share2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FileUpload } from '../ui/FileUpload';
import { uploadToCloudinary, deleteFromCloudinary } from '../../lib/cloudinary';

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  featured_image: string | null;
  cloudinary_public_id: string | null;
  is_active: boolean | null;
  is_published: boolean | null;
  start_date: string | null;
  end_date: string | null;
}

export const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: 0,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Erro ao carregar campanhas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('campaigns')
          .update({
            title: formData.title,
            description: formData.description,
            goal_amount: formData.goal_amount,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Campanha atualizada!');
      } else {
        const { error } = await supabase
          .from('campaigns')
          .insert([{
            slug: '', // Será gerado automaticamente pelo trigger
            title: formData.title,
            description: formData.description,
            goal_amount: formData.goal_amount,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
          }]);

        if (error) throw error;
        toast.success('Campanha criada!');
      }

      setFormData({ title: '', description: '', goal_amount: 0, start_date: '', end_date: '' });
      setEditingId(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Erro ao salvar campanha');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (campaignId: string, file: File) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (campaign?.cloudinary_public_id) {
        await deleteFromCloudinary(campaign.cloudinary_public_id);
      }

      const result = await uploadToCloudinary(file, 'campaigns');

      const { error } = await supabase
        .from('campaigns')
        .update({
          featured_image: result.secureUrl,
          cloudinary_public_id: result.publicId
        })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Imagem atualizada!');
      fetchCampaigns();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem');
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Campanha despublicada' : 'Campanha publicada!');
      fetchCampaigns();
    } catch (error) {
      console.error('Error toggling published:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) return;

    try {
      const campaign = campaigns.find(c => c.id === id);
      
      if (campaign?.cloudinary_public_id) {
        await deleteFromCloudinary(campaign.cloudinary_public_id);
      }

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Campanha excluída!');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erro ao excluir campanha');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      goal_amount: campaign.goal_amount,
      start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : ''
    });
  };

  const copyLink = (slug: string, id: string) => {
    const link = `https://paroquiasantocristo.com.br/campanha/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareLink = (slug: string, title: string) => {
    const link = `https://paroquiasantocristo.com.br/campanha/${slug}`;
    const text = `Confira a campanha: ${title}`;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: link
      }).catch(() => {
        // Fallback para copiar
        copyLink(slug, '');
      });
    } else {
      // Fallback para WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-background border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {editingId ? 'Editar Campanha' : 'Nova Campanha'}
        </h3>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Título</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Meta (R$)</label>
          <input
            type="number"
            step="0.01"
            value={formData.goal_amount}
            onChange={(e) => setFormData({ ...formData, goal_amount: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Data de Início</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Data de Término</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            <Plus className="w-4 h-4" />
            {editingId ? 'Atualizar' : 'Criar'}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setFormData({ title: '', description: '', goal_amount: 0, start_date: '', end_date: '' });
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-background border border-border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground">{campaign.title}</h4>
                <p className="text-sm text-muted-foreground">Slug: /{campaign.slug}</p>
                <p className="text-sm text-muted-foreground mt-2">{campaign.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-foreground">Meta: R$ {campaign.goal_amount.toFixed(2)}</span>
                  <span className="text-primary">Arrecadado: R$ {campaign.current_amount.toFixed(2)}</span>
                </div>
                {(campaign.start_date || campaign.end_date) && (
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    {campaign.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Início: {new Date(campaign.start_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {campaign.end_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Fim: {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                 )}
               </div>
               <div className="flex flex-wrap gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => copyLink(campaign.slug, campaign.id)}
                   title="Copiar Link"
                 >
                   {copiedId === campaign.id ? (
                     <Check className="w-4 h-4 text-green-600" />
                   ) : (
                     <Copy className="w-4 h-4" />
                   )}
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => shareLink(campaign.slug, campaign.title)}
                   title="Compartilhar"
                 >
                   <Share2 className="w-4 h-4" />
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => togglePublished(campaign.id, campaign.is_published)}
                   title={campaign.is_published ? 'Despublicar' : 'Publicar'}
                 >
                   {campaign.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handleEdit(campaign)}
                 >
                   Editar
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handleDelete(campaign.id)}
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
            </div>

            {campaign.featured_image && (
              <img
                src={campaign.featured_image}
                alt={campaign.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Imagem Destaque
              </label>
              <FileUpload
                onFileSelect={(files) => {
                  if (files && files.length > 0) {
                    handleImageUpload(campaign.id, files[0]);
                  }
                }}
                accept="image/*"
              >
                Escolher Imagem
              </FileUpload>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
