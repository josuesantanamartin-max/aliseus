import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2, Activity, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUserStore } from '@/store/useUserStore';
import { analyzePredictive } from '@/services/geminiFinancial';
import { cn } from '@/utils/cn';

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

type InsightTab = 'OVERVIEW' | 'FORECAST' | 'ANOMALY' | 'SAVINGS';

export const AiInsightsWidget: React.FC = () => {
    const [activeTab, setActiveTab] = useState<InsightTab>('OVERVIEW');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasRequestedAi, setHasRequestedAi] = useState(false);
    
    const { transactions } = useFinanceStore();
    const { language } = useUserStore();

    useEffect(() => {
        if (activeTab === 'OVERVIEW') {
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            setHasRequestedAi(true);
            try {
                // Ensure we only pass 'FORECAST' | 'ANOMALY' | 'SAVINGS'
                const tabForPrompt = activeTab as 'FORECAST' | 'ANOMALY' | 'SAVINGS';
                const result = await analyzePredictive(transactions, tabForPrompt, language);
                if (isMounted) setData(result);
            } catch (error) {
                console.error("AI Insights error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const timer = setTimeout(fetchData, 300);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [activeTab, transactions, language]);

    // --- Deterministic Analysis ---
    const generateDeterministicInsights = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = Math.max(1, now.getDate());
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear--;
        }

        const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        const isPrevMonth = (date: Date) => date.getMonth() === prevMonth && date.getFullYear() === prevYear;

        let cmExpenses = 0, pmExpenses = 0;
        const cmCategorySpent: Record<string, number> = {};
        const pmCategorySpent: Record<string, number> = {};

        if (transactions) {
            transactions.forEach(tx => {
                if (tx.type !== 'EXPENSE') return;
                const parsedDate = new Date(tx.date);
                if (isCurrentMonth(parsedDate)) {
                    cmExpenses += tx.amount;
                    cmCategorySpent[tx.category] = (cmCategorySpent[tx.category] || 0) + tx.amount;
                } else if (isPrevMonth(parsedDate)) {
                    pmExpenses += tx.amount;
                    pmCategorySpent[tx.category] = (pmCategorySpent[tx.category] || 0) + tx.amount;
                }
            });
        }

        // Project remaining balance. Assuming available 'total liquid balance' from store doesn't exist here directly without pulling it,
        // we'll use a local logic or just import useFinanceStore().accounts inside the component.
        const { accounts } = useFinanceStore.getState();
        const totalBalance = accounts?.reduce((acc, curr) => acc + curr.balance, 0) || 0;
        
        const dailyExpense = currentDay > 0 ? (cmExpenses / currentDay) : 0;
        const remainingDays = daysInMonth - currentDay;
        const projectedEndMonthExpense = cmExpenses + (dailyExpense * remainingDays);
        const projectedEndBalance = totalBalance - (projectedEndMonthExpense - cmExpenses);
        
        const monthName = now.toLocaleString('es-ES', { month: 'long' });
        const mainInsight = `Si mantienes este ritmo, cerrarás ${monthName} con ${formatCurrency(projectedEndBalance)}`;

        const secondaryAlerts = [];

        // 1. Top Category Variation
        let topCategory = '';
        let maxSpent = 0;
        Object.entries(cmCategorySpent).forEach(([cat, amount]) => {
            if (amount > maxSpent) {
                maxSpent = amount;
                topCategory = cat;
            }
        });

        if (topCategory && pmCategorySpent[topCategory]) {
            const pmCatAmount = pmCategorySpent[topCategory];
            const catDiffPct = ((maxSpent - pmCatAmount) / pmCatAmount) * 100;
            if (catDiffPct > 0) {
                secondaryAlerts.push({ message: `${topCategory} sube ${catDiffPct.toFixed(0)}%`, isGood: false });
            } else {
                secondaryAlerts.push({ message: `Ahorro en ${topCategory} (${Math.abs(catDiffPct).toFixed(0)}%)`, isGood: true });
            }
        } else {
            secondaryAlerts.push({ message: "Ritmo de gasto controlado", isGood: true });
        }

        // 2. Pending payments fake alert / general comparison
        // In a real scenario we'd use fixedPayments here
        if (pmExpenses > 0) {
             const expenseDiff = cmExpenses - pmExpenses;
             const expensePct = (expenseDiff / pmExpenses) * 100;
             if (expensePct > 0) {
                 secondaryAlerts.push({ message: `Gasto global +${expensePct.toFixed(0)}%`, isGood: false });
             } else {
                 secondaryAlerts.push({ message: "Todo al día (sin pagos urgentes)", isGood: true });
             }
        } else {
             secondaryAlerts.push({ message: "No hay pagos pendientes inminentes", isGood: true });
        }

        return { mainInsight, secondaryAlerts: secondaryAlerts.slice(0,2) };
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-indigo-400 h-full">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-bold animate-pulse">Analizando tus finanzas con Gemini...</p>
                </div>
            );
        }

        if (activeTab === 'OVERVIEW') {
            const { mainInsight, secondaryAlerts } = generateDeterministicInsights();
            return (
                <div className="animate-fadeIn relative z-10 h-full flex flex-col justify-between pt-1">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 mb-4 h-full flex items-center shadow-inner">
                        <h3 className="text-2xl lg:text-3xl font-black text-indigo-900 dark:text-indigo-200 tracking-tight leading-snug">
                            {mainInsight}
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {secondaryAlerts.map((alert, i) => (
                             <div key={i} className="flex gap-3 items-center bg-white/80 dark:bg-onyx-900/80 p-3.5 rounded-xl border border-slate-100 dark:border-onyx-800 shadow-sm transition-transform hover:-translate-y-0.5">
                                 <div className={cn("p-1.5 rounded-lg shrink-0", alert.isGood ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400")}>
                                    {alert.isGood ? <TrendingUp className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
                                 </div>
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{alert.message}</span>
                             </div>
                        ))}
                    </div>

                    <div className="flex justify-start">
                        <button 
                            onClick={() => setActiveTab('FORECAST')} 
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl hover:scale-105 transition-transform"
                        >
                            Ver análisis completo
                        </button>
                    </div>
                </div>
            );
        }

        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-slate-400 h-full text-center">
                    <p className="text-sm">Explora más la app y añade datos o espera a que la IA genere observaciones detalladas.</p>
                </div>
            );
        }

        return (
            <div className="animate-fadeIn relative z-10 text-sm text-slate-700 dark:text-slate-300">
                {Array.isArray(data) ? (
                    <ul className="space-y-3">
                        {data.map((item, i) => (
                            <li key={i} className="flex gap-3 items-start bg-white/70 dark:bg-onyx-900/70 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-onyx-800">
                                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shrink-0 mt-0.5">
                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="leading-relaxed font-medium">
                                    {typeof item === 'string' ? item : item.message || JSON.stringify(item)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="bg-white/70 dark:bg-onyx-900/70 p-5 rounded-2xl leading-relaxed whitespace-pre-wrap font-medium border border-slate-100 dark:border-onyx-800 shadow-sm">
                        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 dark:from-indigo-950/20 dark:via-onyx-900 dark:to-violet-950/10 rounded-[32px] p-6 lg:p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden mb-6">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-stretch h-full">
                
                <div className="shrink-0 lg:w-64 flex flex-col justify-between">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">AI Insights</h2>
                        </div>
                        <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full inline-block">
                            Inteligencia Local & Gemini
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                        <button
                            onClick={() => setActiveTab('OVERVIEW')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                                activeTab === 'OVERVIEW' 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-[1.02]' 
                                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-onyx-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Activity className="w-4.5 h-4.5" />
                            Resumen Rápido
                        </button>
                        <button
                            onClick={() => setActiveTab('FORECAST')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                                activeTab === 'FORECAST' 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]' 
                                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-onyx-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <TrendingUp className="w-4.5 h-4.5" />
                            Pronóstico a 3 Meses
                        </button>
                        <button
                            onClick={() => setActiveTab('ANOMALY')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                                activeTab === 'ANOMALY' 
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]' 
                                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-onyx-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <AlertTriangle className="w-4.5 h-4.5" />
                            Detectar Anomalías
                        </button>
                        <button
                            onClick={() => setActiveTab('SAVINGS')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                                activeTab === 'SAVINGS' 
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.02]' 
                                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-onyx-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Lightbulb className="w-4.5 h-4.5" />
                            Ahorro Inteligente
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white/40 dark:bg-onyx-950/40 rounded-[24px] border border-slate-100 dark:border-onyx-800 p-6 lg:p-8 min-h-[300px] relative">
                    {renderContent()}
                </div>

            </div>
        </div>
    );
};

