import { Ingredient, Trip, Recipe } from '../types';
import { compressBase64Image, cleanJSON } from './geminiCore';
import { generateContent, generateContentWithImage } from './geminiApiClient';

export interface TravelExtractionParams {
    origin: string | null;
    destination: string | null;
    departureDate: string | null;
    returnDate: string | null;
    adults: number;
}

export const extractTravelParams = async (
    userInput: string,
    language: 'ES' | 'EN' | 'FR'
): Promise<TravelExtractionParams | null> => {
    try {
        const prompt = `Extract travel parameters from the following user request.
Return ONLY valid JSON:
{
  "origin": "string | null",
  "destination": "string | null",
  "departureDate": "YYYY-MM-DD | null",
  "returnDate": "YYYY-MM-DD | null",
  "adults": number (default 2)
}
User Request: ${userInput}
Language: ${language}`;
        const result = await generateContent(prompt);
        return JSON.parse(cleanJSON(result));
    } catch (e) {
        console.error("Parameter Extraction Error:", e);
        return null;
    }
};

export const planTripWithAI = async (
    userInput: string,
    realFlights: any[],
    realAccommodations: any[],
    language: 'ES' | 'EN' | 'FR'
): Promise<(Partial<Trip> & { imagePrompt?: string }) | null> => {
    try {
        const prompt = `Act as an expert travel agent. The user wants: "${userInput}".
Here are the fetched real options:
Flights: ${JSON.stringify(realFlights.slice(0,5))}
Accommodations: ${JSON.stringify(realAccommodations.slice(0,5))}

Create a structured trip plan matching the user's request. 
Provide a descriptive "imagePrompt" in english to generate a cover image of the destination.
Return ONLY valid JSON format:
{
  "title": "Trip Title",
  "destination": "Destination City",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "budget": number,
  "currency": "EUR" | "USD",
  "notes": "Plan description",
  "imagePrompt": "A highly detailed scenic view of..."
}`;
        const result = await generateContent(prompt);
        return JSON.parse(cleanJSON(result));
    } catch (e) {
        console.error("Trip Planning Synthesis Error:", e);
        return null;
    }
};

export interface ScannedProduct {
    nombre: string;
    cantidad: number;
    unidad: string;
    precio_unitario: number;
    categoria_despensa: 'Vegetables' | 'Fruits' | 'Dairy' | 'Meat' | 'Pantry' | 'Spices' | 'Frozen' | 'Other';
    dias_caducidad_estimados: number;
}

export interface ScannedData {
    establecimiento: string;
    fecha: string;
    total: number;
    productos: ScannedProduct[];
}

/**
 * Analiza la imagen de un ticket de supermercado con Gemini Vision.
 * Devuelve información estructurada del establecimiento, fecha, total y productos
 * con caducidades estimadas listas para importar a la despensa.
 */
