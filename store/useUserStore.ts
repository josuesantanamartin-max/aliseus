import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Language, QuickAction, AutomationRule, DashboardWidget, SyncLog, DashboardLayout, UserPersona, FamilyMember } from '../types';
import { DEFAULT_RULES, DEFAULT_WIDGETS, DEFAULT_LAYOUTS } from '../constants';
import { getWidgetCategory } from '../components/dashboard/widgetCategories';

export interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
    version: string;
}

export interface AIPreferences {
    enableRecommendations: boolean;
    allowDataUsage: boolean;
}

interface UserState {
    isAuthenticated: boolean;
    isDemoMode: boolean;
    activeApp: string;
    language: Language;
    currency: 'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR';
    theme: 'light' | 'dark' | 'system';

    financeActiveTab: string;
    financeSelectedAccountId: string | null;
    lifeActiveTab: string;
    isSidebarOpen: boolean;
    isFabOpen: boolean;
    quickAction: QuickAction | null;

    automationRules: AutomationRule[];
    dashboardWidgets: DashboardWidget[];
    syncLogs: SyncLog[];

    // Dashboard Customization
    dashboardLayouts: DashboardLayout[];
    activeLayoutId: string;
    activeDashboardView: 'FINANCE' | 'KITCHEN' | 'LIFE';
    isEditMode: boolean;
    userProfile: {
        id?: string;
        email?: string;
        full_name?: string;
        avatar_url?: string;
        persona_type?: UserPersona[];
        familyMembers?: FamilyMember[];
    } | null;

    // Saved Search & Filters
    recentSearches: string[];
    savedFilters: SavedFilter[];

    // Onboarding State
    hasCompletedOnboarding: boolean;
    onboardingStep: number;
    onboardingFocus: string[];
    seenTooltips: string[];
    sampleDataContext: boolean;

    subscription: {
        plan: 'FREE' | 'PERSONAL' | 'FAMILIA';
        status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIAL' | 'NONE';
        expiryDate?: string;
    };
    lastSyncTime: string | null;
    defaultShoppingAccount: string | null; // ID de cuenta preferida para compras de cocina

    // Privacy Features
    cookiePreferences: CookiePreferences | null;
    aiPreferences: AIPreferences;
    accountDeletionScheduled: string | null; // ISO timestamp
    lastDataExport: string | null; // ISO timestamp
}

export interface SavedFilter {
    id: string;
    name: string;
    query: string;
    type: 'TRANSACTION' | 'GENERAL';
    createdAt: string;
}

interface UserActions {
    setAuthenticated: (value: boolean) => void;
    setDemoMode: (value: boolean) => void;
    setActiveApp: (app: string) => void;
    setLanguage: (lang: Language) => void;
    setCurrency: (currency: 'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR') => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setSubscription: (sub: UserState['subscription']) => void;
    setUserProfile: (profile: UserState['userProfile']) => void;

    // Search Actions
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
    addSavedFilter: (filter: SavedFilter) => void;
    removeSavedFilter: (filterId: string) => void;

    // Onboarding Actions
    completeOnboarding: () => void;
    setOnboardingStep: (step: number) => void;
    setOnboardingFocus: (focus: string[]) => void;
    markTooltipSeen: (id: string) => void;
    setSampleDataContext: (v: boolean) => void;

    setFinanceActiveTab: (tab: string) => void;
    setFinanceSelectedAccountId: (id: string | null) => void;
    setLifeActiveTab: (tab: string) => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setFabOpen: (isOpen: boolean) => void;
    setQuickAction: (action: QuickAction | null) => void;

