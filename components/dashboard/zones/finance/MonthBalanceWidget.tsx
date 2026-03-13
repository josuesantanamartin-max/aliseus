import React from 'react';
import { Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatCurrency } from './widgetUtils';

export interface MonthBalanceWidgetProps {
    monthBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
}

export const MonthBalanceWidget: React.FC<MonthBalanceWidgetProps> = ({ monthBalance, monthlyIncome, monthlyExpenses }) => {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Balance del Mes</h3>
            </div>
            <div>
                <div className={cn("text-3xl font-black tabular-nums tracking-tight flex items-center gap-2",
                    monthBalance >= 0 ? "text-emerald-500" : "text-slate-900 dark:text-white"
                )}>
                    {formatCurrency(monthBalance)}
                    {monthBalance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        {formatCurrency(monthlyIncome)}
                    </span>
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                        {formatCurrency(monthlyExpenses)}
                    </span>
                </div>
            </div>
        </div>
    );
};
