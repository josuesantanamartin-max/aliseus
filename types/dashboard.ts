// Global Dashboard Widgets
export type WidgetType = 'NET_WORTH' | 'MONTHLY_FLOW' | 'ACTIVE_GOALS' | 'ACTIVE_DEBTS' | 'SHOPPING_LIST' | 'TODAY_MENU' | 'RECENT_TRANSACTIONS' | 'EXPLORER' | 'CATEGORY_CHART' | 'TREND_CHART' | 'COMPARISON_CHART' | 'SPENDING_FORECAST' | 'FAMILY_AGENDA' | 'BUDGET_STATUS' | 'PROJECTION_WIDGET' | 'TIMELINE_EVOLUTION' | 'FINANCIAL_HEALTH' | 'UPCOMING_PAYMENTS' | 'ANNUAL_COMPARISON' | 'MONTHLY_GOALS' | 'RECIPE_FAVORITES' | 'WEEKLY_PLAN' | 'UPCOMING_TRIPS' | 'FAMILY_TASKS' | 'CRITICAL_INVENTORY' | 'ACCOUNTS_SUMMARY';

export type WidgetCategory = 'FINANCE' | 'LIFE' | 'KITCHEN' | 'ALL';


export interface DashboardDataProps {
    transactions: any[]; // Using any temporarily if imports are complex, but ideally specific types
    accounts: any[];
    debts: any[];
    goals: any[];
    categories: any[];
    budgets: any[];

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
