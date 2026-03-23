import React, { useMemo, useState, useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
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
    History
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LifeSnapshot from './LifeSnapshot';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AuraFamilyOverview({ selectedDate: selectedDateProp, onNavigate }: { selectedDate?: Date, onNavigate?: (app: string, view: string) => void }) {
    const { familyMembers, familyEvents, travelDocuments: vaultDocs } = useLifeStore();

    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());

    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    // ==========================================
    // LOGIC: KPIS & SUMMARIES
    // ==========================================
    
    // 1. Miembros Activos
    const totalMembers = familyMembers.length;

    // 2. Eventos próximos (7 días)
    const upcomingEventsCount = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        return familyEvents.filter(e => {
            const date = new Date(e.time);
            return date >= today && date <= nextWeek;
        }).length;
    }, [familyEvents]);

    // 3. Tareas Familiares
    const tasksData = useMemo(() => {
        return familyMembers.map(member => ({
            member,
            tasks: [], // Mock pending
            completedToday: 0 // Mock completed
        }));
    }, [familyMembers]);
    const totalPendingTasks = tasksData.reduce((sum, d) => sum + d.tasks.length, 0);

    // 4. Alertas Importantes (Health + Renewals)
    const criticalAlertsCount = useMemo(() => {
        let count = 0;
        familyMembers.forEach(m => {
            if (m.healthStatus === 'SPECIAL_FOLLOWUP') count++;
            if (m.activeAlerts) count += m.activeAlerts;
        });
        return count;
    }, [familyMembers]);

    // Birthday Logic (kept for cards)
    const getNextBirthday = (member: any) => {
        if (!member.birthDate) return null;
        const today = new Date();
        const birthDate = new Date(member.birthDate);
        const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
        return Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto px-4 lg:px-0 animate-in fade-in duration-700">



            {/* TOP 4 KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Miembros Activos */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between group hover:border-brand-500/30 transition-all cursor-default">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-500" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Miembros</h3>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                        </div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {totalMembers}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-onyx-800/50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En línea</span>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-onyx-900 bg-slate-100" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Próximos 7 días */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between group hover:border-indigo-500/30 transition-all cursor-default">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agenda 7 días</h3>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {upcomingEventsCount}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-onyx-800/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Eventos</span>
                        <span className="text-indigo-500">Próximos</span>
                    </div>
                </div>

                {/* 3. Tareas Hoy */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between group hover:border-emerald-500/30 transition-all cursor-default">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tareas Hoy</h3>
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {totalPendingTasks}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-onyx-800/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Estatus</span>
                        <span className="text-emerald-500">{totalPendingTasks === 0 ? 'Completado' : 'Pendientes'}</span>
                    </div>
                </div>

                {/* 4. Alertas */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col justify-between group hover:border-rose-500/30 transition-all cursor-default">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-rose-500" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alertas</h3>
                            </div>
                            <Info className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                        </div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {criticalAlertsCount}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-onyx-800/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Urgente</span>
                        <span className="text-rose-500">{criticalAlertsCount > 0 ? 'Atención' : 'Sin alertas'}</span>
                    </div>
                </div>
            </div>

            {/* BLOQUE: MI FAMILIA */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Mi Familia</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gestión de miembros y roles</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {familyMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-black/20 transition-all duration-500">
                            {/* Member Card Top */}
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-onyx-800 overflow-hidden border-4 border-white dark:border-onyx-900 shadow-md">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-indigo-500 text-white font-black text-xl">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {member.healthStatus === 'SPECIAL_FOLLOWUP' && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 border-2 border-white dark:border-onyx-900 flex items-center justify-center z-10 animate-pulse">
                                                <HeartPulse className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">{member.name}</h4>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.role}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-onyx-700" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{member.birthDate ? `${new Date().getFullYear() - new Date(member.birthDate).getFullYear()} años` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 rounded-xl bg-slate-50 dark:bg-onyx-800 text-slate-400 hover:text-brand-500 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Chips Section */}
                            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                {member.tags?.map(tag => (
                                    <span key={tag} className="px-2.5 py-1 bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                                {member.healthStatus === 'SPECIAL_FOLLOWUP' && (
                                    <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                        Seguimiento Especial
                                    </span>
                                )}
                            </div>

                            {/* Quick Actions Grid */}
                            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-50 dark:border-onyx-800/50 relative z-10">
                                <button className="flex flex-col items-center gap-2 group/btn">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover/btn:bg-indigo-500 group-hover/btn:text-white transition-all">
                                        <CalendarDays className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Agenda</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 group/btn">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/btn:bg-emerald-500 group-hover/btn:text-white transition-all">
                                        <ListTodo className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tareas</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 group/btn">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover/btn:bg-amber-500 group-hover/btn:text-white transition-all">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Docs</span>
                                </button>
                            </div>

                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-3xl rounded-full -mr-8 -mt-8 group-hover:bg-brand-500/10 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* AGENDA Y TAREAS SECTON */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Columna Izquierda: Agenda Semanal */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <CalendarCheck2 className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Agenda Familiar</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumen de la semana</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] border border-slate-100 dark:border-onyx-800/80 shadow-sm overflow-hidden">
                        <div className="p-2">
                            {familyEvents.length > 0 ? (
                                <div className="space-y-1">
                                    {familyEvents.slice(0, 4).map((event) => (
                                        <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-onyx-800/50 rounded-2xl transition-colors group">
                                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-onyx-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
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
                                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                    <CalendarDays className="w-10 h-10 text-slate-200 mb-4" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay eventos en los próximos 7 días</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full py-4 bg-slate-50 dark:bg-onyx-800/50 border-t border-slate-100 dark:border-onyx-700/50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-500 transition-colors">
                            Ver Calendario Completo
                        </button>
                    </div>
                </div>

                {/* Columna Derecha: Tareas Familiares */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ListTodo className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Tareas Familiares</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progreso del día</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex-1">
                        <div className="space-y-6">
                            {tasksData.map(data => (
                                <div key={data.member.id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-onyx-800 overflow-hidden">
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

                        <div className="mt-8 p-4 rounded-3xl bg-brand-500/5 border border-brand-500/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h6 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-0.5">Motivación Semanal</h6>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-tight">¡Vais por buen camino! 85% completado de media.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LOWER BLOCKS: SALUD, PAPELES, FINANZAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* SALUD Y CUIDADOS */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Salud y Cuidados</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Alerta Premium</h5>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">
                                        Seguimiento especial para {familyMembers.find(m => m.healthStatus === 'SPECIAL_FOLLOWUP')?.name || 'un miembro'}. Revisar cita médica.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-onyx-800 transition-colors rounded-2xl cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                                        <Heart className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Vacunas pendientes</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2 Alert.</span>
                            </div>
                            <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-onyx-800 transition-colors rounded-2xl cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Historial Médico</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-200" />
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 px-6 py-4 bg-slate-900 dark:bg-onyx-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-[0.98]">
                        Ver Diario de Salud
                    </button>
                </div>

                {/* PAPELES Y SEGURIDAD */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-brand-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Papeles y Seguridad</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximas renovaciones</h6>
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">DNI - Carmen</span>
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[8px] font-black uppercase">En 15 días</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-onyx-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[90%]" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-onyx-800 text-center hover:border-brand-500/30 transition-all cursor-pointer">
                                <GraduationCap className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                <span className="block text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-tight">Becas y Escuelas</span>
                            </div>
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-onyx-800 text-center hover:border-brand-500/30 transition-all cursor-pointer">
                                <ShieldAlert className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                <span className="block text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-tight">Pólizas/Seguros</span>
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 px-6 py-4 bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-brand-600 active:scale-[0.98]">
                        Ir a Bóveda Documental
                    </button>
                </div>

                {/* FINANZAS FAMILIARES (SNAPSHOT) */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-sm flex flex-col h-full group">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Finanzas Familiares</h3>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gasto estimado mes</span>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                2.450 <span className="text-lg">€</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-500">+4.2% vs mes anterior</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span>Alquiler/Hipoteca</span>
                                <span className="text-slate-900 dark:text-white">1.100 €</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span>Supermercado</span>
                                <span className="text-slate-900 dark:text-white">450 €</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span>Suministros</span>
                                <span className="text-slate-900 dark:text-white">180 €</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => onNavigate?.('finance', 'overview')}
                        className="mt-8 px-6 py-4 border border-slate-100 dark:border-onyx-700 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 dark:hover:bg-onyx-800 active:scale-[0.98]"
                    >
                        Gestionar con Aura Finance
                    </button>
                </div>
            </div>

            {/* SNAPSHOT VIEW (SIEMPRE AL FINAL) */}
            <div className="grid grid-cols-1 gap-10">
                <LifeSnapshot />
            </div>

        </div>
    );
}
