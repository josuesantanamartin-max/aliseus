import React from 'react';
import { Target } from 'lucide-react';
import { cn, formatCurrency } from './widgetUtils';

export interface BudgetControlWidgetProps {
    globalBudgetLimit: number;
    globalBudgetSpent: number;
    globalBudgetRemaining: number;
}

export const BudgetControlWidget: React.FC<BudgetControlWidgetProps> = ({ globalBudgetLimit, globalBudgetSpent, globalBudgetRemaining }) => {
    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-3xl p-6 border border-slate-100 dark:border-aliseus-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Presupuesto</h3>
                </div>
            </div>
            <div>
                <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(globalBudgetLimit)}
                    <span className="text-base font-bold text-slate-400">/ {formatCurrency(globalBudgetSpent)}</span>
                </div>

                <div className="mt-3 w-full bg-slate-100 dark:bg-aliseus-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                        className={cn("h-full rounded-full", globalBudgetSpent > globalBudgetLimit ? "bg-red-500" : "bg-blue-600")}
                        style={{ width: `${Math.min(100, (globalBudgetSpent / Math.max(1, globalBudgetLimit)) * 100)}% ` }}
                    />
                </div>

                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>Gastado</span>
                    <span className={cn(globalBudgetRemaining === 0 ? "text-red-500" : "text-blue-600 dark:text-blue-400")}>
                        Restan {formatCurrency(globalBudgetRemaining)}
                    </span>
                </div>
            </div>
        </div>
    );
};
