import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Buscar credenciais do Cloudinary no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
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
    console.log('Cloudinary usage data received:', JSON.stringify(usageData, null, 2))

    // Parse os dados de uso do Cloudinary
    const storage = usageData.storage || {}
    const bandwidth = usageData.bandwidth || {}
    const transformations = usageData.transformations || {}
    const credits = usageData.credits || {}

    // Calcular percentuais com base nos limites do plano
    const storageUsed = storage.usage || 0
    const storageLimit = storage.credits_limit || storage.limit || 25 * 1024 * 1024 * 1024 // 25GB default free
    const storagePercent = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0

    const bandwidthUsed = bandwidth.usage || 0
    const bandwidthLimit = bandwidth.credits_limit || bandwidth.limit || 25 * 1024 * 1024 * 1024 // 25GB default free
    const bandwidthPercent = bandwidthLimit > 0 ? (bandwidthUsed / bandwidthLimit) * 100 : 0

    return new Response(
      JSON.stringify({ 
        success: true, 
        usage: {
          storage: {
            used: storageUsed,
            limit: storageLimit,
            used_percent: Math.round(storagePercent * 100) / 100
          },
          bandwidth: {
            used: bandwidthUsed,
            limit: bandwidthLimit,
            used_percent: Math.round(bandwidthPercent * 100) / 100
          },
          transformations: {
            used: transformations.usage || 0,
            limit: transformations.credits_limit || transformations.limit || 25000
          },
          credits: {
            used: credits.usage || 0,
            limit: credits.limit || 25,
            used_percent: credits.used_percent || 0
          },
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
