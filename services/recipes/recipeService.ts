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
        const isDemoMode = !authUser.user;
        
        if (isDemoMode) {
            console.warn('[RecipeService] No active session found. Saving recipe in Volatile/Local mode.');
        }

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
                    const cleanedResult = this.extractJson(result);
                    const parsed = JSON.parse(cleanedResult);
                    
                    // Apply translation
                    if (parsed.translatedName) finalRecipe.name = parsed.translatedName;
                    if (parsed.translatedIngredients) finalRecipe.ingredients = parsed.translatedIngredients;
                    if (parsed.translatedInstructions) finalRecipe.instructions = parsed.translatedInstructions;
                    
                    // Apply nutrition
                    if (parsed.nutrition) {
                        const caloriesNum = Number(parsed.nutrition.calories);
                        const proteinNum = Number(parsed.nutrition.protein);
                        const carbsNum = Number(parsed.nutrition.carbs);
                        const fatNum = Number(parsed.nutrition.fat);
                        
                        finalRecipe.calories = isNaN(caloriesNum) ? 0 : caloriesNum;
                        finalRecipe.macros = {
                            protein: isNaN(proteinNum) ? 0 : proteinNum,
                            carbs: isNaN(carbsNum) ? 0 : carbsNum,
                            fat: isNaN(fatNum) ? 0 : fatNum
                        };
                    }
                } catch (jsonErr) {
                    console.warn('[RecipeService] Could not parse translation/nutrition from Gemini:', jsonErr);
                    console.debug('[RecipeService] Raw Gemini result:', result);
                }
            } catch (aiErr: any) {
                if (aiErr.message?.includes('Failed to connect') || aiErr.message?.includes('404')) {
                    console.error('[RecipeService] AI Translation failed (404/Connection). If on Localhost, ensure you are running "vercel dev" instead of "npm run dev".');
                } else {
                    console.error('[RecipeService] Gemini Error:', aiErr);
                }
            }
        }

        // ── Database Persistence ──
        if (isDemoMode) {
            // Generate a temporary local ID and return (Skip Supabase)
            return {
                ...finalRecipe,
                id: crypto.randomUUID()
            };
        }

        // Insert into Supabase (Cloud Mode)
        const externalId = finalRecipe.id.startsWith('external_') ? finalRecipe.id : null;
        const sourceProvider = externalId ? this.provider.providerId : 'manual';

        const { data: insertedRecipe, error: recipeErr } = await supabase
            .from('user_recipes')
            .insert({
                user_id: authUser.user!.id,
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
                protein: Number(finalRecipe.macros?.protein) || 0,
                carbs: Number(finalRecipe.macros?.carbs) || 0,
                fat: Number(finalRecipe.macros?.fat) || 0,
            })
            .select()
            .single();

        if (recipeErr) {
            console.error('Supabase Recipe Insert Error Details:', {
                message: recipeErr.message,
                details: recipeErr.details,
                hint: recipeErr.hint,
                code: recipeErr.code
            });
            throw recipeErr;
        }

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

            if (ingErr) {
                console.error('Supabase Ingredients Insert Error Details:', ingErr);
                throw ingErr;
            }
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
    },

    /**
     * Helper to extract JSON from a string that might contain markdown blocks
     */
    extractJson(text: string): string {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? jsonMatch[0] : text;
    }
};
