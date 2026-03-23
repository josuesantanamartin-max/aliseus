import React from 'react';
import { Recipe } from '@/types';
import { Clock, Flame, Pencil, CalendarPlus } from 'lucide-react';

const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

interface RecipeGridProps {
    recipes: Recipe[];
    onViewRecipe: (recipe: Recipe) => void;
    onPlanRecipe: (recipe: Recipe) => void;
    onCookRecipe: (recipe: Recipe) => void;
    onEditRecipe: (recipe: Recipe) => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
    recipes, onViewRecipe, onPlanRecipe, onCookRecipe, onEditRecipe,
}) => (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((recipe: Recipe) => (
                <div
                    key={recipe.id}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group overflow-hidden cursor-pointer flex flex-col h-full"
                    onClick={() => onViewRecipe(recipe)}
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
                                onClick={(e) => { e.stopPropagation(); onPlanRecipe(recipe); }}
                                className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                            >
                                <CalendarPlus className="w-4 h-4" /> Planificar
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onCookRecipe(recipe); }}
                                className="flex-1 py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                            >
                                <Flame className="w-4 h-4" /> Cocinar
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onEditRecipe(recipe); }}
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
);
