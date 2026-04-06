import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Timer, Zap, History } from 'lucide-react';

interface AverageRecipeTimeWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const AverageRecipeTimeWidget: React.FC<AverageRecipeTimeWidgetProps> = ({ onNavigate }) => {
    const { recipes = [] } = useLifeStore();

    const stats = useMemo(() => {
        if (recipes.length === 0) return { avg: 0, fast: 0 };
        
        const validRecipes = recipes.filter(r => r.prepTime > 0);
        const totalTime = validRecipes.reduce((sum, r) => sum + r.prepTime + (r.cookTime || 0), 0);
        const avg = validRecipes.length > 0 ? totalTime / validRecipes.length : 0;
        
        const fastRecipes = recipes.filter(r => (r.prepTime + (r.cookTime || 0)) <= 20).length;

        return { avg: Math.round(avg), fast: fastRecipes };
    }, [recipes]);

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-[2rem] h-full flex flex-col border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-amber-500 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Productividad</p>
                    <h3 className="text-lg font-black text-aliseus-950 dark:text-white">Tiempo de Recetas</h3>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <Timer className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-6xl font-black tracking-tighter text-aliseus-950 dark:text-white">
                        {stats.avg}
                    </span>
                    <span className="text-xl font-black text-aliseus-400 uppercase tracking-tighter">min</span>
                </div>
                <p className="text-[10px] font-black text-aliseus-400 uppercase tracking-widest">Media por Plato</p>

                <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-aliseus-900 rounded-xl shadow-sm">
                            <Zap className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-aliseus-900 dark:text-white leading-tight">
                                {stats.fast} recetas rápidas
                            </p>
                            <p className="text-[10px] font-bold text-aliseus-500">Listas en menos de 20 min</p>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => onNavigate('life', 'kitchen-recipes')}
                className="mt-6 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-aliseus-100 dark:border-aliseus-800 rounded-2xl text-[10px] font-black text-aliseus-400 hover:text-amber-500 hover:border-amber-200 transition-all uppercase tracking-widest"
            >
                <History className="w-3.5 h-3.5" />
                Explorar archivos
            </button>
        </div>
    );
};

export default AverageRecipeTimeWidget;
