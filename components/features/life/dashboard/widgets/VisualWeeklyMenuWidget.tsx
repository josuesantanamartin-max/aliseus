import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { LayoutGrid, CalendarDays, Plus } from 'lucide-react';

interface VisualWeeklyMenuWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const VisualWeeklyMenuWidget: React.FC<VisualWeeklyMenuWidgetProps> = ({ onNavigate }) => {
    const { weeklyPlans = [] } = useLifeStore();

    // Obtener la semana actual
    const currentWeekPlan = useMemo(() => {
        const now = new Date();
        return weeklyPlans.find(plan => {
            const start = new Date(plan.weekStart);
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            return now >= start && now <= end;
        }) || weeklyPlans[0]; // Fallback al primero o null
    }, [weeklyPlans]);

    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];

    const getMeal = (dayIndex: number, type: string) => {
        if (!currentWeekPlan) return null;
        return currentWeekPlan.meals.find(m => m.dayOfWeek === dayIndex && m.type === type);
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-[2rem] h-full flex flex-col border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Planificación</p>
                    <h3 className="text-lg font-black text-aliseus-950 dark:text-white">Menú Semanal Visual</h3>
                </div>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar -mx-2 px-2">
                <div className="min-w-[400px]">
                    <div className="grid grid-cols-8 gap-1.5 mb-2">
                        <div className="col-span-1"></div>
                        {days.map(day => (
                            <div key={day} className="text-center">
                                <span className="text-[9px] font-black text-aliseus-400 uppercase tracking-tighter">{day}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1.5">
                        {mealTypes.map(type => (
                            <div key={type} className="grid grid-cols-8 gap-1.5 items-center">
                                <div className="col-span-1">
                                    <span className="text-[8px] font-black text-aliseus-500 dark:text-aliseus-400 uppercase tracking-tighter">
                                        {type === 'breakfast' ? 'Des.' : type === 'lunch' ? 'Com.' : 'Cen.'}
                                    </span>
                                </div>
                                {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                                    const meal = getMeal(dayIdx, type);
                                    return (
                                        <div 
                                            key={dayIdx}
                                            onClick={() => onNavigate('life', 'kitchen-planner')}
                                            className={`aspect-square rounded-lg border transition-all cursor-pointer flex items-center justify-center group/cell ${
                                                meal 
                                                    ? 'bg-emerald-500 border-emerald-600 dark:border-emerald-400 shadow-sm' 
                                                    : 'bg-aliseus-50 dark:bg-aliseus-800 border-dashed border-aliseus-200 dark:border-aliseus-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                                            }`}
                                            title={meal ? `${meal.recipeName}` : 'No planeado'}
                                        >
                                            {!meal && (
                                                <Plus className="w-3 h-3 text-aliseus-300 dark:text-aliseus-600 group-hover/cell:text-indigo-500 transition-colors" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] font-bold text-aliseus-500">Completado</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-aliseus-200 dark:bg-aliseus-700"></div>
                    <span className="text-[9px] font-bold text-aliseus-500">Vacio</span>
                </div>
            </div>
        </div>
    );
};

export default VisualWeeklyMenuWidget;
