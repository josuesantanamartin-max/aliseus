import React from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { ChevronDown } from 'lucide-react';
import { Wallet, Utensils, Plane, Users, TrendingUp } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { AuraTheme } from './AuraThemeBar';

interface IntelligenceHeaderProps {
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    activeTheme: AuraTheme;
    onThemeChange: (theme: AuraTheme) => void;
}

const THEMES = [
    { id: 'finances' as const, label: 'Finanzas', icon: Wallet },
    { id: 'kitchen' as const, label: 'Cocina', icon: Utensils },
    { id: 'travel' as const, label: 'Viajes', icon: Plane },
    { id: 'family' as const, label: 'Familia', icon: Users },
    { id: 'investments' as const, label: 'Inversión', icon: TrendingUp },
];

export default function IntelligenceHeader({
    selectedDate,
    onDateChange,
    activeTheme,
    onThemeChange,
}: IntelligenceHeaderProps) {
    const { userProfile } = useUserStore();
    const firstName = userProfile?.full_name?.split(' ')[0] || 'Usuario';

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
        <section className="w-full flex items-center justify-between gap-4 pb-4 pt-2">
            {/* Left: Greeting */}
            <div className="flex-shrink-0">
                <span className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 tracking-tight">
                    Hola, <span className="font-semibold">{firstName}</span>
                </span>
            </div>

            {/* Center: Theme Tabs (compact) */}
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                {THEMES.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTheme === id;
                    return (
                        <button
                            key={id}
                            onClick={() => onThemeChange(id)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 whitespace-nowrap border',
                                isActive
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-md shadow-indigo-300/40 dark:shadow-indigo-900/40 scale-105'
                                    : 'bg-white dark:bg-onyx-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-onyx-700 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Right: Date Selector (only shown in finance view) */}
            {selectedDate && onDateChange ? (
                <div className="flex-shrink-0 flex items-center bg-white dark:bg-onyx-900 border border-slate-200 dark:border-onyx-800 rounded-xl px-3 py-1.5 shadow-sm gap-1">
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
            ) : (
                // Spacer to keep greeting left-aligned when no date selector
                <div className="flex-shrink-0 w-0" />
            )}
        </section>
    );
}
