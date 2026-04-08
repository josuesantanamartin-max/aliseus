
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GOCARDLESS_SECRET_ID = Deno.env.get('GOCARDLESS_SECRET_ID')
    const GOCARDLESS_SECRET_KEY = Deno.env.get('GOCARDLESS_SECRET_KEY')

    if (!GOCARDLESS_SECRET_ID || !GOCARDLESS_SECRET_KEY) {
      throw new Error('GOCARDLESS_SECRET_ID or GOCARDLESS_SECRET_KEY is not set')
    }

    // 1. Obtener Token de Acceso
    const tokenResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_id: GOCARDLESS_SECRET_ID,
        secret_key: GOCARDLESS_SECRET_KEY
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(`GoCardless Auth Error: ${JSON.stringify(errorData)}`)
    }

    const { access } = await tokenResponse.json()

    // 2. Obtener Instituciones de España (ES) por defecto
    const instResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/institutions/?country=es', {
      headers: { 'Authorization': `Bearer ${access}` }
    })

    const institutions = await instResponse.json()

    return new Response(JSON.stringify(institutions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