export const parseReceiptImage = async (base64Image: string): Promise<ScannedData | null> => {
    const compressedInput = await compressBase64Image(base64Image, 1024, 0.7);
    if (!compressedInput) return null;
    const base64Data = compressedInput.includes(',') ? compressedInput.split(',')[1] : compressedInput;
    const mimeType = compressedInput.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    try {
        const prompt = `Eres un experto en análisis de tickets de supermercado español.
Analiza esta imagen de un ticket de compra y extrae toda la información relevante.

### REGLAS:
1. Identifica el establecimiento (Mercadona, Lidl, Carrefour, Aldi, Dia, Eroski, Alcampo, etc.)
2. Extrae la fecha del ticket en formato YYYY-MM-DD
3. Extrae el total del ticket como número
4. Para cada producto alimentario:
   - Normaliza el nombre (ej: "LECH.ENTERA PASCUAL 1L" → "Leche Entera Pascual")
   - Estima la cantidad y unidad más lógica
   - Asigna una categoría de despensa
   - Estima los días hasta caducidad basándote en el tipo de producto:
     * Carne fresca/pescado: 2-4 días
     * Lácteos frescos (yogur, nata): 7-14 días
     * Leche UHT: 90 días
     * Frutas/verduras frescas: 5-10 días
     * Pan: 3-5 días
     * Conservas/latas: 730 días
     * Congelados: 180 días
     * Huevos: 28 días
     * Embutidos envasados: 21 días
     * Cerveza/vino: 365 días
5. Ignora productos no alimentarios (bolsas, productos de limpieza, etc.) — inclúyelos con dias_caducidad_estimados: 9999
6. Si no puedes leer algún campo, usa valores por defecto razonables

### CATEGORÍAS permitidas:
"Vegetables" | "Fruits" | "Dairy" | "Meat" | "Pantry" | "Spices" | "Frozen" | "Other"

### FORMATO DE RESPUESTA (JSON estricto):
{
  "establecimiento": "Nombre del supermercado",
  "fecha": "YYYY-MM-DD",
  "total": 0.00,
  "productos": [
    {
      "nombre": "Nombre normalizado del producto",
      "cantidad": 1,
      "unidad": "pcs" | "g" | "kg" | "l" | "ml" | "can" | "pack" | "jar" | "box",
      "precio_unitario": 0.00,
      "categoria_despensa": "Dairy",
      "dias_caducidad_estimados": 14
    }
  ]
}

Responde ÚNICAMENTE con JSON válido, sin markdown ni explicaciones.`;

        const result = await generateContentWithImage(prompt, base64Data, mimeType);
        const parsed = JSON.parse(cleanJSON(result));
        return parsed as ScannedData;
    } catch (e) {
        console.error('Receipt Vision Error:', e);
        return null;
    }
};

/**
 * Analiza la foto de una despensa, nevera o armario y detecta los productos visibles.
 * Devuelve la misma forma ScannedData que parseReceiptImage para reutilizar el flujo de revisión.
 */
export const parsePantryPhotoImage = async (base64Image: string): Promise<ScannedData | null> => {
    const compressedInput = await compressBase64Image(base64Image, 1200, 0.75);
    if (!compressedInput) return null;
    const base64Data = compressedInput.includes(',') ? compressedInput.split(',')[1] : compressedInput;
    const mimeType = compressedInput.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    try {
        const prompt = `Eres un asistente doméstico experto en gestión de despensas y neveras.
Analiza esta imagen de una despensa/nevera/armario de cocina.

### TAREA:
Identifica TODOS los productos alimentarios visibles, incluso si están parcialmente tapados.
Sé generoso — si ves algo que puede ser un producto de despensa, inclúyelo.

### PARA CADA PRODUCTO:
1. Identifica el nombre del producto lo más específico posible
2. Estima la cantidad visible (número de unidades, botellas, bricks, etc.)
3. Asigna la unidad más apropiada
4. Estima el precio unitario aproximado en euros (usa precios de supermercado español medio)
5. Categoriza el producto
6. Estima los días hasta caducidad basándote en el tipo y el aspecto visual:
   * Fruta/verdura fresca con buen aspecto: 5-7 días
   * Fruta/verdura que parece madura: 2-3 días
   * Productos envasados cerrados: según tipo
   * Productos abiertos: divide a la mitad la caducidad normal

### CATEGORÍAS:
"Vegetables" | "Fruits" | "Dairy" | "Meat" | "Pantry" | "Spices" | "Frozen" | "Other"

### FORMATO (JSON estricto):
{
  "establecimiento": "Mi Despensa",
  "fecha": "${new Date().toISOString().split('T')[0]}",
  "total": 0,
  "productos": [
    {
      "nombre": "Nombre descriptivo del producto",
      "cantidad": 1,
      "unidad": "pcs" | "g" | "kg" | "l" | "ml" | "can" | "pack" | "jar" | "box",
      "precio_unitario": 0.00,
      "categoria_despensa": "Dairy",
      "dias_caducidad_estimados": 14
    }
  ]
}

Si la imagen no muestra una despensa o no hay productos identificables, devuelve:
{ "establecimiento": "Mi Despensa", "fecha": "${new Date().toISOString().split('T')[0]}", "total": 0, "productos": [] }

Responde ÚNICAMENTE con JSON válido.`;

        const result = await generateContentWithImage(prompt, base64Data, mimeType);
        const parsed = JSON.parse(cleanJSON(result));
        return parsed as ScannedData;
    } catch (e) {
        console.error('Pantry Vision Error:', e);
        return null;
    }
};

