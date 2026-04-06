import React, { useMemo } from 'react';
import { useFinanceStore } from '../../../../../store/useFinanceStore';
import { Store, ShoppingCart, TrendingUp } from 'lucide-react';

interface GroceryHistoryWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const GroceryHistoryWidget: React.FC<GroceryHistoryWidgetProps> = ({ onNavigate }) => {
    const { transactions = [] } = useFinanceStore();

    const history = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const groceryTxs = transactions
            .filter(tx => 
                tx.type === 'EXPENSE' && 
                new Date(tx.date) >= firstDayOfMonth &&
                (tx.category?.toLowerCase() === 'alimentación' || tx.category?.toLowerCase() === 'comida')
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const totalSpent = groceryTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const visits = groceryTxs.length;

        return { totalSpent, visits, recent: groceryTxs.slice(0, 3) };
    }, [transactions]);

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-[2rem] h-full flex flex-col border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <p className="text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Hábitos de Compra</p>
                    <h3 className="text-lg font-black text-aliseus-950 dark:text-white">Supermercados este Mes</h3>
                </div>
                <div className="p-2.5 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-900/30">
                    <Store className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 rounded-2xl bg-aliseus-50 dark:bg-aliseus-800/50">
                    <p className="text-[40px] font-black text-aliseus-950 dark:text-white leading-none mb-1">{history.visits}</p>
                    <p className="text-[10px] font-black text-aliseus-400 uppercase tracking-widest">Visitas</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-aliseus-50 dark:bg-aliseus-800/50">
                    <p className="text-[24px] font-black text-aliseus-950 dark:text-white leading-none mt-2 pr-1">{history.totalSpent.toFixed(0)}€</p>
                    <p className="text-[10px] font-black text-aliseus-400 uppercase tracking-widest mt-2">Total</p>
                </div>
            </div>

            <div className="space-y-2 flex-1">
                <p className="text-[10px] font-black text-aliseus-400 uppercase tracking-widest mb-2">Últimas Compras</p>
                {history.recent.length === 0 ? (
                    <p className="text-xs font-bold text-aliseus-300 italic text-center py-4">Sin registros este mes</p>
                ) : (
                    history.recent.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-aliseus-700 dark:text-aliseus-300 truncate max-w-[120px]">
                                {tx.description || 'Supermercado'}
                            </span>
                            <span className="font-black text-aliseus-900 dark:text-white">-{tx.amount.toFixed(2)}€</span>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-900/30">
                <TrendingUp className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span className="text-[9px] font-bold text-sky-700 dark:text-sky-300">Evita las compras impulsivas</span>
            </div>
        </div>
    );
};

export default GroceryHistoryWidget;
