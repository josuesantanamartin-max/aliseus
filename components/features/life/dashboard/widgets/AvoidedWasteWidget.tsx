import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Sprout, TrendingDown, Leaf, Award } from 'lucide-react';

interface AvoidedWasteWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const AvoidedWasteWidget: React.FC<AvoidedWasteWidgetProps> = ({ onNavigate }) => {
    const { pantryItems = [] } = useLifeStore();

    // Mock calculations based on pantry state or history if available
    const wasteStats = useMemo(() => {
        // En una app real, esto vendría de un log de consumos vs tirados
        // Por ahora simulamos basado en items en la despensa que han rotado bien
        const count = pantryItems.length;
        const kg = count * 0.45; // Estimado
        const eur = count * 2.80; // Estimado

        return { kg, eur, count };
    }, [pantryItems]);

    return (
        <div className="bg-aliseus-950 dark:bg-white p-8 rounded-[2.5rem] h-full flex flex-col text-white dark:text-aliseus-950 shadow-2xl relative overflow-hidden group">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Leaf className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-1.5 bg-emerald-500 rounded-lg">
                                <Award className="w-3 h-3 text-white" />
                            </span>
                            <p className="text-emerald-400 dark:text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em]">Hito Impacto</p>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-white dark:text-aliseus-950">Desperdicio Evitado</h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black tracking-tighter">{wasteStats.eur.toFixed(0)}</span>
                            <span className="text-xl font-bold opacity-50">€</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">Ahorro Real</p>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black tracking-tighter">{wasteStats.kg.toFixed(0)}</span>
                            <span className="text-xl font-bold opacity-50">kg</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">Impacto Eco</p>
                    </div>
                </div>

                <div className="mt-12 p-4 rounded-3xl bg-white/10 dark:bg-aliseus-100 border border-white/10 dark:border-aliseus-200">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            <Sprout className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black leading-tight">Cero Residuo</p>
                            <p className="text-[10px] font-medium opacity-60">Has salvado {wasteStats.count} productos este mes.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 dark:border-aliseus-200 flex justify-between items-center text-[10px] font-black uppercase tracking-widest cursor-pointer group/btn" onClick={() => onNavigate('life', 'kitchen-pantry')}>
                <span className="group-hover/btn:translate-x-1 transition-transform">Ver historial de ahorro</span>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            </div>
        </div>
    );
};

export default AvoidedWasteWidget;