export const generateRecipesFromIngredients = async (
    ingredients: string[],
    language: string
): Promise<Recipe[]> => {
    try {
        const prompt = `Create 3 creative recipes using primarily these ingredients: ${ingredients.join(', ')}.
Return ONLY a JSON array of objects representing the recipes.
[
  {
    "name": "Recipe Name",
    "description": "Short description",
    "prepTime": 15,
    "cookTime": 30,
    "servings": 2,
    "difficulty": "Easy",
    "ingredients": [{"name": "item", "amount": 1, "unit": "g"}],
    "instructions": ["Step 1", "Step 2"]
  }
]
Language: ${language}`;
        const result = await generateContent(prompt);
        const recipes = JSON.parse(cleanJSON(result));
        return Array.isArray(recipes) ? recipes : [];
    } catch (e) {
        console.error("Chef AI Error:", e);
        return [];
    }
};

export const generateRecipesFromImage = async (
    base64Image: string,
    language: string
): Promise<Recipe[]> => {
    const compressedInput = await compressBase64Image(`data:image/jpeg;base64,${base64Image}`, 1024, 0.7);
    const base64Data = compressedInput.split(',')[1];

    try {
        const prompt = `Identify the food ingredients in this image and create 2 recipes you can make with them.
Return ONLY valid JSON array identical to the format from generateRecipesFromIngredients.
Language: ${language}`;
        const result = await generateContentWithImage(prompt, base64Data, 'image/jpeg');
        const recipes = JSON.parse(cleanJSON(result));
        return Array.isArray(recipes) ? recipes : [];
    } catch (e) {
        console.error("Chef AI Image Error:", e);
        return [];
    }
};

export const generateMealPlan = async (
    criteria: {
        startDate: string;
        days: number;
        diet: string;
        goal: string;
        difficulty: string;
        exclusions?: string;
        mealTypes?: string[];
        courses?: { lunch: number; dinner: number };
    },
    pantryItems: Ingredient[],
    language: 'ES' | 'EN' | 'FR'
): Promise<any> => {
    try {
        const prompt = `Generate a meal plan for ${criteria.days} days starting on ${criteria.startDate}.
Diet: ${criteria.diet}. Goal: ${criteria.goal}. Difficulty: ${criteria.difficulty}.
Available pantry items to prioritize: ${pantryItems.map(i => i.name).join(', ')}.
Return ONLY a valid JSON object showing the plan.
Language: ${language}`;
        const result = await generateContent(prompt);
        return JSON.parse(cleanJSON(result));
    } catch (e) {
        console.error("Meal Plan Gen Error:", e);
        return null;
    }
};

export const getRecipeDetails = async (recipeName: string, language: string): Promise<Partial<Recipe> | null> => {
    try {
        const prompt = `Provide detailed instructions, ingredients with exact measurements, prep time, cook time, and nutritional info for a recipe called "${recipeName}".
Return ONLY a valid JSON object representing the Recipe.
Language: ${language}`;
        const result = await generateContent(prompt);
        return JSON.parse(cleanJSON(result));
    } catch (e) {
        console.error("Recipe Hydration Error:", e);
        return null;
    }
};

export const analyzeLife = async (
    pantryItems: Ingredient[],
    mealPlans: any[],
    shoppingList: Ingredient[],
    trips: Trip[],
    language: 'ES' | 'EN' | 'FR'
): Promise<string> => {
    try {
        const context = JSON.stringify({ pantryItems, trips });
        const prompt = `Act as a life assistant. Analyze the user's pantry, trips, and plans.
Provide a short summary and 3 key recommendations in basic HTML (<ul><li>).
Language: ${language}
Context: ${context}`;
        const result = await generateContent(prompt);
        return result || "No response generated.";
    } catch (error) {
        console.error("Gemini API Error (Life):", error);
        return "Error conectando con la inteligencia artificial.";
    }
};
