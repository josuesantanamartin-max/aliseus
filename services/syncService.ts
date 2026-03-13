
import { supabase } from './supabaseClient';
import { Transaction, Account, Budget, Goal, Debt, Ingredient, Recipe, ShoppingItem, FamilyMember } from '../types';
import { Trip } from '../types/travel';
import { WeeklyPlan, FamilyEvent } from '../types/life';
import { useHouseholdStore } from '../store/useHouseholdStore';

// ─── Mappers: camelCase (app) ↔ snake_case (Supabase) ──────────────────────

const toDbAccount = (a: Account, userId: string, sortOrder?: number) => ({
    id: a.id,
    user_id: userId,
    household_id: useHouseholdStore.getState().activeHouseholdId,
    name: a.name,
    bank_name: a.bankName ?? null,
    balance: a.balance,
    currency: a.currency,
    type: a.type,
    color: a.color ?? null,
    description: a.description ?? null,
    iban: a.iban ?? null,
    card_network: a.cardNetwork ?? null,
    is_manual: true,
    is_remunerated: a.isRemunerated ?? null,
    tae: a.tae ?? null,
    credit_limit: a.creditLimit ?? null,
    cutoff_day: a.cutoffDay ?? null,
    payment_day: a.paymentDay ?? null,
    payment_mode: a.paymentMode ?? null,
    statement_balance: a.statementBalance ?? null,
    linked_account_id: a.linkedAccountId ?? null,
    cadastral_reference: a.cadastralReference ?? null,
    cadastral_data: a.cadastralData ?? null,
    sort_order: sortOrder ?? (a as any).sortOrder ?? 999,
    updated_at: new Date().toISOString(),
});

const fromDbAccount = (row: any): Account => ({
    id: row.id,
    name: row.name,
    bankName: row.bank_name ?? undefined,
    balance: Number(row.balance),
    currency: row.currency,
    type: row.type,
    color: row.color ?? undefined,
    description: row.description ?? undefined,
    iban: row.iban ?? undefined,
    cardNetwork: row.card_network ?? undefined,
    isRemunerated: row.is_remunerated ?? undefined,
    tae: row.tae != null ? Number(row.tae) : undefined,
    creditLimit: row.credit_limit != null ? Number(row.credit_limit) : undefined,
    cutoffDay: row.cutoff_day ?? undefined,
    paymentDay: row.payment_day ?? undefined,
    paymentMode: row.payment_mode ?? undefined,
    statementBalance: row.statement_balance != null ? Number(row.statement_balance) : undefined,
    linkedAccountId: row.linked_account_id ?? undefined,
    cadastralReference: row.cadastral_reference ?? undefined,
    cadastralData: row.cadastral_data ?? undefined,
    sortOrder: row.sort_order ?? 999,
} as any);

const toDbTransaction = (t: Transaction, userId: string) => ({
    id: t.id,
    user_id: userId,
    household_id: useHouseholdStore.getState().activeHouseholdId,
    account_id: t.accountId,
    amount: t.amount,
    date: t.date,
    description: t.description,
    category: t.category,
    sub_category: t.subCategory ?? null,
    project_id: t.projectId ?? null,
    type: t.type,
    status: 'COMPLETED',
    notes: t.notes ?? null,
    is_recurring: t.isRecurring ?? false,
    frequency: t.frequency ?? null,
    recurrence_id: (t as any).recurrenceId ?? null,
    updated_at: new Date().toISOString(),
});

const fromDbTransaction = (row: any): Transaction => ({
    id: row.id,
    accountId: row.account_id,
    amount: Number(row.amount),
    date: row.date,
    description: row.description,
    category: row.category,
    subCategory: row.sub_category ?? undefined,
    projectId: row.project_id ?? undefined,
    type: row.type,
    notes: row.notes ?? undefined,
    isRecurring: row.is_recurring ?? false,
    frequency: row.frequency ?? undefined,
} as any);

const toDbGoal = (g: Goal, userId: string) => ({
    id: g.id,
    user_id: userId,
    household_id: useHouseholdStore.getState().activeHouseholdId,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    deadline: g.deadline ?? null,
    category: (g as any).category ?? null,
    icon: (g as any).icon ?? null,
    color: (g as any).color ?? null,
    is_pinned: (g as any).isPinned ?? false,
    status: (g as any).status ?? 'IN_PROGRESS',
    updated_at: new Date().toISOString(),
});

const fromDbGoal = (row: any): Goal => ({
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline ?? undefined,
    accountId: row.account_id ?? undefined,
    category: row.category ?? undefined,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    isPinned: row.is_pinned ?? false,
    status: row.status ?? 'IN_PROGRESS',
} as any);

