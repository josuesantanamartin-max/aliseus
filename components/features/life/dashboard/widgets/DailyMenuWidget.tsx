import React from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Utensils, Coffee, Sunset, Moon } from 'lucide-react';
import { useUserStore } from '../../../../../store/useUserStore';

interface DailyMenuWidgetProps {
    onNavigate: (app: string, tab: string) => void;
}

const DailyMenuWidget: React.FC<DailyMenuWidgetProps> = ({ onNavigate }) => {
    const { weeklyPlans } = useLifeStore();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMealsObj = weeklyPlans
        .flatMap(p => p.meals)
        .filter(m => m.date === todayStr)
        .reduce((acc, meal) => {
            if (!acc[meal.type]) acc[meal.type] = [];
            acc[meal.type].push({ ...meal, id: meal.recipeId, name: meal.recipeName });
            return acc;
        }, {} as Record<string, any[]>);

    const todayMeals = {
        breakfast: todayMealsObj.breakfast || [],
        lunch: todayMealsObj.lunch || [],
        dinner: todayMealsObj.dinner || []
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 text-aliseus-900 dark:text-white p-8 rounded-[2.5rem] relative overflow-hidden group border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all h-full">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Plan Gourmet</p>
                        <h3 className="text-2xl font-black tracking-tight text-aliseus-950 dark:text-white">Menú de Hoy</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                        <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { key: 'breakfast', label: 'Desayuno', time: '08:30', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900/50' },
                        { key: 'lunch', label: 'Comida', time: '14:00', icon: Sunset, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/50' },
                        { key: 'dinner', label: 'Cena', time: '21:00', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-900/50' }
                    ].map(meal => (
                        <div
                            key={meal.key}
                            onClick={() => {
                                const mealItem = todayMeals[meal.key as keyof typeof todayMeals]?.[0];
                                if (mealItem) {
                                    useLifeStore.getState().setRecipeToOpen(mealItem);
                                    onNavigate('life', 'kitchen-recipes');
                                }
                            }}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer group/item ${meal.bg} ${meal.border} hover:shadow-sm`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <meal.icon className={`w-4 h-4 ${meal.color}`} />
                                <span className="text-[10px] font-black text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest">{meal.time}</span>
                            </div>
                            <p className="text-[10px] font-black text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest mb-1">{meal.label}</p>
                            <p className="font-bold text-sm text-aliseus-900 dark:text-white truncate group-hover/item:text-indigo-primary transition-colors">
                                {todayMeals[meal.key as keyof typeof todayMeals]?.length > 0
                                    ? todayMeals[meal.key as keyof typeof todayMeals][0].name
                                    : 'No planeado'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyMenuWidget;
