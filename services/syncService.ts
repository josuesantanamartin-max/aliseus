
import { supabase } from './supabaseClient';
import { Transaction, Account, Budget, Goal, Debt, Ingredient, Recipe, ShoppingItem, FamilyMember } from '../types';
import { WeeklyPlan } from '../types/life';

export const syncService = {
    // --- FINANCE ---

    async fetchAccounts() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_accounts').select('*');
        if (error) throw error;
        return data as Account[];
    },

    async saveAccount(account: Account) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('finance_accounts').upsert({
            ...account,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteAccount(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_accounts').delete().eq('id', id);
        if (error) throw error;
    },

    async fetchTransactions() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_transactions').select('*');
        if (error) throw error;
        return data as Transaction[];
    },

    async saveTransaction(transaction: Transaction) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('finance_transactions').upsert({
            ...transaction,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteTransaction(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_transactions').delete().eq('id', id);
        if (error) throw error;
    },

    async fetchBudgets() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_budgets').select('*');
        if (error) throw error;
        return data as Budget[];
    },

    async saveBudget(budget: Budget) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('finance_budgets').upsert({
            ...budget,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async fetchGoals() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_goals').select('*');
        if (error) throw error;
        return data as Goal[];
    },

    async saveGoal(goal: Goal) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('finance_goals').upsert({
            ...goal,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteGoal(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_goals').delete().eq('id', id);
        if (error) throw error;
    },

    async fetchDebts() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_debts').select('*');
        if (error) throw error;
        return data as Debt[];
    },

    async saveDebt(debt: Debt) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('finance_debts').upsert({
            ...debt,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    // --- LIFE ---

    async fetchPantry() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_pantry').select('*');
        if (error) throw error;
        return data as Ingredient[];
    },

    async savePantryItem(item: Ingredient) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('life_pantry').upsert({
            ...item,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deletePantryItem(itemId: string) {
        if (!supabase) return;
        const { error } = await supabase.from('life_pantry').delete().eq('id', itemId);
        if (error) throw error;
    },

    async fetchRecipes() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_recipes').select('*');
        if (error) throw error;
        return data as Recipe[];
    },

    async saveRecipe(recipe: Recipe) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('life_recipes').upsert({
            ...recipe,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteRecipe(recipeId: string) {
        if (!supabase) return;
        const { error } = await supabase.from('life_recipes').delete().eq('id', recipeId);
        if (error) throw error;
    },

    async fetchShoppingList() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_shopping_list').select('*');
        if (error) throw error;
        return data as ShoppingItem[];
    },

    async saveShoppingItem(item: ShoppingItem) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('life_shopping_list').upsert({
            ...item,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteShoppingItem(itemId: string) {
        if (!supabase) return;
        const { error } = await supabase.from('life_shopping_list').delete().eq('id', itemId);
        if (error) throw error;
    },

    async fetchWeeklyPlan() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_weekly_plan').select('*').single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        return (data?.plan_data || []) as WeeklyPlan[];
    },

    async saveWeeklyPlan(weeklyPlans: WeeklyPlan[]) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('life_weekly_plan').upsert({
            user_id: user.id,
            plan_data: weeklyPlans,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async fetchFamilyMembers() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_family_members').select('*');
        if (error) throw error;
        return data as FamilyMember[];
    },

    async saveFamilyMember(member: FamilyMember) {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('life_family_members').upsert({
            ...member,
            user_id: user.id,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteFamilyMember(memberId: string) {
        if (!supabase) return;
        const { error } = await supabase.from('life_family_members').delete().eq('id', memberId);
        if (error) throw error;
    },

    // --- BULK SYNC OPERATIONS ---

    async syncAllFromCloud() {
        if (!supabase) return null;

        try {
            const [
                accounts, transactions, budgets, goals, debts,
                pantry, recipes, shoppingList, weeklyPlans, familyMembers
            ] = await Promise.all([
                this.fetchAccounts(),
                this.fetchTransactions(),
                this.fetchBudgets(),
                this.fetchGoals(),
                this.fetchDebts(),
                this.fetchPantry(),
                this.fetchRecipes(),
                this.fetchShoppingList(),
                this.fetchWeeklyPlan(),
                this.fetchFamilyMembers()
            ]);

            return {
                finance: { accounts, transactions, budgets, goals, debts },
                life: { pantry, recipes, shoppingList, weeklyPlans, familyMembers }
            };
        } catch (error) {
            console.error('Error syncing from cloud:', error);
            throw error;
        }
    }
};
