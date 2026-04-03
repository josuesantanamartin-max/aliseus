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
    ArrowRight,
    HelpCircle
} from 'lucide-react';
import Tooltip from '../../ui/Tooltip';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Re-using the DetailedBudgetWidget concept, we'll build an inline DetailedPantryWidget
function DetailedPantryWidget({ itemsByCategory }: { itemsByCategory: any[] }) {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-slate-400" />
                Despensa Detallada
            </h3>
            
            {itemsByCategory.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-slate-400 px-4">
                    <Layers className="w-12 h-12 mb-4 opacity-20"/>
                    <p className="text-sm font-medium">Añade tus productos habituales para empezar a recibir sugerencias</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-6">
                    {itemsByCategory.map((cat, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                                    <span className="text-sm">{cat.name}</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white opacity-50">
                                    {cat.totalCount} items
                                </span>
                            </div>
                            
                            <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ 
                                        width: `${Math.min(100, (cat.totalCount / Math.max(1, cat.idealCount || 10)) * 100)}%`,
                                        backgroundColor: cat.color || '#3b82f6'
                                    }}
                                />
                            </div>
                            
                            {cat.topItems && cat.topItems.length > 0 && (
                                <div className="pl-4 mt-2 space-y-2 border-l-2 border-slate-100 dark:border-onyx-800 ml-1">
                                    {cat.topItems.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-[11px] font-medium">
                                            <span className="text-slate-500 truncate max-w-[120px]">{item.name}</span>
                                            <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums bg-slate-50 dark:bg-onyx-800 px-2 py-0.5 rounded-md">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
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
    // 1. SALUD DE STOCK
    // ==========================================
    const { totalPantryItems, goodStockItems, stockHealth, lowStockItems, healthLabel } = useMemo(() => {
        const total = pantryItems.length;
        const lowStock = pantryItems.filter(item => item.lowStockThreshold && item.quantity <= item.lowStockThreshold);
        const goodStock = pantryItems.filter(item => !item.lowStockThreshold || item.quantity > item.lowStockThreshold).length;
        const health = total > 0 ? Math.round((goodStock / total) * 100) : 0;
        
        let label = "Estable";
        if (total === 0) label = "Aún no has configurado tu despensa base";
        else if (lowStock.length > 0) label = "Sin básicos definidos";

        return { totalPantryItems: total, goodStockItems: goodStock, stockHealth: health, lowStockItems: lowStock, healthLabel: label };
    }, [pantryItems]);

    // ==========================================
    // 2. ÍNDICE DE FRESCURA
    // ==========================================
    const { freshnessScore, expiringSoon3Days } = useMemo(() => {
        const expiredCount = pantryItems.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length;
        
        const expiringSoonItems = pantryItems.filter(item => {
            if (!item.expiryDate) return false;
            const exp = new Date(item.expiryDate);
            const next3Days = new Date();
            next3Days.setDate(next3Days.getDate() + 3);
            return exp >= new Date() && exp < next3Days;
        });
        
        const score = Math.max(0, 100 - (expiredCount * 10) - (expiringSoonItems.length * 5));
        return { freshnessScore: score, expiringSoon3Days: expiringSoonItems };
    }, [pantryItems]);

    // ==========================================
    // 3. GASTO EN ALIMENTACIÓN
    // ==========================================
    const { foodSpendingThisMonth, avgFoodSpending, diffPercent } = useMemo(() => {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
        
        const foodTxs = transactions.filter(t => t.type === 'EXPENSE' && (t.category === 'Alimentación' || t.category === 'Food'));
        
        const currentMonthTxs = foodTxs.filter(t => t.date >= startOfMonth && t.date <= endOfMonth);
        const spent = currentMonthTxs.reduce((acc, curr) => acc + curr.amount, 0);
        
        // Mock average for UI display
        const avg = spent > 0 ? spent * 0.9 : 350;

        // Calculate actual last 3 months average for comparison
        const last3Months = [];
        for (let i = 1; i <= 3; i++) {
            const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
            const monthStr = d.toISOString().slice(0, 7);
            const monthTxs = foodTxs.filter(t => t.date.startsWith(monthStr));
            last3Months.push(monthTxs.reduce((acc, curr) => acc + curr.amount, 0) || (300 + Math.random() * 100)); // Fallback to mock if no data
        }
        const last3MonthsAvg = last3Months.reduce((a, b) => a + b, 0) / 3;
        const diffPercentAmount = last3MonthsAvg > 0 ? Math.round(((spent - last3MonthsAvg) / last3MonthsAvg) * 100) : 0;

        return { foodSpendingThisMonth: spent, avgFoodSpending: avg, last3MonthsAvg, diffPercent: diffPercentAmount };
    }, [transactions, selectedDate]);

    // ==========================================
    // 4. COMIDAS DE HOY
    // ==========================================
    const { todayMeals, plannedMealsCount, totalMealsCount, missing } = useMemo(() => {
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
        
        const missingList = [];
        if (meals.breakfast.length === 0) missingList.push('Desayuno');
        if (meals.lunch.length === 0) missingList.push('Comida');
        if (meals.dinner.length === 0) missingList.push('Cena');

        return { todayMeals: meals, plannedMealsCount: plannedCount, totalMealsCount: 3, missing: missingList };
    }, [weeklyPlans, selectedDate]);

    // ==========================================
    // 5. CABECERA INTELIGENTE
    // ==========================================
    const smartHeader = useMemo(() => {
        const isPantryEmpty = totalPantryItems === 0;
        const missingMeals = missing.length;
        const urgents = lowStockItems.length;

        let title = "";
        let colorTheme: 'emerald' | 'amber' | 'blue' | 'slate' = 'emerald';
        let actionLabel = "Planificar comidas de hoy"; 
        
        if (missingMeals === 3 && isPantryEmpty) {
            title = "Hoy faltan 3 comidas por planificar y tu despensa aún no tiene stock cargado.";
            colorTheme = "blue";
            actionLabel = "Planificar comidas de hoy";
        } else if (missingMeals > 0) {
            title = `Hoy faltan ${missingMeals} comidas por planificar${urgents > 0 ? ` y tienes ${urgents} productos urgentes en lista.` : "."}`;
            colorTheme = "amber";
            actionLabel = "Planificar comidas de hoy";
        } else if (urgents > 0) {
            title = `Hoy tienes menú cubierto, pero revisa tus ${urgents} productos urgentes en despensa.`;
            colorTheme = "amber";
            actionLabel = "Revisar despensa";
        } else {
            title = "Cocina al día y planificada. ¡Buen provecho!";
            colorTheme = "emerald";
            actionLabel = "Generar lista de compra";
        }

        const dateStr = selectedDate.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        const dateLabel = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        return {
            title,
            colorTheme,
            dateLabel,
            actionLabel
        };
    }, [totalPantryItems, missing, lowStockItems, selectedDate]);

    const themeStyles = {
        emerald: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-100',
        amber: 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30 text-amber-900 dark:text-amber-100',
        blue: 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30 text-blue-900 dark:text-blue-100',
        slate: 'bg-slate-50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/30 text-slate-900 dark:text-slate-100',
    };

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
                
                const dateStr = d.toISOString().split('T')[0];
                const dayTxs = foodTxs.filter(t => t.date.startsWith(dateStr));
                const daySpent = dayTxs.reduce((acc, curr) => acc + curr.amount, 0);
                
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
            {/* ROW 1: CABECERA INTELIGENTE */}
            <div className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-[background,border,color] duration-300 ${themeStyles[smartHeader.colorTheme]}`}>
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold tracking-widest uppercase opacity-70">
                        {smartHeader.dateLabel}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight max-w-3xl">
                        {smartHeader.title}
                    </h2>
                    
                    {/* MICROESTADOS */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                            <TrendingDown className="w-4 h-4 opacity-60" />
                            <span className="text-sm font-bold">Gasto del mes: {formatCurrency(foodSpendingThisMonth)}</span>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                            <Leaf className="w-4 h-4 opacity-60" />
                            <span className="text-sm font-bold">Frescura: {freshnessScore}/100</span>
                        </div>
                    </div>
                </div>
                
                <div className="shrink-0 flex items-center self-start xl:self-center mt-2 xl:mt-0">
                    <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-transparent font-bold shadow-md hover:shadow-lg transition-all active:scale-95 group">
                        <span>{smartHeader.actionLabel}</span>
                        <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ROW 2: ESTADO DE HOY (Prioridad Operativa) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Comidas de Hoy */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                                <Target className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Comidas Hoy</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Planificación Diaria</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {plannedMealsCount}
                            <span className="text-xl font-bold text-slate-400">/ {totalMealsCount}</span>
                        </div>
                    </div>

                    <div className="mt-2 w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000", plannedMealsCount === totalMealsCount ? "bg-emerald-500" : "bg-blue-600")}
                            style={{ width: `${(plannedMealsCount / totalMealsCount) * 100}%` }}
                        />
                    </div>

                    <div className="text-sm font-bold flex justify-between items-center mb-6">
                        <span className="text-slate-500">Estado</span>
                        <span className={cn("px-4 py-1.5 rounded-xl font-bold text-xs max-w-[65%] text-right overflow-hidden text-ellipsis whitespace-nowrap", plannedMealsCount === totalMealsCount ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400")}>
                            {plannedMealsCount === 0 ? "Todavía no has planificado las comidas de hoy" : (plannedMealsCount === totalMealsCount ? "¡Día cubierto!" : `Falta: ${missing.join(', ')}`)}
                        </span>
                    </div>

                    {plannedMealsCount < totalMealsCount && (
                        <button className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold transition-colors">
                            Planificar comidas de hoy
                        </button>
                    )}
                </div>

                {/* 2. Lista de Compra */}
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full min-h-[300px]">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl">
                                <ShoppingCart className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Lista de Compra</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Urgencias y requeridos</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{lowStockItems.length + shoppingList.length}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {lowStockItems && lowStockItems.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10 flex items-center gap-1">
                                    <Flame className="w-3 h-3" /> Faltantes Urgentes
                                </h4>
                                {lowStockItems.map((item) => (
                                    <div key={'us-'+item.id} className="flex justify-between items-center bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-xl">
                                        <span className="text-sm font-bold text-red-700 dark:text-red-400 truncate mr-2">{item.name}</span>
                                        <span className="text-[10px] font-black text-red-900/50 dark:text-red-300/50 tabular-nums uppercase tracking-widest border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-md bg-white/50 dark:bg-black/20">Stock bajo</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {shoppingList && shoppingList.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10 flex items-center gap-1">Requeridos en Menú</h4>
                                {shoppingList.map((item) => (
                                    <div key={'sq-'+item.id} className="flex justify-between items-center bg-slate-50 dark:bg-onyx-800/50 p-3 rounded-xl border border-slate-100 dark:border-onyx-800">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate mr-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"/>
                                            {item.name}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-500 tabular-nums">{item.quantity} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {shoppingList.length === 0 && lowStockItems.length === 0 && (
                            <div className="text-center text-sm font-medium text-slate-400 pt-8 flex flex-col items-center gap-3">
                                <Sparkles className="w-8 h-8 text-slate-300 dark:text-onyx-700 opacity-50" />
                                {plannedMealsCount === 0 && totalPantryItems === 0 
                                    ? "No hay compras sugeridas porque aún no hay menú o stock suficiente." 
                                    : "Todo al día. No hay compras pendientes."}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ROW 3: ESTADO SEMANAL/MENSUAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frescura */}
                <div className="bg-slate-50 dark:bg-onyx-900/40 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-onyx-800/80 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Leaf className="w-5 h-5"/> Nivel de Frescura</h3>
                    <div className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight mb-4 flex items-baseline gap-2">
                        {freshnessScore} <span className="text-xl font-bold opacity-30">/ 100</span>
                    </div>
                    <div className={`text-sm font-bold leading-relaxed ${expiringSoon3Days && expiringSoon3Days.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {expiringSoon3Days && expiringSoon3Days.length > 0 
                            ? <span>Próximos a caducar en 3 días: <br/><span className="font-medium opacity-80 mt-1 block">{expiringSoon3Days.map((e: any) => e.name).join(', ')}</span></span>
                            : 'Todo en fecha. Inmejorable.'}
                    </div>
                </div>

                {/* Gasto Alimentos */}
                <div className="bg-slate-50 dark:bg-onyx-900/40 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-onyx-800/80 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <TrendingDown className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Gasto Mensual Actual</h3>
                        <div className="text-5xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white mb-4">
                            {formatCurrency(foodSpendingThisMonth)}
                        </div>
                        <p className={`text-sm font-bold ${diffPercent > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {diffPercent > 0 ? `Llevas ${formatCurrency(foodSpendingThisMonth - avgFoodSpending)} (${diffPercent}%) por encima de tu media mensual.` : `Llevas ${formatCurrency(Math.abs(foodSpendingThisMonth - avgFoodSpending))} por debajo de tu media.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* ROW 4: SALUD DE STOCK (Ancho Completo) */}
            <div className="bg-slate-50 dark:bg-onyx-900/30 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 dark:border-onyx-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner">
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity className="w-5 h-5"/> Salud de Stock Estructural</h3>
                    <div className="text-6xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight flex items-baseline">
                        {stockHealth}<span className="text-3xl text-slate-400 ml-1">%</span>
                    </div>
                </div>
                <div className="flex flex-col items-start md:items-end flex-shrink-0 max-w-sm">
                    <p className={cn("text-base font-black px-6 py-3 rounded-2xl w-full text-center md:text-right border", healthLabel === 'Estable' ? 'bg-emerald-200/50 text-emerald-800 border-emerald-300/50 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-200/50 text-amber-800 border-amber-300/50 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-400')}>
                        {healthLabel}
                    </p>
                    {totalPantryItems === 0 && (
                        <p className="mt-4 text-sm font-medium text-slate-500 md:text-right">
                            Configurar tu despensa base te permite generar listas de compras sugeridas y evitar quedarte sin lo esencial.
                        </p>
                    )}
                </div>
            </div>

            {/* ROW 5: DESPENSA DETALLADA */}
            <div>
                <DetailedPantryWidget itemsByCategory={pantryByCategory} />
            </div>

            {/* ROW 6: HISTÓRICO DE COMPRA */}
            <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Histórico de Compra</h3>
                        {diffPercent < -50 && <span className="text-[10px] text-slate-400 font-medium">Nota: Variación alta. ¿Aún a principios de mes?</span>}
                    </div>
                    <div className="bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700/50 rounded-xl p-1 flex">
                        {(['1m', '6m', '1y'] as const).map(tf => (
                            <button key={tf} onClick={() => setChartTimeframe(tf)} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-colors", chartTimeframe === tf ? "bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#0f172a', fontWeight: 'bold' }} formatter={(value: number) => [formatCurrency(Number(value) || 0), 'Gastado']} labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }} />
                            <Area type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
