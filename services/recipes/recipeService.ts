import { supabase } from '../supabaseClient';
import { Recipe, RecipeIngredient } from '../../types';
import { IRecipeProvider } from './RecipeProvider';
import { TheMealDBProvider } from './providers/TheMealDBProvider';
import { generateContent } from '../geminiApiClient';

export const recipeService = {
    // Current active provider (can be swapped in the future)
    provider: new TheMealDBProvider() as IRecipeProvider,

    /**
     * Search recipes via the active external provider
     */
    async searchExternalRecipes(query: string): Promise<Recipe[]> {
        return this.provider.searchRecipes(query);
    },

    /**
     * Fetch user's saved recipes from Supabase
     */
    async getMyRecipes(): Promise<Recipe[]> {
        if (!supabase) throw new Error("Supabase internal error");
        
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];

        const { data: recipesData, error } = await supabase
            .from('user_recipes')
            .select(`
                *,
                ingredients:user_recipe_ingredients(*)
            `)
            .eq('user_id', user.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch recipes:', error);
            return [];
        }

        return recipesData.map(this.mapDbToRecipe);
    },

    /**
     * Save an external recipe (or newly created one) to the user's Supabase account.
     * Optionally queries Gemini to estimate calories/macros if missing.
     */
    async saveRecipeToBox(recipe: Recipe): Promise<Recipe> {
        if (!supabase) throw new Error("Supabase internal error");
        const { data: authUser } = await supabase.auth.getUser();
        if (!authUser.user) throw new Error("Debes iniciar sesión para guardar recetas.");

        const finalRecipe = { ...recipe };

        // ── AI Enrichment: Translation and Nutrition ──
        // Only if it's an external recipe (likely in English)
        const isExternal = finalRecipe.id.startsWith(`external_${this.provider.providerId}`);

        if (isExternal) {
            try {
                const prompt = `Estás procesando una receta llamada "${finalRecipe.name}".
                    Ingredientes: ${JSON.stringify(finalRecipe.ingredients)}
                    Instrucciones: ${JSON.stringify(finalRecipe.instructions)}

                    Tu tarea es:
                    1. Traducir el nombre, ingredientes e instrucciones íntegramente al ESPAÑOL.
                    2. Estimar el valor nutricional (calorías, proteína, carbohidratos, grasas) basándote en los ingredientes.

                    Devuelve exclusivamente un JSON estricto con esta estructura exacta:
                    {
                        "translatedName": "nombre en español",
                        "translatedIngredients": [{"name": "nombre ingrediente español", "quantity": numero, "unit": "unidad español"}],
                        "translatedInstructions": ["instrucción 1 en español", "instrucción 2..."],
                        "nutrition": {
                            "calories": numero,
                            "protein": numero,
                            "carbs": numero,
                            "fat": numero
                        }
                    }`;

                const result = await generateContent(
                    `SYSTEM: Eres un Chef de Aliseus experto en nutrición y traducción. Analiza la receta y devuelve JSON puro estricto. Sin bloques markdown.\n\nUSER: ${prompt}`
                );

                try {
                    const parsed = JSON.parse(result.replace(/```json/g, '').replace(/```/g, ''));
                    
                    // Apply translation
                    if (parsed.translatedName) finalRecipe.name = parsed.translatedName;
                    if (parsed.translatedIngredients) finalRecipe.ingredients = parsed.translatedIngredients;
                    if (parsed.translatedInstructions) finalRecipe.instructions = parsed.translatedInstructions;
                    
                    // Apply nutrition
                    if (parsed.nutrition) {
                        finalRecipe.calories = parsed.nutrition.calories || 0;
                        finalRecipe.macros = {
                            protein: parsed.nutrition.protein || 0,
                            carbs: parsed.nutrition.carbs || 0,
                            fat: parsed.nutrition.fat || 0
                        };
                    }
                } catch (jsonErr) {
                    console.warn('Could not parse translation/nutrition from Gemini:', jsonErr);
                }
            } catch (aiErr) {
                console.error('Failed to translate and enrich recipe with Gemini:', aiErr);
            }
        }

        // Insert into Supabase
        const externalId = finalRecipe.id.startsWith('external_') ? finalRecipe.id : null;
        const sourceProvider = externalId ? this.provider.providerId : 'manual';

        const { data: insertedRecipe, error: recipeErr } = await supabase
            .from('user_recipes')
            .insert({
                user_id: authUser.user.id,
                external_id: externalId,
                source_provider: sourceProvider,
                name: finalRecipe.name,
                image: finalRecipe.image,
                prep_time: finalRecipe.prepTime,
                calories: finalRecipe.calories,
                base_servings: finalRecipe.baseServings,
                course_type: finalRecipe.courseType,
                difficulty: finalRecipe.difficulty,
                tags: finalRecipe.tags,
                instructions: finalRecipe.instructions,
                protein: finalRecipe.macros?.protein || 0,
                carbs: finalRecipe.macros?.carbs || 0,
                fat: finalRecipe.macros?.fat || 0,
            })
            .select()
            .single();

        if (recipeErr) throw recipeErr;

        // Insert Ingredients
        if (finalRecipe.ingredients && finalRecipe.ingredients.length > 0) {
            const ingredientsData = finalRecipe.ingredients.map(ing => ({
                recipe_id: insertedRecipe.id,
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit
            }));

            const { error: ingErr } = await supabase
                .from('user_recipe_ingredients')
                .insert(ingredientsData);

            if (ingErr) throw ingErr;
        }

        // Return unified object
        return {
            ...finalRecipe,
            id: insertedRecipe.id
        };
    },

    deleteRecipe: async (id: string) => {
        if (!supabase) throw new Error("Supabase missing");
        // Due to CASCADE, ingredients are also deleted
        const { error } = await supabase.from('user_recipes').delete().eq('id', id);
        if (error) throw error;
    },

    mapDbToRecipe(dbRecord: any): Recipe {
        return {
            id: dbRecord.id,
            name: dbRecord.name,
            prepTime: dbRecord.prep_time,
            calories: dbRecord.calories,
            baseServings: dbRecord.base_servings,
            courseType: dbRecord.course_type,
            image: dbRecord.image,
            tags: dbRecord.tags || [],
            instructions: dbRecord.instructions || [],
            difficulty: dbRecord.difficulty,
            rating: dbRecord.rating,
            macros: {
                protein: dbRecord.protein,
                carbs: dbRecord.carbs,
                fat: dbRecord.fat,
            },
            ingredients: (dbRecord.ingredients || []).map((i: any) => ({
                name: i.name,
                quantity: i.quantity,
                unit: i.unit
            })),
            _missingInfo: undefined // Evaluated locally
        };
    }
};
