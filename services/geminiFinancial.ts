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

/**
 * Parses raw text from a bank statement (PDF text or copy-paste) into structured transactions.
 */
export const parseTransactionsFromText = async (
  rawText: string,
  language: 'ES' | 'EN' | 'FR' = 'ES',
  currency: string = 'EUR'
): Promise<Partial<Transaction>[]> => {
  try {
    const prompt = `
You are a professional financial data extraction expert localized for the European market (specifically Spain). 
I will provide you with raw text extracted from a bank statement (PDF or copy-paste). 

Your goal is to accurately extract ALL transactions from the provided text into a clean, structured JSON array.

### EXTRACTION RULES:
1. **Precision**: Extract the exact date, the full original description, and the numeric amount.
2. **Amounts**: 
   - Expenses (cargos) MUST be negative numbers.
   - Income (abonos) MUST be positive numbers.
   - Look for context clues like "D/H", "Debe/Haber", "Cargo/Abono" or separate columns for debits/credits.
3. **Dates**: Convert all dates to ISO format (YYYY-MM-DD). If year is missing, assume 2024 or 2025 based on surrounding context.
4. **Description**: Clean the description by removing IBANs, internal codes, or excessive whitespace, but keep the core vendor name or concept.
5. **Categorization**: Use one of these exact categories: [Food, Transport, Housing, Health, Entertainment, Shopping, Income, Education, Insurance, Savings, Others].
6. **Language**: The text is likely in Spanish.

### DATA TO PARSE:
"""
${rawText.slice(0, 8000)}
"""

### OUTPUT FORMAT:
Return ONLY a valid JSON array of objects. Do not include markdown blocks or extra text.
Example: 
[
  { "date": "2024-03-12", "amount": -4.50, "description": "STARBUCKS COFFEE", "category": "Food", "type": "EXPENSE" },
  { "date": "2024-03-15", "amount": 2500.00, "description": "NOMINA EMPRESA S.A.", "category": "Income", "type": "INCOME" }
]

Respond strictly with the JSON. Currency is ${currency}.
${language === 'ES' ? 'Responde estrictamente en español.' : ''}
`;

    const result = await generateContent(prompt);
    const cleaned = cleanJSON(result);
    const parsed = JSON.parse(cleaned);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return [];
  }
};
