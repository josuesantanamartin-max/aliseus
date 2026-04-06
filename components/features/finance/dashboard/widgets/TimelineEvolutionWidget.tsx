
import React, { useState, useMemo } from 'react';
import { Transaction, Account, CategoryStructure } from '../../../../../types';
import { TrendingUp, Filter, BarChart3, Wallet, Eye, EyeOff, ChevronDown, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinanceStore } from '../../../../../store/useFinanceStore';

interface TimelineEvolutionWidgetProps {
    transactions: Transaction[];
    accounts: Account[];
    selectedDate: Date;
    timeMode: 'MONTH' | 'YEAR';
    onNavigate: (app: string, tab?: string) => void;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
}).format(amount);

type ViewMode = 'CATEGORIES' | 'SUBCATEGORIES' | 'ACCOUNTS' | 'INCOME_VS_EXPENSES' | 'COMPARISON';
type ChartRange = '3M' | '6M' | '1Y' | 'ALL';

// Vibrant color palette matching Aliseus design
const CATEGORY_COLORS = ['#6366F1', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#EF4444', '#14B8A6'];
const ACCOUNT_COLORS = ['#6366F1', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Helper function to sanitize IDs for SVG (remove spaces and special characters)
const sanitizeId = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');

const TimelineEvolutionWidget: React.FC<TimelineEvolutionWidgetProps> = ({
    transactions,
    accounts,
    selectedDate,
    timeMode,
    onNavigate
}) => {
    const { categories } = useFinanceStore();
    const [viewMode, setViewMode] = useState<ViewMode>('CATEGORIES');
    const [chartRange, setChartRange] = useState<ChartRange>('6M');
    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);

    const NON_OPERATING_CATS = ['Transferencia', 'Deudas', 'Ahorro', 'Inversión'];

    // Build flat list of all subcategories for multi-select
    const allSubCategories = useMemo(() => {
        return categories
            .filter((c: CategoryStructure) => c.type === 'EXPENSE' && !NON_OPERATING_CATS.includes(c.name))
            .flatMap((cat: CategoryStructure) =>
                cat.subCategories.map((sub: string) => ({
                    name: sub,
                    category: cat.name,
                    displayName: `${sub} (${cat.name})`,
                    fullKey: `${cat.name}::${sub}` // Unique key for selection
                }))
            )
            .sort((a: { displayName: string }, b: { displayName: string }) => a.displayName.localeCompare(b.displayName));
    }, [categories]);

    // Calculate months to look back based on range
    const getMonthsToLookBack = () => {
        switch (chartRange) {
            case '3M': return 3;
            case '6M': return 6;
            case '1Y': return 12;
            case 'ALL': return 24; // 2 years max
            default: return 6;
        }
    };

    // Generate month labels
    const generateMonthLabels = () => {
        const monthsBack = getMonthsToLookBack();
        const labels: string[] = [];
        const today = new Date();

        for (let i = monthsBack - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(d.toISOString().slice(0, 7)); // YYYY-MM format
        }

        return labels;
    };

    // Category Evolution Data
    const categoryEvolutionData = useMemo(() => {
        const monthLabels = generateMonthLabels();
        const categoryTotals: Record<string, number[]> = {};

        // Filter transactions based on selected category/subcategory
        let filteredTransactions = transactions.filter(t =>
            t.type === 'EXPENSE' && !NON_OPERATING_CATS.includes(t.category)
        );

        if (selectedCategory) {
            filteredTransactions = filteredTransactions.filter(t => t.category === selectedCategory);

            if (selectedSubCategory) {
                filteredTransactions = filteredTransactions.filter(t => t.subCategory === selectedSubCategory);
            }
        }

        // Initialize categories or subcategories
        monthLabels.forEach(() => {
            filteredTransactions.forEach(t => {
                const key = selectedCategory && !selectedSubCategory ? t.subCategory || 'Sin Subcategoría' : t.category;
                if (!categoryTotals[key]) {
                    categoryTotals[key] = new Array(monthLabels.length).fill(0);
                }
            });
        });

        // Fill data for each month
        monthLabels.forEach((monthStr, idx) => {
            const monthTxs = filteredTransactions.filter(t => t.date.startsWith(monthStr));

            monthTxs.forEach(t => {
                const key = selectedCategory && !selectedSubCategory ? t.subCategory || 'Sin Subcategoría' : t.category;
                if (!categoryTotals[key]) {
                    categoryTotals[key] = new Array(monthLabels.length).fill(0);
                }
                categoryTotals[key][idx] += t.amount;
            });
        });

        // Sort categories by total amount (descending)
        const sortedCategories = Object.entries(categoryTotals)
            .map(([name, values]) => ({
                name,
                total: values.reduce((sum, val) => sum + val, 0),
                values
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8); // Top 8 categories/subcategories

        // Build chart data
        const chartData = monthLabels.map((monthStr, idx) => {
            const dataPoint: any = {
                name: new Date(monthStr + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                fullDate: monthStr
            };

            sortedCategories.forEach(cat => {
                dataPoint[cat.name] = cat.values[idx];
            });

            return dataPoint;
        });

        return {
            data: chartData,
            categories: sortedCategories.map(c => c.name)
        };
    }, [transactions, chartRange, selectedCategory, selectedSubCategory]);


    // Subcategory Evolution Data (for multi-subcategory comparison)
    const subcategoryEvolutionData = useMemo(() => {
        if (selectedSubCategories.length === 0) {
            return { data: [], subcategories: [] };
        }

        const monthLabels = generateMonthLabels();
        const subcategoryTotals: Record<string, number[]> = {};

        // Initialize selected subcategories
        selectedSubCategories.forEach(fullKey => {
            subcategoryTotals[fullKey] = new Array(monthLabels.length).fill(0);
        });

        // Fill data for each month
        monthLabels.forEach((monthStr, idx) => {
            const monthTxs = transactions.filter(t =>
                t.date.startsWith(monthStr) &&
                t.type === 'EXPENSE' &&
                !NON_OPERATING_CATS.includes(t.category)
            );

            monthTxs.forEach(t => {
                const fullKey = `${t.category}::${t.subCategory || 'Sin Subcategoría'}`;
                if (subcategoryTotals[fullKey] !== undefined) {
                    subcategoryTotals[fullKey][idx] += t.amount;
                }
            });
        });

        // Build chart data
        const chartData = monthLabels.map((monthStr, idx) => {
            const dataPoint: any = {
                name: new Date(monthStr + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                fullDate: monthStr
            };

            selectedSubCategories.forEach(fullKey => {
                // Use display name for chart (extract subcategory name from fullKey)
                const subName = fullKey.split('::')[1];
                dataPoint[subName] = subcategoryTotals[fullKey][idx];
            });

            return dataPoint;
        });

        return {
            data: chartData,
            subcategories: selectedSubCategories.map(fk => fk.split('::')[1]) // Just the subcategory names
        };
    }, [transactions, chartRange, selectedSubCategories]);

    // Account Evolution Data
    const accountEvolutionData = useMemo(() => {
        const monthLabels = generateMonthLabels();
        const trackedAccounts = accounts.filter(a => a.type === 'BANK' || a.type === 'CASH' || a.type === 'WALLET');

        // Initialize running balances with current balances
        const runningBalances: Record<string, number> = {};
        trackedAccounts.forEach(acc => {
            runningBalances[acc.id] = acc.balance;
        });

        const chartData: any[] = [];

        // Build data from most recent to oldest, then reverse
        const reversedLabels = [...monthLabels].reverse();

        reversedLabels.forEach((monthStr, idx) => {
            const dataPoint: any = {
                name: new Date(monthStr + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                fullDate: monthStr
            };

            // Record current balances
            trackedAccounts.forEach(acc => {
                dataPoint[acc.name] = runningBalances[acc.id];
            });

            chartData.unshift(dataPoint);

            // If not the last iteration, calculate previous month's balance
            if (idx < reversedLabels.length - 1) {
                const monthTxs = transactions.filter(t => t.date.startsWith(monthStr));

                trackedAccounts.forEach(acc => {
                    const income = monthTxs
                        .filter(t => t.accountId === acc.id && t.type === 'INCOME')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const expense = monthTxs
                        .filter(t => t.accountId === acc.id && t.type === 'EXPENSE')
                        .reduce((sum, t) => sum + t.amount, 0);

                    // Go back in time: subtract net flow
                    runningBalances[acc.id] = runningBalances[acc.id] - (income - expense);
                });
            }
        });

        return {
            data: chartData,
            accounts: trackedAccounts
        };
    }, [transactions, accounts, chartRange]);

    // Income vs Expenses Data (from TrendChart)
    const incomeVsExpensesData = useMemo(() => {
        const monthLabels = generateMonthLabels();

        return monthLabels.map(monthStr => {
            const monthTxs = transactions.filter(t =>
                t.date.startsWith(monthStr) && t.category !== 'Transferencia'
            );

            const income = monthTxs
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = monthTxs
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: new Date(monthStr + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                fullDate: monthStr,
                Ingresos: income,
                Gastos: expenses,
                Balance: income - expenses
            };
        });
    }, [transactions, chartRange]);

    // Comparison Data (from ComparisonChart)
    const comparisonData = useMemo(() => {
        const currentMonth = selectedDate.toISOString().slice(0, 7);
        const prevDate = new Date(selectedDate);
        prevDate.setMonth(prevDate.getMonth() - 1);
        const prevMonth = prevDate.toISOString().slice(0, 7);

        const getData = (month: string) => {
            const txs = transactions.filter(t =>
                t.date.startsWith(month) && t.category !== 'Transferencia'
            );

            const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
            const expenses = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

            return { income, expenses, balance: income - expenses };
        };

        const current = getData(currentMonth);
        const previous = getData(prevMonth);

        return {
            data: [
                { category: 'Ingresos', actual: current.income, anterior: previous.income },
                { category: 'Gastos', actual: current.expenses, anterior: previous.expenses },
                { category: 'Balance', actual: current.balance, anterior: previous.balance }
            ],
            currentMonth: new Date(currentMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            prevMonth: new Date(prevMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        };
    }, [transactions, selectedDate]);

    const toggleSeries = (seriesName: string) => {
        const newHidden = new Set(hiddenSeries);
        if (newHidden.has(seriesName)) {
            newHidden.delete(seriesName);
        } else {
            newHidden.add(seriesName);
        }
        setHiddenSeries(newHidden);
    };

    const toggleSubCategory = (fullKey: string) => {
        setSelectedSubCategories(prev => {
            if (prev.includes(fullKey)) {
                return prev.filter(k => k !== fullKey);
            } else {
                return [...prev, fullKey];
            }
        });
    };

    const currentData = viewMode === 'CATEGORIES'
        ? categoryEvolutionData
        : viewMode === 'SUBCATEGORIES'
            ? subcategoryEvolutionData
            : viewMode === 'INCOME_VS_EXPENSES'
                ? { data: incomeVsExpensesData, series: ['Ingresos', 'Gastos', 'Balance'] }
                : viewMode === 'COMPARISON'
                    ? comparisonData
                    : accountEvolutionData;
    const seriesList = viewMode === 'CATEGORIES'
        ? categoryEvolutionData.categories
        : viewMode === 'SUBCATEGORIES'
            ? subcategoryEvolutionData.subcategories
            : viewMode === 'INCOME_VS_EXPENSES'
                ? ['Ingresos', 'Gastos', 'Balance']
                : viewMode === 'COMPARISON'
                    ? comparisonData.data.map(d => d.category)
                    : accountEvolutionData.accounts.map(a => a.name);
    const colors = viewMode === 'INCOME_VS_EXPENSES'
        ? ['#10B981', '#EF4444', '#6366F1'] // Green, Red, Indigo
        : viewMode === 'CATEGORIES' ? CATEGORY_COLORS : ACCOUNT_COLORS;

    // Get available subcategories for selected category
    const availableSubCategories = useMemo(() => {
        if (!selectedCategory) return [];
        const category = categories.find((c: CategoryStructure) => c.name === selectedCategory);
        return category?.subCategories || [];
    }, [selectedCategory, categories]);

    const handleCategoryChange = (category: string | null) => {
        setSelectedCategory(category);
        setSelectedSubCategory(null);
        setHiddenSeries(new Set());
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 p-8 rounded-3xl border border-aliseus-100 dark:border-aliseus-800 shadow-sm relative overflow-hidden group">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-cyan-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-primary dark:text-cyan-400 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        Evolución Temporal
                    </h3>
                    <p className="text-xs font-semibold text-aliseus-400 dark:text-aliseus-500 mt-2 uppercase tracking-[0.15em]">
                        {viewMode === 'CATEGORIES' ? 'Gastos por Categoría'
                            : viewMode === 'SUBCATEGORIES' ? 'Comparar Subcategorías'
                                : viewMode === 'INCOME_VS_EXPENSES' ? 'Ingresos vs Gastos'
                                    : viewMode === 'COMPARISON' ? 'Comparativa Mensual'
                                        : 'Saldos de Cuentas'}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="bg-aliseus-50 dark:bg-aliseus-800 p-1 rounded-xl flex items-center gap-1 h-full flex flex-col">
                        <button
                            onClick={() => { setViewMode('CATEGORIES'); setHiddenSeries(new Set()); handleCategoryChange(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'CATEGORIES'
                                ? 'bg-white dark:bg-aliseus-700 shadow-sm text-cyan-primary dark:text-cyan-400'
                                : 'text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-600 dark:hover:text-aliseus-300'
                                }`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Categorías
                        </button>
                        <button
                            onClick={() => { setViewMode('SUBCATEGORIES'); setHiddenSeries(new Set()); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'SUBCATEGORIES'
                                ? 'bg-white dark:bg-aliseus-700 shadow-sm text-cyan-primary dark:text-cyan-400'
                                : 'text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-600 dark:hover:text-aliseus-300'
                                }`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Subcategorías
                        </button>
                        <button
                            onClick={() => { setViewMode('ACCOUNTS'); setHiddenSeries(new Set()); handleCategoryChange(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'ACCOUNTS'
                                ? 'bg-white dark:bg-aliseus-700 shadow-sm text-cyan-primary dark:text-cyan-400'
                                : 'text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-600 dark:hover:text-aliseus-300'
                                }`}
                        >
                            <Wallet className="w-3.5 h-3.5" />
                            Cuentas
                        </button>
                        <button
                            onClick={() => { setViewMode('INCOME_VS_EXPENSES'); setHiddenSeries(new Set()); handleCategoryChange(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'INCOME_VS_EXPENSES'
                                ? 'bg-white dark:bg-aliseus-700 shadow-sm text-cyan-primary dark:text-cyan-400'
                                : 'text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-600 dark:hover:text-aliseus-300'
                                }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Ingresos vs Gastos
                        </button>
                        <button
                            onClick={() => { setViewMode('COMPARISON'); setHiddenSeries(new Set()); handleCategoryChange(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'COMPARISON'
                                ? 'bg-white dark:bg-aliseus-700 shadow-sm text-cyan-primary dark:text-cyan-400'
                                : 'text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-600 dark:hover:text-aliseus-300'
                                }`}
                        >
                            <Activity className="w-3.5 h-3.5" />
                            Comparativa
                        </button>
                    </div>

                    {/* Subcategory Selection Info (only in SUBCATEGORIES mode) */}
                    {viewMode === 'SUBCATEGORIES' && (
                        <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/30 px-4 py-2 rounded-xl border border-cyan-200 dark:border-cyan-900">
                            <Filter className="w-4 h-4 text-cyan-primary dark:text-cyan-400" />
                            <span className="text-xs font-bold text-cyan-primary dark:text-cyan-400 uppercase tracking-widest">
                                {selectedSubCategories.length > 0
                                    ? `${selectedSubCategories.length} seleccionada${selectedSubCategories.length > 1 ? 's' : ''}`
                                    : 'Selecciona subcategorías abajo'}
                            </span>
                        </div>
                    )}

                    {/* Category Selector (only in CATEGORIES mode) */}
                    {viewMode === 'CATEGORIES' && (
                        <div className="relative">
                            <select
                                value={selectedCategory || ''}
                                onChange={(e) => handleCategoryChange(e.target.value || null)}
                                className="appearance-none bg-aliseus-50 dark:bg-aliseus-800 text-aliseus-900 dark:text-white px-4 py-2 pr-8 rounded-xl text-xs font-bold uppercase tracking-widest border border-transparent hover:border-cyan-200 dark:hover:border-cyan-900 transition-all cursor-pointer"
                            >
                                <option value="">Todas las Categorías</option>
                                {categories
                                    .filter((c: CategoryStructure) => c.type === 'EXPENSE' && !NON_OPERATING_CATS.includes(c.name))
                                    .map((cat: CategoryStructure) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))
                                }
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-aliseus-400 pointer-events-none" />
                        </div>
                    )}

                    {/* Subcategory Selector (only when category is selected) */}
                    {viewMode === 'CATEGORIES' && selectedCategory && availableSubCategories.length > 0 && (
                        <div className="relative">
                            <select
                                value={selectedSubCategory || ''}
                                onChange={(e) => { setSelectedSubCategory(e.target.value || null); setHiddenSeries(new Set()); }}
                                className="appearance-none bg-cyan-50 dark:bg-cyan-900/30 text-cyan-primary dark:text-cyan-400 px-4 py-2 pr-8 rounded-xl text-xs font-bold uppercase tracking-widest border border-cyan-200 dark:border-cyan-900 transition-all cursor-pointer"
                            >
                                <option value="">Todas las Subcategorías</option>
                                {availableSubCategories.map((subCat: string) => (
                                    <option key={subCat} value={subCat}>{subCat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-primary dark:text-cyan-400 pointer-events-none" />
                        </div>
                    )}

                    {/* Range Selector (hidden for COMPARISON mode) */}
                    {viewMode !== 'COMPARISON' && (
                        <div className="bg-aliseus-50 dark:bg-aliseus-800 p-1 rounded-xl flex items-center gap-1 h-full flex flex-col">
                            {(['3M', '6M', '1Y', 'ALL'] as ChartRange[]).map(range => (
                                <button
                                    key={range}
                                    onClick={() => { setChartRange(range); setHiddenSeries(new Set()); }}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${chartRange === range
                                        ? 'bg-white dark:bg-aliseus-700 shadow-sm text-cyan-900 dark:text-white'
                                        : 'text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-600 dark:hover:text-aliseus-300'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="h-[400px] w-full relative z-10">
                {currentData.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-aliseus-300 dark:text-aliseus-600">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-40">Sin datos en este periodo</p>
                    </div>
                ) : viewMode === 'COMPARISON' ? (
                    /* Bar Chart for Comparison Mode */
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} className="opacity-50" />
                            <XAxis
                                dataKey="category"
                                stroke="#94A3B8"
                                fontSize={11}
                                fontWeight={600}
                                axisLine={false}
                                tickLine={false}
                                tick={{ dy: 10 }}
                            />
                            <YAxis
                                stroke="#94A3B8"
                                fontSize={11}
                                fontWeight={600}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => value.toLocaleString('es-ES')}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '12px',
                                    backgroundColor: 'white'
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                                formatter={(value: number | undefined) => formatEUR(value ?? 0)}
                            />
                            {!hiddenSeries.has('Mes Actual') && (
                                <Bar dataKey="actual" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Mes Actual" barSize={32} />
                            )}
                            {!hiddenSeries.has('Mes Anterior') && (
                                <Bar dataKey="anterior" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="Mes Anterior" barSize={32} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    /* Area Chart for other modes */
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentData.data}>
                            <defs>
                                {seriesList.map((series, idx) => (
                                    <linearGradient key={series} id={`gradient-${sanitizeId(series)}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.6} />
                                        <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0.1} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} className="opacity-50" />
                            <XAxis
                                dataKey="name"
                                stroke="#94A3B8"
                                fontSize={11}
                                fontWeight={600}
                                axisLine={false}
                                tickLine={false}
                                tick={{ dy: 10 }}
                            />
                            <YAxis
                                stroke="#94A3B8"
                                fontSize={11}
                                fontWeight={600}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => value.toLocaleString('es-ES')}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '12px',
                                    backgroundColor: 'white'
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                                formatter={(value: number | undefined) => formatEUR(value ?? 0)}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                                onClick={(e) => toggleSeries(e.value as string)}
                                formatter={(value) => (
                                    <span className={`text-xs font-bold cursor-pointer hover:underline ${hiddenSeries.has(value) ? 'opacity-40 line-through' : ''
                                        }`}>
                                        {value}
                                    </span>
                                )}
                            />
                            {seriesList.map((series, idx) => (
                                !hiddenSeries.has(series) && (
                                    <Area
                                        key={series}
                                        type="monotone"
                                        dataKey={series}
                                        stroke={colors[idx % colors.length]}
                                        strokeWidth={2.5}
                                        fill={`url(#gradient-${sanitizeId(series)})`}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                    />
                                )
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend Controls / Subcategory Selection */}
            <div className="mt-6 pt-6 border-t border-aliseus-100 dark:border-aliseus-800 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-aliseus-400" />
                    <span className="text-xs font-bold text-aliseus-400 uppercase tracking-wider">
                        {viewMode === 'SUBCATEGORIES' ? 'Seleccionar Subcategorías' : 'Filtrar Series'}
                    </span>
                </div>

                {viewMode === 'SUBCATEGORIES' ? (
                    /* Subcategory Selection Chips - Grouped by Category */
                    <div className="space-y-4">
                        {categories
                            .filter((c: CategoryStructure) => c.type === 'EXPENSE' && !NON_OPERATING_CATS.includes(c.name))
                            .map((category: CategoryStructure) => (
                                <div key={category.id}>
                                    <h4 className="text-xs font-bold text-aliseus-500 dark:text-aliseus-400 uppercase tracking-wider mb-2">
                                        {category.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {category.subCategories.map((subCat: string) => {
                                            const fullKey = `${category.name}::${subCat}`;
                                            const isSelected = selectedSubCategories.includes(fullKey);
                                            const colorIdx = selectedSubCategories.indexOf(fullKey);
                                            const color = colorIdx >= 0 ? colors[colorIdx % colors.length] : '#94A3B8';

                                            return (
                                                <button
                                                    key={fullKey}
                                                    onClick={() => toggleSubCategory(fullKey)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isSelected
                                                        ? 'bg-white dark:bg-aliseus-800 border-aliseus-200 dark:border-aliseus-700 text-aliseus-900 dark:text-white shadow-sm'
                                                        : 'bg-transparent border-aliseus-200 dark:border-aliseus-700 text-aliseus-400 dark:text-aliseus-500 opacity-50 hover:opacity-100'
                                                        }`}
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: isSelected ? color : '#94A3B8' }}
                                                    />
                                                    {subCat}
                                                    {isSelected ? (
                                                        <Eye className="w-3 h-3" />
                                                    ) : (
                                                        <EyeOff className="w-3 h-3" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : viewMode === 'COMPARISON' ? (
                    /* Comparison Mode - Show Mes Actual / Mes Anterior filters */
                    <div className="flex flex-wrap gap-2">
                        {['Mes Actual', 'Mes Anterior'].map((period, idx) => (
                            <button
                                key={period}
                                onClick={() => toggleSeries(period)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${hiddenSeries.has(period)
                                    ? 'bg-transparent border-aliseus-200 dark:border-aliseus-700 text-aliseus-400 dark:text-aliseus-500 opacity-50'
                                    : 'bg-white dark:bg-aliseus-800 border-aliseus-200 dark:border-aliseus-700 text-aliseus-900 dark:text-white shadow-sm'
                                    }`}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: idx === 0 ? '#4F46E5' : '#E2E8F0' }}
                                />
                                {period}
                                {hiddenSeries.has(period) ? (
                                    <EyeOff className="w-3 h-3" />
                                ) : (
                                    <Eye className="w-3 h-3" />
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Regular Series Filtering */
                    <div className="flex flex-wrap gap-2">
                        {seriesList.map((series, idx) => (
                            <button
                                key={series}
                                onClick={() => toggleSeries(series)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${hiddenSeries.has(series)
                                    ? 'bg-transparent border-aliseus-200 dark:border-aliseus-700 text-aliseus-400 dark:text-aliseus-500 opacity-50'
                                    : 'bg-white dark:bg-aliseus-800 border-aliseus-200 dark:border-aliseus-700 text-aliseus-900 dark:text-white shadow-sm'
                                    }`}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors[idx % colors.length] }}
                                />
                                {series}
                                {hiddenSeries.has(series) ? (
                                    <EyeOff className="w-3 h-3" />
                                ) : (
                                    <Eye className="w-3 h-3" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-soft/10 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};

export default TimelineEvolutionWidget;
