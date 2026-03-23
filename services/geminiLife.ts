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

export const parseReceiptImage = async (base64Image: string): Promise<Partial<Ingredient>[]> => {
    const compressedInput = await compressBase64Image(base64Image, 800, 0.5);
    if (!compressedInput) return [];
    const base64Data = compressedInput.includes(',') ? compressedInput.split(',')[1] : compressedInput;

    try {
        const prompt = `Analyze this grocery receipt image. Extract all purchased food items.
Return ONLY a valid JSON array of objects:
[
  {
    "name": "Item name",
    "category": "Produce" | "Meat" | "Dairy" | "Pantry" | "Other",
    "quantity": 1,
    "unit": "pieces" | "g" | "kg" | "L" | "ml"
  }
]`;
        const result = await generateContentWithImage(prompt, base64Data, 'image/jpeg');
        return JSON.parse(cleanJSON(result));
    } catch (e) {
        console.error("Receipt Parsing Error:", e);
        return [];
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
