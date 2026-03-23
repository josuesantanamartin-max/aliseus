import React from 'react';
import { Recipe } from '@/types';
import { Clock, Users, Flame, CalendarPlus, X } from 'lucide-react';

const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

interface RecipeDetailModalProps {
    recipe: Recipe | null;
    onClose: () => void;
    onPlanRecipe: (recipe: Recipe) => void;
    onCookRecipe: (recipe: Recipe) => void;
    onEditRecipe: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
    recipe, onClose, onPlanRecipe, onCookRecipe, onEditRecipe,
}) => {
    if (!recipe) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[95vh] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                    <img src={recipe.image || DEFAULT_FOOD_IMG} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent md:to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h2 className="text-4xl font-black mb-4 leading-tight drop-shadow-2xl">{recipe.name}</h2>
                        <div className="flex flex-wrap gap-3">
                            <span className="bg-emerald-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <Clock className="w-4 h-4" /> {recipe.prepTime} min
                            </span>
                            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <Users className="w-4 h-4" /> {recipe.baseServings} Pax
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
                                { label: 'CALORÍAS', value: Math.round(recipe.calories || 0), sub: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50' },
                                { label: 'PROTEÍNA', value: Math.round(recipe.macros?.protein || 0), sub: 'g', color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'CARBOS', value: Math.round(recipe.macros?.carbs || 0), sub: 'g', color: 'text-orange-500', bg: 'bg-orange-50/50' },
                                { label: 'GRASAS', value: Math.round(recipe.macros?.fat || 0), sub: 'g', color: 'text-emerald-600', bg: 'bg-emerald-50' }
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
                                    {recipe.ingredients.map((ing, idx) => (
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
                                    {recipe.instructions.map((step, idx) => (
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
                            onClick={() => { onClose(); onPlanRecipe(recipe); }}
                            className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <CalendarPlus className="w-5 h-5" /> Planificar
                        </button>
                        <button
                            onClick={() => { onClose(); onCookRecipe(recipe); }}
                            className="flex-1 bg-gradient-to-r from-gray-900 to-black text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Flame className="w-5 h-5 text-emerald-500" /> Comenzar a Cocinar
                        </button>
                        <button
                            onClick={() => { onClose(); onEditRecipe(recipe); }}
                            className="px-8 bg-gray-50 text-gray-400 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                        >
                            Editar
                        </button>
                    </div>
                </div>

                {/* Floating Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full transition-all border border-white/20 shadow-2xl"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
