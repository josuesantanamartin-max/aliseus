import React from 'react';
import { Recipe, MealTime } from '@/types';
import { MoreHorizontal, Copy, ClipboardPaste, Trash2, Flame } from 'lucide-react';
import { ViewMode } from './mealPlannerConstants';
import { MealSlot } from './MealSlot';

interface DayPlan {
    breakfast: Recipe[];
    lunch: Recipe[];
    dinner: Recipe[];
}

interface MealDayCardProps {
    date: Date;
    dayPlan: DayPlan;
    viewMode: ViewMode;
    language: string;
    plannerDate: Date;
    loadingRecipeId: string | null;
    openMenuId: string | null;
    openDayMenuId: string | null;
    copiedDay: { plan: any; date: string } | null;
    draggingItem: { date: string; meal: MealTime; index: number } | null;
    dragOverSlot: { date: string; meal: MealTime } | null;
    onDragOver: (e: React.DragEvent, dateKey: string, meal: MealTime) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, dateKey: string, meal: MealTime) => void;
    onDragStart: (e: React.DragEvent, recipe: Recipe, origin: { date: string; meal: MealTime; index: number }) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onRecipeClick: (recipe: Recipe) => void;
    onMenuToggle: (menuId: string | null) => void;
    onDayMenuToggle: (dateKey: string | null) => void;
    onCopyDay: (dateKey: string) => void;
    onPasteDay: (dateKey: string) => void;
    onClearDay: (dateKey: string) => void;
    onUpdateCourseType: (dateKey: string, meal: MealTime, index: number, newType: NonNullable<Recipe['courseType']>) => void;
    onRemoveRecipe: (dateKey: string, meal: MealTime, index: number) => void;
    onQuickAdd: (target: { date: string; meal: MealTime }) => void;
}

export const MealDayCard: React.FC<MealDayCardProps> = ({
    date, dayPlan, viewMode, language, plannerDate,
    loadingRecipeId, openMenuId, openDayMenuId, copiedDay,
    draggingItem, dragOverSlot,
    onDragOver, onDragLeave, onDrop,
    onDragStart, onDragEnd, onRecipeClick, onMenuToggle,
    onDayMenuToggle, onCopyDay, onPasteDay, onClearDay,
    onUpdateCourseType, onRemoveRecipe, onQuickAdd,
}) => {
    const dateKey = date.toISOString().split('T')[0];
    const isToday = new Date().toDateString() === date.toDateString();
    const isCurrentMonth = viewMode === 'month' ? date.getMonth() === plannerDate.getMonth() : true;
    const totalItems = Object.values(dayPlan).reduce((s, arr) => s + arr.length, 0);

    return (
        <div className={`rounded-3xl border flex flex-col gap-2 transition-all duration-300 relative group/day
            ${viewMode === 'month' ? 'min-h-[130px] p-2' : viewMode === 'biweek' ? 'min-h-[280px] p-3' : 'min-h-[480px] p-4'}
            ${!isCurrentMonth ? 'opacity-35 bg-gray-50 grayscale' : isToday ? 'bg-white border-emerald-300 shadow-[0_0_0_2px_rgba(16,185,129,0.15),0_4px_16px_rgba(16,185,129,0.08)]' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}
        `}>
            {/* Day Header */}
            <div className={`flex justify-between items-center pb-2 ${viewMode !== 'month' ? 'border-b border-gray-50' : ''}`}>
                <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-0.5 ${isToday ? 'text-emerald-500' : 'text-gray-300'}`}>
                        {date.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { weekday: 'short' })}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span className={`font-black leading-none ${viewMode === 'month' ? 'text-base' : 'text-xl'} ${isToday ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {date.getDate()}
                        </span>
                        {isToday && <span className="text-[7px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Hoy</span>}
                        {totalItems > 0 && viewMode === 'month' && <span className="text-[7px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">{totalItems}</span>}
                    </div>
                </div>

                {/* Daily Macros Summary */}
                {viewMode !== 'month' && (
                    <div className="hidden md:flex flex-col items-end opacity-60 group-hover/day:opacity-100 transition-opacity">
                        <div className="flex gap-2 text-[8px] font-black uppercase tracking-tighter">
                            <span className="text-blue-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.protein || 0), 0))}g P</span>
                            <span className="text-orange-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.carbs || 0), 0))}g C</span>
                            <span className="text-emerald-600">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.macros?.fat || 0), 0))}g G</span>
                        </div>
                        <div className="mt-1 flex gap-1 items-center">
                            <Flame className="w-2.5 h-2.5 text-orange-400" />
                            <span className="text-[9px] font-black text-gray-400">{Math.round(Object.values(dayPlan).flat().reduce((s, r) => s + (r.calories || 0), 0))} Kcal</span>
                        </div>
                    </div>
                )}

                {/* Day Menu */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDayMenuToggle(openDayMenuId === dateKey ? null : dateKey); }}
                        className={`p-1 rounded-lg text-gray-200 hover:text-gray-500 hover:bg-gray-50 transition-all opacity-0 group-hover/day:opacity-100 ${openDayMenuId === dateKey ? '!opacity-100 bg-gray-100 text-gray-500' : ''}`}
                    >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {openDayMenuId === dateKey && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1 w-28 z-50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                            <button onClick={() => onCopyDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-50 text-[10px] font-bold text-gray-600 flex items-center gap-2"><Copy className="w-3 h-3" /> Copiar</button>
                            {copiedDay && <button onClick={() => onPasteDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-[10px] font-bold text-emerald-600 flex items-center gap-2"><ClipboardPaste className="w-3 h-3" /> Pegar</button>}
                            <button onClick={() => onClearDay(dateKey)} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-[10px] font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Limpiar</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Meal Slots */}
            {(['breakfast', 'lunch', 'dinner'] as MealTime[]).map(meal => (
                <MealSlot
                    key={meal}
                    meal={meal}
                    items={dayPlan[meal] || []}
                    dateKey={dateKey}
                    viewMode={viewMode}
                    loadingRecipeId={loadingRecipeId}
                    openMenuId={openMenuId}
                    draggingItem={draggingItem}
                    dragOverSlot={dragOverSlot}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onRecipeClick={onRecipeClick}
                    onMenuToggle={onMenuToggle}
                    onUpdateCourseType={onUpdateCourseType}
                    onRemoveRecipe={onRemoveRecipe}
                    onQuickAdd={onQuickAdd}
                />
            ))}
        </div>
    );
};
