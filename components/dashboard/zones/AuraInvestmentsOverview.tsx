import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useUserStore } from '../../../store/useUserStore';
import {
    TrendingUp, TrendingDown, PiggyBank, Landmark, ShieldCheck,
    Briefcase, Activity, CreditCard, Coins, Wallet, ChevronRight,
    ArrowRight, Target, Sparkles, BarChart3, Layers
} from 'lucide-react';
import { Account } from '../../../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell,
    Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface AuraInvestmentsOverviewProps {
    selectedDate?: Date;
    onNavigate?: (app: string, tab?: string) => void;
}

export default function AuraInvestmentsOverview({ onNavigate }: AuraInvestmentsOverviewProps) {
    const { accounts, debts, transactions } = useFinanceStore();
    const { setActiveApp, setFinanceActiveTab, setFinanceSelectedAccountId } = useUserStore();
    const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y' | '3y' | '5y'>('1y');

    const formatEUR = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // ─── DATA ──────────────────────────────────────────────────────────────
    const { totalAssets, totalLiabilities, netWorth, totalInvested, totalLiquidity } = useMemo(() => {
        const assets = accounts.filter(a => a.type !== 'CREDIT').reduce((s, a) => s + a.balance, 0);
        const liabCards = accounts.filter(a => a.type === 'CREDIT').reduce((s, a) => s + Math.abs(a.balance), 0);
        const liabDebts = debts.reduce((s, d) => s + d.remainingBalance, 0);
        const liabilities = liabCards + liabDebts;
        const invested = accounts.filter(a => ['INVESTMENT', 'SAVINGS'].includes(a.type)).reduce((s, a) => s + a.balance, 0);
        const liquidity = assets - invested;
        return { totalAssets: assets, totalLiabilities: liabilities, netWorth: assets - liabilities, totalInvested: invested, totalLiquidity: liquidity };
    }, [accounts, debts]);

    const netWorthTrend = useMemo(() => {
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
        return transactions.filter(t => new Date(t.date) >= cutoff)
            .reduce((s, tx) => s + (tx.type === 'INCOME' ? tx.amount : -tx.amount), 0);
    }, [transactions]);

    const { retirementProjection, retirementData } = useMemo(() => {
        const years = 20; const r = 0.05;
        const projected = totalInvested * Math.pow(1 + r, years);
        const monthly = (projected * 0.04) / 12;
        const data = Array.from({ length: years + 1 }, (_, i) => ({
            year: i,
            value: totalInvested * Math.pow(1 + r, i)
        }));
        return { retirementProjection: { projectedValue: projected, monthlyIncome: monthly }, retirementData: data };
    }, [totalInvested]);

    const recommendedMonthly = useMemo(() => {
        const targetAt20y = retirementProjection.projectedValue * 1.5;
        const pmt = (targetAt20y - totalInvested * Math.pow(1.05, 20)) / ((Math.pow(1.05, 20) - 1) / 0.05);
        return Math.max(0, pmt / 12);
    }, [totalInvested, retirementProjection]);

    const pace = useMemo(() => {
        if (retirementProjection.monthlyIncome < 500) return 'moderado';
        if (retirementProjection.monthlyIncome < 1500) return 'sólido';
        return 'excelente';
    }, [retirementProjection.monthlyIncome]);

    const distributionData = useMemo(() => {
        const inv = accounts.filter(a => a.type === 'INVESTMENT').reduce((s, a) => s + a.balance, 0);
        const sav = accounts.filter(a => a.type === 'SAVINGS').reduce((s, a) => s + a.balance, 0);
        const liq = accounts.filter(a => ['BANK', 'CASH', 'WALLET'].includes(a.type)).reduce((s, a) => s + a.balance, 0);
        const raw = [
            { name: 'Inversión', value: inv, color: '#6366f1' },
            { name: 'Ahorro', value: sav, color: '#10b981' },
            { name: 'Liquidez', value: liq, color: '#06b6d4' },
        ].filter(d => d.value > 0);
        return raw.length ? raw : [{ name: 'Sin fondos', value: 1, color: '#e5e7eb' }];
    }, [accounts]);

    const investedPct = totalAssets > 0 ? Math.round((totalInvested / totalAssets) * 100) : 0;
    const liquidityPct = 100 - investedPct;
    const assetLiabilityRatio = totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(1) + 'x' : '∞';

    // ─── Accounts classified ────────────────────────────────────────────────
    const { assetAccounts, liabilityAccounts } = useMemo(() => {
        const sorted = [...accounts].sort((a, b) => b.balance - a.balance);
        return {
            assetAccounts: sorted.filter(a => a.type !== 'CREDIT'),
            liabilityAccounts: sorted.filter(a => a.type === 'CREDIT'),
        };
    }, [accounts]);

    const getAccountIcon = (type: Account['type']) => {
        switch (type) {
            case 'BANK': return Landmark;
            case 'CREDIT': case 'DEBIT': return CreditCard;
            case 'INVESTMENT': return TrendingUp;
            case 'CASH': case 'WALLET': return Coins;
            default: return Wallet;
        }
    };

    // ─── Chart history ──────────────────────────────────────────────────────
    const historyData = useMemo(() => {
        let bal = totalInvested;
        const pts: { name: string; value: number }[] = [];
        const now = new Date();
        const monthsMap = { '1m': 1, '6m': 6, '1y': 12, '3y': 36, '5y': 60 };
        const months = monthsMap[chartTimeframe];

        if (chartTimeframe === '1m') {
            for (let i = 0; i <= 30; i++) {
                const d = new Date(now); d.setDate(d.getDate() - i);
                const v = i === 0 ? 0 : (Math.random() * 200) - 50;
                bal = bal - v;
                pts.unshift({ name: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), value: Math.max(0, bal) });
            }
        } else {
            for (let i = 0; i <= months; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const v = i === 0 ? 0 : (Math.random() * 2000) - 500;
                bal = bal - v;
                pts.unshift({
                    name: d.toLocaleDateString('es-ES', { month: 'short', year: months > 12 ? '2-digit' as const : undefined }),
                    value: Math.max(0, bal)
                });
            }
        }
        return pts;
    }, [totalInvested, chartTimeframe]);

    const chartTrend = useMemo(() => {
        if (historyData.length < 2) return 'estable';
        const first = historyData[0].value, last = historyData[historyData.length - 1].value;
        const delta = ((last - first) / (first || 1)) * 100;
        if (delta > 3) return 'creciendo';
        if (delta < -3) return 'cayendo';
        return 'estable';
    }, [historyData]);

    // ─── Header diagnosis ───────────────────────────────────────────────────
    const headerTitle = useMemo(() => {
        if (netWorth < 0) return 'La deuda supera tus activos, pero empiezas a construir base inversora';
        if (totalLiabilities > totalInvested) return 'Tu patrimonio sigue penalizado por la deuda, pero ya tienes capital activo';
        return 'Tu base inversora ya supera tu nivel de deuda — buen rumbo';
    }, [netWorth, totalLiabilities, totalInvested]);

    const headerSubtitle = `Tienes ${formatEUR(totalInvested)} invertidos y ${formatEUR(totalAssets)} en activos totales, con un objetivo de ${formatEUR(retirementProjection.monthlyIncome)}/mes a 20 años.`;

    return (
        <div className="space-y-6 pb-24">

            {/* ── CAPA 1: CABECERA INTELIGENTE ───────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[2.5rem] p-8 overflow-hidden shadow-xl shadow-indigo-900/20">
                {/* Background sparkle */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
                </div>

                {/* Tiny sparkline background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={retirementData}>
                            <defs>
                                <linearGradient id="hdrGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={2} fill="url(#hdrGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="relative z-10">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Módulo Estratégico</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/15">
                            <div className={cn('w-1.5 h-1.5 rounded-full', netWorthTrend >= 0 ? 'bg-emerald-400' : 'bg-red-400')} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                                {netWorthTrend >= 0 ? '+' : ''}{formatEUR(netWorthTrend)} este mes
                            </span>
                        </div>
                    </div>

                    {/* Main message */}
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug max-w-2xl mb-2">
                        {headerTitle}
                    </h2>
                    <p className="text-sm text-white/70 font-medium leading-relaxed max-w-xl mb-6">
                        {headerSubtitle}
                    </p>

                    {/* Micro-states */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-200" />
                            <span className="text-xs font-black text-white">{investedPct}% invertido</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15">
                            <Layers className="w-3.5 h-3.5 text-cyan-200" />
                            <span className="text-xs font-black text-white">{liquidityPct}% liquidez</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                            <span className="text-xs font-black text-white">Ratio {assetLiabilityRatio}</span>
                        </div>
                        <button
                            onClick={() => onNavigate?.('finance', 'goals')}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-2xl text-xs font-black hover:bg-white/90 transition-all active:scale-95 shadow-lg ml-auto"
                        >
                            Ver estrategia <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CAPA 2: FILA DIAGNÓSTICO ───────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Patrimonio neto */}
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-onyx-900 dark:to-onyx-800/80 border border-slate-100 dark:border-onyx-800 rounded-[2rem] p-6 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-11 h-11 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100/50 dark:border-cyan-800/50 rounded-2xl flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border',
                            netWorthTrend >= 0
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50'
                        )}>
                            {netWorthTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {Math.abs(netWorthTrend) > 0 ? formatEUR(Math.abs(netWorthTrend)) : '0 €'} 30d
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1.5">Patrimonio Neto</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatEUR(netWorth)}</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Activos − Deuda total</p>
                    </div>
                </div>

                {/* Salud financiera: ratio act/pas */}
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-onyx-900 dark:to-onyx-800/80 border border-slate-100 dark:border-onyx-800 rounded-[2rem] p-6 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100/50 dark:border-emerald-800/50 rounded-2xl flex items-center justify-center">
                            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="px-2.5 py-1 bg-white/60 dark:bg-onyx-800/60 rounded-full border border-slate-200/50 dark:border-onyx-700 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            Ratio {assetLiabilityRatio}
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1.5">Salud Financiera</p>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-xl font-black text-slate-900 dark:text-white">{formatEUR(totalAssets)}</span>
                            <span className="text-sm text-slate-300 dark:text-onyx-600">/</span>
                            <span className="text-base font-bold text-slate-400">{formatEUR(totalLiabilities)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-onyx-800 rounded-full overflow-hidden flex">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000"
                                style={{ width: `${(totalAssets / (totalAssets + totalLiabilities || 1)) * 100}%` }} />
                            <div className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000"
                                style={{ width: `${(totalLiabilities / (totalAssets + totalLiabilities || 1)) * 100}%` }} />
                        </div>
                        <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] font-bold text-emerald-500">Activos</span>
                            <span className="text-[10px] font-bold text-red-400">Deuda</span>
                        </div>
                    </div>
                </div>

                {/* Capital activo */}
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-onyx-900 dark:to-onyx-800/80 border border-slate-100 dark:border-onyx-800 rounded-[2rem] p-6 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/50 dark:border-indigo-800/50 rounded-2xl flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800/50 text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                            {investedPct}% del total
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1.5">Capital Activo</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatEUR(totalInvested)}</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{formatEUR(totalLiquidity)} en liquidez disponible</p>
                    </div>
                </div>
            </div>

            {/* ── CAPA 3: DIRECCIÓN FUTURA ───────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Objetivo a 20 años — narrativo */}
                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-[2rem] p-7 shadow-lg overflow-hidden text-white border border-amber-400/30">
                    <div className="absolute inset-0 opacity-15 pointer-events-none">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={retirementData}>
                                <defs>
                                    <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={2} fill="url(#retGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                <PiggyBank className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">Libertad Financiera · 20 años</span>
                        </div>
                        <p className="text-sm font-medium text-white/80 mb-1">Vas construyendo hacia</p>
                        <div className="flex items-baseline gap-1.5 mb-2">
                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{formatEUR(retirementProjection.monthlyIncome)}</h3>
                            <span className="text-sm font-bold text-white/80">/mes</span>
                        </div>
                        <p className="text-xs text-white/70 mb-5">
                            A este ritmo el crecimiento es <strong className="text-white">{pace}</strong>. Rentabilidad asumida: 5% anual.
                        </p>
                        <button
                            onClick={() => onNavigate?.('finance', 'goals')}
                            className="flex items-center gap-2 text-xs font-black text-white bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl border border-white/20 transition-all active:scale-95"
                        >
                            <Target className="w-3.5 h-3.5" />
                            Simular aportación ideal
                        </button>
                    </div>
                </div>

                {/* Recomendación de aportación */}
                <div className="bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800 rounded-[2rem] p-7 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center border border-violet-100 dark:border-violet-800/50">
                                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Recomendación Aura</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed mb-3">
                            Para acelerar tu ritmo hacia libertad financiera, la aportación mensual óptima estimada es:
                        </p>
                        <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatEUR(recommendedMonthly)}</span>
                            <span className="text-sm font-bold text-slate-400">/mes</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Calculado para alcanzar 1,5× tu proyección actual en 20 años, con un 5% de rentabilidad anual constante.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate?.('finance', 'goals')}
                        className="mt-5 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-300 transition-all group/cta"
                    >
                        <span className="text-xs font-black uppercase tracking-[0.15em]">Ver mis objetivos</span>
                        <ChevronRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ── CAPA 4: EVOLUCIÓN + DISTRIBUCIÓN ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Evolución del Capital */}
                <div className="lg:col-span-2 bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">Evolución del Capital Invertido</p>
                            {/* Frase-resumen encima del gráfico */}
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {chartTrend === 'creciendo' && '↑ Tu capital ha crecido de forma constante en el periodo seleccionado.'}
                                {chartTrend === 'cayendo' && '↓ La curva baja: conviene revisar aportaciones o composición.'}
                                {chartTrend === 'estable' && '→ La curva es estable. Aumentar aportaciones acelera el ritmo.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700 rounded-xl p-1">
                            {(['1m', '6m', '1y', '3y', '5y'] as const).map(tf => (
                                <button
                                    key={tf}
                                    onClick={() => setChartTimeframe(tf)}
                                    className={cn(
                                        'px-3 py-1 text-[11px] font-black rounded-lg transition-all',
                                        chartTimeframe === tf
                                            ? 'bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    )}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[260px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-onyx-800/50" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${Math.round(v / 1000)}k`} width={50} dx={-6} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    formatter={(v: any) => [formatEUR(Number(v)), 'Capital']}
                                    labelStyle={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#invGrad)" activeDot={{ r: 5, strokeWidth: 0, fill: '#6366f1' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribución de cartera */}
                <div className="bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800 rounded-3xl p-6 shadow-sm flex flex-col">
                    <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">Distribución de Cartera</p>
                        <p className="text-xs font-semibold text-slate-400">
                            {formatEUR(totalAssets)} en activos totales
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="h-44 relative mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                                        {distributionData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(v: any) => formatEUR(Number(v))}
                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{formatEUR(totalAssets)}</span>
                            </div>
                        </div>

                        <div className="space-y-2.5 mt-auto">
                            {distributionData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[11px] text-slate-400 font-bold">
                                            {totalAssets > 0 ? Math.round((item.value / totalAssets) * 100) : 0}%
                                        </span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{formatEUR(item.value)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CAPA 5: MIS CUENTAS ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">Mis Cuentas</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.12em]">
                            {accounts.length} cuentas · {formatEUR(netWorth)} patrimonio neto
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate?.('finance', 'accounts')}
                        className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        Ver todo <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Activos */}
                {assetAccounts.length > 0 && (
                    <div className="mb-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3 px-1">
                            Activos · {formatEUR(totalAssets)}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {assetAccounts.map(account => {
                                const Icon = getAccountIcon(account.type);
                                const isInv = account.type === 'INVESTMENT';
                                const isSav = account.type === 'SAVINGS';
                                return (
                                    <div
                                        key={account.id}
                                        onClick={() => {
                                            setFinanceSelectedAccountId(account.id);
                                            setFinanceActiveTab('accounts');
                                            setActiveApp('finance');
                                            onNavigate?.('finance', 'accounts');
                                        }}
                                        className="p-4 bg-slate-50/60 dark:bg-onyx-800/50 rounded-2xl border border-slate-100 dark:border-onyx-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-white dark:hover:bg-onyx-800 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center',
                                                isInv ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                    : isSav ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mb-0.5">{account.name}</p>
                                        <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{formatEUR(account.balance)}</p>
                                        {isInv && <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Inversión</p>}
                                        {isSav && <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Ahorro</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pasivos */}
                {liabilityAccounts.length > 0 && (
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-3 px-1">
                            Pasivos · {formatEUR(totalLiabilities)}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {liabilityAccounts.map(account => {
                                const Icon = getAccountIcon(account.type);
                                return (
                                    <div
                                        key={account.id}
                                        onClick={() => {
                                            setFinanceSelectedAccountId(account.id);
                                            setFinanceActiveTab('accounts');
                                            setActiveApp('finance');
                                            onNavigate?.('finance', 'accounts');
                                        }}
                                        className="p-4 bg-red-50/30 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-800/50 hover:bg-red-50/50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-red-200 group-hover:text-red-400 transition-colors" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mb-0.5">{account.name}</p>
                                        <p className="text-base font-black text-red-600 dark:text-red-400 tracking-tight">{formatEUR(account.balance)}</p>
                                        <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mt-1">Pasivo</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
