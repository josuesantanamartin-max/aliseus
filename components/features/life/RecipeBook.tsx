import React, { useState, useRef, useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { Recipe, RecipeIngredient, WeeklyPlanState } from '../../../types';
import { Search, Loader2, ScanLine, Plus, Clock, Flame, Pencil, Save, X, Trash2, ChefHat, Users, Sparkles, LayoutDashboard, Calendar, CalendarPlus } from 'lucide-react';
import { generateImage } from '../../../services/geminiCore';
import { generateRecipesFromIngredients, generateRecipesFromImage } from '../../../services/geminiLife';
import { PlanRecipeModal } from './PlanRecipeModal';
import { CookingModeView } from './CookingModeView';
import { calculateMissingIngredients } from '../../../utils/foodUtils';

interface RecipeBookProps {
    onNavigateToMealPlan?: () => void;
    initialRecipeToOpen?: Recipe | null;
    onClearInitialRecipe?: () => void;
}

const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

export const RecipeBook: React.FC<RecipeBookProps> = ({ onNavigateToMealPlan, initialRecipeToOpen, onClearInitialRecipe }) => {
    const { recipes, setRecipes, pantryItems, shoppingList, setShoppingList } = useLifeStore();
    const { language } = useUserStore();

    const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
    // New Filters state
    const [filterMealType, setFilterMealType] = useState<string>('All');
    const [filterPrepTime, setFilterPrepTime] = useState<string>('All');
    const [filterCalories, setFilterCalories] = useState<string>('All');
    const [filterWithWhatIHave, setFilterWithWhatIHave] = useState(false);

    const recipeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialRecipeToOpen) {
            setViewRecipe(initialRecipeToOpen);
            // Clear it in parent shortly after to allow re-opening if needed, though view change usually handles reset
            if (onClearInitialRecipe) onClearInitialRecipe();
        }
    }, [initialRecipeToOpen, onClearInitialRecipe]);

    // States related to creating/editing
    const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
    const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null); // New state for viewing details
    const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
    const [newRecipeName, setNewRecipeName] = useState('');
    const [newRecipeImage, setNewRecipeImage] = useState<string | null>(null);
    const [newRecipeServings, setNewRecipeServings] = useState(2);
    const [newRecipeTime, setNewRecipeTime] = useState(30);
    const [newRecipeCalories, setNewRecipeCalories] = useState(0);
    const [newIngredients, setNewIngredients] = useState<RecipeIngredient[]>([{ name: '', quantity: 0, unit: 'g' }]);
    const [newSteps, setNewSteps] = useState<string[]>(['']);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // States related to Chef AI
    const [isChefGenerating, setIsChefGenerating] = useState(false);
    const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
    const [isRecipeResultOpen, setIsRecipeResultOpen] = useState(false);

    // New states for Planificar and Cocinar modals
    const [planRecipe, setPlanRecipe] = useState<Recipe | null>(null);
    const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

    const handleOpenAddRecipe = () => {
        setEditingRecipeId(null);
        setNewRecipeName('');
        setNewRecipeImage(null);
        setNewRecipeServings(2);
        setNewRecipeTime(30);
        setNewRecipeCalories(0);
        setNewIngredients([{ name: '', quantity: 0, unit: 'g' }]);
        setNewSteps(['']);
        setIsAddRecipeOpen(true);
    };

    const handleEditRecipe = (recipe: Recipe) => {
        setEditingRecipeId(recipe.id);
        setNewRecipeName(recipe.name);
        setNewRecipeImage(recipe.image || null);
        setNewRecipeServings(recipe.baseServings);
        setNewRecipeTime(recipe.prepTime);
        setNewRecipeCalories(recipe.calories);
        setNewIngredients(recipe.ingredients);
        setNewSteps(recipe.instructions);
        setIsAddRecipeOpen(true);
    };

    const handleSaveRecipe = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!newRecipeName) return;
        const recipeData: Recipe = {
            id: editingRecipeId || Math.random().toString(36).substr(2, 9),
            name: newRecipeName,
            image: newRecipeImage || undefined,
            prepTime: newRecipeTime,
            calories: newRecipeCalories,
            baseServings: newRecipeServings,
            tags: [],
            ingredients: newIngredients.filter(i => i.name),
            instructions: newSteps.filter(s => s),
            rating: 0
        };
        if (editingRecipeId) {
            setRecipes((prev: Recipe[]) => prev.map(r => r.id === editingRecipeId ? recipeData : r));
        } else {
            setRecipes((prev: Recipe[]) => [...prev, recipeData]);
        }
        setIsAddRecipeOpen(false);
    };

    const handleGenerateAIImage = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!newRecipeName) return;
        setIsGeneratingImage(true);
        try {
            const prompt = newRecipeName + " ";
            const result = await generateImage(newRecipeName, "4:3", 'food');
            if (result.imageUrl) {
                setNewRecipeImage(result.imageUrl);
            } else {
                alert("No se pudo generar la imagen.");
            }
        } catch (err) {
            console.error(err);
        }
        setIsGeneratingImage(false);
    };

    const handlePhotoChef = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsChefGenerating(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const recipes = await generateRecipesFromImage(base64String.split(',')[1], language as string);

            if (recipes && recipes.length > 0) {
                setGeneratedRecipes(recipes);
                setIsRecipeResultOpen(true);
            } else {
                alert("No se pudieron generar recetas a partir de la imagen.");
            }
            setIsChefGenerating(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveGeneratedRecipe = (recipe: Recipe) => {
        generateImage(recipe.name, "4:3", 'food').then(res => {
            if (res.imageUrl) {
                setRecipes((prev: Recipe[]) => prev.map(r => {
                    if (r.name === recipe.name && !r.image) {
                        return { ...r, image: res.imageUrl };
                    }
                    return r;
                }));
            }
        });

        setRecipes((prev: Recipe[]) => [{ ...recipe, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
        setIsRecipeResultOpen(false);
        setGeneratedRecipes([]);
        alert("Receta guardada");
    };

    // Handlers for new modals
    const handleAddToMealPlan = (recipe: Recipe, date: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
        const { weeklyPlans, setWeeklyPlans } = useLifeStore.getState();
        const targetDate = new Date(date);

        // Find start of week (Sunday or Monday, let's say Monday as per logic usually)
        // Assuming week starts on Monday for consistency with other parts? 
        // Or simplified: Just find a plan that covers this date or create one.
        // Let's assume standard ISO week logic or simplify.
        // Actually, simple approach: Find plan with same weekStart.

        const day = targetDate.getDay();
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const weekStart = new Date(targetDate.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const existingPlanIndex = weeklyPlans.findIndex(p => p.weekStart === weekStartStr);
        let newPlans = [...weeklyPlans];

        const newMeal = {
            date: date,
            dayOfWeek: day,
            type: meal,
            recipeId: recipe.id,
            recipeName: recipe.name,
            servings: recipe.baseServings,
            completed: false,
            courseType: recipe.courseType || 'MAIN',
            calories: recipe.calories || 0,
            image: recipe.image,
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || [],
        };

        if (existingPlanIndex >= 0) {
            const plan = { ...newPlans[existingPlanIndex] };
            plan.meals = [...plan.meals, newMeal];
            newPlans[existingPlanIndex] = plan;
        } else {
            newPlans.push({
                id: Math.random().toString(36).substr(2, 9),
                weekStart: weekStartStr,
                meals: [newMeal]
            });
        }

        setWeeklyPlans(newPlans);

        alert(`${recipe.name} agregado al plan de comidas para ${meal === 'breakfast' ? 'desayuno' : meal === 'lunch' ? 'almuerzo' : 'cena'} el ${date}`);

        if (onNavigateToMealPlan) {
            onNavigateToMealPlan();
        }
    };

    const handleAddToShoppingList = (recipe: Recipe) => {
        // Add ingredients not in pantry to shopping list
        const pantryNames = pantryItems.map(p => p.name.toLowerCase());
        const missingIngredients = recipe.ingredients.filter(
            ing => !pantryNames.includes(ing.name.toLowerCase())
        );

        const newShoppingItems = missingIngredients.map(ing => ({
            id: Math.random().toString(36).substr(2, 9),
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: 'Other' as const,
            checked: false
        }));

        setShoppingList([...shoppingList, ...newShoppingItems]);
        alert(`${missingIngredients.length} ingredientes agregados a la lista de compra`);
    };

    const handleQuickAddToday = (recipe: Recipe) => {
        // Quick add to today's next meal
        const now = new Date();
        const hour = now.getHours();
        let meal: 'breakfast' | 'lunch' | 'dinner' = 'lunch';

        if (hour < 11) meal = 'lunch';
        else if (hour < 17) meal = 'dinner';
        else meal = 'breakfast'; // Next day breakfast

        const today = now.toISOString().split('T')[0];
        handleAddToMealPlan(recipe, today, meal);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    const filteredRecipes = recipes.filter(r => {
        // Search term
        if (!r.name.toLowerCase().includes(recipeSearchTerm.toLowerCase())) return false;

        // Meal Type
        if (filterMealType !== 'All') {
            const mappedTag = {
                'Desayuno': 'Breakfast',
                'Almuerzo': 'Lunch',
                'Cena': 'Dinner'
            }[filterMealType];

            if (mappedTag && !r.tags?.includes(mappedTag)) return false;
        }

        // Prep Time
        if (filterPrepTime !== 'All') {
            const timeMap: Record<string, number> = { '<15m': 15, '<30m': 30, '<60m': 60 };
            const maxTime = timeMap[filterPrepTime];
            if (maxTime && r.prepTime > maxTime) return false;
        }

        // Calories
        if (filterCalories !== 'All') {
            const calMap: Record<string, number> = { '<300kcal': 300, '<500kcal': 500 };
            const maxCal = calMap[filterCalories];
            if (maxCal && r.calories > maxCal) return false;
        }

        return true;
    }).map(recipe => {
        // Calculate missing ingredients
        const missing = calculateMissingIngredients(recipe.ingredients, pantryItems);

        // Ensure dynamic image if not explicitly set by user. Use a deterministic id based on name.
        const dynamicImage = recipe.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop`; // Fallback Unsplash URL using keywords will cause re-renders if not careful. For now, since Unsplash Source is deprecated, we will leave the generated image system as is but rely on a robust fallback or the previous geminiService behavior.
        // Actually, let's keep the existing image behavior and let AI handle new recipes as per the current system architecture, but ensure it displays.

        return {
            ...recipe,
            _missingInfo: missing
        };
    }).filter(r => {
        // Apply "With what I have" filter AFTER missing calculation
        if (filterWithWhatIHave && !r._missingInfo?.hasAll) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col pb-20">
            <div className="flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={recipeSearchTerm} onChange={(e) => setRecipeSearchTerm(e.target.value)} placeholder="Buscar receta..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-100 w-64" />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input type="file" accept="image/*" ref={recipeInputRef} onChange={handlePhotoChef} className="hidden" />
                            <button type="button" onClick={() => recipeInputRef.current?.click()} className="bg-purple-100 text-purple-700 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-200 transition-all flex items-center gap-2 shadow-sm">
                                {isChefGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />} Escanear para Cocinar
                            </button>
                        </div>
                        <button type="button" onClick={handleOpenAddRecipe} className="bg-emerald-950 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-900 transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Nueva Receta
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filterMealType}
                        onChange={(e) => setFilterMealType(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                    >
                        <option value="All">Cualquiera</option>
                        <option value="Desayuno">Desayuno</option>
                        <option value="Almuerzo">Almuerzo</option>
                        <option value="Cena">Cena</option>
                    </select>

                    <select
                        value={filterPrepTime}
                        onChange={(e) => setFilterPrepTime(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                    >
                        <option value="All">Cualquier tiempo</option>
                        <option value="<15m">&lt; 15 min</option>
                        <option value="<30m">&lt; 30 min</option>
                        <option value="<60m">&lt; 1 hora</option>
                    </select>

                    <select
                        value={filterCalories}
                        onChange={(e) => setFilterCalories(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                    >
                        <option value="All">Cualquier Caloría</option>
                        <option value="<300kcal">&lt; 300 kcal</option>
                        <option value="<500kcal">&lt; 500 kcal</option>
                    </select>

                    <button
                        onClick={() => setFilterWithWhatIHave(!filterWithWhatIHave)}
                        className={`text-[11px] font-black uppercase tracking-widest rounded-lg px-4 py-1.5 transition-all shadow-sm ${filterWithWhatIHave ? 'bg-emerald-600 text-white border-transparent relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:animate-pulse' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Con lo que tengo hoy
                    </button>

                    {(filterMealType !== 'All' || filterPrepTime !== 'All' || filterCalories !== 'All' || filterWithWhatIHave) && (
                        <button
                            onClick={() => {
                                setFilterMealType('All'); setFilterPrepTime('All'); setFilterCalories('All'); setFilterWithWhatIHave(false);
                            }}
                            className="text-[10px] font-bold text-gray-400 hover:text-red-500 hover:underline transition-colors ml-2"
                        >
                            Limpiar Filtros
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredRecipes.map((recipe: any) => (<div
                        key={recipe.id}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group overflow-hidden cursor-pointer flex flex-col h-full"
                        onClick={() => setViewRecipe(recipe)}
                    >
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                            <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" /> {recipe.prepTime}m
                            </div>
                            {recipe.macros && (
                                <div className="absolute top-4 left-4 flex flex-col gap-1.5 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                    <div className="flex gap-1">
                                        <div className="bg-blue-600/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-lg border border-blue-400/30 text-center min-w-[34px]">
                                            {Math.round(recipe.macros.protein)}g P
                                        </div>
                                        <div className="bg-orange-500/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-lg border border-orange-400/30 text-center min-w-[34px]">
                                            {Math.round(recipe.macros.carbs)}g C
                                        </div>
                                        <div className="bg-emerald-600/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-lg border border-emerald-400/30 text-center min-w-[34px]">
                                            {Math.round(recipe.macros.fat)}g G
                                        </div>
                                    </div>
                                </div>
                            )}
                            {recipe.calories > 0 && (
                                <div className="absolute bottom-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    {Math.round(recipe.calories)} kcal
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-1 relative">
                            {recipe._missingInfo && (
                                <div className={`absolute -top-3.5 right-4 z-10 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl border flex items-center gap-1.5 ${recipe._missingInfo.hasAll ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                                    {recipe._missingInfo.hasAll ? '✔ Tienes todo' : `⚠ Faltan ${recipe._missingInfo.missingCount}`}
                                </div>
                            )}
                            <h4 className="font-black text-gray-900 text-xl mb-4 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2 mt-1">{recipe.name}</h4>
                            <div className="mt-auto flex gap-3">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setPlanRecipe(recipe); }}
                                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                >
                                    <CalendarPlus className="w-4 h-4" /> Planificar
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setCookingRecipe(recipe); }}
                                    className="flex-1 py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                >
                                    <Flame className="w-4 h-4" /> Cocinar
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleEditRecipe(recipe); }}
                                    className="p-3.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                                >
                                    <Pencil className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {isAddRecipeOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                <ChefHat className="w-6 h-6 text-emerald-600" /> {editingRecipeId ? 'Editar Receta' : 'Crear Nueva Receta'}
                            </h3>
                            <button type="button" onClick={() => setIsAddRecipeOpen(false)} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex gap-6">
                                <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center relative overflow-hidden border border-gray-200">
                                    {newRecipeImage ? <img src={newRecipeImage} className="w-full h-full object-cover" /> : <ChefHat className="w-8 h-8 text-gray-300" />}
                                    <button
                                        type="button"
                                        onClick={handleGenerateAIImage}
                                        disabled={!newRecipeName || isGeneratingImage}
                                        className="absolute bottom-0 w-full bg-black/50 backdrop-blur-md text-white text-[9px] font-bold py-2 uppercase tracking-widest hover:bg-black/70 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                    >
                                        {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Generar con IA
                                    </button>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre del plato</label>
                                        <input type="text" value={newRecipeName} onKeyDown={handleKeyDown} onChange={(e) => setNewRecipeName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none" placeholder="Ej: Pollo al Curry" />
                                    </div>
                                    <div className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-xl border border-blue-100 flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        Al cambiar las raciones, los ingredientes se ajustan automáticamente.
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Raciones</label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    onKeyDown={handleKeyDown}
                                                    value={newRecipeServings}
                                                    onChange={(e) => {
                                                        const newVal = parseInt(e.target.value) || 1;
                                                        // Auto-scale ingredients if there are any
                                                        if (newIngredients.length > 0 && newRecipeServings > 0) {
                                                            const ratio = newVal / newRecipeServings;
                                                            const scaledIngredients = newIngredients.map(ing => ({
                                                                ...ing,
                                                                quantity: parseFloat((ing.quantity * ratio).toFixed(2))
                                                            }));
                                                            setNewIngredients(scaledIngredients);
                                                        }
                                                        setNewRecipeServings(newVal);
                                                    }}
                                                    className="w-full p-3 bg-gray-50 rounded-2xl font-bold text-center border border-gray-100"
                                                />
                                            </div>
                                        </div>
                                        <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tiempo (m)</label><input type="number" onKeyDown={handleKeyDown} value={newRecipeTime} onChange={(e) => setNewRecipeTime(parseInt(e.target.value))} className="w-full p-3 bg-gray-50 rounded-2xl font-bold text-center border border-gray-100" /></div>
                                        <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kcal</label><input type="number" onKeyDown={handleKeyDown} value={newRecipeCalories} onChange={(e) => setNewRecipeCalories(parseInt(e.target.value))} className="w-full p-3 bg-gray-50 rounded-2xl font-bold text-center border border-gray-100" /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Ingredientes</h4>
                                {newIngredients.map((ing, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" onKeyDown={handleKeyDown} value={ing.name} onChange={(e) => { const list = [...newIngredients]; list[idx].name = e.target.value; setNewIngredients(list); }} className="flex-1 p-3 bg-gray-50 rounded-xl text-sm font-medium border border-gray-100" placeholder="Nombre" />
                                        <input type="number" onKeyDown={handleKeyDown} value={ing.quantity} onChange={(e) => { const list = [...newIngredients]; list[idx].quantity = parseFloat(e.target.value); setNewIngredients(list); }} className="w-20 p-3 bg-gray-50 rounded-xl text-sm font-medium text-center border border-gray-100" placeholder="Cant" />
                                        <input type="text" onKeyDown={handleKeyDown} value={ing.unit} onChange={(e) => { const list = [...newIngredients]; list[idx].unit = e.target.value; setNewIngredients(list); }} className="w-20 p-3 bg-gray-50 rounded-xl text-sm font-medium text-center border border-gray-100" placeholder="Und" />
                                        <button type="button" onClick={() => { const list = [...newIngredients]; list.splice(idx, 1); setNewIngredients(list); }} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setNewIngredients([...newIngredients, { name: '', quantity: 0, unit: 'g' }])} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Ingrediente</button>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Pasos de preparación</h4>
                                {newSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="w-8 h-10 flex items-center justify-center font-black text-gray-300 text-xs">{idx + 1}</span>
                                        <textarea value={step} onKeyDown={handleKeyDown} onChange={(e) => { const list = [...newSteps]; list[idx] = e.target.value; setNewSteps(list); }} className="flex-1 p-3 bg-gray-50 rounded-xl text-sm font-medium border border-gray-100 resize-none" rows={2} placeholder="Ej: Cortar la cebolla..." />
                                        <button type="button" onClick={() => { const list = [...newSteps]; list.splice(idx, 1); setNewSteps(list); }} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-fit"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setNewSteps([...newSteps, ''])} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Paso</button>
                            </div>

                            <button type="button" onClick={handleSaveRecipe} className="w-full bg-emerald-950 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">Guardar Receta</button>
                        </div>
                    </div>
                </div>
            )}

            {isRecipeResultOpen && generatedRecipes.length > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                <ChefHat className="w-6 h-6 text-purple-600" /> Recetas Sugeridas
                            </h3>
                            <button type="button" onClick={() => { setIsRecipeResultOpen(false); setGeneratedRecipes([]); }} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {generatedRecipes.map((recipe, idx) => (
                                <div key={idx} className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-all">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-black text-lg text-gray-900 leading-tight">{recipe.name}</h4>
                                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{recipe.calories} kcal</span>
                                        </div>
                                        <div className="flex gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                            <span><Clock className="w-3 h-3 inline mr-1" />{recipe.prepTime}m</span>
                                            <span><Users className="w-3 h-3 inline mr-1" />{recipe.baseServings}p</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveGeneratedRecipe(recipe)}
                                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Guardar en Recetario
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Receipt Detail View Modal */}
            {viewRecipe && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setViewRecipe(null)}>
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[95vh] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                            <img src={viewRecipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent md:to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <h2 className="text-4xl font-black mb-4 leading-tight drop-shadow-2xl">{viewRecipe.name}</h2>
                                <div className="flex flex-wrap gap-3">
                                    <span className="bg-emerald-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {viewRecipe.prepTime} min
                                    </span>
                                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                        <Users className="w-4 h-4" /> {viewRecipe.baseServings} Pax
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col bg-[#FAFAFA] overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar space-y-10">

                                {/* Nutrition Grid */}
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: 'CALORÍAS', value: Math.round(viewRecipe.calories || 0), sub: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50' },
                                        { label: 'PROTEÍNA', value: Math.round(viewRecipe.macros?.protein || 0), sub: 'g', color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'CARBOS', value: Math.round(viewRecipe.macros?.carbs || 0), sub: 'g', color: 'text-orange-500', bg: 'bg-orange-50/50' },
                                        { label: 'GRASAS', value: Math.round(viewRecipe.macros?.fat || 0), sub: 'g', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                                    ].map((stat, i) => (
                                        <div key={i} className={`${stat.bg} p-3 rounded-[1.25rem] border border-white flex flex-col items-center text-center shadow-sm`}>
                                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</span>
                                            <p className={`text-lg font-black ${stat.color}`}>{stat.value}<span className="text-[8px] font-bold opacity-60 ml-0.5">{stat.sub}</span></p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] border-b-2 border-emerald-500 w-fit pb-1">Ingredientes</h3>
                                        <ul className="space-y-4">
                                            {viewRecipe.ingredients.map((ing, idx) => (
                                                <li key={idx} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
                                                        <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-800 transition-colors uppercase tracking-tight">{ing.name}</span>
                                                    </div>
                                                    <span className="font-black text-[10px] text-gray-400 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">{ing.quantity} {ing.unit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] border-b-2 border-orange-500 w-fit pb-1">Preparación</h3>
                                        <div className="space-y-6">
                                            {viewRecipe.instructions.map((step, idx) => (
                                                <div key={idx} className="flex gap-4 group">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-900 flex items-center justify-center text-xs font-black group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all">{idx + 1}</span>
                                                    <p className="text-sm text-gray-600 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">{step}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-8 bg-white border-t border-gray-100 flex gap-4">
                                <button
                                    onClick={() => { setViewRecipe(null); setPlanRecipe(viewRecipe); }}
                                    className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <CalendarPlus className="w-5 h-5" /> Planificar
                                </button>
                                <button
                                    onClick={() => { setViewRecipe(null); setCookingRecipe(viewRecipe); }}
                                    className="flex-1 bg-gradient-to-r from-gray-900 to-black text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Flame className="w-5 h-5 text-emerald-500" /> Comenzar a Cocinar
                                </button>
                                <button
                                    onClick={() => { setViewRecipe(null); handleEditRecipe(viewRecipe); }}
                                    className="px-8 bg-gray-50 text-gray-400 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>

                        {/* Floating Close Button */}
                        <button
                            onClick={() => setViewRecipe(null)}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full transition-all border border-white/20 shadow-2xl"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Plan Recipe Modal */}
            {planRecipe && (
                <PlanRecipeModal
                    recipe={planRecipe}
                    onClose={() => setPlanRecipe(null)}
                    onAddToMealPlan={(date, meal) => handleAddToMealPlan(planRecipe, date, meal)}
                    onAddToShoppingList={() => handleAddToShoppingList(planRecipe)}
                />
            )}

            {/* Cooking Mode View */}
            {cookingRecipe && (
                <CookingModeView
                    recipe={cookingRecipe}
                    onClose={() => setCookingRecipe(null)}
                />
            )}
        </div>
    );
};
