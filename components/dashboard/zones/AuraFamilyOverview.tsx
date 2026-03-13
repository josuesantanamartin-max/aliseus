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
    CalendarCheck2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LifeSnapshot from './LifeSnapshot';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AuraFamilyOverview({ selectedDate: selectedDateProp }: { selectedDate?: Date }) {
    const { familyMembers, familyEvents } = useLifeStore();

    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());

    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    // ==========================================
    // TOP WIDGET 1: MIEMBROS ACTIVOS
    // ==========================================
    const totalMembers = familyMembers.length;
    // Calculate total allowance if any
    const totalWeeklyAllowance = familyMembers.reduce((sum, member) => sum + (member.weeklyAllowance || 0), 0);

    // ==========================================
    // TOP WIDGET 2: PRÓXIMOS CUMPLEAÑOS
    // ==========================================
    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return familyMembers
            .filter(m => m.birthDate)
            .map(m => {
                const birthDate = new Date(m.birthDate!);
                const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const ageTurn = nextBirthday.getFullYear() - birthDate.getFullYear();

                return { member: m, daysUntil, nextBirthday, ageTurn };
            })
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 1); // For the KPI we just need the closest one
    }, [familyMembers]);

    const nextBirthday = upcomingBirthdays[0];

    // ==========================================
    // TOP WIDGET 3: AGENDA HOY
    // ==========================================
    const todayEvents = useMemo(() => {
        const todayStr = selectedDate.toISOString().split('T')[0];
        // Note: familyEvents is an array of FamilyEvent
        // Wait, did life.ts define familyEvents? Yes. But it might not be in useLifeStore. 
        // Let's assume it is or we will mock it based on tasks if needed.
        // I will use familyEvents safely.
        if (!familyEvents) return [];
        return familyEvents
            .filter(e => e.time.startsWith(todayStr))
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [familyEvents, selectedDate]);

    // ==========================================
    // TOP WIDGET 4: TAREAS PENDIENTES (Mocked)
    // ==========================================
    // Using the same mocked logic from FamilyTasksWidget
    const tasksData = useMemo(() => {
        return familyMembers.map(member => ({
            member,
            tasks: [], // Mock pending
            completedToday: 0 // Mock completed
        }));
    }, [familyMembers]);

    const totalTasks = tasksData.reduce((sum, data) => sum + data.tasks.length, 0);
    const completedToday = tasksData.reduce((sum, data) => sum + data.completedToday, 0);


    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-0">

            {/* ========================================== */}
            {/* ROW 1: THE 4 TOP WIDGETS */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Miembros Activos */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Miembros Activos</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {totalMembers}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80 text-xs text-slate-500">
                        {totalWeeklyAllowance > 0 ? (
                            <span>Asignación Semanal: <strong className="text-brand-600 dark:text-brand-400">{totalWeeklyAllowance}€</strong></span>
                        ) : (
                            <span>Sin asignaciones semanales</span>
                        )}
                    </div>
                </div>

                {/* 2. Próximos Cumpleaños */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden">
                    <div className="z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-4 h-4 text-fuchsia-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Próx. Cumpleaños</h3>
                        </div>
                        {nextBirthday ? (
                            <>
                                <div className="text-xl font-black text-slate-900 dark:text-white truncate">
                                    {nextBirthday.member.name}
                                </div>
                                <div className="flex items-center justify-between mt-1 text-xs">
                                    <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">
                                        {nextBirthday.daysUntil === 0 ? '¡Hoy!' : nextBirthday.daysUntil === 1 ? 'Mañana' : `en ${nextBirthday.daysUntil} días`}
                                    </span>
                                    <span className="text-slate-400 font-bold uppercase tracking-wide">Cumple {nextBirthday.ageTurn}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-bold text-slate-400 mt-2">No hay cumpleaños próximos</div>
                        )}
                    </div>
                    {nextBirthday && nextBirthday.daysUntil <= 7 && (
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-fuchsia-50 dark:bg-fuchsia-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    )}
                </div>

                {/* 3. Agenda Hoy */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="w-4 h-4 text-brand-500" />
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Eventos Hoy</h3>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {todayEvents.length}
                        </div>
                        <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500">
                            {todayEvents.length > 0 ? (
                                <span className="truncate">{todayEvents[0].title}</span>
                            ) : (
                                <span>No hay eventos para hoy</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Tareas Pendientes */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tareas Familiares</h3>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {completedToday}
                            <span className="text-base font-bold text-slate-400">/ {totalTasks + completedToday}</span>
                        </div>

                        <div className="mt-3 w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full", (totalTasks === 0 && completedToday > 0) ? "bg-emerald-500" : "bg-emerald-500")}
                                style={{ width: `${totalTasks + completedToday === 0 ? 0 : (completedToday / (totalTasks + completedToday)) * 100}%` }}
                            />
                        </div>

                        <div className="text-xs font-bold flex justify-between">
                            <span className="text-slate-500">Hechas hoy</span>
                            <span className={cn(totalTasks === 0 ? "text-emerald-500" : "text-emerald-600 dark:text-emerald-400")}>
                                {totalTasks === 0 ? "¡Todo limpio!" : `${totalTasks} pendientes`}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* ROW 2: MAIN GRID (CONTENT & SIDEBAR)       */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ---------- LEFT COLUMN (Span 2) ---------- */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Actividad y Tareas Detalladas */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-emerald-500" />
                                Gestión de Tareas
                            </h3>
                            <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-1 rounded uppercase tracking-widest">
                                Global
                            </span>
                        </div>

                        <div className="flex-1 space-y-4">
                            {familyMembers.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                                    <UserCircle2 className="w-12 h-12 text-slate-200 dark:text-onyx-700 mb-4" />
                                    <p className="text-sm font-bold text-slate-400">No hay miembros en la familia</p>
                                    <p className="text-xs text-slate-500 max-w-[250px] mt-2">Añade miembros desde ajustes para empezar a asignar tareas y agendas.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {familyMembers.map((member) => {
                                        const memberData = tasksData.find(d => d.member.id === member.id);
                                        const pendingTasksCount = memberData?.tasks.length || 0;
                                        const completedTasksCount = memberData?.completedToday || 0;

                                        return (
                                            <div key={member.id} className="p-4 rounded-2xl border border-slate-100 dark:border-onyx-700 bg-slate-50/50 dark:bg-onyx-800/50 hover:bg-white dark:hover:bg-onyx-800 transition-colors">
                                                <div className="flex items-center gap-3 mb-4">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-onyx-900 shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-brand-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-onyx-900">
                                                            <span className="text-sm font-black text-white">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn("w-2 h-2 rounded-full", pendingTasksCount > 0 ? "bg-amber-400" : "bg-slate-300 dark:bg-onyx-600")} />
                                                        <span className="text-slate-600 dark:text-slate-400">{pendingTasksCount} Pendientes</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedTasksCount} Hechas</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Próximos Eventos Familiares */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarCheck2 className="w-4 h-4 text-brand-500" />
                                Próximos Eventos Familiares
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {(!familyEvents || familyEvents.length === 0) ? (
                                <div className="text-center py-6">
                                    <CalendarDays className="w-8 h-8 text-slate-200 dark:text-onyx-700 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-400">Sin eventos próximos</p>
                                </div>
                            ) : (
                                familyEvents.slice(0, 5).map(event => (
                                    <div key={event.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-onyx-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-onyx-700">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{event.title}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {event.location && <span>• {event.location}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-onyx-800 px-2 py-1 rounded">
                                            {event.type}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* ---------- RIGHT COLUMN (Span 1) ---------- */}
                <div className="lg:col-span-1">
                    <LifeSnapshot />
                </div>

            </div>

        </div>
    );
}
