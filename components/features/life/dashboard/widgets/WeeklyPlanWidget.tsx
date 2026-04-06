import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Calendar, UtensilsCrossed, AlertCircle } from 'lucide-react';

interface WeeklyPlanWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const WeeklyPlanWidget: React.FC<WeeklyPlanWidgetProps> = ({ onNavigate }) => {
    const { weeklyPlans = [] } = useLifeStore();

    // Obtener plan de la semana actual
    const currentWeekPlan = useMemo(() => {
        if (!weeklyPlans || weeklyPlans.length === 0) return null;

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        return weeklyPlans.find(plan => {
            const planDate = new Date(plan.weekStart);
            return planDate.toDateString() === startOfWeek.toDateString();
        });
    }, [weeklyPlans]);

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getMealsForDay = (dayIndex: number) => {
        if (!currentWeekPlan) return [];
        return currentWeekPlan.meals.filter(meal => meal.dayOfWeek === dayIndex);
    };

    const plannedDays = useMemo(() => {
        if (!currentWeekPlan) return 0;
        return daysOfWeek.filter((_, index) => getMealsForDay(index).length > 0).length;
    }, [currentWeekPlan]);

    const today = new Date().getDay();

    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-aliseus-800 hover:shadow-lg transition-all h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Plan Semanal
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {plannedDays} de 7 días planificados
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('life', 'weekly-plan')}
                    className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline"
                >
                    Planificar
                </button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1">
                {daysOfWeek.map((day, index) => {
                    const meals = getMealsForDay(index);
                    const isToday = index === today;
                    const hasPlans = meals.length > 0;

                    return (
                        <div
                            key={index}
                            onClick={() => onNavigate('life', 'weekly-plan')}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${isToday
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-900/50'
                                    : hasPlans
                                        ? 'bg-gray-50 dark:bg-aliseus-800 border-gray-200 dark:border-aliseus-700 hover:bg-white dark:hover:bg-aliseus-700'
                                        : 'bg-white dark:bg-aliseus-900 border-gray-200 dark:border-aliseus-700 opacity-50 hover:opacity-100'
                                }`}
                        >
                            {/* Day Name */}
                            <div className={`text-center mb-1 ${isToday ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                <p className="text-xs font-black uppercase">{day}</p>
                            </div>

                            {/* Meals Indicator */}
                            <div className="flex flex-col items-center gap-1">
                                {hasPlans ? (
                                    <>
                                        <UtensilsCrossed className={`w-4 h-4 ${isToday ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                                            }`} />
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                            {meals.length}
                                        </span>
                                    </>
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-aliseus-700" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            {!currentWeekPlan && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-900/50">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <p className="text-xs font-bold text-orange-800 dark:text-orange-200">
                            No hay plan para esta semana
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyPlanWidget;
