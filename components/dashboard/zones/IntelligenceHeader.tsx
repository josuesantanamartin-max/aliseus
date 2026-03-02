import React, { useMemo, useState, useEffect } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useLifeStore } from '../../../store/useLifeStore';
import { computeAuraScoreMetrics } from '../../../utils/auraScore';
import { Sun, Moon, Cloud, ChevronRight, Activity, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function IntelligenceHeader() {
    const { userProfile } = useUserStore();
    const { budgets, debts, goals: savingsGoals, transactions } = useFinanceStore();

    // Compute monthly income and expenses from transactions directly
    const { monthlyIncome, monthlyExpenses } = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthTxs = transactions.filter(t => new Date(t.date) >= startOfMonth);

        const income = currentMonthTxs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const expenses = currentMonthTxs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

        return { monthlyIncome: income, monthlyExpenses: expenses };
    }, [transactions]);
    const { familyMembers } = useLifeStore();

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Time of day greeting
    const hour = currentTime.getHours();
    let greeting = 'Buenos días';
    let TimeIcon = Sun;
    let timeColor = 'text-amber-500';

    if (hour >= 12 && hour < 20) {
        greeting = 'Buenas tardes';
        TimeIcon = Cloud;
        timeColor = 'text-sky-500';
    } else if (hour >= 20 || hour < 6) {
        greeting = 'Buenas noches';
        TimeIcon = Moon;
        timeColor = 'text-indigo-400';
    }

    // AURA Score Logic
    const auraMetrics = useMemo(() => {
        return computeAuraScoreMetrics(
            monthlyIncome,
            monthlyExpenses,
            budgets,
            debts,
            savingsGoals,
            transactions
        );
    }, [monthlyIncome, monthlyExpenses, budgets, debts, savingsGoals, transactions]);

    const { score } = auraMetrics;

    // Dynamic AI Insight Based on actual metrics
    const aiInsight = useMemo(() => {
        const { score, budgetAdherence, savingsRate, emergencyFund } = auraMetrics;

        if (score >= 80) {
            return `¡Excelente salud financiera! Tu tasa de ahorro del ${Math.round(savingsRate)}% es robusta y estás respetando tus presupuestos.`;
        }

        if (budgetAdherence > 100) {
            return `Atención: Has superado tu presupuesto total en un ${Math.round(budgetAdherence - 100)}%. Intenta reducir gastos no esenciales esta semana.`;
        }

        if (savingsRate < 10 && monthlyIncome > 0) {
            return `Tu tasa de ahorro mensual (${Math.round(savingsRate)}%) está por debajo del objetivo. Revisa tus gastos fijos para liberar flujo de caja.`;
        }

        if (emergencyFund < 50) {
            return `Buen progreso, pero tu fondo de emergencia está al ${Math.round(emergencyFund)}%. Prioriza este colchón antes de nuevas inversiones.`;
        }

        return "Tus finanzas están estables. Mantén el ritmo de ahorro para alcanzar tus próximas metas de vida.";
    }, [auraMetrics, monthlyIncome]);

    // Next critical payment logic
    const criticalPayment = useMemo(() => {
        const today = new Date();
        const upcoming = debts
            .filter(d => d.dueDate)
            .map(d => {
                const parts = d.dueDate!.split('-');
                let dateStr = d.dueDate!;
                if (parts.length === 3) { // YYYY-MM-DD
                    dateStr = d.dueDate!;
                } else if (parts.length === 2) { // DD-MM or MM-DD depending on system, assuming YYYY-MM
                    dateStr = `${today.getFullYear()}-${parts[1]}-${parts[0]}`; // Attempt fallback
                }

                const dDate = new Date(dateStr);
                // Force to current month/year if it's a recurring monthly day
                if (parts.length === 1) { // Just a day number
                    dDate.setMonth(today.getMonth());
                    dDate.setFullYear(today.getFullYear());
                    dDate.setDate(Number(parts[0]));
                    if (dDate < today) dDate.setMonth(dDate.getMonth() + 1);
                }

                const diffTime = dDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { ...d, daysUntil: diffDays };
            })
            .filter(d => d.daysUntil >= 0)
            .sort((a, b) => a.daysUntil - b.daysUntil)[0];

        return upcoming;
    }, [debts]);


    return (
        <section className="w-full flex flex-col gap-6 md:flex-row md:items-end justify-between bg-white dark:bg-onyx-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-onyx-800/50 shadow-2xl relative overflow-hidden group">

            {/* Subtle Gradient Background Effect based on AURA Score */}
            <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none transition-colors duration-1000"
                style={{
                    background: `linear-gradient(135deg, transparent 0%, ${score > 80 ? '#6366f1' : score > 50 ? '#8b5cf6' : '#ec4899'
                        } 100%)`
                }}
            />

            {/* Left Column: Greeting & AI Insight */}
            <div className="flex flex-col gap-2 z-10 max-w-2xl">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">
                    <TimeIcon className={cn("w-4 h-4", timeColor)} />
                    <span>{greeting}, {userProfile?.full_name?.split(' ')[0] || 'Usuario'}</span>
                    <span className="opacity-50">•</span>
                    <span>{currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Zap className="w-6 h-6 text-indigo-500" />
                    </div>
                    <span>Aura Insight</span>
                </h1>

                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mt-1">
                    "{aiInsight}"
                </p>

                {criticalPayment && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className={cn(
                            "px-2.5 py-1 rounded-full font-medium border",
                            criticalPayment.daysUntil <= 3
                                ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                                : criticalPayment.daysUntil <= 7
                                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                                    : "bg-slate-100 dark:bg-onyx-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-onyx-600"
                        )}>
                            {criticalPayment.daysUntil === 0 ? 'Hoy' : `En ${criticalPayment.daysUntil} días`}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                            Próximo cargo: <strong>{criticalPayment.name}</strong>
                        </span>
                    </div>
                )}
            </div>

            {/* Right Column: AURA Score & Family */}
            <div className="flex flex-col md:items-end gap-6 z-10 shrink-0">

                {/* AURA Score Display */}
                <div className="flex flex-col md:items-end group relative">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1">
                        Aura Score
                    </span>
                    <div className="flex items-baseline gap-2 cursor-help">
                        <span className={cn(
                            "text-6xl font-black tabular-nums tracking-tighter",
                            score > 80 ? "text-emerald-500" : score > 50 ? "text-amber-500" : "text-red-500"
                        )}>
                            {score}
                        </span>
                        <span className="text-xl font-medium text-slate-400">/ 100</span>
                    </div>

                    {/* Score Breakdown Tooltip */}
                    <div className="absolute top-0 right-full mr-6 w-72 bg-white dark:bg-onyx-900 rounded-xl border border-slate-200 dark:border-onyx-700 shadow-2xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 pointer-events-none z-50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Análisis de Nivel</h4>
                        <div className="flex flex-col gap-3 relative">
                            {[
                                { label: 'Ahorro', val: `${Math.round(auraMetrics.savingsRate)}%`, color: auraMetrics.savingsRate >= 20 ? 'text-emerald-500' : 'text-amber-500', icon: '🎯' },
                                { label: 'Presupuesto', val: `${Math.round(auraMetrics.budgetAdherence)}%`, color: auraMetrics.budgetAdherence <= 100 ? 'text-emerald-500' : 'text-rose-500', icon: '📊' },
                                { label: 'Deuda', val: `${Math.round(auraMetrics.debtCoverage)}%`, color: auraMetrics.debtCoverage < 15 ? 'text-emerald-500' : 'text-amber-500', icon: '⚖️' },
                                { label: 'Fondo Emerg.', val: `${Math.round(auraMetrics.emergencyFund)}%`, color: auraMetrics.emergencyFund > 50 ? 'text-emerald-500' : 'text-slate-400', icon: '🛡️' }
                            ].map((m, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                                        <span>{m.icon}</span>
                                        <span>{m.label}</span>
                                    </div>
                                    <span className={cn("font-bold", m.color)}>{m.val}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-onyx-800 text-[10px] text-slate-500 dark:text-slate-400 leading-tight italic">
                            * El score se basa en tu salud financiera este mes. Un score alto significa mayor libertad futura.
                        </div>
                    </div>
                </div>

                {/* Family Members Status */}
                {familyMembers.length > 0 && (
                    <div className="flex items-center gap-[-8px] flex-row-reverse border border-slate-100 dark:border-onyx-700 p-1 rounded-full bg-slate-50/50 dark:bg-onyx-900/50">
                        {familyMembers.slice(0, 4).map((member, i) => (
                            <div key={member.id} className="relative group cursor-pointer hover:z-10 transition-transform hover:scale-110">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-brand-100 text-brand-700 border-2 border-white dark:border-onyx-800 shadow-sm",
                                    // Z-index trick for overlapping from right to left natively
                                    `z-[${10 - i}]`
                                )}>
                                    {member.name.charAt(0)}
                                </div>
                                {/* Status dot - Mocked Logic for now, could integrate with specific member expenses */}
                                <div className={cn(
                                    "absolute bottom-0 right-0 w-3h-3 rounded-full border-2 border-white dark:border-onyx-900 shadow-sm",
                                    i === 0 ? "bg-emerald-500" : i === 1 ? "bg-amber-500" : "bg-emerald-500"
                                )} />

                                {/* Hover Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-onyx-900 dark:bg-white text-white dark:text-onyx-900 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                                    {member.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </section>
    );
}
