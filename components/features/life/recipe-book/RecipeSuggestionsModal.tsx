import React from 'react';
import { Recipe } from '@/types';
import { ChefHat, X, Clock, Users, Save } from 'lucide-react';

interface RecipeSuggestionsModalProps {
    isOpen: boolean;
    recipes: Recipe[];
    onClose: () => void;
    onSave: (recipe: Recipe) => void;
}

export const RecipeSuggestionsModal: React.FC<RecipeSuggestionsModalProps> = ({
    isOpen, recipes, onClose, onSave,
}) => {
    if (!isOpen || recipes.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <ChefHat className="w-6 h-6 text-purple-600" /> Recetas Sugeridas
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe, idx) => (
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
                                onClick={() => onSave(recipe)}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Guardar en Recetario
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