    setAutomationRules: (rules: AutomationRule[] | ((prev: AutomationRule[]) => AutomationRule[])) => void;
    setDashboardWidgets: (widgets: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;

    // Dashboard Layout Actions
    setActiveLayout: (layoutId: string) => void;
    setActiveDashboardView: (view: 'FINANCE' | 'KITCHEN' | 'LIFE') => void;
    saveLayout: (layout: DashboardLayout) => void;
    deleteLayout: (layoutId: string) => void;
    setEditMode: (enabled: boolean) => void;
    addWidgetToLayout: (widgetId: string) => void;
    removeWidgetFromLayout: (widgetId: string) => void;
    toggleWidgetVisibility: (widgetId: string) => void;
    changeWidgetSize: (widgetId: string, newSize: 'kpi' | 'half' | 'wide' | 'sidebar' | 'full') => void;

    duplicateLayout: (layoutId: string) => void;
    renameLayout: (layoutId: string, newName: string) => void;

    addSyncLog: (log: SyncLog) => void;
    setLastSyncTime: (time: string) => void;
    setDefaultShoppingAccount: (accountId: string | null) => void;

    // Privacy Actions
    setCookiePreferences: (prefs: CookiePreferences) => void;
    setAIPreferences: (prefs: Partial<AIPreferences>) => void;
    scheduleAccountDeletion: () => void;
    cancelAccountDeletion: () => void;
    setLastDataExport: (date: string) => void;
}

export const useUserStore = create<UserState & UserActions>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            isDemoMode: false,
            activeApp: 'dashboard',
            language: 'ES',
            currency: 'EUR',
            theme: 'light',
            financeActiveTab: 'transactions',
            financeSelectedAccountId: null,
            lifeActiveTab: 'kitchen-dashboard',
            isSidebarOpen: false,
            isFabOpen: false,
            quickAction: null,
            automationRules: DEFAULT_RULES,
            dashboardWidgets: DEFAULT_WIDGETS,
            syncLogs: [],
            dashboardLayouts: DEFAULT_LAYOUTS,
            activeLayoutId: 'default',
            activeDashboardView: 'FINANCE',
            isEditMode: false,
            userProfile: null,

            // Search Defaults
            recentSearches: [],
            savedFilters: [],

            // Onboarding defaults
            hasCompletedOnboarding: false,
            onboardingStep: 0,
            onboardingFocus: [],
            seenTooltips: [],
            sampleDataContext: false,

            subscription: { plan: 'FREE', status: 'NONE' },
            lastSyncTime: null,
            defaultShoppingAccount: null,

            // Privacy Defaults
            cookiePreferences: null,
            aiPreferences: {
                enableRecommendations: true,
                allowDataUsage: true,
            },
            accountDeletionScheduled: null,
            lastDataExport: null,

            setAuthenticated: (v) => set({ isAuthenticated: v }),
            setDemoMode: (v) => set({ isDemoMode: v }),
            setActiveApp: (v) => set({ activeApp: v }),
            setLanguage: (v) => set({ language: v }),
            setCurrency: (v) => set({ currency: v }),
            setTheme: (v) => set({ theme: v }),
            setUserProfile: (profile) => set({ userProfile: profile }),

            // Search Actions Impl
            addRecentSearch: (query) => set((state) => ({
                recentSearches: [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 5)
            })),
            clearRecentSearches: () => set({ recentSearches: [] }),
            addSavedFilter: (filter) => set((state) => ({ savedFilters: [...state.savedFilters, filter] })),
            removeSavedFilter: (id) => set((state) => ({ savedFilters: state.savedFilters.filter(f => f.id !== id) })),

            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            setOnboardingStep: (step) => set({ onboardingStep: step }),
            setOnboardingFocus: (focus) => set({ onboardingFocus: focus }),
            markTooltipSeen: (id) => set((state) => ({
                seenTooltips: state.seenTooltips.includes(id) ? state.seenTooltips : [...state.seenTooltips, id]
            })),
            setSampleDataContext: (v) => set({ sampleDataContext: v }),
            setFinanceActiveTab: (v) => set({ financeActiveTab: v }),
            setFinanceSelectedAccountId: (v) => set({ financeSelectedAccountId: v }),
            setLifeActiveTab: (v) => set({ lifeActiveTab: v }),
            setSidebarOpen: (v) => set({ isSidebarOpen: v }),
            setFabOpen: (v) => set({ isFabOpen: v }),
            setQuickAction: (v) => set({ quickAction: v }),
            setSubscription: (v) => set({ subscription: v }),

