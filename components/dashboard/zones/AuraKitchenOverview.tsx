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
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-6">
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
                                    {cat.totalCount} {cat.totalCount === 1 ? 'producto' : 'productos'}
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
            {/* ROW 1: CABECERA INTELIGENTE (Capa 0) */}
            <div className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-[background,border,color] duration-300 ${themeStyles[smartHeader.colorTheme]}`}>
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">
                        {smartHeader.dateLabel}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight max-w-3xl">
                        {smartHeader.title}
                    </h2>
                    
                    {/* MICROESTADOS */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-sm font-semibold whitespace-nowrap">
                            <span className="opacity-70 font-medium mr-1">Gasto mes</span>{formatCurrency(foodSpendingThisMonth)}
                        </span>
                        <span className="text-black/20 dark:text-white/20">•</span>
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-sm font-semibold whitespace-nowrap">
                            <span className="opacity-70 font-medium mr-1">Frescura</span>{freshnessScore}/100
                        </span>
                    </div>
                </div>
                
                <div className="shrink-0 flex items-center self-start xl:self-center">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 group text-sm">
                        <span>{smartHeader.actionLabel}</span>
                        <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ROW 2: ESTADO DE HOY / ACCIÓN (Capa 1 - 2 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Comidas de Hoy */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full min-h-[380px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-slate-400" />
                            Comidas de Hoy
                        </h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{plannedMealsCount}</span>
                            <span className="text-xs font-bold text-slate-400">/ {totalMealsCount}</span>
                        </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-onyx-800 rounded-full h-1.5 mb-3 overflow-hidden shrink-0">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000", plannedMealsCount === totalMealsCount ? "bg-emerald-500" : "bg-blue-600")}
                            style={{ width: `${(plannedMealsCount / totalMealsCount) * 100}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold mb-4 shrink-0 border-b border-transparent pb-2">
                        <span className="text-slate-500">Planificación diaria</span>
                        <span className={cn(
                            "px-3 py-1 rounded-full",
                            plannedMealsCount === totalMealsCount
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                            {plannedMealsCount === 0 ? "Sin planificar" : (plannedMealsCount === totalMealsCount ? "Día cubierto" : `Falta: ${missing.join(', ')}`)}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-3">
                        {plannedMealsCount > 0 ? (
                             Object.entries(todayMeals).map(([type, meals]: [string, any[]]) => (
                                meals.length > 0 && (
                                    <div key={type} className="flex justify-between items-center bg-slate-50 dark:bg-onyx-800/50 p-3 rounded-2xl border border-slate-100 dark:border-onyx-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                {type === 'breakfast' && <Coffee className="w-4 h-4" />}
                                                {type === 'lunch' && <ChefHat className="w-4 h-4" />}
                                                {type === 'dinner' && <Moon className="w-4 h-4" />}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate uppercase tracking-wider">{type === 'breakfast' ? 'Desayuno' : type === 'lunch' ? 'Comida' : 'Cena'}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">{meals[0]?.name}</span>
                                    </div>
                                )
                             ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-onyx-800 rounded-full flex items-center justify-center mb-3">
                                    <ChefHat className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nada previsto para hoy</p>
                                <p className="text-xs font-medium text-slate-500 mb-4 px-4">Mira tus recetas favoritas y organiza el menú del día en un toque.</p>
                                <button className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl transition-colors">Planificar hoy</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Lista de Compra */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full min-h-[380px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-slate-400" />
                            Lista de Compra
                        </h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{lowStockItems.length + shoppingList.length}</span>
                            <span className="text-xs font-bold text-slate-400">items</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold mb-4 shrink-0 border-b border-transparent pb-2">
                        <span className="text-slate-500">Urgencias y requeridos</span>
                        <span className={cn(
                            "px-3 py-1 rounded-full",
                            (lowStockItems.length === 0) 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                            {lowStockItems.length === 0 ? "Sin urgencias" : `${lowStockItems.length} críticas`}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {lowStockItems.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10">Faltantes Críticos</h4>
                                {lowStockItems.slice(0, 3).map((item) => (
                                    <div key={'us-'+item.id} className="flex justify-between items-center bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-xl">
                                        <span className="text-xs font-bold text-red-700 dark:text-red-400 truncate">{item.name}</span>
                                        <Flame className="w-3 h-3 text-red-500 opacity-50" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {shoppingList.length > 0 ? (
                            <div className="space-y-2 mt-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm py-1 z-10">Pendientes</h4>
                                {shoppingList.slice(0, 5).map((item) => (
                                    <div key={'sq-'+item.id} className="flex justify-between items-center bg-slate-50 dark:bg-onyx-800/50 p-3 rounded-xl border border-slate-100 dark:border-onyx-800">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mr-2">{item.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 tabular-nums">{item.quantity} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        ) : lowStockItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-onyx-800 rounded-full flex items-center justify-center mb-3">
                                    <ShoppingCart className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Lista vacía</p>
                                <p className="text-xs font-medium text-slate-500 mb-4 px-4">Todo lo necesario está en stock. Los planes marchan bien.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ROW 3: SNAPSHOTS / KPIs (Capa 2 - 4 Cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Salud de Stock */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Salud de Stock</h3>
                    <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight mt-1">
                        {stockHealth}%
                    </div>
                    <div className={cn("text-[10px] font-bold mt-2", stockHealth > 80 ? "text-emerald-600" : "text-amber-600")}>
                        {healthLabel}
                    </div>
                </div>

                {/* 2. Índice de Frescura */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Frescura Global</h3>
                    <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight mt-1">
                        {freshnessScore}<span className="text-sm font-bold opacity-30">/100</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-2">
                        {expiringSoon3Days.length} caducan pronto
                    </div>
                </div>

                {/* 3. Gasto Mensual */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Inversión en Despensa</h3>
                    <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight mt-1">
                        {formatCurrency(foodSpendingThisMonth)}
                    </div>
                    <div className={cn("text-[10px] font-bold mt-2", diffPercent > 0 ? "text-rose-500" : "text-emerald-500")}>
                        {diffPercent > 0 ? `+${diffPercent}% vs media` : `${diffPercent}% vs media`}
                    </div>
                </div>

                {/* 4. Inventario Total */}
                <div className="bg-white dark:bg-onyx-900 rounded-3xl p-5 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Artículos en Despensa</h3>
                    <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight mt-1">
                        {totalPantryItems}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                        {pantryByCategory.length} categorías únicas
                    </div>
                </div>
            </div>

            {/* ROW 4: DETALLES Y ANÁLISIS (Capa 3 - 2/3 + 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DetailedPantryWidget itemsByCategory={pantryByCategory} />
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Evolución de Gasto en Compra</h3>
                            <div className="bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700/50 rounded-lg p-1 flex">
                                {(['1m', '6m', '1y'] as const).map(tf => (
                                    <button key={tf} onClick={() => setChartTimeframe(tf)} className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-colors", chartTimeframe === tf ? "bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[200px] w-full mt-auto">
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
            </div>

        </div>
    );
}
