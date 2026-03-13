import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useUserStore } from '../../../store/useUserStore';
import {
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Landmark,
    ShieldCheck,
    Briefcase,
    Activity,
    LineChart,
    PieChart as PieChartIcon,
    ChevronDown,
    Wallet,
    CreditCard,
    Coins,
    ChevronRight
} from 'lucide-react';
import { Account } from '../../../types';
import AccountsSummaryWidget from '../../features/finance/dashboard/widgets/AccountsSummaryWidget';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AuraInvestmentsOverviewProps {
    selectedDate?: Date;
    onNavigate?: (app: string, tab?: string) => void;
}

export default function AuraInvestmentsOverview({ selectedDate: selectedDateProp, onNavigate }: AuraInvestmentsOverviewProps) {
    const { accounts, debts, transactions } = useFinanceStore();
    const { setActiveApp, setFinanceActiveTab, setFinanceSelectedAccountId } = useUserStore();
    
    const [selectedDate] = useState(() => selectedDateProp ?? new Date());
    const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y' | '3y' | '5y'>('1y');

    const formatEUR = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // ==========================================
    // DATA PREPARATION
    // ==========================================
    
    const {
        totalAssets,
        totalLiabilities,
        netWorth,
        totalInvested
    } = useMemo(() => {
        const assets = accounts.filter(a => a.type !== 'CREDIT').reduce((acc, curr) => acc + curr.balance, 0);
        const liabilitiesCards = accounts.filter(a => a.type === 'CREDIT').reduce((acc, curr) => acc + Math.abs(curr.balance), 0);
        const liabilitiesDebts = debts.reduce((acc, d) => acc + d.remainingBalance, 0);
        const liabilities = liabilitiesCards + liabilitiesDebts;
        
        const invested = accounts.filter(a => a.type === 'INVESTMENT' || a.type === 'SAVINGS').reduce((acc, curr) => acc + curr.balance, 0);
        
        return {
            totalAssets: assets,
            totalLiabilities: liabilities,
            netWorth: assets - liabilities,
            totalInvested: invested
        };
    }, [accounts, debts]);

    const netWorthTrend = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentTxs = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
        const netFlow = recentTxs.reduce((acc, tx) => acc + (tx.type === 'INCOME' ? tx.amount : -tx.amount), 0);
        return netFlow;
    }, [transactions]);
    
    const { retirementProjection, retirementData } = useMemo(() => {
        const yearsToRetirement = 20; 
        const assumedReturn = 0.05;
        const projectedValue = totalInvested * Math.pow(1 + assumedReturn, yearsToRetirement);
        const monthlyIncome = (projectedValue * 0.04) / 12;

        const data = [];
        for(let i=0; i<=yearsToRetirement; i++) {
            data.push({
                year: i,
                value: totalInvested * Math.pow(1 + assumedReturn, i)
            });
        }
        
        return {
            retirementProjection: { projectedValue, monthlyIncome },
            retirementData: data
        };
    }, [totalInvested]);

    const distributionData = useMemo(() => {
        const inv = accounts.filter(a => a.type === 'INVESTMENT').reduce((acc, a) => acc + a.balance, 0);
        const sav = accounts.filter(a => a.type === 'SAVINGS').reduce((acc, a) => acc + a.balance, 0);
        const liq = accounts.filter(a => ['BANK', 'CASH', 'WALLET'].includes(a.type)).reduce((acc, a) => acc + a.balance, 0);
        
        const rawData = [
            { name: 'Inversión', value: inv, color: '#6366f1' }, // indigo-500
            { name: 'Ahorro', value: sav, color: '#10b981' }, // emerald-500
            { name: 'Liquidez', value: liq, color: '#06b6d4' }, // cyan-500
        ].filter(d => d.value > 0);

        if (rawData.length === 0) {
            // Un valor por defecto si no hay fondos para que el gráfico no falle
            return [{ name: 'Sin fondos', value: 1, color: '#e5e7eb' }];
        }
        return rawData;
    }, [accounts]);

    const getAccountIcon = (type: Account['type']) => {
        switch (type) {
            case 'BANK': return Landmark;
            case 'CREDIT':
            case 'DEBIT': return CreditCard;
            case 'INVESTMENT': return TrendingUp;
            case 'CASH':
            case 'WALLET': return Coins;
            default: return Wallet;
        }
    };

    const getAccountColor = (type: Account['type']) => {
        switch (type) {
            case 'BANK': return 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'CREDIT': return 'bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            case 'INVESTMENT': return 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            default: return 'bg-onyx-100/50 dark:bg-onyx-800 text-onyx-600 dark:text-onyx-400';
        }
    };

    const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => b.balance - a.balance), [accounts]);

    // ==========================================
    // HISTORICAL INVESTMENT DATA (MOCKED FOR VISUAL)
    // ==========================================
    const historyData = useMemo(() => {
        let currentBal = totalInvested;
        const dataPoints = [];
        const now = new Date();

        let monthsBack = 12;
        if (chartTimeframe === '1m') monthsBack = 1;
        if (chartTimeframe === '6m') monthsBack = 6;
        if (chartTimeframe === '1y') monthsBack = 12;
        if (chartTimeframe === '3y') monthsBack = 36;
        if (chartTimeframe === '5y') monthsBack = 60;

        if (chartTimeframe === '1m') {
            for (let i = 0; i <= 30; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                let variation = (Math.random() * 200) - 50; 
                if (i === 0) variation = 0;
                currentBal = currentBal - variation;
                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    value: Math.max(0, currentBal)
                });
            }
        } else {
            for (let i = 0; i <= monthsBack; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                let variation = (Math.random() * 2000) - 500;
                if (i === 0) variation = 0;
                currentBal = currentBal - variation;
                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { month: 'short', year: monthsBack > 12 ? '2-digit' : undefined }),
                    value: Math.max(0, currentBal)
                });
            }
        }
        return dataPoints;
    }, [totalInvested, chartTimeframe]);

    return (
        <div className="space-y-6 pb-24">
            {/* TOP METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Patrimonio Neto */}
                <div className="bg-gradient-to-br from-white to-onyx-50 dark:from-onyx-900 dark:to-onyx-800/80 border border-onyx-100 dark:border-onyx-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 dark:bg-cyan-400/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-cyan-100/50 dark:bg-cyan-900/40 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-cyan-100/20">
                            <Landmark className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md border",
                            netWorthTrend >= 0
                                ? "bg-emerald-50/80 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50"
                                : "bg-red-50/80 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50"
                        )}>
                            {netWorthTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span>{Math.abs(netWorthTrend) > 0 ? formatEUR(Math.abs(netWorthTrend)) : '0 €'} (30d)</span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-widest mb-1.5">
                            Patrimonio Neto
                        </p>
                        <h3 className="text-3xl font-black text-onyx-900 dark:text-white tracking-tight">
                            {formatEUR(netWorth)}
                        </h3>
                    </div>
                </div>

                {/* Activos vs Pasivos */}
                <div className="bg-gradient-to-br from-white to-onyx-50 dark:from-onyx-900 dark:to-onyx-800/80 border border-onyx-100 dark:border-onyx-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 dark:bg-emerald-400/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-emerald-100/50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-emerald-100/20">
                            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-widest mb-1">Ratio Act/Pas</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                {totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(1) + 'x' : '∞'}
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-widest mb-2">
                            Distribución Balance
                        </p>
                        <div className="flex items-end gap-2 mb-2.5">
                            <h3 className="text-xl font-bold text-onyx-900 dark:text-white leading-none">
                                {formatEUR(totalAssets)}
                            </h3>
                            <span className="text-sm font-bold text-onyx-300 dark:text-onyx-600 mb-0.5">/</span>
                            <span className="text-sm font-bold text-onyx-400 dark:text-onyx-500 mb-0.5">
                                {formatEUR(totalLiabilities)}
                            </span>
                        </div>
                        
                        {/* Visual Ratio Bar Enhanced */}
                        {totalAssets > 0 || totalLiabilities > 0 ? (
                            <div className="h-2 w-full bg-onyx-100 dark:bg-onyx-800 rounded-full overflow-hidden flex shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out" 
                                    style={{ width: `${(totalAssets / (totalAssets + totalLiabilities)) * 100}%` }}
                                />
                                <div 
                                    className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000 ease-out" 
                                    style={{ width: `${(totalLiabilities / (totalAssets + totalLiabilities)) * 100}%` }}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Total Invertido */}
                <div className="bg-gradient-to-br from-white to-onyx-50 dark:from-onyx-900 dark:to-onyx-800/80 border border-onyx-100 dark:border-onyx-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 dark:bg-indigo-400/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-indigo-100/50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-indigo-100/20">
                            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="px-3 py-1.5 bg-white/50 dark:bg-onyx-800/50 rounded-full border border-onyx-200/50 dark:border-onyx-700/50 shadow-sm backdrop-blur-md">
                            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                                {totalAssets > 0 ? Math.round((totalInvested / totalAssets) * 100) : 0}% Liquidez Invertida
                            </span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-widest mb-1.5">
                            Capital Activo
                        </p>
                        <h3 className="text-3xl font-black text-onyx-900 dark:text-white tracking-tight">
                            {formatEUR(totalInvested)}
                        </h3>
                    </div>
                </div>

                {/* Proyección Jubilación */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-[2rem] p-6 shadow-md flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden text-white border border-amber-400/30">
                    <div className="absolute inset-0 z-0 opacity-20 transition-opacity duration-700 group-hover:opacity-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={retirementData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRetirement" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorRetirement)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                            <PiggyBank className="w-6 h-6 text-white" />
                        </div>
                        <div className="px-3 py-1.5 bg-black/20 rounded-full backdrop-blur-md border border-white/10">
                             <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
                                Objetivo a 20 años
                            </span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-1">
                            Libertad Financiera
                        </p>
                        <div className="flex items-baseline gap-1.5">
                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                                {formatEUR(retirementProjection.monthlyIncome)}
                            </h3>
                            <span className="text-sm font-bold text-white/80">
                                /mes
                            </span>
                        </div>
                        <p className="text-[11px] font-medium text-white/70 mt-1">
                            A un 5% de rentabilidad anual
                        </p>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolución Temporal - 2 columnas */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="bg-white dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h3 className="text-sm font-bold text-onyx-900 dark:text-white flex items-center gap-2">
                                <LineChart className="w-4 h-4 text-indigo-500" />
                                Evolución del Capital Invertido
                            </h3>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="bg-onyx-50 dark:bg-onyx-800 border border-onyx-100 dark:border-onyx-700 rounded-lg p-1 flex">
                                    {(['1m', '6m', '1y', '3y', '5y'] as const).map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setChartTimeframe(tf)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                                                chartTimeframe === tf
                                                    ? "bg-white dark:bg-onyx-600 text-onyx-900 dark:text-white shadow-sm"
                                                    : "text-onyx-400 hover:text-onyx-600 dark:hover:text-onyx-300"
                                            )}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="h-[280px] w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInvestments" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-onyx-100 dark:text-onyx-800/50" />
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
                                        formatter={(value: any) => [formatEUR(Number(value) || 0), 'Capital']}
                                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorInvestments)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: "#6366f1" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Distribución */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Portfolio Distribution Chart */}
                    <div className="bg-white dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 rounded-3xl p-6 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-onyx-900 dark:text-white">Distribución de Cartera</h3>
                                <p className="text-[10px] font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-widest">Asignación de activos</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="h-48 w-full relative mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            formatter={(value: any) => formatEUR(Number(value))}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xs font-bold text-onyx-400 uppercase tracking-widest">Total</span>
                                    <span className="text-sm font-black text-onyx-900 dark:text-white">
                                        {formatEUR(totalAssets)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mt-auto">
                                {distributionData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-bold text-onyx-700 dark:text-onyx-300">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-onyx-500 font-medium">
                                                {totalAssets > 0 ? Math.round((item.value / totalAssets) * 100) : 0}%
                                            </span>
                                            <span className="font-bold text-onyx-900 dark:text-white">
                                                {formatEUR(item.value)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HORIZONTAL ACCOUNTS SECTION */}
            <div className="bg-white dark:bg-onyx-900 border border-onyx-100 dark:border-onyx-800 rounded-3xl p-6 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-onyx-900 dark:text-white">Mis Cuentas</h3>
                            <p className="text-[10px] text-onyx-400 dark:text-onyx-500 font-bold uppercase tracking-widest">
                                {accounts.length} Cuentas Activas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sortedAccounts.map(account => {
                        const Icon = getAccountIcon(account.type);
                        const colorClass = getAccountColor(account.type);
                        return (
                            <div                                    onClick={() => {
                                        setFinanceSelectedAccountId(account.id);
                                        setFinanceActiveTab('accounts');
                                        setActiveApp('finance');
                                        onNavigate?.('finance', 'accounts');
                                    }}
                                className="p-4 bg-onyx-50/50 dark:bg-onyx-800/50 rounded-2xl border border-onyx-100 dark:border-onyx-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer group hover:bg-white dark:hover:bg-onyx-800"
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-onyx-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-onyx-900 dark:text-white truncate" title={account.name}>{account.name}</p>
                                        <p className="text-lg font-black text-onyx-900 dark:text-white tracking-tight mt-0.5">
                                            {formatEUR(account.balance)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
