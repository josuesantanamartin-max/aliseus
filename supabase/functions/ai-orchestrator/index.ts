import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const CURRENCY_MAP: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', MXN: '$', COP: '$', ARS: '$', CLP: '$', CAD: '$', AUD: '$', CHF: 'CHF', INR: '₹' };

const LANG_PROMPTS: Record<string, any> = {
    ES: {
        role: "Actúa como un experto asesor financiero personal.",
        context: "Analiza los siguientes datos financieros de un usuario.",
        output: "Proporciona un análisis conciso en formato HTML simple (usa <strong>, <ul>, <li>, <br>) con los siguientes puntos:",
        points: [
            "Observaciones Clave: Salud financiera general y estado por cuentas.",
            "Análisis de Gastos: Detecta patrones o gastos innecesarios.",
            "Estado de Presupuestos: Evalúa si se están cumpliendo los límites.",
            "Progreso de Metas: Comentario sobre el avance de los objetivos.",
            "Sugerencias de Ahorro: Acciones concretas para mejorar.",
            "Gestión de Deuda: Consejo rápido sobre cómo abordarla (si aplica)."
        ],
        tone: "Mantén un tono profesional pero alentador. No uses Markdown, usa etiquetas HTML básicas.",
        currencyLabel: "Moneda",
    },
    EN: {
        role: "Act as an expert personal financial advisor.",
        context: "Analyze the following financial data for a user.",
        output: "Provide a concise analysis in simple HTML format (use <strong>, <ul>, <li>, <br>) covering the following points:",
        points: [
            "Key Observations: Overall financial health and account status.",
            "Expense Analysis: Detect patterns or unnecessary expenses.",
            "Budget Status: Evaluate if limits are being met.",
            "Goal Progress: Comment on the progress of objectives.",
            "Savings Suggestions: Concrete actions to improve.",
            "Debt Management: Quick advice on how to address it (if applicable)."
        ],
        tone: "Keep a professional yet encouraging tone. Do not use Markdown, use basic HTML tags.",
        currencyLabel: "Currency",
    },
    FR: {
        role: "Agissez en tant qu'expert conseiller financier personnel.",
        context: "Analysez les données financières suivantes d'un utilisateur.",
        output: "Fournissez une analyse concise au format HTML simple (utilisez <strong>, <ul>, <li>, <br>) couvrant les points suivants :",
        points: [
            "Observations Clés : Santé financière globale et état des comptes.",
            "Analyse des Dépenses : Détectez des modèles ou des dépenses inutiles.",
            "État des Budgets : Évaluez si les limites respectées.",
            "Progrès des Objectifs : Commentaire sur l'avancement des objectifs.",
            "Suggestions d'Épargne : Actions concrètes pour améliorer.",
            "Gestión de la Dette : Conseil rapide sur la façon de l'aborder (si applicable)."
        ],
        tone: "Gardez un ton professionnel mais encourageant. N'utilisez pas de Markdown, utilisez des balises HTML de base.",
        currencyLabel: "Devise",
    }
};

const cleanJSON = (text: string) => {
    let cleaned = text.replace(/```json\n?|```/g, '').trim();
    const firstOpen = cleaned.indexOf('{');
    const firstArray = cleaned.indexOf('[');
    let startIndex = -1;
    if (firstOpen > -1 && firstArray > -1) startIndex = Math.min(firstOpen, firstArray);
    else if (firstOpen > -1) startIndex = firstOpen;
    else if (firstArray > -1) startIndex = firstArray;

    const lastClose = cleaned.lastIndexOf('}');
    const lastArray = cleaned.lastIndexOf(']');
    let endIndex = -1;
    if (lastClose > -1 && lastArray > -1) endIndex = Math.max(lastClose, lastArray);
    else if (lastClose > -1) endIndex = lastClose;
    else if (lastArray > -1) endIndex = lastArray;

    if (startIndex > -1 && endIndex > -1) {
        return cleaned.substring(startIndex, endIndex + 1);
    }
    return cleaned;
};

