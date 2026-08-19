import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { RichTextEditor } from '../ui/RichTextEditor';
import { Card } from '../ui/Card';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, X, Upload, FileText, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export const DocumentationManager: React.FC = () => {
  const [documentations, setDocumentations] = useState<Documentation[]>([]);
  const [editingDoc, setEditingDoc] = useState<Documentation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchDocumentations();
  }, []);

  const fetchDocumentations = async () => {
    try {
      const { data, error } = await supabase
        .from('documentation_procedures' as any)
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setDocumentations(data as any || []);
    } catch (error) {
      console.error('Error fetching documentations:', error);
      toast.error('Erro ao carregar documentações');
    }
  };

  const handleCreateDoc = () => {
    setEditingDoc({
      id: '',
      title: '',
      description: '',
      content: '',
      file_url: null,
      file_name: null,
      file_type: null,
      order_index: documentations.length,
      is_active: true,
      created_at: '',
      updated_at: ''
    });
    setIsCreating(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingDoc) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF, Word ou Excel.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setUploadingFile(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documentation/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setEditingDoc({
        ...editingDoc,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type
      });

      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    if (!editingDoc) return;
    setEditingDoc({
      ...editingDoc,
      file_url: null,
      file_name: null,
      file_type: null
    });
  };

  const handleSaveDoc = async () => {
    if (!editingDoc) return;

    if (!editingDoc.title.trim() || !editingDoc.description.trim()) {
      toast.error('Preencha o título e a descrição');
      return;
    }

    try {
      if (isCreating) {
        const { error } = await supabase
          .from('documentation_procedures' as any)
          .insert([{
            title: editingDoc.title,
            description: editingDoc.description,
            content: editingDoc.content,
            file_url: editingDoc.file_url,
            file_name: editingDoc.file_name,
            file_type: editingDoc.file_type,
            order_index: editingDoc.order_index,
            is_active: editingDoc.is_active
          }]);

        if (error) throw error;
        toast.success('Documentação criada com sucesso!');
      } else {
        const { error } = await supabase
          .from('documentation_procedures' as any)
          .update({
            title: editingDoc.title,
            description: editingDoc.description,
            content: editingDoc.content,
            file_url: editingDoc.file_url,
            file_name: editingDoc.file_name,
            file_type: editingDoc.file_type,
            is_active: editingDoc.is_active
          })
          .eq('id', editingDoc.id);

        if (error) throw error;
        toast.success('Documentação atualizada com sucesso!');
      }

      setEditingDoc(null);
      setIsCreating(false);
      fetchDocumentations();
    } catch (error) {
      console.error('Error saving documentation:', error);
      toast.error('Erro ao salvar documentação');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta documentação?')) return;

    try {
      const { error } = await supabase
        .from('documentation_procedures' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Documentação excluída com sucesso!');
      fetchDocumentations();
    } catch (error) {
      console.error('Error deleting documentation:', error);
      toast.error('Erro ao excluir documentação');
    }
  };

  const handleMoveDoc = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= documentations.length) return;

    try {
      const doc1 = documentations[index];
      const doc2 = documentations[newIndex];

      await supabase
        .from('documentation_procedures' as any)
        .update({ order_index: doc2.order_index })
        .eq('id', doc1.id);

      await supabase
        .from('documentation_procedures' as any)
        .update({ order_index: doc1.order_index })
        .eq('id', doc2.id);

      toast.success('Ordem atualizada!');
      fetchDocumentations();
    } catch (error) {
      console.error('Error moving documentation:', error);
      toast.error('Erro ao reordenar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Documentações e Procedimentos</h2>
        <Button onClick={handleCreateDoc} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Documentação
        </Button>
      </div>

      {documentations.length === 0 && !editingDoc && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma documentação cadastrada ainda.</p>
        </Card>
      )}

      <div className="space-y-4">
        {documentations.map((doc, index) => (
          <Card key={doc.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">{doc.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    doc.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  {doc.file_name && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      📎 {doc.file_name}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveDoc(index, 'up')}
                  disabled={index === 0}
                  title="Mover para cima"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveDoc(index, 'down')}
                  disabled={index === documentations.length - 1}
                  title="Mover para baixo"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingDoc(doc);
                    setIsCreating(false);
                  }}
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDoc(doc.id)}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {editingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setEditingDoc(null);
              setIsCreating(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-red-900 to-red-800 border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <h3 className="text-xl font-bold text-white">
                  {isCreating ? 'Nova Documentação' : 'Editar Documentação'}
                </h3>
                <button
                  onClick={() => {
                    setEditingDoc(null);
                    setIsCreating(false);
                  }}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 bg-white">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={editingDoc.title}
                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white text-gray-900"
                    placeholder="Ex: Batismo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={editingDoc.description}
                    onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white text-gray-900"
                    rows={3}
                    placeholder="Breve descrição do procedimento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo do Procedimento
                  </label>
                  <RichTextEditor
                    value={editingDoc.content}
                    onChange={(value) => setEditingDoc({ ...editingDoc, content: value })}
                    placeholder="Descreva o procedimento detalhadamente..."
                    height="400px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivo Anexo (PDF, Word, Excel)
                  </label>
                  
                  {editingDoc.file_url ? (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                      <FileText className="w-8 h-8 text-red-800" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{editingDoc.file_name}</p>
                        <a 
                          href={editingDoc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-red-800 hover:underline"
                        >
                          Visualizar arquivo
                        </a>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remover arquivo"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-800 cursor-pointer transition-colors bg-white"
                      >
                        <Upload className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {uploadingFile ? 'Enviando...' : 'Clique para selecionar arquivo'}
                        </span>
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        Formatos aceitos: PDF, Word, Excel (máx. 10MB)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingDoc.is_active ?? true}
                    onChange={(e) => setEditingDoc({ ...editingDoc, is_active: e.target.checked })}
                    className="w-4 h-4 text-red-800 border-gray-300 rounded focus:ring-red-800"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Ativo
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSaveDoc} className="flex-1">
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingDoc(null);
                      setIsCreating(false);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
