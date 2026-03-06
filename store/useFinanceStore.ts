import { create } from 'zustand';
import { syncService } from '../services/syncService';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, Account, Budget, Goal, Debt, CategoryStructure, DashboardWidget, ProjectItem } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_GOALS, MOCK_DEBTS, DEFAULT_FINANCE_WIDGETS } from '../data/seeds/financeSeed';
import { useUserStore } from './useUserStore';

interface FinanceState {
    transactions: Transaction[];
    accounts: Account[];
    budgets: Budget[];
    projectBudgets: import('../types').ProjectBudget[];
    projectItems: ProjectItem[];
    goals: Goal[];
    debts: Debt[];
    categories: CategoryStructure[];
    widgets: DashboardWidget[];
    currency: 'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR';
}

interface FinanceActions {
    setTransactions: (updater: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
    setAccounts: (updater: Account[] | ((prev: Account[]) => Account[])) => void;
    setBudgets: (updater: Budget[] | ((prev: Budget[]) => Budget[])) => void;
    setProjectBudgets: (updater: import('../types').ProjectBudget[] | ((prev: import('../types').ProjectBudget[]) => import('../types').ProjectBudget[])) => void;
    setGoals: (updater: Goal[] | ((prev: Goal[]) => Goal[])) => void;
    setDebts: (updater: Debt[] | ((prev: Debt[]) => Debt[])) => void;
    setCategories: (updater: CategoryStructure[] | ((prev: CategoryStructure[]) => CategoryStructure[])) => void;
    setWidgets: (updater: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;
    setCurrency: (currency: 'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR') => void;

    // Shortcuts for common operations to reduce logic in components
    addTransaction: (transaction: Transaction) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addAccount: (account: Account) => Promise<void>;
    updateAccount: (id: string, updates: Partial<Account>) => void;
    deleteAccount: (id: string) => void;
    addBudget: (budget: Budget) => void;
    updateBudget: (id: string, updates: Partial<Budget>) => void;
    deleteBudget: (id: string) => void;
    addProjectBudget: (budget: import('../types').ProjectBudget) => void;
    updateProjectBudget: (id: string, updates: Partial<import('../types').ProjectBudget>) => void;
    deleteProjectBudget: (id: string) => void;
    addProjectItem: (item: ProjectItem) => void;
    updateProjectItem: (id: string, updates: Partial<ProjectItem>) => void;
    deleteProjectItem: (id: string) => void;
    addGoal: (goal: Goal) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
    addDebt: (debt: Debt) => void;
    updateDebt: (id: string, updates: Partial<Debt>) => void;
    deleteDebt: (id: string) => void;
    updateAccountBalance: (accountId: string, amount: number) => Promise<void>;
    loadFromCloud: () => Promise<void>;
    setMockData: () => void;
    clearAllData: () => void;
}

export const useFinanceStore = create<FinanceState & FinanceActions>()(
    persist(
        (set) => ({
            transactions: [],
            accounts: [],
            budgets: [],
            projectBudgets: [],
            projectItems: [],
            goals: [],
            debts: [],
            categories: INITIAL_CATEGORIES,
            widgets: DEFAULT_FINANCE_WIDGETS,
            currency: 'EUR',

            setTransactions: (updater) => set((state) => ({
                transactions: typeof updater === 'function' ? updater(state.transactions) : updater
            })),
            setAccounts: (updater) => set((state) => ({
                accounts: typeof updater === 'function' ? updater(state.accounts) : updater
            })),
            setBudgets: (updater) => set((state) => ({
                budgets: typeof updater === 'function' ? updater(state.budgets) : updater
            })),
            setProjectBudgets: (updater) => set((state) => ({
                projectBudgets: typeof updater === 'function' ? updater(state.projectBudgets) : updater
            })),
            setGoals: (updater) => set((state) => ({
                goals: typeof updater === 'function' ? updater(state.goals) : updater
            })),
            setDebts: (updater) => set((state) => ({
                debts: typeof updater === 'function' ? updater(state.debts) : updater
            })),
            setCategories: (updater) => set((state) => ({
                categories: typeof updater === 'function' ? updater(state.categories) : updater
            })),
            setWidgets: (updater) => set((state) => ({
                widgets: typeof updater === 'function' ? updater(state.widgets) : updater
            })),
            setCurrency: (currency) => set({ currency }),

            addTransaction: async (tx) => {
                set((state) => ({ transactions: [tx, ...state.transactions] }));
                try {
                    await syncService.saveTransaction(tx);
                } catch (e) {
                    console.error("Failed to sync transaction:", e);
                }
            },
            addAccount: async (account) => {
                set((state) => {
                    // Assign sortOrder = end of list so new accounts appear last
                    const withOrder = { ...account, sortOrder: (account as any).sortOrder ?? state.accounts.length };
                    return { accounts: [...state.accounts, withOrder] };
                });
                try {
                    await syncService.saveAccount(account);
                } catch (e) {
                    console.error("Failed to sync account:", e);
                }
            },
            updateTransaction: (id, updates) => {
                set((state) => ({
                    transactions: state.transactions.map(tx =>
                        tx.id === id ? { ...tx, ...updates } : tx
                    )
                }));
            },
            deleteTransaction: (id) => {
                set((state) => ({
                    transactions: state.transactions.filter(tx => tx.id !== id)
                }));
            },
            updateAccount: (id, updates) => {
                set((state) => {
                    const accounts = state.accounts.map(acc =>
                        acc.id === id ? { ...acc, ...updates } : acc
                    );
                    const updatedAccount = accounts.find(a => a.id === id);
                    if (updatedAccount) {
                        syncService.saveAccount(updatedAccount).catch(e => console.error("Failed to sync account:", e));
                    }
                    return { accounts };
                });
            },
            deleteAccount: (id) => {
                set((state) => ({
                    accounts: state.accounts.filter(acc => acc.id !== id)
                }));
                syncService.deleteAccount(id).catch(e => console.error("Failed to sync account deletion:", e));
            },
            addBudget: (budget) => {
                set((state) => ({ budgets: [...state.budgets, budget] }));
                syncService.saveBudget(budget).catch(e => console.error('[store] addBudget sync failed:', e));
            },
            updateBudget: (id, updates) => {
                set((state) => ({
                    budgets: state.budgets.map(b => b.id === id ? { ...b, ...updates } : b)
                }));
                // Re-fetch updated item to sync full object
                const store = useFinanceStore.getState();
                const updated = store.budgets.find(b => b.id === id);
                if (updated) syncService.saveBudget({ ...updated, ...updates }).catch(e => console.error('[store] updateBudget sync failed:', e));
            },
            deleteBudget: (id) => {
                set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) }));
                syncService.deleteBudget(id).catch(e => console.error('[store] deleteBudget sync failed:', e));
            },
            addProjectBudget: (budget) => {
                set((state) => ({ projectBudgets: [...state.projectBudgets, budget] }));
                syncService.saveProjectBudget(budget).catch(e => console.error('[store] addProjectBudget sync failed:', e));
            },
            updateProjectBudget: (id, updates) => {
                set((state) => ({
                    projectBudgets: state.projectBudgets.map(b => b.id === id ? { ...b, ...updates } : b)
                }));
                const store = useFinanceStore.getState();
                const updated = store.projectBudgets.find(b => b.id === id);
                if (updated) syncService.saveProjectBudget({ ...updated, ...updates }).catch(e => console.error('[store] updateProjectBudget sync failed:', e));
            },
            deleteProjectBudget: (id) => {
                set((state) => ({ projectBudgets: state.projectBudgets.filter(b => b.id !== id) }));
                syncService.deleteProjectBudget(id).catch(e => console.error('[store] deleteProjectBudget sync failed:', e));
            },
            addProjectItem: (item) => {
                set((state) => ({ projectItems: [...state.projectItems, item] }));
                syncService.saveProjectItem(item).catch(e => console.error('[store] addProjectItem sync failed:', e));
            },
            updateProjectItem: (id, updates) => {
                set((state) => ({
                    projectItems: state.projectItems.map(i => i.id === id ? { ...i, ...updates } : i)
                }));
                const store = useFinanceStore.getState();
                const updated = store.projectItems.find(i => i.id === id);
                if (updated) syncService.saveProjectItem({ ...updated, ...updates }).catch(e => console.error('[store] updateProjectItem sync failed:', e));
            },
            deleteProjectItem: (id) => {
                set((state) => ({ projectItems: state.projectItems.filter(i => i.id !== id) }));
                syncService.deleteProjectItem(id).catch(e => console.error('[store] deleteProjectItem sync failed:', e));
            },
            addGoal: (goal) => {
                set((state) => ({ goals: [...state.goals, goal] }));
                syncService.saveGoal(goal).catch(e => console.error('[store] addGoal sync failed:', e));
            },
            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
                }));
                const store = useFinanceStore.getState();
                const updated = store.goals.find(g => g.id === id);
                if (updated) syncService.saveGoal({ ...updated, ...updates }).catch(e => console.error('[store] updateGoal sync failed:', e));
            },
            deleteGoal: (id) => {
                set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
                syncService.deleteGoal(id).catch(e => console.error('[store] deleteGoal sync failed:', e));
            },
            addDebt: (debt) => {
                set((state) => ({ debts: [...state.debts, debt] }));
                syncService.saveDebt(debt).catch(e => console.error('[store] addDebt sync failed:', e));
            },
            updateDebt: (id, updates) => {
                set((state) => ({
                    debts: state.debts.map(d => d.id === id ? { ...d, ...updates } : d)
                }));
                const store = useFinanceStore.getState();
                const updated = store.debts.find(d => d.id === id);
                if (updated) syncService.saveDebt({ ...updated, ...updates }).catch(e => console.error('[store] updateDebt sync failed:', e));
            },
            deleteDebt: (id) => {
                set((state) => ({ debts: state.debts.filter(d => d.id !== id) }));
                syncService.deleteDebt(id).catch(e => console.error('[store] deleteDebt sync failed:', e));
            },
            updateAccountBalance: async (accountId, amount) => {
                set((state) => {
                    const updatedAccounts = state.accounts.map(acc =>
                        acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc
                    );
                    const updatedAccount = updatedAccounts.find(a => a.id === accountId);
                    if (updatedAccount) {
                        syncService.saveAccount(updatedAccount).catch(e => console.error("Failed to sync account:", e));
                    }
                    return { accounts: updatedAccounts };
                });
            },
            loadFromCloud: async () => {
                try {
                    const [cloudAccounts, cloudTransactions, cloudBudgets, cloudProjectBudgets, cloudProjectItems, cloudGoals, cloudDebts] = await Promise.all([
                        syncService.fetchAccounts(),
                        syncService.fetchTransactions(),
                        syncService.fetchBudgets(),
                        syncService.fetchProjectBudgets(),
                        syncService.fetchProjectItems(),
                        syncService.fetchGoals(),
                        syncService.fetchDebts(),
                    ]);

                    console.log(`[loadFromCloud] Fetched: ${cloudAccounts.length} accounts, ${cloudTransactions.length} tx, ${cloudBudgets.length} budgets, ${cloudProjectBudgets.length} project budgets, ${cloudGoals.length} goals, ${cloudDebts.length} debts`);

                    // If ALL arrays are empty, Supabase may not have data yet — skip entirely
                    const hasAnyData = cloudAccounts.length > 0 || cloudTransactions.length > 0 || cloudBudgets.length > 0 || cloudProjectBudgets.length > 0 || cloudGoals.length > 0 || cloudDebts.length > 0;
                    if (!hasAnyData) {
                        console.log('[loadFromCloud] Cloud returned no data — keeping existing local state.');
                        return;
                    }

                    // Merge per entity: only overwrite if cloud has data for that entity.
                    // This prevents a silent save failure from wiping local data.
                    set((state) => ({
                        accounts: cloudAccounts.length > 0
                            ? cloudAccounts.sort((a, b) => ((a as any).sortOrder ?? 999) - ((b as any).sortOrder ?? 999))
                            : state.accounts,
                        transactions: cloudTransactions.length > 0
                            ? cloudTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            : state.transactions,
                        budgets: cloudBudgets.length > 0 ? cloudBudgets : state.budgets,
                        projectBudgets: cloudProjectBudgets.length > 0 ? cloudProjectBudgets : state.projectBudgets,
                        projectItems: cloudProjectItems.length > 0 ? cloudProjectItems : state.projectItems,
                        goals: cloudGoals.length > 0 ? cloudGoals : state.goals,
                        debts: cloudDebts.length > 0 ? cloudDebts : state.debts,
                    }));

                    // If the user has pulled down data from the cloud, they MUST have completed onboarding in the past
                    if (useUserStore.getState().hasCompletedOnboarding === false) {
                        useUserStore.getState().completeOnboarding();
                    }

                    console.log('[loadFromCloud] Store updated from cloud successfully.');
                } catch (e) {
                    console.error("[loadFromCloud] Failed to load from cloud:", e);
                }
            },
            setMockData: () => set({
                transactions: MOCK_TRANSACTIONS,
                accounts: MOCK_ACCOUNTS,
                budgets: MOCK_BUDGETS,
                goals: MOCK_GOALS,
                debts: MOCK_DEBTS,
            }),
            clearAllData: () => set({
                transactions: [],
                accounts: [],
                budgets: [],
                projectBudgets: [],
                projectItems: [],
                goals: [],
                debts: [],
            })
        }),
        {
            name: 'onyx_finance_store',
            storage: createJSONStorage(() => localStorage), // Explicitly use localStorage
        }
    )
);
