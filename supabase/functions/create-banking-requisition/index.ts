
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { institutionId, redirectUrl } = await req.json()

    const GOCARDLESS_SECRET_ID = Deno.env.get('GOCARDLESS_SECRET_ID')
    const GOCARDLESS_SECRET_KEY = Deno.env.get('GOCARDLESS_SECRET_KEY')

    // 1. Obtener Token
    const tokenResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret_id: GOCARDLESS_SECRET_ID, secret_key: GOCARDLESS_SECRET_KEY })
    })
    const { access } = await tokenResponse.json()

    // 2. Crear Requisition
    const requisitionResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/requisitions/', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${access}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        redirect: redirectUrl,
        institution_id: institutionId,
        reference: `aliseus-${crypto.randomUUID()}`,
        user_language: 'ES'
      })
    })

    if (!requisitionResponse.ok) {
      const errorData = await requisitionResponse.json()
      throw new Error(`GoCardless Requisition Error: ${JSON.stringify(errorData)}`)
    }

    const requisition = await requisitionResponse.json()

    return new Response(JSON.stringify({ 
      link: requisition.link, 
      id: requisition.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
