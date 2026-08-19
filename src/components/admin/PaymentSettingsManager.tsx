import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/Button';
import { Save, Eye, EyeOff, CreditCard, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import sicrediLogo from '../../assets/sicredi-logo.png.asset.json';

interface SicrediSettings {
  id?: string;
  provider: string;
  environment: string;
  client_id: string | null;
  client_secret: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  beneficiary_name: string | null;
  beneficiary_city: string | null;
  proxy_url: string | null;
  proxy_token: string | null;
  webhook_secret: string | null;
  is_active: boolean;
}

const EMPTY: SicrediSettings = {
  provider: 'sicredi',
  environment: 'sandbox',
  client_id: '',
  client_secret: '',
  pix_key: '',
  pix_key_type: 'cnpj',
  beneficiary_name: '',
  beneficiary_city: '',
  proxy_url: '',
  proxy_token: '',
  webhook_secret: '',
  is_active: false,
};

export const PaymentSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SicrediSettings>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showProxyToken, setShowProxyToken] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [methods, setMethods] = useState({ pix_enabled: true, credit_card_enabled: true });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://esbkvwfogqgcttgzsyqr.supabase.co';
  const webhookUrl = `${supabaseUrl}/functions/v1/sicredi-webhook`;

  useEffect(() => {
    load();
    loadMethods();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('provider', 'sicredi')
      .maybeSingle();
    if (data) setSettings({ ...EMPTY, ...data });
  };

  const loadMethods = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('key,value')
      .in('key', ['pix_enabled', 'credit_card_enabled']);
    if (data) {
      const m: any = { ...methods };
      data.forEach((r) => (m[r.key] = r.value === 'true'));
      setMethods(m);
    }
  };

  const toggleMethod = async (k: 'pix_enabled' | 'credit_card_enabled', v: boolean) => {
    await supabase.from('system_settings').upsert(
      { key: k, value: String(v), description: k },
      { onConflict: 'key' }
    );
    setMethods((prev) => ({ ...prev, [k]: v }));
    toast.success('Atualizado!');
  };

  const save = async (activate = false) => {
    setLoading(true);
    try {
      const payload = { ...settings, is_active: activate || settings.is_active };
      if (settings.id) {
        const { error } = await supabase
          .from('payment_settings')
          .update(payload)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('payment_settings')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        setSettings({ ...EMPTY, ...data });
      }
      toast.success(activate ? 'Sicredi ativado!' : 'Configurações salvas!');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!settings.proxy_url || !settings.client_id || !settings.client_secret) {
      toast.error('Preencha URL do proxy, Client ID e Client Secret');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('sicredi-test-connection', {
        body: {
          proxyUrl: settings.proxy_url,
          proxyToken: settings.proxy_token,
          clientId: settings.client_id,
          clientSecret: settings.client_secret,
          environment: settings.environment,
        },
      });
      if (error) throw error;
      if (data?.success) {
        setTestResult({ ok: true, msg: data.message || 'Conexão OK — token obtido' });
        toast.success('Conexão bem-sucedida!');
      } else {
        setTestResult({ ok: false, msg: data?.message || 'Falhou' });
        toast.error(data?.message || 'Falha na conexão');
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message });
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL do webhook copiada');
  };

  const set = (k: keyof SicrediSettings, v: any) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-background border border-border rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={sicrediLogo.url} alt="Sicredi" className="h-10" />
          <div>
            <h3 className="text-lg font-semibold">Gateway Sicredi (PIX + Cartão)</h3>
            <p className="text-sm text-muted-foreground">
              Ambiente atual: <strong>{settings.environment === 'production' ? 'Produção' : 'Homologação'}</strong>
            </p>
          </div>
        </div>
        {settings.is_active ? (
          <span className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle2 size={16} /> Ativo
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <XCircle size={16} /> Inativo
          </span>
        )}
      </div>

      {/* Métodos disponíveis */}
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Formas de Pagamento Aceitas</h3>
        <div className="space-y-3">
          {(['pix_enabled', 'credit_card_enabled'] as const).map((k) => (
            <div key={k} className="flex items-center justify-between p-3 border border-border rounded">
              <div>
                <p className="font-medium">{k === 'pix_enabled' ? 'PIX' : 'Cartão de Crédito'}</p>
                <p className="text-xs text-muted-foreground">
                  {k === 'pix_enabled' ? 'PIX Sicredi via API Bacen' : 'Cartão via Sicredi'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={methods[k]}
                  onChange={(e) => toggleMethod(k, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-primary rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso mTLS */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-200 font-semibold mb-2">
          ⚠️ Requer proxy mTLS externo
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-300">
          A API PIX da Sicredi exige certificado digital (mTLS). Como o Supabase Edge Functions não suporta
          certificados cliente, você precisa hospedar o proxy Node.js fornecido em
          <code className="mx-1 px-1 bg-amber-100 dark:bg-amber-900 rounded">docs/sicredi-proxy/</code>
          em um servidor próprio (Railway, Fly.io, VPS) e cole a URL abaixo.
        </p>
      </div>

      {/* Configuração */}
      <div className="bg-background border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CreditCard size={18} /> Credenciais Sicredi
        </h3>

        <div>
          <label className="block text-sm font-medium mb-1">Ambiente</label>
          <select
            value={settings.environment}
            onChange={(e) => set('environment', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded bg-background"
          >
            <option value="sandbox">Homologação (sandbox)</option>
            <option value="production">Produção</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client ID</label>
            <input
              type="text"
              value={settings.client_id || ''}
              onChange={(e) => set('client_id', e.target.value)}
              placeholder="Fornecido pela Sicredi"
              className="w-full px-3 py-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client Secret</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={settings.client_secret || ''}
                onChange={(e) => set('client_secret', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-border rounded bg-background"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo da chave PIX</label>
            <select
              value={settings.pix_key_type || 'cnpj'}
              onChange={(e) => set('pix_key_type', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded bg-background"
            >
              <option value="cnpj">CNPJ</option>
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave aleatória</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chave PIX da paróquia</label>
            <input
              type="text"
              value={settings.pix_key || ''}
              onChange={(e) => set('pix_key', e.target.value)}
              placeholder="Ex: 12345678000199"
              className="w-full px-3 py-2 border border-border rounded bg-background"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do beneficiário</label>
            <input
              type="text"
              value={settings.beneficiary_name || ''}
              onChange={(e) => set('beneficiary_name', e.target.value)}
              placeholder="Paróquia Santo Cristo"
              maxLength={25}
              className="w-full px-3 py-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <input
              type="text"
              value={settings.beneficiary_city || ''}
              onChange={(e) => set('beneficiary_city', e.target.value)}
              maxLength={15}
              className="w-full px-3 py-2 border border-border rounded bg-background"
            />
          </div>
        </div>
      </div>

      {/* Proxy mTLS */}
      <div className="bg-background border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">Proxy mTLS (obrigatório)</h3>
        <div>
          <label className="block text-sm font-medium mb-1">URL do proxy</label>
          <input
            type="url"
            value={settings.proxy_url || ''}
            onChange={(e) => set('proxy_url', e.target.value)}
            placeholder="https://sicredi-proxy.paroquia.com"
            className="w-full px-3 py-2 border border-border rounded bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Endereço do seu servidor Node.js que segura o certificado .pem da Sicredi.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Token de acesso ao proxy</label>
          <div className="relative">
            <input
              type={showProxyToken ? 'text' : 'password'}
              value={settings.proxy_token || ''}
              onChange={(e) => set('proxy_token', e.target.value)}
              placeholder="Bearer token compartilhado"
              className="w-full px-3 py-2 pr-10 border border-border rounded bg-background"
            />
            <button
              type="button"
              onClick={() => setShowProxyToken(!showProxyToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showProxyToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Webhook */}
      <div className="bg-background border border-border rounded-lg p-6 space-y-3">
        <h3 className="font-semibold">Webhook para confirmação PIX</h3>
        <p className="text-sm text-muted-foreground">
          Configure esta URL no seu proxy para receber notificações PIX da Sicredi:
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={webhookUrl}
            className="flex-1 px-3 py-2 border border-border rounded bg-muted font-mono text-xs"
          />
          <Button type="button" variant="outline" onClick={copyWebhook}>
            <Copy size={16} />
          </Button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Segredo do webhook (HMAC)</label>
          <input
            type="text"
            value={settings.webhook_secret || ''}
            onChange={(e) => set('webhook_secret', e.target.value)}
            placeholder="Opcional — proteção adicional"
            className="w-full px-3 py-2 border border-border rounded bg-background"
          />
        </div>
      </div>

      {/* Ações */}
      <div className="bg-background border border-border rounded-lg p-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={testConnection}
            disabled={testing}
            className="flex-1"
          >
            {testing ? 'Testando...' : 'Testar Conexão com o Proxy'}
          </Button>
          <Button type="button" onClick={() => save(false)} disabled={loading} className="flex-1">
            <Save size={16} className="mr-2" /> Salvar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => save(true)}
            disabled={loading}
            className="flex-1"
          >
            Ativar Gateway
          </Button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded border text-sm ${
              testResult.ok
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {testResult.ok ? '✓ ' : '✗ '}
            {testResult.msg}
          </div>
        )}
      </div>
    </div>
  );
};