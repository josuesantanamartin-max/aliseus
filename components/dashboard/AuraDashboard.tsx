import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUserStore } from '@/store/useUserStore';
import { useLifeStore } from '@/store/useLifeStore';
import { Transaction, Budget, Account, Goal, CategoryStructure, Debt } from '@/types';
import { Moon, Sunset, Settings, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/Button';

import { WIDGET_REGISTRY, WIDGET_CONFIG, DashboardDataProps, getColSpanClass } from './WidgetRegistry';
import { getWidgetCategory } from './widgetCategories';
import BentoTile from './BentoTile';
import WidgetGallery from './WidgetGallery';
import EditModeToolbar from './EditModeToolbar';

// New Zone Imports
import IntelligenceHeader from './zones/IntelligenceHeader';
import LifeSnapshot from './zones/LifeSnapshot';
import AuraThemeBar, { AuraTheme } from './zones/AuraThemeBar';
import AuraCommandBar from './zones/AuraCommandBar';
import AuraFinanceOverview from './zones/AuraFinanceOverview';
import AuraKitchenOverview from './zones/AuraKitchenOverview';
import AuraTravelOverview from './zones/AuraTravelOverview';
import AuraFamilyOverview from './zones/AuraFamilyOverview';
import AuraInvestmentsOverview from './zones/AuraInvestmentsOverview';

// Utility for formatting currency
const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const AuraDashboard: React.FC = () => {
    const { theme, setTheme, setActiveApp, setFinanceActiveTab, setLifeActiveTab } = useUserStore();

    const {
        transactions = [], accounts = [], debts = [], categories = [], goals = [], budgets = []
    } = useFinanceStore();

    const monthlyIncome = useMemo(() => {
        const now = new Date();
        return transactions
            .filter((t: Transaction) => new Date(t.date).getMonth() === now.getMonth() && t.type === 'INCOME' && t.category !== 'Transferencia')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    }, [transactions]);

    const monthlyExpenses = useMemo(() => {
        const now = new Date();
        return transactions
            .filter((t: Transaction) => new Date(t.date).getMonth() === now.getMonth() && t.type === 'EXPENSE' && t.category !== 'Transferencia')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    }, [transactions]);

    const {
        pantryItems = [], shoppingList = [], trips = [], weeklyPlans = [], recipes = [], familyMembers = [], vaultDocuments = [], homeAssets = []
    } = useLifeStore();

    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const hour = currentTime.getHours();

    const {
        dashboardLayouts = [], activeLayoutId, isEditMode,
        setEditMode, saveLayout, setActiveLayout,
        addWidgetToLayout
    } = useUserStore();

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);

    // Aura Thematic View State
    const [activeTheme, setActiveTheme] = useState<AuraTheme>(() => {
        const saved = localStorage.getItem('aura_active_theme');
        return (saved as AuraTheme) || 'finances';
    });

    useEffect(() => {
        localStorage.setItem('aura_active_theme', activeTheme);
    }, [activeTheme]);

    const activeLayout = useMemo(
        () => dashboardLayouts.find((l: any) => l.id === activeLayoutId),
        [dashboardLayouts, activeLayoutId]
    );

    const handleNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
        setExpandedWidgetId(null);
    };

    const widgetProps: DashboardDataProps = {
        transactions,
        accounts,
        debts,
        goals,
        categories,
        budgets,
        monthlyIncome,
        monthlyExpenses,
        onNavigate: handleNavigate,
        selectedDate: currentTime,
        timeMode: 'MONTH',
    };

    const activeWidgetIds = useMemo(() => {
        if (!activeLayout) return [];
        return activeLayout.widgets.filter((w: any) => isEditMode ? true : (w.visible !== false)).map((w: any) => w.i);
    }, [activeLayout, isEditMode]);

    const handleSaveLayout = () => {
        if (!activeLayout) return;
        saveLayout({ ...activeLayout });
        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setIsGalleryOpen(false);
    };

    const handleRemoveWidget = (widgetId: string) => {
        if (!activeLayout) return;
        const updatedWidgets = activeLayout.widgets.filter((w: any) => w.i !== widgetId);
        saveLayout({ ...activeLayout, widgets: updatedWidgets });
    };

    const handleReorderDrop = (sourceId: string, targetId: string) => {
        if (!activeLayout) return;
        const sourceIndex = activeLayout.widgets.findIndex((w: any) => w.i === sourceId);
        const targetIndex = activeLayout.widgets.findIndex((w: any) => w.i === targetId);
        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;
        const newWidgets = [...activeLayout.widgets];
        const [movedWidget] = newWidgets.splice(sourceIndex, 1);
        newWidgets.splice(targetIndex, 0, movedWidget);
        saveLayout({ ...activeLayout, widgets: newWidgets });
    };

    const handleChangeWidgetSize = (widgetId: string, newSize: string) => {
        if (!activeLayout) return;
        const updatedWidgets = activeLayout.widgets.map((w: any) => {
            if (w.i === widgetId) {
                return { ...w, sizeOverride: newSize as any };
            }
            return w;
        });
        saveLayout({ ...activeLayout, widgets: updatedWidgets });
    };

    // Dynamic Tile Data generators based on Widget ID
    const getTileData = (id: string) => {
        const config = WIDGET_CONFIG[id];
        const title = config?.label || id;

        // Use some sane defaults for widgets since the detailed data is now managed in inside widgets
        return { title, value: 'Ver', icon: LayoutGrid, color: 'onyx' as const };
    };

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
        } catch (err) { }
    };

    return (
        <div
            className="h-full bg-onyx-50 dark:bg-onyx-950 overflow-y-auto custom-scrollbar relative flex flex-col pb-12"
            onDragOver={handleDashboardDragOver}
            onDrop={handleDashboardDrop}
        >
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">
                {/* --- HEADER --- */}
                <IntelligenceHeader
                    selectedDate={activeTheme === 'finances' ? selectedDate : undefined}
                    onDateChange={activeTheme === 'finances' ? setSelectedDate : undefined}
                    onNavigate={handleNavigate}
                />

                {/* --- THEME NAVIGATION --- */}
                <AuraThemeBar activeTheme={activeTheme} onThemeChange={setActiveTheme} />



                {/* --- DYNAMIC VIEWS --- */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <React.Suspense fallback={<div className="flex items-center justify-center p-12 text-onyx-400 font-bold m-auto">Cargando módulos interactivos...</div>}>
                        {activeTheme === 'finances' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraFinanceOverview selectedDate={selectedDate} />
                            </div>
                        )}

                        {activeTheme === 'kitchen' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraKitchenOverview selectedDate={selectedDate} />
                            </div>
                        )}

                        {activeTheme === 'travel' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraTravelOverview selectedDate={selectedDate} />
                            </div>
                        )}

                        {activeTheme === 'family' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraFamilyOverview selectedDate={selectedDate} />
                            </div>
                        )}

                        {activeTheme === 'investments' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraInvestmentsOverview selectedDate={selectedDate} onNavigate={handleNavigate} />
                            </div>
                        )}
                    </React.Suspense>
                </div>
            </div>

            {/* ── BENTO WIDGETS (Temporarily Hidden) ─────────────────────────────────────────
            <div className="px-8 py-8 w-full max-w-[1800px] mx-auto border-t border-onyx-100 dark:border-onyx-800/60 mt-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-onyx-900 dark:text-white">Tus Widgets</h2>
                </div>
                {activeLayout ? (
                    <div className="grid grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-max">
                        {activeWidgetIds.map((widgetId) => {
                            const widget = activeLayout.widgets.find((w) => w.i === widgetId);
                            const config = WIDGET_CONFIG[widgetId];
                            const Component = WIDGET_REGISTRY[widgetId];

                            if (!widget || !config || !Component) return null;

                            const isExpanded = expandedWidgetId === widgetId;
                            const tileData = getTileData(widgetId);

                            let calculatedSizeClass = getColSpanClass(widget.sizeOverride || config.size);
                            if (isExpanded) {
                                calculatedSizeClass = 'col-span-4 lg:col-span-12 row-span-2 shadow-2xl z-10';
                            }

                            const isComplexWidget = [
                                'CASHFLOW_WIDGET', 'CATEGORY_DONUT_WIDGET', 'ALISEUS_BRAIN_WIDGET',
                                'UPCOMING_PAYMENTS', 'MONTHLY_GOALS', 'BUDGET_STATUS', 'SAVINGS_RATE',
                                'RECENT_TRANSACTIONS', 'NET_WORTH_WIDGET', 'FAMILY_AGENDA',
                                'FAMILY_TASKS', 'UPCOMING_TRIPS'
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
                                            subValue={(tileData as any).subValue}
                                            icon={tileData.icon as any}
                                            color={tileData.color}
                                            isExpanded={isExpanded}
                                            onToggleExpand={() => setExpandedWidgetId(isExpanded ? null : widgetId)}
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
                ) : (
                    <div className="p-10 text-center">
                        <p className="text-onyx-400 font-bold mb-4">No se pudo cargar el diseño de los widgets.</p>
                        <Button variant="primary" onClick={() => setActiveLayout('default')}>Restaurar Diseño Predeterminado</Button>
                    </div>
                )}
            </div>
            */}

            <WidgetGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onDragStart={() => { }}
                onDragEnd={() => { }}
            />
        </div>
    );
};

export default AuraDashboard;
