import React, { useState, useMemo, useEffect } from 'react';
import { 
    Plane, MapPin, CalendarDays, Wallet, TrendingUp, TrendingDown, 
    Plus, Search, ChevronRight, Activity, Target, Filter, ArrowRight,
    Map
} from 'lucide-react';
import { useLifeStore } from '@/store/useLifeStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { cn } from '@/utils/cn';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer 
} from 'recharts';
import TravelWishlistWidget from '@/components/features/life/travel/TravelWishlistWidget';
import PriceAlertWidget from '@/components/features/life/travel/PriceAlertWidget';
import TravelDocsWidget from '@/components/features/life/travel/TravelDocsWidget';

// Internal Child Component for Flight Search
function FlightSearchWidget() {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-onyx-800 flex items-center justify-center">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Buscador</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white leading-none">Vuelos Baratos</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Origen</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="MAD - Madrid"
                                className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-4 text-[11px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Destino</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="¿A dónde volamos?"
                                className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-4 text-[11px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                            />
                            <Plane className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ida</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-3 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer"
                                />
                                <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 z-0 group-hover:text-brand-500 transition-colors" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vuelta</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    className="w-full h-11 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-800/80 rounded-xl px-3 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer"
                                />
                                <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 z-0 group-hover:text-brand-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-slate-900/10 dark:shadow-white/5 active:scale-[0.98]">
                            <Search className="w-3.5 h-3.5" />
                            Buscar en Duffel
                        </button>
                    </div>
                </div>
            </div>
            <Plane className="absolute -top-1 -right-1 w-16 h-16 text-brand-50/20 dark:text-brand-500/5 -rotate-12 pointer-events-none opacity-50" />
        </div>
    );
}

export default function AuraTravelOverview({ selectedDate: selectedDateProp, onNavigate }: { selectedDate?: Date, onNavigate?: (app: string, tab?: string) => void }) {
    const { trips } = useLifeStore();
    const { transactions, goals } = useFinanceStore();

    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());
    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y'>('6m');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    const nextTrip = useMemo(() => {
        const upcoming = trips.filter(t => t.status === 'UPCOMING').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        return upcoming[0] || null;
    }, [trips]);

    const daysUntilNextTrip = useMemo(() => {
        if (!nextTrip) return null;
        const diff = new Date(nextTrip.startDate).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }, [nextTrip]);

    const nextTripGoal = useMemo(() => {
        if (!nextTrip) return null;
        return goals.find(g => g.id === nextTrip.linkedGoalId || g.linkedTripId === nextTrip.id) || null;
    }, [nextTrip, goals]);

    const travelSpendingYear = useMemo(() => {
        const currentYear = selectedDate.getFullYear();
        const travelTxs = transactions.filter(t => 
            t.type === 'EXPENSE' && 
            (t.category === 'Viajes' || t.category === 'Travel' || t.category === 'Vacaciones') &&
            new Date(t.date).getFullYear() === currentYear
        );
        return travelTxs.reduce((acc, curr) => acc + curr.amount, 0);
    }, [transactions, selectedDate]);

    const { completedCount, totalCreated } = useMemo(() => {
        const completed = trips.filter(t => t.status === 'COMPLETED').length;
        return { completedCount: completed, totalCreated: trips.length };
    }, [trips]);

    const chartData = useMemo(() => {
        const data: { name: string; spent: number }[] = [];
        const now = new Date();
        const monthsCount = chartTimeframe === '1m' ? 4 : chartTimeframe === '6m' ? 6 : 12;

        for (let i = monthsCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
            const monthTxs = transactions.filter(t => {
                const txDate = new Date(t.date);
                return txDate.getMonth() === d.getMonth() && 
                       txDate.getFullYear() === d.getFullYear() &&
                       t.type === 'EXPENSE' &&
                       (t.category === 'Viajes' || t.category === 'Travel' || t.category === 'Vacaciones');
            });
            const spent = monthTxs.reduce((acc, t) => acc + t.amount, 0);
            data.push({ name: chartTimeframe === '1m' ? `Sem ${monthsCount - i}` : monthName, spent });
        }
        return data;
    }, [transactions, chartTimeframe]);

    const hasChartData = useMemo(() => chartData.some(d => d.spent > 0), [chartData]);
    const upcomingTripsList = useMemo(() => trips.filter(t => t.status === 'UPCOMING' || t.status === 'CURRENT'), [trips]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">Viajes & Expediciones</h2>
                    <p className="text-sm font-medium text-slate-500 max-w-md">Gestiona tus aventuras y documentación en un solo lugar.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => onNavigate?.('life', 'travel')}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nuevo Plan
                    </button>
                </div>
            </div>

            {/* TOP KPI ROW (4 WIDGETS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Proxima Salida */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Plane className="w-4 h-4 text-brand-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Próxima Salida</h3>
                        </div>
                        {nextTrip ? (
                            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {nextTrip.destination}
                            </div>
                        ) : (
                            <div className="text-lg font-bold text-slate-300 uppercase tracking-tighter">Sin viajes</div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                        {nextTrip ? (
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En {daysUntilNextTrip} días</span>
                                <span className="text-xs font-bold text-brand-500">{new Date(nextTrip.startDate).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Planifica uno</span>
                        )}
                    </div>
                </div>

                {/* 2. Inversion Viajes */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inversión {selectedDate.getFullYear()}</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {formatCurrency(travelSpendingYear)}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Histórico</span>
                            <span className="font-bold text-indigo-500">6m: {chartTimeframe}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Wishlist Summary */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-rose-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Destinos Wishlist</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {totalCreated}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Completados</span>
                            <span className="font-bold text-rose-500">{completedCount}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Precios / Docs Alert */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado Viajes</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {upcomingTripsList.length}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Próximos</span>
                            <span className="font-bold text-amber-500">{upcomingTripsList.length} activos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* LEFT/CENTER COLUMN (2/3) */}
                <div className="lg:col-span-3 space-y-8">
                    {/* WIDGET: HISTORIAL GASTO */}
                    <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Inversión en Viajes</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(travelSpendingYear)} <span className="text-xs text-slate-400 font-bold ml-1">este año</span></span>
                                </div>
                            </div>
                            <div className="flex items-center bg-slate-50 dark:bg-onyx-800 p-1.5 rounded-xl">
                                {(['1m', '6m', '1y'] as const).map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setChartTimeframe(tf)}
                                        className={cn(
                                            "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
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

                        <div className="flex-1 w-full min-h-[300px]">
                            {hasChartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTravel" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-onyx-800/30" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(value) => `${value}`} width={60} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', background: '#fff' }}
                                            itemStyle={{ color: '#0f172a', fontWeight: '900', fontSize: '13px' }}
                                            formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Gastado']}
                                            labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                                        />
                                        <Area type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTravel)" activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 dark:bg-onyx-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-onyx-700">
                                    <div className="w-16 h-16 bg-white dark:bg-onyx-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-onyx-700">
                                        <Wallet className="w-8 h-8 text-slate-300 dark:text-onyx-600" />
                                    </div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Sin datos de gastos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <TravelWishlistWidget />
                        <PriceAlertWidget />
                    </div>
                </div>

                {/* RIGHT COLUMN (1/3) */}
                <div className="lg:col-span-1 space-y-8">
                    <FlightSearchWidget />
                    
                    <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Próximas</h3>
                            </div>
                            <span className="text-sm font-black text-brand-500 tabular-nums">{upcomingTripsList.length}</span>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {upcomingTripsList.length > 0 ? (
                                upcomingTripsList.map((trip) => (
                                    <div key={trip.id} className="bg-slate-50 dark:bg-onyx-800/50 p-4 rounded-2xl flex flex-col gap-3 group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 dark:text-white">{trip.destination}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{new Date(trip.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(trip.budget || 0)}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-onyx-900 rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, ((trip.spent || 0) / Math.max(1, (trip.budget || 1))) * 100)}%` }} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 font-medium text-center py-4 italic">No hay viajes planeados</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
