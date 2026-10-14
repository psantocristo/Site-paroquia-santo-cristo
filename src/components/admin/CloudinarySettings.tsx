import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, CheckCircle2, Cloud, Database, Gauge, HardDrive, Info, KeyRound,
  AlertTriangle, RefreshCw, Save, ShieldCheck, TestTube2, Wand2,
  Wifi, XCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { invalidateConfigCache, validateCloudinaryConfig } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

interface UsageMetric {
  used: number;
  limit: number;
  used_percent: number;
}

interface CloudinaryUsage {
  storage: UsageMetric;
  bandwidth: UsageMetric;
  transformations: UsageMetric;
  credits: UsageMetric;
  resources?: number;
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

interface UsageMeterProps {
  label: string;
  icon: React.ElementType;
  value: string;
  detail: string;
  percent: number;
}

const clampPercent = (value: number) => Math.max(0, Math.min(Number.isFinite(value) ? value : 0, 100));

const UsageMeter: React.FC<UsageMeterProps> = ({ label, icon: Icon, value, detail, percent }) => {
  const safePercent = clampPercent(percent);
  const barColor = safePercent >= 85 ? 'bg-red-500' : safePercent >= 65 ? 'bg-amber-500' : 'bg-emerald-500';
  const badgeColor = safePercent >= 85
    ? 'bg-red-50 text-red-700'
    : safePercent >= 65
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700';

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-[#611a1a]">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-stone-500">{label}</p>
            <p className="mt-1 text-lg font-bold text-stone-900">{value}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeColor}`}>
          {safePercent.toFixed(1)}%
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
        <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${safePercent}%` }} />
      </div>
      <p className="mt-2 text-xs leading-5 text-stone-500">{detail}</p>
    </div>
  );
};

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
  const [usageError, setUsageError] = useState('');
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings.cloudinary_enabled || !settings.cloudinary_cloud_name) return;
    fetchUsage(false);
    const interval = window.setInterval(() => fetchUsage(false), 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [settings.cloudinary_enabled, settings.cloudinary_cloud_name]);

  const formatBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
  };

  const formatMetric = (metric?: UsageMetric, unit: 'bytes' | 'number' = 'number') => {
    if (!metric) return { value: 'Indisponível', detail: 'Limite não informado pelo plano', percent: 0 };
    const format = unit === 'bytes' ? formatBytes : (value: number) => value.toLocaleString('pt-BR');
    const hasLimit = metric.limit > 0;
    return {
      value: format(metric.used),
      detail: hasLimit ? `${format(metric.used)} de ${format(metric.limit)}` : 'O plano não informa um limite separado',
      percent: hasLimit ? metric.used_percent : 0
    };
  };

  const creditStatus = useMemo(() => {
    const percent = clampPercent(usageData?.credits?.used_percent || 0);
    if (percent >= 85) return { label: 'Atenção à cota', className: 'bg-red-50 text-red-700 border-red-200' };
    if (percent >= 65) return { label: 'Uso moderado', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Cota saudável', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }, [usageData]);

  const fetchUsage = async (showFeedback = false) => {
    setIsLoadingUsage(true);
    setUsageError('');
    try {
      const { data, error } = await supabase.functions.invoke('cloudinary-usage');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Não foi possível consultar a cota');
      setUsageData(data.usage as CloudinaryUsage);
      if (showFeedback) toast.success('Cota atualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao consultar o Cloudinary';
      setUsageError(message);
      if (showFeedback) toast.error(message);
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
          'cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_upload_preset',
          'cloudinary_enabled', 'supabase_storage_enabled'
        ]);
      if (error) throw error;

      const settingsMap = data?.reduce<Partial<CloudinarySettingsState>>((acc, setting) => {
        if (setting.key === 'cloudinary_enabled') acc.cloudinary_enabled = setting.value === 'true';
        else if (setting.key === 'supabase_storage_enabled') acc.supabase_storage_enabled = setting.value === 'true';
        else if (setting.key === 'cloudinary_cloud_name') acc.cloudinary_cloud_name = setting.value;
        else if (setting.key === 'cloudinary_api_key') acc.cloudinary_api_key = setting.value;
        else if (setting.key === 'cloudinary_upload_preset') acc.cloudinary_upload_preset = setting.value;
        return acc;
      }, {}) || {};
      setSettings(previous => ({ ...previous, ...settingsMap }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value,
        updated_at: new Date().toISOString()
      }));
      const results = await Promise.all(
        updates.map(update => supabase.from('system_settings').upsert(update, { onConflict: 'key' }))
      );
      const failed = results.find(result => result.error);
      if (failed?.error) throw failed.error;

      invalidateConfigCache();
      toast.success('Configurações salvas');
      setTestResult(null);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const saved = await handleSave();
      if (!saved) return;
      const result = await validateCloudinaryConfig();
      setTestResult(result);
      if (result.isValid) {
        toast.success('Cloudinary conectado');
        await fetchUsage(false);
      } else {
        toast.error('Revise a configuração informada');
      }
    } catch (error) {
      console.error('Error testing configuration:', error);
      setTestResult({ isValid: false, errors: ['Não foi possível concluir o teste'] });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><RefreshCw className="h-7 w-7 animate-spin text-[#611a1a]" /></div>;
  }

  const storageMetric = formatMetric(usageData?.storage, 'bytes');
  const bandwidthMetric = formatMetric(usageData?.bandwidth, 'bytes');
  const transformationsMetric = formatMetric(usageData?.transformations);
  const creditsMetric = formatMetric(usageData?.credits);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-stone-900">Mídia e cota do Cloudinary</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${settings.cloudinary_enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-stone-100 text-stone-600'}`}>
              <span className={`h-2 w-2 rounded-full ${settings.cloudinary_enabled ? 'bg-emerald-500' : 'bg-stone-400'}`} />
              {settings.cloudinary_enabled ? 'Serviço ativo' : 'Serviço desativado'}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-500">Acompanhe o consumo dos últimos 30 dias e defina o provedor usado nos novos uploads.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleTest} disabled={isTesting || isSaving}>
            <TestTube2 className="h-4 w-4" />{isTesting ? 'Testando' : 'Testar conexão'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isTesting}>
            <Save className="h-4 w-4" />{isSaving ? 'Salvando' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      {testResult && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-4 ${testResult.isValid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start gap-3">
            {testResult.isValid ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 text-red-600" />}
            <div>
              <p className={`font-bold ${testResult.isValid ? 'text-emerald-800' : 'text-red-800'}`}>{testResult.isValid ? 'Conexão validada' : 'A configuração precisa de atenção'}</p>
              {testResult.errors.length > 0 && <ul className="mt-2 space-y-1 text-sm text-red-700">{testResult.errors.map(error => <li key={error}>• {error}</li>)}</ul>}
            </div>
          </div>
        </motion.div>
      )}

      {settings.cloudinary_enabled && (
        <section className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-[#611a1a]" />
                <h4 className="font-bold text-stone-900">Resumo da cota</h4>
                {usageData && <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${creditStatus.className}`}>{creditStatus.label}</span>}
              </div>
              <p className="mt-1 text-xs text-stone-500">{usageData ? `Plano ${usageData.plan || 'Cloudinary'} • janela móvel de 30 dias` : 'Dados fornecidos pela API administrativa do Cloudinary'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchUsage(true)} disabled={isLoadingUsage}>
              <RefreshCw className={`h-4 w-4 ${isLoadingUsage ? 'animate-spin' : ''}`} />Atualizar cota
            </Button>
          </div>

          {usageError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Não foi possível consultar a cota</p><p className="mt-1 text-amber-700">{usageError}</p></div></div>
            </div>
          ) : isLoadingUsage && !usageData ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-stone-500"><RefreshCw className="h-5 w-5 animate-spin" />Consultando consumo atual…</div>
          ) : usageData ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <UsageMeter label="Créditos" icon={Activity} {...creditsMetric} />
                <UsageMeter label="Armazenamento" icon={HardDrive} {...storageMetric} />
                <UsageMeter label="Largura de banda" icon={Wifi} {...bandwidthMetric} />
                <UsageMeter label="Transformações" icon={Wand2} {...transformationsMetric} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <span>{usageData.resources !== undefined ? `${usageData.resources.toLocaleString('pt-BR')} recursos armazenados` : ''}</span>
                <span>Atualizado em {new Date(usageData.last_updated).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </>
          ) : <p className="py-8 text-center text-sm text-stone-500">Use “Atualizar cota” para consultar o consumo.</p>}
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Card hover={false} className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5ecd0] text-[#6a501c]"><Cloud className="h-5 w-5" /></span>
            <div><h4 className="font-bold text-stone-900">Configuração do provedor</h4><p className="text-xs text-stone-500">Credenciais públicas e destino dos uploads.</p></div>
          </div>
          <div className="space-y-5">
            <label className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div><span className="block text-sm font-bold text-stone-800">Habilitar Cloudinary</span><span className="mt-1 block text-xs font-normal leading-5 text-stone-500">Novas imagens passam a usar a CDN e as otimizações configuradas.</span></div>
              <input type="checkbox" checked={settings.cloudinary_enabled} onChange={event => setSettings(previous => ({ ...previous, cloudinary_enabled: event.target.checked }))} className="mt-1 h-5 w-5 shrink-0" />
            </label>
            <label className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${settings.cloudinary_enabled ? 'border-stone-200 bg-white' : 'border-stone-200 bg-stone-50 opacity-60'}`}>
              <div><span className="block text-sm font-bold text-stone-800">Usar Cloudinary exclusivamente</span><span className="mt-1 block text-xs font-normal leading-5 text-stone-500">Desativa o Supabase Storage para os novos envios de mídia.</span></div>
              <input type="checkbox" checked={!settings.supabase_storage_enabled} onChange={event => setSettings(previous => ({ ...previous, supabase_storage_enabled: !event.target.checked }))} disabled={!settings.cloudinary_enabled} className="mt-1 h-5 w-5 shrink-0" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label htmlFor="cloudinary-cloud-name" className="mb-2 block text-sm">Cloud name</label><input id="cloudinary-cloud-name" value={settings.cloudinary_cloud_name} onChange={event => setSettings(previous => ({ ...previous, cloudinary_cloud_name: event.target.value.trim() }))} placeholder="nome-da-cloud" disabled={!settings.cloudinary_enabled} /></div>
              <div><label htmlFor="cloudinary-api-key" className="mb-2 block text-sm">API key</label><div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input id="cloudinary-api-key" value={settings.cloudinary_api_key} onChange={event => setSettings(previous => ({ ...previous, cloudinary_api_key: event.target.value.trim() }))} placeholder="000000000000000" disabled={!settings.cloudinary_enabled} className="pl-9" autoComplete="off" /></div></div>
            </div>
            <div><label htmlFor="cloudinary-upload-preset" className="mb-2 block text-sm">Upload preset</label><input id="cloudinary-upload-preset" value={settings.cloudinary_upload_preset} onChange={event => setSettings(previous => ({ ...previous, cloudinary_upload_preset: event.target.value.trim() }))} placeholder="parish_uploads" disabled={!settings.cloudinary_enabled} /><p className="mt-2 text-xs leading-5 text-stone-500">Use um preset unsigned dedicado ao portal. O API Secret permanece somente no servidor.</p></div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card hover={false} className="p-5 sm:p-6">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></span><div><h4 className="font-bold text-stone-900">Configuração recomendada</h4><p className="text-xs text-stone-500">Entrega eficiente e credenciais protegidas.</p></div></div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-600">
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />Formatos automáticos WebP ou AVIF conforme o navegador.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />Imagens dimensionadas para cada card, evitando tráfego desnecessário.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />API Secret mantido apenas nas funções protegidas do servidor.</li>
            </ul>
          </Card>
          <Card hover={false} className="border-[#e4dcc9] bg-[#fdfbf7] p-5 sm:p-6">
            <div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-[#8f6d25]" /><div><h4 className="font-bold text-stone-900">Como a cota é calculada</h4><p className="mt-2 text-sm leading-6 text-stone-600">O Cloudinary consolida transformações, armazenamento e entrega em créditos. O painel usa os limites retornados pela conta, sem estimar um plano fixo.</p></div></div>
          </Card>
          <div className="rounded-xl border border-stone-200 bg-white p-4"><div className="flex items-center gap-3 text-sm text-stone-600"><Database className="h-4 w-4 text-[#611a1a]" /><span>{settings.supabase_storage_enabled ? 'Supabase Storage permanece como apoio.' : 'Cloudinary é o destino exclusivo dos novos uploads.'}</span></div></div>
        </div>
      </div>
    </div>
  );
};
