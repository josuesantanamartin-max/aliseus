import React, { useState, useMemo, useEffect } from 'react';
import { 
    Plane, MapPin, CalendarDays, Wallet, TrendingUp, TrendingDown, 
    Search, ArrowRight, Heart, Bell, Plus, CheckCircle2, CloudFog,
    Activity, Clock
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
            
            {/* ROW 1: CABECERA INTELIGENTE */}
            <div className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-[background,border,color] duration-300 ${themeStyles[smartHeader.colorTheme]}`}>
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold tracking-widest uppercase opacity-70">
                        Radar de Viajes
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight max-w-3xl">
                        {smartHeader.title}
                    </h2>
                    <p className="text-sm font-bold opacity-80 mt-1">{smartHeader.subtitle}</p>
                    
                    {/* MICROESTADOS */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                            <Plane className="w-4 h-4 opacity-60" />
                            <span className="text-sm font-bold">{upcomingTrips.length + activeTrips.length} viajes activos</span>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                            <Wallet className="w-4 h-4 opacity-60" />
                            <span className="text-sm font-bold">{travelSpendingYear === 0 ? "Sin inversión este año" : `${formatCurrency(travelSpendingYear)} invertidos`}</span>
                        </div>
                    </div>
                </div>
                
                <div className="shrink-0 flex items-center self-start xl:self-center mt-2 xl:mt-0">
                    <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-transparent font-bold shadow-md hover:shadow-lg transition-all active:scale-95 group">
                        <span>{smartHeader.actionLabel}</span>
                        <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ROW 2: ESTADO OPERATIVO INMEDIATO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. HÉROE: PRÓXIMO VIAJE o INICIATIVA DE ACTIVACIÓN */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full overflow-hidden relative group">
                    {smartHeader.hasTrips && nextTrip ? (
                        <>
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-sky-50 dark:bg-sky-500/10 rounded-2xl">
                                        <Plane className="w-6 h-6 text-sky-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{daysUntilNextTrip === 0 ? 'Viaje en curso' : 'Próxima Salida'}</h3>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cuenta Atrás</span>
                                   <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{daysUntilNextTrip} <span className="text-xs text-slate-400">días</span></span>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex-1 flex flex-col justify-end mt-4">
                                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{nextTrip.destination}</h1>
                                
                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                        <CalendarDays className="w-4 h-4 text-slate-400" />
                                        {new Date(nextTrip.startDate).toLocaleDateString()} - {new Date(nextTrip.endDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                        <Wallet className="w-4 h-4 text-slate-400" />
                                        Presupuesto de {formatCurrency(nextTrip.budget || 0)}
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <button className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold transition-colors">
                                        <CheckCircle2 className="w-4 h-4" /> Checklist y Reservas
                                    </button>
                                </div>
                            </div>
                            <Plane className="absolute -bottom-8 -right-8 w-64 h-64 text-sky-50 dark:text-sky-500/5 rotate-[-20deg] pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-center mb-6 relative z-10 w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 self-center mt-4">
                                <CloudFog className="w-8 h-8 text-indigo-500" />
                            </div>
                            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center mt-2 px-4">
                                <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">No tienes escapadas a la vista</h1>
                                <p className="mt-4 text-sm font-bold text-slate-500 max-w-sm">
                                    Estar en casa también está bien, pero si necesitas un cambio de aires, crea tu primer viaje para añadir fechas, tareas y presupuesto.
                                </p>
                            </div>
                            <div className="mt-8 relative z-10">
                                <button className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg">
                                    <Plus className="w-4 h-4" /> Crear viaje manual
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. BUSCADOR INTEGRADO */}
                <div className="bg-slate-50 dark:bg-onyx-900/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-inner flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white dark:bg-onyx-800 rounded-2xl shadow-sm">
                            <Search className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Motor de Vuelos</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">Lanzadera directa</p>
                        </div>
                    </div>

                    <div className="space-y-5 flex-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Origen (Frecuente)</label>
                            <input
                                type="text"
                                defaultValue="MAD - Madrid"
                                className="w-full h-12 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Destino</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="¿Dónde te gustaría ir?"
                                    className="w-full h-12 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                                />
                                <MapPin className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Salida</label>
                                <input
                                    type="date"
                                    className="w-full h-12 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Regreso</label>
                                <input
                                    type="date"
                                    className="w-full h-12 bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700/50 rounded-xl px-4 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                                />
                            </div>
                        </div>

                        <button className="w-full h-14 mt-4 bg-white dark:bg-onyx-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-onyx-700 border-dashed rounded-xl font-bold text-xs uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-colors">
                            Ver mes más barato
                        </button>
                    </div>

                    <button className="w-full mt-6 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                        <Search className="w-4 h-4" /> Buscar Vuelos
                    </button>
                </div>
            </div>

            {/* ROW 3: DESCUBRIMIENTO & ALERTAS */}
            <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-onyx-800/80">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-500" />
                            Destinos en Seguimiento
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Tus alertas y deseos</p>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                    {discoveryItems.length === 0 ? (
                         <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px] text-slate-400">
                             <MapPin className="w-12 h-12 mb-4 opacity-20" />
                             <p className="text-base font-bold text-slate-900 dark:text-white">Aún no sigues ningún destino</p>
                             <p className="text-sm mt-2 max-w-md">Guarda un lugar o configura una alerta de precios. Nosotros vigilaremos los vuelos por ti y te avisaremos cuando haya chollos.</p>
                         </div>
                    ) : (
                        <div className="flex gap-4 min-w-max">
                            {discoveryItems.map((item) => (
                                <div key={item.id} className="w-[300px] bg-slate-50 dark:bg-onyx-800/50 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800 flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-onyx-700 flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <MapPin className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        {item.alert?.isDrop && (
                                            <span className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm flex items-center gap-1 animate-pulse">
                                                <Bell className="w-3 h-3" /> ¡Bajó!
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{item.name}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 truncate">{item.country}</p>

                                    <div className="mt-auto bg-white dark:bg-onyx-900 rounded-2xl p-4 border border-slate-100 dark:border-onyx-800">
                                        {item.alert ? (
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ahora</span>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(item.alert.currentPrice)}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", item.alert.isDrop ? "text-rose-500" : "text-slate-400")}>Objetivo</span>
                                                    <span className="text-sm font-black text-slate-600 dark:text-slate-400">{formatCurrency(item.alert.targetPrice)}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center h-10">
                                                 <span className="text-xs font-bold text-slate-500">Estimado {formatCurrency(item.estimatedPrice)}</span>
                                                 <button className="text-brand-500 hover:text-brand-600 text-xs font-black uppercase tracking-widest">Crear Alerta</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 4: MÉTRICAS ECONÓMICAS Y SECUNDARIO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Panel Histórico Secundario */}
                <div className="bg-slate-50 dark:bg-onyx-900/30 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5"/> Próximas Salidas Confirmadas
                    </h3>
                    <div className="space-y-4">
                        {upcomingTrips.length > 0 ? (
                            upcomingTrips.map(trip => (
                                <div key={trip.id} className="flex flex-col border border-slate-200 dark:border-onyx-800 p-4 rounded-2xl bg-white dark:bg-onyx-900">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-black text-sm text-slate-900 dark:text-white">{trip.destination}</span>
                                        <span className="text-xs font-bold text-slate-500">{new Date(trip.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">{formatCurrency(trip.budget || 0)} ptp.</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm font-bold text-slate-400">Tus próximas escapadas de forma rápida.</p>
                            </div>
                        )}
                        {upcomingTrips.length === 0 && pastTrips.length > 0 && (
                             <div className="mt-8 border-t border-slate-200 dark:border-onyx-800 pt-6">
                                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Aventuras Pasadas</h4>
                                 {pastTrips.slice(0,2).map(trip => (
                                     <div key={"p"+trip.id} className="flex justify-between text-xs mb-2 opacity-50 font-medium">
                                         <span>{trip.destination}</span>
                                         <span>{new Date(trip.startDate).getFullYear()}</span>
                                     </div>
                                 ))}
                             </div>
                        )}
                    </div>
                </div>

                {/* Gráfico Inversión Anual (comprimido) */}
                <div className="lg:col-span-2 bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                <Wallet className="w-4 h-4"/> Inversión en Viajes {selectedDate.getFullYear()}
                            </h3>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                                {formatCurrency(travelSpendingYear)}
                            </div>
                             {travelSpendingYear > 0 && (
                                <p className={cn("text-xs font-bold mt-1", trendIsUp ? "text-rose-500" : "text-emerald-500")}>
                                    {trendIsUp ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                                    {formatCurrency(trendAmount)} vs año anterior
                                </p>
                            )}
                        </div>
                        {hasChartData && (
                            <div className="bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700/50 rounded-xl p-1 flex self-start">
                                {(['1m', '6m', '1y'] as const).map(tf => (
                                    <button key={tf} onClick={() => setChartTimeframe(tf)} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-colors", chartTimeframe === tf ? "bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-[150px] w-full">
                        {hasChartData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSpentTravel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#0f172a', fontWeight: 'bold' }} formatter={(value: number) => [formatCurrency(Number(value) || 0), 'Consumo']} labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }} />
                                    <Area type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpentTravel)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="h-full w-full flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-onyx-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-onyx-700 p-4">
                                 <p className="text-sm font-bold text-slate-500">
                                     Cuando empieces a registrar viajes, aquí verás tu inversión anual y estacionalidad.
                                 </p>
                             </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
