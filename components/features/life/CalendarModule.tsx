
import React, { useState, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, CreditCard, Utensils,
    CheckCircle2, Clock, Target, Bell, Plus, Info, ArrowUpRight, Flame, Zap,
    Star, MapPin, Coffee, Moon, Sun, TrendingUp, AlertCircle, ArrowRight
} from 'lucide-react';
import { MOCK_TRANSACTIONS, MOCK_DEBTS, MOCK_GOALS } from '../../../data/seeds/financeSeed';
import { Language, Task, Reminder, CalendarEvent, WeeklyPlanState, MealTime, Recipe, Goal } from '../../../types';
import { useCurrency } from '../../../hooks/useCurrency';

interface CalendarModuleProps {
    onMenuClick?: () => void;
    language: Language;
    weeklyPlan: WeeklyPlanState;
    onNavigate?: (app: string, tab?: string) => void;
}

type EventType = 'FINANCE' | 'KITCHEN' | 'LIFE' | 'GOAL';

const CAL_TEXTS = {
    ES: {
        weekdays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        today: 'Hoy',
        noEvents: 'Horizonte despejado. No tienes pagos ni tareas para este día.',
        addEvent: 'Añadir Recordatorio',
        finance: 'Próximos Pagos y Facturas',
        kitchen: 'Menú del Día',
        goals: 'Metas de Ahorro',
        agenda: 'Aliseus Agenda',
        subtitle: 'Línea de tiempo unificada',
        priority: 'Impacto',
        actionFinance: 'Gestionar Pago',
        actionGoal: 'Ver Progreso',
        actionKitchen: 'Ver Receta'
    },
    EN: {
        weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        today: 'Today',
        noEvents: 'Clear horizon. No payments or tasks for this day.',
        addEvent: 'Add Reminder',
        finance: 'Upcoming Payments',
        kitchen: 'Daily Menu',
        goals: 'Savings Goals',
        agenda: 'Aliseus Agenda',
        subtitle: 'Unified timeline',
        priority: 'Impact',
        actionFinance: 'Manage Payment',
        actionGoal: 'View Progress',
        actionKitchen: 'View Recipe'
    },
    FR: {
        weekdays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        today: 'Aujourd\'hui',
        noEvents: 'Horizon dégagé. Aucun paiement ni tÃ¢che pour cette journée.',
        addEvent: 'Ajouter Rappel',
        finance: 'Paiements Ã  venir',
        kitchen: 'Menu du jour',
        goals: 'Objectifs d\'épargne',
        agenda: 'Aliseus Agenda',
        subtitle: 'Ligne du temps unifiée',
        priority: 'Impact',
        actionFinance: 'Gérer le paiement',
        actionGoal: 'Voir progrÃ¨s',
        actionKitchen: 'Voir recette'
    }
};

