import React, { useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { TrendingUp, TrendingDown, ArrowRight, Minus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Sparkline Mock
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
        <svg viewBox="0 0 100 30" className="w-16 h-8 opacity-50" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={data.map((d, i) => `${(i / (data.length - 1)) * 100},${30 - ((d - min) / range) * 30}`).join(' ')}
            />
        </svg>
    );
};

export default function FinancialPulse() {
    const { accounts, budgets, transactions, goals } = useFinanceStore();

    const { monthlyIncome, monthlyExpenses } = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthTxs = transactions.filter(t => new Date(t.date) >= startOfMonth);

        const income = currentMonthTxs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const expenses = currentMonthTxs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

        return { monthlyIncome: income, monthlyExpenses: expenses };
    }, [transactions]);

    const netWorth = useMemo(() => {
        return accounts.reduce((sum, account) => {
            if (account.type === 'CREDIT') {
                return sum - account.balance;
            }
            return sum + account.balance;
        }, 0);
    }, [accounts]);

    // 3A: Cash Flow Overview (Mocked historical data for sparklines)
    const incomeHistory = [4000, 4200, 4100, 4500, monthlyIncome];
    const expenseHistory = [3000, 3500, 2800, 3200, monthlyExpenses];
    const savings = monthlyIncome - monthlyExpenses;
    const savingsHistory = incomeHistory.map((inc, i) => inc - expenseHistory[i]);
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    // Closest Goal Calculation
    const closestGoal = useMemo(() => {
        if (!goals || goals.length === 0) return null;
        return [...goals]
            .filter(g => (g.currentAmount / g.targetAmount) < 1)
            .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];
    }, [goals]);

    // Month Progress
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthProgress = (today.getDate() / daysInMonth) * 100;

    // 3B: Accounts
    const liquidAccounts = accounts.filter(a => ['bank', 'cash'].includes(a.type.toLowerCase()));
    const liquidTotal = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);

    // 3C: Budget Health - Top 5 by % used
    const topBudgets = [...budgets]
        .map(b => {
            // Calculate how much is spent in this budget's category
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const spent = transactions
                .filter(t => t.type === 'EXPENSE' && t.category === b.category && new Date(t.date) >= startOfMonth)
                .reduce((sum, t) => sum + t.amount, 0);

            return { ...b, spent, percentage: (spent / b.limit) * 100 };
        })
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

    const formatCurrency = (val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between pointer-events-none">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pulso Financiero</h2>
            </div>

            {/* 3A: Cash Flow */}
            <div className="grid grid-cols-3 gap-4">
                {/* Income */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-onyx-800 bg-slate-50/50 dark:bg-onyx-800/50 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyIncome)}</span>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-emerald-500 gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <TrendingUp className="w-3 h-3" /> 2%
                        </div>
                        <Sparkline data={incomeHistory} color="#22C55E" />
                    </div>
                </div>
                {/* Expenses */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-onyx-800 bg-slate-50/50 dark:bg-onyx-800/50 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gastos</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyExpenses)}</span>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-red-500 gap-1 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">
                            <TrendingUp className="w-3 h-3" /> 5%
                        </div>
                        <Sparkline data={expenseHistory} color="#EF4444" />
                    </div>
                </div>
                {/* Savings */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-onyx-800 bg-brand-50/30 dark:bg-onyx-800/80 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Ahorro</span>
                    <span className={cn(
                        "text-xl font-bold",
                        savings > 0 ? "text-brand-700 dark:text-brand-300" : "text-red-500"
                    )}>
                        {formatCurrency(savings)}
                    </span>
                    <div className="flex items-center justify-between mt-2">
                        <div className={cn(
                            "flex items-center text-xs gap-1 px-1.5 py-0.5 rounded",
                            savingsRate >= 20 ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                        )}>
                            <TrendingUp className="w-3 h-3" /> {savingsRate.toFixed(0)}%
                        </div>
                        <Sparkline data={savingsHistory} color="#0EA5E9" />
                    </div>
                </div>
            </div>

            {/* Month Progress Indicator */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Progreso del Mes</span>
                    <span>{today.getDate()} de {daysInMonth} días ({monthProgress.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 dark:bg-onyx-600 rounded-full" style={{ width: `${monthProgress}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                {/* 3B: Accounts & Net Worth */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                        <span className="opacity-80">Patrimonio Neto</span>
                        <span className="text-xl">{formatCurrency(netWorth)}</span>
                    </h3>

                    <div className="flex flex-col gap-3">
                        {accounts.slice(0, 4).map(account => (
                            <div key={account.id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-onyx-800 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 transition-colors">{account.name}</span>
                                    <span className="text-xs text-slate-500 capitalize">{account.type}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(account.balance)}</span>
                            </div>
                        ))}
                        {accounts.length > 4 && (
                            <button className="text-xs font-medium text-slate-500 hover:text-brand-600 text-left mt-1 flex items-center gap-1 transition-colors">
                                + {accounts.length - 4} cuentas más <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 3C: Budget Health */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                        <span className="opacity-80">Salud Presupuestaria</span>
                    </h3>

                    <div className="flex flex-col gap-4">
                        {topBudgets.map(budget => {
                            const isDanger = budget.percentage > 90;
                            const isWarning = budget.percentage >= 70 && budget.percentage <= 90;

                            return (
                                <div key={budget.id} className="flex flex-col gap-1.5 group cursor-pointer">
                                    <div className="flex justify-between items-end text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-4 group-hover:text-brand-600 transition-colors">{budget.category}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                                            {formatCurrency(budget.spent)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 ease-out",
                                                isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${Math.min(100, budget.percentage)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Meta Más Cercana Row */}
            {closestGoal && (
                <div className="mt-2 p-4 rounded-2xl border border-brand-100 dark:border-brand-500/20 bg-gradient-to-r from-brand-500/5 to-transparent flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Meta más cercana</h4>
                            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1">{closestGoal.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                                {Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100)}%
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                                faltan {(closestGoal.targetAmount - closestGoal.currentAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(closestGoal.currentAmount / closestGoal.targetAmount) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
