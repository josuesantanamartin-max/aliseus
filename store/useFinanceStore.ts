import { create } from 'zustand';
import { syncService } from '../services/syncService';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, Account, Budget, Goal, Debt, CategoryStructure, DashboardWidget } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_GOALS, MOCK_DEBTS, DEFAULT_FINANCE_WIDGETS } from '../data/seeds/financeSeed';

interface FinanceState {
    transactions: Transaction[];
    accounts: Account[];
    budgets: Budget[];
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
                set((state) => ({ accounts: [...state.accounts, account] }));
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
                set((state) => ({
                    accounts: state.accounts.map(acc =>
                        acc.id === id ? { ...acc, ...updates } : acc
                    )
                }));
            },
            deleteAccount: (id) => {
                set((state) => ({
                    accounts: state.accounts.filter(acc => acc.id !== id)
                }));
            },
            addBudget: (budget) => {
                set((state) => ({ budgets: [...state.budgets, budget] }));
            },
            updateBudget: (id, updates) => {
                set((state) => ({
                    budgets: state.budgets.map(b =>
                        b.id === id ? { ...b, ...updates } : b
                    )
                }));
            },
            deleteBudget: (id) => {
                set((state) => ({
                    budgets: state.budgets.filter(b => b.id !== id)
                }));
            },
            addGoal: (goal) => {
                set((state) => ({ goals: [...state.goals, goal] }));
            },
            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map(g =>
                        g.id === id ? { ...g, ...updates } : g
                    )
                }));
            },
            deleteGoal: (id) => {
                set((state) => ({
                    goals: state.goals.filter(g => g.id !== id)
                }));
            },
            addDebt: (debt) => {
                set((state) => ({ debts: [...state.debts, debt] }));
            },
            updateDebt: (id, updates) => {
                set((state) => ({
                    debts: state.debts.map(d =>
                        d.id === id ? { ...d, ...updates } : d
                    )
                }));
            },
            deleteDebt: (id) => {
                set((state) => ({
                    debts: state.debts.filter(d => d.id !== id)
                }));
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
                    const [accounts, transactions, budgets, goals, debts] = await Promise.all([
                        syncService.fetchAccounts(),
                        syncService.fetchTransactions(),
                        syncService.fetchBudgets(),
                        syncService.fetchGoals(),
                        syncService.fetchDebts(),
                    ]);

                    // We overwrite even if empty to ensure the UI reflects the cloud state
                    // (especially important when switching accounts or devices)
                    set({
                        accounts,
                        transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                        budgets,
                        goals,
                        debts
                    });
                } catch (e) {
                    console.error("Failed to load from cloud:", e);
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
