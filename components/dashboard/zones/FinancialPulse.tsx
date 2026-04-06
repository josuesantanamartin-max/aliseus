import React, { useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Building2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function FinancialPulse() {
    const { accounts, budgets, transactions } = useFinanceStore();

    const FIXED_CATEGORIES = ['Vivienda', 'Servicios', 'Educación', 'Deudas', 'Seguros'];

    const { monthlyIncome, fixedExpenses, variableExpenses, totalGastado } = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthTxs = transactions.filter(t => new Date(t.date) >= startOfMonth);

        const income = currentMonthTxs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);

        const fixed = currentMonthTxs
            .filter(t => t.type === 'EXPENSE' && FIXED_CATEGORIES.includes(t.category))
            .reduce((acc, t) => acc + t.amount, 0);

        const variable = currentMonthTxs
            .filter(t => t.type === 'EXPENSE' && !FIXED_CATEGORIES.includes(t.category))
            .reduce((acc, t) => acc + t.amount, 0);

        const totalSpent = fixed + variable;

        return { monthlyIncome: income, fixedExpenses: fixed, variableExpenses: variable, totalGastado: totalSpent };
    }, [transactions]);

    const budgetsTotal = useMemo(() => budgets.reduce((acc, b) => acc + b.limit, 0), [budgets]);

    // Total estimated/available budget for month including required minimum fixed expenses
    const mesPresupuesto = budgetsTotal > 0 ? budgetsTotal + fixedExpenses : monthlyIncome;

    // Disposable remaining money based on user's budgets or default to income left
    const dineroLibre = budgetsTotal > 0
        ? Math.max(0, budgetsTotal - variableExpenses)
        : Math.max(0, monthlyIncome - fixedExpenses - variableExpenses);

    // Progress percentage
    const percentUsed = mesPresupuesto > 0 ? Math.min(100, (totalGastado / mesPresupuesto) * 100) : 0;

    // Accounts logic for footer
    const mainAccount = accounts.find(a => a.type === 'BANK');
    const savingsAccounts = accounts.filter(a => a.type === 'INVESTMENT' || (a.type === 'BANK' && a.isRemunerated));
    const totalSavings = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);

    const formatCurrency = (val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

    return (
        <div className="flex flex-col h-full w-full">
            {/* Main Pulso Financiero Card (Mobile First Design) */}
            <div className="rounded-[2.5rem] bg-gradient-to-b from-sky-50 via-white to-brand-50/30 dark:from-aliseus-900 dark:via-aliseus-900/80 dark:to-aliseus-800 p-8 shadow-sm border border-slate-100 dark:border-aliseus-800 flex flex-col gap-8 relative overflow-hidden">

                {/* Header Metrics */}
                <div className="flex flex-col gap-1 z-10">
                    <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Pulso Financiero Del Mes</h2>

                    <div className="mt-4 flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Presupuesto Inicial</span>
                        <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(mesPresupuesto)}
                        </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Gastado Hoy</span>
                        <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(totalGastado)}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-2 z-10 py-2">
                    <div className="h-4 bg-slate-200 dark:bg-aliseus-800 rounded-full overflow-hidden w-full relative">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out",
                                percentUsed > 90 ? "bg-red-500" : percentUsed > 75 ? "bg-amber-500" : "bg-sky-600 dark:bg-sky-500"
                            )}
                            style={{ width: `${percentUsed}%` }}
                        />
                    </div>
                    <div className="flex justify-end w-full">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            {Math.round(percentUsed)}% Usado
                        </span>
                    </div>
                </div>

                {/* The Hero Metric: Restante Real */}
                <div className="flex flex-col gap-1 z-10 pt-2 pb-4 border-b border-white/50 dark:border-aliseus-700/50">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Restante Real</span>
                    <div className="flex items-baseline gap-3">
                        <span className="text-6xl md:text-7xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter tabular-nums drop-shadow-sm">
                            {formatCurrency(dineroLibre)}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                            Disponible
                        </span>
                    </div>
                </div>

                {/* Footer: Liquid Accounts Summary */}
                <div className="flex flex-col gap-3 z-10">
                    <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Mi Economía</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {mainAccount && (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-aliseus-800/50 px-3 py-1.5 rounded-xl border border-white dark:border-aliseus-700">
                                <Building2 className="w-4 h-4 text-sky-500" />
                                <span>Cuenta Principal: <strong className="text-slate-900 dark:text-white">{formatCurrency(mainAccount.balance)}</strong></span>
                            </div>
                        )}
                        {totalSavings > 0 && (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                <span>Ahorro: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(totalSavings)}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
