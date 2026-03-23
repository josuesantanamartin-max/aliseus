import React from 'react';

interface RecipeFiltersProps {
    filterMealType: string;
    setFilterMealType: (v: string) => void;
    filterPrepTime: string;
    setFilterPrepTime: (v: string) => void;
    filterCalories: string;
    setFilterCalories: (v: string) => void;
    filterWithWhatIHave: boolean;
    setFilterWithWhatIHave: (v: boolean) => void;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
    filterMealType, setFilterMealType,
    filterPrepTime, setFilterPrepTime,
    filterCalories, setFilterCalories,
    filterWithWhatIHave, setFilterWithWhatIHave,
}) => {
    const hasActiveFilters = filterMealType !== 'All' || filterPrepTime !== 'All' || filterCalories !== 'All' || filterWithWhatIHave;

    return (
        <div className="flex flex-wrap items-center gap-3">
            <select
                value={filterMealType}
                onChange={(e) => setFilterMealType(e.target.value)}
                className="bg-white border border-gray-200 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
            >
                <option value="All">Cualquiera</option>
                <option value="Desayuno">Desayuno</option>
                <option value="Almuerzo">Almuerzo</option>
                <option value="Cena">Cena</option>
            </select>

            <select
                value={filterPrepTime}
                onChange={(e) => setFilterPrepTime(e.target.value)}
                className="bg-white border border-gray-200 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
            >
                <option value="All">Cualquier tiempo</option>
                <option value="<15m">&lt; 15 min</option>
                <option value="<30m">&lt; 30 min</option>
                <option value="<60m">&lt; 1 hora</option>
            </select>

            <select
                value={filterCalories}
                onChange={(e) => setFilterCalories(e.target.value)}
                className="bg-white border border-gray-200 text-gray-600 text-[11px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
            >
                <option value="All">Cualquier Caloría</option>
                <option value="<300kcal">&lt; 300 kcal</option>
                <option value="<500kcal">&lt; 500 kcal</option>
            </select>

            <button
                onClick={() => setFilterWithWhatIHave(!filterWithWhatIHave)}
                className={`text-[11px] font-black uppercase tracking-widest rounded-lg px-4 py-1.5 transition-all shadow-sm ${filterWithWhatIHave ? 'bg-emerald-600 text-white border-transparent relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:animate-pulse' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
                Con lo que tengo hoy
            </button>

            {hasActiveFilters && (
                <button
                    onClick={() => {
                        setFilterMealType('All'); setFilterPrepTime('All'); setFilterCalories('All'); setFilterWithWhatIHave(false);
                    }}
                    className="text-[10px] font-bold text-gray-400 hover:text-red-500 hover:underline transition-colors ml-2"
                >
                    Limpiar Filtros
                </button>
            )}
        </div>
    );
};
