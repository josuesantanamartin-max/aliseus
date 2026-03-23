import React, { useState } from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { useUserStore } from '@/store/useUserStore';
import { WeeklyPlanState, MealTime, Recipe, Ingredient, RecipeIngredient, Language } from '@/types';
import { ChevronLeft, ChevronRight, Wand2, BookOpen, Trash2, Sparkles } from 'lucide-react';
import { generateImage } from '@/services/geminiCore';
import { generateMealPlan, getRecipeDetails } from '@/services/geminiLife';
import { getIngredientCategory } from '@/utils/foodUtils';
import { QuickAddModal } from './meal-planner/QuickAddModal';
import { RecipeSidebar } from './meal-planner/RecipeSidebar';
import { AiPlannerModal } from './meal-planner/AiPlannerModal';
import { MealPlannerHeader } from './meal-planner/MealPlannerHeader';
import { MealDayCard } from './meal-planner/MealDayCard';
import { generatePlanDates, ViewMode } from './meal-planner/mealPlannerConstants';

interface MealPlannerProps {
    onOpenRecipe: (recipe: Recipe) => void;
}

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

        const newPlans = [...weeklyPlans];

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
            plan.meals = plan.meals.filter((m: { date: string }) => m.date !== date);

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
                            completed: (recipe as any).completed || false,
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
    const [aiCourses, setAiCourses] = useState({ lunch: 2, dinner: 1 });
    const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [openDayMenuId, setOpenDayMenuId] = useState<string | null>(null);
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
                return days < 7;
            });

            if (lowFreshness.length > 0) {
                setIsSmartOptimizing(true);
            } else {
                setIsSmartOptimizing(false);
            }
            
            setIsAiMenuOpen(true);
            setIsSmartPlannerOpen(false);
        }
    }, [isSmartPlannerOpen, pantryItems, setIsSmartPlannerOpen]);

    // --- AUTO-SYNC SHOPPING LIST ---
    React.useEffect(() => {
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
                return existing ? { ...newItem, checked: existing.checked, id: existing.id } : newItem;
            });

            const nextList = [...manualItems, ...finalSmartItems];
            if (JSON.stringify(prev) === JSON.stringify(nextList)) return prev;

            return nextList;
        });
    }, [weeklyPlans, pantryItems, plannerDate, viewMode]);

    // --- SMART SHOPPING LIST LOGIC ---
    const recalculateShoppingList = (currentPlan: WeeklyPlanState) => {
        const planTotals: Record<string, {
            quantity: number;
            unit: string;
            recipeBreakdown: Record<string, number>
        }> = {};

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

                        if (planTotals[normName].unit === normUnit) {
                            planTotals[normName].quantity += normQty;
                            const currentRecipeQty = planTotals[normName].recipeBreakdown[r.name] || 0;
                            planTotals[normName].recipeBreakdown[r.name] = currentRecipeQty + normQty;
                        }
                    });
                });
            });
        });

        const newSmartItems: any[] = [];

        Object.entries(planTotals).forEach(([name, data]) => {
            const pantryItem = pantryItems.find((p: Ingredient) => p.name.toLowerCase().trim() === name);
            let stock = 0;
            if (pantryItem && getNormalizedUnit(pantryItem.unit) === data.unit) {
                stock = getNormalizedQuantity(pantryItem.quantity, pantryItem.unit);
            }

            const activeBreakdown: Record<string, number> = {};
            let totalMissing = 0;

            const sortedRecipeNames = Object.keys(data.recipeBreakdown).sort();

            sortedRecipeNames.forEach(recipeName => {
                const neededForRecipe = data.recipeBreakdown[recipeName];
                if (stock >= neededForRecipe) {
                    stock -= neededForRecipe;
                } else {
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
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    quantity: parseFloat(totalMissing.toFixed(2)),
                    unit: data.unit,
                    checked: false,
                    category: category,
                    source: {
                        type: 'SMART_PLAN',
                        recipeName: recipeNames,
                        recipeBreakdown: activeBreakdown
                    }
                });
            }
        });

        return newSmartItems;
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
        setWeeklyPlan((prev: WeeklyPlanState) => ({
            ...prev,
            [targetDateKey]: JSON.parse(JSON.stringify(copiedDay.plan))
        }));
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

    // --- DRAG AND DROP ---
    const handleDragStart = (e: React.DragEvent, recipe: Recipe, origin?: { date: string, meal: MealTime, index: number }) => {
        const data = JSON.stringify({ recipe, origin });
        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.effectAllowed = origin ? 'move' : 'copy';
        if (origin) setDraggingItem(origin);
    };

    const handleDragEnd = (e: React.DragEvent) => { setDraggingItem(null); };

    const handleDragOver = (e: React.DragEvent, targetDate: string, targetMeal: MealTime) => {
        e.preventDefault();
        const isFromPlanner = !!draggingItem;
        e.dataTransfer.dropEffect = isFromPlanner ? 'move' : 'copy';
        setDragOverSlot(prev =>
            prev?.date === targetDate && prev?.meal === targetMeal ? prev : { date: targetDate, meal: targetMeal }
        );
    };

    const handleDragLeave = (e: React.DragEvent) => {
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

    const removeRecipeFromPlan = (dateKey: string, mealTime: MealTime, index: number) => {
        setWeeklyPlan((prev: WeeklyPlanState) => {
            const day = prev[dateKey];
            if (!day) return prev;
            const newList = [...day[mealTime]];
            newList.splice(index, 1);
            return { ...prev, [dateKey]: { ...day, [mealTime]: newList } };
        });
    };

    // --- AI GENERATION ---
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

                const processRecipes = async () => {
                    const dates = Object.keys(result);
                    const initialPlanUpdate: WeeklyPlanState = {};
                    const allNewRecipes: Recipe[] = [];

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
                                    instructions: [],
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

                    setRecipes((prev: Recipe[]) => [...prev, ...allNewRecipes]);
                    setWeeklyPlan((prev: WeeklyPlanState) => ({ ...prev, ...initialPlanUpdate }));

                    setIsAiMenuOpen(false);
                    setAiGenerating(false);
                    setAiStatus('');

                    // Background Image & Instruction Hydration
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

                                setRecipes((prev: Recipe[]) =>
                                    prev.map(r => r.id === recipe.id ? { ...r, ...updates } : r)
                                );

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
                        <Wand2 className="w-3.5 h-3.5" /> Generar Menú IA
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
                    <span className="text-xs font-black text-purple-700 uppercase tracking-widest">{aiStatus}</span>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden gap-4">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className={`gap-3 transition-all duration-500 ${viewMode === 'week' || viewMode === 'biweek' ? 'grid grid-cols-7 min-w-[1200px]' : 'grid grid-cols-7 gap-2'}`}>
                        {days.map((date: Date) => {
                            const dateKey = date.toISOString().split('T')[0];
                            const dayPlan = weeklyPlan[dateKey] || { breakfast: [], lunch: [], dinner: [] };

                            return (
                                <MealDayCard
                                    key={dateKey}
                                    date={date}
                                    dayPlan={dayPlan}
                                    viewMode={viewMode}
                                    language={language as string}
                                    plannerDate={plannerDate}
                                    loadingRecipeId={loadingRecipeId}
                                    openMenuId={openMenuId}
                                    openDayMenuId={openDayMenuId}
                                    copiedDay={copiedDay}
                                    draggingItem={draggingItem}
                                    dragOverSlot={dragOverSlot}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onRecipeClick={handleRecipeClick}
                                    onMenuToggle={setOpenMenuId}
                                    onDayMenuToggle={setOpenDayMenuId}
                                    onCopyDay={handleCopyDay}
                                    onPasteDay={handlePasteDay}
                                    onClearDay={handleClearDay}
                                    onUpdateCourseType={updateCourseType}
                                    onRemoveRecipe={removeRecipeFromPlan}
                                    onQuickAdd={setQuickAddTarget}
                                />
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
