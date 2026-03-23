import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { PieChart, Zap, Target } from 'lucide-react';

interface NutritionalVarietyWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const NutritionalVarietyWidget: React.FC<NutritionalVarietyWidgetProps> = ({ onNavigate }) => {
    const { weeklyPlans = [], recipes = [] } = useLifeStore();

    const chartData = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const cookedRecipeIds = weeklyPlans
            .filter(plan => new Date(plan.weekStart) >= firstDayOfMonth)
            .flatMap(plan => plan.meals.map(m => m.recipeId));

        const categoriesCount: Record<string, number> = {};
        cookedRecipeIds.forEach(id => {
            const recipe = recipes.find(r => r.id === id);
            if (recipe) {
                recipe.tags.forEach(tag => {
                    categoriesCount[tag] = (categoriesCount[tag] || 0) + 1;
                });
            }
        });

        // Seleccionar las 4 más comunes
        return Object.entries(categoriesCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
    }, [weeklyPlans, recipes]);

    return (
        <div className="bg-white dark:bg-onyx-900 p-6 rounded-[2rem] h-full flex flex-col border border-onyx-100 dark:border-onyx-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Salud y Dieta</p>
                    <h3 className="text-lg font-black text-onyx-950 dark:text-white">Variedad Nutricional</h3>
                </div>
                <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
                    <PieChart className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
            </div>

            <div className="flex-1 space-y-4">
                {chartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Zap className="w-8 h-8 text-onyx-200 dark:text-onyx-700 mb-2" />
                        <p className="text-xs font-bold text-onyx-400 dark:text-onyx-500">Planifica para ver balance</p>
                    </div>
                ) : (
                    chartData.map((item, idx) => {
                        const colors = [
                            'bg-emerald-500', 
                            'bg-amber-500', 
                            'bg-blue-500', 
                            'bg-rose-500'
                        ];
                        const total = chartData.reduce((sum, i) => sum + i.count, 0);
                        const percent = Math.round((item.count / total) * 100);

                        return (
                            <div key={item.name} className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                    <span className="text-onyx-900 dark:text-white">{item.name}</span>
                                    <span className="text-onyx-400">{percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-onyx-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${colors[idx % colors.length]} transition-all duration-1000`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6 flex items-center justify-between p-3 rounded-2xl bg-onyx-50 dark:bg-onyx-800/50 border border-onyx-100 dark:border-onyx-700/50">
                <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    <span className="text-[10px] font-black text-onyx-900 dark:text-white uppercase tracking-tighter">Estado: Balanceado</span>
                </div>
                <ArrowRight className="w-3 h-3 text-onyx-300" />
            </div>
        </div>
    );
};

const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
    </svg>
);

export default NutritionalVarietyWidget;
