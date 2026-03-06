import React from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { ChevronDown } from 'lucide-react';
import AuraCommandBar from './AuraCommandBar';

interface IntelligenceHeaderProps {
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    onNavigate?: (app: string, tab?: string) => void;
}


export default function IntelligenceHeader({
    selectedDate,
    onDateChange,
    onNavigate,
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

            {/* Center: Aura Command Bar */}
            <div className="flex-1 max-w-2xl px-4 hidden md:block">
                <AuraCommandBar onNavigate={onNavigate} />
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
