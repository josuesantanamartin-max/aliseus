import React, { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { useFinanceStore } from '../../../../store/useFinanceStore';
import { useUserStore } from '../../../../store/useUserStore';
import { analyzeFinances } from '../../../../services/geminiFinancial';
import { FinanceWidgetType } from '../../../../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Legend, LineChart, Line
} from 'recharts';
import {
    Sparkles, Wallet, TrendingUp, TrendingDown, AlertCircle, PiggyBank, X,
    Loader2, ArrowUpRight, ArrowDownRight, Activity, Calendar,
    CreditCard, ArrowRight, ShieldCheck, Target, CreditCard as CardIcon, ArrowUpCircle, ArrowDownCircle, Plus, CircuitBoard, Wifi, Filter, ChevronLeft, ChevronRight, Landmark, Banknote,
    Edit, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import BudgetStatusWidget from './widgets/BudgetStatusWidget';
import CategoryDistributionChart from './widgets/CategoryDistributionChart';
import ActiveGoalsWidget from './widgets/ActiveGoalsWidget';
import ActiveDebtsWidget from './widgets/ActiveDebtsWidget';
import ActiveProjectsWidget from './widgets/ActiveProjectsWidget';
import TimelineEvolutionWidget from './widgets/TimelineEvolutionWidget';

const WIDGET_NAMES: Record<FinanceWidgetType, string> = {
    'HEALTH_SCORE': 'Puntuación Financiera',
    'KPI_CARDS': 'Indicadores Clave',
    'BUDGET_GOALS_SUMMARY': 'Resumen Metas y Presupuesto',
    'CHART_EVOLUTION': 'Evolución Saldo',
    'CHART_FLOW': 'Gráfico Flujo',
    'TOP_EXPENSES': 'Top Gastos',
    'RECENT_LIST': 'Movimientos Recientes'
};

interface FinanceSummaryProps {
    onViewTransactions?: (filters: { category?: string; subCategory?: string; type?: 'INCOME' | 'EXPENSE'; initialDate?: string; accountId?: string }) => void;
}

const FinanceSummary: React.FC<FinanceSummaryProps> = ({ onViewTransactions: onNavigateProp }) => {
    const {
        transactions, accounts, budgets, goals, debts, projectBudgets,
        widgets, setWidgets
    } = useFinanceStore();

    const {
        language, currency, setFinanceActiveTab
    } = useUserStore();

    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(false); // New explicit visibility toggle
    const [isEditingLayout, setIsEditingLayout] = useState(false);

    // --- NEW: Global Time State ---
    const [timeMode, setTimeMode] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Chart Range State (Independent for trending view)
    const [chartRange, setChartRange] = useState<'3M' | '6M' | '1Y' | 'ALL'>('6M');

    // Chart Interaction State
    const [activeAccountName, setActiveAccountName] = useState<string | null>(null);
    const [activeFlowType, setActiveFlowType] = useState<'ALL' | 'Ingresos' | 'Gastos'>('ALL');

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount);
    };

    const toggleWidget = (id: FinanceWidgetType) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
    };

    const isVisible = (id: FinanceWidgetType) => widgets.find(w => w.id === id)?.visible;

    const onViewTransactions = (filters: { category?: string; subCategory?: string; type?: 'INCOME' | 'EXPENSE'; initialDate?: string; accountId?: string }) => {
        if (onNavigateProp) {
            onNavigateProp(filters);
        } else {
            setFinanceActiveTab('transactions');
        }
    };

    // --- DATA PROCESSING: Accounts & KPIs ---

    // 1. Net Worth (Static, always current snapshot)
    const totalAssets = accounts.filter(a => a.type !== 'CREDIT').reduce((acc, curr) => acc + curr.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === 'CREDIT').reduce((acc, curr) => acc + Math.abs(curr.balance), 0);
    const totalDebtBalance = debts.reduce((acc, d) => acc + d.remainingBalance, 0);
    const netWorth = totalAssets - (totalLiabilities + totalDebtBalance);

    const calculateNetWorthGrowth = (monthsBack: number) => {
        const today = new Date();
        const cutoffDate = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
        const netFlowSinceCutoff = transactions
            .filter(t => new Date(t.date) >= cutoffDate)
            .reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0);

        const pastNetWorth = netWorth - netFlowSinceCutoff;
        if (pastNetWorth === 0) return 0;
        return ((netWorth - pastNetWorth) / Math.abs(pastNetWorth)) * 100;
    };

    const monthlyGrowth = calculateNetWorthGrowth(1);
    const yearlyGrowth = calculateNetWorthGrowth(12);

    const NON_OPERATING_CATS = ['Transferencia', 'Deudas', 'Ahorro', 'Inversión'];

    const getFlowsForPeriod = (date: Date, mode: 'MONTH' | 'YEAR') => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const txs = transactions.filter(t => {
            const tDate = new Date(t.date);
            if (mode === 'YEAR') {
                return tDate.getFullYear() === year;
            } else {
                return tDate.getFullYear() === year && tDate.getMonth() === month;
            }
        });

        const income = txs
            .filter(t => t.type === 'INCOME' && !NON_OPERATING_CATS.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = txs
            .filter(t => t.type === 'EXPENSE' && !NON_OPERATING_CATS.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        return { income, expense };
    };

    const currentFlow = getFlowsForPeriod(selectedDate, timeMode);
    const prevDate = new Date(selectedDate);
    if (timeMode === 'MONTH') {
        prevDate.setMonth(prevDate.getMonth() - 1);
    } else {
        prevDate.setFullYear(prevDate.getFullYear() - 1);
    }
    const prevFlow = getFlowsForPeriod(prevDate, timeMode);

    const calculateTrend = (current: number, prev: number) => {
        if (prev === 0) return current > 0 ? 100 : 0;
        return ((current - prev) / prev) * 100;
    };

    const incomeTrend = calculateTrend(currentFlow.income, prevFlow.income);
    const expenseTrend = calculateTrend(currentFlow.expense, prevFlow.expense);

    const currentSaved = currentFlow.income - currentFlow.expense;
    const prevSaved = prevFlow.income - prevFlow.expense;
    const savingsRate = currentFlow.income > 0 ? (currentSaved / currentFlow.income) * 100 : 0;
    const savingsTarget = 20;

    const incomeDiff = currentFlow.income - prevFlow.income;
    const expenseDiff = currentFlow.expense - prevFlow.expense;
    const savedDiff = currentSaved - prevSaved;

    const budgetMetrics = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const activeBudgets = budgets.filter(b => b.period === 'MONTHLY' || (b.period === 'YEARLY' && new Date(b.startDate || '').getFullYear() === year));
        let totalBudgetLimit = 0;
        let totalBudgetSpent = 0;
        activeBudgets.forEach(b => {
            let limit = b.limit;
            if (b.budgetType === 'PERCENTAGE' && b.percentage) {
                limit = (currentFlow.income * b.percentage) / 100;
            }
            totalBudgetLimit += limit;
            const spent = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    const isSamePeriod = timeMode === 'MONTH'
                        ? (tDate.getFullYear() === year && tDate.getMonth() === month)
                        : (tDate.getFullYear() === year);

                    return isSamePeriod && t.type === 'EXPENSE' && t.category === b.category && (b.subCategory ? t.subCategory === b.subCategory : true);
                })
                .reduce((sum, t) => sum + t.amount, 0);
            totalBudgetSpent += spent;
        });
        const budgetHealth = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;
        return { totalBudgetLimit, totalBudgetSpent, budgetHealth, activeCount: activeBudgets.length };
    }, [budgets, transactions, selectedDate, timeMode, currentFlow.income]);

    const goalsMetrics = useMemo(() => {
        const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
        const totalCurrent = goals.reduce((acc, g) => acc + g.currentAmount, 0);
        const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
        return { totalTarget, totalCurrent, overallProgress, count: goals.length };
    }, [goals]);

    const calculateHealthScore = () => {
        let score = 50;
        if (savingsRate > 20) score += 20;
        else if (savingsRate > 10) score += 10;
        else if (savingsRate < 0) score -= 10;
        const debtRatio = totalAssets > 0 ? (totalLiabilities + totalDebtBalance) / totalAssets : 0;
        if (debtRatio < 0.3) score += 20;
        else if (debtRatio > 0.6) score -= 10;
        if (currentFlow.income > currentFlow.expense) score += 10;
        if (budgetMetrics.activeCount > 0 && budgetMetrics.budgetHealth <= 100) score += 10;
        if (budgetMetrics.budgetHealth > 100) score -= 10;
        return Math.min(Math.max(score, 0), 100);
    };
    const healthScore = calculateHealthScore();

    const handlePrevPeriod = () => {
        const newDate = new Date(selectedDate);
        if (timeMode === 'MONTH') newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setFullYear(newDate.getFullYear() - 1);
        setSelectedDate(newDate);
    };

    const handleNextPeriod = () => {
        const newDate = new Date(selectedDate);
        if (timeMode === 'MONTH') newDate.setMonth(newDate.getMonth() + 1);
        else newDate.setFullYear(newDate.getFullYear() + 1);
        setSelectedDate(newDate);
    };

    const periodLabel = timeMode === 'MONTH'
        ? selectedDate.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
        : selectedDate.getFullYear().toString();

    const prevPeriodLabel = timeMode === 'MONTH'
        ? prevDate.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'short' })
        : prevDate.getFullYear().toString();

    const accountEvolutionData = useMemo(() => {
        let monthsToLookBack = 6;
        if (chartRange === '3M') monthsToLookBack = 3;
        if (chartRange === '1Y') monthsToLookBack = 12;
        if (chartRange === 'ALL') monthsToLookBack = 12;

        const data: any[] = [];
        const trackedAccounts = accounts.filter(a => a.type === 'BANK' || a.type === 'CASH');
        const runningBalances: Record<string, number> = {};
        trackedAccounts.forEach(acc => { runningBalances[acc.id] = acc.balance; });

        const today = new Date();
        const dates: string[] = [];
        for (let i = 0; i < monthsToLookBack; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            dates.push(d.toISOString().slice(0, 7));
        }

        for (const monthStr of dates) {
            const dataPoint: any = {
                name: new Date(monthStr + '-01').toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'short' }),
            };
            trackedAccounts.forEach(acc => { dataPoint[acc.name] = runningBalances[acc.id]; });
            data.unshift(dataPoint);
            const monthTxs = transactions.filter(t => t.date.startsWith(monthStr));
            trackedAccounts.forEach(acc => {
                const income = monthTxs.filter(t => t.accountId === acc.id && t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
                const expense = monthTxs.filter(t => t.accountId === acc.id && t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
                runningBalances[acc.id] = runningBalances[acc.id] - (income - expense);
            });
        }
        return { data, accounts: trackedAccounts };
    }, [transactions, accounts, chartRange, language]);

    const incomeExpenseData = useMemo(() => {
        const today = new Date();
        let monthsToLookBack = 6;
        if (chartRange === '3M') monthsToLookBack = 3;
        if (chartRange === '1Y') monthsToLookBack = 12;
        if (chartRange === 'ALL') monthsToLookBack = 12;

        const data = [];
        for (let i = monthsToLookBack - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const txs = transactions.filter(t => t.date.startsWith(d.toISOString().slice(0, 7)));
            const inc = txs.filter(t => t.type === 'INCOME' && !NON_OPERATING_CATS.includes(t.category)).reduce((sum, t) => sum + t.amount, 0);
            const exp = txs.filter(t => t.type === 'EXPENSE' && !NON_OPERATING_CATS.includes(t.category)).reduce((sum, t) => sum + t.amount, 0);
            data.push({
                name: d.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'short' }),
                Ingresos: inc, Gastos: exp, Neto: inc - exp
            });
        }
        return data;
    }, [transactions, chartRange, language]);

    const categoryData = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const periodTx = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && (timeMode === 'MONTH' ? tDate.getMonth() === month : true) && t.type === 'EXPENSE' && !NON_OPERATING_CATS.includes(t.category);
        });
        const grouped = periodTx.reduce((acc: any, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});
        return Object.entries(grouped).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [transactions, selectedDate, timeMode]);

    const recentTransactions = transactions.slice(0, 5);

    const handleGeminiAnalysis = async () => {
        setIsAnalyzing(true);
        // Clean previous analysis to allow re-run effect
        setAnalysis(null);
        try {
            const result = await analyzeFinances(transactions, accounts, debts, budgets, goals, language, currency);
            setAnalysis(result);
            setIsAnalysisVisible(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const ACC_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
    const CATEGORY_COLORS = ['#1e3a8a', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe'];

    return (
        <div className="space-y-8 animate-fade-in pb-12 relative">
            {isEditingLayout && (
                <div className="sticky top-0 z-50 bg-cyan-950/90 backdrop-blur-md p-4 rounded-3xl mb-6 text-white animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Configurar Resumen</h3>
                        <button onClick={() => setIsEditingLayout(false)} className="bg-white text-cyan-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200">Terminar</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {widgets.map(w => (
                            <button key={w.id} onClick={() => toggleWidget(w.id as FinanceWidgetType)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${w.visible ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-gray-600 text-gray-400'}`}>
                                {w.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                {WIDGET_NAMES[w.id as FinanceWidgetType] || w.id}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* HEADER ACCOUNTS GRID (No Scroll) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map(acc => (
                    <div key={acc.id} onClick={() => onViewTransactions({ accountId: acc.id })} className={`p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group ${acc.type === 'CREDIT' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white dark:bg-aliseus-900 border-gray-100 dark:border-aliseus-800 text-gray-900 dark:text-white shadow-sm'}`}>
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-2.5 rounded-xl ${acc.type === 'CREDIT' ? 'bg-slate-800 text-blue-400' : 'bg-gray-50 dark:bg-aliseus-800 text-gray-500 dark:text-gray-400'}`}><Wallet className="w-5 h-5" /></div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${acc.type === 'CREDIT' ? 'text-slate-500' : 'text-gray-400 dark:text-gray-500'}`}>{acc.bankName}</span>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <p className="text-xs font-bold truncate mb-0.5 opacity-60">{acc.name}</p>
                            <p className="text-xl font-black tracking-tight">{formatMoney(acc.balance)}</p>
                        </div>
                        {/* Decorative background element */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 ${acc.type === 'CREDIT' ? 'bg-blue-500' : 'bg-gray-900'}`}></div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {language === 'ES' ? 'Resumen Financiero' : language === 'FR' ? 'Résumé Financier' : 'Financial Summary'}
                    </h2>
                    <p className="text-gray-500 mt-2 max-w-xl text-sm leading-relaxed">
                        Análisis avanzado de tu patrimonio neto, flujos de caja y cumplimiento de presupuestos.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <button onClick={() => setIsEditingLayout(!isEditingLayout)} className={`p-3 border rounded-2xl transition-colors shadow-sm active:scale-95 ${isEditingLayout ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}><Edit className="w-5 h-5" /></button>
                    <div className="bg-white dark:bg-aliseus-900 p-1.5 rounded-2xl border border-gray-200 dark:border-aliseus-800 shadow-sm flex items-center gap-2">
                        <div className="flex bg-gray-100 dark:bg-aliseus-800 rounded-xl p-1">
                            <button onClick={() => { setTimeMode('MONTH'); setSelectedDate(new Date()); }} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${timeMode === 'MONTH' ? 'bg-white dark:bg-aliseus-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>Mes</button>
                            <button onClick={() => { setTimeMode('YEAR'); setSelectedDate(new Date()); }} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${timeMode === 'YEAR' ? 'bg-white dark:bg-aliseus-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>Año</button>
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <button onClick={handlePrevPeriod} className="p-1 hover:bg-gray-100 dark:hover:bg-aliseus-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[120px] text-center capitalize">{periodLabel}</span>
                            <button onClick={handleNextPeriod} className="p-1 hover:bg-gray-100 dark:hover:bg-aliseus-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <button onClick={handleGeminiAnalysis} disabled={isAnalyzing} className="flex items-center gap-2 bg-blue-950 text-white hover:bg-blue-900 px-5 py-3 rounded-2xl transition-all shadow-lg font-bold text-sm">{isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />} {isAnalyzing ? 'Analizando...' : 'Análisis IA'}</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isVisible('HEALTH_SCORE') && (
                    <div className="bg-white dark:bg-aliseus-900 p-6 rounded-2xl border border-gray-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-50 dark:bg-aliseus-800 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-aliseus-700"><ShieldCheck className="w-5 h-5 text-gray-700 dark:text-gray-300" /></div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border flex items-center gap-1 ${monthlyGrowth >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{monthlyGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {Math.abs(monthlyGrowth).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% vs mes ant.</span>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patrimonio Neto</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">{formatMoney(netWorth)}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 italic">Total Activos - Pasivos</p>
                    </div>
                )}
                {isVisible('KPI_CARDS') && (
                    <>
                        <div onClick={() => onViewTransactions({ type: 'INCOME' })} className="bg-white dark:bg-aliseus-900 p-6 rounded-2xl border border-gray-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                                <div className={`flex items-center text-xs font-bold ${incomeTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>{incomeTrend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />} {Math.abs(incomeTrend).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</div>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos ({timeMode === 'MONTH' ? 'Mes' : 'Año'})</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">{formatMoney(currentFlow.income)}</h3>
                        </div>
                        <div onClick={() => onViewTransactions({ type: 'EXPENSE' })} className="bg-white dark:bg-aliseus-900 p-6 rounded-2xl border border-gray-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"><TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
                                <div className={`flex items-center text-xs font-bold ${expenseTrend <= 0 ? 'text-green-600' : 'text-red-500'}`}>{expenseTrend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />} {Math.abs(expenseTrend).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</div>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gastos ({timeMode === 'MONTH' ? 'Mes' : 'Año'})</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">{formatMoney(currentFlow.expense)}</h3>
                        </div>
                        {/* NEW BUDGET KPI CARD */}
                        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-2xl border border-gray-100 dark:border-aliseus-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                                <div className={`flex items-center text-xs font-bold ${budgetMetrics.budgetHealth <= 100 ? 'text-green-600' : 'text-red-500'}`}>
                                    {budgetMetrics.budgetHealth.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% Usado
                                </div>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Presupuesto ({timeMode === 'MONTH' ? 'Mes' : 'Año'})</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{formatMoney(currentFlow.expense)}</h3>
                                <span className="text-sm font-bold text-gray-400">/ {formatMoney(budgetMetrics.totalBudgetLimit)}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-aliseus-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className={`h-full rounded-full ${budgetMetrics.budgetHealth > 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(budgetMetrics.budgetHealth, 100)}%` }}></div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* ROW 1: Expenses (Full Width) */}
                {isVisible('TOP_EXPENSES') && (
                    <div className="col-span-1">
                        <CategoryDistributionChart
                            transactions={transactions}
                            onNavigate={(app, tab) => setFinanceActiveTab(tab as any)}
                            selectedDate={selectedDate}
                            timeMode={timeMode}
                            onFilter={(category, subCategory) => onViewTransactions({
                                category,
                                subCategory,
                                type: 'EXPENSE',
                                initialDate: timeMode === 'MONTH' ? selectedDate.toISOString().slice(0, 7) : selectedDate.getFullYear().toString()
                            })}
                        />
                    </div>
                )}

                {/* ROW 2: Budgets (Full Width) */}
                {isVisible('BUDGET_GOALS_SUMMARY') && budgets.length > 0 && (
                    <div className="col-span-1">
                        <BudgetStatusWidget
                            budgets={budgets}
                            transactions={transactions}
                            currentIncome={currentFlow.income}
                            currency={currency}
                            selectedDate={selectedDate}
                            timeMode={timeMode}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ROW 3: Goals & Debts (Dynamic) */}
                {isVisible('BUDGET_GOALS_SUMMARY') && goals.length > 0 && (
                    <ActiveGoalsWidget
                        goals={goals}
                        onNavigate={(app, tab) => setFinanceActiveTab(tab as any)}
                    />
                )}

                {isVisible('BUDGET_GOALS_SUMMARY') && debts.length > 0 && (
                    <ActiveDebtsWidget
                        debts={debts}
                        onNavigate={(app, tab) => setFinanceActiveTab(tab as any)}
                    />
                )}

                {isVisible('BUDGET_GOALS_SUMMARY') && projectBudgets.some(p => p.status === 'ACTIVE') && (
                    <div className="col-span-1 lg:col-span-2">
                        <ActiveProjectsWidget
                            projects={projectBudgets}
                            transactions={transactions}
                            onViewProject={(id) => setFinanceActiveTab('projects')}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isVisible('CHART_EVOLUTION') && (
                    <div className="bg-white dark:bg-aliseus-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-aliseus-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Evolución de Cuentas</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={accountEvolutionData.data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" className="opacity-20" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString('es-ES')} />
                                    <Tooltip
                                        formatter={(value: number) => formatMoney(value)}
                                        contentStyle={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend />
                                    {accountEvolutionData.accounts.map((acc, idx) => (
                                        <Line key={acc.id} type="monotone" dataKey={acc.name} stroke={ACC_COLORS[idx % ACC_COLORS.length]} strokeWidth={2} dot={false} />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Evolution Widget */}
            <div className="grid grid-cols-1 gap-6">
                <TimelineEvolutionWidget
                    transactions={transactions}
                    accounts={accounts}
                    selectedDate={selectedDate}
                    timeMode={timeMode}
                    onNavigate={(app, tab) => setFinanceActiveTab(tab as any)}
                />
            </div>

            {/* AI ANALYSIS MODAL/DRAWER */}
            {isAnalysisVisible && analysis && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cyan-950/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAnalysisVisible(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                {language === 'ES' ? 'Análisis Financiero IA' : 'AI Financial Analysis'}
                            </h3>
                            <button onClick={() => setIsAnalysisVisible(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
                            <div
                                className="prose prose-sm prose-blue max-w-none text-gray-600 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(analysis) }}
                            />
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setIsAnalysisVisible(false)} className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
                                {language === 'ES' ? 'Cerrar' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default FinanceSummary;
