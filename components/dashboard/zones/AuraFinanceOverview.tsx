import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import {
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Activity,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    CalendarCheck,
    Layers
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AuraFinanceOverview({ selectedDate: selectedDateProp }: { selectedDate?: Date }) {
    const { accounts, transactions, budgets } = useFinanceStore();

    // -- STATE: Chart Filters --
    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());

    // Sync prop changes into local state
    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    // -- STATE: Chart Filters --
    const [chartAccountId, setChartAccountId] = useState<string>('all');
    const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y' | '3y' | '5y'>('6m');

    // -- UTILS --
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // -- TIME LOGIC --
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);

    const currentMonthTxs = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= startOfMonth && d <= endOfMonth;
        });
    }, [transactions, startOfMonth, endOfMonth]);

    // ==========================================
    // WIDGET 1: SALDO DISPONIBLE (Suma Cuentas)
    // ==========================================
    const LIQUID_TYPES = ['BANK', 'CASH', 'WALLET'] as const;
    const totalBalance = useMemo(() => {
        return accounts
            .filter(a => LIQUID_TYPES.includes(a.type as any))
            .reduce((acc, a) => acc + a.balance, 0);
    }, [accounts]);

    // ==========================================
    // WIDGET 2: TOTAL AHORRO & DESTINADO ESTE MES
    // ==========================================
    const { totalSavings, savingsThisMonth, savingsAccounts } = useMemo(() => {
        // Cuentas consideradas de ahorro (por tipo o nombre)
        const savingsAccounts = accounts.filter(a =>
            a.type === 'INVESTMENT' ||
            a.name.toLowerCase().includes('ahorro') ||
            a.name.toLowerCase().includes('hucha')
        );
        const tSavings = savingsAccounts.reduce((acc, a) => acc + a.balance, 0);

        // Ahorro transferido o registrado este mes
        const sThisMonth = currentMonthTxs.filter(t =>
            t.category === 'Ahorro' ||
            t.category === 'Inversión' ||
            savingsAccounts.some(sa => sa.id === t.accountId)
        ).filter(t => t.type === 'INCOME' || (t.type === 'EXPENSE' && t.category === 'Ahorro')).reduce((acc, t) => acc + t.amount, 0);

        return { totalSavings: tSavings, savingsThisMonth: sThisMonth, savingsAccounts };
    }, [accounts, currentMonthTxs]);

    // ==========================================
    // WIDGET 3: INGRESOS - GASTOS = BALANCE
    // ==========================================
    const { monthlyIncome, monthlyExpenses, monthBalance } = useMemo(() => {
        const mIncome = currentMonthTxs.filter(t => t.type === 'INCOME' && t.category !== 'Transferencia').reduce((acc, t) => acc + t.amount, 0);
        const mExpenses = currentMonthTxs.filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia').reduce((acc, t) => acc + t.amount, 0);
        return {
            monthlyIncome: mIncome,
            monthlyExpenses: mExpenses,
            monthBalance: mIncome - mExpenses
        };
    }, [currentMonthTxs]);

    // ==========================================
    // WIDGET 4: CONTROL RÁPIDO PRESUPUESTO
    // ==========================================
    const { globalBudgetLimit, globalBudgetSpent, globalBudgetRemaining } = useMemo(() => {
        const limit = budgets.reduce((acc, b) => acc + b.limit, 0) || 2000; // Default to 2000 if no budgets defined for demo
        let spent = 0;

        if (budgets.length > 0) {
            // Find specific expenses matching budget categories
            budgets.forEach(b => {
                const bSpent = currentMonthTxs.filter(t => t.type === 'EXPENSE' && t.category === b.category).reduce((acc, t) => acc + t.amount, 0);
                spent += bSpent;
            });
        } else {
            // If no actual budgets, use total expenses
            spent = monthlyExpenses;
        }

        return {
            globalBudgetLimit: limit,
            globalBudgetSpent: spent,
            globalBudgetRemaining: Math.max(0, limit - spent)
        };
    }, [budgets, currentMonthTxs, monthlyExpenses]);

    // ==========================================
    // LINE CHART: EVOLUCIÓN HISTÓRICA
    // ==========================================
    const chartData = useMemo(() => {
        // To build a realistic chart, we project backwards from the current balance.
        let currentBal = chartAccountId === 'all'
            ? totalBalance
            : (accounts.find(a => a.id === chartAccountId)?.balance || 0);

        const dataPoints = [];
        const now = new Date();

        let monthsBack = 6;
        if (chartTimeframe === '1m') monthsBack = 1; // 30 days
        if (chartTimeframe === '1y') monthsBack = 12;
        if (chartTimeframe === '3y') monthsBack = 36;
        if (chartTimeframe === '5y') monthsBack = 60;

        // Simplify approach: If 1m, generate daily points. Otherwise monthly.
        if (chartTimeframe === '1m') {
            for (let i = 0; i <= 30; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);

                // For a real app, calculate exact balance on that day. 
                // For visual purposes, we mock a slight daily variation.
                let variation = (Math.random() * 50) - 20;
                if (i === 0) variation = 0; // Today is exact

                currentBal = currentBal - variation;

                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    balance: Math.max(0, currentBal)
                });
            }
        } else {
            for (let i = 0; i <= monthsBack; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

                // Mock historical balances for visual presentation of the component
                let variation = (Math.random() * 500) - 100;
                if (i === 0) variation = 0;

                currentBal = currentBal - variation;

                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { month: 'short', year: monthsBack > 12 ? '2-digit' : undefined }),
                    balance: Math.max(0, currentBal)
                });
            }
        }

        return dataPoints;
    }, [totalBalance, chartAccountId, accounts, chartTimeframe]);

    // ==========================================
    // PAGOS FIJOS
    // ==========================================
    const fixedPayments = useMemo(() => {
        const fixedCategories = ['Vivienda', 'Servicios', 'Seguros', 'Suscripciones', 'Educación'];

        // Find expected fixed payments. Without a specific "Recurring" model, we look at budgets or past months
        // Let's deduce from current month's fixed categories
        const fixedTxs = currentMonthTxs.filter(t => t.type === 'EXPENSE' && (t.isRecurring || fixedCategories.includes(t.category)));

        const paidThisMonth = fixedTxs.reduce((acc, t) => acc + t.amount, 0);

        // Mock expected total for demonstration (in real app, use recurring rules or specific budget constraints)
        const expectedTotal = paidThisMonth > 0 ? paidThisMonth * 1.3 : 1500; // Add 30% as remaining roughly, or a default

        return {
            paid: paidThisMonth,
            expected: expectedTotal,
            remaining: Math.max(0, expectedTotal - paidThisMonth),
            items: fixedTxs
        };
    }, [currentMonthTxs]);

    // ==========================================
    // PRESUPUESTO DETALLADO (Subcategorías)
    // ==========================================
    const detailedBudget = useMemo(() => {
        const expenseTxs = currentMonthTxs.filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia');

        const catMap = new Map<string, { total: number, limit: number, subcategories: Map<string, number> }>();

        expenseTxs.forEach(t => {
            if (!catMap.has(t.category)) {
                // Find limit
                const b = budgets.find(bg => bg.category === t.category);
                catMap.set(t.category, { total: 0, limit: b ? b.limit : 0, subcategories: new Map() });
            }
            const cat = catMap.get(t.category)!;
            cat.total += t.amount;

            const subName = t.subCategory || 'General';
            cat.subcategories.set(subName, (cat.subcategories.get(subName) || 0) + t.amount);
        });

        // Convert to array and sort by total descending
        return Array.from(catMap.entries()).map(([name, data]) => ({
            name,
            total: data.total,
            limit: data.limit,
            subcategories: Array.from(data.subcategories.entries()).map(([subName, subTotal]) => ({ name: subName, total: subTotal }))
        })).sort((a, b) => b.total - a.total);

    }, [currentMonthTxs, budgets]);

    // Helper color chooser for chart
    const chartColor = monthBalance >= 0 ? '#10b981' : '#64748b';

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-0">

            {/* ========================================== */}
            {/* ROW 1: THE 4 TOP WIDGETS */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Saldo Disponible */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saldo Disponible</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(totalBalance)}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                        {accounts.filter(a => LIQUID_TYPES.includes(a.type as any)).map(a => (
                            <div key={a.id} className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium truncate mr-2">{a.name}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(a.balance)}</span>
                            </div>
                        ))}
                        {accounts.some(a => ['CREDIT', 'DEBIT'].includes(a.type)) && (
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Tarjetas excluidas del disponible</p>
                        )}
                    </div>
                </div>

                {/* 2. Total Ahorro */}
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

                {/* 3. Balance del Mes */}
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

                {/* 4. Control Rápido Presupuesto */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
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

                        <div className="mt-3 w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-2 overflow-hidden">
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

            </div>

            {/* ========================================== */}
            {/* ROW 2: MAIN GRID (CHART & DETAILS)         */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ---------- LEFT COLUMN (Span 2) ---------- */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Evolución Chart */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" />
                                Evolución del Dinero
                            </h3>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700 rounded-lg p-1 flex">
                                    {(['1m', '6m', '1y', '3y', '5y'] as const).map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setChartTimeframe(tf)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                                                chartTimeframe === tf
                                                    ? "bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm"
                                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            )}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <select
                                        value={chartAccountId}
                                        onChange={(e) => setChartAccountId(e.target.value)}
                                        className="appearance-none bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                                    >
                                        <option value="all">Todas las cuentas</option>
                                        {accounts.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* The Chart */}
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-onyx-800/50" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        dy={10}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value} `}
                                        width={40}
                                        dx={-10}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                        formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Balance']}
                                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke={chartColor}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: chartColor }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pagos Fijos */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-slate-400" />
                                Pagos Fijos del Mes
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(fixedPayments.paid)}</span>
                                <span className="text-xs font-bold text-slate-400">/ {formatCurrency(fixedPayments.expected)}</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-2 overflow-hidden mb-4">
                            <div
                                className="h-full bg-slate-800 dark:bg-slate-400 rounded-full"
                                style={{ width: `${Math.min(100, (fixedPayments.paid / Math.max(1, fixedPayments.expected)) * 100)}% ` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-500">
                                {fixedPayments.items.length} recibos pagados
                            </span>
                            <span className="text-slate-800 dark:text-slate-300">
                                Quedan aprox. {formatCurrency(fixedPayments.remaining)}
                            </span>
                        </div>
                    </div>

                </div>

                {/* ---------- RIGHT COLUMN (Span 1) ---------- */}
                <div className="lg:col-span-1">

                    {/* Presupuesto Detallado Mensual */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-slate-400" />
                                Presupuesto Detallado
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                            {detailedBudget.length > 0 ? detailedBudget.map((cat, idx) => {
                                const isOverLimit = cat.limit > 0 && cat.total > cat.limit;
                                const percent = cat.limit > 0 ? Math.min(100, (cat.total / cat.limit) * 100) : 0;

                                return (
                                    <div key={idx} className="flex flex-col gap-3">
                                        {/* Category Header */}
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={cn("text-sm font-black tabular-nums", isOverLimit ? "text-red-500" : "text-slate-900 dark:text-white")}>
                                                    {formatCurrency(cat.total)}
                                                </span>
                                                {cat.limit > 0 && (
                                                    <span className="text-xs font-bold text-slate-400">/ {formatCurrency(cat.limit)}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category Progress */}
                                        {cat.limit > 0 && (
                                            <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1 overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", isOverLimit ? "bg-red-500" : "bg-slate-400")}
                                                    style={{ width: `${percent}% ` }}
                                                />
                                            </div>
                                        )}

                                        {/* Subcategories */}
                                        {cat.subcategories.length > 0 && (
                                            <div className="pl-4 border-l-2 border-slate-100 dark:border-onyx-800 flex flex-col gap-2 mt-1">
                                                {cat.subcategories.map((sub, sIdx) => (
                                                    <div key={sIdx} className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-500 font-medium">{sub.name}</span>
                                                        <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">{formatCurrency(sub.total)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            }) : (
                                <div className="text-xs text-slate-400 text-center py-10">
                                    No hay gastos registrados este mes.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}