serve(async (req) => {
    // Check CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, params } = await req.json();
        const API_KEY = Deno.env.get('GEMINI_API_KEY');

        if (!API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in the environment');
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        let promptText = "";
        let contents: any = "";

        const { language = 'ES', currency = 'EUR' } = params || {};
        const t = LANG_PROMPTS[language] || LANG_PROMPTS['EN'];
        const currencySymbol = CURRENCY_MAP[currency] || currency;
        const today = new Date().toISOString().split('T')[0];

        // --- FINANCIAL ACTIONS ---
        if (action === "analyzeFinances") {
            const { transactions, accounts, debts, budgets, goals } = params;
            const totalBalance = accounts.reduce((acc: any, curr: any) => acc + curr.balance, 0);
            const income = transactions.filter((tr: any) => tr.type === 'INCOME').reduce((acc: any, tr: any) => acc + tr.amount, 0);
            const expense = transactions.filter((tr: any) => tr.type === 'EXPENSE').reduce((acc: any, tr: any) => acc + tr.amount, 0);
            const debtTotal = debts.reduce((acc: any, d: any) => acc + d.remainingBalance, 0);

            const accountStats = transactions.reduce((acc: any, tr: any) => {
                if (!acc[tr.accountId]) acc[tr.accountId] = { income: 0, expense: 0 };
                if (tr.type === 'INCOME') acc[tr.accountId].income += tr.amount;
                else acc[tr.accountId].expense += tr.amount;
                return acc;
            }, {});

            const accountBreakdown = accounts.map((acc: any) => {
                const stats = accountStats[acc.id] || { income: 0, expense: 0 };
                const name = acc.bankName ? `${acc.bankName} - ${acc.name}` : acc.name;
                return `- ${name}: Balance ${currencySymbol}${acc.balance.toFixed(2)} (Ingresos: +${currencySymbol}${stats.income.toFixed(2)} / Gastos: -${currencySymbol}${stats.expense.toFixed(2)})`;
            }).join('\n');

            const expensesByCategory = transactions
                .filter((tr: any) => tr.type === 'EXPENSE')
                .reduce((acc: any, tr: any) => {
                    acc[tr.category] = (acc[tr.category] || 0) + tr.amount;
                    return acc;
                }, {});

            const topExpenses = Object.entries(expensesByCategory)
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, 5)
                .map(([cat, amount]: any) => `- ${cat}: ${currencySymbol}${amount.toFixed(2)}`)
                .join('\n');

            const budgetSummary = budgets.map((b: any) => `- ${b.category} (${b.subCategory || 'General'}): Limit ${currencySymbol}${b.limit}`).join('\n');

            const goalsSummary = goals.map((g: any) => {
                const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount * 100).toFixed(1) : 0;
                return `- ${g.name}: ${currencySymbol}${g.currentAmount} / ${currencySymbol}${g.targetAmount} (${progress}%)`;
            }).join('\n');

            promptText = `
        ${t.role}
        ${t.currencyLabel}: ${currency} (${currencySymbol})
        ${t.context}
        
        DATA SUMMARY:
        - Net Worth (Total Balance): ${currencySymbol}${totalBalance.toFixed(2)}
        - Period Income: ${currencySymbol}${income.toFixed(2)}
        - Period Expenses: ${currencySymbol}${expense.toFixed(2)}
        - Total Debt: ${currencySymbol}${debtTotal.toFixed(2)}

        BREAKDOWN BY ACCOUNT:
        ${accountBreakdown}

        TOP EXPENSES:
        ${topExpenses}

        ACTIVE BUDGETS:
        ${budgetSummary}

        ACTIVE GOALS:
        ${goalsSummary}

        RECENT TRANSACTIONS:
        ${JSON.stringify(transactions.slice(0, 5).map((tr: any) => ({
                date: tr.date, desc: tr.description, amount: tr.amount, type: tr.type, category: tr.category
            })))}

        INSTRUCTIONS:
        ${t.output}
        ${t.points.map((p: any, i: number) => `${i + 1}. ${p}`).join('\n')}

        ${t.tone}
        IMPORTANT: Respond ONLY in ${language === 'ES' ? 'SPANISH' : language === 'FR' ? 'FRENCH' : 'ENGLISH'}.
        `;
            contents = promptText;
        }
        else if (action === "analyzePredictive") {
            const { transactions, requestType } = params;
            const data = JSON.stringify(transactions.map((t: any) => ({
                d: t.date, a: t.amount, c: t.category, desc: t.description
            })).slice(0, 300));

            if (requestType === 'ANOMALY') {
                promptText = `
            Act as a Financial Anomaly Detection System.
            Analyze these transactions: ${data}
            Identify statistical outliers. Return JSON array:
            [{ "id": "use description as id placeholder", "date": "YYYY-MM-DD", "amount": 0, "description": "text", "severity": "HIGH/MEDIUM/LOW", "reason": "Why?" }]`;
            } else if (requestType === 'SAVINGS') {
                promptText = `
            Act as a Cost Optimization Engine.
            Analyze transactions: ${data}
            Identify specific opportunities to save money based on recurring spending. Return JSON array:
            [{ "category": "Category Name", "potentialSavings": 0, "suggestion": "Actionable advice", "difficulty": "EASY/MEDIUM/HARD" }]`;
            } else if (requestType === 'PATTERNS') {
                promptText = `
            Act as a Spending Pattern Engine.
            Analyze transactions: ${data}
            Identify seasonal spikes, recurring subs. Return JSON array:
            [{ "type": "SEASONAL/RECURRING/SPIKE", "description": "text", "detectedCategories": ["cat1"] }]`;
            } else if (requestType === 'FORECAST') {
                promptText = `
            Act as a Forecasting Engine.
            Analyze transactions: ${data}. Current Date: ${today}
            Predict NEXT 3 MONTHS total expense. Return JSON array:
            [{ "date": "YYYY-MM-01", "amount": 0, "confidence": 0.0-1.0, "modelUsed": "AI" }]`;
            }
            promptText += `\nResponse Format: JSON Array ONLY. Language: ${language}`;
            contents = promptText;
        }
        // --- LIFE ACTIONS ---
        else if (action === "extractTravelParams") {
            const { userInput } = params;
            promptText = `
        Analyze travel request: "${userInput}". Today's date is: ${today}. Language: ${language}.
        Extract parameters to search flights. Dates in YYYY-MM-DD. Origin/Destination in 3-letter IATA.
        OUTPUT FORMAT - RETURN ONLY RAW JSON:
        { "origin": "IATA_CODE", "destination": "IATA_CODE", "departureDate": "YYYY-MM-DD", "returnDate": "YYYY-MM-DD", "adults": 1 }
        Return null for missing mandatory fields (except adults).
        `;
            contents = promptText;
        }
        else if (action === "planTripWithAI") {
            const { userInput, realFlights, realAccommodations } = params;
            const flightsContext = realFlights.length > 0 ? JSON.stringify(realFlights.slice(0, 3)) : "No real flight data. Suggest manual routes.";
            const accommodationsContext = realAccommodations.length > 0 ? JSON.stringify(realAccommodations.slice(0, 3)) : "No real accommodation data. Suggest manual hotels.";
            promptText = `
        Act as an elite travel agency AI.
        User Request: "${userInput}". Date: ${today}. Language: ${language}.
        REAL FLIGHTS: ${flightsContext}
        REAL HOTELS: ${accommodationsContext}
        Construct a complete itinerary. MUST use real data if available. RETURN ONLY RAW JSON:
        { "destination": "City", "country": "Country", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "budget": 1500, "imagePrompt": "...", "flights": [], "accommodations": [], "itinerary": [ { "day": 1, "activities": ["Act 1"] } ] }
        `;
            contents = promptText;
        }
        else if (action === "parseReceiptImage") {
            const { base64Data } = params;
            promptText = `
        Analyze this supermarket receipt image. Extract grocery items purchased.
        For each, identify: Name, Quantity (default 1), Unit (pcs, kg, l, g), Category (Vegetables, Fruits, Dairy, Meat, Pantry, Spices, Frozen).
        Return ONLY a raw JSON array of objects.
        `;
            contents = {
                parts: [
                    { inlineData: { mimeType: 'image/webp', data: base64Data } },
                    { text: promptText }
                ]
            };
        }
        else if (action === "generateRecipesFromIngredients") {
            const { ingredients } = params;
            promptText = `
        Act as a Michelin star chef. Ingredients: ${ingredients.join(', ')}.
        Create 3 distinct recipes. Assume basic staples (salt, pepper, oil, water).
        RETURN ONLY RAW JSON. Schema:
        [{ "name": "Name", "prepTime": 15, "calories": 400, "tags": ["Healthy"], "baseServings": 2, "ingredients": [{"name": "Ing", "quantity": 100, "unit": "g"}], "instructions": ["Step 1"] }]
        `;
            contents = promptText;
        }
        else if (action === "generateRecipesFromImage") {
            const { base64Data } = params;
            promptText = `
        Analyze food image. Identify main ingredients/dish. Suggest 2 recipes. Language: ${language}.
        RETURN ONLY RAW JSON. Schema:
        [{ "name": "Name", "prepTime": 15, "calories": 400, "tags": ["Healthy"], "baseServings": 2, "ingredients": [{"name": "Ing", "quantity": 100, "unit": "g"}], "instructions": ["Step 1"] }]
        `;
            contents = {
                parts: [
                    { inlineData: { mimeType: 'image/webp', data: base64Data } },
                    { text: promptText }
                ]
            };
        }
        else if (action === "generateMealPlan") {
            const { criteria, pantryItems } = params;
            const pantrySummary = pantryItems.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
            const mealsToGenerate = criteria.mealTypes?.length ? criteria.mealTypes.join(', ') : 'breakfast, lunch, dinner';
            promptText = `
        Act as Michelin star chef/nutritionist. Generate VARIED meal plan for ${criteria.days} days from ${criteria.startDate}.
        Diet: ${criteria.diet}, Goal: ${criteria.goal}, Meals: ${mealsToGenerate}.
        Pantry: ${pantrySummary} (use to minimize shopping).
        Return strictly a JSON object. Provide FULL DETAILS (recipe name, calories, prepTime, courseType: STARTER/MAIN/DESSERT/SIDE/DRINK, ingredients array). DO NOT provide instructions.
        Schema: { "YYYY-MM-DD": { "lunch": [{ "name": "Salad", "calories": 400, "prepTime": 20, "courseType": "MAIN", "ingredients": [], "instructions": [] }] } }
        `;
            contents = promptText;
        }
        else if (action === "getRecipeDetails") {
            const { recipeName } = params;
            promptText = `
        Create rigorous recipe for: "${recipeName}". Language: ${language}.
        Return ONLY JSON:
        { "ingredients": [ { "name": "Item", "quantity": 1, "unit": "pc" } ], "instructions": [ "Step 1" ] }
        `;
            contents = promptText;
        }
        else if (action === "analyzeLife") {
            const { pantryItems, mealPlans, shoppingList, trips } = params;
            const pantryCategories = pantryItems.reduce((acc: any, item: any) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {});
            const pantrySummary = Object.entries(pantryCategories).map(([cat, count]) => `- ${cat}: ${count} items`).join('\n');

            promptText = `
         Act as expert life management advisor. Language: ${language}.
         PANTRY: ${pantrySummary}
         SHOPPING LIST: ${shoppingList.length ? shoppingList.slice(0, 5).map((i: any) => i.name).join(', ') : 'Empty'}
         MEAL PLAN COUNT: ${mealPlans.length}
         TRIPS: ${trips.map((t: any) => t.destination).join(', ')}
         
         Analyze in simple HTML (<strong>, <ul>, <li>). Focus on Pantry Status, Shopping Optimization, Meal Planning, Travel Prep, Waste Reduction, Cost Savings.
         RESPOND ONLY IN ${language === 'ES' ? 'SPANISH' : language === 'FR' ? 'FRENCH' : 'ENGLISH'}.
         `;
            contents = promptText;
        }
        // --- CORE ACTIONS ---
        else if (action === "askAI") {
            contents = params.prompt;
        }
        else if (action === "suggestCategory") {
            contents = `Match description to best category. Description: "${params.description}". Categories: ${params.categories}. Return ONLY exact category name or "Otros".`;
        }
        else if (action === "processVoiceCommand") {
            contents = `
        Virtual Aliseus Insights Assistant. Date: ${today}.
        Voice Command: "${params.transcript}". Parse into structured JSON Action.
        Allowed: ADD_TRANSACTION, QUERY_DATA, CREATE_GOAL, NAVIGATE, UNKNOWN.
        Return ONLY JSON Object: { "type": "TYPE", "confidence": 0.9, "payload": {}, "rawText": "${params.transcript}" }
        `;
        }
        else if (action === "generateSmartInsight") {
            const { financialContext, pantryItems } = params;
            contents = `
        ACT as financial lifestyle optimizer.
        Financials: Spends on [${financialContext.topCategories}]. Total spent: ${financialContext.currency}${financialContext.monthlySpending}.
        Pantry: [${pantryItems}].
        Find correlation between spending and pantry to save money. Example: "High restaurant" + "Pasta in pantry" -> "Eat pasta".
        Return JSON ONLY: { "title": "Short title", "insight": "Observation", "savingsEstimate": "Amount", "actionableRecipe": { "name": "...", "matchReason": "..." } }
        Language: ${language}
        `;
        }
        else {
            throw new Error(`Unknown action: ${action}`);
        }

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
        });

        let resultText = response.text || "";
        let finalResult: any = resultText;

        // Auto-parse JSON for endpoints that expect it
        const jsonActions = ['analyzePredictive', 'extractTravelParams', 'planTripWithAI', 'parseReceiptImage',
            'generateRecipesFromIngredients', 'generateRecipesFromImage', 'generateMealPlan', 'getRecipeDetails',
            'processVoiceCommand', 'generateSmartInsight'];

        if (jsonActions.includes(action)) {
            finalResult = JSON.parse(cleanJSON(resultText));
        }

        return new Response(JSON.stringify({ result: finalResult }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || err.toString() }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
