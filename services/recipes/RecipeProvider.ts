import { Recipe } from '../../types';

export interface IRecipeProvider {
    /**
     * Provider identifier e.g., 'themealdb', 'spoonacular'
     */
    readonly providerId: string;

    /**
     * Search recipes by query
     */
    searchRecipes(query: string): Promise<Recipe[]>;

    /**
     * Get details of a single recipe by its external ID
     */
    getRecipeDetails(externalId: string): Promise<Recipe | null>;

    /**
     * Get random recipes
     */
    getRandomRecipes(limit: number): Promise<Recipe[]>;
}
