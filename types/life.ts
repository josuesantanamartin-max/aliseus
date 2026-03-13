export interface Chore {
    id: string;
    title: string;
    reward: number;
    assignedTo: string;
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
    recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    icon: string;
}

export interface FamilyEvent {
    id: string;
    title: string;
    time: string;
    location?: string;
    type: 'MEDICAL' | 'EDUCATION' | 'SOCIAL' | 'SPORT' | 'OTHER';
}

export interface MealPlan {
    date: string; // ISO Date
    dayOfWeek: number;
    type: 'breakfast' | 'lunch' | 'dinner';
    recipeId: string;
    recipeName: string;
    servings: number;
    completed: boolean;
    courseType?: 'STARTER' | 'MAIN' | 'DESSERT' | 'SIDE' | 'DRINK';
    calories?: number;
    image?: string;
    // We might need ingredients for shopping list calculations if they are customized
    ingredients?: { name: string; quantity: number; unit: string }[];
    instructions?: string[];
}

export interface WeeklyPlan {
    id: string;
    weekStart: string;
    meals: MealPlan[];
}
