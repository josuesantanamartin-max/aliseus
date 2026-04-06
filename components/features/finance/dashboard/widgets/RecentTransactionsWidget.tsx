import React from 'react';
import { Transaction } from '../../../../../types';
import { Clock, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface RecentTransactionsWidgetProps {
    transactions: Transaction[];
    onNavigate: (app: string, tab?: string) => void;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({ transactions, onNavigate }) => {
    // Get top 6 most recent transactions
    const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-aliseus-900 rounded-[2rem] border border-aliseus-100 dark:border-aliseus-800 p-6 shadow-sm relative overflow-hidden group/widget hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xl font-black text-cyan-900 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg shadow-inner group-hover/widget:scale-110 transition-transform"><Clock className="w-5 h-5" /></div>
                    Actividad Reciente
                </h3>
                <button onClick={() => onNavigate('finance', 'transactions')} className="text-xs font-bold text-aliseus-400 hover:text-cyan-600 flex items-center gap-2 transition-colors group">
                    Ver todas <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 relative z-10">
                {recent.length > 0 ? (
                    recent.map(t => (
                        <div key={t.id} className="flex justify-between items-center p-3 hover:bg-aliseus-50 dark:hover:bg-aliseus-800/50 rounded-xl transition-colors group cursor-pointer" onClick={() => onNavigate('finance', 'transactions')}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${t.type === 'INCOME' ? 'bg-emerald-50 border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 border-rose-100 dark:border-rose-800/50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                    {t.type === 'INCOME' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-aliseus-900 dark:text-white truncate">{t.description}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-aliseus-400 truncate">{t.category}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-base font-black tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-aliseus-900 dark:text-white'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}{formatEUR(t.amount)}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-aliseus-400">{new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Clock className="w-8 h-8 text-aliseus-200 mb-3" />
                        <p className="text-sm font-bold text-aliseus-400">Sin actividad reciente</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentTransactionsWidget;
