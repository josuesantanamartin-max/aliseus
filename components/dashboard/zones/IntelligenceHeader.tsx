import React from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { Bell, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface IntelligenceHeaderProps {
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    onNotificationsClick?: () => void;
}

export default function IntelligenceHeader({
    selectedDate,
    onDateChange,
    onNotificationsClick,
}: IntelligenceHeaderProps) {
    const { userProfile } = useUserStore();
    const { unreadCount } = useNotificationStore();

    const firstName = userProfile?.full_name?.split(' ')[0] || 'Usuario';
    const unread = unreadCount();

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!selectedDate || !onDateChange) return;
        const d = new Date(selectedDate);
        d.setMonth(parseInt(e.target.value));
        onDateChange(d);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!selectedDate || !onDateChange) return;
        const d = new Date(selectedDate);
        d.setFullYear(parseInt(e.target.value));
        onDateChange(d);
    };

    return (
        <section className="w-full flex items-center justify-between pb-4 pt-2">
            {/* Left: Greeting */}
            <div>
                <span className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 tracking-tight">
                    Hola, <span className="font-semibold">{firstName}</span>
                </span>
            </div>

            {/* Right: Date Selector + Buttons */}
            <div className="flex items-center gap-3">
                {/* Month / Year Selector — only shown when a date is provided */}
                {selectedDate && onDateChange && (
                    <div className="flex items-center bg-white dark:bg-onyx-900 border border-slate-200 dark:border-onyx-800 rounded-xl px-3 py-1.5 shadow-sm gap-1">
                        <select
                            value={selectedDate.getMonth()}
                            onChange={handleMonthChange}
                            className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer appearance-none capitalize"
                        >
                            {Array.from({ length: 12 }, (_, i) => {
                                const d = new Date(2000, i, 1);
                                return (
                                    <option key={i} value={i} className="capitalize">
                                        {d.toLocaleString('es-ES', { month: 'long' })}
                                    </option>
                                );
                            })}
                        </select>
                        <span className="text-slate-300 dark:text-onyx-600 mx-1">/</span>
                        <select
                            value={selectedDate.getFullYear()}
                            onChange={handleYearChange}
                            className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer appearance-none"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 pointer-events-none" />
                    </div>
                )}

                {/* Notifications */}
                <button
                    onClick={onNotificationsClick}
                    className="relative p-2.5 rounded-full text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-onyx-800 dark:hover:bg-onyx-700 transition-colors"
                    title="Notificaciones"
                >
                    <Bell className="w-4 h-4" />
                    {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-black flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>

                {/* Settings — omitted: already accessible from sidebar */}
            </div>
        </section>
    );
}