            setAutomationRules: (updater) => set((state) => ({
                automationRules: typeof updater === 'function' ? updater(state.automationRules) : updater
            })),
            setDashboardWidgets: (updater) => set((state) => ({
                dashboardWidgets: typeof updater === 'function' ? updater(state.dashboardWidgets) : updater
            })),

            // Dashboard Layout Actions
            setActiveLayout: (layoutId) => set((state) => {
                const exists = state.dashboardLayouts.some(l => l.id === layoutId);
                if (exists) return { activeLayoutId: layoutId };

                // If it's a default layout that's missing (migration), add it
                const defaultLayout = DEFAULT_LAYOUTS.find(l => l.id === layoutId);
                if (defaultLayout) {
                    return {
                        dashboardLayouts: [...state.dashboardLayouts, defaultLayout],
                        activeLayoutId: layoutId
                    };
                }

                return { activeLayoutId: layoutId };
            }),
            setActiveDashboardView: (view) => set({ activeDashboardView: view }),

            setEditMode: (enabled) => set({ isEditMode: enabled }),

            saveLayout: (layout) => set((state) => {
                const existing = state.dashboardLayouts.find(l => l.id === layout.id);
                if (existing) {
                    return {
                        dashboardLayouts: state.dashboardLayouts.map(l =>
                            l.id === layout.id ? { ...layout, updatedAt: new Date().toISOString() } : l
                        )
                    };
                }
                return {
                    dashboardLayouts: [...state.dashboardLayouts, layout]
                };
            }),

            deleteLayout: (layoutId) => set((state) => ({
                dashboardLayouts: state.dashboardLayouts.filter(l => l.id !== layoutId)
            })),

            addWidgetToLayout: (widgetId) => set((state) => {
                // Determine target layout based on widget category
                const category = getWidgetCategory(widgetId);

                let targetLayoutId = state.activeLayoutId;

                if (category === 'FINANCE') targetLayoutId = 'default';
                else if (category === 'KITCHEN') targetLayoutId = 'kitchen';
                else if (category === 'LIFE') targetLayoutId = 'life';

                // Ensure target layout exists
                let targetLayout = state.dashboardLayouts.find(l => l.id === targetLayoutId);

                if (!targetLayout) {
                    // Fallback to active if target not found (e.g. deleted or not migrated)
                    targetLayoutId = state.activeLayoutId;
                    targetLayout = state.dashboardLayouts.find(l => l.id === targetLayoutId);
                }

                if (!targetLayout) {
                    targetLayout = state.dashboardLayouts[0];
                    targetLayoutId = targetLayout?.id || 'default';
                }

                if (!targetLayout) return state;

                // Don't add if already in layout
                if (targetLayout.widgets.some(w => w.i === widgetId)) return state;

                const newWidget = {
                    i: widgetId,
                    x: 0,
                    y: 9999, // CSS Grid ignores x/y — placed at end of render order
                    w: 6,
                    h: 2,
                    visible: true,
                    sizeOverride: 'half' as any
                };

                return {
                    dashboardLayouts: state.dashboardLayouts.map(l =>
                        l.id === targetLayoutId
                            ? { ...l, widgets: [...l.widgets, newWidget], updatedAt: new Date().toISOString() }
                            : l
                    )
                };
            }),

            removeWidgetFromLayout: (widgetId) => set((state) => {
                const activeLayout = state.dashboardLayouts.find(l => l.id === state.activeLayoutId);
                if (!activeLayout) return state;

                return {
                    dashboardLayouts: state.dashboardLayouts.map(l =>
                        l.id === state.activeLayoutId
                            ? { ...l, widgets: l.widgets.filter(w => w.i !== widgetId), updatedAt: new Date().toISOString() }
                            : l
                    )
                };
            }),

