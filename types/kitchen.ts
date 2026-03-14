export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'cda' | 'cdta' | 'pizca' | 'manojo' | 'rebanada' | 'loncha' | 'dientes' | string;
    category: 'Vegetables' | 'Fruits' | 'Dairy' | 'Meat' | 'Pantry' | 'Spices' | 'Frozen' | 'Other';
    expiryDate?: string;
    lowStockThreshold?: number;
}

export interface RecipeIngredient {
    name: string;
    quantity: number;
    unit: string;
}

export interface Recipe {
    id: string;
    name: string;
    prepTime: number;
    cookTime?: number;
    calories: number;
    tags: string[];
    rating: number;
    baseServings: number;
    image?: string;
    courseType?: 'STARTER' | 'MAIN' | 'DESSERT' | 'SIDE' | 'DRINK';
    ingredients: RecipeIngredient[];
    instructions: string[];
    timesUsed?: number;
    difficulty?: 'Fácil' | 'Media' | 'Difícil';
    macros?: {
        protein: number;
        carbs: number;
        fat: number;
    };
    _missingInfo?: {
        hasAll: boolean;
        missingCount: number;
    };
}

export interface ShoppingItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
    category?: string;
    source?: {
        type: 'MANUAL' | 'RECIPE' | 'SMART_PLAN';
        recipeName?: string;
        recipeBreakdown?: Record<string, number>;
    };
    estimatedPrice?: number; // Precio estimado por unidad en EUR
}

export type MealTime = 'breakfast' | 'lunch' | 'dinner';

export type WeeklyPlanState = Record<string, {
    breakfast: Recipe[];
    lunch: Recipe[];
    dinner: Recipe[];
}>;

// Kitchen Dashboard Widgets
export type KitchenWidgetType = 'STATS_ROW' | 'TODAY_MENU_CARD' | 'SHOPPING_LIST_CARD' | 'FRESHNESS_ALERTS';
