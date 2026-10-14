import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, TestTube, CheckCircle, XCircle, Cloud, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { validateCloudinaryConfig, invalidateConfigCache } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

interface CloudinaryUsage {
  storage: { used: number; limit: number; used_percent: number };
  bandwidth: { used: number; limit: number; used_percent: number };
  transformations: { used: number; limit: number };
  credits: { used: number; limit: number; used_percent: number };
  plan: string;
  last_updated: string;
}

interface CloudinarySettingsState {
  cloudinary_cloud_name: string;
  cloudinary_api_key: string;
  cloudinary_upload_preset: string;
  cloudinary_enabled: boolean;
  supabase_storage_enabled: boolean;
}

export const CloudinarySettings: React.FC = () => {
  const [settings, setSettings] = useState<CloudinarySettingsState>({
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_upload_preset: 'parish_uploads',
    cloudinary_enabled: false,
    supabase_storage_enabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [usageData, setUsageData] = useState<CloudinaryUsage | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.cloudinary_enabled && settings.cloudinary_cloud_name) {
      fetchUsage();
    }
  }, [settings.cloudinary_enabled, settings.cloudinary_cloud_name]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchUsage = async () => {
    setIsLoadingUsage(true);
    try {
      const { data, error } = await supabase.functions.invoke('cloudinary-usage');
      if (error) throw error;
      if (data?.success) {
        setUsageData(data.usage);
      } else if (data?.error) {
        console.error('Cloudinary usage error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'cloudinary_cloud_name',
          'cloudinary_api_key',
          'cloudinary_upload_preset',
        'cloudinary_enabled',
        'supabase_storage_enabled'
        ]);

      if (error) throw error;

      const settingsMap = data?.reduce<Partial<CloudinarySettingsState>>((acc, setting) => {
        if (setting.key === 'cloudinary_enabled') {
          acc.cloudinary_enabled = setting.value === 'true';
        } else if (setting.key === 'supabase_storage_enabled') {
          acc.supabase_storage_enabled = setting.value === 'true';
        } else if (setting.key === 'cloudinary_cloud_name') {
          acc.cloudinary_cloud_name = setting.value;
        } else if (setting.key === 'cloudinary_api_key') {
          acc.cloudinary_api_key = setting.value;
        } else if (setting.key === 'cloudinary_upload_preset') {
          acc.cloudinary_upload_preset = setting.value;
        }
        return acc;
      }, {}) || {};

      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      // Invalidar cache
      invalidateConfigCache();
      
      toast.success('Configurações salvas com sucesso!');
      setTestResult(null); // Reset test result after save
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      // Salvar temporariamente para testar
      await handleSave();
      
      // Testar configuração
      const result = await validateCloudinaryConfig();
      setTestResult(result);
      
      if (result.isValid) {
        toast.success('Configuração válida! Cloudinary conectado com sucesso.');
      } else {
        toast.error('Configuração inválida. Verifique os erros abaixo.');
      }
    } catch (error) {
      console.error('Error testing configuration:', error);
      toast.error('Erro ao testar configuração');
      setTestResult({ isValid: false, errors: ['Erro interno ao testar configuração'] });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Cloud className="h-7 w-7 text-blue-600" />
          Configurações do Cloudinary
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || isSaving}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isTesting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Status da Configuração */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            testResult.isValid 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {testResult.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-semibold">
              {testResult.isValid ? 'Configuração Válida' : 'Configuração Inválida'}
            </span>
          </div>
          {testResult.errors.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {testResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configurações Básicas */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Configurações Básicas</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={settings.cloudinary_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, cloudinary_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="font-medium text-gray-700">Habilitar Cloudinary</span>
              </label>
              <p className="text-sm text-gray-500">
                Quando habilitado, todas as novas imagens serão enviadas para o Cloudinary
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={!settings.supabase_storage_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, supabase_storage_enabled: !e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={!settings.cloudinary_enabled}
                />
                <span className="font-medium text-gray-700">🚫 Desativar Supabase Storage (Cloudinary Exclusivo)</span>
              </label>
              <div className={`border rounded-lg p-4 ${
                !settings.supabase_storage_enabled && settings.cloudinary_enabled
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${
                    !settings.supabase_storage_enabled && settings.cloudinary_enabled
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {!settings.supabase_storage_enabled && settings.cloudinary_enabled ? '🚀' : '⚠️'}
                  </div>
                  <div>
                    <p className={`text-sm font-medium mb-2 ${
                      !settings.supabase_storage_enabled && settings.cloudinary_enabled
                        ? 'text-green-800'
                        : 'text-yellow-800'
                    }`}>
                      {!settings.supabase_storage_enabled && settings.cloudinary_enabled
                        ? '✅ MODO CLOUDINARY EXCLUSIVO ATIVO!'
                        : 'ATENÇÃO: Modo Cloudinary Exclusivo'
                      }
                    </p>
                    <ul className={`text-sm space-y-1 ${
                      !settings.supabase_storage_enabled && settings.cloudinary_enabled
                        ? 'text-green-700'
                        : 'text-yellow-700'
                    }`}>
                      {!settings.supabase_storage_enabled && settings.cloudinary_enabled ? (
                        <>
                          <li>• <strong>✅ Storage Egress = ZERO</strong> - Supabase Storage completamente desabilitado</li>
                          <li>• <strong>✅ Performance Máxima</strong> - Todas as imagens via CDN Cloudinary</li>
                          <li>• <strong>✅ Economia Total</strong> - Sem custos de Storage Egress</li>
                          <li>• <strong>✅ Bandwidth Otimizado</strong> - Compressão extrema (70-80% menos dados)</li>
                          <li>• <strong>✅ Otimização Automática</strong> - WebP, qualidade e dimensões otimizadas</li>
                        </>
                      ) : (
                        <>
                          <li>• <strong>Storage Egress = ZERO</strong> - Elimina completamente o uso do Supabase Storage</li>
                          <li>• <strong>Cloudinary obrigatório</strong> - Todas as imagens devem estar no Cloudinary</li>
                          <li>• <strong>Imagens antigas</strong> - Podem não aparecer se não estiverem no Cloudinary</li>
                          <li>• <strong>Uploads</strong> - Apenas para Cloudinary (Supabase será ignorado)</li>
                        </>
                      )}
                    </ul>
                    <p className={`text-sm mt-2 font-medium ${
                      !settings.supabase_storage_enabled && settings.cloudinary_enabled
                        ? 'text-green-800'
                        : 'text-yellow-800'
                    }`}>
                      {!settings.supabase_storage_enabled && settings.cloudinary_enabled
                        ? 'Parabéns! Você eliminou o Storage Egress E otimizou o bandwidth! 🎉'
                        : 'Só ative se o Cloudinary estiver 100% configurado e funcionando!'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloud Name *
              </label>
              <input
                type="text"
                value={settings.cloudinary_cloud_name}
                onChange={(e) => setSettings(prev => ({ ...prev, cloudinary_cloud_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="minha-cloud"
                disabled={!settings.cloudinary_enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Encontre em: Dashboard → Settings → Account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <input
                type="text"
                value={settings.cloudinary_api_key}
                onChange={(e) => setSettings(prev => ({ ...prev, cloudinary_api_key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="123456789012345"
                disabled={!settings.cloudinary_enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Preset
              </label>
              <input
                type="text"
                value={settings.cloudinary_upload_preset}
                onChange={(e) => setSettings(prev => ({ ...prev, cloudinary_upload_preset: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="parish_uploads"
                disabled={!settings.cloudinary_enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Crie em: Settings → Upload → Upload presets
              </p>
            </div>
          </div>
        </Card>

        {/* Instruções */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Como Configurar</h4>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="font-semibold text-green-800 mb-2">🚀 OTIMIZAÇÕES ATIVAS:</h5>
              <ul className="list-disc list-inside space-y-1 text-green-700 text-xs">
                <li>Qualidade reduzida para 25-40% (era 75%)</li>
                <li>Tamanhos máximos: 800x600px (era 1920x1080px)</li>
                <li>Preload reduzido de 3 para 2 imagens</li>
                <li>Cache aumentado para 30 dias</li>
                <li>Compressão WebP/AVIF automática</li>
                <li>Redução estimada: 70-80% do bandwidth</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">1. Criar Conta no Cloudinary</h5>
              <p>Acesse <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cloudinary.com</a> e crie uma conta gratuita.</p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">2. Obter Credenciais</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Vá para Dashboard → Settings → Account</li>
                <li>Copie o <strong>Cloud Name</strong></li>
                <li>Copie a <strong>API Key</strong></li>
                <li>Guarde o <strong>API Secret</strong> somente nos segredos das funções do servidor</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">3. Criar Upload Preset</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Vá para Settings → Upload → Upload presets</li>
                <li>Clique em "Add upload preset"</li>
                <li>Nome: <code>parish_uploads</code></li>
                <li>Signing Mode: <strong>Unsigned</strong></li>
                <li>Folder: <code>parish</code></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">4. Benefícios</h5>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Otimização EXTREMA de imagens (70-80% menos dados)</li>
                <li>CDN global para carregamento rápido</li>
                <li>Redução de 90% no uso do banco + 70% no bandwidth</li>
                <li>Transformações em tempo real</li>
                <li>Backup automático das imagens</li>
                <li>Economia máxima de custos</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Card de Uso do Cloudinary */}
      {settings.cloudinary_enabled && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Uso do Cloudinary
            </h4>
            <Button variant="outline" size="sm" onClick={fetchUsage} disabled={isLoadingUsage}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingUsage ? 'animate-spin' : ''}`} />
              {isLoadingUsage ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
          
          {usageData ? (
            <div className="space-y-4">
              {/* Plano */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Plano:</span>
                <span className="font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">{usageData.plan}</span>
              </div>

              {/* Storage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Armazenamento:</span>
                  <span className="font-medium">
                    {formatBytes(usageData.storage.used)} / {formatBytes(usageData.storage.limit)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      usageData.storage.used_percent > 80 ? 'bg-red-500' :
                      usageData.storage.used_percent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usageData.storage.used_percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{usageData.storage.used_percent.toFixed(1)}% utilizado</span>
                  <span>Restante: {formatBytes(usageData.storage.limit - usageData.storage.used)}</span>
                </div>
              </div>

              {/* Bandwidth */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Bandwidth Mensal:</span>
                  <span className="font-medium">
                    {formatBytes(usageData.bandwidth.used)} / {formatBytes(usageData.bandwidth.limit)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      usageData.bandwidth.used_percent > 80 ? 'bg-red-500' :
                      usageData.bandwidth.used_percent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usageData.bandwidth.used_percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{usageData.bandwidth.used_percent.toFixed(1)}% utilizado este mês</span>
                  <span>Restante: {formatBytes(usageData.bandwidth.limit - usageData.bandwidth.used)}</span>
                </div>
              </div>

              {/* Créditos */}
              {usageData.credits && usageData.credits.limit > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Créditos:</span>
                    <span className="font-medium">
                      {usageData.credits.used.toFixed(2)} / {usageData.credits.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        usageData.credits.used_percent > 80 ? 'bg-red-500' :
                        usageData.credits.used_percent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usageData.credits.used_percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {usageData.credits.used_percent.toFixed(1)}% utilizado
                  </p>
                </div>
              )}

              {/* Transformações */}
              <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                <span className="text-gray-600">Transformações:</span>
                <span className="font-medium">
                  {usageData.transformations.used.toLocaleString()} / {usageData.transformations.limit.toLocaleString()}
                </span>
              </div>

              {/* Última atualização */}
              {usageData.last_updated && (
                <p className="text-xs text-gray-400 text-right pt-2">
                  Última atualização: {new Date(usageData.last_updated).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ) : isLoadingUsage ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Clique em "Atualizar" para ver o uso atual
            </p>
          )}
        </Card>
      )}

      {/* Aviso sobre migração */}
      {settings.cloudinary_enabled && settings.supabase_storage_enabled && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Cloud className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Migração de Imagens</h4>
              <p className="text-blue-700 text-sm">
                As imagens existentes continuarão funcionando normalmente. 
                Novas imagens serão automaticamente enviadas para o Cloudinary, 
                reduzindo significativamente o uso do banco de dados.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Aviso sobre modo exclusivo */}
      {settings.cloudinary_enabled && !settings.supabase_storage_enabled && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="text-green-600 text-2xl">🚀</div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Modo Cloudinary Exclusivo Ativado!</h4>
              <div className="text-green-700 text-sm space-y-2">
                <p><strong>✅ Storage Egress = ZERO</strong> - Supabase Storage completamente desabilitado</p>
                <p><strong>✅ Performance Máxima</strong> - Todas as imagens via CDN Cloudinary</p>
                <p><strong>✅ Economia Total</strong> - Sem custos de Storage Egress</p>
                <p><strong>✅ Bandwidth Otimizado</strong> - Compressão extrema (70-80% menos dados)</p>
                <p className="font-medium text-green-800 mt-3">
                  Parabéns! Você eliminou o Storage Egress E otimizou o bandwidth! 🎉
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
