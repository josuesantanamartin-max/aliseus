import React from 'react';

// Finance Widgets
const NetWorthCard = React.lazy(() => import('../features/finance/dashboard/widgets/NetWorthCard'));
const MonthlyFlowWidget = React.lazy(() => import('../features/finance/dashboard/widgets/MonthlyFlowWidget'));
const ActiveGoalsWidget = React.lazy(() => import('../features/finance/dashboard/widgets/ActiveGoalsWidget'));
const ActiveDebtsWidget = React.lazy(() => import('../features/finance/dashboard/widgets/ActiveDebtsWidget'));
const CategoryDistributionChart = React.lazy(() => import('../features/finance/dashboard/widgets/CategoryDistributionChart'));
const BudgetStatusWidget = React.lazy(() => import('../features/finance/dashboard/widgets/BudgetStatusWidget'));
const TransactionExplorer = React.lazy(() => import('../features/finance/dashboard/widgets/TransactionExplorer'));
const SpendingForecast = React.lazy(() => import('../features/finance/dashboard/widgets/SpendingForecast'));
const FinanceProjectionWidget = React.lazy(() => import('../features/finance/FinanceProjectionWidget'));
const TimelineEvolutionWidget = React.lazy(() => import('../features/finance/dashboard/widgets/TimelineEvolutionWidget'));
const AccountsSummaryWidget = React.lazy(() => import('../features/finance/dashboard/widgets/AccountsSummaryWidget'));
const RecentTransactionsWidget = React.lazy(() => import('../features/finance/dashboard/widgets/RecentTransactionsWidget'));
const SavingsRateWidget = React.lazy(() => import('../features/finance/dashboard/widgets/SavingsRateWidget'));
const TopSpendersWidget = React.lazy(() => import('../features/finance/dashboard/widgets/TopSpendersWidget'));

// New Dashboard Widgets
const FinancialHealthWidget = React.lazy(() => import('./widgets/FinancialHealthWidget'));
const UpcomingPaymentsWidget = React.lazy(() => import('./widgets/UpcomingPaymentsWidget'));
const AnnualComparisonWidget = React.lazy(() => import('./widgets/AnnualComparisonWidget'));
const MonthlyGoalsWidget = React.lazy(() => import('./widgets/MonthlyGoalsWidget'));
const IntelligentTomorrowWidget = React.lazy(() => import('./widgets/IntelligentTomorrowWidget'));
const AliseusInsightsWidget = React.lazy(() => import('./widgets/AliseusInsightsWidget'));
const AliseusBrainFeed = React.lazy(() => import('./widgets/AliseusBrainFeed'));

// Chart Wrappers
const CashflowWidget = React.lazy(() => import('../features/finance/dashboard/widgets/CashflowWidget'));
const CategoryDonutWidget = React.lazy(() => import('../features/finance/dashboard/widgets/CategoryDonutWidget'));

// Life Widgets
const DailyMenuWidget = React.lazy(() => import('../features/life/dashboard/widgets/DailyMenuWidget'));
const PantryStatusWidget = React.lazy(() => import('../features/life/dashboard/widgets/PantryStatusWidget'));
const FamilyAgendaWidget = React.lazy(() => import('../features/life/dashboard/widgets/FamilyAgendaWidget'));
const RecipeFavoritesWidget = React.lazy(() => import('../features/life/dashboard/widgets/RecipeFavoritesWidget'));
const WeeklyPlanWidget = React.lazy(() => import('../features/life/dashboard/widgets/WeeklyPlanWidget'));
const UpcomingTripsWidget = React.lazy(() => import('../features/life/dashboard/widgets/UpcomingTripsWidget'));
const FamilyTasksWidget = React.lazy(() => import('../features/life/dashboard/widgets/FamilyTasksWidget'));
const CriticalInventoryWidget = React.lazy(() => import('../features/life/dashboard/widgets/CriticalInventoryWidget'));
const ShoppingListWidget = React.lazy(() => import('../features/life/dashboard/widgets/ShoppingListWidget'));
const LowStockPantryWidget = React.lazy(() => import('../features/life/dashboard/widgets/LowStockPantryWidget'));
const UpcomingBirthdaysWidget = React.lazy(() => import('../features/life/dashboard/widgets/UpcomingBirthdaysWidget'));

