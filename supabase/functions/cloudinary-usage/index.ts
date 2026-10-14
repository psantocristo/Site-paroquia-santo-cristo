import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type CloudinaryMetric = {
  usage?: number | string
  used?: number | string
  limit?: number | string
  credits_limit?: number | string
  used_percent?: number | string
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeMetric = (metric: CloudinaryMetric = {}) => {
  const used = toNumber(metric.usage ?? metric.used)
  const limit = toNumber(metric.limit ?? metric.credits_limit)
  const reportedPercent = toNumber(metric.used_percent)
  const calculatedPercent = limit > 0 ? (used / limit) * 100 : 0

  return {
    used,
    limit,
    used_percent: Math.round((reportedPercent || calculatedPercent) * 100) / 100
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false }
    })
    const { data: isAdmin, error: adminError } = await authClient.rpc('is_admin')
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Acesso administrativo necessário' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar credenciais do Cloudinary no Supabase
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret', 'cloudinary_enabled'])

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    const config = settings?.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, string>) || {}

    console.log('Cloudinary config retrieved:', {
      enabled: config.cloudinary_enabled,
      hasCloudName: !!config.cloudinary_cloud_name,
      hasApiKey: !!config.cloudinary_api_key,
      hasApiSecret: !!config.cloudinary_api_secret
    })

    if (config.cloudinary_enabled !== 'true' || !config.cloudinary_cloud_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cloudinary não configurado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Chamar API Admin do Cloudinary
    const authString = btoa(`${config.cloudinary_api_key}:${config.cloudinary_api_secret}`)
    
    console.log('Calling Cloudinary usage API for cloud:', config.cloudinary_cloud_name)
    
    const usageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinary_cloud_name}/usage`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`
        }
      }
    )

    if (!usageResponse.ok) {
      const errorText = await usageResponse.text()
      console.error('Cloudinary API error:', usageResponse.status, errorText)
      throw new Error(`Cloudinary API error: ${usageResponse.status} - ${errorText}`)
    }

    const usageData = await usageResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        usage: {
          storage: normalizeMetric(usageData.storage),
          bandwidth: normalizeMetric(usageData.bandwidth),
          transformations: normalizeMetric(usageData.transformations),
          credits: normalizeMetric(usageData.credits),
          resources: toNumber(usageData.resources),
          plan: usageData.plan || 'Free',
          last_updated: usageData.last_updated || new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching Cloudinary usage:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
