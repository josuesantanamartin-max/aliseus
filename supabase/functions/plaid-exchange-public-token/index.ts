
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Configuration, PlaidApi, PlaidEnvironments } from "https://esm.sh/plaid@21.0.0"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { publicToken, institutionId } = await req.json()
    const authHeader = req.headers.get('Authorization')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // 1. Configurar Plaid
    const configuration = new Configuration({
      basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
          'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
        },
      },
    })
    const plaidClient = new PlaidApi(configuration)

    // 2. Intercambiar public_token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // 3. Guardar en la base de datos
    const { error: dbError } = await supabase
      .from('banking_connections')
      .upsert({
        user_id: user.id,
        institution_id: institutionId || 'plaid_linked',
        access_token: accessToken,
        item_id: itemId,
        provider: 'plaid',
        status: 'CONNECTED'
      }, { onConflict: 'item_id' })

    if (dbError) throw dbError

    return new Response(JSON.stringify({ success: true, item_id: itemId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
