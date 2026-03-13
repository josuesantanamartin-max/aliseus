import React from 'react';
import { PlusCircle, Search, Plus } from 'lucide-react';
import { Recipe, WeeklyPlanState, MealTime } from '../../../../types';

interface QuickAddModalProps {
    target: { date: string, meal: MealTime } | null;
    onClose: () => void;
    search: string;
    setSearch: (s: string) => void;
    recipes: Recipe[];
    onAddRecipe: (recipe: Recipe) => void;
}

const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
    target, onClose, search, setSearch, recipes, onAddRecipe
}) => {
    if (!target) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-6 border-b border-gray-100 bg-white">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-emerald-600" /> Añadir a {target.meal === 'breakfast' ? 'Desayuno' : target.meal === 'lunch' ? 'Almuerzo' : 'Cena'}
                    </h3>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Buscar en tus recetas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(recipe => (
                        <button
                            key={recipe.id}
                            onClick={() => onAddRecipe(recipe)}
                            className="w-full text-left bg-white p-3 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 flex items-center gap-3 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-bold text-gray-900">{recipe.name}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{recipe.calories} kcal • {recipe.prepTime} min</p>
                            </div>
                            <Plus className="w-4 h-4 text-gray-300 group-hover:text-emerald-600" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
