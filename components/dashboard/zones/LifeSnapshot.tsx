import React, { useMemo } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Plane, Calendar, Activity, CheckCircle2, User, ChevronRight, Navigation, History as LucideHistory } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '../../ui/Button';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LifeSnapshotProps {
    hideActivity?: boolean;
    hideNextTrip?: boolean;
    hidePayments?: boolean;
}

export default function LifeSnapshot({ hideActivity, hideNextTrip, hidePayments }: LifeSnapshotProps) {
    const { trips } = useLifeStore();
    const { debts, transactions, goals } = useFinanceStore();

    // 4A: Next Trip
    const nextTrip = useMemo(() => {
        const today = new Date();
        return trips
            .filter(t => new Date(t.startDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
    }, [trips]);

    // 4B: Upcoming Payments
    const upcomingPayments = useMemo(() => {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

        return debts
            .filter(d => {
                if (!d.dueDate) return false;
                const parts = d.dueDate.split('-');
                let dDate = new Date(d.dueDate);
                if (parts.length === 1) {
                    dDate = new Date(today.getFullYear(), today.getMonth(), Number(parts[0]));
                    if (dDate < today) dDate.setMonth(dDate.getMonth() + 1);
                } else if (parts.length === 2 && d.dueDate.includes('-')) {
                    dDate = new Date(`${today.getFullYear()}-${parts[1]}-${parts[0]}`);
                }
                return dDate >= today && dDate <= nextMonth;
            })
            .sort((a, b) => {
                const aParts = a.dueDate!.split('-');
                const bParts = b.dueDate!.split('-');
                const getObj = (parts: string[]) => {
                    if (parts.length === 1) return { d: Number(parts[0]), m: today.getMonth() };
                    if (parts.length === 2) return { d: Number(parts[0]), m: Number(parts[1]) - 1 };
                    return { d: new Date(a.dueDate!).getDate(), m: new Date(a.dueDate!).getMonth() };
                };
                const aObj = getObj(aParts);
                const bObj = getObj(bParts);

                const dA = new Date(today.getFullYear(), aObj.m, aObj.d).getTime();
                const dB = new Date(today.getFullYear(), bObj.m, bObj.d).getTime();
                return dA - dB;
            })
            .slice(0, 6);
    }, [debts]);

    // 4C: Family Activity Feed (Mocked logic intersecting different domains)
    const recentActivity = useMemo(() => {
        const activities: Array<{
            id: string;
            name: string;
            action: string;
            time: string;
            icon: React.ElementType;
            color: string;
            bg: string;
        }> = [];

        // Add recent transactions
        transactions.slice(0, 3).forEach(t => {
            activities.push({
                id: `tx-${t.id}`,
                name: 'Josué', // Mock user
                action: `añadió un gasto de ${t.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ en ${t.category}`,
                time: t.date,
                icon: Activity,
                color: 'text-brand-500',
                bg: 'bg-brand-50'
            });
        });

        // Sort by date descending
        return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
    }, [transactions]);


    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-aliseus-800/30 rounded-2xl p-6 border border-slate-100 dark:border-aliseus-800 shadow-sm">

            <div className="flex items-center justify-between pointer-events-none mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Panorama de Vida</h2>
            </div>

            <div className="flex flex-col gap-8">
                {/* --- Zone 1: Next Trip --- */}
                {!hideNextTrip && (
                    nextTrip ? (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Próximo Viaje</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-aliseus-800 px-2 py-0.5 rounded">
                                    Confirmado
                                </span>
                            </div>

                            <div className="group relative">
                                <div className="relative h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-aliseus-700 shadow-sm">
                                    {/* Destination placeholder */}
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                                        {Math.ceil((new Date(nextTrip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex flex-col">
                                        <span className="text-white text-lg font-black tracking-tight drop-shadow-md">
                                            {nextTrip.destination}
                                        </span>
                                        <div className="flex items-center gap-3 mt-1 opacity-90">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-white">
                                                <Calendar className="w-3 h-3 text-brand-300" />
                                                {new Date(nextTrip.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-white">
                                                <Navigation className="w-3 h-3 text-brand-300" />
                                                {nextTrip.country || 'Destino'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Budget Inline Widget */}
                            <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100/50 dark:border-brand-500/10 flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Ahorrado</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{(nextTrip.budget * 0.75).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                                        <span className="text-[10px] font-bold text-slate-400">/{nextTrip.budget.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 w-24">
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">75%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-brand-100 dark:bg-aliseus-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500 rounded-full" style={{ width: '75%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 p-4 rounded-xl border border-dashed border-slate-200 dark:border-aliseus-700 items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-aliseus-800/50 transition-colors group">
                            <Plane className="w-5 h-5 text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Aún no hay viajes en el horizonte</span>
                            <span className="text-xs text-brand-500 font-medium">¿Empezamos a soñar? &rarr;</span>
                        </div>
                    )
                )}

                {/* 4B: Upcoming Payments Calendar */}
                {!hidePayments && (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-rose-500" /> Pagos a 30 días
                        </h3>

                        <div className="flex flex-col gap-2">
                            {upcomingPayments.length > 0 ? upcomingPayments.map(payment => (
                                <div key={payment.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-aliseus-800/50 last:border-0 hover:px-2 transition-all cursor-pointer group rounded-sm hover:bg-white dark:hover:bg-aliseus-900">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold w-10 text-slate-400 dark:text-slate-500 group-hover:text-rose-500 transition-colors">
                                            {payment.dueDate?.substring(0, 5)}
                                        </span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{payment.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {(payment.minPayment || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            )) : (
                                <span className="text-sm text-slate-500">No hay pagos próximos.</span>
                            )}
                        </div>
                    </div>
                )}

                {/* --- Zone 2: Family Activity --- */}
                {!hideActivity && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right duration-500 delay-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LucideHistory className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Actividad Familiar</h3>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:bg-brand-50">
                                Ver todos
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {recentActivity.map((activity, i) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={activity.id} className="group flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-aliseus-900 border border-slate-100 dark:border-aliseus-800 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-aliseus-800/80 hover:border-brand-200 dark:hover:border-brand-900/40">
                                        <div className={cn("mt-0.5 p-2 rounded-xl bg-slate-50 dark:bg-aliseus-800 group-hover:scale-110 transition-transform", activity.color)}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {activity.name}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                                    {new Date(activity.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 leading-relaxed">
                                                {activity.action}
                                            </p>
                                        </div>
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