const toDbBudget = (b: Budget, userId: string) => ({
    id: b.id,
    user_id: userId,
    household_id: useHouseholdStore.getState().activeHouseholdId,
    category: b.category,
    sub_category: (b as any).subCategory ?? null,
    limit: b.limit,
    period: b.period,
    budget_type: b.budgetType,
    percentage: b.percentage ?? null,
    start_date: b.startDate ?? null,
    end_date: b.endDate ?? null,
    updated_at: new Date().toISOString(),
});

const fromDbBudget = (row: any): Budget => ({
    id: row.id,
    category: row.category,
    subCategory: row.sub_category ?? undefined,
    limit: Number(row.limit),
    period: row.period,
    budgetType: row.budget_type,
    percentage: row.percentage != null ? Number(row.percentage) : undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    name: row.name ?? undefined,
    alertThreshold: row.alert_threshold != null ? Number(row.alert_threshold) : undefined,
} as any);

const toDbProjectBudget = (b: import('../types').ProjectBudget, userId: string) => ({
    id: b.id,
    parent_id: b.parentId ?? null,
    user_id: userId,
    household_id: useHouseholdStore.getState().activeHouseholdId,
    name: b.name,
    description: b.description ?? null,
    limit_amount: b.limit,
    spent_amount: b.spent,
    start_date: b.startDate,
    end_date: b.endDate ?? null,
    status: b.status,
    color: b.color ?? null,
    icon: b.icon ?? null,
    updated_at: new Date().toISOString(),
});

const fromDbProjectBudget = (row: any): import('../types').ProjectBudget => ({
    id: row.id,
    parentId: row.parent_id ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    limit: Number(row.limit_amount),
    spent: Number(row.spent_amount),
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    status: row.status,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
});

const toDbProjectItem = (item: import('../types').ProjectItem, userId: string) => ({
    id: item.id,
    user_id: userId,
    household_id: useHouseholdStore.getState().activeHouseholdId,
    project_id: item.projectId,
    name: item.name,
    budgeted_amount: item.budgetedAmount,
    actual_amount: item.actualAmount,
    notes: item.notes ?? null,
    status: item.status,
    updated_at: new Date().toISOString(),
});

const fromDbProjectItem = (row: any): import('../types').ProjectItem => ({
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    budgetedAmount: Number(row.budgeted_amount),
    actualAmount: Number(row.actual_amount),
    notes: row.notes ?? undefined,
    status: row.status ?? 'PENDING',
});

const toDbDebt = (d: Debt, userId: string) => ({
    id: d.id,
    user_id: userId,
    household_id: useHouseholdStore.getState().activeHouseholdId,
    name: d.name,
    total_amount: d.originalAmount,
    remaining_balance: d.remainingBalance,
    interest_rate: d.interestRate,
    minimum_payment: d.minPayment,
    due_date: d.dueDate ?? null,
    category: d.type,
    updated_at: new Date().toISOString(),
});

const fromDbDebt = (row: any): Debt => ({
    id: row.id,
    name: row.name,
    type: row.category ?? 'LOAN',
    originalAmount: Number(row.total_amount),
    remainingBalance: Number(row.remaining_balance),
    interestRate: Number(row.interest_rate ?? 0),
    minPayment: Number(row.minimum_payment ?? 0),
    dueDate: row.due_date ?? '',
    payments: [],
} as any);

