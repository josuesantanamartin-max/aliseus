import React from 'react';
import { BookOpen, Search, GripVertical } from 'lucide-react';
import { Recipe } from '../../../../types';

interface RecipeSidebarProps {
    isOpen: boolean;
    search: string;
    setSearch: (s: string) => void;
    recipes: Recipe[];
    onDragStart: (e: React.DragEvent<HTMLDivElement>, recipe: Recipe) => void;
}

const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

export const RecipeSidebar: React.FC<RecipeSidebarProps> = ({
    isOpen, search, setSearch, recipes, onDragStart
}) => {
    if (!isOpen) return null;

    return (
        <div className="w-80 bg-white border-l border-gray-100 p-6 flex flex-col gap-4 shadow-xl shrink-0 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-gray-900 text-lg tracking-tight">Recetario</h3>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar receta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(recipe => (
                    <div
                        key={recipe.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, recipe)}
                        className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex items-center gap-3 transition-all hover:-translate-y-1"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                            <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{recipe.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{recipe.prepTime}m • {recipe.calories}kcal</p>
                        </div>
                        <GripVertical className="w-4 h-4 text-gray-300" />
                    </div>
                ))}
            </div>
        </div>
    );
};
