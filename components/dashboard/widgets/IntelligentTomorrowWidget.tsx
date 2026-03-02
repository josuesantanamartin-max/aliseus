import React, { useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useLifeStore } from '../../../store/useLifeStore';
import { DashboardDataProps } from '../WidgetRegistry';
import { Sunrise, Calendar, Utensils, CreditCard, ChevronRight, AlertCircle, TrendingUp } from 'lucide-react';

const IntelligentTomorrowWidget: React.FC<DashboardDataProps> = ({ onNavigate }) => {
    const { debts = [] } = useFinanceStore();
    const { weeklyPlans = [], trips = [] } = useLifeStore();

    // Today and tomorrow dates for filtering
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const todayDayOfWeek = today.getDay();
    const currentDayMonth = today.getDate();
    const tomorrowDayMonth = tomorrow.getDate();

    // 1. Finance: Payments due today or tomorrow
    const upcomingPayments = useMemo(() => {
        return debts.filter(d => {
            if (!d.dueDate) return false;
            const dueDay = parseInt(d.dueDate, 10);
            return dueDay === currentDayMonth || dueDay === tomorrowDayMonth;
        });
    }, [debts, currentDayMonth, tomorrowDayMonth]);

    // 2. Kitchen: Today's Menu
    const todaysMenu = useMemo(() => {
        if (!weeklyPlans || weeklyPlans.length === 0) return null;
        const currentPlan = weeklyPlans[0];

        // Find meals for today's day of week or specific date
        const mealsToday = currentPlan.meals?.filter(m => m.dayOfWeek === todayDayOfWeek || m.date === todayStr) || [];

        return mealsToday.length > 0 ? mealsToday : null;
    }, [weeklyPlans, todayDayOfWeek, todayStr]);

    // 3. Life: Agenda & Trips (simplified for this widget)
    const upcomingTrips = useMemo(() => {
        return trips.filter((t: any) => {
            if (t.status !== 'UPCOMING') return false;
            const tripDate = new Date(t.startDate);
            const daysDiff = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            return daysDiff >= 0 && daysDiff <= 7; // Trips in the next 7 days
        });
    }, [trips, today]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-onyx-900 rounded-[2rem] border border-onyx-100 dark:border-onyx-800 p-6 md:p-8 shadow-sm relative overflow-hidden group/widget hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-bl from-cyan-50/50 dark:from-cyan-900/10 to-transparent opacity-0 group-hover/widget:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500 dark:from-cyan-400 dark:to-teal-300 tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl shadow-inner group-hover/widget:rotate-12 transition-transform">
                        <Sunrise className="w-6 h-6" />
                    </div>
                    Mañana Inteligente
                </h3>
            </div>

            <p className="text-sm font-bold text-onyx-400 dark:text-onyx-500 mb-6 uppercase tracking-widest relative z-10">
                {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)}
            </p>

            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">

                {/* Finance Section */}
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-800/20 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer" onClick={() => onNavigate('finance', 'debts')}>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100 mb-2">Pagos Inminentes</h4>
                            {upcomingPayments.length > 0 ? (
                                <ul className="space-y-2">
                                    {upcomingPayments.map(debt => (
                                        <li key={debt.id} className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-rose-700 dark:text-rose-300">{debt.name}</span>
                                            <span className="font-black text-rose-600 dark:text-rose-400">{formatCurrency(debt.remainingBalance)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-rose-600/70 dark:text-rose-400/70 font-medium">No hay pagos programados para hoy ni mañana.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Kitchen Section */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer" onClick={() => onNavigate('life', 'kitchen-dashboard')}>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">Menú del Día</h4>
                            {todaysMenu ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {todaysMenu.map((meal, idx) => (
                                        <div key={idx} className="bg-white/60 dark:bg-onyx-800/60 p-2 rounded-lg border border-emerald-100/50 dark:border-emerald-800/30">
                                            <span className="text-[10px] font-black uppercase text-emerald-600/70 dark:text-emerald-400/70 block mb-0.5">
                                                {meal.type === 'breakfast' ? 'Desayuno' : meal.type === 'lunch' ? 'Comida' : 'Cena'}
                                            </span>
                                            <span className="text-xs font-bold text-onyx-800 dark:text-onyx-200 line-clamp-1">{meal.recipeName}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">No hay menú planificado para hoy.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Life Section */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer" onClick={() => onNavigate('life', 'travel')}>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">Eventos y Viajes</h4>
                            {upcomingTrips.length > 0 ? (
                                <ul className="space-y-2">
                                    {upcomingTrips.map((trip: any, idx) => {
                                        const tripDate = new Date(trip.startDate);
                                        const daysDiff = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                                        return (
                                            <li key={idx} className="flex justify-between items-center text-xs">
                                                <span className="font-medium text-indigo-700 dark:text-indigo-300">Viaje a {trip.destination}</span>
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                                    {daysDiff === 0 ? 'Hoy' : daysDiff === 1 ? 'Mañana' : `En ${daysDiff} días`}
                                                </span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">Agenda despejada para los próximos días.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IntelligentTomorrowWidget;
