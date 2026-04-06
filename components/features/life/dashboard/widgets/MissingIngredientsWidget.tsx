import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { ListChecks, ShoppingBasket, ArrowRight, CheckCircle2 } from 'lucide-react';

interface MissingIngredientsWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const MissingIngredientsWidget: React.FC<MissingIngredientsWidgetProps> = ({ onNavigate }) => {
    const { weeklyPlans = [], pantryItems = [] } = useLifeStore();

    const missingIngredients = useMemo(() => {
        const now = new Date();
        const currentWeekPlan = weeklyPlans.find(plan => {
            const start = new Date(plan.weekStart);
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            return now >= start && now <= end;
        });

        if (!currentWeekPlan) return [];

        const needed = new Map<string, number>();
        currentWeekPlan.meals.forEach(meal => {
            // Asumiendo que tenemos ingredientes en el MealPlan o que podemos buscarlos
            // Por ahora usamos un mock si no hay ingredientes detallados
            const mealIngredients = meal.ingredients || []; 
            mealIngredients.forEach(ing => {
                const current = needed.get(ing.name) || 0;
                needed.set(ing.name, current + ing.quantity);
            });
        });

        const missing: any[] = [];
        needed.forEach((qty, name) => {
            const inPantry = pantryItems.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
            if (!inPantry || inPantry.quantity < qty) {
                missing.push({ name, needed: qty, has: inPantry?.quantity || 0, unit: inPantry?.unit || 'uds' });
            }
        });

        return missing.slice(0, 4);
    }, [weeklyPlans, pantryItems]);

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-[2rem] h-full flex flex-col border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Stock vs Plan</p>
                    <h3 className="text-lg font-black text-aliseus-950 dark:text-white">Ingredientes que Faltan</h3>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
                {missingIngredients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                        <p className="text-xs font-bold text-aliseus-900 dark:text-white">¡Tienes todo para la semana!</p>
                        <p className="text-[10px] text-aliseus-500 mt-1">Tu despensa cubre el menú actual.</p>
                    </div>
                ) : (
                    missingIngredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-aliseus-50/50 dark:bg-aliseus-800/50 border border-aliseus-100 dark:border-aliseus-700/50">
                            <div className="min-w-0 pr-2">
                                <h4 className="text-xs font-bold text-aliseus-900 dark:text-white truncate">{ing.name}</h4>
                                <p className="text-[10px] text-aliseus-500">
                                    Faltan: <span className="font-black text-blue-600 dark:text-blue-400">{Math.max(0, ing.needed - ing.has)} {ing.unit}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-aliseus-400 line-through">{ing.has}</span>
                                <ArrowRight className="w-2.5 h-2.5 text-aliseus-300" />
                                <span className="text-[10px] font-black text-aliseus-900 dark:text-white">{ing.needed}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button 
                onClick={() => onNavigate('life', 'shopping')}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-aliseus-950 dark:bg-white text-white dark:text-aliseus-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            >
                <ShoppingBasket className="w-3.5 h-3.5" />
                Actualizar Lista
            </button>
        </div>
    );
};

export default MissingIngredientsWidget;
