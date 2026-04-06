import React from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { ShoppingCart, Check, Plus } from 'lucide-react';

interface ShoppingListWidgetProps {
    onNavigate: (app: string, tab: string) => void;
}

const ShoppingListWidget: React.FC<ShoppingListWidgetProps> = ({ onNavigate }) => {
    const { shoppingList } = useLifeStore();
    const topItems = shoppingList.filter(i => !i.checked).slice(0, 4);

    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-aliseus-800 hover:shadow-lg transition-all h-full relative group">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Lista de Compra
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {shoppingList.filter(i => !i.checked).length} pendientes
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('life', 'grocery-list')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-aliseus-800 rounded-full text-indigo-600 dark:text-indigo-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {topItems.length > 0 ? (
                    topItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-aliseus-800 rounded-xl border border-gray-100 dark:border-aliseus-700/50">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                {item.checked && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} {item.unit}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-gray-400 dark:text-gray-600">
                        <p className="text-sm">Todo comprado 🎉</p>
                    </div>
                )}
            </div>

            {shoppingList.length > 4 && (
                <button onClick={() => onNavigate('life', 'grocery-list')} className="w-full mt-4 text-xs font-bold text-center text-gray-400 hover:text-indigo-600 transition-colors">
                    Ver {shoppingList.length - 4} más...
                </button>
            )}
        </div>
    );
};

export default ShoppingListWidget;
