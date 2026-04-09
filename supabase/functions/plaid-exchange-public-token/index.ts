import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Configuration, PlaidApi, PlaidEnvironments } from "https://esm.sh/plaid@21.0.0"
import { corsHeaders } from "../_shared/cors.ts"
import { withMonitoredHandler } from "../_shared/monitoring.ts"

const handler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Falta cabecera de autorización')
  }

  // Extraer token y limpiar posibles espacios/caracteres extraños
  const token = authHeader.replace('Bearer ', '').trim()
  console.log(`[Exchange] Token received (prefix): ${token.substring(0, 10)}...`)

  // Cliente para verificar al usuario (usa ANON_KEY)
  const authClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  // Cliente para operaciones de DB (usa SERVICE_ROLE_KEY)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Validar el token directamente
  const { data: { user }, error: authError } = await authClient.auth.getUser(token)
  
  if (authError || !user) {
    console.error("[Exchange] Auth validation failed:", authError)
    const detailMessage = authError ? ` (${authError.message})` : ''
    throw new Error(`Usuario no autenticado o sesión inválida${detailMessage}`)
  }

  console.log(`[Exchange] Authenticated user metadata: ${user.id} | ${user.email}`)

  const { publicToken, institutionId } = await req.json()
  console.log(`[Exchange] Exchanging public token for institution: ${institutionId}`)

  // 1. Configurar Plaid
  const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox'
  const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
        'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
      },
    },
  })
  const plaidClient = new PlaidApi(configuration)

  // 2. Intercambiar public_token
  console.log("[Exchange] Calling Plaid itemPublicTokenExchange...")
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  })

  const accessToken = exchangeResponse.data.access_token
  const itemId = exchangeResponse.data.item_id
  console.log(`[Exchange] Plaid exchange successful. Item ID: ${itemId}`)

  // 3. Obtener metadatos de las cuentas para guardarlas localmente
  console.log("[Exchange] Fetching accounts metadata from Plaid...")
  const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken })
  const plaidAccounts = accountsResponse.data.accounts

  // 4. Guardar conexión y cuentas en la base de datos
  console.log("[Exchange] Saving connection and accounts to DB...")
  
  // Usamos una transacción o varias llamadas (Supabase Edge permitiendo múltiples await es seguro)
  const { error: dbError } = await supabaseAdmin
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

  // Mapear y guardar cuentas
  const accountsToUpsert = plaidAccounts.map((pa: any) => ({
    user_id: user.id,
    name: pa.official_name || pa.name,
    type: 'BANK',
    balance: pa.balances.current || 0,
    currency: pa.balances.iso_currency_code || 'EUR',
    external_id: pa.account_id,
    bank_name: institutionId || 'Plaid Bank',
    updated_at: new Date().toISOString()
  }))

  const { error: accountsError } = await supabaseAdmin
    .from('finance_accounts')
    .upsert(accountsToUpsert, { onConflict: 'external_id' })

  if (accountsError) {
    console.error("[Exchange] Error saving accounts:", accountsError)
    // No lanzamos error aquí para no romper el flujo principal si el intercambio fue bien
  }

  console.log("[Exchange] Connection and accounts saved successfully.")

  return new Response(JSON.stringify({ 
    success: true, 
    item_id: itemId,
    accounts_synced: plaidAccounts.length 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

serve(withMonitoredHandler(handler))
