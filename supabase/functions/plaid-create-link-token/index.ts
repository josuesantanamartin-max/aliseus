import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "https://esm.sh/plaid@21.0.0"
import { corsHeaders } from "../_shared/cors.ts"
import { withMonitoredHandler } from "../_shared/monitoring.ts"

const handler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID')
  const PLAID_SECRET = Deno.env.get('PLAID_SECRET')
  const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox'

  // Opcional: Intentar obtener el ID del usuario si hay un token
  const authHeader = req.headers.get('Authorization')
  let clientUserId = 'anonymous'

  if (authHeader) {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) clientUserId = user.id
    } catch (e) {
      console.warn("Could not get user from auth header:", e.message)
    }
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
    },
  })

  const plaidClient = new PlaidApi(configuration)

  // Crear el link_token
  const linkTokenResponse = await plaidClient.linkTokenCreate({
    user: { client_user_id: clientUserId }, 
    client_name: 'Aliseus',
    products: [Products.Transactions],
    country_codes: [CountryCode.Es],
    language: 'es',
  })

  return new Response(JSON.stringify(linkTokenResponse.data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

serve(withMonitoredHandler(handler))
