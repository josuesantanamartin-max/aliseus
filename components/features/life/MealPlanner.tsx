import React, { useState } from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { useUserStore } from '@/store/useUserStore';
import { WeeklyPlanState, MealTime, Recipe, Ingredient, RecipeIngredient, Language } from '@/types';
import { ChevronLeft, ChevronRight, Wand2, Coffee, Sunset, Moon, X, Loader2, BookOpen, GripVertical, Search, ChefHat, MoreHorizontal, Plus, Copy, Trash2, ClipboardPaste, Clipboard, MoreVertical, PlusCircle, Calendar, LayoutGrid, List, ShoppingCart, Flame, Sparkles } from 'lucide-react';
import { generateImage } from '@/services/geminiCore';
import { generateMealPlan, getRecipeDetails } from '@/services/geminiLife';
import { getIngredientCategory } from '@/utils/foodUtils';
import { QuickAddModal } from './meal-planner/QuickAddModal';
import { RecipeSidebar } from './meal-planner/RecipeSidebar';
import { AiPlannerModal } from './meal-planner/AiPlannerModal';
import { MealPlannerHeader } from './meal-planner/MealPlannerHeader';

interface MealPlannerProps {
    onOpenRecipe: (recipe: Recipe) => void;
}

const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";



const COURSE_LABELS: Record<string, string> = {
    'STARTER': '1er Plato',
    'MAIN': '2º Plato',
    'DESSERT': 'Postre',
    'SIDE': 'Acomp.',
    'DRINK': 'Bebida'
};

const COURSE_ORDER = ['STARTER', 'MAIN', 'SIDE', 'DESSERT', 'DRINK'];

type ViewMode = 'week' | 'biweek' | 'month';

const generatePlanDates = (startDate: Date, mode: ViewMode): Date[] => {
    const start = new Date(startDate);
    const day = start.getDay();
    // Monday as start of week
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    // For month view, start from the 1st of the month based on the input date
    if (mode === 'month') {
        const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const firstDayOfWeek = firstDay.getDay();
        const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon=0, Sun=6
        start.setTime(firstDay.getTime() - (offset * 24 * 60 * 60 * 1000));
    }

    const count = mode === 'week' ? 7 : mode === 'biweek' ? 14 : 35; // 5 weeks for month view
    const range = [];
    for (let i = 0; i < count; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        range.push(d);
    }
    return range;
};

