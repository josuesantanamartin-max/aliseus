import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { PackageSearch, ShoppingCart, Plus, Minus } from 'lucide-react';

interface LowStockProductsWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const LowStockProductsWidget: React.FC<LowStockProductsWidgetProps> = ({ onNavigate }) => {
    const { pantryItems = [], addShoppingItem } = useLifeStore();

    const lowStockItems = useMemo(() => {
        return pantryItems
            .filter(item => {
                const threshold = item.lowStockThreshold || (item.unit === 'pcs' ? 2 : 1);
                return item.quantity <= threshold;
            })
            .slice(0, 4);
    }, [pantryItems]);

    const addToShoppingList = (item: any) => {
        addShoppingItem({
            id: crypto.randomUUID(),
            name: item.name,
            quantity: 1,
            unit: item.unit,
            checked: false,
            category: item.category,
            source: { type: 'MANUAL' }
        });
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-[2rem] h-full flex flex-col border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Inventario</p>
                    <h3 className="text-lg font-black text-aliseus-950 dark:text-white">Bajo Mínimos</h3>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <PackageSearch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
                {lowStockItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-4">
                        <ShoppingCart className="w-8 h-8 text-aliseus-200 dark:text-aliseus-700 mb-2" />
                        <p className="text-xs font-bold text-aliseus-400 dark:text-aliseus-500">Despensa bien surtida</p>
                    </div>
                ) : (
                    lowStockItems.map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-aliseus-50/50 dark:bg-aliseus-800/50 border border-aliseus-100 dark:border-aliseus-700/50 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                                <h4 className="text-xs font-bold text-aliseus-900 dark:text-white truncate">{item.name}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                                        {item.quantity} {item.unit}
                                    </span>
                                    <span className="text-[8px] font-bold text-aliseus-400 dark:text-aliseus-500 uppercase">
                                        mín: {item.lowStockThreshold || (item.unit === 'pcs' ? 2 : 1)}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => addToShoppingList(item)}
                                className="p-2 bg-aliseus-900 dark:bg-white text-white dark:text-aliseus-900 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                                title="Añadir a lista"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button 
                onClick={() => onNavigate('life', 'shopping')}
                className="mt-4 w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-aliseus-500 dark:text-aliseus-400 hover:text-amber-600 dark:hover:text-amber-400 border-t border-aliseus-100 dark:border-aliseus-800 transition-colors"
            >
                Ir a lista de compra
            </button>
        </div>
    );
};

export default LowStockProductsWidget;
