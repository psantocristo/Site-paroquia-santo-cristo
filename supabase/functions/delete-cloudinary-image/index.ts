import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para gerar assinatura SHA1 para autenticação do Cloudinary
async function generateSignature(toSign: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(toSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false }
    });
    const { data: isAdmin, error: adminError } = await authClient.rpc('is_admin');
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Acesso administrativo necessário' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { publicId } = await req.json();

    if (!publicId) {
      console.error('Missing publicId in request');
      return new Response(
        JSON.stringify({ success: false, error: 'publicId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[delete-cloudinary-image] Iniciando deleção: ${publicId}`);

    // Criar cliente Supabase para buscar configurações
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Buscar configurações do Cloudinary do banco
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret', 'cloudinary_enabled']);

    if (settingsError) {
      console.error('Erro ao buscar configurações:', settingsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao buscar configurações do Cloudinary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>) || {};

    const cloudName = config.cloudinary_cloud_name;
    const apiKey = config.cloudinary_api_key;
    const apiSecret = config.cloudinary_api_secret;
    const enabled = config.cloudinary_enabled === 'true';

    if (!enabled) {
      console.log('[delete-cloudinary-image] Cloudinary desabilitado');
      return new Response(
        JSON.stringify({ success: false, error: 'Cloudinary não está habilitado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[delete-cloudinary-image] Configuração incompleta:', { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
      return new Response(
        JSON.stringify({ success: false, error: 'Cloudinary não está completamente configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar timestamp e assinatura
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await generateSignature(stringToSign);

    console.log(`[delete-cloudinary-image] Chamando API do Cloudinary para: ${publicId}`);

    // Chamar API de deleção do Cloudinary
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const cloudinaryResult = await cloudinaryResponse.json();
    console.log(`[delete-cloudinary-image] Resposta do Cloudinary:`, cloudinaryResult);

    if (cloudinaryResult.result === 'ok' || cloudinaryResult.result === 'not found') {
      // "not found" também é sucesso - a imagem já não existe
      console.log(`[delete-cloudinary-image] Imagem deletada com sucesso: ${publicId}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          result: cloudinaryResult.result,
          message: cloudinaryResult.result === 'ok' ? 'Imagem deletada com sucesso' : 'Imagem não encontrada (já foi deletada)'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error(`[delete-cloudinary-image] Erro ao deletar: ${publicId}`, cloudinaryResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: cloudinaryResult.error?.message || 'Erro ao deletar imagem do Cloudinary',
          details: cloudinaryResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[delete-cloudinary-image] Erro inesperado:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
