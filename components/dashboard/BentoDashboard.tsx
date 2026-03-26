import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUserStore } from '../../store/useUserStore';
import { useLifeStore } from '../../store/useLifeStore';
import {
    Settings, Coffee, Sunset, Moon, Search, LayoutGrid, CalendarRange, Wallet,
    TrendingUp, Target, Receipt, CreditCard, ShoppingBag, Utensils, Heart, PiggyBank,
    Activity, Clock, CalendarDays, LineChart, PieChart, ShieldCheck, Map, ClipboardList, AlertTriangle, BookOpen, Layers, ShoppingCart,
    Zap, Calendar, ChefHat, Users, Plane, Sparkles
} from 'lucide-react';
import { WidgetCategory } from '../../types';

import CashflowAreaChart from './charts/CashflowAreaChart';
import NetWorthSparkline from './charts/NetWorthSparkline';
import CategoryDonutChart from './charts/CategoryDonutChart';
import AliseusBrainFeed from './widgets/AliseusBrainFeed';

import { WIDGET_REGISTRY, WIDGET_CONFIG, DashboardDataProps, getColSpanClass } from './WidgetRegistry';
import { getWidgetCategory } from './widgetCategories';
import BentoSection from './BentoSection';
import BentoTile from './BentoTile';
import GlobalSearch from '../ui/GlobalSearch';
import SampleDataBanner from '../common/SampleDataBanner';
import SampleDataExplainer from '../common/SampleDataExplainer';
import { AnimatedList, AnimatedListItem } from '../common/animations/AnimatedList';
import { Button } from '../ui/Button';
import LayoutSelector from './LayoutSelector';
import WidgetGallery from './WidgetGallery';
import EditModeToolbar from './EditModeToolbar';

