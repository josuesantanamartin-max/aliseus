import React, { useMemo } from 'react';
import { Layers, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency } from './widgetUtils';

export interface DetailedBudgetWidgetProps {
    detailedBudget: {
        name: string;
        total: number;
        limit: number;
        subcategories: { name: string; total: number }[];
    }[];
}

export const DetailedBudgetWidget: React.FC<DetailedBudgetWidgetProps> = ({ detailedBudget }) => {
    // Filtrar para no mostrar categorías irrelevantes (sin límite y a 0)
    const activeBudgets = useMemo(() => {
        return detailedBudget.filter(cat => cat.limit > 0 || cat.total > 0);
    }, [detailedBudget]);

    // Resumen global de los presupuestos definidos
    const globalState = useMemo(() => {
        let totalBudgeted = 0;
        let totalSpentOnBudgets = 0;

        activeBudgets.forEach(cat => {
            if (cat.limit > 0) {
                totalBudgeted += cat.limit;
                totalSpentOnBudgets += cat.total;
            }
        });

        return {
            totalBudgeted,
            totalSpentOnBudgets,
            percentSpent: totalBudgeted > 0 ? Math.min(100, (totalSpentOnBudgets / totalBudgeted) * 100) : 0,
            isOverGlobal: totalSpentOnBudgets > totalBudgeted
        };
    }, [activeBudgets]);

    return (
        <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    Presupuesto Detallado
                </h3>
            </div>

            {/* Global Summary Card */}
            <div className="mb-6 bg-slate-50 dark:bg-onyx-800/40 rounded-2xl p-4 border border-slate-100 dark:border-onyx-800 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Estado Mensual</span>
                    {globalState.isOverGlobal ? (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Excedido
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            En control
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-baseline">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white leading-none">
                            {formatCurrency(globalState.totalSpentOnBudgets)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Gasto Acumulado</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">
                            {formatCurrency(globalState.totalBudgeted)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Presupuestado</span>
                    </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-onyx-700/50 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500",
                            globalState.isOverGlobal ? "bg-red-500" :
                                globalState.percentSpent > 85 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${globalState.percentSpent}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                {activeBudgets.length > 0 ? activeBudgets.map((cat, idx) => {
                    const hasBudget = cat.limit > 0;
                    const isOverLimit = cat.total > cat.limit; // This is true if limit is 0 and total > 0
                    const percent = hasBudget ? Math.min(100, (cat.total / cat.limit) * 100) : (cat.total > 0 ? 100 : 0);

                    let colorClass = "bg-slate-400";
                    if (isOverLimit) colorClass = "bg-red-500";
                    else if (percent > 85) colorClass = "bg-amber-500";
                    else colorClass = "bg-emerald-500";

                    return (
                        <div key={idx} className="flex flex-col gap-3">
                            {/* Category Header */}
                            <div className="flex justify-between items-center group cursor-default">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                                <div className="flex items-baseline gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <span className={cn("text-sm font-black tabular-nums",
                                        isOverLimit ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
                                    )}>
                                        {formatCurrency(cat.total)}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">/ {formatCurrency(cat.limit)}</span>
                                </div>
                            </div>

                            {/* Category Progress */}
                            <div className="flex flex-col gap-1.5 mt-1">
                                <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-500", colorClass)}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold mt-0.5">
                                    <span className={cn(isOverLimit ? "text-red-500" : "text-slate-400")}>
                                        {hasBudget ? Math.round(percent) + '% consumido' : 'Sin presupuesto'}
                                    </span>
                                    {isOverLimit ? (
                                        <span className="text-red-500">+{formatCurrency(cat.total - cat.limit)} extra</span>
                                    ) : (
                                        <span className="text-slate-500 dark:text-slate-400">{formatCurrency(cat.limit - cat.total)} margen</span>
                                    )}
                                </div>
                            </div>

                            {/* Subcategories */}
                            {cat.subcategories.length > 0 && cat.total > 0 && (
                                <div className="pl-3 border-l-2 border-slate-100 dark:border-onyx-800 flex flex-col gap-1.5 mt-1">
                                    {cat.subcategories.map((sub, sIdx) => {
                                        if (sub.total === 0) return null;
                                        return (
                                            <div key={sIdx} className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium truncate pr-2">{sub.name}</span>
                                                <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">{formatCurrency(sub.total)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )
                }) : (
                    <div className="flex flex-col items-center justify-center text-center h-full py-10 opacity-50">
                        <TrendingUp className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-500 font-medium">Aún no hay presupuestos establecidos<br />ni gastos registrados este mes.</span>
                    </div>
                )}
            </div>
        </div>
    );
};
