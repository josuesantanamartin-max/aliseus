import React, { useMemo, useState, useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import {
    Users,
    Gift,
    CalendarDays,
    ListTodo,
    Activity,
    CheckCircle2,
    Clock,
    UserCircle2,
    CalendarCheck2,
    ShieldAlert,
    Stethoscope,
    FileText,
    TrendingUp,
    HeartPulse,
    ArrowUpRight,
    ArrowRight,
    Calendar,
    MapPin,
    Plus,
    Bell,
    Heart,
    GraduationCap,
    Info,
    ChevronRight,
    History,
    CreditCard,
    AlertCircle,
    Home,
    Wifi,
    Wallet,
    TrendingDown,
    CalendarRange
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LifeSnapshot from './LifeSnapshot';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AuraFamilyOverviewProps {
    onNavigate?: (zone: string, section?: string) => void;
}

// MOCK DATA PARA LA ACTIVIDAD
const MOCK_ACTIVITIES = [
    { id: '1', user: 'Ana', action: 'ha completado', target: 'Compra semanal', time: 'hace 2h', type: 'tasks', icon: ListTodo, color: 'emerald' },
    { id: '2', user: 'Carlos', action: 'añadió un gasto', target: 'Colegio Marzo', time: 'hace 5h', type: 'finance', icon: Wallet, color: 'brand' },
    { id: '3', user: 'Sistema', action: 'recordatorio', target: 'Cita Pediatra Mañana', time: 'hace 8h', type: 'calendar', icon: Calendar, color: 'indigo' },
    { id: '4', user: 'Ana', action: 'actualizó', target: 'Menú semanal', time: 'ayer', type: 'tasks', icon: ListTodo, color: 'emerald' },
];

export default function AuraFamilyOverview({ onNavigate }: AuraFamilyOverviewProps) {
    const { 
        familyMembers, 
        familyEvents,
    } = useLifeStore();
    
    // These fields don't exist in the store yet – use local mocks so the build passes
    const upcomingEvents = familyEvents;
    const tasks: { id: string; assigneeId: string; completed: boolean; title: string }[] = [];
    const familyHealthMetrics = null;
    
    const { 
        accounts,
        transactions,
        budgets
    } = useFinanceStore();

    const [headerIntent, setHeaderIntent] = useState<'normal' | 'warning'>('normal');
    const [feedFilter, setFeedFilter] = useState<'all' | 'finance' | 'tasks' | 'calendar'>('all');

    // CÁLCULOS DE SALUD Y OPERATIVA
    const medicalAlerts = useMemo(() => {
        return familyMembers
            .filter(m => m.healthStatus === 'SPECIAL_FOLLOWUP')
            .map(m => ({
                member: m.name,
                reason: 'Revisión pendiente o seguimiento activo',
                priority: 'high' as const
            }));
    }, [familyMembers]);

    const urgentDocsCount = useMemo(() => 8, []); // Mocked based on existing logic or data

    const tasksData = useMemo(() => {
        return familyMembers.map(member => ({
            member,
            tasks: tasks.filter(t => t.assigneeId === member.id && !t.completed),
            completedToday: Math.floor(Math.random() * 5) // Mocked
        }));
    }, [familyMembers, tasks]);

    const totalPendingTasks = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);
    const tasksCompletionAverage = 85; // Mocked

    // PRÓXIMOS PAGOS (Copiado de lógica de Finance o mockeado para este módulo)
    const nextPayments = [
        { id: '1', title: 'Alquiler / Hipoteca', amount: 1200, daysRemaining: 3, auto: true },
        { id: '2', title: 'Seguro Hogar', amount: 45, daysRemaining: 12, auto: true },
        { id: '3', title: 'Colegio', amount: 350, daysRemaining: 5, auto: false }
    ];

    const documentRenewals = [
        { id: '1', title: 'DNI Carlos', daysRemaining: 15, urgent: true },
        { id: '2', title: 'Pasaporte Ana', daysRemaining: 45, urgent: false }
    ];

    useEffect(() => {
        if (medicalAlerts.length > 0 || nextPayments.some(p => p.daysRemaining < 5)) {
            setHeaderIntent('warning');
        } else {
            setHeaderIntent('normal');
        }
    }, [medicalAlerts, nextPayments]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const headerTitle = headerIntent === 'warning' 
        ? "Hay asuntos familiares que requieren tu atención" 
        : "Todo está en calma en el hogar";

    return (
        <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto px-4 lg:px-0 pb-12">
            
            {/* ROW 1: CABECERA INTELIGENTE (Capa 0) */}
            <div className={cn(
                "p-8 md:p-10 rounded-[2.5rem] border flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-all duration-500 shadow-sm overflow-hidden relative group",
                headerIntent === 'warning' 
                    ? "bg-amber-50/50 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-100" 
                    : "bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-100"
            )}>
                {/* Background Accent */}
                <div className={cn(
                    "absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 -mr-32 -mt-32 transition-colors duration-500",
                    headerIntent === 'warning' ? "bg-amber-400" : "bg-emerald-400"
                )} />

                <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 opacity-50" />
                        <p className="text-[10px] font-black tracking-[0.25em] uppercase opacity-60">Aliseus Family · Panorama</p>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1] max-w-2xl">
                        {headerTitle}
                    </h2>
                    
                    {/* MICROESTADOS ENRIQUECIDOS */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 text-[11px] font-bold shadow-sm font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {tasksCompletionAverage}% Tareas OK
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 text-[11px] font-bold shadow-sm font-mono">
                            <Stethoscope className="w-3.5 h-3.5 opacity-50" />
                            {medicalAlerts.length} Alertas
                        </span>
                        <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 text-[11px] font-bold shadow-sm font-mono">
                            <Calendar className="w-3.5 h-3.5 opacity-50" />
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
                
                <div className="shrink-0 flex items-center self-start xl:self-center relative z-10">
                    <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-onyx-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-brand-500/20 active:scale-95 transition-all group">
                        Ver Prioridades
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* CAPA 1: ESTADO OPERATIVO (Operative Grid 2 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. SALUD Y CUIDADOS (OPERATIVA) */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full min-h-[440px] group hover:border-rose-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <HeartPulse className="w-5 h-5 text-rose-500" />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Salud y Cuidados</h3>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {medicalAlerts.length > 0 ? (
                            medicalAlerts.map((alert, idx) => (
                                <div key={idx} className={cn(
                                    "p-5 rounded-3xl border transition-all hover:bg-slate-50 dark:hover:bg-onyx-800/50",
                                    alert.priority === 'high' 
                                        ? "bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10" 
                                        : "bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg transition-transform hover:scale-105",
                                            alert.priority === 'high' ? "bg-rose-500 shadow-rose-500/20" : "bg-amber-500 shadow-amber-500/20"
                                        )}>
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">{alert.member}</h5>
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{alert.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-12">
                                <Stethoscope className="w-16 h-16 mb-6" />
                                <span className="text-xs font-black uppercase tracking-[0.25em]">Sin novedades Sanitarias</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. AGENDA FAMILIAR (OPERATIVA) */}
                <div className="bg-slate-50/50 dark:bg-onyx-950/20 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-inner flex flex-col h-full min-h-[440px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <CalendarDays className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Próximos Compromisos</h3>
                        </div>
                        <CalendarCheck2 className="w-5 h-5 text-slate-300" />
                    </div>

                    <div className="space-y-3 flex-1">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.slice(0, 4).map((event) => (
                                <div key={event.id} className="flex items-center gap-4 p-4 bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-onyx-800 text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-sm">
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(new Date(event.time))}</span>
                                        <span className="text-base font-black leading-none">{new Date(event.time).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-black text-slate-900 dark:text-white truncate mb-0.5">{event.title}</h5>
                                        <div className="flex items-center gap-2">
                                             <Clock className="w-3 h-3 text-slate-300" />
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(event.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm",
                                        event.type === 'MEDICAL' ? "bg-rose-500/10 text-rose-500" :
                                        event.type === 'EDUCATION' ? "bg-brand-500/10 text-brand-500" :
                                        "bg-slate-500/10 text-slate-500"
                                    )}>
                                        {event.type}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                <CalendarDays className="w-16 h-16 mb-6" />
                                <span className="text-xs font-black uppercase tracking-[0.25em]">Semana Despejada</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CAPA 2: SNAPSHOTS / KPIs (4 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Misiones */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Misiones Hoy</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{tasksCompletionAverage}%</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ritmo</span>
                    </div>
                    <div className="w-full bg-slate-50 dark:bg-onyx-800 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${tasksCompletionAverage}%` }} />
                    </div>
                </div>

                {/* 2. Finanzas Hogar */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Salud Financiera</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(2450)}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest group-hover:text-brand-500 transition-colors">
                        Saldo Consolidado
                    </div>
                </div>

                {/* 3. Salud Familiar */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Seguridad Vital</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{medicalAlerts.length}</span>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Alertas</span>
                    </div>
                    <div className={cn("text-[10px] font-black mt-4 uppercase tracking-widest", medicalAlerts.length > 0 ? "text-amber-500" : "text-emerald-500")}>
                        {medicalAlerts.length > 0 ? 'Atención Requerida' : 'Entorno Protegido'}
                    </div>
                </div>

                {/* 4. Suministros/Doc */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.05)] flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Burocracia</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{urgentDocsCount}</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Trámites</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">
                        {documentRenewals.length} Documentos en Vigor
                    </div>
                </div>
            </div>

            {/* CAPA 3: PROFUNDIZACIÓN (Analysis Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* ESTATUS ECONÓMICO GLOBAL */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group hover:border-brand-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-brand-500" />
                            </div>
                             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Resultado Mensual</h3>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                        <div className="mb-8">
                            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
                                2.450 <span className="text-xl text-slate-400">€</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    Bajo control
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo total disponible</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-slate-50 dark:border-onyx-800 pt-8">
                            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cuentas Líquidas</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {accounts.filter(acc => ['BANK', 'SAVINGS', 'CASH', 'WALLET'].includes(acc.type)).map(acc => (
                                    <div key={acc.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800 hover:shadow-md transition-all shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-onyx-800 flex items-center justify-center shadow-sm">
                                                <Wallet className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">{acc.name}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                                            {formatCurrency(acc.balance)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANORAMA DE VIDA (OPTIMIZADO) */}
                <div className="h-full">
                    <LifeSnapshot hideActivity={true} hidePayments={true} />
                </div>
            </div>

            {/* CAPA 4: TRAZABILIDAD (ACTIVITY FEED) */}
            <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-onyx-800 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cronología del Hogar</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] pr-1">Feed unificado de actividad</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-onyx-800 p-1 rounded-xl self-start">
                        {(['all', 'finance', 'tasks', 'calendar'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setFeedFilter(filter)}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    feedFilter === filter 
                                        ? "bg-white dark:bg-onyx-700 text-slate-900 dark:text-white shadow-sm" 
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                {filter === 'all' ? 'Todo' : filter === 'finance' ? 'Gastos' : filter === 'tasks' ? 'Tareas' : 'Agenda'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {MOCK_ACTIVITIES
                        .filter(a => feedFilter === 'all' || a.type === feedFilter)
                        .map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-onyx-800/50 transition-colors group">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-onyx-700 shadow-sm transition-transform group-hover:scale-110",
                                        activity.color === 'emerald' ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10" :
                                        activity.color === 'brand' ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10" :
                                        "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"
                                    )}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                                            <span className="font-bold text-slate-900 dark:text-white">{activity.user}</span> {activity.action} <span className="font-bold text-slate-900 dark:text-white">{activity.target}</span>.
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* GESTIÓN DE FAMILIA (Bottom Structural section) */}
            <div className="flex flex-col gap-6 pt-10 border-t border-slate-100 dark:border-onyx-800 mt-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gestión de Familia</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Miembros y permisos</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-onyx-800 text-slate-500 hover:text-brand-500 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Añadir Miembro</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {familyMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-onyx-900 rounded-[2rem] p-6 border border-slate-100 dark:border-onyx-800/80 flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-onyx-800 overflow-hidden border-2 border-white dark:border-onyx-900 shadow-sm shrink-0 group-hover:border-brand-500/30 transition-all">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-onyx-800 dark:to-onyx-700 text-slate-600 dark:text-white font-black text-xl">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate pr-2">{member.name}</h4>
                                    {member.healthStatus === 'SPECIAL_FOLLOWUP' && (
                                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0 animate-pulse" />
                                    )}
                                </div>
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70">{member.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
