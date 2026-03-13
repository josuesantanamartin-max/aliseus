import React from 'react';
import { Search as SearchIcon, Calendar as CalendarIcon, X as XIcon, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Account, CategoryStructure } from '../../../../../types';

interface TransactionFiltersProps {
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    filterDate: Date;
    setFilterDate: (d: Date) => void;
    filterCategory: string;
    setFilterCategory: (c: string) => void;
    filterSubCategory: string;
    setFilterSubCategory: (s: string) => void;
    filterType: '' | 'INCOME' | 'EXPENSE';
    setFilterType: (t: '' | 'INCOME' | 'EXPENSE') => void;
    filterAccountId: string;
    setFilterAccountId: (id: string) => void;
    showRecurringOnly: boolean;
    setShowRecurringOnly: (b: boolean) => void;
    viewMode: 'MONTH' | 'YEAR';
    setViewMode: (v: 'MONTH' | 'YEAR') => void;
    categories: CategoryStructure[];
    accounts: Account[];
    clearFilters: () => void;
    activeFiltersCount: number;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    searchTerm, setSearchTerm, filterDate, setFilterDate, filterCategory, setFilterCategory,
    filterSubCategory, setFilterSubCategory, filterType, setFilterType, filterAccountId, setFilterAccountId,
    showRecurringOnly, setShowRecurringOnly, viewMode, setViewMode, categories, accounts, clearFilters, activeFiltersCount
}) => {
    const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
    const datePickerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMonthSelect = (m: number) => {
        const d = new Date(filterDate);
        d.setMonth(m);
        setFilterDate(d);
        setIsDatePickerOpen(false);
    };

    const handleYearSelect = (y: number) => {
        const d = new Date(filterDate);
        d.setFullYear(y);
        setFilterDate(d);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    const availableSubCategories = categories.find(c => c.name === filterCategory)?.subCategories || [];

    return (
        <div className="mb-12 relative w-full">
            {/* Background elements for depth */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-200/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-200/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Unified Filter Bar with Real Glassmorphism */}
            <div className="bg-white/70 dark:bg-onyx-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[40px] p-4 shadow-2xl shadow-cyan-900/5 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-4">

                    {/* Search Field - Integrated into the glass bar */}
                    <div className="relative flex-1 group/search w-full lg:w-auto">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-onyx-400 group-focus-within/search:text-cyan-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar movimientos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white/50 dark:bg-onyx-800/50 border border-onyx-100/50 dark:border-white/5 rounded-3xl text-[13px] font-bold text-cyan-950 dark:text-white placeholder:text-onyx-300 focus:bg-white dark:focus:bg-onyx-800 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/30 outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Controls Cluster */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">

                        {/* Premium Date Selector */}
                        <div className="relative" ref={datePickerRef}>
                            <button
                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-500 group/date ${isDatePickerOpen
                                    ? 'bg-cyan-600 border-cyan-500 shadow-xl shadow-cyan-600/20 text-white'
                                    : 'bg-white dark:bg-onyx-800 border-onyx-100/50 dark:border-white/5 hover:border-cyan-500/40 hover:shadow-lg text-onyx-600 dark:text-onyx-300 shadow-sm'
                                    }`}
                            >
                                <CalendarIcon className={`w-4 h-4 transition-colors ${isDatePickerOpen ? 'text-white' : 'text-cyan-600'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                    {viewMode === 'MONTH'
                                        ? filterDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
                                        : filterDate.getFullYear()
                                    }
                                </span>
                                <ChevronDownIcon className={`w-3.5 h-3.5 opacity-50 transition-transform duration-500 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isDatePickerOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className="absolute right-0 top-full mt-4 w-72 bg-white/95 dark:bg-onyx-900/95 backdrop-blur-xl rounded-[32px] shadow-3xl shadow-cyan-900/10 border border-onyx-100/50 dark:border-white/10 p-6 z-[100] overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-onyx-50 dark:border-white/5">
                                            {years.map(y => (
                                                <button
                                                    key={y}
                                                    onClick={() => handleYearSelect(y)}
                                                    className={`text-[10px] font-black px-4 py-2 rounded-2xl transition-all ${filterDate.getFullYear() === y
                                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                                                        : 'text-onyx-400 dark:text-onyx-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                                                        }`}
                                                >
                                                    {y}
                                                </button>
                                            ))}
                                        </div>

                                        {viewMode === 'MONTH' && (
                                            <div className="grid grid-cols-3 gap-3">
                                                {months.map(m => {
                                                    const isSelected = filterDate.getMonth() === m;
                                                    return (
                                                        <button
                                                            key={m}
                                                            onClick={() => handleMonthSelect(m)}
                                                            className={`py-3 px-1 text-[10px] font-black capitalize rounded-2xl transition-all duration-300 ${isSelected
                                                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                                                                : 'text-onyx-600 dark:text-onyx-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-300'
                                                                }`}
                                                        >
                                                            {new Date(2000, m, 1).toLocaleString('es-ES', { month: 'short' }).replace('.', '')}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {viewMode === 'YEAR' && (
                                            <div className="py-6 text-center">
                                                <p className="text-[10px] font-black text-onyx-400/60 uppercase tracking-[0.25em]">Año Seleccionado</p>
                                                <p className="text-4xl font-black text-cyan-950 dark:text-white mt-2 tracking-tighter">{filterDate.getFullYear()}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* View Mode Switcher - Premium pill style */}
                        <div className="flex bg-onyx-100/30 dark:bg-white/5 p-1 rounded-[22px] border border-onyx-100/50 dark:border-white/5">
                            <button
                                onClick={() => setViewMode('MONTH')}
                                className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${viewMode === 'MONTH' ? 'bg-white dark:bg-onyx-800 shadow-lg text-cyan-900 dark:text-white scale-[1.02]' : 'text-onyx-400 hover:text-onyx-600'}`}
                            >
                                Mes
                            </button>
                            <button
                                onClick={() => setViewMode('YEAR')}
                                className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${viewMode === 'YEAR' ? 'bg-white dark:bg-onyx-800 shadow-lg text-cyan-900 dark:text-white scale-[1.02]' : 'text-onyx-400 hover:text-onyx-600'}`}
                            >
                                Año
                            </button>
                        </div>

                        {/* Dropdown Select Filters - Refined Style */}
                        <div className="flex items-center gap-2">
                            {/* Category Selector */}
                            <div className="relative group/sel">
                                <select
                                    value={filterCategory}
                                    onChange={(e) => { setFilterCategory(e.target.value); setFilterSubCategory(''); }}
                                    className={`appearance-none pl-6 pr-10 py-4 rounded-3xl border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all duration-300 ${filterCategory ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-onyx-800 border-onyx-100/50 dark:border-white/5 text-onyx-500 hover:border-cyan-500/30 shadow-sm'}`}
                                >
                                    <option value="">Categoría</option>
                                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none" />
                            </div>

                            {/* Subcategory Selector - Premium Animated Integration */}
                            <AnimatePresence mode="wait">
                                {filterCategory && availableSubCategories.length > 0 && (
                                    <motion.div
                                        key="subcategory-selector"
                                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                        className="relative group/sub"
                                    >
                                        <select
                                            value={filterSubCategory}
                                            onChange={(e) => setFilterSubCategory(e.target.value)}
                                            className={`appearance-none pl-6 pr-10 py-4 rounded-3xl border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all duration-300 ${filterSubCategory ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'bg-white dark:bg-onyx-800 border-onyx-100/50 dark:border-white/5 text-onyx-500 hover:border-cyan-500/30 shadow-sm'}`}
                                        >
                                            <option value="">Subcategoría</option>
                                            {availableSubCategories.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Type Filter */}
                            <div className="relative group/type">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className={`appearance-none pl-6 pr-10 py-4 rounded-3xl border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all duration-300 ${filterType ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-onyx-800 border-onyx-100/50 dark:border-white/5 text-onyx-500 hover:border-cyan-500/30 shadow-sm'}`}
                                >
                                    <option value="">Todo</option>
                                    <option value="INCOME">Ingresos</option>
                                    <option value="EXPENSE">Gastos</option>
                                </select>
                                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none" />
                            </div>

                            {/* Clear All - Elegant variant */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 rounded-3xl hover:bg-red-100 transition-all active:scale-95"
                                    title="Limpiar filtros"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionFilters;