export const MealPlanner: React.FC<MealPlannerProps> = ({ onOpenRecipe }) => {

    const { weeklyPlans, setWeeklyPlans, recipes, setRecipes, pantryItems, shoppingList, setShoppingList, isSmartPlannerOpen, setIsSmartPlannerOpen } = useLifeStore();
    const { language } = useUserStore();

    // Adapter: Convert Array to Map for backward compatibility within this component
    const weeklyPlan = React.useMemo(() => {
        const map: WeeklyPlanState = {};
        weeklyPlans.forEach((plan: { meals: any[] }) => {
            plan.meals.forEach((meal: { date: string; recipeId: string; recipeName: string; servings: number; calories: number; image: string; ingredients: any[]; instructions: any[]; type: MealTime; courseType: 'STARTER' | 'MAIN' | 'DESSERT' | 'SIDE' | 'DRINK'; }) => {
                const date = meal.date;
                if (!map[date]) map[date] = { breakfast: [], lunch: [], dinner: [] };

                const recipeItem: Recipe = {
                    id: meal.recipeId,
                    name: meal.recipeName,
                    baseServings: meal.servings,
                    prepTime: 30,
                    calories: meal.calories || 0,
                    image: meal.image,
                    ingredients: meal.ingredients || [],
                    instructions: meal.instructions || [],
                    tags: [],
                    rating: 0,
                    courseType: meal.courseType,
                };
                map[date][meal.type].push(recipeItem);
            });
        });
        return map;
    }, [weeklyPlans]);

    // Adapter for setWeeklyPlan to maintain backward compatibility with component logic
    const setWeeklyPlan = (updater: WeeklyPlanState | ((prev: WeeklyPlanState) => WeeklyPlanState)) => {
        const currentMap = weeklyPlan;
        const newMap = typeof updater === 'function' ? updater(currentMap) : updater;

        // Convert to array
        const newPlans = [...weeklyPlans]; // Start with current state to preserve IDs

        // Helper to get plan for date
        const getPlanIndex = (date: string) => {
            const targetDate = new Date(date);
            const day = targetDate.getDay();
            const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
            const weekStart = new Date(targetDate.setDate(diff)).toISOString().split('T')[0];
            let idx = newPlans.findIndex(p => p.weekStart === weekStart);
            if (idx === -1) {
                newPlans.push({ id: Math.random().toString(36).substr(2, 9), weekStart, meals: [] });
                idx = newPlans.length - 1;
            }
            return idx;
        };

        (Object.entries(newMap) as [string, { breakfast: Recipe[], lunch: Recipe[], dinner: Recipe[] }][]).forEach(([date, dayPlan]) => {
            const idx = getPlanIndex(date);
            const plan = newPlans[idx];

            // Remove old meals for this date from the plan
            plan.meals = plan.meals.filter((m: { date: string }) => m.date !== date);

            // Add new meals
            (['breakfast', 'lunch', 'dinner'] as const).forEach(type => {
                if (dayPlan[type]) {
                    dayPlan[type].forEach((recipe: Recipe, i: number) => {
                        const dayOfWeek = new Date(date).getDay();
                        plan.meals.push({
                            date,
                            dayOfWeek,
                            type,
                            recipeId: recipe.id,
                            recipeName: recipe.name,
                            servings: recipe.baseServings || 2,
                            completed: (recipe as any).completed || false, // Assuming completed might be on Recipe type
                            courseType: recipe.courseType || 'MAIN',
                            calories: recipe.calories,
                            image: recipe.image,
                            ingredients: recipe.ingredients || [],
                            instructions: recipe.instructions || []
                        });
                    });
                }
            });
        });

        setWeeklyPlans(newPlans);
    };

    const [plannerDate, setPlannerDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
    const [isRecipeDrawerOpen, setIsRecipeDrawerOpen] = useState(false);
    const [isSmartOptimizing, setIsSmartOptimizing] = useState(false);
    const [recipeSearch, setRecipeSearch] = useState('');

    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiStatus, setAiStatus] = useState('');
    const [aiCriteria, setAiCriteria] = useState({
        days: 7, diet: 'Omnivore', goal: 'Balanced', difficulty: 'Any', exclusions: ''
    });
    const [aiMealTypes, setAiMealTypes] = useState({ breakfast: true, lunch: true, dinner: true });
    // Default courses per meal
    const [aiCourses, setAiCourses] = useState({ lunch: 2, dinner: 1 });
    const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [openDayMenuId, setOpenDayMenuId] = useState<string | null>(null); // New state for day menu
    const [copiedDay, setCopiedDay] = useState<{ plan: any, date: string } | null>(null);
    const [draggingItem, setDraggingItem] = useState<{ date: string, meal: MealTime, index: number } | null>(null);
    const [quickAddTarget, setQuickAddTarget] = useState<{ date: string, meal: MealTime } | null>(null);
    const [quickAddSearch, setQuickAddSearch] = useState('');
    const [dragOverSlot, setDragOverSlot] = useState<{ date: string; meal: MealTime } | null>(null);

    const days = generatePlanDates(plannerDate, viewMode);

    // --- SMART PLANNER ORCHESTRATION ---
    React.useEffect(() => {
        if (isSmartPlannerOpen) {
            const lowFreshness = pantryItems.filter((i: Ingredient) => {
                if (!i.expiryDate) return false;
                const days = (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                return days < 7; // Configured to 7 days for better zero-waste planning window
            });

            if (lowFreshness.length > 0) {
                setIsSmartOptimizing(true);
            } else {
                setIsSmartOptimizing(false);
            }
            
            setIsAiMenuOpen(true);
            setIsSmartPlannerOpen(false); // Reset immediately so it doesn't get stuck
        }
    }, [isSmartPlannerOpen, pantryItems, setIsSmartPlannerOpen]);

    // --- AUTO-SYNC SHOPPING LIST ---
    React.useEffect(() => {
        // Automatically sync shopping list whenever plan or pantry changes
        // Filter the plan to only include days currently in view (or entire plan?)
        // User said: "al añadir cualquier receta al Plan... al quitar la receta"
        // It's probably safer to sync ONLY the visible range if we want it to feel snappy,
        // but if they plan ahead, they want those things in the list too.
        // However, standard use case is usually the visible week. 
        // Let's use the visible days to stay focused.

        const visiblePlan: WeeklyPlanState = {};
        days.forEach((date: Date) => {
            const dateKey = date.toISOString().split('T')[0];
            if (weeklyPlan[dateKey]) {
                visiblePlan[dateKey] = weeklyPlan[dateKey];
            }
        });

        const neededItems = recalculateShoppingList(visiblePlan);

        setShoppingList((prev: any[]) => {
            const manualItems = prev.filter(item => item.source?.type !== 'SMART_PLAN');
            const oldSmartItems = prev.filter(item => item.source?.type === 'SMART_PLAN');

            const finalSmartItems = neededItems.map(newItem => {
                const existing = oldSmartItems.find(old =>
                    old.name.toLowerCase().trim() === newItem.name.toLowerCase().trim() &&
                    old.unit === newItem.unit
                );
                // Preserve checked status and ID if item still exists
                return existing ? { ...newItem, checked: existing.checked, id: existing.id } : newItem;
            });

            // Basic optimization: if the combined list is identical to prev, don't update
            const nextList = [...manualItems, ...finalSmartItems];
            if (JSON.stringify(prev) === JSON.stringify(nextList)) return prev;

            return nextList;
        });
    }, [weeklyPlans, pantryItems, plannerDate, viewMode]);


    // --- SMART SHOPPING LIST LOGIC ---
    const recalculateShoppingList = (currentPlan: WeeklyPlanState) => {
        // 1. Calculate TOTAL needed in the entire plan, tracking source recipes and their individual amounts
        const planTotals: Record<string, {
            quantity: number;
            unit: string;
            recipeBreakdown: Record<string, number>
        }> = {};

        // Helper to normalize to grams/ml
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

        // Aggregate all ingredients from the plan
        (Object.values(currentPlan) as { breakfast: Recipe[], lunch: Recipe[], dinner: Recipe[] }[]).forEach((day) => {
            (['breakfast', 'lunch', 'dinner'] as MealTime[]).forEach((meal: MealTime) => {
                day[meal]?.forEach((r: Recipe) => {
                    r.ingredients?.forEach((ing: RecipeIngredient) => {
                        const normName = ing.name.toLowerCase().trim();
                        const normUnit = getNormalizedUnit(ing.unit);
                        const normQty = getNormalizedQuantity(ing.quantity, ing.unit);

                        if (!planTotals[normName]) {
                            planTotals[normName] = { quantity: 0, unit: normUnit, recipeBreakdown: {} };
                        }

                        // Only add if units are compatible (basic check)
                        if (planTotals[normName].unit === normUnit) {
                            planTotals[normName].quantity += normQty;
                            // Add to breakdown for this specific recipe
                            const currentRecipeQty = planTotals[normName].recipeBreakdown[r.name] || 0;
                            planTotals[normName].recipeBreakdown[r.name] = currentRecipeQty + normQty;
                        }
                    });
                });
            });
        });

        // 2. Generate New List based on Plan - Pantry
        const newSmartItems: any[] = [];

        Object.entries(planTotals).forEach(([name, data]) => {
            // Check Pantry
            const pantryItem = pantryItems.find((p: Ingredient) => p.name.toLowerCase().trim() === name);
            let stock = 0;
            if (pantryItem && getNormalizedUnit(pantryItem.unit) === data.unit) {
                stock = getNormalizedQuantity(pantryItem.quantity, pantryItem.unit);
            }

            // Distribute stock across recipes to see what's really missing per recipe
            const activeBreakdown: Record<string, number> = {};
            let totalMissing = 0;

            // Sort recipes to have a deterministic order (could be by date later)
            const sortedRecipeNames = Object.keys(data.recipeBreakdown).sort();

            sortedRecipeNames.forEach(recipeName => {
                const neededForRecipe = data.recipeBreakdown[recipeName];
                if (stock >= neededForRecipe) {
                    // Fully covered by pantry
                    stock -= neededForRecipe;
                } else {
                    // Partially or not covered
                    const stillNeeded = neededForRecipe - stock;
                    activeBreakdown[recipeName] = parseFloat(stillNeeded.toFixed(2));
                    totalMissing += stillNeeded;
                    stock = 0;
                }
            });

            if (totalMissing > 0) {
                const recipeNames = Object.keys(activeBreakdown).join(', ');
                const category = getIngredientCategory(name);

                newSmartItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
                    quantity: parseFloat(totalMissing.toFixed(2)),
                    unit: data.unit,
                    checked: false,
                    category: category,
                    source: {
                        type: 'SMART_PLAN',
                        recipeName: recipeNames,
                        recipeBreakdown: activeBreakdown // Use the reduced breakdown
                    }
                });
            }
        });

        // 3. Update Store
        return newSmartItems;
    };

    // Legacy helper kept for drag-and-drop auto-updates, but now we prefer manual button
    const legacyRecalculate = (currentPlan: WeeklyPlanState) => {
        // This is a no-op for now as we want manual confirmation
    };

    // --- UX HELPERS ---
    const handleClearPlan = () => {
        const confirmMsg = language === 'ES'
            ? '¿Estás seguro de que quieres limpiar todas las recetas de los días visibles?'
            : 'Are you sure you want to clear all recipes from the visible days?';

        if (!window.confirm(confirmMsg)) return;

        setWeeklyPlan((prev: WeeklyPlanState) => {
            const nextPlan = { ...prev };
            days.forEach((date: Date) => {
                const dateKey = date.toISOString().split('T')[0];
                nextPlan[dateKey] = { breakfast: [], lunch: [], dinner: [] };
            });
            return nextPlan;
        });
    };

    const handleCopyDay = (dateKey: string) => {
        const dayPlan = weeklyPlan[dateKey];
        if (dayPlan) {
            setCopiedDay({ plan: dayPlan, date: dateKey });
            setOpenDayMenuId(null);
        }
    };

    const handlePasteDay = (targetDateKey: string) => {
        if (!copiedDay) return;
        setWeeklyPlan((prev: WeeklyPlanState) => {
            const newPlan = {
                ...prev,
                [targetDateKey]: JSON.parse(JSON.stringify(copiedDay.plan)) // Deep copy
            };
            return newPlan;
        });
        setCopiedDay(null);
        setOpenDayMenuId(null);
    };

    const handleClearDay = (dateKey: string) => {
        if (window.confirm('¿Borrar todo el plan de este día?')) {
            setWeeklyPlan((prev: WeeklyPlanState) => {
                const newPlan = { ...prev };
                delete newPlan[dateKey];
                return newPlan;
            });
        }
        setOpenDayMenuId(null);
    };

    const handleQuickAddRecipe = (recipe: Recipe) => {
        if (!quickAddTarget) return;
        const { date, meal } = quickAddTarget;

        setWeeklyPlan((prev: WeeklyPlanState) => {
            const newPlan = { ...prev };
            if (!newPlan[date]) newPlan[date] = { breakfast: [], lunch: [], dinner: [] };

            const newRecipe = { ...recipe, id: Math.random().toString(36).substr(2, 9) };
            // Auto-course logic
            if (meal !== 'breakfast') {
                const existing = newPlan[date][meal] || [];
                const hasStarter = existing.some((r: Recipe) => r.courseType === 'STARTER');
                newRecipe.courseType = hasStarter ? 'MAIN' : 'STARTER';
            } else {
                newRecipe.courseType = 'MAIN';
            }

            newPlan[date] = {
                ...newPlan[date],
                [meal]: [...(newPlan[date][meal] || []), newRecipe]
            };

            return newPlan;
        });

        setQuickAddTarget(null);
        setQuickAddSearch('');
    };

    const handlePrevPlanner = () => {
        const newDate = new Date(plannerDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (viewMode === 'biweek') newDate.setDate(newDate.getDate() - 14);
        else newDate.setDate(newDate.getDate() - 7);
        setPlannerDate(newDate);
    };

    const handleNextPlanner = () => {
        const newDate = new Date(plannerDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (viewMode === 'biweek') newDate.setDate(newDate.getDate() + 14);
        else newDate.setDate(newDate.getDate() + 7);
        setPlannerDate(newDate);
    };

    const handleDragStart = (e: React.DragEvent, recipe: Recipe, origin?: { date: string, meal: MealTime, index: number }) => {
        const data = JSON.stringify({ recipe, origin });
        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.effectAllowed = origin ? 'move' : 'copy';

        if (origin) {
            setDraggingItem(origin);
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggingItem(null);
    };

    const handleDragOver = (e: React.DragEvent, targetDate: string, targetMeal: MealTime) => {
        e.preventDefault();

        // Determine drop effect
        const isFromPlanner = !!draggingItem;
        e.dataTransfer.dropEffect = isFromPlanner ? 'move' : 'copy';

        setDragOverSlot(prev =>
            prev?.date === targetDate && prev?.meal === targetMeal ? prev : { date: targetDate, meal: targetMeal }
        );
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if actually leaving the slot (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverSlot(null);
        }
    };

    const handleDrop = (e: React.DragEvent, targetDateKey: string, targetMeal: MealTime) => {
        e.preventDefault();
        setDragOverSlot(null);
        setDraggingItem(null);

        const data = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const { recipe, origin } = JSON.parse(data);

            setWeeklyPlan((prev: WeeklyPlanState) => {
                const newPlan = { ...prev };
                if (origin) {
                    const oldDay = newPlan[origin.date];
                    if (oldDay && oldDay[origin.meal as MealTime]) {
                        const newList = [...oldDay[origin.meal as MealTime]];
                        newList.splice(origin.index, 1);
                        newPlan[origin.date] = { ...oldDay, [origin.meal]: newList };
                    }
                }

                if (!newPlan[targetDateKey]) {
                    newPlan[targetDateKey] = { breakfast: [], lunch: [], dinner: [] };
                }
                const targetDay = newPlan[targetDateKey];

                const recipeToAdd = origin ? recipe : { ...recipe, id: Math.random().toString(36).substr(2, 9) };

                if (!recipeToAdd.courseType && targetMeal !== 'breakfast') {
                    const existing = targetDay[targetMeal] || [];
                    const hasStarter = existing.some((r: Recipe) => r.courseType === 'STARTER');
                    recipeToAdd.courseType = hasStarter ? 'MAIN' : 'STARTER';
                } else if (!recipeToAdd.courseType) {
                    recipeToAdd.courseType = 'MAIN';
                }

                targetDay[targetMeal] = [...(targetDay[targetMeal] || []), recipeToAdd];
                newPlan[targetDateKey] = targetDay;

                return newPlan;
            });

        } catch (error) {
            console.error("Error processing drop:", error);
        }
    };

    const updateCourseType = (dateKey: string, mealTime: MealTime, index: number, newType: NonNullable<Recipe['courseType']>) => {
        setWeeklyPlan((prev: WeeklyPlanState) => {
            const day = prev[dateKey];
            if (!day) return prev;
            const newList = [...day[mealTime]];
            if (newList[index]) {
                newList[index] = { ...newList[index], courseType: newType };
            }
            return { ...prev, [dateKey]: { ...day, [mealTime]: newList } };
        });
    };

    const handleGenerateMenu = async () => {
        setAiGenerating(true);
        setAiStatus('Diseñando menú...');

        const startDate = new Date().toISOString().split('T')[0];
        try {
            const lowFreshness = pantryItems.filter((i: Ingredient) => {
                if (!i.expiryDate) return false;
                const days = (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                return days < 7;
            });

            const smartGoal = isSmartOptimizing && lowFreshness.length > 0
                ? `${aiCriteria.goal}. IMPORTANTE: MENÚ ZERO WASTE. DEBES PRIORIZAR Y BASAR ESTRICTAMENTE tus recetas en estos ingredientes que caducan pronto para evitar desperdiciarlos: ${lowFreshness.map(i => i.name).join(', ')}. Evita añadir demasiados ingredientes nuevos si no son necesarios.`
                : aiCriteria.goal;

            const result: any = await generateMealPlan({
                startDate,
                days: aiCriteria.days,
                diet: aiCriteria.diet,
                goal: smartGoal,
                difficulty: aiCriteria.difficulty,
                exclusions: aiCriteria.exclusions,
                mealTypes: Object.keys(aiMealTypes).filter(k => aiMealTypes[k as keyof typeof aiMealTypes]),
                courses: aiCourses
            }, pantryItems, language as any);

            if (result) {
                setAiStatus('Finalizando...');
                // Generate images for all recipes in background/parallel to avoid blocking UI too long
                // But since we removed delay, we can try to do it effectively. 
                // However, doing 20 awaits might still tick.
                // Better approach: Assign them async or just construct since it's fast now.

                const processRecipes = async () => {
                    const dates = Object.keys(result);
                    const initialPlanUpdate: WeeklyPlanState = {};
                    const allNewRecipes: Recipe[] = [];

                    // 1. Create immediate plan with ingredients (for shopping list) but no instructions
                    for (const date of dates) {
                        const dayPlan = result[date];
                        if (!dayPlan) continue;

                        const createSkeletonList = (list: any[]) => {
                            return (Array.isArray(list) ? list : []).map((r: Recipe) => {
                                const recipe: Recipe = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: r.name,
                                    calories: r.calories || 0,
                                    prepTime: r.prepTime || 30,
                                    baseServings: 2,
                                    ingredients: r.ingredients || [],
                                    instructions: [], // Empty for now
                                    tags: ['Generado por IA'],
                                    image: undefined,
                                    rating: 0,
                                    courseType: r.courseType || 'MAIN'
                                };
                                allNewRecipes.push(recipe);
                                return recipe;
                            });
                        };

                        initialPlanUpdate[date] = {
                            breakfast: createSkeletonList(dayPlan.breakfast),
                            lunch: createSkeletonList(dayPlan.lunch),
                            dinner: createSkeletonList(dayPlan.dinner),
                        };
                    }

                    // 2. Update state immediately
                    setRecipes((prev: Recipe[]) => [...prev, ...allNewRecipes]);
                    setWeeklyPlan((prev: WeeklyPlanState) => ({ ...prev, ...initialPlanUpdate }));

                    setIsAiMenuOpen(false);
                    setAiGenerating(false);
                    setAiStatus('');

                    // 3. Background Image & Instruction Hydration
                    const CHUNK_SIZE = 4;
                    for (let i = 0; i < allNewRecipes.length; i += CHUNK_SIZE) {
                        const chunk = allNewRecipes.slice(i, i + CHUNK_SIZE);
                        await Promise.all(chunk.map(async (recipe) => {
                            try {
                                const [imgRes, detailsRes] = await Promise.all([
                                    generateImage(recipe.name, "4:3", 'food'),
                                    getRecipeDetails(recipe.name, language as any)
                                ]);

                                const updates = {
                                    image: imgRes.imageUrl || undefined,
                                    instructions: detailsRes?.instructions || [],
                                    ingredients: detailsRes?.ingredients?.length ? detailsRes.ingredients : recipe.ingredients
                                };

                                // Update global recipes list
                                setRecipes((prev: Recipe[]) =>
                                    prev.map(r => r.id === recipe.id ? { ...r, ...updates } : r)
                                );

                                // Update weekly plan
                                setWeeklyPlan((prev: WeeklyPlanState) => {
                                    const nextPlan = { ...prev };
                                    let found = false;
                                    Object.keys(nextPlan).forEach(d => {
                                        (['breakfast', 'lunch', 'dinner'] as const).forEach(m => {
                                            if (nextPlan[d] && nextPlan[d][m]) {
                                                const idx = nextPlan[d][m].findIndex(r => r.id === recipe.id);
                                                if (idx !== -1) {
                                                    const newList = [...nextPlan[d][m]];
                                                    newList[idx] = { ...newList[idx], ...updates };
                                                    nextPlan[d] = { ...nextPlan[d], [m]: newList };
                                                    found = true;
                                                }
                                            }
                                        });
                                    });
                                    return found ? { ...nextPlan } : prev;
                                });
                            } catch (e) {
                                console.error(`Failed to hydrate ${recipe.name}:`, e);
                            }
                        }));
                    }
                };

                processRecipes();

            } else {
                alert("Error generando el plan.");
                setAiGenerating(false);
                setAiStatus('');
            }
        } catch (err) {
            console.error("Meal Generation Error:", err);
            alert("Error generando el plan.");
            setAiGenerating(false);
            setAiStatus('');
        }
    };


    const handleRecipeClick = async (recipe: Recipe) => {
        let updatedRecipe = { ...recipe };
        let hasUpdates = false;
        setLoadingRecipeId(recipe.id);

        if (!updatedRecipe.image) {
            try {
                const imgRes = await generateImage(updatedRecipe.name, "4:3", 'food');
                if (imgRes.imageUrl) {
                    updatedRecipe.image = imgRes.imageUrl;
                    hasUpdates = true;
                }
            } catch (e) { console.error(e); }
        }

        if (updatedRecipe.ingredients.length === 0 && updatedRecipe.instructions.length === 0) {
            const details = await getRecipeDetails(updatedRecipe.name, language as any);
            if (details) {
                updatedRecipe = { ...updatedRecipe, ...details };
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            setRecipes((prev: Recipe[]) => prev.map(r => r.id === recipe.id ? updatedRecipe : r));
            setWeeklyPlan((currentPlan: WeeklyPlanState) => {
                const updatedPlan = { ...currentPlan };
                Object.keys(updatedPlan).forEach(dateKey => {
                    (['breakfast', 'lunch', 'dinner'] as MealTime[]).forEach(meal => {
                        if (updatedPlan[dateKey]?.[meal]) {
                            updatedPlan[dateKey][meal] = updatedPlan[dateKey][meal].map(m =>
                                m.id === recipe.id ? updatedRecipe : m
                            );
                        }
                    });
                });
                return updatedPlan;
            });
        }

        setLoadingRecipeId(null);
        onOpenRecipe(updatedRecipe);
    };

    const removeRecipeFromPlan = (dateKey: string, mealTime: MealTime, index: number) => {
        setWeeklyPlan((prev: WeeklyPlanState) => {
            const day = prev[dateKey];
            if (!day) return prev;
            const newList = [...day[mealTime]];
            newList.splice(index, 1);
            return { ...prev, [dateKey]: { ...day, [mealTime]: newList } };
        });
    };

    // Meal type config for colors
    const MEAL_CONFIG = {
        breakfast: { label: 'Desayuno', accent: 'amber', icon: <Coffee className="w-3 h-3" /> },
        lunch: { label: 'Almuerzo', accent: 'emerald', icon: <Sunset className="w-3 h-3" /> },
        dinner: { label: 'Cena', accent: 'indigo', icon: <Moon className="w-3 h-3" /> },
    };

    const MEAL_COLORS: Record<string, { bg: string; text: string; border: string; dropBg: string; dropBorder: string }> = {
        breakfast: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dropBg: 'bg-amber-50/80', dropBorder: 'border-amber-400' },
        lunch: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dropBg: 'bg-emerald-50/80', dropBorder: 'border-emerald-400' },
        dinner: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dropBg: 'bg-indigo-50/80', dropBorder: 'border-indigo-400' },
    };

    return (
        <div className="h-full flex flex-col space-y-5 animate-fade-in pb-20 relative">
            <div className="flex justify-between items-center shrink-0 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    {/* Navigation */}
                    <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                        <button onClick={handlePrevPlanner} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <div className="px-4 flex items-center font-black text-xs text-gray-800 min-w-[160px] justify-center">
                            {viewMode === 'month'
                                ? plannerDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, s => s.toUpperCase())
                                : `${days[0]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — ${days[days.length - 1]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            }
                        </div>
                        <button onClick={handleNextPlanner} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>

                    {/* Today Button */}
                    <button
                        onClick={() => setPlannerDate(new Date())}
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm uppercase tracking-widest"
                    >
                        Hoy
                    </button>

                    {/* View Mode Selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Semana</button>
                        <button onClick={() => setViewMode('biweek')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'biweek' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Quincena</button>
                        <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Mes</button>
                    </div>

                    <button
                        onClick={() => {
                            const lowFreshness = pantryItems.filter(i => {
                                if (!i.expiryDate) return false;
                                const days = (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                return days < 7;
                            });
                            if (lowFreshness.length === 0) {
                                alert("¡Todo está fresco! No hay necesidad de optimizar por caducidad ahora mismo.");
                                return;
                            }
                            setIsSmartOptimizing(true);
                            setIsAiMenuOpen(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Optimizar
                    </button>

                    <button
                        onClick={() => {
                            setIsSmartOptimizing(false);
                            setIsAiMenuOpen(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-[0_8px_20px_rgba(147,51,234,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 shadow-md"
                    >
                        <Wand2 className="w-3.5 h-3.5" /> IA
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsRecipeDrawerOpen(!isRecipeDrawerOpen)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${isRecipeDrawerOpen ? 'bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 shadow-sm'}`}>
                        <BookOpen className="w-3.5 h-3.5" /> {isRecipeDrawerOpen ? 'Cerrar' : 'Recetario'}
                    </button>

                    <button
                        onClick={handleClearPlan}
                        title={language === 'ES' ? 'Limpiar semana' : 'Clear week'}
                        className="flex items-center gap-2 bg-white border border-red-100 text-red-500 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {aiGenerating && (
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    <span className="text-xs font-black text-purple-700 uppercase tracking-widest">{aiStatus}</span>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden gap-4">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className={`gap-3 transition-all duration-500 ${viewMode === 'week' || viewMode === 'biweek' ? 'grid grid-cols-7 min-w-[1200px]' : 'grid grid-cols-7 gap-2'}`}>
                        {days.map((date: Date) => {
                            const dateKey = date.toISOString().split('T')[0];
                            const dayPlan = weeklyPlan[dateKey] || { breakfast: [], lunch: [], dinner: [] };
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isCurrentMonth = viewMode === 'month' ? date.getMonth() === plannerDate.getMonth() : true;
                            const totalItems = Object.values(dayPlan).reduce((s, arr) => s + arr.length, 0);

                            return (
                                <div key={dateKey} className={`rounded-3xl border flex flex-col gap-2 transition-all duration-300 relative group/day
                                    ${viewMode === 'month' ? 'min-h-[130px] p-2' : viewMode === 'biweek' ? 'min-h-[280px] p-3' : 'min-h-[480px] p-4'}
                                    ${!isCurrentMonth ? 'opacity-35 bg-gray-50 grayscale' : isToday ? 'bg-white border-emerald-300 shadow-[0_0_0_2px_rgba(16,185,129,0.15),0_4px_16px_rgba(16,185,129,0.08)]' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}
                                `}>
                                    {/* Day Header */}
                                    <div className={`flex justify-between items-center pb-2 ${viewMode !== 'month' ? 'border-b border-gray-50' : ''}`}>
                                        <div>
                                            <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-0.5 ${isToday ? 'text-emerald-500' : 'text-gray-300'}`}>
                                                {date.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { weekday: 'short' })}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-black leading-none ${viewMode === 'month' ? 'text-base' : 'text-xl'} ${isToday ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                    {date.getDate()}
                                                </span>
                                                {isToday && <span className="text-[7px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Hoy</span>}
                                                {totalItems > 0 && viewMode === 'month' && <span className="text-[7px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">{totalItems}</span>}
                                            </div>
                                        </div>

                                        {/* Daily Macros Summary (New Premium Feature) */}
                                        {viewMode !== 'month' && (
                                            <div className="hidden md:flex flex-col items-end opacity-60 group-hover/day:opacity-100 transition-opacity">
                                                <div className="flex gap-2 text-[8px] font-black uppercase tracking-tighter">
                                                    <span className="text-blue-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.protein || 0), 0))}g P</span>
                                                    <span className="text-orange-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.carbs || 0), 0))}g C</span>
                                                    <span className="text-emerald-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.fat || 0), 0))}g G</span>
                                                </div>
                                                <div className="mt-1 flex gap-1 items-center">
                                                    <Flame className="w-2.5 h-2.5 text-orange-400" />
                                                    <span className="text-[9px] font-black text-gray-400">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.calories || 0), 0))} Kcal</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenDayMenuId(openDayMenuId === dateKey ? null : dateKey); }}
                                                className={`p-1 rounded-lg text-gray-200 hover:text-gray-500 hover:bg-gray-50 transition-all opacity-0 group-hover/day:opacity-100 ${openDayMenuId === dateKey ? '!opacity-100 bg-gray-100 text-gray-500' : ''}`}
                                            >
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                            </button>
                                            {openDayMenuId === dateKey && (
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1 w-28 z-50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => handleCopyDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-50 text-[10px] font-bold text-gray-600 flex items-center gap-2"><Copy className="w-3 h-3" /> Copiar</button>
                                                    {copiedDay && <button onClick={() => handlePasteDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-[10px] font-bold text-emerald-600 flex items-center gap-2"><ClipboardPaste className="w-3 h-3" /> Pegar</button>}
                                                    <button onClick={() => handleClearDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-[10px] font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Limpiar</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(['breakfast', 'lunch', 'dinner'] as MealTime[]).map(meal => {
                                        const mealCfg = MEAL_CONFIG[meal];
                                        const mealColors = MEAL_COLORS[meal];
                                        const items = dayPlan[meal] || [];
                                        const sortedIndices = items.map((_, i) => i).sort((a, b) => {
                                            const typeA = items[a].courseType || 'MAIN';
                                            const typeB = items[b].courseType || 'MAIN';
                                            return COURSE_ORDER.indexOf(typeA) - COURSE_ORDER.indexOf(typeB);
                                        });
                                        const isDropTarget = dragOverSlot?.date === dateKey && dragOverSlot?.meal === meal;

                                        if (viewMode === 'month' && items.length === 0) return null;

                                        return (
                                            <div
                                                key={meal}
                                                onDragOver={(e) => handleDragOver(e, dateKey, meal)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, dateKey, meal)}
                                                className={`grow shrink-0 rounded-2xl border flex flex-col gap-1.5 transition-all duration-200 relative group/slot
                                                    ${viewMode === 'month' ? 'min-h-[36px] p-1.5' : 'min-h-[130px] p-2.5'}
                                                    ${isDropTarget
                                                        ? `${mealColors.dropBg} ${mealColors.dropBorder} border-2 shadow-md scale-[1.01]`
                                                        : items.length === 0
                                                            ? 'bg-gray-50/60 border-dashed border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                            : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                                                    }`}
                                            >
                                                {/* Meal label */}
                                                {viewMode !== 'month' && (
                                                    <div className={`flex items-center gap-1 px-1 ${items.length > 0 ? mealColors.text : 'text-gray-300'} transition-colors group-hover/slot:${mealColors.text}`}>
                                                        {mealCfg.icon}
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{mealCfg.label}</span>
                                                    </div>
                                                )}

                                                {sortedIndices.map((originalIndex) => {
                                                    const recipe = items[originalIndex];
                                                    return (
                                                        <div
                                                            key={`${recipe.id}-${originalIndex}`}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, recipe, { date: dateKey, meal, index: originalIndex })}
                                                            onDragEnd={handleDragEnd}
                                                            className={`bg-white rounded-xl border border-gray-100 group relative cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.02] transition-all select-none
                                                                ${draggingItem?.date === dateKey && draggingItem?.meal === meal && draggingItem?.index === originalIndex ? 'opacity-20 grayscale border-dashed border-emerald-300 scale-95' : ''}
                                                                ${openMenuId === `${dateKey}-${meal}-${originalIndex}` ? 'z-[60] shadow-lg ring-1 ring-emerald-100' : 'z-10'}
                                                                ${viewMode === 'month' ? 'p-1' : 'p-2'}
                                                            `}
                                                        >
                                                            <div className="flex gap-2 items-center" onClick={() => handleRecipeClick(recipe)} style={{ cursor: 'pointer' }}>
                                                                {viewMode !== 'month' && (
                                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden shrink-0 shadow-sm ring-1 ring-gray-100">
                                                                        {loadingRecipeId === recipe.id ? (
                                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100/50"><Loader2 className="w-4 h-4 animate-spin text-emerald-500" /></div>
                                                                        ) : (
                                                                            <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    {viewMode !== 'month' && (
                                                                        <span className={`text-[7px] font-black px-1 py-0.5 rounded-md uppercase tracking-widest ${recipe.courseType === 'STARTER' ? 'bg-blue-50 text-blue-500' : recipe.courseType === 'DESSERT' ? 'bg-pink-50 text-pink-500' : 'bg-gray-50 text-gray-400'}`}>
                                                                            {COURSE_LABELS[recipe.courseType || 'MAIN']}
                                                                        </span>
                                                                    )}
                                                                    <h5 className={`font-black text-gray-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors mt-1 ${viewMode === 'month' ? 'text-[9px]' : 'text-[13px] tracking-tight'}`}>{recipe.name}</h5>
                                                                </div>
                                                            </div>

                                                            {/* Context Menu */}
                                                            {viewMode !== 'month' && (
                                                                <div className="absolute top-2 right-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `${dateKey}-${meal}-${originalIndex}` ? null : `${dateKey}-${meal}-${originalIndex}`); }}
                                                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                                                                    >
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </button>

                                                                    {openMenuId === `${dateKey}-${meal}-${originalIndex}` && (
                                                                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 w-32 z-50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                                                                            <div className="flex gap-1 mb-1 p-1 bg-gray-50 rounded-lg justify-center">
                                                                                <button title="1er Plato" onClick={() => updateCourseType(dateKey, meal, originalIndex, 'STARTER')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'STARTER' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`} />
                                                                                <button title="2º Plato" onClick={() => updateCourseType(dateKey, meal, originalIndex, 'MAIN')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'MAIN' ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`} />
                                                                                <button title="Postre" onClick={() => updateCourseType(dateKey, meal, originalIndex, 'DESSERT')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'DESSERT' ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'}`} />
                                                                            </div>
                                                                            <button onClick={() => { handleRecipeClick(recipe); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-[10px] font-bold text-gray-600 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Ver</button>
                                                                            <button onClick={() => { removeRecipeFromPlan(dateKey, meal, originalIndex); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-[10px] font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Eliminar</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* QUICK ADD BUTTON - Hide in month view to save space */}
                                                {viewMode !== 'month' && (
                                                    <button
                                                        onClick={() => setQuickAddTarget({ date: dateKey, meal })}
                                                        className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-2 flex items-center justify-center gap-2 text-gray-300 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all opacity-0 group-hover/slot:opacity-100 mt-auto"
                                                    >
                                                        <PlusCircle className="w-4 h-4" /> <span className="text-[9px] font-black uppercase tracking-widest">Añadir</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <RecipeSidebar
                    isOpen={isRecipeDrawerOpen}
                    search={recipeSearch}
                    setSearch={setRecipeSearch}
                    recipes={recipes}
                    onDragStart={handleDragStart}
                />
            </div>

            <AiPlannerModal
                isOpen={isAiMenuOpen}
                onClose={() => setIsAiMenuOpen(false)}
                aiCourses={aiCourses}
                setAiCourses={setAiCourses}
                aiCriteria={aiCriteria}
                setAiCriteria={setAiCriteria}
                aiMealTypes={aiMealTypes}
                setAiMealTypes={setAiMealTypes}
                handleGenerateMenu={handleGenerateMenu}
                aiGenerating={aiGenerating}
                aiStatus={aiStatus}
                language={language as Language}
            />

            <QuickAddModal
                target={quickAddTarget}
                onClose={() => setQuickAddTarget(null)}
                search={quickAddSearch}
                setSearch={setQuickAddSearch}
                recipes={recipes}
                onAddRecipe={handleQuickAddRecipe}
            />
        </div >
    );
};
