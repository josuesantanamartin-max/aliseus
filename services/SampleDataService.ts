import { useFinanceStore } from '../store/useFinanceStore';
import { useLifeStore } from '../store/useLifeStore';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_GOALS, MOCK_DEBTS } from '../data/seeds/financeSeed';
import { MOCK_PANTRY, MOCK_RECIPES, MOCK_TRIPS, MOCK_FAMILY } from '../data/seeds/lifeSeed';

/**
 * Service to manage sample data loading and clearing
 * Data is loaded only in memory (Zustand stores) until user decides to persist
 */
export class SampleDataService {
    /**
     * Detects if the user has any custom data
     * Returns true if user has created their own data beyond samples
     */
    static detectIfUserHasData(): boolean {
        const financeStore = useFinanceStore.getState();
        const lifeStore = useLifeStore.getState();

        // Check if user has modified data from defaults
        const hasCustomTransactions = financeStore.transactions.length > 0 &&
            !this.arraysAreEqual(financeStore.transactions, MOCK_TRANSACTIONS);

        const hasCustomAccounts = financeStore.accounts.length > 0 &&
            !this.arraysAreEqual(financeStore.accounts, MOCK_ACCOUNTS);

        const hasCustomRecipes = lifeStore.recipes.length > 0 &&
            !this.arraysAreEqual(lifeStore.recipes, MOCK_RECIPES);

        return hasCustomTransactions || hasCustomAccounts || hasCustomRecipes;
    }

    /**
     * Checks if sample data is currently loaded
     */
    static isSampleDataLoaded(): boolean {
        const financeStore = useFinanceStore.getState();

        // If transactions match mock data, sample data is loaded
        return this.arraysAreEqual(financeStore.transactions, MOCK_TRANSACTIONS);
    }

    /**
     * Loads all sample data into stores
     */
    static loadSampleData(): void {
        const financeStore = useFinanceStore.getState();
        const lifeStore = useLifeStore.getState();

        // Load finance sample data
        financeStore.setTransactions(MOCK_TRANSACTIONS);
        financeStore.setAccounts(MOCK_ACCOUNTS);
        financeStore.setBudgets(MOCK_BUDGETS);
        financeStore.setGoals(MOCK_GOALS);
        financeStore.setDebts(MOCK_DEBTS);

        // Load life sample data
        lifeStore.setPantryItems(MOCK_PANTRY);
        lifeStore.setRecipes(MOCK_RECIPES);
        lifeStore.setTrips(MOCK_TRIPS);
        lifeStore.setFamilyMembers(MOCK_FAMILY);
        lifeStore.setWeeklyPlans([]);
        lifeStore.setShoppingList([]);

        // Mark that sample data has been loaded
        localStorage.setItem('Aliseus_sample_data_loaded', 'true');
        localStorage.setItem('Aliseus_sample_data_load_date', new Date().toISOString());
    }

    /**
     * Clears all data from stores
     */
    static clearAllData(): void {
        const financeStore = useFinanceStore.getState();
        const lifeStore = useLifeStore.getState();

        // Clear finance data
        financeStore.setTransactions([]);
        financeStore.setAccounts([]);
        financeStore.setBudgets([]);
        financeStore.setGoals([]);
        financeStore.setDebts([]);

        // Clear life data
        lifeStore.setPantryItems([]);
        lifeStore.setRecipes([]);
        lifeStore.setTrips([]);
        lifeStore.setFamilyMembers([]);
        lifeStore.setWeeklyPlans([]);
        lifeStore.setShoppingList([]);

        // Mark that sample data has been cleared
        localStorage.setItem('Aliseus_sample_data_loaded', 'false');
        localStorage.setItem('Aliseus_sample_data_dismissed', 'true');
    }

    /**
     * Restores sample data (same as loadSampleData but resets flags)
     */
    static restoreSampleData(): void {
        this.loadSampleData();
        localStorage.removeItem('Aliseus_sample_data_dismissed');
    }

    /**
     * Checks if user has dismissed the sample data banner
     */
    static isSampleDataDismissed(): boolean {
        return localStorage.getItem('Aliseus_sample_data_dismissed') === 'true';
    }

    /**
     * Marks the sample data banner as dismissed
     */
    static dismissSampleDataBanner(): void {
        localStorage.setItem('Aliseus_sample_data_dismissed', 'true');
    }

    /**
     * Helper to compare arrays for equality
     */
    private static arraysAreEqual(arr1: any[], arr2: any[]): boolean {
        if (arr1.length !== arr2.length) return false;

        // Simple comparison - check if first few items match
        // This is a lightweight check, not a deep equality
        const sampleSize = Math.min(3, arr1.length);
        for (let i = 0; i < sampleSize; i++) {
            if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
                return false;
            }
        }
        return true;
    }
}
