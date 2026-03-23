import React from 'react';
import { Recipe, MealTime } from '@/types';
import { MoreHorizontal, BookOpen, Trash2, Loader2 } from 'lucide-react';
import { COURSE_LABELS, DEFAULT_FOOD_IMG, ViewMode } from './mealPlannerConstants';

interface MealRecipeCardProps {
    recipe: Recipe;
    index: number;
    dateKey: string;
    meal: MealTime;
    viewMode: ViewMode;
    loadingRecipeId: string | null;
    openMenuId: string | null;
    draggingItem: { date: string; meal: MealTime; index: number } | null;
    onDragStart: (e: React.DragEvent, recipe: Recipe, origin: { date: string; meal: MealTime; index: number }) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onRecipeClick: (recipe: Recipe) => void;
    onMenuToggle: (menuId: string | null) => void;
    onUpdateCourseType: (dateKey: string, meal: MealTime, index: number, newType: NonNullable<Recipe['courseType']>) => void;
    onRemoveRecipe: (dateKey: string, meal: MealTime, index: number) => void;
}

export const MealRecipeCard: React.FC<MealRecipeCardProps> = ({
    recipe, index, dateKey, meal, viewMode, loadingRecipeId,
    openMenuId, draggingItem,
    onDragStart, onDragEnd, onRecipeClick, onMenuToggle,
    onUpdateCourseType, onRemoveRecipe,
}) => {
    const menuId = `${dateKey}-${meal}-${index}`;
    const isMenuOpen = openMenuId === menuId;
    const isDragging = draggingItem?.date === dateKey && draggingItem?.meal === meal && draggingItem?.index === index;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, recipe, { date: dateKey, meal, index })}
            onDragEnd={onDragEnd}
            className={`bg-white rounded-xl border border-gray-100 group relative cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.02] transition-all select-none
                ${isDragging ? 'opacity-20 grayscale border-dashed border-emerald-300 scale-95' : ''}
                ${isMenuOpen ? 'z-[60] shadow-lg ring-1 ring-emerald-100' : 'z-10'}
                ${viewMode === 'month' ? 'p-1' : 'p-2'}
            `}
        >
            <div className="flex gap-2 items-center" onClick={() => onRecipeClick(recipe)} style={{ cursor: 'pointer' }}>
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
                        onClick={(e) => { e.stopPropagation(); onMenuToggle(isMenuOpen ? null : menuId); }}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 w-32 z-50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-1 mb-1 p-1 bg-gray-50 rounded-lg justify-center">
                                <button title="1er Plato" onClick={() => onUpdateCourseType(dateKey, meal, index, 'STARTER')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'STARTER' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`} />
                                <button title="2º Plato" onClick={() => onUpdateCourseType(dateKey, meal, index, 'MAIN')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'MAIN' ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`} />
                                <button title="Postre" onClick={() => onUpdateCourseType(dateKey, meal, index, 'DESSERT')} className={`w-4 h-4 rounded-full border ${recipe.courseType === 'DESSERT' ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'}`} />
                            </div>
                            <button onClick={() => { onRecipeClick(recipe); onMenuToggle(null); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-[10px] font-bold text-gray-600 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Ver</button>
                            <button onClick={() => { onRemoveRecipe(dateKey, meal, index); onMenuToggle(null); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-[10px] font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Eliminar</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
