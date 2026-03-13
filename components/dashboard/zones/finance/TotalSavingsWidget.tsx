import React from 'react';
import { PiggyBank } from 'lucide-react';
import { formatCurrency } from './widgetUtils';

export interface TotalSavingsWidgetProps {
    totalSavings: number;
    savingsThisMonth: number;
    savingsAccounts: any[];
}

export const TotalSavingsWidget: React.FC<TotalSavingsWidgetProps> = ({ totalSavings, savingsThisMonth, savingsAccounts }) => {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden">
            <div className="z-10">
                <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-4 h-4 text-sky-500" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Ahorro</h3>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(totalSavings)}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <span>+ {formatCurrency(savingsThisMonth)}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">este mes</span>
                </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80 z-10">
                {savingsAccounts.map(a => (
                    <div key={a.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium truncate mr-2">{a.name}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(a.balance)}</span>
                    </div>
                ))}
                {savingsAccounts.length === 0 && (
                    <div className="text-xs text-slate-400 font-medium">No hay cuentas de ahorro</div>
                )}
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-sky-50 dark:bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
    );
};
