
import { supabase } from './supabaseClient';
import { parseTransactionsFromText } from './geminiFinancial';

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

class BankingService {
  /**
   * Obtiene un link_token de Plaid para iniciar el flujo de vinculación
   */
  async createLinkToken(): Promise<string> {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase.functions.invoke('plaid-create-link-token');

    if (error) throw error;
    return data.link_token;
  }

  /**
   * Intercambia el public_token obtenido del frontend por un access_token permanente
   */
  async exchangePublicToken(publicToken: string, institution?: any): Promise<void> {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { error } = await supabase.functions.invoke('plaid-exchange-public-token', {
      body: { 
        publicToken,
        institutionId: institution?.institution_id || 'plaid_linked'
      }
    });

    if (error) throw error;
  }

  /**
   * Sincroniza todas las cuentas conectadas vía Plaid y categoriza con IA
   */
  async syncAll(): Promise<{ newTransactions: number }> {
    if (!supabase) throw new Error('Supabase no está configurado');

    // 1. Obtener sesión y datos del usuario
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('active_household_id')
      .single();
    
    const householdId = profile?.active_household_id;
    if (!householdId) throw new Error('No se encontró un hogar activo para sincronizar');

    // 2. Obtener cuentas locales para mapear con external_id (Plaid account_id)
    const { data: accounts } = await supabase
      .from('finance_accounts')
      .select('id, external_id')
      .eq('household_id', householdId);

    const accountMap = new Map((accounts || []).map(a => [a.external_id, a.id]));

    // 3. Obtener transacciones desde la Edge Function de Plaid
    const { data, error } = await supabase.functions.invoke('plaid-sync-transactions');
    if (error) throw error;

    const rawTransactions = data.transactions || [];
    if (rawTransactions.length === 0) return { newTransactions: 0 };

    // 4. Preparar para refinamiento con IA — incluimos external_id como clave estable
    //    para que el lookup posterior sea por ID, no por posición de array.
    const preparedText = rawTransactions.map((t: any) =>
      `[ID:${t.externalId}] ${t.date} | ${t.description} | ${t.amount} | ${t.category}`
    ).join('\n');

    const categorized = await parseTransactionsFromText(preparedText);

    // Construir un Map<externalId, aiResult> para un lookup O(1) insensible al orden
    const aiMap = new Map<string, any>();
    for (const item of categorized) {
      // parseTransactionsFromText preserva la descripción que incluye "[ID:xxx]"
      const match = (item.description || '').match(/^\[ID:([^\]]+)\]/);
      const key = match ? match[1] : null;
      if (key) {
        aiMap.set(key, {
          ...item,
          // Limpiar el prefijo [ID:xxx] de la descripción final
          description: item.description?.replace(/^\[ID:[^\]]+\]\s*/, '') || item.description,
        });
      }
    }

    // 5. Mapear resultados de IA con datos originales de Plaid para persistencia
    const transactionsToInsert = rawTransactions.map((rt: any) => {
      const aiRefined = aiMap.get(rt.externalId) || {};
      const localAccountId = accountMap.get(rt.bankAccountId);

      if (!localAccountId) {
        console.warn(`[Banking] No se encontró cuenta local para Plaid account: ${rt.bankAccountId}`);
      }

      return {
        id: crypto.randomUUID(),
        user_id: user.id,
        household_id: householdId,
        account_id: localAccountId || null,
        amount: rt.amount,
        date: rt.date,
        description: aiRefined.description || rt.description,
        category: aiRefined.category || rt.category || 'Others',
        type: rt.amount > 0 ? 'INCOME' : 'EXPENSE',
        external_id: rt.externalId,
        provider: 'plaid',
        status: 'COMPLETED',
        notes: `Importado automáticamente vía Plaid. Categoría original: ${rt.category}`
      };
    });

    // 6. Insertar/Actualizar en Supabase (Deduplicación por external_id)
    const { error: insertError } = await supabase
      .from('finance_transactions')
      .upsert(transactionsToInsert, { 
        onConflict: 'external_id',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.error('[Banking] Error insertando transacciones:', insertError);
      throw insertError;
    }
    
    return { newTransactions: transactionsToInsert.length };
  }
}

export const bankingService = new BankingService();
