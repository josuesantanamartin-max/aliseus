import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Calendar, AlertCircle, Plus, ShoppingCart } from 'lucide-react';

interface ExpiringThisWeekWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const ExpiringThisWeekWidget: React.FC<ExpiringThisWeekWidgetProps> = ({ onNavigate }) => {
    const { pantryItems = [] } = useLifeStore();

    const expiringItems = useMemo(() => {
        const today = new Date();
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        return pantryItems
            .filter(item => {
                if (!item.expiryDate) return false;
                const expiry = new Date(item.expiryDate);
                return expiry >= today && expiry <= sevenDaysFromNow;
            })
            .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
            .slice(0, 4);
    }, [pantryItems]);

    const getDaysRemaining = (dateStr: string) => {
        const today = new Date();
        const expiry = new Date(dateStr);
        const diff = expiry.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-[2rem] h-full flex flex-col border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Alerta de Frescura</p>
                    <h3 className="text-lg font-black text-aliseus-950 dark:text-white">Caduca esta Semana</h3>
                </div>
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                    <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
                {expiringItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-4">
                        <AlertCircle className="w-8 h-8 text-aliseus-200 dark:text-aliseus-700 mb-2" />
                        <p className="text-xs font-bold text-aliseus-400 dark:text-aliseus-500">Todo fresco por ahora</p>
                    </div>
                ) : (
                    expiringItems.map(item => {
                        const days = getDaysRemaining(item.expiryDate!);
                        return (
                            <div key={item.id} className="group p-3 rounded-xl bg-aliseus-50/50 dark:bg-aliseus-800/50 border border-aliseus-100 dark:border-aliseus-700/50 hover:bg-white dark:hover:bg-aliseus-800 hover:border-red-200 dark:hover:border-red-900/30 transition-all">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-xs font-bold text-aliseus-900 dark:text-white truncate pr-2">{item.name}</h4>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                                        days <= 2 ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                                    }`}>
                                        {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `${days} días`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-aliseus-500 dark:text-aliseus-400">{item.quantity} {item.unit}</p>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onNavigate('life', 'kitchen-recipes')}
                                            className="p-1 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[8px] font-black flex items-center gap-1 transition-colors"
                                            title="Usar en receta"
                                        >
                                            <Plus className="w-2.5 h-2.5" /> RECETA
                                        </button>
                                        <button 
                                            onClick={() => onNavigate('life', 'shopping')}
                                            className="p-1 px-2 bg-aliseus-900 dark:bg-white text-white dark:text-aliseus-900 rounded text-[8px] font-black flex items-center gap-1 transition-colors"
                                            title="Reponer"
                                        >
                                            <ShoppingCart className="w-2.5 h-2.5" /> REPONER
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <button 
                onClick={() => onNavigate('life', 'kitchen-pantry')}
                className="mt-4 w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-aliseus-500 dark:text-aliseus-400 hover:text-red-600 dark:hover:text-red-400 border-t border-aliseus-100 dark:border-aliseus-800 transition-colors"
            >
                Ver inventario completo
            </button>
        </div>
    );
};

export default ExpiringThisWeekWidget;
