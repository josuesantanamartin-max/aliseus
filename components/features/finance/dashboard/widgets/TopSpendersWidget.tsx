import React from 'react';
import { Transaction } from '../../../../../types';
import { AlertCircle, ArrowRight, BarChart3 } from 'lucide-react';

interface TopSpendersWidgetProps {
    transactions: Transaction[];
    onNavigate: (app: string, tab?: string) => void;
    monthlyExpenses: number;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

const TopSpendersWidget: React.FC<TopSpendersWidgetProps> = ({ transactions, onNavigate, monthlyExpenses }) => {
    // Calculate category spending for current period (assuming transactions passed are already filtered for the period)
    const expenses = transactions.filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia');

    const categoryTotals = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a: { amount: number }, b: { amount: number }) => b.amount - a.amount)
        .slice(0, 3);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-aliseus-900 rounded-[2rem] border border-aliseus-100 dark:border-aliseus-800 p-6 md:p-8 shadow-sm relative overflow-hidden group/widget hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-rose-50/20 dark:from-rose-900/10 to-transparent opacity-0 group-hover/widget:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xl font-black text-cyan-900 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg shadow-inner group-hover/widget:scale-110 transition-transform"><BarChart3 className="w-5 h-5" /></div>
                    Top Gastos
                </h3>
                <button onClick={() => onNavigate('finance', 'analytics')} className="text-xs font-bold text-aliseus-400 hover:text-rose-600 flex items-center gap-2 transition-colors group">
                    Análisis <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="space-y-5 relative z-10 flex-1 flex flex-col justify-center">
                {topCategories.length > 0 ? (
                    topCategories.map((c: { amount: number, category: string }, index: number) => {
                        const percentage = monthlyExpenses > 0 ? (c.amount / monthlyExpenses) * 100 : 0;
                        return (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-aliseus-900 dark:text-white truncate pr-4">{c.category}</span>
                                    <div className="text-right shrink-0">
                                        <span className="text-lg font-black text-cyan-900 dark:text-white tracking-tight">{formatEUR(c.amount)}</span>
                                        <span className="text-[10px] text-aliseus-400 font-bold ml-1.5 uppercase tracking-widest w-9 inline-block text-right">{percentage.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-aliseus-50 dark:bg-aliseus-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-6">
                        <AlertCircle className="w-8 h-8 text-aliseus-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-aliseus-400">Sin datos suficientes</p>
                    </div>
                )}
            </div>

            {topCategories.length > 0 && monthlyExpenses > 0 && (
                <div className="pt-5 mt-auto border-t border-aliseus-50 dark:border-aliseus-800 relative z-10">
                    <p className="text-[11px] text-aliseus-500 dark:text-aliseus-400 leading-relaxed font-bold">
                        El top 3 representa el <span className="font-black text-rose-600 dark:text-rose-400 px-1 py-0.5 bg-rose-50 dark:bg-rose-900/30 rounded">{((topCategories.reduce((sum, c) => sum + c.amount, 0) / monthlyExpenses) * 100).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</span> de gastos del periodo.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TopSpendersWidget;