// Types
import { Transaction, Account, Debt, Goal, CategoryStructure, Budget, WidgetCategory } from '../../types';

export const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
    'NET_WORTH': NetWorthCard,
    'MONTHLY_FLOW': MonthlyFlowWidget,
    'CATEGORY_CHART': CategoryDistributionChart,
    'EXPLORER': TransactionExplorer,
    'ACTIVE_GOALS': ActiveGoalsWidget,
    'ACTIVE_DEBTS': ActiveDebtsWidget,
    'SPENDING_FORECAST': SpendingForecast,
    'TODAY_MENU': DailyMenuWidget,
    'SHOPPING_LIST': PantryStatusWidget,
    'SHOPPING_LIST_FULL': ShoppingListWidget,
    'FAMILY_AGENDA': FamilyAgendaWidget,
    'BUDGET_STATUS': BudgetStatusWidget,
    'PROJECTION_WIDGET': FinanceProjectionWidget,
    'TIMELINE_EVOLUTION': TimelineEvolutionWidget,
    'FINANCIAL_HEALTH': FinancialHealthWidget,
    'UPCOMING_PAYMENTS': UpcomingPaymentsWidget,
    'ANNUAL_COMPARISON': AnnualComparisonWidget,
    'MONTHLY_GOALS': MonthlyGoalsWidget,
    'ALISEUS_INSIGHTS': AliseusInsightsWidget,
    'ALISEUS_BRAIN_WIDGET': AliseusBrainFeed,
    'INTELLIGENT_TOMORROW': IntelligentTomorrowWidget,
    'CASHFLOW_WIDGET': CashflowWidget,
    'CATEGORY_DONUT_WIDGET': CategoryDonutWidget,
    'RECIPE_FAVORITES': RecipeFavoritesWidget,
    'WEEKLY_PLAN': WeeklyPlanWidget,
    'UPCOMING_TRIPS': UpcomingTripsWidget,
    'FAMILY_TASKS': FamilyTasksWidget,
    'CRITICAL_INVENTORY': CriticalInventoryWidget,
    'ACCOUNTS_SUMMARY': AccountsSummaryWidget,
    'RECENT_TRANSACTIONS': RecentTransactionsWidget,
    'SAVINGS_RATE': SavingsRateWidget,
    'TOP_SPENDERS': TopSpendersWidget,
    'LOW_STOCK_PANTRY': LowStockPantryWidget,
    'UPCOMING_BIRTHDAYS': UpcomingBirthdaysWidget,
};

/**
 * Widget size categories:
 *  kpi     → 3 cols  — Single metric card (number + trend)
 *  half    → 6 cols  — Half-width card (goals, debts, health)
 *  wide    → 8 cols  — Wide chart/card (net worth, projection)
 *  sidebar → 4 cols  — Sidebar panel (agenda, menu, accounts)
 *  full    → 12 cols — Full-width (tables, charts, explorer)
 */
export type WidgetSize = 'kpi' | 'half' | 'wide' | 'sidebar' | 'full';

export function getColSpanClass(size: WidgetSize): string {
    switch (size) {
        // Bento grid is grid-cols-4 lg:grid-cols-12
        case 'kpi': return 'col-span-4 sm:col-span-2 lg:col-span-3';          // 25% desktop
        case 'sidebar': return 'col-span-4 sm:col-span-2 lg:col-span-4';      // 33% desktop
        case 'half': return 'col-span-4 lg:col-span-6';         // 50% desktop
        case 'wide': return 'col-span-4 lg:col-span-8';         // 66% desktop
        case 'full': return 'col-span-4 lg:col-span-12';        // 100% desktop
        default: return 'col-span-4 lg:col-span-6';
    }
}

