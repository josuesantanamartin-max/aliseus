
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No se encontró el token de autorización')

    // 1. Inicializar cliente de Supabase (con el token del usuario)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const GOCARDLESS_SECRET_ID = Deno.env.get('GOCARDLESS_SECRET_ID')
    const GOCARDLESS_SECRET_KEY = Deno.env.get('GOCARDLESS_SECRET_KEY')

    // 2. Obtener Token de GoCardless
    const tokenResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret_id: GOCARDLESS_SECRET_ID, secret_key: GOCARDLESS_SECRET_KEY })
    })
    const { access } = await tokenResponse.json()

    // 3. Obtener conexiones activas del usuario desde la base de datos
    const { data: connections, error: connError } = await supabase
      .from('banking_connections')
      .select('requisition_id, institution_id')
      .eq('user_id', user.id)

    if (connError) throw connError
    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ transactions: [], message: 'No hay bancos conectados' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const allTransactions: any[] = []

    // 4. Iterar por cada banco y sus cuentas
    for (const conn of connections) {
      // a. Obtener detalles de la requisition para sacar las cuentas
      const requisitionResponse = await fetch(`https://bankaccountdata.gocardless.com/api/v2/requisitions/${conn.requisition_id}/`, {
        headers: { 'Authorization': `Bearer ${access}` }
      })
      const reqData = await requisitionResponse.json()

      for (const accountId of (reqData.accounts || [])) {
        // b. Obtener transacciones de la cuenta
        const txResponse = await fetch(`https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/transactions/`, {
          headers: { 'Authorization': `Bearer ${access}` }
        })
        const txData = await txResponse.json()
        
        // Mapeo básico para facilitar el trabajo a la IA
        const booked = txData.transactions?.booked || []
        const mapped = booked.map((t: any) => ({
          date: t.bookingDate || t.valueDate,
          amount: parseFloat(t.transactionAmount.amount),
          currency: t.transactionAmount.currency,
          description: t.remittanceInformationUnstructured || t.remittanceInformationStructured || 'Sin descripción',
          externalId: t.transactionId || t.internalTransactionId,
          bankAccountId: accountId
        }))
        
        allTransactions.push(...mapped)
      }
    }

    // 5. Actualizar fecha de última sincronización
    await supabase
      .from('banking_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('user_id', user.id)

    return new Response(JSON.stringify({ transactions: allTransactions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
