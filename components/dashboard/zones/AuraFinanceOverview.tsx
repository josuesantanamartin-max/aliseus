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
    Layers,
    AlertTriangle,
    ArrowRight
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

    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);


    // ==========================================
    // LÓGICA DE CABECERA INTELIGENTE
    // ==========================================
    const smartHeader = useMemo(() => {
        const monthName = selectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        const capMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        const pendingCount = fixedPayments.pendingItems ? fixedPayments.pendingItems.length : 0;
        const hasPendingPayments = pendingCount > 0;
        const budgetPercent = globalBudgetLimit > 0 ? (globalBudgetSpent / globalBudgetLimit) : 0;
        const isOverBudgetLimit = budgetPercent >= 0.9;
        const isNegativeBalance = monthBalance < 0;

        let title = "";
        let colorTheme: 'emerald' | 'amber' | 'rose' | 'slate' = 'emerald';
        
        // Prioridad 1: Pagos pendientes urgentes
        if (hasPendingPayments) {
            title = `Tu atención financiera es necesaria: tienes ${pendingCount} pago${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''} esta semana.`;
            colorTheme = "amber";
        } 
        // Prioridad 2: Alerta Presupuesto
        else if (isOverBudgetLimit) {
            title = globalBudgetSpent > globalBudgetLimit 
                ? "El presupuesto familiar se ha excedido. Toca reajustar prioridades." 
                : "Estamos al límite del presupuesto mensual. Mantengamos el foco.";
            colorTheme = "rose";
        } 
        // Prioridad 3: Resultado Mensual en negativo
        else if (isNegativeBalance) {
            title = "El balance de este mes está en negativo. Revisemos los gastos imprevistos.";
            colorTheme = "rose";
        } 
        // Todo controlado
        else {
            title = "Economía familiar estable. Tus planes de ahorro están en marcha.";
            colorTheme = "emerald";
        }

        return {
            title,
            colorTheme,
            dateLabel: capMonth,
            pendingCount
        };
    }, [selectedDate, fixedPayments, globalBudgetSpent, globalBudgetLimit, monthBalance]);

    // Color definitions for smart header
    const themeStyles = {
        emerald: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-100',
        amber: 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30 text-amber-900 dark:text-amber-100',
        rose: 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800/30 text-rose-900 dark:text-rose-100',
        slate: 'bg-slate-50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/30 text-slate-900 dark:text-slate-100',
    };
    const highlightStyles = {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        amber: 'text-amber-600 dark:text-amber-400',
        rose: 'text-rose-600 dark:text-rose-400',
        slate: 'text-slate-600 dark:text-slate-400',
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-0 pb-12">

            {/* ========================================== */}
            {/* CABECERA DIARIA INTELIGENTE                */}
            {/* ========================================== */}
            <div className={`p-6 md:p-8 rounded-[2rem] border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300 ${themeStyles[smartHeader.colorTheme]}`}>
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">
                        {smartHeader.dateLabel}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                        {smartHeader.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-sm font-semibold whitespace-nowrap">
                            <span className="opacity-70 font-medium mr-1">Gastados</span>{formatCurrency(globalBudgetSpent)}
                        </span>
                        <span className="text-black/20 dark:text-white/20">•</span>
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-sm font-semibold whitespace-nowrap">
                            <span className="opacity-70 font-medium mr-1">Restantes</span>{formatCurrency(globalBudgetRemaining)}
                        </span>
                        <span className="text-black/20 dark:text-white/20">•</span>
                        <span className={`px-3 py-1 rounded-full bg-white/50 dark:bg-black/50 text-sm font-semibold whitespace-nowrap shadow-sm ${smartHeader.pendingCount > 0 ? highlightStyles.amber : 'opacity-80'}`}>
                            {smartHeader.pendingCount} pagos pendientes
                        </span>
                    </div>
                </div>

                <div className="shrink-0 flex items-center">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 group">
                        <span>Ver desglose</span>
                        <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ========================================== */}
            {/* FILA 1: OPERATIVIDAD Y ACCIÓN (HOY)        */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* --- Próximos Pagos Fijos --- */}
                <div className="col-span-1 flex flex-col">
                    <div className={cn(
                        "rounded-3xl p-6 border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full min-h-[380px] transition-all duration-300",
                        fixedPayments.pendingItems && fixedPayments.pendingItems.length > 0
                            ? "bg-amber-50/30 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50"
                            : "bg-white dark:bg-onyx-900 border-slate-100 dark:border-onyx-800/80"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarCheck className={cn("w-4 h-4", 
                                    fixedPayments.pendingItems && fixedPayments.pendingItems.length > 0 ? "text-amber-500" : "text-slate-400"
                                )} />
                                Pagos Fijos de este Mes
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(fixedPayments.paid)}</span>
                                <span className="text-xs font-bold text-slate-400">/ {formatCurrency(fixedPayments.expected)}</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-3 overflow-hidden shrink-0">
                            <div
                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (fixedPayments.paid / Math.max(1, fixedPayments.expected)) * 100)}% ` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold mb-4 shrink-0 border-b border-transparent pb-2">
                            <span className="text-slate-500">
                                {fixedPayments.items.length} recibos procesados
                            </span>
                            <span className={cn(
                                "px-3 py-1 rounded-full",
                                (!fixedPayments.pendingItems || fixedPayments.pendingItems.length === 0) 
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            )}>
                                {(!fixedPayments.pendingItems || fixedPayments.pendingItems.length === 0) 
                                    ? "Todo al día" 
                                    : `${fixedPayments.pendingItems.length} pendientes`}
                            </span>
                        </div>

                        {/* Listado */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-3">
                            {fixedPayments.pendingItems && fixedPayments.pendingItems.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-amber-50/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10">Pendientes</h4>
                                    {fixedPayments.pendingItems.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-white dark:bg-onyx-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-onyx-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{item.category}</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.remainingAmount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {fixedPayments.items && fixedPayments.items.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10">Ya Pagados</h4>
                                    {fixedPayments.items.map((tx) => (
                                        <div key={tx.id} className="flex justify-between items-center bg-slate-50 dark:bg-onyx-800/50 p-3 rounded-xl border border-transparent">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate mr-2">{tx.description || tx.category}</span>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 line-through tabular-nums">{formatCurrency(tx.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {fixedPayments.items.length === 0 && (!fixedPayments.pendingItems || fixedPayments.pendingItems.length === 0) && (
                                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-onyx-800 rounded-full flex items-center justify-center mb-3">
                                        <CalendarCheck className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Sin previsión de pagos</p>
                                    <p className="text-xs font-medium text-slate-500 mb-4 px-4">
                                        Registra tus recibos fijos (alquiler, luz, suscripciones) para saber cuánto dinero quedará realmente libre a fin de mes.
                                    </p>
                                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold rounded-xl transition-colors">
                                        Configurar pagos fijos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Movimientos Recientes --- */}
                <div className="col-span-1 flex flex-col">
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full min-h-[380px] flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                Movimientos Recientes
                            </h3>
                            <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors uppercase tracking-wider">
                                Historial completo
                            </button>
                        </div>
                        <div className="flex flex-col flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                            {recentTransactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-onyx-800/40 rounded-2xl border border-slate-100 dark:border-onyx-700/50 transition-all hover:bg-slate-100 dark:hover:bg-onyx-800 group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", 
                                            tx.type === 'INCOME' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                            : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                                        )}>
                                            {tx.type === 'INCOME' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{tx.description || tx.category}</p>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{tx.category} &bull; {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                    </div>
                                    <div className={cn("text-lg font-black tabular-nums tracking-tight shrink-0 pl-2", 
                                        tx.type === 'INCOME' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"
                                    )}>
                                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </div>
                                </div>
                            ))}
                            
                            {recentTransactions.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-onyx-800 rounded-full flex items-center justify-center mb-3">
                                        <Activity className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Sin historial de pagos</p>
                                    <p className="text-xs font-medium text-slate-500 mb-4 px-4">
                                        Conecta tus cuentas bancarias o añade tus gastos manuales para que el panel cobre vida.
                                    </p>
                                    <button className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold rounded-xl transition-colors">
                                        Vincular banco
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* FILA 2: CONTEXTO Y ANÁLISIS (KPIs)         */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Saldo Disponible */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                        <div className="mb-2">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Liquidez Disponible</h3>
                        </div>
                        <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(totalBalance)}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                        {liquidAccounts.map(a => (
                            <div key={a.id} className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium truncate mr-2">{a.name}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(a.balance)}</span>
                            </div>
                        ))}
                        {liquidAccounts.length === 0 && (
                            <div className="text-xs text-slate-400 italic">Sin liquidez registrada</div>
                        )}
                    </div>
                </div>

                {/* 2. Total Ahorro */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden">
                    <div className="z-10">
                        <div className="mb-2">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Ahorro y Patrimonio</h3>
                        </div>
                        <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(totalSavings)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                            <span>+ {formatCurrency(savingsThisMonth)}</span>
                            <span className="text-slate-400 dark:text-slate-500 font-medium">este mes</span>
                        </div>
                    </div>

                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-sky-50 dark:bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* 3. Resultado Mensual */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="mb-4 shrink-0">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Resultado Mensual</h3>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex flex-col flex-1 bg-slate-50 dark:bg-onyx-800 p-2 rounded-xl border border-slate-100 dark:border-onyx-700/50">
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-0.5">Ingresado</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">
                                    {formatCurrency(monthlyIncome)}
                                </span>
                            </div>
                            <div className="flex flex-col flex-1 bg-slate-50 dark:bg-onyx-800 p-2 rounded-xl border border-slate-100 dark:border-onyx-700/50">
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-0.5">Gastado</span>
                                <span className="text-rose-600 dark:text-rose-400 font-black text-xs">
                                    {formatCurrency(monthlyExpenses)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-50 dark:border-onyx-800">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resultado Neto</span>
                                <div className={cn("text-2xl lg:text-3xl font-black tabular-nums tracking-tight flex items-center gap-2 leading-none",
                                    monthBalance >= 0 ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {formatCurrency(monthBalance)}
                                    {monthBalance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                                <p className={cn("text-[10px] font-bold mt-2", 
                                    monthBalance >= 0 ? "text-emerald-600/70 dark:text-emerald-400/50" : "text-rose-600/70 dark:text-rose-400/50"
                                )}>
                                    {monthBalance >= 0 ? "Superávit / Capacidad de ahorro" : "Déficit / Gasto sobre ingresos"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Control Rápido Presupuesto */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <div className="mb-2">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Capacidad de Consumo</h3>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(globalBudgetLimit)}
                        </div>
                        
                        <div className="text-xs font-bold text-slate-400 mb-2">
                            Techo Operativo
                        </div>

                        <div className="mt-2 w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full", globalBudgetSpent > globalBudgetLimit ? "bg-rose-500" : "bg-blue-600")}
                                style={{ width: `${Math.min(100, (globalBudgetSpent / Math.max(1, globalBudgetLimit)) * 100)}% ` }}
                            />
                        </div>

                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex justify-between uppercase">
                            <span>Gastado {formatCurrency(globalBudgetSpent)}</span>
                            <span className={cn(globalBudgetRemaining === 0 ? "text-rose-500" : "text-blue-600 dark:text-blue-400")}>
                                Quedan {formatCurrency(globalBudgetRemaining)}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* FILA 3: ESTRUCTURAL Y TENDENCIAS           */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Principal: Gráfico Evolutivo */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                    Histórico de Liquidez
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

                        {/* Chart */}
                        <div className="h-[280px] md:h-[350px] w-full mt-auto">
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
                </div>

                {/* Columna Derecha: Presupuesto Detallado */}
                <div className="lg:col-span-1 flex flex-col">
                    <DetailedBudgetWidget detailedBudget={detailedBudget} />
                </div>

            </div>

        </div>
    );
}

