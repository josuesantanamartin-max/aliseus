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
import { DetailedBudgetWidget } from './finance/DetailedBudgetWidget';

export interface PendingFixedPayment {
    id: string;
    category: string;
    expectedAmount: number;
    paidAmount: number;
    remainingAmount: number;
}

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
    // ACCOUNT CLASSIFICATION (Strictly Mutually Exclusive)
    // ==========================================
    const LIQUID_TYPES = ['BANK', 'CASH', 'WALLET'] as const;

    const { savingsAccounts, liquidAccounts } = useMemo(() => {
        // Cuentas consideradas de ahorro (por tipo o nombre o si son remuneradas explícitamente)
        const savings = accounts.filter(a =>
            a.type === 'SAVINGS' ||
            a.type === 'INVESTMENT' ||
            a.name.toLowerCase().includes('ahorro') ||
            a.name.toLowerCase().includes('hucha')
        );

        // Cuentas de liquidez son aquellas del tipo banco/efectivo/wallet que NO son de ahorro
        const liquid = accounts.filter(a =>
            LIQUID_TYPES.includes(a.type as any) &&
            !savings.some(sa => sa.id === a.id)
        );

        return { savingsAccounts: savings, liquidAccounts: liquid };
    }, [accounts]);


    // ==========================================
    // WIDGET 1: SALDO DISPONIBLE (Suma Cuentas)
    // ==========================================
    const totalBalance = useMemo(() => {
        return liquidAccounts.reduce((acc, a) => acc + a.balance, 0);
    }, [liquidAccounts]);

    // ==========================================
    // WIDGET 2: TOTAL AHORRO & DESTINADO ESTE MES
    // ==========================================
    const { totalSavings, savingsThisMonth } = useMemo(() => {
        const tSavings = savingsAccounts.reduce((acc, a) => acc + a.balance, 0);

        // Ahorro transferido o registrado este mes
        const sThisMonth = currentMonthTxs.filter(t =>
            t.category === 'Ahorro' ||
            t.category === 'Inversión' ||
            savingsAccounts.some(sa => sa.id === t.accountId)
        ).filter(t => t.type === 'INCOME' || (t.type === 'EXPENSE' && t.category === 'Ahorro')).reduce((acc, t) => acc + t.amount, 0);

        return { totalSavings: tSavings, savingsThisMonth: sThisMonth };
    }, [savingsAccounts, currentMonthTxs]);

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
    const totalNetWorth = useMemo(() => {
        return accounts.reduce((acc, a) => acc + a.balance, 0);
    }, [accounts]);

    const chartData = useMemo(() => {
        const now = new Date();
        const dataPoints = [];
        
        // 1. Determine base balance (today)
        let currentBal = chartAccountId === 'all'
            ? totalNetWorth
            : (accounts.find(a => a.id === chartAccountId)?.balance || 0);

        // 2. Filter transactions for the selected account(s)
        const relevantTxs = transactions
            .filter(t => chartAccountId === 'all' || t.accountId === chartAccountId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 3. Determine timeframe
        let steps = 6;
        let unit: 'day' | 'month' = 'month';
        if (chartTimeframe === '1m') { steps = 30; unit = 'day'; }
        else if (chartTimeframe === '6m') { steps = 6; unit = 'month'; }
        else if (chartTimeframe === '1y') { steps = 12; unit = 'month'; }
        else if (chartTimeframe === '3y') { steps = 36; unit = 'month'; }
        else if (chartTimeframe === '5y') { steps = 60; unit = 'month'; }

        // 4. Calculate points walking backwards
        let runningBalance = currentBal;
        let txPointer = 0;

        for (let i = 0; i <= steps; i++) {
            const d = new Date(now);
            if (unit === 'day') d.setDate(d.getDate() - i);
            else d.setMonth(d.getMonth() - i, 1);

            // Subtract all transactions that occurred AFTER this point in time (relative to the previous step)
            // But since we are calculating "balance at start of period i", 
            // and we start from "balance today", we subtract transactions that happened after d.
            
            // Wait, simplified: 
            // Point i = balance at the END of that day/month.
            // Point 0 (today) = currentBal.
            // Point 1 (yesterday/last month) = currentBal - transactions between today and yesterday.
            
            const periodEnd = i === 0 ? new Date(now.getTime() + 86400000) : new Date(now);
            if (i > 0) {
                if (unit === 'day') periodEnd.setDate(periodEnd.getDate() - (i - 1));
                else periodEnd.setMonth(periodEnd.getMonth() - (i - 1), 0); // Last day of previous month
            }
            
            const periodStart = new Date(now);
            if (unit === 'day') periodStart.setDate(periodStart.getDate() - i);
            else periodStart.setMonth(periodStart.getMonth() - i, 1);
            periodStart.setHours(0, 0, 0, 0);

            // For i > 0, we subtract transactions that happened between now and periodStart
            // Actually, let's just use the runningBalance.
            // At i=0, balance is current.
            // Before moving to i=1, we subtract txs that happened between i=0 and i=1.
            
            if (i > 0) {
                const stepStart = new Date(now);
                const stepEnd = new Date(now);

                if (unit === 'day') {
                    stepStart.setDate(now.getDate() - i);
                    stepEnd.setDate(now.getDate() - (i - 1));
                } else {
                    stepStart.setMonth(now.getMonth() - i, 1);
                    stepEnd.setMonth(now.getMonth() - (i - 1), 1);
                }
                stepStart.setHours(0,0,0,0);
                stepEnd.setHours(0,0,0,0);

                // Transactions to "undo": those between stepStart and stepEnd
                const txsInStep = relevantTxs.filter(t => {
                    const txDate = new Date(t.date);
                    return txDate >= stepStart && txDate < stepEnd;
                });

                txsInStep.forEach(t => {
                    if (t.type === 'INCOME') runningBalance -= t.amount;
                    else runningBalance += t.amount;
                });
            }

            dataPoints.unshift({
                name: unit === 'day' 
                    ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                    : d.toLocaleDateString('es-ES', { month: 'short', year: steps > 12 ? '2-digit' : undefined }),
                balance: runningBalance
            });
        }

        return dataPoints;
    }, [totalNetWorth, chartAccountId, accounts, chartTimeframe, transactions]);

    // ==========================================
    // PAGOS FIJOS
    // ==========================================
    const fixedPayments = useMemo(() => {
        const fixedCategories = ['Vivienda', 'Servicios', 'Seguros', 'Suscripciones', 'Educación', 'Préstamos'];

        // Find budgets for these categories
        const fixedBudgets = budgets.filter(b => fixedCategories.includes(b.category));

        // Find transactions for these categories
        const fixedTxs = currentMonthTxs.filter(t => t.type === 'EXPENSE' && (t.isRecurring || fixedCategories.includes(t.category)));
        const paidThisMonth = fixedTxs.reduce((acc, t) => acc + t.amount, 0);

        let expectedTotal = 0;
        const pendingItems: PendingFixedPayment[] = [];

        if (fixedBudgets.length > 0) {
            expectedTotal = fixedBudgets.reduce((acc, b) => acc + b.limit, 0);

            fixedBudgets.forEach(b => {
                const paidForCat = fixedTxs.filter(t => t.category === b.category).reduce((acc, t) => acc + t.amount, 0);
                if (paidForCat < b.limit) {
                    pendingItems.push({
                        id: b.id,
                        category: b.category,
                        expectedAmount: b.limit,
                        paidAmount: paidForCat,
                        remainingAmount: b.limit - paidForCat
                    });
                }
            });

            // Adjust expectedTotal if we paid *more* than budgeted for some category
            expectedTotal = Math.max(expectedTotal, paidThisMonth + pendingItems.reduce((acc, p) => acc + p.remainingAmount, 0));

        } else {
            // Mock expected total for demonstration if no budgets
            expectedTotal = paidThisMonth > 0 ? paidThisMonth * 1.3 : 1500;
        }

        return {
            paid: paidThisMonth,
            expected: expectedTotal,
            remaining: Math.max(0, expectedTotal - paidThisMonth),
            items: fixedTxs,
            pendingItems
        };
    }, [currentMonthTxs, budgets]);

    // ==========================================
    // PRESUPUESTO DETALLADO (Subcategorías)
    // ==========================================
    const detailedBudget = useMemo(() => {
        const expenseTxs = currentMonthTxs.filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia');

        const catMap = new Map<string, { total: number, limit: number, subcategories: Map<string, number> }>();

        // 1. Initialize with all budgets so we don't miss categories with 0 spend
        budgets.forEach(b => {
            catMap.set(b.category, { total: 0, limit: b.limit, subcategories: new Map() });
        });

        // 2. Add actual expenses
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

        // Convert to array and sort by limit descending first, then total spending
        return Array.from(catMap.entries()).map(([name, data]) => ({
            name,
            total: data.total,
            limit: data.limit,
            subcategories: Array.from(data.subcategories.entries()).map(([subName, subTotal]) => ({ name: subName, total: subTotal }))
        })).sort((a, b) => {
            if (b.limit !== a.limit) return b.limit - a.limit; // Prioritize categories with budget limits
            return b.total - a.total; // Then by what you've spent
        });

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
                        {liquidAccounts.map(a => (
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
                                        tickFormatter={(value) => value.toLocaleString('es-ES')}
                                        width={80}
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
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-slate-400" />
                                Pagos Fijos del Mes
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(fixedPayments.paid)}</span>
                                <span className="text-xs font-bold text-slate-400">/ {formatCurrency(fixedPayments.expected)}</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-2 overflow-hidden shrink-0">
                            <div
                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                style={{ width: `${Math.min(100, (fixedPayments.paid / Math.max(1, fixedPayments.expected)) * 100)}% ` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold mb-4 shrink-0">
                            <span className="text-slate-500">
                                {fixedPayments.items.length} pagados
                            </span>
                            <span className="text-slate-800 dark:text-slate-300">
                                {fixedPayments.pendingItems ? fixedPayments.pendingItems.length : 0} pendientes
                            </span>
                        </div>

                        {/* Contenedor scrolleable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-3 min-h-[140px] max-h-[160px]">
                            {/* Pendientes */}
                            {fixedPayments.pendingItems && fixedPayments.pendingItems.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10">Pendientes</h4>
                                    {fixedPayments.pendingItems.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-50 dark:bg-onyx-800/50 p-2 rounded-xl">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mr-2">{item.category}</span>
                                            <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.remainingAmount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagados */}
                            {fixedPayments.items && fixedPayments.items.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10">Pagados</h4>
                                    {fixedPayments.items.map((tx) => (
                                        <div key={tx.id} className="flex justify-between items-center bg-slate-50 dark:bg-onyx-800/50 p-2 rounded-xl">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate mr-2">{tx.description || tx.category}</span>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(tx.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {fixedPayments.items.length === 0 && (!fixedPayments.pendingItems || fixedPayments.pendingItems.length === 0) && (
                                <div className="text-center text-xs text-slate-400 py-4">
                                    No hay pagos fijos programados.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ---------- RIGHT COLUMN (Span 1) ---------- */}
                <div className="lg:col-span-1">

                    {/* Presupuesto Detallado Mensual */}
                    <DetailedBudgetWidget detailedBudget={detailedBudget} />

                </div>

            </div>

        </div>
    );
}

