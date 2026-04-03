/**
 * AI Dashboard Types & Layout Interfaces
 * Aliseus 2026 - Private Beta
 */

export type WidgetType = 
    | 'NET_WORTH' 
    | 'MONTHLY_FLOW' 
    | 'ACTIVE_GOALS' 
    | 'ACTIVE_DEBTS' 
    | 'SHOPPING_LIST' 
    | 'TODAY_MENU' 
    | 'RECENT_TRANSACTIONS' 
    | 'EXPLORER' 
    | 'CATEGORY_CHART' 
    | 'TREND_CHART' 
    | 'COMPARISON_CHART' 
    | 'SPENDING_FORECAST' 
    | 'FAMILY_AGENDA' 
    | 'BUDGET_STATUS' 
    | 'PROJECTION_WIDGET' 
    | 'TIMELINE_EVOLUTION' 
    | 'FINANCIAL_HEALTH' 
    | 'UPCOMING_PAYMENTS' 
    | 'ANNUAL_COMPARISON' 
    | 'MONTHLY_GOALS' 
    | 'RECIPE_FAVORITES' 
    | 'WEEKLY_PLAN' 
    | 'UPCOMING_TRIPS' 
    | 'FAMILY_TASKS' 
    | 'CRITICAL_INVENTORY' 
    | 'ACCOUNTS_SUMMARY'
    | 'STATS_ROW'
    | 'TODAY_MENU_CARD'
    | 'HEALTH_SCORE'
    | 'KPI_CARDS';

export type WidgetCategory = 'FINANCE' | 'LIFE' | 'KITCHEN' | 'ALL';

export interface DashboardWidget {
    id: WidgetType | string;
    visible: boolean;
    order: number;
}

// Alias usado por FinanceSummary para el control de visibilidad de widgets financieros
export type FinanceWidgetType =
    | 'HEALTH_SCORE'
    | 'KPI_CARDS'
    | 'BUDGET_GOALS_SUMMARY'
    | 'CHART_EVOLUTION'
    | 'CHART_FLOW'
    | 'TOP_EXPENSES'
    | 'RECENT_LIST';

export interface WidgetLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    visible?: boolean;
}

export interface DashboardLayout {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    widgets: WidgetLayout[];
    createdAt: string;
    updatedAt: string;
}

export interface DashboardDataProps {
    transactions: any[];
    accounts: any[];
    debts: any[];
    goals: any[];
    categories: any[];
    budgets: any[];
    monthlyIncome: number;
    monthlyExpenses: number;
    onNavigate: (app: string, tab?: string) => void;
    selectedDate: Date;
    timeMode: 'MONTH' | 'YEAR';
    onFilter?: (category: string, subCategory?: string) => void;
    isExpanded?: boolean;
}
