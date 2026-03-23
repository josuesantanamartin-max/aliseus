import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { CalendarX, ArrowUpRight } from 'lucide-react';

interface UnplannedDaysWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const UnplannedDaysWidget: React.FC<UnplannedDaysWidgetProps> = ({ onNavigate }) => {
    const { weeklyPlans = [] } = useLifeStore();

    const unplannedCount = useMemo(() => {
        const now = new Date();
        const currentWeekPlan = weeklyPlans.find(plan => {
            const start = new Date(plan.weekStart);
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            return now >= start && now <= end;
        });

        if (!currentWeekPlan) return 7;

        // Contar días únicos con al menos una comida planificada
        const plannedDays = new Set(currentWeekPlan.meals.map(m => m.dayOfWeek));
        return 7 - plannedDays.size;
    }, [weeklyPlans]);

    return (
        <div 
            onClick={() => onNavigate('life', 'kitchen-planner')}
            className="group cursor-pointer bg-white dark:bg-onyx-900 p-6 rounded-[2rem] h-full flex flex-col border border-onyx-100 dark:border-onyx-800 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl border transition-colors ${
                    unplannedCount > 2 ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                    <CalendarX className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-onyx-400 dark:text-onyx-500">Plan de la Semana</p>
                    <h3 className="text-lg font-black text-onyx-950 dark:text-white">Días sin Planificar</h3>
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-6xl font-black tracking-tighter ${
                    unplannedCount > 2 ? 'text-onyx-950 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                    {unplannedCount}
                </span>
                <span className="text-sm font-bold text-onyx-400 uppercase">días</span>
            </div>

            <div className="mt-auto flex items-center justify-between">
                <p className="text-[10px] font-bold text-onyx-500 max-w-[120px]">
                    {unplannedCount === 0 ? '¡Semana completa!' : 'Haz clic para completar la planificación.'}
                </p>
                <div className="p-2 bg-onyx-50 dark:bg-onyx-800 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

export default UnplannedDaysWidget;
