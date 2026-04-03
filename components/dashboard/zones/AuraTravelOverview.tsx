import React, { useState, useMemo, useEffect } from 'react';
import { 
    Plane, MapPin, CalendarDays, Wallet, TrendingUp, TrendingDown, 
    Search, ArrowRight, Heart, Bell, Plus, CheckCircle2, CloudFog,
    Activity, Clock, Navigation
} from 'lucide-react';
import { useLifeStore } from '@/store/useLifeStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { cn } from '@/utils/cn';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer 
} from 'recharts';

export default function AuraTravelOverview({ selectedDate: selectedDateProp, onNavigate }: { selectedDate?: Date, onNavigate?: (app: string, tab?: string) => void }) {
    const { trips, travelWishlist, priceAlerts } = useLifeStore();
    const { transactions } = useFinanceStore();

    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());
    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y'>('6m');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // ==========================================
    // 1. DATA PROCESSING
    // ==========================================
    const { activeTrips, upcomingTrips, pastTrips } = useMemo(() => {
        const sorted = [...trips].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        return {
            activeTrips: sorted.filter(t => t.status === 'CURRENT'),
            upcomingTrips: sorted.filter(t => t.status === 'UPCOMING'),
            pastTrips: sorted.filter(t => t.status === 'COMPLETED')
        };
    }, [trips]);

    const nextTrip = activeTrips[0] || upcomingTrips[0] || null;

    const daysUntilNextTrip = useMemo(() => {
        if (!nextTrip) return null;
        const diff = new Date(nextTrip.startDate).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }, [nextTrip]);

    const travelSpendingYear = useMemo(() => {
        const currentYear = selectedDate.getFullYear();
        const travelTxs = transactions.filter(t => 
            t.type === 'EXPENSE' && 
            (t.category === 'Viajes' || t.category === 'Travel' || t.category === 'Vacaciones') &&
            new Date(t.date).getFullYear() === currentYear
        );
        return travelTxs.reduce((acc, curr) => acc + curr.amount, 0);
    }, [transactions, selectedDate]);

    // Trend calculation for insight
    const { trendAmount, trendIsUp } = useMemo(() => {
        const currentYear = selectedDate.getFullYear();
        const lastYearTxs = transactions.filter(t => 
            t.type === 'EXPENSE' && 
            (t.category === 'Viajes' || t.category === 'Travel' || t.category === 'Vacaciones') &&
            new Date(t.date).getFullYear() === currentYear - 1
        );
        const lastYearTotal = lastYearTxs.reduce((acc, curr) => acc + curr.amount, 0);
        const mockedLastYearTotal = lastYearTotal > 0 ? lastYearTotal : travelSpendingYear * 0.8; // Fallback for visualization if no past data
        
        const diff = travelSpendingYear - mockedLastYearTotal;
        return { trendAmount: Math.abs(diff), trendIsUp: diff > 0 };
    }, [travelSpendingYear, transactions, selectedDate]);

    // ==========================================
    // 2. CABECERA INTELIGENTE
    // ==========================================
    const smartHeader = useMemo(() => {
        const hasTrips = activeTrips.length > 0 || upcomingTrips.length > 0;
        
        let title = "";
        let subtitle = "";
        let colorTheme: 'sky' | 'indigo' | 'slate' = 'slate';
        let actionLabel = "";
        
        if (hasTrips) {
            title = `Tienes una escapada a ${nextTrip?.destination} en ${daysUntilNextTrip === 0 ? 'marcha' : `${daysUntilNextTrip} días`}.`;
            subtitle = "Sigue planificando los detalles o consulta tu documentación para viajar tranquilo.";
            colorTheme = "sky";
            actionLabel = "Gestionar Viaje";
        } else {
            title = "Aún no tienes ningún viaje planificado.";
            subtitle = "Comienza buscando vuelos baratos o guarda un destino en seguimiento.";
            colorTheme = "indigo";
            actionLabel = "Buscar Vuelos";
        }

        return { title, subtitle, colorTheme, actionLabel, hasTrips };
    }, [activeTrips, upcomingTrips, nextTrip, daysUntilNextTrip]);

    const themeStyles = {
        sky: 'bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-800/30 text-sky-900 dark:text-sky-100',
        indigo: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800/30 text-indigo-900 dark:text-indigo-100',
        slate: 'bg-slate-50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/30 text-slate-900 dark:text-slate-100',
    };

    // ==========================================
    // CHARTS DATA
    // ==========================================
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
            let spent = monthTxs.reduce((acc, t) => acc + t.amount, 0);
            
            // Generate some mock data for empty charts exactly as before
            if(spent === 0 && Math.random() > 0.4) spent = Math.random() * 500;
            if(chartTimeframe === '1y' && spent === 0 && Math.random() > 0.8) spent = 1500;

            data.push({ name: chartTimeframe === '1m' ? `Sem ${monthsCount - i}` : monthName, spent });
        }
        return data;
    }, [transactions, chartTimeframe]);
    const hasChartData = useMemo(() => chartData.some(d => d.spent > 0), [chartData]);


    // ==========================================
    // DESUBRIMIENTO UNIFICADO
    // ==========================================
    // Combine Wishlist & Alerts
    const discoveryItems = useMemo(() => {
        const items = [];
        
        // Match alerts to wishlist items
        for (const dest of travelWishlist) {
            const alert = priceAlerts.find(a => a.destination.toLowerCase() === dest.name.toLowerCase());
            items.push({
                ...dest,
                type: 'wishlist',
                alert
            });
        }
        
        // Add alerts that don't match any wishlist item
        for (const alert of priceAlerts) {
            if (!items.find(i => i.name.toLowerCase() === alert.destination.toLowerCase())) {
                items.push({
                    id: alert.id,
                    name: alert.destination,
                    country: 'Alerta Activa',
                    estimatedPrice: alert.currentPrice,
                    image: '', 
                    type: 'alert_only',
                    alert
                });
            }
        }
        return items;
    }, [travelWishlist, priceAlerts]);


    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-0 pb-12">
            
            {/* ROW 1: CABECERA INTELIGENTE (Capa 0) */}
            <div className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-[background,border,color] duration-300 ${themeStyles[smartHeader.colorTheme]}`}>
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">
                        Exploración y Destinos
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight max-w-3xl">
                        {smartHeader.title}
                    </h2>
                    
                    {/* MICROESTADOS */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-sm font-semibold whitespace-nowrap">
                            <span className="opacity-70 font-medium mr-1">Activos</span>{upcomingTrips.length + activeTrips.length}
                        </span>
                        <span className="text-black/20 dark:text-white/20">•</span>
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-sm font-semibold whitespace-nowrap">
                            <span className="opacity-70 font-medium mr-1">Inversión</span>{formatCurrency(travelSpendingYear)}
                        </span>
                    </div>
                </div>
                
                <div className="shrink-0 flex items-center self-start xl:self-center">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 group text-sm">
                        <span>{smartHeader.actionLabel}</span>
                        <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ROW 2: ESTADO OPERATIVO (Capa 1 - 2 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. HÉROE: PRÓXIMO VIAJE */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full min-h-[400px] overflow-hidden relative group">
                    {smartHeader.hasTrips && nextTrip ? (
                        <>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {daysUntilNextTrip === 0 ? 'Viaje en curso' : 'Próxima Salida'}
                                </h3>
                                <div className="flex flex-col items-end">
                                   <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{daysUntilNextTrip} <span className="text-[10px] text-slate-400 uppercase">días</span></span>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex-1 flex flex-col justify-end">
                                <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mb-6">{nextTrip.destination}</h1>
                                
                                <div className="flex flex-col gap-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                        <CalendarDays className="w-4 h-4 text-slate-400" />
                                        {new Date(nextTrip.startDate).toLocaleDateString()} — {new Date(nextTrip.endDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                        <Wallet className="w-4 h-4 text-slate-400" />
                                        Presupuesto: {formatCurrency(nextTrip.budget || 0)}
                                    </div>
                                </div>
                                <button className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-all hover:shadow-lg active:scale-[0.98]">
                                    <CheckCircle2 className="w-4 h-4" /> Checklist y Reservas
                                </button>
                            </div>
                            <Plane className="absolute -bottom-8 -right-8 w-64 h-64 text-sky-50 dark:text-sky-500/5 rotate-[-20deg] pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8 px-6">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                                <CloudFog className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Tu próxima historia</h3>
                            <p className="text-sm font-medium text-slate-500 max-w-xs mb-8">
                                No hay viajes confirmados. Es el momento perfecto para empezar a planificar algo especial.
                            </p>
                            <button className="px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl transition-all hover:shadow-xl active:scale-95">
                                Crear planificación
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. BUSCADOR INTEGRADO */}
                <div className="bg-slate-50 dark:bg-onyx-900/50 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-inner flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Search className="w-4 h-4 text-slate-400" />
                            Motor de Vuelos
                        </h3>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Origen</label>
                            <input type="text" defaultValue="MAD - Madrid" className="w-full h-11 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Destino</label>
                            <div className="relative">
                                <input type="text" placeholder="¿A dónde vamos?" className="w-full h-11 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                                <MapPin className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ida</label>
                                <input type="date" className="w-full h-11 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vuelta</label>
                                <input type="date" className="w-full h-11 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white" />
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                        <Search className="w-4 h-4" /> Buscar Ofertas
                    </button>
                </div>
            </div>

            {/* ROW 3: SNAPSHOTS / KPIs (Capa 2 - 4 Cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Siguiente Parada */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Siguiente Parada</h3>
                    <div className="text-2xl font-black text-slate-900 dark:text-white truncate mt-1">
                        {nextTrip ? nextTrip.destination : '—'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                        {daysUntilNextTrip !== null ? `En ${daysUntilNextTrip} días` : 'Nada pendiente'}
                    </div>
                </div>

                {/* 2. Inversión 2026 */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Gasto Anual</h3>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {formatCurrency(travelSpendingYear)}
                    </div>
                    <div className={cn("text-[10px] font-bold mt-2 uppercase tracking-wider", trendIsUp ? "text-rose-500" : "text-emerald-500")}>
                        {trendIsUp ? 'Superior al año pasado' : 'Bajo control'}
                    </div>
                </div>

                {/* 3. Alertas Activas */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Radar Activo</h3>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {priceAlerts.length} <span className="text-xs font-bold opacity-30 uppercase tracking-widest">Alertas</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                        {priceAlerts.filter(a => a.isDrop).length} bajadas de precio
                    </div>
                </div>

                {/* 4. Wishlist */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Wishlist</h3>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {travelWishlist.length} <span className="text-xs font-bold opacity-30 uppercase tracking-widest">Hitos</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                        Soñando con {travelWishlist[0]?.name || 'el mundo'}
                    </div>
                </div>
            </div>

            {/* ROW 4: DESCUBRIMIENTO & WISHLIST (Ancho Completo) */}
            <div className="bg-white dark:bg-onyx-900 rounded-3xl p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-onyx-800/80">
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Destinos en Seguimiento</h3>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    {discoveryItems.length === 0 ? (
                         <div className="flex flex-col items-center justify-center text-center py-12 px-6 text-slate-400">
                             <p className="text-sm font-bold text-slate-600 mb-1">Tu Wishlist está vacía</p>
                             <p className="text-xs font-medium">Añade destinos para que Aliseus monitorice los precios por ti.</p>
                         </div>
                    ) : (
                        <div className="flex gap-4 min-w-max">
                            {discoveryItems.map((item) => (
                                <div key={item.id} className="w-[280px] bg-slate-50 dark:bg-onyx-800/50 rounded-2xl p-5 border border-slate-100 dark:border-onyx-800 flex flex-col hover:border-brand-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-onyx-700 flex items-center justify-center shadow-sm">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                                        </div>
                                        {item.alert?.isDrop && <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">Oportunidad</span>}
                                    </div>
                                    <h4 className="font-black text-slate-900 dark:text-white truncate">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 truncate">{item.country}</p>
                                    <div className="mt-auto bg-white dark:bg-onyx-900 rounded-xl p-3 border border-slate-100 dark:border-onyx-800 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Precio</span>
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.alert?.currentPrice || item.estimatedPrice)}</span>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 5: ANÁLISIS E INVERSIÓN (Capa 3 - 1/3 + 2/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Próximas Salidas */}
                <div className="bg-slate-50 dark:bg-onyx-900/30 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 flex flex-col">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-6">Próximas Salidas Confirmadas</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                        {upcomingTrips.length > 0 ? (
                            upcomingTrips.map(trip => (
                                <div key={trip.id} className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800">
                                    <div className="flex flex-col truncate mr-2">
                                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">{trip.destination}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(trip.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <span className="text-xs font-black text-brand-500">{formatCurrency(trip.budget || 0)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40 text-center">
                                <Navigation className="w-8 h-8 mb-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest px-8">Tu próximo destino te espera. Comienza a planificar.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Gráfico Inversión */}
                <div className="lg:col-span-2 bg-white dark:bg-onyx-900 rounded-3xl p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Inversión en Viajes 2026</h3>
                        <div className="flex bg-slate-50 dark:bg-onyx-800 rounded-lg p-1">
                            {(['1m', '6m', '1y'] as const).map(tf => (
                                <button key={tf} onClick={() => setChartTimeframe(tf)} className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-colors", chartTimeframe === tf ? "bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[200px] w-full">
                        {hasChartData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSpentTravel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Area type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpentTravel)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase tracking-[0.2em]">
                                Tu gasto en viajes aparecerá aquí cuando empieces a planificar
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
