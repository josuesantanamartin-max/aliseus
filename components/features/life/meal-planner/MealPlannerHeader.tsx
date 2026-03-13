import React from 'react';
import { ChefHat, Wand2, ShoppingCart, ChevronLeft, ChevronRight, Calendar, BookOpen, Trash2 } from 'lucide-react';
import { Language } from '../../../../types';

type ViewMode = 'week' | 'biweek' | 'month';

interface MealPlannerHeaderProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    setIsAiMenuOpen: (isOpen: boolean) => void;
    generateShoppingList: () => void;
    handleDateChange: (delta: number) => void;
    formatDateRange: () => string;
    isRecipeDrawerOpen: boolean;
    setIsRecipeDrawerOpen: (isOpen: boolean) => void;
    handleClearPlan: () => void;
    language: Language;
}

export const MealPlannerHeader: React.FC<MealPlannerHeaderProps> = ({
    viewMode, setViewMode, setIsAiMenuOpen, generateShoppingList,
    handleDateChange, formatDateRange, isRecipeDrawerOpen,
    setIsRecipeDrawerOpen, handleClearPlan, language
}) => {
    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-emerald-600" /> Planificador de Comidas
                    </h2>
                    <p className="text-gray-500 font-medium text-sm mt-1">Organiza tus menús semanales de forma eficiente</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>Semana</button>
                    <button onClick={() => setViewMode('biweek')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'biweek' ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>14 Días</button>
                    <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>Mes</button>
                    <button onClick={() => setIsAiMenuOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all">
                        <Wand2 className="w-4 h-4" /> IA Plan
                    </button>
                    <button onClick={generateShoppingList} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
                        <ShoppingCart className="w-4 h-4" /> Lista
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={() => handleDateChange(-1)} className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors active:scale-95">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[200px] justify-center">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="font-black text-gray-800 tracking-tight text-sm">
                            {formatDateRange()}
                        </span>
                    </div>
                    <button onClick={() => handleDateChange(1)} className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors active:scale-95">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsRecipeDrawerOpen(!isRecipeDrawerOpen)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${isRecipeDrawerOpen ? 'bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 shadow-sm'}`}>
                        <BookOpen className="w-3.5 h-3.5" /> {isRecipeDrawerOpen ? 'Cerrar' : 'Recetario'}
                    </button>

                    <button
                        onClick={handleClearPlan}
                        title={language === 'ES' ? 'Limpiar semana' : 'Clear week'}
                        className="flex items-center gap-2 bg-white border border-red-100 text-red-500 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </>
    );
};