            toggleWidgetVisibility: (widgetId) => set((state) => {
                const activeLayout = state.dashboardLayouts.find(l => l.id === state.activeLayoutId);
                if (!activeLayout) return state;

                return {
                    dashboardLayouts: state.dashboardLayouts.map(l =>
                        l.id === state.activeLayoutId
                            ? {
                                ...l,
                                widgets: l.widgets.map(w =>
                                    w.i === widgetId ? { ...w, visible: !w.visible } : w
                                ),
                                updatedAt: new Date().toISOString()
                            }
                            : l
                    )
                };
            }),

            changeWidgetSize: (widgetId, newSize) => set((state) => {
                const activeLayout = state.dashboardLayouts.find(l => l.id === state.activeLayoutId);
                if (!activeLayout) return state;

                return {
                    dashboardLayouts: state.dashboardLayouts.map(l =>
                        l.id === state.activeLayoutId
                            ? {
                                ...l,
                                widgets: l.widgets.map(w =>
                                    w.i === widgetId ? { ...w, sizeOverride: newSize } : w
                                ),
                                updatedAt: new Date().toISOString()
                            }
                            : l
                    )
                };
            }),


            duplicateLayout: (layoutId) => set((state) => {
                const layout = state.dashboardLayouts.find(l => l.id === layoutId);
                if (!layout) return state;

                const newLayout: DashboardLayout = {
                    ...layout,
                    id: `${layout.id}-copy-${Date.now()}`,
                    name: `${layout.name} (Copia)`,
                    isDefault: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                return {
                    dashboardLayouts: [...state.dashboardLayouts, newLayout],
                    activeLayoutId: newLayout.id
                };
            }),

            renameLayout: (layoutId, newName) => set((state) => ({
                dashboardLayouts: state.dashboardLayouts.map(l =>
                    l.id === layoutId ? { ...l, name: newName, updatedAt: new Date().toISOString() } : l
                )
            })),

            addSyncLog: (log) => set((state) => ({
                syncLogs: [
                    log,
                    ...state.syncLogs
                ].slice(0, 50)
            })),
            setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
            setDefaultShoppingAccount: (accountId) => set({ defaultShoppingAccount: accountId }),

            // Privacy Actions
            setCookiePreferences: (prefs) => set({ cookiePreferences: prefs }),
            setAIPreferences: (prefs) => set((state) => ({
                aiPreferences: { ...state.aiPreferences, ...prefs }
            })),
            scheduleAccountDeletion: () => set({
                accountDeletionScheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }),
            cancelAccountDeletion: () => set({ accountDeletionScheduled: null }),
            setLastDataExport: (date) => set({ lastDataExport: date }),
        }),
        {
            name: 'onyx_user_store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                isDemoMode: state.isDemoMode,
                language: state.language,
                currency: state.currency,
                theme: state.theme,
                automationRules: state.automationRules,
                dashboardWidgets: state.dashboardWidgets,
                subscription: state.subscription,
                dashboardLayouts: state.dashboardLayouts,
                activeLayoutId: state.activeLayoutId,
                activeDashboardView: state.activeDashboardView,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
                onboardingStep: state.onboardingStep,
                onboardingFocus: state.onboardingFocus,
                seenTooltips: state.seenTooltips,
                sampleDataContext: state.sampleDataContext,
                defaultShoppingAccount: state.defaultShoppingAccount,
                userProfile: state.userProfile,
                recentSearches: state.recentSearches,
                savedFilters: state.savedFilters,
                financeSelectedAccountId: state.financeSelectedAccountId,
                // Privacy state
                cookiePreferences: state.cookiePreferences,
                aiPreferences: state.aiPreferences,
                accountDeletionScheduled: state.accountDeletionScheduled,
                lastDataExport: state.lastDataExport,
            }),
        }
    )
);
