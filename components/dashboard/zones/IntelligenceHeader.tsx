import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { ChevronDown, Calendar } from 'lucide-react';
import AuraCommandBar from './AuraCommandBar';
import { motion, AnimatePresence } from 'framer-motion';

interface IntelligenceHeaderProps {
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    onNavigate?: (app: string, tab?: string) => void;
    activeModule?: string;
}


export default function IntelligenceHeader({
    selectedDate,
    onDateChange,
    onNavigate,
    activeModule,
}: IntelligenceHeaderProps) {
    const { userProfile } = useUserStore();
    const firstName = userProfile?.full_name?.split(' ')[0] || 'Usuario';

    // UI state for custom date picker
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMonthSelect = (m: number) => {
        if (!selectedDate || !onDateChange) return;
        const d = new Date(selectedDate);
        d.setMonth(m);
        onDateChange(d);
        setIsDatePickerOpen(false);
    };

    const handleYearSelect = (y: number) => {
        if (!selectedDate || !onDateChange) return;
        const d = new Date(selectedDate);
        d.setFullYear(y);
        onDateChange(d);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

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
                <AuraCommandBar onNavigate={onNavigate} activeModule={activeModule} />
            </div>

            {/* Right: Custom Date Selector (only shown in finance view) */}
            {selectedDate && onDateChange ? (
                <div className="flex-shrink-0 relative" ref={datePickerRef}>
                    <button
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-300 ${isDatePickerOpen
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 shadow-md shadow-blue-100 dark:shadow-blue-950/50 text-blue-700 dark:text-blue-400'
                            : 'bg-white/80 dark:bg-aliseus-900/80 backdrop-blur-md border-slate-200/50 dark:border-aliseus-700/50 hover:bg-white dark:hover:bg-aliseus-800 hover:border-blue-300 dark:hover:border-blue-800/50 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow'
                            }`}
                    >
                        <Calendar className="w-4 h-4 opacity-70" />
                        <span className="text-sm font-bold capitalize">
                            {new Date(2000, selectedDate.getMonth(), 1).toLocaleString('es-ES', { month: 'long' })} {selectedDate.getFullYear()}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-300 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDatePickerOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-aliseus-900 rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100 dark:border-aliseus-800 p-4 z-50 overflow-hidden"
                            >
                                {/* Year Selector Header */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-aliseus-800">
                                    {years.map(y => (
                                        <button
                                            key={y}
                                            onClick={() => handleYearSelect(y)}
                                            className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${selectedDate.getFullYear() === y
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>

                                {/* Month Grid */}
                                <div className="grid grid-cols-3 gap-2">
                                    {months.map(m => {
                                        const isSelected = selectedDate.getMonth() === m;
                                        return (
                                            <button
                                                key={m}
                                                onClick={() => handleMonthSelect(m)}
                                                className={`py-2 px-1 text-xs font-bold capitalize rounded-xl transition-all duration-200 ${isSelected
                                                    ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400'
                                                    }`}
                                            >
                                                {new Date(2000, m, 1).toLocaleString('es-ES', { month: 'short' }).replace('.', '')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                // Spacer to keep greeting left-aligned when no date selector
                <div className="flex-shrink-0 w-0" />
            )}
        </section>
    );
}
