import React from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { AlertTriangle, ArrowRight, ShoppingCart } from 'lucide-react';

interface LowStockPantryWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const LowStockPantryWidget: React.FC<LowStockPantryWidgetProps> = ({ onNavigate }) => {
    const { pantryItems } = useLifeStore();

    const lowStockItems = pantryItems
        .filter((item: any) => item.quantity <= (item.lowStockThreshold || 1) && item.quantity > 0)
        .sort((a: any, b: any) => a.quantity - b.quantity)
        .slice(0, 5);

    const outOfStockItems = pantryItems
        .filter((item: any) => item.quantity === 0)
        .slice(0, 5);

    const displayItems = [...outOfStockItems, ...lowStockItems].slice(0, 6);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-aliseus-900 rounded-[2rem] border border-aliseus-100 dark:border-aliseus-800 p-6 shadow-sm relative overflow-hidden group/widget hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xl font-black text-aliseus-950 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg shadow-inner group-hover/widget:scale-110 transition-transform"><AlertTriangle className="w-5 h-5" /></div>
                    Despensa Baja
                </h3>
                <button onClick={() => onNavigate('life', 'kitchen-pantry')} className="text-xs font-bold text-aliseus-400 hover:text-amber-600 flex items-center gap-2 transition-colors group">
                    Despensa <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 relative z-10">
                {displayItems.length > 0 ? (
                    displayItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-3 hover:bg-aliseus-50 dark:hover:bg-aliseus-800/50 rounded-xl transition-colors group cursor-pointer" onClick={() => onNavigate('life', 'kitchen-pantry')}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.quantity === 0 ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/50 text-rose-600 dark:text-rose-400' : 'bg-amber-50 border-amber-100 dark:border-amber-800/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                                    {item.quantity === 0 ? <AlertTriangle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-aliseus-900 dark:text-white truncate">{item.name}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-aliseus-400 truncate">{item.category}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-base font-black tracking-tight ${item.quantity === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {item.quantity} {item.unit}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-aliseus-400">
                                    {item.quantity === 0 ? 'Agotado' : 'Bajo'}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6">
                        <ShoppingCart className="w-8 h-8 text-aliseus-200 mb-3" />
                        <p className="text-sm font-bold text-aliseus-400">Despensa bien surtida</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LowStockPantryWidget;
