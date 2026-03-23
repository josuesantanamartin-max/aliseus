import React from 'react';
import { Recipe, MealTime } from '@/types';
import { PlusCircle } from 'lucide-react';
import { MEAL_CONFIG, MEAL_COLORS, COURSE_ORDER, ViewMode } from './mealPlannerConstants';
import { MealRecipeCard } from './MealRecipeCard';

interface MealSlotProps {
    meal: MealTime;
    items: Recipe[];
    dateKey: string;
    viewMode: ViewMode;
    loadingRecipeId: string | null;
    openMenuId: string | null;
    draggingItem: { date: string; meal: MealTime; index: number } | null;
    dragOverSlot: { date: string; meal: MealTime } | null;
    onDragOver: (e: React.DragEvent, dateKey: string, meal: MealTime) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, dateKey: string, meal: MealTime) => void;
    onDragStart: (e: React.DragEvent, recipe: Recipe, origin: { date: string; meal: MealTime; index: number }) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onRecipeClick: (recipe: Recipe) => void;
    onMenuToggle: (menuId: string | null) => void;
    onUpdateCourseType: (dateKey: string, meal: MealTime, index: number, newType: NonNullable<Recipe['courseType']>) => void;
    onRemoveRecipe: (dateKey: string, meal: MealTime, index: number) => void;
    onQuickAdd: (target: { date: string; meal: MealTime }) => void;
}

export const MealSlot: React.FC<MealSlotProps> = ({
    meal, items, dateKey, viewMode, loadingRecipeId,
    openMenuId, draggingItem, dragOverSlot,
    onDragOver, onDragLeave, onDrop,
    onDragStart, onDragEnd, onRecipeClick, onMenuToggle,
    onUpdateCourseType, onRemoveRecipe, onQuickAdd,
}) => {
    const mealCfg = MEAL_CONFIG[meal];
    const mealColors = MEAL_COLORS[meal];
    const isDropTarget = dragOverSlot?.date === dateKey && dragOverSlot?.meal === meal;

    const sortedIndices = items.map((_, i) => i).sort((a, b) => {
        const typeA = items[a].courseType || 'MAIN';
        const typeB = items[b].courseType || 'MAIN';
        return COURSE_ORDER.indexOf(typeA) - COURSE_ORDER.indexOf(typeB);
    });

    if (viewMode === 'month' && items.length === 0) return null;

    return (
        <div
            onDragOver={(e) => onDragOver(e, dateKey, meal)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, dateKey, meal)}
            className={`grow shrink-0 rounded-2xl border flex flex-col gap-1.5 transition-all duration-200 relative group/slot
                ${viewMode === 'month' ? 'min-h-[36px] p-1.5' : 'min-h-[130px] p-2.5'}
                ${isDropTarget
                    ? `${mealColors.dropBg} ${mealColors.dropBorder} border-2 shadow-md scale-[1.01]`
                    : items.length === 0
                        ? 'bg-gray-50/60 border-dashed border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                }`}
        >
            {/* Meal label */}
            {viewMode !== 'month' && (
                <div className={`flex items-center gap-1 px-1 ${items.length > 0 ? mealColors.text : 'text-gray-300'} transition-colors group-hover/slot:${mealColors.text}`}>
                    {mealCfg.icon}
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{mealCfg.label}</span>
                </div>
            )}

            {sortedIndices.map((originalIndex) => (
                <MealRecipeCard
                    key={`${items[originalIndex].id}-${originalIndex}`}
                    recipe={items[originalIndex]}
                    index={originalIndex}
                    dateKey={dateKey}
                    meal={meal}
                    viewMode={viewMode}
                    loadingRecipeId={loadingRecipeId}
                    openMenuId={openMenuId}
                    draggingItem={draggingItem}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onRecipeClick={onRecipeClick}
                    onMenuToggle={onMenuToggle}
                    onUpdateCourseType={onUpdateCourseType}
                    onRemoveRecipe={onRemoveRecipe}
                />
            ))}

            {/* Quick Add Button */}
            {viewMode !== 'month' && (
                <button
                    onClick={() => onQuickAdd({ date: dateKey, meal })}
                    className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-2 flex items-center justify-center gap-2 text-gray-300 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all opacity-0 group-hover/slot:opacity-100 mt-auto"
                >
                    <PlusCircle className="w-4 h-4" /> <span className="text-[9px] font-black uppercase tracking-widest">Añadir</span>
                </button>
            )}
        </div>
    );
};
