
export const INGREDIENT_CATEGORY_MAP: Record<string, string> = {
    // Dairy
    'leche': 'Dairy', 'yogur': 'Dairy', 'queso': 'Dairy', 'mantequilla': 'Dairy', 'nata': 'Dairy',
    'huevos': 'Dairy', 'egg': 'Dairy', 'milk': 'Dairy', 'cheese': 'Dairy', 'yogurt': 'Dairy',
    'parmesano': 'Dairy', 'mozzarella': 'Dairy', 'cheddar': 'Dairy',

    // Vegetables
    'tomate': 'Vegetables', 'cebolla': 'Vegetables', 'ajo': 'Vegetables', 'zanahoria': 'Vegetables',
    'pimiento': 'Vegetables', 'lechuga': 'Vegetables', 'spinach': 'Vegetables', 'patata': 'Vegetables',
    'calabacin': 'Vegetables', 'berenjena': 'Vegetables', 'pepino': 'Vegetables', 'aguacate': 'Vegetables',
    'brócoli': 'Vegetables', 'coliflor': 'Vegetables', 'champiñones': 'Vegetables', 'setas': 'Vegetables',
    'cilantro': 'Vegetables', 'perejil': 'Vegetables', 'albahaca': 'Vegetables',

    // Fruits
    'manzana': 'Fruits', 'plátano': 'Fruits', 'naranja': 'Fruits', 'limón': 'Fruits', 'fresa': 'Fruits',
    'arándano': 'Fruits', 'uva': 'Fruits', 'pera': 'Fruits', 'piña': 'Fruits', 'kiwi': 'Fruits',
    'mango': 'Fruits', 'lima': 'Fruits',

    // Meat & Fish
    'pollo': 'Meat', 'ternera': 'Meat', 'cerdo': 'Meat', 'carne': 'Meat', 'bacon': 'Meat',
    'salmón': 'Meat', 'atún': 'Meat', 'merluza': 'Meat', 'gamba': 'Meat', 'pescado': 'Meat',
    'jamón': 'Meat', 'pavo': 'Meat', 'salchicha': 'Meat',

    // Pantry
    'arroz': 'Pantry', 'pasta': 'Pantry', 'pan': 'Pantry', 'harina': 'Pantry', 'azúcar': 'Pantry',
    'sal': 'Pantry', 'pimienta': 'Pantry', 'aceite': 'Pantry', 'vinagre': 'Pantry', 'lentejas': 'Pantry',
    'garbanzos': 'Pantry', 'judías': 'Pantry', 'cereales': 'Pantry', 'avena': 'Pantry', 'chocolate': 'Pantry',
    'café': 'Pantry', 'té': 'Pantry', 'miel': 'Pantry', 'frutos secos': 'Pantry', 'galletas': 'Pantry',
    'tomate frito': 'Pantry', 'salsa': 'Pantry', 'mayonesa': 'Pantry',

    // Frozen
    'hielo': 'Frozen', 'guisantes congelados': 'Frozen', 'helado': 'Frozen',

    // Spices
    'orégano': 'Spices', 'tomillo': 'Spices', 'romero': 'Spices', 'comino': 'Spices', 'pimentón': 'Spices',
    'canela': 'Spices', 'curry': 'Spices', 'jengibre': 'Spices',
};

export const getIngredientCategory = (name: string): string => {
    const lowerName = name.toLowerCase();

    // Check exact matches
    if (INGREDIENT_CATEGORY_MAP[lowerName]) {
        return INGREDIENT_CATEGORY_MAP[lowerName];
    }

    // Check partial matches or "ends with" (e.g. "Salsa de Soja" -> "Salsa")
    for (const [key, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
        if (lowerName.includes(key)) {
            return category;
        }
    }

    // Heuristics
    if (lowerName.includes('congelad')) return 'Frozen';
    if (lowerName.includes('helado')) return 'Frozen';
    if (lowerName.includes('salsa')) return 'Pantry';

    return 'Other'; // Default
};

/**
 * Calculates how many ingredients from a recipe are missing in the user's pantry.
 * Normalizes units (g/l to mass measurements if possible, or basic comparison).
 * @param recipeIngredients Ingredients required by the recipe
 * @param pantryItems Items currently in the pantry
 * @returns Object with missing count, total count, and a list of missing ingredient names
 */
export const calculateMissingIngredients = (
    recipeIngredients: { name: string; quantity: number; unit: string }[],
    pantryItems: { name: string; quantity: number; unit: string }[]
) => {
    // Helper to normalize to grams/ml for comparison
    const getNormalizedQuantity = (q: number, u: string) => {
        const unit = u.toLowerCase().trim();
        if (unit === 'kg') return q * 1000;
        if (unit === 'l') return q * 1000;
        return q;
    };

    const getNormalizedUnit = (u: string) => {
        const unit = u.toLowerCase().trim();
        if (unit === 'kg' || unit === 'g') return 'g';
        if (unit === 'l' || unit === 'ml') return 'ml';
        return unit;
    };

    let missingCount = 0;
    const missingItems: string[] = [];

    recipeIngredients.forEach(reqIng => {
        const normName = reqIng.name.toLowerCase().trim();
        const reqUnit = getNormalizedUnit(reqIng.unit);
        const reqQty = getNormalizedQuantity(reqIng.quantity, reqIng.unit);

        const pantryItem = pantryItems.find(p => p.name.toLowerCase().trim() === normName);

        if (!pantryItem) {
            missingCount++;
            missingItems.push(reqIng.name);
            return;
        }

        const panUnit = getNormalizedUnit(pantryItem.unit);
        if (panUnit !== reqUnit) {
            // Units don't match, assume missing for safety unless handled by complex conversion
            missingCount++;
            missingItems.push(reqIng.name);
            return;
        }

        const panQty = getNormalizedQuantity(pantryItem.quantity, pantryItem.unit);
        if (panQty < reqQty) {
            missingCount++;
            missingItems.push(reqIng.name);
        }
    });

    return {
        missingCount,
        totalCount: recipeIngredients.length,
        missingItems,
        hasAll: missingCount === 0
    };
};
