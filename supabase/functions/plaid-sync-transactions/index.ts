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
  if (!authHeader) throw new Error('No se encontró el token de autorización')

  const token = authHeader.replace('Bearer ', '').trim()

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
    console.error("[Sync] Auth validation failed:", authError)
    throw new Error('Usuario no autenticado o sesión inválida')
  }

  console.log(`[Sync] Syncing for user: ${user.id} (${user.email})`)

  // 1. Obtener conexiones de Plaid activas del usuario usando supabaseAdmin
  const { data: connections, error: connError } = await supabaseAdmin
    .from('banking_connections')
    .select('access_token, item_id')
    .eq('user_id', user.id)
    .eq('provider', 'plaid')

  if (connError) throw connError
  if (!connections || connections.length === 0) {
    return new Response(JSON.stringify({ transactions: [], message: 'No hay bancos conectados con Plaid' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // 2. Configurar Plaid
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

  const allTransactions: any[] = []

  // 3. Iterar por cada conexión (Item)
  for (const conn of connections) {
    // Pedir transacciones de los últimos 30 días
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const response = await plaidClient.transactionsGet({
      access_token: conn.access_token,
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    })

    const mapped = response.data.transactions.map((t: any) => ({
      date: t.date,
      amount: t.amount * -1, // Plaid: positivo es débito, invertimos para Aliseus (negativo = gasto)
      currency: t.iso_currency_code || 'EUR',
      description: t.name + (t.merchant_name ? ` (${t.merchant_name})` : ''),
      externalId: t.transaction_id,
      bankAccountId: t.account_id,
      category: t.personal_finance_category?.primary || t.category?.[0] || 'Uncategorized'
    }))

    allTransactions.push(...mapped)
  }

  // 4. Actualizar fecha de sincronización
  await supabaseAdmin
    .from('banking_connections')
    .update({ last_sync: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('provider', 'plaid')

  return new Response(JSON.stringify({ transactions: allTransactions }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

serve(withMonitoredHandler(handler))
