import { generateContent } from './geminiApiClient';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const CURRENCY_MAP: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', MXN: '$', COP: '$', ARS: '$', CLP: '$', CAD: '$', AUD: '$', CHF: 'CHF', INR: '₹' };

export const LANG_PROMPTS = {
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
        error: "Hubo un error al conectar con el asistente financiero. Inténtalo más tarde.",
        apiKeyError: "Error: No se ha encontrado la clave API de Gemini."
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
        error: "There was an error connecting to the financial assistant. Please try again later.",
        apiKeyError: "Error: Gemini API Key not found."
    },
    FR: {
        role: "Agissez en tant qu'expert conseiller financier personnel.",
        context: "Analysez les données financières suivantes d'un utilisateur.",
        output: "Fournissez une analyse concise au format HTML simple (utilisez <strong>, <ul>, <li>, <br>) couvrant les points suivants :",
        points: [
            "Observations Clés : Santé financière globale et état des comptes.",
            "Analyse des Dépenses : Détectez des modèles ou des dépenses inutiles.",
            "État des Budgets : Évaluez si les limites sont respectées.",
            "Progrès des Objectifs : Commentaire sur l'avancement des objectifs.",
            "Suggestions d'Épargne : Actions concrètes pour améliorer.",
            "Gestión de la Dette : Conseil rapide sur la façon de l'aborder (si applicable)."
        ],
        tone: "Gardez un ton professionnel mais encourageant. N'utilisez pas de Markdown, utilisez des balises HTML de base.",
        currencyLabel: "Devise",
        error: "Une erreur s'est produite lors de la connexion à l'assistant financier. Veuillez réessayer plus tard.",
        apiKeyError: "Erreur : Clé API Gemini introuvable."
    }
};

export const cleanJSON = (text: string) => {
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

export const compressBase64Image = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL('image/webp', quality);
                resolve(compressed);
            } else {
                resolve("");
            }
        };
        img.onerror = () => {
            resolve("");
        };
    });
};

export type ImageCategory = 'food' | 'travel' | 'general' | 'portrait';

export const generateImage = async (
    prompt: string,
    aspectRatio: string = "4:3",
    category: ImageCategory = 'general'
): Promise<{ imageUrl?: string; error?: string }> => {
    const seed = Math.floor(Math.random() * 1000000);
    const width = aspectRatio === "16:9" ? 1280 : aspectRatio === "9:16" ? 720 : 1024;
    const height = aspectRatio === "16:9" ? 720 : aspectRatio === "9:16" ? 1280 : 1024;

    let enhancements = "";

    switch (category) {
        case 'food':
            enhancements = "professional food photography, award winning, studio soft lighting, appetizing, highly detailed, 8k, bokeh, cinematic composition, depth of field, vibrant colors, michelin star plating, editorial style";
            break;
        case 'travel':
            enhancements = "stunning travel photography, breathtaking landscape, cinematic wide shot, golden hour, national geographic style, highly detailed, 8k, vibrant colors, sharp focus, adventurous atmosphere";
            break;
        case 'portrait':
            enhancements = "professional portrait photography, studio lighting, sharp focus on eyes, soft background, 8k, highly detailed, expressive, cinematic mood, elegant";
            break;
        case 'general':
        default:
            enhancements = "professional photography, highly detailed, 8k, cinematic lighting, sharp focus, clean composition, vibrant colors";
            break;
    }

    const enhancedPrompt = `${prompt}, ${enhancements}`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

    return { imageUrl };
};

export const askAI = async (prompt: string): Promise<string> => {
    try {
        const result = await generateContent(prompt);
        return result || "";
    } catch (e) {
        console.error("Gemini Chat Error:", e);
        return "Error connecting to AI.";
    }
};

export const suggestCategory = async (
    description: string,
    categories: string[]
): Promise<string | null> => {
    try {
        const prompt = `Classify this description: "${description}" into exactly one of these categories: ${categories.join(', ')}. Return ONLY the category name and nothing else.`;
        const result = await generateContent(prompt);
        const text = result?.trim() || '';
        
        const match = categories.find(c => text.includes(c));
        return match || null;
    } catch (e) {
        console.error("Smart Categorization Error:", e);
        return null;
    }
};

export const processVoiceCommand = async (
    transcript: string,
    language: 'ES' | 'EN' | 'FR' = 'ES'
): Promise<any> => {
    try {
        const prompt = `
Analyze the following voice command transcript from a finance tracking app.
Determine the intent. It can be creating a transaction, checking balance, or asking a question.
Return ONLY a valid JSON object with:
{
  "type": "TRANSACTION" | "BALANCE" | "QUESTION" | "UNKNOWN",
  "confidence": number between 0 and 1,
  "rawText": "${transcript}",
  "extractedData": { // if TRANSACTION
     "amount": number,
     "description": string,
     "type": "INCOME" | "EXPENSE"
  }
}

Transcript: "${transcript}"
Language: ${language}
Return ONLY valid JSON without markdown wrapping.`;

        const result = await generateContent(prompt);
        return JSON.parse(cleanJSON(result));
    } catch (e) {
        console.error("Voice Processing Error:", e);
        return { type: 'UNKNOWN', confidence: 0, rawText: transcript };
    }
};

export const generateSmartInsight = async (
    financialContext: {
        topCategories: string[];
        monthlySpending: number;
        currency: string;
    },
    pantryItems: string[],
    language: 'ES' | 'EN' | 'FR'
): Promise<{
    title: string;
    insight: string;
    savingsEstimate: string;
    actionableRecipe?: { name: string; matchReason: string };
} | null> => {
    try {
        const prompt = `
Generate a single financial & lifestyle insight based on this data:
Finance: Top categories: ${financialContext.topCategories.join(', ')}, Spending: ${financialContext.monthlySpending} ${financialContext.currency}.
Pantry: ${pantryItems.join(', ')}

Provide a creative tip combining finance and food to save money over the next weeks.
Return ONLY valid JSON without markdown wrapping:
{
  "title": "string",
  "insight": "string",
  "savingsEstimate": "string with amount and currency",
  "actionableRecipe": { "name": "string", "matchReason": "string" } // optional
}
Language: ${language}`;

        const result = await generateContent(prompt);
        return JSON.parse(cleanJSON(result));
    } catch (e) {
        console.error("Smart Insight Error:", e);
        return null;
    }
};
