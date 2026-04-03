import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Language, QuickAction, AutomationRule, SyncLog, UserPersona, FamilyMember } from '../types';
import { DEFAULT_RULES } from '../constants';

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
    syncLogs: SyncLog[];

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
            syncLogs: [],
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
                subscription: state.subscription,
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
