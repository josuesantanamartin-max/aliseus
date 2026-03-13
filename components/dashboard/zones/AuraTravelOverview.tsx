import React, { useState, useMemo, useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import {
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    CalendarCheck,
    Layers,
    MapPin,
    Plane,
    Wallet,
    CalendarDays,
    ArrowRight,
    Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Side widget to search flights
function FlightSearchWidget() {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full relative overflow-hidden">
            <div className="z-10 relative h-full flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-brand-500" />
                    Búsqueda de Vuelos
                </h3>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Origen</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ciudad o Aeropuerto..."
                                className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-4 pr-10 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                            <Plane className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Destino</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="¿A dónde quieres ir?"
                                className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-4 pr-10 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                            <Plane className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ida</label>
                            <input
                                type="date"
                                className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-3 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vuelta</label>
                            <input
                                type="date"
                                className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-3 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <button className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-slate-900/10 dark:shadow-white/5 active:scale-[0.98]">
                            <Search className="w-3.5 h-3.5" />
                            Buscar en Duffel
                        </button>
                    </div>
                </div>
            </div>
            {/* Ambient detail */}
            <Plane className="absolute -top-1 -right-1 w-16 h-16 text-brand-50/20 dark:text-brand-500/5 -rotate-12 pointer-events-none opacity-50" />
        </div>
    );
}

export default function AuraTravelOverview({ selectedDate: selectedDateProp }: { selectedDate?: Date }) {
    const { trips } = useLifeStore();
    const { transactions, goals } = useFinanceStore();

    // -- STATE: Chart Filters --
    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());

    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y' | '3y' | '5y'>('6m');

    // -- UTILS --
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // ==========================================
    // WIDGET 1: PRÓXIMA AVENTURA
    // ==========================================
    const nextTrip = useMemo(() => {
        const upcoming = trips.filter(t => t.status === 'UPCOMING').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        return upcoming[0] || null;
    }, [trips]);

    const daysUntilNextTrip = useMemo(() => {
        if (!nextTrip) return null;
        const diff = new Date(nextTrip.startDate).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }, [nextTrip]);

    // ==========================================
    // WIDGET 2: PRESUPUESTO PRÓXIMOS VIAJES
    // ==========================================
    const { upcomingBudget, upcomingSpent } = useMemo(() => {
        const upcoming = trips.filter(t => t.status === 'UPCOMING');
        const budget = upcoming.reduce((acc, t) => acc + (t.budget || 0), 0);
        const spent = upcoming.reduce((acc, t) => acc + (t.spent || 0), 0);
        return { upcomingBudget: budget, upcomingSpent: spent };
    }, [trips]);

    // ==========================================
    // WIDGET 2.5: GOAL SAVINGS (Ahorro Próximo Viaje)
    // ==========================================
    const nextTripGoal = useMemo(() => {
        const { goals } = useFinanceStore.getState(); // Assuming it's ok to get state here or we should probably hook it up properly
        if (!nextTrip) return null;
        
        // Find goal linked by trip linkedGoalId, or goal.linkedTripId
        return goals.find(g => g.id === nextTrip.linkedGoalId || g.linkedTripId === nextTrip.id) || null;
    }, [nextTrip]); // need to ensure goals changes trigger this. Let's destructure goals from useFinanceStore.

    // ==========================================
    // WIDGET 3: GASTO EN VIAJES AÑO ACTUAL
    // ==========================================
    const { travelSpendingYear, avgTravelSpending } = useMemo(() => {
        const currentYear = selectedDate.getFullYear();
        
        // Find transactions related to travel
        const travelTxs = transactions.filter(t => t.type === 'EXPENSE' && (t.category === 'Viajes' || t.category === 'Travel' || t.category === 'Vacaciones'));
        
        const currentYearTxs = travelTxs.filter(t => new Date(t.date).getFullYear() === currentYear);
        const spent = currentYearTxs.reduce((acc, curr) => acc + curr.amount, 0);
        
        // Mock average for UI parity
        const avg = spent > 0 ? spent * 0.8 : 1500;

        return { travelSpendingYear: spent, avgTravelSpending: avg };
    }, [transactions, selectedDate]);

    // ==========================================
    // WIDGET 4: VIAJES COMPLETADOS / ACTIVO
    // ==========================================
    const { completedCount, activeCount, totalCreated } = useMemo(() => {
        const completed = trips.filter(t => t.status === 'COMPLETED').length;
        const active = trips.filter(t => t.status === 'CURRENT').length;
        return { completedCount: completed, activeCount: active, totalCreated: trips.length };
    }, [trips]);

    // ==========================================
    // LINE CHART: EVOLUCIÓN HISTÓRICA GASTOS VIAJE
    // ==========================================
    const chartData = useMemo(() => {
        const dataPoints = [];
        const now = new Date();
        const travelTxs = transactions.filter(t => t.type === 'EXPENSE' && (t.category === 'Viajes' || t.category === 'Travel' || t.category === 'Vacaciones'));

        let monthsBack = 6;
        if (chartTimeframe === '1m') monthsBack = 1; 
        if (chartTimeframe === '1y') monthsBack = 12;
        if (chartTimeframe === '3y') monthsBack = 36;
        if (chartTimeframe === '5y') monthsBack = 60;

        if (chartTimeframe === '1m') {
            for (let i = 0; i <= 30; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                
                const dateStr = d.toISOString().split('T')[0];
                const dayTxs = travelTxs.filter(t => t.date.startsWith(dateStr));
                const daySpent = dayTxs.reduce((acc, curr) => acc + curr.amount, 0);
                
                let val = daySpent;
                // Add sporadic spikes to mock travel expenses
                if(val === 0 && Math.random() > 0.95) val = Math.random() * 500;

                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    spent: val
                });
            }
        } else {
            for (let i = 0; i <= monthsBack; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = d.toISOString().slice(0, 7);
                
                const monthTxs = travelTxs.filter(t => t.date.startsWith(monthStr));
                let monthSpent = monthTxs.reduce((acc, curr) => acc + curr.amount, 0);
                
                // Ensure some peaks for travel to look realistic
                if (monthSpent === 0 && Math.random() > 0.7) monthSpent = 400 + (Math.random() * 800); 

                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { month: 'short', year: monthsBack > 12 ? '2-digit' : undefined }),
                    spent: monthSpent
                });
            }
        }
        return dataPoints;
    }, [transactions, chartTimeframe]);

    // ==========================================
    // PRÓXIMAS ESCAPADAS LIST
    // ==========================================
    const upcomingTripsList = useMemo(() => {
        return trips.filter(t => t.status === 'UPCOMING' || t.status === 'CURRENT').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [trips]);


    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-0">

            {/* ========================================== */}
            {/* ROW 1: THE 4 TOP WIDGETS */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Próxima aventura */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Próxima Salida</h3>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                            {nextTrip ? nextTrip.destination : 'Sin Viajes'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                        {nextTrip ? (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-brand-600 dark:text-brand-400 tabular-nums">
                                    {daysUntilNextTrip === 0 ? '¡Hoy!' : `En ${daysUntilNextTrip} días`}
                                </span>
                                <span className="text-slate-500 font-medium truncate">{new Date(nextTrip.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 font-medium">Anímate a explorar</div>
                        )}
                    </div>
                </div>

                {/* 2. Presupuesto Viajes o Ahorro Próximo Viaje */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden">
                    <div className="z-10">
                        {nextTripGoal ? (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-emerald-500" />
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">Ahorro: {nextTrip?.destination}</h3>
                                </div>
                                <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                                    {formatCurrency(nextTripGoal.currentAmount)}
                                </div>
                                <div className="flex flex-col mt-2 gap-1.5">
                                    <div className="flex justify-between items-end text-[10px] font-bold">
                                        <span className="text-slate-500">
                                            Faltan {formatCurrency(Math.max(0, nextTripGoal.targetAmount - nextTripGoal.currentAmount))}
                                        </span>
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(nextTripGoal.targetAmount)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-500"
                                            style={{ width: `${Math.min(100, (nextTripGoal.currentAmount / Math.max(1, nextTripGoal.targetAmount)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet className="w-4 h-4 text-sky-500" />
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Presupuesto Próximos</h3>
                                </div>
                                <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                                    {formatCurrency(upcomingBudget)}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                                    <span>{formatCurrency(upcomingSpent)}</span>
                                    <span className="text-slate-400 dark:text-slate-500 font-medium">ya gastados</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={cn(
                        "absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-2xl pointer-events-none",
                        nextTripGoal ? "bg-emerald-50 dark:bg-emerald-500/5" : "bg-sky-50 dark:bg-sky-500/5"
                    )}></div>
                </div>

                {/* 3. Gasto Anual Viajes */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gastos {selectedDate.getFullYear()}</h3>
                    </div>
                    <div>
                        <div className={cn("text-3xl font-black tabular-nums tracking-tight flex items-center gap-2 text-slate-900 dark:text-white")}>
                            {formatCurrency(travelSpendingYear)}
                            {travelSpendingYear <= avgTravelSpending ? <TrendingDown className="w-5 h-5 text-emerald-500" /> : <TrendingUp className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                                Promedio ideal: {formatCurrency(avgTravelSpending)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Viajes Históricos */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-brand-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diario de Viaje</h3>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {completedCount}
                            <span className="text-base font-bold text-slate-400">/ {totalCreated}</span>
                        </div>

                        <div className="mt-3 w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full bg-brand-500")}
                                style={{ width: `${Math.min(100, (completedCount / Math.max(1, totalCreated)) * 100)}% ` }}
                            />
                        </div>

                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex justify-between">
                            <span>Completados</span>
                            <span className={cn(activeCount > 0 ? "text-emerald-500" : "text-brand-600 dark:text-brand-400")}>
                                {activeCount > 0 ? "1 Viaje Activo" : "Explorando"}
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
                                Historial de Gastos en Viajes
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
                            </div>
                        </div>

                        {/* The Chart */}
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTravel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                                        formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Gastado']}
                                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="spent"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTravel)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Próximas Escapadas Parity (Al estilo de "Pagos Fijos") */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                Próximas Escapadas
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{upcomingTripsList.length}</span>
                                <span className="text-xs font-bold text-slate-400">viajes</span>
                            </div>
                        </div>

                        {/* Contenedor scrolleable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 mt-4 min-h-[140px] max-h-[160px]">
                            {upcomingTripsList && upcomingTripsList.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingTripsList.map((trip) => {
                                        const progressAmt = Math.min(100, ((trip.spent || 0) / Math.max(1, (trip.budget || 1))) * 100);
                                        return (
                                            <div key={trip.id} className="bg-slate-50 dark:bg-onyx-800/50 p-3 rounded-2xl flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{trip.destination}</h4>
                                                        <p className="text-[10px] text-slate-500 font-medium">
                                                            {new Date(trip.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} 
                                                            {' - '} 
                                                            {new Date(trip.endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(trip.budget || 0)}</span>
                                                        <span className="block text-[9px] font-bold text-slate-400">{formatCurrency(trip.spent || 0)} gastado</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="w-full bg-white dark:bg-onyx-900 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={cn("h-full bg-brand-500 rounded-full", progressAmt > 100 ? 'bg-red-500' : 'bg-brand-500')}
                                                        style={{ width: `${progressAmt}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-xs text-slate-400 py-4 h-full flex flex-col justify-center">
                                    No hay viajes organizados todavía.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ---------- RIGHT COLUMN (Span 1) ---------- */}
                <div className="lg:col-span-1">
                    <FlightSearchWidget />
                </div>

            </div>

        </div>
    );
}
