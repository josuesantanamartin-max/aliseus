import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { ChefHat, Sparkles, Clock, Utensils } from 'lucide-react';

interface SuggestedRecipeWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const SuggestedRecipeWidget: React.FC<SuggestedRecipeWidgetProps> = ({ onNavigate }) => {
    const { recipes = [], pantryItems = [], setRecipeToOpen } = useLifeStore();

    const suggestions = useMemo(() => {
        return recipes
            .map(recipe => {
                const totalIngredients = recipe.ingredients.length;
                const availableIngredients = recipe.ingredients.filter(ri => 
                    pantryItems.some(pi => pi.name.toLowerCase().includes(ri.name.toLowerCase()) && pi.quantity > 0)
                ).length;
                const score = totalIngredients > 0 ? availableIngredients / totalIngredients : 0;
                return { ...recipe, score };
            })
            .sort((a, b) => b.score - a.score)
            .filter(r => r.score > 0.5) // Al menos mitad de ingredientes
            .slice(0, 2);
    }, [recipes, pantryItems]);

    return (
        <div className="bg-white dark:bg-onyx-900 p-6 rounded-[2rem] h-full flex flex-col border border-onyx-100 dark:border-onyx-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Aura Chef</p>
                    <h3 className="text-lg font-black text-onyx-950 dark:text-white">Receta Sugerida</h3>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <ChefHat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {suggestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-4">
                        <Sparkles className="w-8 h-8 text-onyx-200 dark:text-onyx-700 mb-2" />
                        <p className="text-xs font-bold text-onyx-400 dark:text-onyx-500">¿Qué tal una receta nueva?</p>
                        <button 
                            onClick={() => onNavigate('life', 'kitchen-recipes')}
                            className="mt-2 text-[10px] font-black text-emerald-600 uppercase"
                        >
                            Explorar Recetas
                        </button>
                    </div>
                ) : (
                    suggestions.map(recipe => (
                        <div 
                            key={recipe.id} 
                            onClick={() => {
                                setRecipeToOpen(recipe);
                                onNavigate('life', 'kitchen-recipes');
                            }}
                            className="group cursor-pointer p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100/50 dark:border-emerald-900/20 hover:scale-[1.02] transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-black text-onyx-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {recipe.name}
                                </h4>
                                {recipe.score === 1 && (
                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-tighter">
                                        ¡Lista!
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-onyx-500 dark:text-onyx-400">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">{recipe.prepTime + (recipe.cookTime || 0)} min</span>
                                </div>
                                <div className="flex items-center gap-1 text-onyx-500 dark:text-onyx-400">
                                    <Utensils className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">
                                        {Math.round(recipe.score * 100)}% stock
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <p className="mt-4 text-[9px] font-bold text-onyx-400 dark:text-onyx-500 italic">
                * Basado en lo que ya tienes en casa.
            </p>
        </div>
    );
};

export default SuggestedRecipeWidget;