// Widget Layout Configuration
export const WIDGET_CONFIG: Record<string, { size: WidgetSize; label: string; category: WidgetCategory }> = {
    'NET_WORTH': { size: 'wide', label: 'Patrimonio Neto', category: 'FINANCE' },
    'MONTHLY_FLOW': { size: 'sidebar', label: 'Flujo Mensual', category: 'FINANCE' },
    'CATEGORY_CHART': { size: 'full', label: 'Distribución Gastos', category: 'FINANCE' },
    'EXPLORER': { size: 'full', label: 'Explorador Transacciones', category: 'FINANCE' },
    'ACTIVE_GOALS': { size: 'half', label: 'Metas Activas', category: 'FINANCE' },
    'ACTIVE_DEBTS': { size: 'half', label: 'Deudas Activas', category: 'FINANCE' },
    'SPENDING_FORECAST': { size: 'half', label: 'Previsión Gastos', category: 'FINANCE' },
    'BUDGET_STATUS': { size: 'full', label: 'Estado Presupuestos', category: 'FINANCE' },
    'PROJECTION_WIDGET': { size: 'wide', label: 'Proyección Balance', category: 'FINANCE' },
    'TIMELINE_EVOLUTION': { size: 'full', label: 'Evolución Temporal', category: 'FINANCE' },
    'FINANCIAL_HEALTH': { size: 'half', label: 'Salud Financiera', category: 'FINANCE' },
    'UPCOMING_PAYMENTS': { size: 'half', label: 'Próximos Pagos', category: 'FINANCE' },
    'ANNUAL_COMPARISON': { size: 'half', label: 'Comparativa Anual', category: 'FINANCE' },
    'MONTHLY_GOALS': { size: 'half', label: 'Objetivos del Mes', category: 'FINANCE' },
    'ALISEUS_INSIGHTS': { size: 'half', label: 'Aliseus Insights', category: 'FINANCE' },
    'ALISEUS_BRAIN_WIDGET': { size: 'sidebar', label: 'Aliseus Brain Feed', category: 'FINANCE' },
    'CASHFLOW_WIDGET': { size: 'half', label: 'Flujo de Caja Mensual', category: 'FINANCE' },
    'CATEGORY_DONUT_WIDGET': { size: 'sidebar', label: 'Distribución Top 5', category: 'FINANCE' },
    'ACCOUNTS_SUMMARY': { size: 'sidebar', label: 'Resumen Cuentas', category: 'FINANCE' },
    'RECENT_TRANSACTIONS': { size: 'half', label: 'Transacciones Recientes', category: 'FINANCE' },
    'SAVINGS_RATE': { size: 'kpi', label: 'Tasa de Ahorro', category: 'FINANCE' },
    'TOP_SPENDERS': { size: 'half', label: 'Top Gastos', category: 'FINANCE' },

    'TODAY_MENU': { size: 'wide', label: 'Menú de Hoy', category: 'KITCHEN' },
    'SHOPPING_LIST': { size: 'sidebar', label: 'Despensa & Lista', category: 'KITCHEN' },
    'SHOPPING_LIST_FULL': { size: 'half', label: 'Lista de Compra Completa', category: 'KITCHEN' },
    'RECIPE_FAVORITES': { size: 'half', label: 'Recetas Favoritas', category: 'KITCHEN' },
    'WEEKLY_PLAN': { size: 'full', label: 'Plan Semanal', category: 'KITCHEN' },
    'CRITICAL_INVENTORY': { size: 'half', label: 'Inventario Crítico', category: 'KITCHEN' },
    'LOW_STOCK_PANTRY': { size: 'half', label: 'Despensa Baja', category: 'KITCHEN' },

    'FAMILY_AGENDA': { size: 'sidebar', label: 'Agenda Familiar', category: 'LIFE' },
    'UPCOMING_TRIPS': { size: 'half', label: 'Próximos Viajes', category: 'LIFE' },
    'FAMILY_TASKS': { size: 'half', label: 'Tareas Familiares', category: 'LIFE' },
    'UPCOMING_BIRTHDAYS': { size: 'kpi', label: 'Próximos Cumpleaños', category: 'LIFE' },
    'INTELLIGENT_TOMORROW': { size: 'wide', label: 'Mañana Inteligente', category: 'LIFE' },
};

// Helper type for props passed to dynamic widgets
export interface DashboardDataProps {
    transactions: Transaction[];
    accounts: Account[];
    debts: Debt[];
    goals: Goal[];
    categories: CategoryStructure[];
    budgets: Budget[];

    // Computed values
    monthlyIncome: number;
    monthlyExpenses: number;

    // UI State
    onNavigate: (app: string, tab?: string) => void;
    selectedDate: Date;
    timeMode: 'MONTH' | 'YEAR';

    // Handlers
    onFilter?: (category: string, subCategory?: string) => void;

    // Dynamic State
    isExpanded?: boolean;
}

