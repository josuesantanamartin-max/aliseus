import { generateContent } from './geminiApiClient';
import { cleanJSON, LANG_PROMPTS } from './geminiCore';
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
    const langObj = LANG_PROMPTS[language] || LANG_PROMPTS.ES;

    const dataContext = JSON.stringify({
        transactions: transactions.slice(0, 50),
        accounts,
        debts,
        budgets,
        goals
    }, null, 2);

    const prompt = `
${langObj.role}
${langObj.context}
${langObj.output}
- ${langObj.points.join('\n- ')}

${langObj.tone}
${langObj.currencyLabel}: ${currency}

Context:
${dataContext}
`;

    const result = await generateContent(prompt);
    return result || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error (Finance):", error);
    return LANG_PROMPTS[language]?.error || "Hubo un error al conectar con el asistente financiero. Inténtalo más tarde.";
  }
};

export const analyzePredictive = async (
  transactions: Transaction[],
  requestType: 'ANOMALY' | 'FORECAST' | 'SAVINGS' | 'PATTERNS',
  language: 'ES' | 'EN' | 'FR' = 'ES'
): Promise<any> => {
  try {
    const latestTx = transactions.slice(0, 100).map(t => ({ d: t.date, a: t.amount, c: t.category, n: t.description }));
    const context = JSON.stringify(latestTx);
    
    let instructions = "";
    if (requestType === 'ANOMALY') {
        instructions = "Detect anomalies or unusual expenses in the transaction history. Return a JSON array of objects with { \"date\": string, \"amount\": number, \"category\": string, \"reason\": string }.";
    } else if (requestType === 'FORECAST') {
        instructions = "Forecast the next 3 months of expenses by category based on history. Return a JSON array of objects with { \"month\": string, \"category\": string, \"estimatedAmount\": number, \"trend\": \"up\" | \"down\" | \"stable\" }.";
    } else if (requestType === 'SAVINGS') {
        instructions = "Identify 3 to 5 actionable savings opportunities. Return a JSON array of objects with { \"category\": string, \"action\": string, \"potentialSavings\": number }.";
    } else {
        instructions = "Identify common spending patterns. Return a JSON array of strings.";
    }

    const langStr = language === 'ES' ? 'Responde estrictamente en español.' : language === 'FR' ? 'Répondez strictement en français.' : 'Respond strictly in English.';

    const prompt = `
Analyze the following transaction data. 
${instructions}
${langStr}
Return ONLY valid JSON (no markdown formatting).

Transactions:
${context}
`;

    const result = await generateContent(prompt);
    const parsed = JSON.parse(cleanJSON(result));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Predictive API Error:", e);
    return [];
  }
};
