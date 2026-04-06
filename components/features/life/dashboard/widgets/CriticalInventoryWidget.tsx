import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { AlertTriangle, Package, Calendar, ShoppingCart } from 'lucide-react';

interface CriticalInventoryWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const CriticalInventoryWidget: React.FC<CriticalInventoryWidgetProps> = ({ onNavigate }) => {
    const { pantryItems = [] } = useLifeStore();

    // Items con stock bajo o próximos a vencer
    const criticalItems = useMemo(() => {
        const today = new Date();
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        return pantryItems
            .filter(item => {
                const isLowStock = item.quantity <= 2;
                const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) <= sevenDaysFromNow;
                return isLowStock || isExpiringSoon;
            })
            .slice(0, 5);
    }, [pantryItems]);

    const lowStockItems = criticalItems.filter(item => item.quantity <= 2);
    const expiringSoonItems = criticalItems.filter(item => {
        if (!item.expiryDate) return false;
        const today = new Date();
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        return new Date(item.expiryDate) <= sevenDaysFromNow;
    });

    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-aliseus-800 hover:shadow-lg transition-all h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Inventario Crítico
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {criticalItems.length} items requieren atención
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('life', 'pantry')}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                >
                    Ver despensa
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-900/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Stock Bajo</span>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{lowStockItems.length}</p>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">Por Vencer</span>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{expiringSoonItems.length}</p>
                </div>
            </div>

            {/* Critical Items List */}
            <div className="space-y-2 flex-1 overflow-y-auto">
                {criticalItems.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            Todo en orden
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            No hay items críticos
                        </p>
                    </div>
                ) : (
                    criticalItems.map((item) => {
                        const isLowStock = item.quantity <= 2;
                        const daysUntilExpiry = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : null;
                        const isExpiring = daysUntilExpiry !== null && daysUntilExpiry <= 7;

                        return (
                            <div
                                key={item.id}
                                className={`p-3 rounded-xl border transition-all ${isExpiring && daysUntilExpiry! <= 2
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                                    : isLowStock
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50'
                                        : 'bg-gray-50 dark:bg-aliseus-800 border-gray-200 dark:border-aliseus-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isLowStock && (
                                                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                                    Stock: {item.quantity} {item.unit}
                                                </span>
                                            )}
                                            {isExpiring && daysUntilExpiry !== null && (
                                                <span className={`text-xs font-bold ${daysUntilExpiry <= 2
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-orange-600 dark:text-orange-400'
                                                    }`}>
                                                    {daysUntilExpiry === 0 ? 'Vence hoy' :
                                                        daysUntilExpiry === 1 ? 'Vence mañana' :
                                                            `Vence en ${daysUntilExpiry}d`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate('life', 'shopping');
                                        }}
                                        className="ml-2 p-1.5 bg-white dark:bg-aliseus-900 rounded-lg border border-gray-200 dark:border-aliseus-700 hover:bg-gray-50 dark:hover:bg-aliseus-800 transition-colors"
                                        title="Añadir a lista de compra"
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CriticalInventoryWidget;