const GREETINGS = {
    morning: { text: 'Buenos días, Jefe', sub: 'Comienza el día con claridad financiera.', icon: Coffee, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
    afternoon: { text: 'Buenas tardes', sub: 'Mantén el ritmo de tus objetivos.', icon: Sunset, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
    evening: { text: 'Buenas noches', sub: 'Revisa tus logros y descansa.', icon: Moon, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
};

const BentoDashboard: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    // State to track which widget is inline-expanded. Null = none.
    const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);

    const {
        dashboardLayouts, activeLayoutId, activeDashboardView, isEditMode,
        setEditMode, saveLayout, setActiveLayout, setActiveDashboardView,
        setActiveApp, setFinanceActiveTab, setLifeActiveTab,
        theme, setTheme, hasCompletedOnboarding, cookiePreferences,
        addWidgetToLayout
    } = useUserStore();

    const {
        transactions = [],
        accounts = [],
        debts = [],
        goals = [],
        categories = [],
        budgets = []
    } = useFinanceStore();

    const {
        weeklyPlans = [],
        pantryItems = [],
        shoppingList = [],
        recipes = [],
        trips = [],
        familyMembers = [],
        vaultDocuments = [],
        homeAssets = []
    } = useLifeStore();

    const [timeMode, setTimeMode] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);



    const activeLayout = useMemo(
        () => dashboardLayouts.find(l => l.id === activeLayoutId),
        [dashboardLayouts, activeLayoutId]
    );

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const greeting = GREETINGS[timeOfDay];

    const getContextualSub = () => {
        const today = new Date().getDate();
        const todayDebt = debts.find(d => { const d2 = parseInt(d.dueDate, 10); return d2 === today || d2 === today + 1; });
        if (todayDebt) return `⚡ Pago pendiente: ${todayDebt.name}`;
        const lowStock = pantryItems.filter(i => i.quantity <= (i.lowStockThreshold || 0));
        if (lowStock.length > 0) return `📦 ${lowStock.length} artículo${lowStock.length > 1 ? 's' : ''} bajo${lowStock.length > 1 ? 's' : ''} en despensa`;
        const nextTrip = trips.find((t: any) => t.status === 'UPCOMING');
        if (nextTrip) { const days = Math.ceil((new Date((nextTrip as any).startDate).getTime() - Date.now()) / 86400000); if (days >= 0 && days <= 14) return `✈️ Tu viaje a ${(nextTrip as any).destination} en ${days} día${days !== 1 ? 's' : ''}`; }
        return greeting.sub;
    };

    const handleNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
        setExpandedWidgetId(null); // Collapse widget on navigate
    };

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const currentPeriodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return timeMode === 'YEAR'
            ? tDate.getFullYear() === year
            : tDate.getFullYear() === year && tDate.getMonth() === month;
    });

    const monthlyIncome = currentPeriodTransactions
        .filter(t => t.type === 'INCOME' && t.category !== 'Transferencia')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const monthlyExpenses = currentPeriodTransactions
        .filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const widgetProps: DashboardDataProps = {
        transactions, accounts, debts, goals, categories, budgets,
        monthlyIncome, monthlyExpenses,
        onNavigate: handleNavigate,
        selectedDate, timeMode,
        onFilter: () => { setActiveApp('finance'); setFinanceActiveTab('transactions'); },
    };

    // Helper to get exactly which widgets are active in the current layout
    const activeWidgetIds = useMemo(() => {
        if (!activeLayout) return [];
        // In Edit Mode, we show visible items so user can interact with them
        // Default to true for backward compatibility with older saved layouts
        return activeLayout.widgets.filter(w => isEditMode ? true : (w.visible !== false)).map(w => w.i);
    }, [activeLayout, isEditMode]);

    // Save / Cancel Layout changes
    const handleSaveLayout = () => {
        if (!activeLayout) return;
        // The order logic from legacy dashboard is currently skipped 
        // as BentoSection renders categories automatically.
        saveLayout({ ...activeLayout });
        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleCancelEdit = () => {
        // In a real implementation we would revert widgetOrder here.
        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleRemoveWidget = (widgetId: string) => {
        if (!activeLayout) return;
        const updatedWidgets = activeLayout.widgets.filter(w => w.i !== widgetId);
        saveLayout({ ...activeLayout, widgets: updatedWidgets });
    };

    const handleReorderDrop = (sourceId: string, targetId: string) => {
        if (!activeLayout) return;

        // Find indices
        const sourceIndex = activeLayout.widgets.findIndex(w => w.i === sourceId);
        const targetIndex = activeLayout.widgets.findIndex(w => w.i === targetId);

        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

        // Clone the widgets array to mutate
        const newWidgets = [...activeLayout.widgets];

        // Remove the source widget
        const [movedWidget] = newWidgets.splice(sourceIndex, 1);

        // At this point the target index might have shifted if sourceIndex < targetIndex
        const insertIndex = sourceIndex < targetIndex ? targetIndex : targetIndex;

        // Insert the dragged widget at the target position
        newWidgets.splice(insertIndex, 0, movedWidget);

        // Save the newly ordered layout
        saveLayout({ ...activeLayout, widgets: newWidgets });
    };

    const handleChangeWidgetSize = (widgetId: string, newSize: string) => {
        if (!activeLayout) return;
        const updatedWidgets = activeLayout.widgets.map(w => {
            if (w.i === widgetId) {
                // We cast newSize to the specific types allowed, or just let TS infer if it's wide enough
                return { ...w, sizeOverride: newSize as any };
            }
            return w;
        });
        saveLayout({ ...activeLayout, widgets: updatedWidgets });
    };

    // Formatters
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // Dynamic Tile Data generators based on Widget ID
    const getTileData = (id: string) => {
        const config = WIDGET_CONFIG[id];
        const title = config?.label || id;

        switch (id) {
            case 'NET_WORTH':
                const netWorth = accounts.reduce((acc, a) => acc + a.balance, 0) - debts.reduce((acc, d) => acc + d.remainingBalance, 0);
                return { title, value: formatCurrency(netWorth), icon: Wallet, color: 'cyan' as const };
            case 'MONTHLY_FLOW':
                return { title, value: formatCurrency(monthlyIncome - monthlyExpenses), subValue: `Ing: ${formatCurrency(monthlyIncome)} | Gto: ${formatCurrency(monthlyExpenses)}`, icon: TrendingUp, color: 'emerald' as const };
            case 'TOP_CATEGORIES':
                return { title, value: 'Gastos', subValue: 'Por categoría', icon: CreditCard, color: 'rose' as const };
            case 'SAVINGS_RATE':
                const rate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
                return { title, value: `${rate.toLocaleString('es-ES', { maximumFractionDigits: 1 })}%`, subValue: 'Tasa de Ahorro', icon: Target, color: 'blue' as const };
            case 'RECENT_TRANSACTIONS':
                return { title, value: transactions.length, subValue: 'Últimas transacciones', icon: Receipt, color: 'onyx' as const };
            case 'TOP_SPENDERS':
                return { title, value: 'Top 3', subValue: 'Mayores gastos', icon: ShoppingBag, color: 'rose' as const };
            case 'ANNUAL_COMPARISON':
                return { title, value: year.toString(), subValue: 'vs Histórico', icon: CalendarRange, color: 'cyan' as const };
            case 'ACTIVE_GOALS':
                const activeCount = goals.filter(g => g.currentAmount < g.targetAmount).length;
                return { title, value: activeCount, subValue: 'Objetivos activos', icon: Target, color: 'amber' as const };
            case 'ACCOUNTS_SUMMARY':
                return { title, value: accounts.length, subValue: 'Cuentas activas', icon: Layers, color: 'cyan' as const };
            case 'FINANCIAL_HEALTH':
                return { title, value: 'Estado', subValue: 'Métricas clave', icon: Activity, color: 'emerald' as const };
            case 'UPCOMING_PAYMENTS':
                return { title, value: debts.length, subValue: 'Por vencer', icon: Clock, color: 'rose' as const };
            case 'MONTHLY_GOALS':
                return { title, value: 'Proyección', subValue: 'Del mes', icon: Target, color: 'teal' as const };
            case 'PROJECTION_WIDGET':
                return { title, value: 'Futuro', subValue: 'Proyección de balance', icon: LineChart, color: 'blue' as const };
            case 'EXPLORER':
                return { title, value: 'Búsqueda', subValue: 'Explorador avanzado', icon: Search, color: 'cyan' as const };
            case 'CATEGORY_CHART':
                return { title, value: 'Desglose', subValue: 'Distribución', icon: PieChart, color: 'onyx' as const };
            case 'SPENDING_FORECAST':
                return { title, value: 'Tendencia', subValue: 'Previsión de gasto', icon: TrendingUp, color: 'rose' as const };
            case 'BUDGET_STATUS':
                return { title, value: budgets.length, subValue: 'Presupuestos', icon: PiggyBank, color: 'amber' as const };
            case 'TIMELINE_EVOLUTION':
                return { title, value: 'Evolución', subValue: 'Histórico', icon: LineChart, color: 'blue' as const };
            case 'LOW_STOCK_PANTRY':
                const lowCount = pantryItems.filter(i => i.quantity <= (i.lowStockThreshold || 0)).length;
                return { title, value: lowCount, subValue: 'Artículos bajos', icon: ShoppingBag, color: 'rose' as const };
            case 'TODAY_MENU':
                return { title, value: 'Menú', subValue: 'Plan de hoy', icon: Utensils, color: 'emerald' as const };
            case 'SHOPPING_LIST':
                return { title, value: shoppingList.length, subValue: 'Por comprar', icon: ShoppingCart, color: 'amber' as const };
            case 'SHOPPING_LIST_FULL':
                return { title, value: shoppingList.length, subValue: 'Artículos en lista', icon: ShoppingCart, color: 'amber' as const };
            case 'FAMILY_AGENDA':
                return { title, value: 'Eventos', subValue: 'Próximos', icon: CalendarDays, color: 'cyan' as const };
            case 'RECIPE_FAVORITES':
                return { title, value: 'Recetas', subValue: 'Guardadas', icon: BookOpen, color: 'rose' as const };
            case 'WEEKLY_PLAN':
                return { title, value: weeklyPlans.length, subValue: 'Días planificados', icon: CalendarDays, color: 'teal' as const };
            case 'UPCOMING_TRIPS':
                return { title, value: 'Viajes', subValue: 'Agendados', icon: Map, color: 'blue' as const };
            case 'FAMILY_TASKS':
                return { title, value: 'Por hacer', subValue: 'Tareas pendientes', icon: ClipboardList, color: 'emerald' as const };
            case 'CRITICAL_INVENTORY':
                return { title, value: 'Avisos', subValue: 'Inventario crítico', icon: AlertTriangle, color: 'rose' as const };
            case 'UPCOMING_BIRTHDAYS':
                return { title, value: familyMembers.length, subValue: 'Cumpleaños', icon: Heart, color: 'rose' as const };
            default:
                return { title, value: 'Ver', icon: LayoutGrid, color: 'onyx' as const };
        }
    };

    // Group active widgets by logical sections
    const financeCoreWidgets = activeWidgetIds.filter(id => getWidgetCategory(id) === 'FINANCE' && ['NET_WORTH', 'MONTHLY_FLOW', 'SAVINGS_RATE', 'ANNUAL_COMPARISON'].includes(id));
    const financeDetailWidgets = activeWidgetIds.filter(id => getWidgetCategory(id) === 'FINANCE' && !financeCoreWidgets.includes(id));

    // Categorize life widgets into Kitchen and General Life
    const kitchenWidgets = activeWidgetIds.filter(id => getWidgetCategory(id) === 'KITCHEN');
    const lifeGeneralWidgets = activeWidgetIds.filter(id => getWidgetCategory(id) === 'LIFE');

    // Full Widget renderer
    const renderFullWidget = (widgetId: string) => {
        const WidgetComponent = WIDGET_REGISTRY[widgetId];
        if (!WidgetComponent) {
            return <p>Widget "{widgetId}" no encontrado en el registro.</p>;
        }
        return <WidgetComponent {...widgetProps} />;
    };

    if (!activeLayout) {
        return (
            <div className="p-10 text-center">
                <p className="text-onyx-400 dark:text-onyx-500 font-bold mb-4">No se pudo cargar el diseño.</p>
                <Button variant="primary" onClick={() => setActiveLayout('default')}>
                    Restaurar Diseño Predeterminado
                </Button>
            </div>
        );
    }

    const handleDashboardDragOver = (e: React.DragEvent) => {
        if (isEditMode) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleDashboardDrop = (e: React.DragEvent) => {
        if (!isEditMode) return;
        e.preventDefault();
        try {
            const dataStr = e.dataTransfer.getData('application/json');
            if (dataStr) {
                const data = JSON.parse(dataStr);
                if (data.source === 'gallery' && data.widgetId) {
                    addWidgetToLayout(data.widgetId);
                }
            }
        } catch (err) {
            // Not JSON or other error, ignore
        }
    };

    return (
        <div
            className="h-full bg-onyx-50/30 dark:bg-onyx-950/30 overflow-y-auto custom-scrollbar relative"
            onDragOver={handleDashboardDragOver}
            onDrop={handleDashboardDrop}
        >
            <SampleDataBanner />
            <div className="mb-2 px-6 md:px-10 mt-4 max-w-[1800px] mx-auto">
                <SampleDataExplainer section={activeDashboardView} />
            </div>

            {/* ── Dynamic Hero Header ─────────────────────────────────── */}
            <div className="px-6 md:px-10 pt-10 pb-6 relative overflow-hidden group/header">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="animate-fade-in-up">
                        <div className={`flex items-center gap-2 ${greeting.color} font-extrabold text-[10px] uppercase tracking-[0.3em] mb-3 ${greeting.bg} w-fit px-4 py-1.5 rounded-full border border-current/10 shadow-sm`}>
                            <greeting.icon className="w-4 h-4" /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            <span className="opacity-40">·</span>
                            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-onyx-900 dark:text-white tracking-tighter transition-all group-hover/header:-translate-y-1">
                            {greeting.text}
                        </h1>
                        <p className="text-onyx-400 dark:text-onyx-500 font-bold mt-1 text-sm md:text-base mb-6">{getContextualSub()}</p>

                        {/* Multi-Dashboard Navigation */}
                        <div className="flex items-center gap-2 p-1 bg-onyx-100/50 dark:bg-onyx-800/50 backdrop-blur-md rounded-2xl border border-onyx-200/50 dark:border-onyx-700/50 w-fit">
                            {[
                                { id: 'FINANCE', label: 'Finanzas', icon: Wallet, layoutId: 'default', color: 'cyan' },
                                { id: 'KITCHEN', label: 'Cocina', icon: Utensils, layoutId: 'kitchen', color: 'emerald' },
                                { id: 'LIFE', label: 'Vida', icon: Heart, layoutId: 'life', color: 'rose' },
                            ].map((view) => {
                                const isActive = activeDashboardView === view.id;
                                const Icon = view.icon;
                                return (
                                    <button
                                        key={view.id}
                                        onClick={() => {
                                            setActiveDashboardView(view.id as any);
                                            setActiveLayout(view.layoutId);
                                        }}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                            ? `bg-white dark:bg-onyx-700 text-${view.color}-600 dark:text-${view.color}-400 shadow-md scale-105`
                                            : 'text-onyx-500 hover:text-onyx-700 dark:hover:text-onyx-300 hover:bg-white/50 dark:hover:bg-onyx-700/50'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                        <span className="hidden sm:inline">{view.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/50 dark:bg-onyx-900/50 backdrop-blur-md p-2 rounded-2xl border border-onyx-100 dark:border-onyx-800 shadow-sm">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Aliseus v2.0</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold text-onyx-400 uppercase">Premium Active</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-xl hover:bg-onyx-100 dark:hover:bg-onyx-800">
                                <Search className="w-4 h-4 text-onyx-600 dark:text-onyx-400" />
                            </Button>
                            <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl hover:bg-onyx-100 dark:hover:bg-onyx-800">
                                {theme === 'dark' ? <Sunset className="w-4 h-4 text-onyx-400" /> : <Moon className="w-4 h-4 text-onyx-600" />}
                            </Button>
                            <div className="w-px h-6 bg-onyx-200 dark:bg-onyx-700 mx-1"></div>
                            {!isEditMode ? (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setEditMode(true);
                                        setIsGalleryOpen(true);
                                    }}
                                    className="px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-cyan-200 dark:shadow-cyan-900/40"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Personalizar</span>
                                </Button>
                            ) : (
                                <EditModeToolbar
                                    onSave={handleSaveLayout}
                                    onCancel={handleCancelEdit}
                                    onAddWidget={() => setIsGalleryOpen(true)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-400/5 dark:bg-cyan-400/10 blur-[120px] rounded-full pointer-events-none"></div>
            </div>

            <div className="px-6 md:px-10 py-8 max-w-[1800px] mx-auto">
                <div className="grid grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-max">
                    {activeWidgetIds.map((widgetId) => {
                        const widget = activeLayout.widgets.find((w) => w.i === widgetId);
                        const config = WIDGET_CONFIG[widgetId];
                        const Component = WIDGET_REGISTRY[widgetId];

                        if (!widget || !config || !Component) return null;

                        const isExpanded = expandedWidgetId === widgetId;
                        const tileData = getTileData(widgetId);

                        // Layout size logic handling
                        let calculatedSizeClass = getColSpanClass(widget.sizeOverride || config.size);

                        // Expanded state overrides size to be full width
                        if (isExpanded) {
                            calculatedSizeClass = 'col-span-4 lg:col-span-12 row-span-2 shadow-2xl z-10';
                        }

                        // Determine if a widget should just render its own Component (ComplexWidgets)
                        // Or if it should be wrapped in BentoTile (KPI standard blocks)
                        const isComplexWidget = [
                            'CASHFLOW_WIDGET',
                            'CATEGORY_DONUT_WIDGET',
                            'ALISEUS_BRAIN_WIDGET',
                            'UPCOMING_PAYMENTS',
                            'MONTHLY_GOALS',
                            'BUDGET_STATUS',
                            'SAVINGS_RATE',
                            'RECENT_TRANSACTIONS',
                            'NET_WORTH_WIDGET', // The new dense version
                            'FAMILY_AGENDA',
                            'FAMILY_TASKS',
                            'UPCOMING_TRIPS'
                        ].includes(widgetId);

                        return (
                            <div key={widgetId} className={`${calculatedSizeClass} flex transition-all duration-500 ease-in-out`}>
                                {isComplexWidget ? (
                                    <Component {...widgetProps} isExpanded={isExpanded} />
                                ) : (
                                    <BentoTile
                                        id={widgetId}
                                        title={tileData.title}
                                        value={tileData.value}
                                        subValue={tileData.subValue}
                                        icon={tileData.icon}
                                        color={tileData.color}
                                        isExpanded={isExpanded}
                                        onToggleExpand={() => setExpandedWidgetId(isExpanded ? null : widgetId)}
                                        // Standard KPI widgets use fullWidgetComponent when expanded
                                        fullWidgetComponent={<Component {...widgetProps} isExpanded={true} />}
                                        isEditMode={isEditMode}
                                        onRemove={() => handleRemoveWidget(widgetId)}
                                        size={widget.sizeOverride || config.size}
                                        onChangeSize={(sz) => handleChangeWidgetSize(widgetId, sz)}
                                        onReorderDrop={handleReorderDrop}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <WidgetGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onDragStart={() => { }}
                onDragEnd={() => { }}
            />
        </div>
    );
};

export default BentoDashboard;

