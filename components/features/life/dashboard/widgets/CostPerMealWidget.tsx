import React, { useMemo } from 'react';
import { useFinanceStore } from '../../../../../store/useFinanceStore';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Banknote, TrendingDown, Info } from 'lucide-react';

interface CostPerMealWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const CostPerMealWidget: React.FC<CostPerMealWidgetProps> = ({ onNavigate }) => {
    const { transactions = [] } = useFinanceStore();
    const { weeklyPlans = [] } = useLifeStore();

    const stats = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Gasto en comida este mes (categoría 'Alimentación' o similar)
        const foodExpenses = transactions
            .filter(tx => 
                tx.type === 'EXPENSE' && 
                new Date(tx.date) >= firstDayOfMonth &&
                (tx.category?.toLowerCase() === 'alimentación' || tx.category?.toLowerCase() === 'comida')
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Número de comidas planificadas este mes
        const plannedMealsCount = weeklyPlans
            .filter(plan => new Date(plan.weekStart) >= firstDayOfMonth)
            .reduce((sum, plan) => sum + plan.meals.length, 0) || 1; // Evitar división por cero

        const costPerMeal = foodExpenses / plannedMealsCount;

        return { foodExpenses, plannedMealsCount, costPerMeal };
    }, [transactions, weeklyPlans]);

    return (
        <div className="bg-white dark:bg-onyx-900 p-6 rounded-[2rem] h-full flex flex-col border border-onyx-100 dark:border-onyx-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Análisis de Gasto</p>
                    <h3 className="text-lg font-black text-onyx-950 dark:text-white">Coste por Comida</h3>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-black tracking-tighter text-onyx-950 dark:text-white">
                        {stats.costPerMeal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xl font-black text-onyx-400">€</span>
                </div>
                <p className="text-[10px] font-bold text-onyx-500 uppercase tracking-widest">Promedio Real</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-onyx-50 dark:bg-onyx-800/50">
                        <p className="text-[9px] font-black text-onyx-400 uppercase tracking-tighter mb-1">Gasto Mes</p>
                        <p className="text-sm font-black text-onyx-900 dark:text-white">{stats.foodExpenses.toFixed(0)}€</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-onyx-50 dark:bg-onyx-800/50">
                        <p className="text-[9px] font-black text-onyx-400 uppercase tracking-tighter mb-1">Comidas</p>
                        <p className="text-sm font-black text-onyx-900 dark:text-white">{stats.plannedMealsCount}</p>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Un 12% menos que el mes pasado</span>
            </div>
        </div>
    );
};

export default CostPerMealWidget;