// ─── Helper to get current user ID ────────────────────────────────────────
async function getCurrentUserId(): Promise<string | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// ─── syncService ───────────────────────────────────────────────────────────
export const syncService = {
    // --- FINANCE ---

    async fetchAccounts() {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('finance_accounts')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) { console.error('[syncService] fetchAccounts error:', error.message); throw error; }
        return (data ?? []).map(fromDbAccount);
    },

    async saveAccountsOrder(accounts: Account[]) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        // Use individual UPDATE per account — avoids NOT NULL constraint issues from partial upserts
        let failed = 0;
        for (let i = 0; i < accounts.length; i++) {
            const { error } = await supabase
                .from('finance_accounts')
                .update({ sort_order: i, updated_at: new Date().toISOString() })
                .eq('id', accounts[i].id)

            if (error) {
                console.error('[syncService] saveAccountsOrder UPDATE failed for', accounts[i].id, ':', error.message);
                failed++;
            }
        }
        if (failed === 0) {
            console.log('[syncService] saveAccountsOrder OK — updated', accounts.length, 'accounts order');
        } else {
            console.warn('[syncService] saveAccountsOrder —', failed, 'of', accounts.length, 'updates failed');
        }
    },

    async saveAccount(account: Account) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) { console.warn('[syncService] saveAccount: no authenticated user, skipping.'); return; }

        const { error } = await supabase.from('finance_accounts').upsert(toDbAccount(account, userId));
        if (error) {
            console.error('[syncService] saveAccount FAILED:', error.message, error.details, error.hint);
            throw error;
        }
        console.log('[syncService] saveAccount OK:', account.id, account.name);
    },

    async deleteAccount(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_accounts').delete().eq('id', id);
        if (error) throw error;
    },

    async fetchTransactions() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_transactions').select('*');
        if (error) { console.error('[syncService] fetchTransactions error:', error.message); throw error; }
        return (data ?? []).map(fromDbTransaction);
    },

    async saveTransaction(transaction: Transaction) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) { console.warn('[syncService] saveTransaction: no authenticated user, skipping.'); return; }

        const { error } = await supabase.from('finance_transactions').upsert(toDbTransaction(transaction, userId));
        if (error) {
            console.error('[syncService] saveTransaction FAILED:', error.message, error.details, error.hint);
            throw error;
        }
        console.log('[syncService] saveTransaction OK:', transaction.id);
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
        return (data ?? []).map(fromDbBudget);
    },

    async saveBudget(budget: Budget) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('finance_budgets').upsert(toDbBudget(budget, userId));
        if (error) { console.error('[syncService] saveBudget FAILED:', error.message); throw error; }
    },

    async fetchProjectBudgets() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_project_budgets').select('*');
        if (error) {
            // Table might not exist yet if migration pending
            if (error.code === '42P01') {
                console.warn('[syncService] finance_project_budgets table missing');
                return [];
            }
            throw error;
        }
        return (data ?? []).map(fromDbProjectBudget);
    },

    async saveProjectBudget(budget: import('../types').ProjectBudget) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('finance_project_budgets').upsert(toDbProjectBudget(budget, userId));
        if (error) { console.error('[syncService] saveProjectBudget FAILED:', error.message); throw error; }
    },

    async deleteProjectBudget(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_project_budgets').delete().eq('id', id);
        if (error) { console.error('[syncService] deleteProjectBudget FAILED:', error.message); throw error; }
    },

    async fetchGoals() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_goals').select('*');
        if (error) throw error;
        return (data ?? []).map(fromDbGoal);
    },

    async saveGoal(goal: Goal) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        const dbObj = toDbGoal(goal, userId);
        const { error } = await supabase.from('finance_goals').upsert(dbObj);
        if (error) {
            console.error('[syncService] saveGoal FAILED:', error.message, error.details, error.hint, JSON.stringify(dbObj));
            throw error;
        }
        console.log('[syncService] saveGoal OK:', goal.id, goal.name);
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
        return (data ?? []).map(fromDbDebt);
    },

    async saveDebt(debt: Debt) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('finance_debts').upsert(toDbDebt(debt, userId));
        if (error) { console.error('[syncService] saveDebt FAILED:', error.message); throw error; }
        console.log('[syncService] saveDebt OK:', debt.id);
    },

    async deleteBudget(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_budgets').delete().eq('id', id);
        if (error) { console.error('[syncService] deleteBudget FAILED:', error.message); throw error; }
    },

    async deleteDebt(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_debts').delete().eq('id', id);
        if (error) { console.error('[syncService] deleteDebt FAILED:', error.message); throw error; }
    },

    async fetchProjectItems() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('finance_project_items').select('*');
        if (error) { console.error('[syncService] fetchProjectItems error:', error.message); return []; }
        return (data ?? []).map(fromDbProjectItem);
    },

    async saveProjectItem(item: import('../types').ProjectItem) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { error } = await supabase.from('finance_project_items').upsert(toDbProjectItem(item, userId));
        if (error) { console.error('[syncService] saveProjectItem FAILED:', error.message); throw error; }
    },

    async deleteProjectItem(id: string) {
        if (!supabase) return;
        const { error } = await supabase.from('finance_project_items').delete().eq('id', id);
        if (error) { console.error('[syncService] deleteProjectItem FAILED:', error.message); throw error; }
    },

    async fetchPantry() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_pantry').select('*');
        if (error) throw error;
        return data as Ingredient[];
    },

    async savePantryItem(item: Ingredient) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('life_pantry').upsert({
            ...item,
            user_id: userId,
            household_id: useHouseholdStore.getState().activeHouseholdId,
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
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('life_recipes').upsert({
            ...recipe,
            user_id: userId,
            household_id: useHouseholdStore.getState().activeHouseholdId,
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
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('life_shopping_list').upsert({
            ...item,
            user_id: userId,
            household_id: useHouseholdStore.getState().activeHouseholdId,
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
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('life_weekly_plan').upsert({
            user_id: userId,
            household_id: useHouseholdStore.getState().activeHouseholdId,
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
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('life_family_members').upsert({
            ...member,
            user_id: userId,
            household_id: useHouseholdStore.getState().activeHouseholdId,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteFamilyMember(memberId: string) {
        if (!supabase) return;
        const { error } = await supabase.from('life_family_members').delete().eq('id', memberId);
        if (error) throw error;
    },

    // --- FAMILY EVENTS (AGENDA) ---
    async fetchFamilyEvents() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_family_events').select('*');
        if (error) {
            // Migration might be pending
            if (error.code === '42P01') return [];
            throw error;
        }
        return data.map((e: any) => ({
            id: e.id,
            title: e.title,
            time: e.time_str,
            location: e.location,
            type: e.event_type
        })) as FamilyEvent[];
    },

    async saveFamilyEvent(event: FamilyEvent) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error } = await supabase.from('life_family_events').upsert({
            id: event.id,
            title: event.title,
            time_str: event.time,
            location: event.location,
            event_type: event.type,
            user_id: userId,
            household_id: useHouseholdStore.getState().activeHouseholdId,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async deleteFamilyEvent(eventId: string) {
        if (!supabase) return;
        const { error } = await supabase.from('life_family_events').delete().eq('id', eventId);
        if (error) throw error;
    },

    // --- TRIPS (TRAVEL) ---
    async fetchTrips() {
        if (!supabase) return [];
        const { data, error } = await supabase.from('life_trips').select('*');
        if (error) throw error;

        // Map from snake_case back to camelCase
        return data.map(dbTrip => ({
            id: dbTrip.id,
            destination: dbTrip.destination,
            country: dbTrip.country,
            startDate: dbTrip.start_date,
            endDate: dbTrip.end_date,
            budget: Number(dbTrip.budget),
            spent: Number(dbTrip.spent),
            status: dbTrip.status,
            image: dbTrip.image,
            flights: dbTrip.flights,
            accommodations: dbTrip.accommodations,
            itinerary: dbTrip.itinerary,
            checklist: dbTrip.checklist,
            linkedGoalId: dbTrip.linked_goal_id
        })) as Trip[];
    },

    async saveTrip(trip: Trip) {
        if (!supabase) return;
        const userId = await getCurrentUserId();
        if (!userId) return;

        // Map camelCase to snake_case for Supabase
        const dbObj = {
            id: trip.id,
            user_id: userId,
            household_id: useHouseholdStore.getState().activeHouseholdId,
            destination: trip.destination,
            country: trip.country || '',
            start_date: trip.startDate,
            end_date: trip.endDate,
            budget: trip.budget || 0,
            spent: trip.spent || 0,
            status: trip.status || 'UPCOMING',
            image: trip.image || '',
            flights: trip.flights || [],
            accommodations: trip.accommodations || [],
            itinerary: trip.itinerary || [],
            checklist: trip.checklist || [],
            linked_goal_id: trip.linkedGoalId || null,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('life_trips').upsert(dbObj);
        if (error) {
            console.error('[syncService] saveTrip FAILED:', error);
            throw error;
        }
    },

    async deleteTrip(tripId: string) {
        if (!supabase) return;
        const { error } = await supabase.from('life_trips').delete().eq('id', tripId);
        if (error) throw error;
    },

    // --- BULK SYNC OPERATIONS ---

    async syncAllFromCloud() {
        if (!supabase) return null;

        try {
            const [
                accounts, transactions, budgets, projectBudgets, goals, debts,
                pantry, recipes, shoppingList, weeklyPlans, familyMembers, trips, familyEvents
            ] = await Promise.all([
                this.fetchAccounts(),
                this.fetchTransactions(),
                this.fetchBudgets(),
                this.fetchProjectBudgets(),
                this.fetchGoals(),
                this.fetchDebts(),
                this.fetchPantry(),
                this.fetchRecipes(),
                this.fetchShoppingList(),
                this.fetchWeeklyPlan(),
                this.fetchFamilyMembers(),
                this.fetchTrips(),
                this.fetchFamilyEvents()
            ]);

            return {
                finance: { accounts, transactions, budgets, projectBudgets, goals, debts },
                life: { pantry, recipes, shoppingList, weeklyPlans, familyMembers, trips, familyEvents }
            };
        } catch (error) {
            console.error('Error syncing from cloud:', error);
            throw error;
        }
    }
};
