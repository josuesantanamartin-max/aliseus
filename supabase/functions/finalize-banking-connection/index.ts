
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { requisitionId } = await req.json()

    const GOCARDLESS_SECRET_ID = Deno.env.get('GOCARDLESS_SECRET_ID')
    const GOCARDLESS_SECRET_KEY = Deno.env.get('GOCARDLESS_SECRET_KEY')

    // 1. Token
    const tokenResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret_id: GOCARDLESS_SECRET_ID, secret_key: GOCARDLESS_SECRET_KEY })
    })
    const { access } = await tokenResponse.json()

    // 2. Consultar estado de la Requisition
    const requisitionResponse = await fetch(`https://bankaccountdata.gocardless.com/api/v2/requisitions/${requisitionId}/`, {
      headers: { 'Authorization': `Bearer ${access}` }
    })

    if (!requisitionResponse.ok) {
        throw new Error('No se pudo verificar el estado de la conexión.')
    }

    const requisition = await requisitionResponse.json()
    
    // El estado 'LN' significa 'Linked' (Viculado correctamente)
    // Otros estados: 'CR' (Created), 'EX' (Expired), etc.
    const isSuccess = requisition.status === 'LN'

    return new Response(JSON.stringify({ 
      status: requisition.status,
      success: isSuccess,
      accounts: requisition.accounts 
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
