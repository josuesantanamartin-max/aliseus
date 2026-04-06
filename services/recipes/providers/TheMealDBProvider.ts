import { Recipe, RecipeIngredient } from '../../../types';
import { IRecipeProvider } from '../RecipeProvider';

export class TheMealDBProvider implements IRecipeProvider {
    readonly providerId = 'themealdb';
    private baseUrl = 'https://www.themealdb.com/api/json/v1/1';

    async searchRecipes(query: string): Promise<Recipe[]> {
        try {
            const res = await fetch(`${this.baseUrl}/search.php?s=${encodeURIComponent(query)}`);
            const data = await res.json();
            return this.mapMealsToRecipes(data.meals || []);
        } catch (e) {
            console.error('Error searching TheMealDB:', e);
            return [];
        }
    }

    async getRecipeDetails(externalId: string): Promise<Recipe | null> {
        try {
            const res = await fetch(`${this.baseUrl}/lookup.php?i=${externalId}`);
            const data = await res.json();
            const recipes = this.mapMealsToRecipes(data.meals || []);
            return recipes.length > 0 ? recipes[0] : null;
        } catch (e) {
            console.error('Error fetching recipe details:', e);
            return null;
        }
    }

    async getRandomRecipes(limit: number): Promise<Recipe[]> {
        // TheMealDB only returns 1 random recipe per call. 
        // We do multiple calls to gather `limit` recipes.
        const promises = Array.from({ length: limit }).map(() => fetch(`${this.baseUrl}/random.php`).then(res => res.json()));
        try {
            const results = await Promise.all(promises);
            const meals = results.map(r => r.meals?.[0]).filter(Boolean);
            return this.mapMealsToRecipes(meals);
        } catch (e) {
            console.error('Error fetching random recipes:', e);
            return [];
        }
    }

    private mapMealsToRecipes(meals: any[]): Recipe[] {
        return meals.map(meal => {
            const ingredients: RecipeIngredient[] = [];
            
            // TheMealDB has max 20 ingredients
            for (let i = 1; i <= 20; i++) {
                const ingredientName = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                
                if (ingredientName && ingredientName.trim() !== '') {
                    // Extract basic quantity if possible, or just default to 1 and put the measure in 'unit'
                    const parsed = this.parseMeasure(measure);
                    ingredients.push({
                        name: ingredientName.trim(),
                        quantity: parsed.quantity,
                        unit: parsed.unit
                    });
                }
            }

            const instructionsStr = meal.strInstructions || '';
            // Split by newlines or sentences to create steps
            const instructions = instructionsStr
                .split(/\r?\n/)
                .filter((s: string) => s.trim().length > 0);

            // Establish course type based on category
            const courseType = this.mapCategoryToCourse(meal.strCategory);

            return {
                id: `external_${this.providerId}_${meal.idMeal}`,
                name: meal.strMeal,
                prepTime: 30, // Default MVP
                calories: 0, // Default MVP, to be enhanced by Gemini
                tags: [meal.strCategory, meal.strArea].filter(Boolean),
                rating: 0,
                baseServings: 2, // Default
                image: meal.strMealThumb,
                courseType,
                ingredients,
                instructions,
                difficulty: 'Media'
            } as Recipe;
        });
    }

    private parseMeasure(measure: string): { quantity: number; unit: string } {
        if (!measure || measure.trim() === '') return { quantity: 1, unit: 'pcs' };
        
        const trimmed = measure.trim();
        // Regex to extract a number (supports fractions roughly, but we just parse parseFloat)
        const match = trimmed.match(/^([\d.,\s\/]+)(.*)$/);
        
        if (match) {
            let qtyStr = match[1].trim();
            // Handle simple fractions like "1/2" -> 0.5
            if (qtyStr.includes('/')) {
                const [num, den] = qtyStr.split('/');
                if (num && den && !isNaN(Number(num)) && !isNaN(Number(den))) {
                    qtyStr = (Number(num) / Number(den)).toString();
                }
            }
            const num = parseFloat(qtyStr);
            const unit = match[2].trim() || 'pcs';
            return {
                quantity: isNaN(num) ? 1 : num,
                unit: unit.toLowerCase()
            };
        }

        return { quantity: 1, unit: trimmed.toLowerCase() };
    }

    private mapCategoryToCourse(category: string): 'STARTER' | 'MAIN' | 'DESSERT' | 'SIDE' | 'DRINK' {
        const cat = (category || '').toLowerCase();
        if (cat.includes('dessert')) return 'DESSERT';
        if (cat.includes('starter')) return 'STARTER';
        if (cat.includes('side')) return 'SIDE';
        if (cat.includes('drink')) return 'DRINK';
        return 'MAIN';
    }
}
