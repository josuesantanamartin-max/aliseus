
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

    // 1. Obtener transacciones desde la Edge Function de Plaid
    const { data, error } = await supabase.functions.invoke('plaid-sync-transactions');
    if (error) throw error;

    const rawTransactions = data.transactions || [];
    if (rawTransactions.length === 0) return { newTransactions: 0 };

    // 2. Preparar para categorización con IA
    // Plaid ya trae categorías, pero Gemini puede refinarlas al formato de Aliseus
    const preparedText = rawTransactions.map((t: any) => 
      `${t.date} | ${t.description} | ${t.amount}`
    ).join('\n');

    const categorized = await parseTransactionsFromText(preparedText);
    
    // Aquí iría la lógica de persistencia en 'finance_transactions' 
    // mapeando los resultados de 'categorized' con los 'rawTransactions'
    
    return { newTransactions: rawTransactions.length };
  }
}

export const bankingService = new BankingService();