const CalendarModule: React.FC<CalendarModuleProps> = ({ language, weeklyPlan, onNavigate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const t = CAL_TEXTS[language];
    const { formatPrice } = useCurrency();

    const events = useMemo(() => {
        const generatedEvents: CalendarEvent[] = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // 1. FINANCE
        const subscriptions = [
            { name: 'Netflix Premium', amount: 14.99, day: 1, priority: 'LOW' },
            { name: 'Spotify Duo', amount: 9.99, day: 2, priority: 'LOW' },
            { name: 'Internet Fibra', amount: 45.00, day: 5, priority: 'HIGH' },
            { name: 'Gimnasio', amount: 35.00, day: 1, priority: 'MEDIUM' },
            { name: 'Seguro Hogar', amount: 120.00, day: 18, priority: 'HIGH' },
        ];

        subscriptions.forEach(sub => {
            generatedEvents.push({
                id: `sub-${sub.name}`,
                date: `${year}-${String(month + 1).padStart(2, '0')}-${String(sub.day).padStart(2, '0')}`,
                title: sub.name,
                type: 'FINANCE',
                amount: sub.amount,
                details: 'Suscripción mensual',
                priority: sub.priority as any,
                icon: CreditCard,
                category: 'Streaming/Ocio',
                targetApp: 'finance',
                targetTab: 'transactions'
            });
        });

        MOCK_DEBTS.forEach(debt => {
            const day = parseInt(debt.dueDate);
            if (day) {
                generatedEvents.push({
                    id: `debt-${debt.id}`,
                    date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                    title: `Pago ${debt.name}`,
                    type: 'FINANCE',
                    amount: debt.minPayment,
                    details: 'Cuota de préstamo',
                    priority: 'HIGH',
                    icon: AlertCircle,
                    category: 'Deuda Bancaria',
                    targetApp: 'finance',
                    targetTab: 'debts'
                });
            }
        });

        // 2. GOALS
        MOCK_GOALS.forEach(goal => {
            if (goal.deadline) {
                generatedEvents.push({
                    id: `goal-${goal.id}`,
                    date: goal.deadline,
                    title: goal.name,
                    type: 'GOAL',
                    details: `Meta: ${formatPrice(goal.targetAmount)}`,
                    priority: 'MEDIUM',
                    icon: Target,
                    category: 'Ahorro',
                    targetApp: 'finance',
                    targetTab: 'goals'
                });
            }
        });

        // 3. KITCHEN
        Object.entries(weeklyPlan).forEach(([dateKey, meals]) => {
            const dailyMeals = meals as Record<MealTime, Recipe[]>;
            const config = {
                breakfast: { label: 'Desayuno', icon: Coffee },
                lunch: { label: 'Almuerzo', icon: Sun },
                dinner: { label: 'Cena', icon: Moon }
            };

            (Object.keys(config) as MealTime[]).forEach(time => {
                if (dailyMeals[time] && dailyMeals[time].length > 0) {
                    const items = dailyMeals[time];
                    // Separator used is ';;' to be parsed in display logic
                    const detailsText = items.map((r, i) => items.length > 1 ? `${i + 1}Âº ${r.name}` : r.name).join(';;');

                    generatedEvents.push({
                        id: `kitchen-${dateKey}-${time}`,
                        date: dateKey,
                        title: config[time].label,
                        type: 'KITCHEN',
                        details: detailsText,
                        priority: 'LOW',
                        icon: config[time].icon,
                        category: 'Nutrición',
                        targetApp: 'life',
                        targetTab: 'kitchen-recipes'
                    });
                }
            });
        });

        return generatedEvents;
    }, [currentDate, weeklyPlan, formatPrice]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, firstDay: adjustedFirstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

    const selectedDateEvents = events.filter(e => e.date && isSameDay(new Date(e.date), selectedDate));
    const selectedDateStr = selectedDate.toLocaleDateString(language === 'ES' ? 'es-ES' : language === 'FR' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });

    const handleCardClick = (ev: CalendarEvent) => {
        if (onNavigate && ev.targetApp) {
            onNavigate(ev.targetApp, ev.targetTab);
        }
    };

    return (
        <div className="flex h-full flex-col lg:flex-row bg-white overflow-hidden animate-fade-in">
            {/* GRID PRINCIPAL */}
            <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-white">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter capitalize flex items-center gap-4">
                            {monthName}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-widest">{t.subtitle}</p>
                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{events.length} Eventos Aliseus</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 shadow-inner">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-600 active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 hover:bg-white hover:shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 transition-all">{t.today}</button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-600 active:scale-90"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                        <button className="p-4 bg-[#111] text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"><Plus className="w-6 h-6" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-6 border-b border-gray-50 pb-4">
                    {t.weekdays.map(day => (
                        <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2 flex-1 min-h-[500px]">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-gray-50/20 rounded-2xl"></div>
                    ))}

                    {Array.from({ length: days }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const dayEvents = events.filter(e => e.date === dateStr);
                        const isToday = isSameDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum), new Date());
                        const isSelected = isSameDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum), selectedDate);

                        return (
                            <div
                                key={dayNum}
                                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum))}
                                className={`relative bg-gray-50/30 p-2 cursor-pointer transition-all flex flex-col group min-h-[100px] rounded-3xl border border-transparent hover:border-gray-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-900 bg-white shadow-xl scale-105 z-10' : 'hover:bg-white'}`}
                            >
                                <div className="flex justify-center mb-2">
                                    <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-full transition-all duration-500 ${isToday ? 'bg-orange-500 text-white shadow-md' : isSelected ? 'bg-blue-950 text-white' : 'text-gray-400 group-hover:text-gray-900'}`}>
                                        {dayNum}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col gap-1 items-center justify-start overflow-hidden px-1">
                                    {dayEvents.slice(0, 3).map((ev, idx) => (
                                        <div key={idx} className={`w-full h-1.5 rounded-full ${ev.type === 'FINANCE' ? 'bg-blue-500' : ev.type === 'KITCHEN' ? 'bg-emerald-500' : ev.type === 'GOAL' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="w-1 h-1 bg-gray-300 rounded-full mt-0.5"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* PANEL DE HORIZONTE DIARIO */}
            <div className="w-full lg:w-[400px] bg-white border-l border-gray-100 flex flex-col h-full shadow-2xl lg:shadow-none z-20 relative">
                <div className="p-8 border-b border-gray-100 flex flex-col items-center text-center">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{t.agenda}</h3>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter capitalize">{selectedDateStr}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {selectedDateEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center pb-10">
                            <div className="p-6 bg-gray-50 rounded-[2rem] mb-4"><CalendarIcon className="w-10 h-10 opacity-20" /></div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60 max-w-[150px]">{t.noEvents}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* FINANZAS: Pagos */}
                            {selectedDateEvents.some(e => e.type === 'FINANCE') && (
                                <div className="space-y-4 animate-slide-up">
                                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">{t.finance}</h4>
                                    {selectedDateEvents.filter(e => e.type === 'FINANCE').map(ev => (
                                        <div key={ev.id} onClick={() => handleCardClick(ev)} className="bg-blue-50 p-5 rounded-[1.5rem] border border-blue-100 cursor-pointer hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm"><ev.icon className="w-4 h-4" /></div>
                                                    <span className="font-bold text-sm text-gray-900">{ev.title}</span>
                                                </div>
                                                <span className="font-black text-blue-900 text-sm">-{ev.amount?.toFixed(2)}â‚¬</span>
                                            </div>
                                            <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wide pl-12">{ev.details}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* KITCHEN: Nutrición */}
                            {selectedDateEvents.some(e => e.type === 'KITCHEN') && (
                                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em] border-b border-emerald-100 pb-2">{t.kitchen}</h4>
                                    {selectedDateEvents.filter(e => e.type === 'KITCHEN').map(ev => (
                                        <div key={ev.id} onClick={() => handleCardClick(ev)} className="bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-100 cursor-pointer hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm"><ev.icon className="w-4 h-4" /></div>
                                                <span className="font-bold text-sm text-gray-900">{ev.title}</span>
                                            </div>
                                            <div className="pl-11 space-y-1">
                                                {ev.details?.split(';;').map((line, i) => (
                                                    <p key={i} className="text-[11px] font-bold text-emerald-700 leading-tight truncate">{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* GOALS & OTHERS */}
                            {selectedDateEvents.some(e => e.type === 'GOAL') && (
                                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.2em] border-b border-amber-100 pb-2">{t.goals}</h4>
                                    {selectedDateEvents.filter(e => e.type === 'GOAL').map(ev => (
                                        <div key={ev.id} onClick={() => handleCardClick(ev)} className="bg-amber-50 p-5 rounded-[1.5rem] border border-amber-100 cursor-pointer hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl text-amber-600 shadow-sm"><Target className="w-4 h-4" /></div>
                                                <div>
                                                    <span className="font-bold text-sm text-gray-900 block">{ev.title}</span>
                                                    <span className="text-[10px] font-medium text-amber-600">{ev.details}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100">
                    <button className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> {t.addEvent}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarModule;
