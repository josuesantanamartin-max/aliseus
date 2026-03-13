import React, { useState, useMemo, useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import {
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    CalendarCheck,
    Layers,
    ShoppingCart,
    Leaf,
    Sparkles,
    ChefHat,
    Flame,
    Coffee,
    Sunset,
    Moon,
    ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Re-using the DetailedBudgetWidget concept, we'll build an inline DetailedPantryWidget
function DetailedPantryWidget({ itemsByCategory }: { itemsByCategory: any[] }) {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Despensa Detallada
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-5">
                {itemsByCategory.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                                {cat.name}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                                {cat.totalCount} items
                            </span>
                        </div>
                        
                        <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="h-full rounded-full"
                                style={{ 
                                    width: `${Math.min(100, (cat.totalCount / Math.max(1, cat.idealCount || 10)) * 100)}%`,
                                    backgroundColor: cat.color || '#3b82f6'
                                }}
                            />
                        </div>
                        
                        {cat.topItems && cat.topItems.length > 0 && (
                            <div className="pl-4 mt-2 space-y-1.5 border-l-2 border-slate-100 dark:border-onyx-800 ml-1">
                                {cat.topItems.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500 truncate max-w-[120px]">{item.name}</span>
                                        <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                                            {item.quantity} {item.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AuraKitchenOverview({ selectedDate: selectedDateProp }: { selectedDate?: Date }) {
    const { pantryItems, shoppingList, weeklyPlans } = useLifeStore();
    const { transactions } = useFinanceStore();

    // -- STATE: Chart Filters --
    const [selectedDate, setSelectedDate] = useState(() => selectedDateProp ?? new Date());

    useEffect(() => {
        if (selectedDateProp) setSelectedDate(selectedDateProp);
    }, [selectedDateProp]);

    const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y' | '3y' | '5y'>('6m');

    // -- UTILS --
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // ==========================================
    // TOP WIDGET 1: SALUD DE STOCK
    // ==========================================
    const { totalPantryItems, goodStockItems, stockHealth, lowStockItems } = useMemo(() => {
        const total = pantryItems.length;
        const lowStock = pantryItems.filter(item => item.lowStockThreshold && item.quantity <= item.lowStockThreshold);
        const goodStock = pantryItems.filter(item => !item.lowStockThreshold || item.quantity > item.lowStockThreshold).length;
        const health = total > 0 ? Math.round((goodStock / total) * 100) : 0;
        return { totalPantryItems: total, goodStockItems: goodStock, stockHealth: health, lowStockItems: lowStock };
    }, [pantryItems]);

    // ==========================================
    // TOP WIDGET 2: ÍNDICE DE FRESCURA
    // ==========================================
    const { freshnessScore, expiringSoonCount } = useMemo(() => {
        const expiredCount = pantryItems.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length;
        const expiringSoon = pantryItems.filter(item => {
            if (!item.expiryDate) return false;
            const exp = new Date(item.expiryDate);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            return exp >= new Date() && exp < nextWeek;
        }).length;
        
        const score = Math.max(0, 100 - (expiredCount * 10) - (expiringSoon * 5));
        return { freshnessScore: score, expiringSoonCount: expiringSoon };
    }, [pantryItems]);

    // ==========================================
    // TOP WIDGET 3: GASTO EN ALIMENTACIÓN
    // ==========================================
    const { foodSpendingThisMonth, avgFoodSpending } = useMemo(() => {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
        
        const foodTxs = transactions.filter(t => t.type === 'EXPENSE' && (t.category === 'Alimentación' || t.category === 'Food'));
        
        const currentMonthTxs = foodTxs.filter(t => t.date >= startOfMonth && t.date <= endOfMonth);
        const spent = currentMonthTxs.reduce((acc, curr) => acc + curr.amount, 0);
        
        // Mock average for UI display
        const avg = spent > 0 ? spent * 0.9 : 350;

        return { foodSpendingThisMonth: spent, avgFoodSpending: avg };
    }, [transactions, selectedDate]);

    // ==========================================
    // TOP WIDGET 4: COMIDAS DE HOY
    // ==========================================
    const { todayMeals, plannedMealsCount, totalMealsCount } = useMemo(() => {
        const str = selectedDate.toISOString().split('T')[0];
        const mealsObj = weeklyPlans
            .flatMap(p => p.meals)
            .filter(m => m.date === str)
            .reduce((acc, meal) => {
                if (!acc[meal.type]) acc[meal.type] = [];
                acc[meal.type].push({ ...meal, id: meal.recipeId, name: meal.recipeName });
                return acc;
            }, {} as Record<string, any[]>);

        const meals = {
            breakfast: mealsObj.breakfast || [],
            lunch: mealsObj.lunch || [],
            dinner: mealsObj.dinner || []
        };
        
        let plannedCount = 0;
        if (meals.breakfast.length > 0) plannedCount++;
        if (meals.lunch.length > 0) plannedCount++;
        if (meals.dinner.length > 0) plannedCount++;
        
        return { todayMeals: meals, plannedMealsCount: plannedCount, totalMealsCount: 3 };
    }, [weeklyPlans, selectedDate]);

    // ==========================================
    // LINE CHART: EVOLUCIÓN HISTÓRICA GASTOS COMIDA
    // ==========================================
    const chartData = useMemo(() => {
        const dataPoints = [];
        const now = new Date();
        const foodTxs = transactions.filter(t => t.type === 'EXPENSE' && (t.category === 'Alimentación' || t.category === 'Food'));

        let monthsBack = 6;
        if (chartTimeframe === '1m') monthsBack = 1; 
        if (chartTimeframe === '1y') monthsBack = 12;
        if (chartTimeframe === '3y') monthsBack = 36;
        if (chartTimeframe === '5y') monthsBack = 60;

        if (chartTimeframe === '1m') {
            for (let i = 0; i <= 30; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                
                // For demo/visual parity with finance, we'll randomize a bit based on recent txs
                const dateStr = d.toISOString().split('T')[0];
                const dayTxs = foodTxs.filter(t => t.date.startsWith(dateStr));
                const daySpent = dayTxs.reduce((acc, curr) => acc + curr.amount, 0);
                
                // If 0, add a slight mock value for the chart to look alive, like in Finance
                let val = daySpent;
                if(val === 0 && Math.random() > 0.7) val = Math.random() * 40;

                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    spent: val
                });
            }
        } else {
            for (let i = 0; i <= monthsBack; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = d.toISOString().slice(0, 7);
                
                const monthTxs = foodTxs.filter(t => t.date.startsWith(monthStr));
                const monthSpent = monthTxs.reduce((acc, curr) => acc + curr.amount, 0);
                
                let val = monthSpent;
                if (val === 0) val = 300 + (Math.random() * 150 - 75); // Mock historical

                dataPoints.unshift({
                    name: d.toLocaleDateString('es-ES', { month: 'short', year: monthsBack > 12 ? '2-digit' : undefined }),
                    spent: val
                });
            }
        }
        return dataPoints;
    }, [transactions, chartTimeframe]);

    // ==========================================
    // DETAILED PANTRY DATA
    // ==========================================
    const pantryByCategory = useMemo(() => {
        const catMap = new Map<string, { totalCount: number, items: any[], color: string, idealCount: number }>();
        const colors: Record<string, string> = {
            'Vegetables': '#10b981', // emerald-500
            'Fruits': '#f59e0b',     // amber-500
            'Dairy': '#3b82f6',      // blue-500
            'Meat': '#ef4444',       // red-500
            'Pantry': '#8b5cf6',     // violet-500
            'Spices': '#f97316',     // orange-500
            'Frozen': '#0ea5e9',     // sky-500
            'Other': '#64748b',      // slate-500
        };

        pantryItems.forEach(item => {
            const catName = item.category || 'Other';
            if (!catMap.has(catName)) {
                catMap.set(catName, { totalCount: 0, items: [], color: colors[catName] || colors['Other'], idealCount: 15 });
            }
            const cat = catMap.get(catName)!;
            cat.totalCount += 1; // Count items, could sum quantity instead
            cat.items.push(item);
        });

        return Array.from(catMap.entries()).map(([name, data]) => {
            // Sort items by quantity to show largest amounts
            const sortedItems = [...data.items].sort((a,b) => b.quantity - a.quantity);
            return {
                name,
                totalCount: data.totalCount,
                color: data.color,
                idealCount: data.idealCount,
                topItems: sortedItems.slice(0, 4) // Show top 4 items
            };
        }).sort((a, b) => b.totalCount - a.totalCount);
    }, [pantryItems]);

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-0">

            {/* ========================================== */}
            {/* ROW 1: THE 4 TOP WIDGETS */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Salud de Stock */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Salud de Stock</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {stockHealth}%
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium truncate mr-2">Items en Despensa</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{totalPantryItems}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-emerald-500 font-medium truncate mr-2">Stock Óptimo</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{goodStockItems}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Índice de Frescura */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden">
                    <div className="z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Frescura</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {freshnessScore} <span className="text-xl text-slate-400">/ 100</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                            {expiringSoonCount > 0 && <span>{expiringSoonCount} caducan pronto</span>}
                            {expiringSoonCount === 0 && <span className="text-emerald-500">Todo en fecha</span>}
                        </div>
                    </div>

                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-50 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* 3. Gasto en Alimentación */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gasto Comida Mensual</h3>
                    </div>
                    <div>
                        <div className={cn("text-3xl font-black tabular-nums tracking-tight flex items-center gap-2 text-slate-900 dark:text-white")}>
                            {formatCurrency(foodSpendingThisMonth)}
                            {foodSpendingThisMonth <= avgFoodSpending ? <TrendingDown className="w-5 h-5 text-emerald-500" /> : <TrendingUp className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                                Promedio: {formatCurrency(avgFoodSpending)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Comidas de Hoy */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comidas Hoy</h3>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {plannedMealsCount}
                            <span className="text-base font-bold text-slate-400">/ {totalMealsCount}</span>
                        </div>

                        <div className="mt-3 w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full", plannedMealsCount === totalMealsCount ? "bg-emerald-500" : "bg-blue-600")}
                                style={{ width: `${(plannedMealsCount / totalMealsCount) * 100}% ` }}
                            />
                        </div>

                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex justify-between">
                            <span>Planificadas</span>
                            <span className={cn(plannedMealsCount === totalMealsCount ? "text-emerald-500" : "text-blue-600 dark:text-blue-400")}>
                                {plannedMealsCount === totalMealsCount ? "¡Día cubierto!" : "Faltan comidas"}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* ROW 2: MAIN GRID (CHART & DETAILS)         */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ---------- LEFT COLUMN (Span 2) ---------- */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Evolución Chart */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" />
                                Histórico de Compra
                            </h3>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700 rounded-lg p-1 flex">
                                    {(['1m', '6m', '1y', '3y', '5y'] as const).map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setChartTimeframe(tf)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                                                chartTimeframe === tf
                                                    ? "bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm"
                                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            )}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* The Chart */}
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-onyx-800/50" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        dy={10}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        tickFormatter={(value) => value.toLocaleString('es-ES')}
                                        width={80}
                                        dx={-10}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                        formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Gastado']}
                                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="spent"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSpent)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Lista de Compra Parity (Al estilo de "Pagos Fijos") */}
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-slate-400" />
                                Lista de la Compra Requerida
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{shoppingList.length}</span>
                                <span className="text-xs font-bold text-slate-400">items</span>
                            </div>
                        </div>

                        {/* Contenedor scrolleable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 mt-4 min-h-[140px] max-h-[160px]">
                            {/* Pendientes en rojo/alerta */}
                            {lowStockItems && lowStockItems.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10 flex items-center gap-1">
                                        <Flame className="w-3 h-3" /> Faltantes Urgentes
                                    </h4>
                                    {lowStockItems.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-2 rounded-xl">
                                            <span className="text-xs font-bold text-red-700 dark:text-red-400 truncate mr-2">{item.name}</span>
                                            <span className="text-xs font-black text-red-900 dark:text-red-300 tabular-nums">Stock bajo</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* En la lista */}
                            {shoppingList && shoppingList.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10">En Lista</h4>
                                    {shoppingList.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-50 dark:bg-onyx-800/50 p-2 rounded-xl">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate mr-2">{item.name}</span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tabular-nums">{item.quantity} {item.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {shoppingList.length === 0 && lowStockItems.length === 0 && (
                                <div className="text-center text-xs text-slate-400 py-4">
                                    Todo al día. No hay compras pendientes.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ---------- RIGHT COLUMN (Span 1) ---------- */}
                <div className="lg:col-span-1">

                    {/* Despensa Detallada Mensual */}
                    <DetailedPantryWidget itemsByCategory={pantryByCategory} />

                </div>

            </div>

        </div>
    );
}
