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
    Wifi
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LifeSnapshot from './LifeSnapshot';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ==========================================
// MOCK DATA FOR ACTIVITY FEED (Trazabilidad)
// ==========================================
const MOCK_ACTIVITIES = [
    {
        id: '1',
        user: 'Josué',
        avatar: '', // Initial will be used
        action: 'añadió la factura de',
        target: 'Suministros Básicos',
        time: 'Hace 2 horas',
        type: 'finance',
        icon: TrendingUp,
        color: 'emerald'
    },
    {
        id: '2',
        user: 'Carmen',
        avatar: '', 
        action: 'marcó como completada',
        target: 'Renovación DNI',
        time: 'Ayer',
        type: 'docs',
        icon: FileText,
        color: 'brand'
    },
    {
        id: '3',
        user: 'Josué',
        avatar: '', 
        action: 'añadió un nuevo evento',
        target: 'Tutoría Colegio',
        time: 'Ayer',
        type: 'calendar',
        icon: CalendarDays,
        color: 'indigo'
    }
];

export default function AuraFamilyOverview({ selectedDate: selectedDateProp, onNavigate }: { selectedDate?: Date, onNavigate?: (app: string, view: string) => void }) {
    const { familyMembers, familyEvents } = useLifeStore();
    const { transactions } = useFinanceStore();

    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());

    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    // ==========================================
    // LOGIC: KPIS & SUMMARIES
    // ==========================================
    
    // 1. Eventos próximos (7 días)
    const upcomingEvents = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        return familyEvents.filter(e => {
            const date = new Date(e.time);
            return date >= today && date <= nextWeek;
        }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [familyEvents]);

    const upcomingEventsCount = upcomingEvents.length;

    // 2. Tareas Familiares
    const tasksData = useMemo(() => {
        return familyMembers.map(member => ({
            member,
            tasks: [], 
            completedToday: 0 
        }));
    }, [familyMembers]);
    
    const tasksCompletionAverage = 85; 
    const totalPendingTasks = tasksData.reduce((sum, d) => sum + d.tasks.length, 0);

    // 3. Alertas Médicas/Documentos
    const medicalAlerts = useMemo(() => {
        let alerts: {member: string, reason: string, priority: 'high'|'medium'}[] = [];
        familyMembers.forEach(m => {
            if (m.healthStatus === 'SPECIAL_FOLLOWUP') {
                alerts.push({ member: m.name, reason: 'Revisión Médica Especial', priority: 'high' });
            }
            if (m.activeAlerts && m.activeAlerts > 0) {
                alerts.push({ member: m.name, reason: 'Vacuna/Control Pendiente', priority: 'medium' });
            }
        });
        return alerts;
    }, [familyMembers]);

    // 4. Renovaciones e Hitos de Vida
    // MOCK DATA for renewals
    const documentRenewals = [
        { id: '1', title: 'DNI - Carmen', daysRemaining: 15, urgent: true },
        { id: '2', title: 'Seguro Hogar', daysRemaining: 45, urgent: false }
    ];
    const urgentDocsCount = documentRenewals.filter(d => d.urgent).length;

    // 5. Pagos Próximos (Mocked from logic to show 30d scope)
    const nextPayments = [
        { id: '1', title: 'Alquiler/Hipoteca', amount: 1100, daysRemaining: 3, auto: true },
        { id: '2', title: 'Suministros', amount: 180, daysRemaining: 12, auto: true },
        { id: '3', title: 'Seguro Salud', amount: 125, daysRemaining: 18, auto: true },
    ];
    const nextPaymentsCount = nextPayments.length;

    // ==========================================
    // LOGIC: SMART HEADER
    // ==========================================
    const totalFronts = (medicalAlerts.length > 0 ? 1 : 0) + (urgentDocsCount > 0 ? 1 : 0) + (nextPaymentsCount > 0 ? 1 : 0);
    
    let headerTitle = "La semana está controlada y tranquila";
    let headerSubtitle = "No hay frentes urgentes. Excelente momento para adelantar tareas del hogar.";
    let headerIntent: 'default' | 'urgent' | 'warning' = 'default';

    if (totalFronts > 0) {
        headerTitle = `Esta semana hay ${totalFronts} frente${totalFronts > 1 ? 's' : ''} familiar${totalFronts > 1 ? 'es' : ''} a revisar`;
        
        const causes = [];
        if (medicalAlerts.length > 0) causes.push('cita médica pendiente');
        if (urgentDocsCount > 0) causes.push(`documentación a renovar pronto`);
        if (nextPaymentsCount > 0) causes.push(`${nextPaymentsCount} pagos próximos`);

        headerSubtitle = Object.keys(causes).length > 0 
            ? causes.map((c, i) => i === 0 ? c.charAt(0).toUpperCase() + c.slice(1) : c).join(', ').replace(/, ([^,]*)$/, ' y $1') + '.'
            : "Revisa los detalles a continuación.";
            
        headerIntent = 'warning';
    }


    return (
        <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto px-4 lg:px-0 animate-in fade-in duration-700">

            {/* ========================================== */}
            {/* CABECERA INTELIGENTE                       */}
            {/* ========================================== */}
            <div className={cn(
                "rounded-[2.5rem] p-8 md:p-10 border transition-colors shadow-sm",
                headerIntent === 'warning' ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"
            )}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Home className={cn(
                                "w-5 h-5",
                                headerIntent === 'warning' ? "text-amber-500" : "text-emerald-500"
                            )} />
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                headerIntent === 'warning' ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                            )}>Resumen Familiar</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                            {headerTitle}
                        </h2>
                        <p className="text-base font-medium text-slate-600 dark:text-slate-400">
                            {headerSubtitle}
                        </p>

                        {/* Micro-states */}
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-onyx-900/50 backdrop-blur border border-slate-200/50 dark:border-onyx-700/50 px-3 py-1.5 rounded-xl">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{tasksCompletionAverage}% Tareas Completadas</span>
                            </div>
                            {medicalAlerts.length > 0 && (
                                <div className="flex items-center gap-2 bg-white/50 dark:bg-onyx-900/50 backdrop-blur border border-slate-200/50 dark:border-onyx-700/50 px-3 py-1.5 rounded-xl">
                                    <Activity className="w-3.5 h-3.5 text-rose-500" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{medicalAlerts.length} Alerta médica</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex shrink-0">
                        <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-onyx-900 font-bold text-sm tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            Ver Prioridades <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* CAPA 1: PRIORIDADES / RIESGOS              */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* SALUD Y CUIDADOS */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group hover:border-brand-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Salud y Cuidados</h3>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {medicalAlerts.length > 0 ? (
                            <>
                                {medicalAlerts.map((alert, idx) => (
                                    <div key={idx} className={cn(
                                        "p-4 rounded-3xl border",
                                        alert.priority === 'high' 
                                            ? "bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10" 
                                            : "bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10"
                                    )}>
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md",
                                                alert.priority === 'high' ? "bg-rose-500 shadow-rose-500/20" : "bg-amber-500 shadow-amber-500/20"
                                            )}>
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h5 className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest mb-1",
                                                    alert.priority === 'high' ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                                                )}>
                                                    {alert.member}
                                                </h5>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">
                                                    {alert.reason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 text-center">
                                <HeartPulse className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Todos los miembros están al día en sus revisiones.</p>
                            </div>
                        )}

                        <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-onyx-800 transition-colors rounded-2xl cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Historial Médico</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-brand-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAPELES Y SEGURIDAD */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group hover:border-brand-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-brand-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Papeles y Seguridad</h3>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Próximas renovaciones</h6>
                            {documentRenewals.map(doc => (
                                <div key={doc.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{doc.title}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                            doc.urgent ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-500"
                                        )}>
                                            En {doc.daysRemaining} días
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-onyx-700 rounded-full overflow-hidden">
                                        <div 
                                            className={cn("h-full transition-all duration-1000", doc.urgent ? "bg-amber-500" : "bg-brand-500")}
                                            style={{ width: `${Math.max(10, 100 - (doc.daysRemaining / 365) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PAGOS A 30 DÍAS */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group hover:border-brand-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Pagos Fijos</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">A 30 días</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors cursor-pointer" onClick={() => onNavigate?.('finance', 'overview')} />
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                        {nextPayments.map(payment => (
                            <div key={payment.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-onyx-900 border border-slate-100 dark:border-onyx-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-onyx-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-onyx-700">
                                        <span className="text-xs font-black">{payment.title.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h5 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                            {payment.title}
                                        </h5>
                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                            En {payment.daysRemaining} días {payment.auto && '· Auto'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                                    {payment.amount} €
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* CAPA 2: ORGANIZACIÓN DE LA SEMANA          */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* AGENDA SEMANAL */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <CalendarCheck2 className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Agenda Familiar</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horizonte de 7 días</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-onyx-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 flex items-center justify-center transition-all cursor-pointer">
                            <Plus className="w-4 h-4"/>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] border border-slate-100 dark:border-onyx-800/80 shadow-sm overflow-hidden min-h-[250px] flex flex-col">
                        <div className="flex-1 p-2">
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-1">
                                    {upcomingEvents.slice(0, 4).map((event) => (
                                        <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-onyx-800/50 rounded-2xl transition-colors group">
                                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-onyx-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                                                <span className="text-[10px] font-black uppercase tracking-tighter">{new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(new Date(event.time))}</span>
                                                <span className="text-sm font-black">{new Date(event.time).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{event.title}</h5>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(event.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {event.location && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                            <MapPin className="w-3 h-3 text-slate-300" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{event.location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                                event.type === 'MEDICAL' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                                event.type === 'EDUCATION' ? "bg-brand-500/10 border-brand-500/20 text-brand-500" :
                                                "bg-slate-500/10 border-slate-500/20 text-slate-500"
                                            )}>
                                                {event.type}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-onyx-800 flex items-center justify-center mb-4">
                                        <CalendarCheck2 className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Semana despejada</h4>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No hay eventos ni salidas en los próximos 7 días.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TAREAS FAMILIARES */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ListTodo className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Tareas Familiares</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Misiones del día</p>
                            </div>
                        </div>
                         <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-onyx-800 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 flex items-center justify-center transition-all cursor-pointer">
                            <Plus className="w-4 h-4"/>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex-1 min-h-[250px] flex flex-col">
                        {totalPendingTasks > 0 ? (
                            <>
                                <div className="space-y-6 flex-1">
                                    {tasksData.map(data => (
                                        <div key={data.member.id} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-onyx-800 overflow-hidden border border-slate-200 dark:border-onyx-700">
                                                        {data.member.avatar ? (
                                                            <img src={data.member.avatar} alt={data.member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-brand-500 text-white text-[10px] font-black uppercase">
                                                                {data.member.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.member.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {data.completedToday} / {data.tasks.length + data.completedToday} hoy
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500 transition-all duration-1000" 
                                                    style={{ width: `${(data.completedToday / (data.tasks.length + data.completedToday || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h6 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Motivación del equipo</h6>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-tight">¡En racha! 85% de tareas completadas de media.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex-1 flex flex-col items-center justify-center text-center px-6 py-6">
                                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-onyx-800 flex items-center justify-center mb-4">
                                    <ListTodo className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Todo al día</h4>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">Hoy no hay tareas pendientes asignadas. Podéis descansar.</p>
                                <button className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-onyx-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 text-slate-600 font-bold text-xs transition-colors">
                                    Asignar nueva tarea
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* CAPA 3: CONTEXTO Y ECONOMÍA               */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* FINANZAS FAMILIARES (SNAPSHOT) */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group hover:border-brand-500/20 transition-all">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Finanzas del Hogar</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">Estimación Mensual</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                2.450 <span className="text-xl text-slate-400">€</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    <TrendingUp className="w-3 h-3" />
                                    Por debajo del presupuesto
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-500 dark:text-slate-400">Categoría principal de gasto</span>
                                <span className="text-slate-900 dark:text-white px-2 py-0.5 bg-slate-50 dark:bg-onyx-800 rounded">Alquiler/Hipoteca</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-500 dark:text-slate-400">Último Gasto Relevante</span>
                                <span className="text-slate-900 dark:text-white px-2 py-0.5 bg-slate-50 dark:bg-onyx-800 rounded">Carrefour - 120€</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANORAMA DE VIDA (SNAPSHOT) */}
                <div className="h-full min-h-[300px]">
                    <LifeSnapshot />
                </div>
            </div>

            {/* ========================================== */}
            {/* CAPA 4: TRAZABILIDAD (ACTIVIDAD FEED)      */}
            {/* ========================================== */}
            <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-onyx-800 flex items-center justify-center">
                            <History className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Actividad Familiar</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-1">Últimos hitos</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors">Ver Todo</button>
                </div>

                <div className="space-y-4">
                    {MOCK_ACTIVITIES.map((activity, idx) => {
                        const Icon = activity.icon;
                        return (
                            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-onyx-800/50 transition-colors">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-onyx-700 shadow-sm",
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

            {/* ========================================== */}
            {/* CAPA 5: MI FAMILIA (ESTRUCTURAL)           */}
            {/* ========================================== */}
            <div className="flex flex-col gap-6 mt-4">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Gestión de Familia</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Miembros y permisos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {familyMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 flex items-center gap-4 hover:border-brand-500/30 transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-onyx-800 overflow-hidden border-2 border-white dark:border-onyx-900 shadow-sm shrink-0">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 dark:from-onyx-700 dark:to-onyx-600 text-slate-600 dark:text-white font-black">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate pr-2">{member.name}</h4>
                                    {member.healthStatus === 'SPECIAL_FOLLOWUP' && (
                                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0 animate-pulse" />
                                    )}
                                </div>
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{member.role}</span>
                            </div>
                        </div>
                    ))}

                    <div className="bg-slate-50 dark:bg-onyx-900/50 rounded-3xl p-5 border border-dashed border-slate-200 dark:border-onyx-800 flex items-center justify-center gap-3 hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-onyx-800 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 group-hover:text-brand-500 transition-colors">Añadir</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
