import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Building2, ChevronDown, TrendingUp, TrendingDown, AlertCircle, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AuraFinanceOverview() {
    const { accounts, transactions, debts, budgets, goals } = useFinanceStore();

    // -- STATE: Selector Mes/Año --
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(parseInt(e.target.value, 10));
        setSelectedDate(newDate);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(parseInt(e.target.value, 10));
        setSelectedDate(newDate);
    };

    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(2000, i, 1);
        return { value: i, label: d.toLocaleString('es-ES', { month: 'long' }) };
    });

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    // -- UTILS --
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // -- DATA FILTERS --
    const { currentMonthTxs, totalAssets, liquidAssets, monthlyIncome, monthlyExpenses, totalDebt } = useMemo(() => {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);

        const currentTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= startOfMonth && d <= endOfMonth;
        });

        const mIncome = currentTxs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const mExpenses = currentTxs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

        // Assets
        const tAssets = accounts.reduce((acc, a) => acc + a.balance, 0);
        const lAssets = accounts.filter(a => a.type === 'BANK' || a.type === 'CASH').reduce((acc, a) => acc + a.balance, 0);

        const tDebt = debts.reduce((acc, d) => acc + d.remainingBalance, 0);

        return {
            currentMonthTxs: currentTxs,
            totalAssets: tAssets,
            liquidAssets: lAssets,
            monthlyIncome: mIncome === 0 ? 1 : mIncome, // avoid div by 0
            monthlyExpenses: mExpenses,
            totalDebt: tDebt
        };
    }, [transactions, accounts, debts, selectedDate]);

    // -- KPI 1: DTI (Debt-to-Income) --
    // Simplified: Using total debt minimum payments vs monthly income
    const dtiRatio = useMemo(() => {
        const totalMinPayments = debts.reduce((acc, d) => acc + (d.minPayment || 0), 0);
        return (totalMinPayments / monthlyIncome) * 100;
    }, [debts, monthlyIncome]);

    // -- KPI 2: Endeudamiento Global --
    const globalDebtRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;

    // -- SECTION: CONSUMO Y PRESUPUESTO (50/30/20) --
    // We categorize expenses roughly. For a real app, categories should have a 'type' (need, want, save).
    // Here we approximate based on generic names or just use current month txs vs budgets
    const { needsSpent, wantsSpent, savingsSpent } = useMemo(() => {
        const needsCats = ['Vivienda', 'Servicios', 'Comida', 'Salud', 'Transporte', 'Educación', 'Seguros'];
        let needs = 0;
        let wants = 0;
        let savings = 0; // Transferred to saving accounts or investments

        currentMonthTxs.forEach(t => {
            if (t.type === 'EXPENSE') {
                if (needsCats.includes(t.category)) {
                    needs += t.amount;
                } else {
                    wants += t.amount;
                }
            } else if (t.category === 'Ahorro' || t.category === 'Inversión') {
                savings += t.amount;
            }
        });

        return { needsSpent: needs, wantsSpent: wants, savingsSpent: savings };
    }, [currentMonthTxs]);

    const donutData = [
        { name: 'Necesidades', value: needsSpent, fill: '#64748b' }, // slate-500
        { name: 'Ocio/Deseos', value: wantsSpent, fill: wantsSpent > monthlyIncome * 0.3 ? '#ef4444' : '#eab308' }, // red-500 or yellow-500
        { name: 'Ahorro', value: savingsSpent, fill: '#10b981' }, // emerald-500
    ];

    // -- SECTION: GASTOS DISCRECIONALES (Top Consumo) --
    const discretionaryExpenses = useMemo(() => {
        const needsCats = ['Vivienda', 'Servicios', 'Comida', 'Salud', 'Transporte', 'Educación', 'Seguros'];
        const wantTxs = currentMonthTxs.filter(t => t.type === 'EXPENSE' && !needsCats.includes(t.category));

        const catMap = new Map<string, number>();
        wantTxs.forEach(t => {
            catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
        });

        return Array.from(catMap.entries())
            .map(([cat, amount]) => ({ name: cat, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4); // Top 4
    }, [currentMonthTxs]);

    const maxDiscretionary = Math.max(...discretionaryExpenses.map(d => d.amount), 1);

    // -- SECTION: METAS (Ahorro Mensual vs Meta) --
    const currentMonthGoal = useMemo(() => {
        // Find a goal that is active (we don't have a status in the interface, so we assume all goals are active unless they hit their target)
        const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);

        // Simple way to calculate monthly goal: dividing the difference by months left
        const target = activeGoals.reduce((acc, g) => {
            const monthsLeft = g.deadline
                ? Math.max(1, (new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
                : 1; // Default to 1 month if no deadline
            return acc + ((g.targetAmount - g.currentAmount) / monthsLeft);
        }, 0) || (monthlyIncome * 0.2); // Default to 20% rule if no goals

        return target;
    }, [goals, monthlyIncome]);

    const savingsProgress = Math.min(100, (savingsSpent / currentMonthGoal) * 100);

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

            {/* -- FILTERS -- */}
            <div className="flex justify-end items-center gap-2">
                <div className="flex items-center bg-white dark:bg-onyx-900 border border-slate-200 dark:border-onyx-800 rounded-lg px-3 py-1.5 shadow-sm">
                    <select
                        value={selectedDate.getMonth()}
                        onChange={handleMonthChange}
                        className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer appearance-none pr-3"
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value} className="capitalize">{m.label}</option>
                        ))}
                    </select>
                    <span className="text-slate-300 dark:text-onyx-600 mx-1">/</span>
                    <select
                        value={selectedDate.getFullYear()}
                        onChange={handleYearChange}
                        className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer appearance-none"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-2" />
                </div>
            </div>

            {/* -- 1. VISIÓN GENERAL (Cabecera) -- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Saldo Disponible */}
                <div className="bg-white dark:bg-onyx-900 rounded-2xl p-6 border border-slate-100 dark:border-onyx-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Saldo Disponible</h3>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                            {formatCurrency(liquidAssets)}
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-1.5">
                        {accounts.filter(a => a.type === 'BANK' || a.type === 'CASH').slice(0, 2).map(acc => (
                            <div key={acc.id} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                                    <span className="truncate max-w-[100px]">{acc.name}</span>
                                </div>
                                <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">{formatCurrency(acc.balance)}</span>
                            </div>
                        ))}
                        {accounts.filter(a => a.type === 'BANK' || a.type === 'CASH').length > 2 && (
                            <div className="text-xs text-slate-400 dark:text-onyx-500 italic">
                                + {accounts.filter(a => a.type === 'BANK' || a.type === 'CASH').length - 2} cuentas más...
                            </div>
                        )}
                    </div>
                </div>

                {/* Ratio DTI */}
                <div className="bg-white dark:bg-onyx-900 rounded-2xl p-6 border border-slate-100 dark:border-onyx-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ratio DTI (Deuda/Ingreso)</h3>
                        <div className="flex items-baseline gap-2">
                            <div className={cn(
                                "text-4xl font-black tabular-nums tracking-tighter",
                                dtiRatio > 35 ? "text-red-500" : "text-slate-900 dark:text-white"
                            )}>
                                {dtiRatio.toFixed(1)}%
                            </div>
                            {dtiRatio > 35 && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {dtiRatio <= 35 && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Recomendado: &lt; 30%</span>
                        <span className={cn(
                            "font-bold px-2 py-1 rounded-full",
                            dtiRatio > 35 ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        )}>
                            {dtiRatio > 35 ? 'Alerta' : 'Saludable'}
                        </span>
                    </div>
                </div>

                {/* Endeudamiento Global */}
                <div className="bg-white dark:bg-onyx-900 rounded-2xl p-6 border border-slate-100 dark:border-onyx-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Endeudamiento Global</h3>
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                                {globalDebtRatio.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Total Deuda vs Activos</span>
                        <span className="flex items-center gap-1 font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-600 dark:bg-onyx-800 dark:text-slate-300">
                            Contexto
                        </span>
                    </div>
                </div>
            </div>

            {/* -- 2. CONSUMO Y PRESUPUESTO -- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Distribución 50/30/20 */}
                <div className="bg-white dark:bg-onyx-900 rounded-2xl p-6 border border-slate-100 dark:border-onyx-800 shadow-sm flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Distribución de Ingresos</h3>
                    <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: '200px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => {
                                        if (typeof value === 'number') return formatCurrency(value);
                                        if (typeof value === 'string' && !isNaN(Number(value))) return formatCurrency(Number(value));
                                        return String(value);
                                    }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-slate-500 font-medium">Gastado</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-white tabular-nums">
                                {formatCurrency(needsSpent + wantsSpent)}
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-3 h-3 rounded-full bg-slate-500 mb-1"></div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Necesidades</span>
                            <span className="text-xs font-semibold tabular-nums">{(needsSpent / monthlyIncome * 100).toFixed(0)}% <span className="text-slate-400 font-normal">(50%)</span></span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className={cn("w-3 h-3 rounded-full mb-1", wantsSpent > monthlyIncome * 0.3 ? "bg-red-500" : "bg-yellow-500")}></div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Ocio</span>
                            <span className={cn("text-xs font-semibold tabular-nums", wantsSpent > monthlyIncome * 0.3 ? "text-red-500" : "")}>
                                {(wantsSpent / monthlyIncome * 100).toFixed(0)}% <span className="text-slate-400 font-normal">(30%)</span>
                            </span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 mb-1"></div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Ahorro</span>
                            <span className="text-xs font-semibold tabular-nums">{(savingsSpent / monthlyIncome * 100).toFixed(0)}% <span className="text-slate-400 font-normal">(20%)</span></span>
                        </div>
                    </div>
                </div>

                {/* Gastos Discrecionales */}
                <div className="bg-white dark:bg-onyx-900 rounded-2xl p-6 border border-slate-100 dark:border-onyx-800 shadow-sm flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Gastos Discrecionales (Top Consumo)</h3>

                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        {discretionaryExpenses.length > 0 ? (
                            discretionaryExpenses.map((expense, idx) => {
                                const percent = (expense.amount / maxDiscretionary) * 100;
                                // Highlight top 1 as warning if it's very high relative to income
                                const isWarning = idx === 0 && expense.amount > monthlyIncome * 0.15;

                                return (
                                    <div key={`exp-${idx}-${expense.name}`} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-end text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{expense.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(expense.amount)}</span>
                                                {/* Mocking trend for UI purposes */}
                                                {isWarning && <TrendingUp className="w-3 h-3 text-red-500" />}
                                            </div>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    isWarning ? "bg-red-400/80 dark:bg-red-500/80" : "bg-slate-300 dark:bg-slate-600"
                                                )}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-slate-400 text-sm text-center">
                                <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2 opacity-50" />
                                No hay gastos discrecionales registrados este mes.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* -- 3. METAS Y LARGO PLAZO -- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Ahorro Mensual vs Meta */}
                <div className="bg-white dark:bg-onyx-900 rounded-2xl p-6 border border-slate-100 dark:border-onyx-800 shadow-sm flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Ahorro Mensual vs. Meta</h3>

                    <div className="flex items-end justify-between mb-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                            {formatCurrency(savingsSpent)} <span className="text-sm font-medium text-slate-400">/ {formatCurrency(currentMonthGoal)}</span>
                        </span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {savingsProgress.toFixed(0)}%
                        </span>
                    </div>

                    <div className="h-4 w-full bg-slate-100 dark:bg-onyx-800 rounded-full overflow-hidden mb-2">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                savingsProgress < 50 ? "bg-amber-400" : "bg-emerald-500"
                            )}
                            style={{ width: `${savingsProgress}%` }}
                        />
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {currentMonthGoal - savingsSpent > 0
                            ? `Faltan ${formatCurrency(currentMonthGoal - savingsSpent)} para alcanzar la meta mensual.`
                            : '¡Meta mensual de ahorro alcanzada! 🎉'}
                    </div>
                </div>

                {/* Largo Plazo y Rendimiento (Mock UI for Sparkline) */}
                <div className="bg-white dark:bg-onyx-900 rounded-2xl p-6 border border-slate-100 dark:border-onyx-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="z-10 relative">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Largo Plazo (Patrimonio Neto)</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                                {formatCurrency(totalAssets - totalDebt)}
                            </span>
                            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +5.2% ROI
                            </span>
                        </div>
                    </div>

                    {/* SVG Sparkline Mock */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-50 dark:opacity-20">
                        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
                            <defs>
                                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0,80 Q100,70 200,85 T400,60 T600,65 T800,30 T1000,10 L1000,100 L0,100 Z" fill="url(#gradient-area)" />
                            <path d="M0,80 Q100,70 200,85 T400,60 T600,65 T800,30 T1000,10" fill="none" stroke="#10b981" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>
                </div>

            </div>

        </div>
    );
}
