import React, { useState, useRef, useEffect } from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { useUserStore } from '@/store/useUserStore';
import { Recipe, RecipeIngredient } from '@/types';
import { Search, Loader2, ScanLine, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateImage } from '@/services/geminiCore';
import { generateRecipesFromImage } from '@/services/geminiLife';
import { ProgressiveTooltip } from '@/components/common/ProgressiveTooltip';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { PlanRecipeModal } from './PlanRecipeModal';
import { CookingModeView } from './CookingModeView';
import { calculateMissingIngredients } from '@/utils/foodUtils';
import { RecipeFilters } from './recipe-book/RecipeFilters';
import { RecipeGrid } from './recipe-book/RecipeGrid';
import { RecipeEditorModal } from './recipe-book/RecipeEditorModal';
import { RecipeSuggestionsModal } from './recipe-book/RecipeSuggestionsModal';
import { RecipeDetailModal } from './recipe-book/RecipeDetailModal';
import { recipeService } from '@/services/recipes/recipeService';

interface RecipeBookProps {
    onNavigateToMealPlan?: () => void;
    initialRecipeToOpen?: Recipe | null;
    onClearInitialRecipe?: () => void;
}

export const RecipeBook: React.FC<RecipeBookProps> = ({ onNavigateToMealPlan, initialRecipeToOpen, onClearInitialRecipe }) => {
    const { recipes, importExternalRecipe, pantryItems, shoppingList, setShoppingList } = useLifeStore();
    const { language } = useUserStore();

    const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
    const [filterMealType, setFilterMealType] = useState<string>('All');
    const [filterPrepTime, setFilterPrepTime] = useState<string>('All');
    const [filterCalories, setFilterCalories] = useState<string>('All');
    const [filterWithWhatIHave, setFilterWithWhatIHave] = useState(false);

    const [externalRecipes, setExternalRecipes] = useState<Recipe[]>([]);
    const [isSearchingExternal, setIsSearchingExternal] = useState(false);

    const recipeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialRecipeToOpen) {
            setViewRecipe(initialRecipeToOpen);
            if (onClearInitialRecipe) onClearInitialRecipe();
        }
    }, [initialRecipeToOpen, onClearInitialRecipe]);

    // States related to creating/editing
    const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; recipe: Recipe | null }>({
        isOpen: false,
        recipe: null
    });
    const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
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

    // Plan and Cook modals
    const [planRecipe, setPlanRecipe] = useState<Recipe | null>(null);
    const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

    // ── Handlers ──────────────────────────────────────────────

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

    const handleDeleteRecipe = (recipe: Recipe) => {
        setDeleteConfig({ isOpen: true, recipe });
    };

    const confirmDeleteRecipe = () => {
        if (deleteConfig.recipe) {
            useLifeStore.getState().deleteRecipe(deleteConfig.recipe.id);
            if (viewRecipe?.id === deleteConfig.recipe.id) setViewRecipe(null);
        }
        setDeleteConfig({ isOpen: false, recipe: null });
    };

    const handleSyncCatalog = () => {
        setIsSyncModalOpen(true);
    };

    const confirmSyncCatalog = () => {
        useLifeStore.getState().refreshSampleRecipes();
        setIsSyncModalOpen(false);
        alert('Catálogo sincronizado con éxito. Ahora deberías ver las nuevas recetas e imágenes.');
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
            useLifeStore.getState().updateRecipe(editingRecipeId, recipeData);
        } else {
            useLifeStore.getState().addRecipe(recipeData);
        }
        setIsAddRecipeOpen(false);
    };

    const handleSearchExternal = async () => {
        if (!recipeSearchTerm.trim()) {
            setExternalRecipes([]);
            return;
        }
        setIsSearchingExternal(true);
        try {
            const results = await recipeService.searchExternalRecipes(recipeSearchTerm);
            setExternalRecipes(results);
        } catch (e) {
            console.error(e);
        }
        setIsSearchingExternal(false);
    };

    useEffect(() => {
        const t = setTimeout(() => {
            handleSearchExternal();
        }, 800);
        return () => clearTimeout(t);
    }, [recipeSearchTerm]);

    const handleImportExternalRecipe = async (recipe: Recipe) => {
        try {
            await importExternalRecipe(recipe);
            setExternalRecipes(prev => prev.filter(r => r.id !== recipe.id));
            alert(`${recipe.name} guardada en tu recetario privado.`);
            setViewRecipe(null);
        } catch (e) {
            alert('Error al guardar la receta.');
        }
    };

    const handleGenerateAIImage = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!newRecipeName) return;
        setIsGeneratingImage(true);
        try {
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
        handleImportExternalRecipe(recipe);
        setIsRecipeResultOpen(false);
        setGeneratedRecipes([]);
    };

    const handleAddToMealPlan = (recipe: Recipe, date: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
        const { weeklyPlans, setWeeklyPlans } = useLifeStore.getState();
        const targetDate = new Date(date);

        const day = targetDate.getDay();
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
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

    // ── Filtering ──────────────────────────────────────────────

    const filteredRecipes = recipes.filter(r => {
        if (!r.name.toLowerCase().includes(recipeSearchTerm.toLowerCase())) return false;

        if (filterMealType !== 'All') {
            const mappedTag = {
                'Desayuno': 'Breakfast',
                'Almuerzo': 'Lunch',
                'Cena': 'Dinner'
            }[filterMealType];
            if (mappedTag && !r.tags?.includes(mappedTag)) return false;
        }

        if (filterPrepTime !== 'All') {
            const timeMap: Record<string, number> = { '<15m': 15, '<30m': 30, '<60m': 60 };
            const maxTime = timeMap[filterPrepTime];
            if (maxTime && r.prepTime > maxTime) return false;
        }

        if (filterCalories !== 'All') {
            const calMap: Record<string, number> = { '<300kcal': 300, '<500kcal': 500 };
            const maxCal = calMap[filterCalories];
            if (maxCal && r.calories > maxCal) return false;
        }

        return true;
    }).map(recipe => {
        const missing = calculateMissingIngredients(recipe.ingredients, pantryItems);
        return { ...recipe, _missingInfo: missing };
    }).filter(r => {
        if (filterWithWhatIHave && !r._missingInfo?.hasAll) return false;
        return true;
    });

    const allDisplayedRecipes = [...filteredRecipes, ...externalRecipes];

    // ── Render ──────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col pb-20">
            <div className="flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={recipeSearchTerm} onChange={(e) => setRecipeSearchTerm(e.target.value)} placeholder="Buscar receta o explorar base de datos..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-100 w-64 md:w-80" />
                        {isSearchingExternal && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input type="file" accept="image/*" ref={recipeInputRef} onChange={handlePhotoChef} className="hidden" />
                            <button type="button" onClick={() => recipeInputRef.current?.click()} className="bg-purple-100 text-purple-700 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-200 transition-all flex items-center gap-2 shadow-sm">
                                {isChefGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />} Escanear para Cocinar
                            </button>
                        </div>
                        <button
                            onClick={handleSyncCatalog}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-2xl transition-all flex items-center justify-center w-12 h-12"
                            title="Sincronizar Catálogo"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <ProgressiveTooltip
                            id="tooltip-add-recipe"
                            title="Cocina con IA"
                            description="Sube una foto de los ingredientes que tienes y la IA creará una receta para ti, o añádela manualmente."
                            position="left"
                        >
                            <button
                                onClick={() => setIsAddRecipeOpen(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-2xl shadow-lg transition-colors flex items-center justify-center group relative w-12 h-12 md:w-auto md:px-5 md:py-2.5"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform md:mr-2" />
                                <span className="hidden md:block font-bold">Añadir Receta</span>
                            </button>
                        </ProgressiveTooltip>
                    </div>
                </div>

                <RecipeFilters
                    filterMealType={filterMealType} setFilterMealType={setFilterMealType}
                    filterPrepTime={filterPrepTime} setFilterPrepTime={setFilterPrepTime}
                    filterCalories={filterCalories} setFilterCalories={setFilterCalories}
                    filterWithWhatIHave={filterWithWhatIHave} setFilterWithWhatIHave={setFilterWithWhatIHave}
                />
            </div>

            <RecipeGrid
                recipes={allDisplayedRecipes}
                onViewRecipe={setViewRecipe}
                onPlanRecipe={setPlanRecipe}
                onCookRecipe={setCookingRecipe}
                onEditRecipe={handleEditRecipe}
                onDeleteRecipe={handleDeleteRecipe}
            />

            <RecipeEditorModal
                isOpen={isAddRecipeOpen}
                onClose={() => setIsAddRecipeOpen(false)}
                editingRecipeId={editingRecipeId}
                newRecipeName={newRecipeName} setNewRecipeName={setNewRecipeName}
                newRecipeImage={newRecipeImage}
                newRecipeServings={newRecipeServings} setNewRecipeServings={setNewRecipeServings}
                newRecipeTime={newRecipeTime} setNewRecipeTime={setNewRecipeTime}
                newRecipeCalories={newRecipeCalories} setNewRecipeCalories={setNewRecipeCalories}
                newIngredients={newIngredients} setNewIngredients={setNewIngredients}
                newSteps={newSteps} setNewSteps={setNewSteps}
                onSave={handleSaveRecipe}
                onGenerateImage={handleGenerateAIImage}
                isGeneratingImage={isGeneratingImage}
            />

            <RecipeSuggestionsModal
                isOpen={isRecipeResultOpen}
                recipes={generatedRecipes}
                onClose={() => { setIsRecipeResultOpen(false); setGeneratedRecipes([]); }}
                onSave={handleSaveGeneratedRecipe}
            />

            <RecipeDetailModal
                recipe={viewRecipe}
                onClose={() => setViewRecipe(null)}
                onPlanRecipe={setPlanRecipe}
                onCookRecipe={setCookingRecipe}
                onEditRecipe={handleEditRecipe}
                onDeleteRecipe={handleDeleteRecipe}
                onImportExternal={handleImportExternalRecipe}
            />

            {planRecipe && (
                <PlanRecipeModal
                    recipe={planRecipe}
                    onClose={() => setPlanRecipe(null)}
                    onAddToMealPlan={(date, meal) => handleAddToMealPlan(planRecipe, date, meal)}
                    onAddToShoppingList={() => handleAddToShoppingList(planRecipe)}
                />
            )}

            {cookingRecipe && (
                <CookingModeView
                    recipe={cookingRecipe}
                    onClose={() => setCookingRecipe(null)}
                />
            )}

            {/* Premium Confirmation Modals */}
            <ConfirmationModal
                isOpen={deleteConfig.isOpen}
                title="¿Eliminar receta?"
                message={`Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar "${deleteConfig.recipe?.name}"?`}
                confirmLabel="Eliminar permanentemente"
                onConfirm={confirmDeleteRecipe}
                onCancel={() => setDeleteConfig({ isOpen: false, recipe: null })}
                isDanger={true}
            />

            <ConfirmationModal
                isOpen={isSyncModalOpen}
                title="Sincronizar Catálogo"
                message="Esto restaurará las recetas de ejemplo predeterminadas e imágenes HD. Tus recetas personalizadas no se verán afectadas (a menos que tengan el mismo nombre que las de ejemplo)."
                confirmLabel="Sincronizar ahora"
                cancelLabel="Volver"
                onConfirm={confirmSyncCatalog}
                onCancel={() => setIsSyncModalOpen(false)}
                isDanger={false}
            />
        </div>
    );
};
