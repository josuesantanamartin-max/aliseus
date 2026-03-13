import { supabase } from './supabaseClient';
import { Transaction, Account, Debt, Budget, Goal } from '../types';

export const analyzeFinances = async (
  transactions: Transaction[],
  accounts: Account[],
  debts: Debt[],
  budgets: Budget[],
  goals: Goal[],
  language: 'ES' | 'EN' | 'FR' = 'ES',
  currency: string = 'EUR'
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
      body: {
        action: 'analyzeFinances',
        params: { transactions, accounts, debts, budgets, goals, language, currency }
      }
    });
    if (error) throw error;
    return data.result || "No response generated.";
  } catch (error) {
    console.error("Gemini Edge Function Error (Finance):", error);
    return "Hubo un error al conectar con el asistente financiero. Inténtalo más tarde.";
  }
};

export const analyzePredictive = async (
  transactions: Transaction[],
  requestType: 'ANOMALY' | 'FORECAST' | 'SAVINGS' | 'PATTERNS',
  language: 'ES' | 'EN' | 'FR' = 'ES'
): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
      body: {
        action: 'analyzePredictive',
        params: { transactions, requestType, language }
      }
    });
    if (error) throw error;
    return data.result || [];
  } catch (e) {
    console.error("Predictive Edge Function Error:", e);
    return [];
  }
};
