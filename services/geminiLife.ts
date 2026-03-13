import { supabase } from './supabaseClient';
import { Ingredient, Trip, Recipe } from '../types';
import { compressBase64Image } from './geminiCore';

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
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'extractTravelParams', params: { userInput, language } }
        });
        if (error) throw error;
        return data.result;
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
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'planTripWithAI', params: { userInput, realFlights, realAccommodations, language } }
        });
        if (error) throw error;
        return data.result;
    } catch (e) {
        console.error("Trip Planning Synthesis Error:", e);
        return null;
    }
};

export const parseReceiptImage = async (base64Image: string): Promise<Partial<Ingredient>[]> => {
    const compressedInput = await compressBase64Image(base64Image, 800, 0.5);
    if (!compressedInput) return [];
    const base64Data = compressedInput.split(',')[1];

    try {
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'parseReceiptImage', params: { base64Data } }
        });
        if (error) throw error;
        return data.result || [];
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
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'generateRecipesFromIngredients', params: { ingredients, language } }
        });
        if (error) throw error;
        return data.result || [];
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
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'generateRecipesFromImage', params: { base64Data, language } }
        });
        if (error) throw error;
        return data.result || [];
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
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'generateMealPlan', params: { criteria, pantryItems, language } }
        });
        if (error) throw error;
        return data.result;
    } catch (e) {
        console.error("Meal Plan Gen Error:", e);
        return null;
    }
};

export const getRecipeDetails = async (recipeName: string, language: string): Promise<Partial<Recipe> | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'getRecipeDetails', params: { recipeName, language } }
        });
        if (error) throw error;
        return data.result;
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
        const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
            body: { action: 'analyzeLife', params: { pantryItems, mealPlans, shoppingList, trips, language } }
        });
        if (error) throw error;
        return data.result || "No response generated.";
    } catch (error) {
        console.error("Gemini Edge Function Error (Life):", error);
        return "Error conectando con la inteligencia artificial.";
    }
};
