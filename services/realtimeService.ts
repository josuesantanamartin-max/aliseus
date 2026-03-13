import { supabase } from './supabaseClient';
import { useFinanceStore } from '../store/useFinanceStore';
import { useLifeStore } from '../store/useLifeStore';
import { useUserStore } from '../store/useUserStore';

class RealtimeService {
    private subscription: any = null;

    startSync() {
        const user = useUserStore.getState().userProfile;
        if (!supabase || !user) return;

        if (this.subscription) {
            this.stopSync();
        }

        this.subscription = supabase.channel('aliseus_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_transactions' }, (payload) => {
                this.handleFinanceTransactionChange(payload);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_budgets' }, (payload) => {
                this.handleFinanceBudgetChange(payload);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'life_weekly_plan' }, (payload) => {
                this.handleLifeWeeklyPlanChange(payload);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'life_shopping_list' }, (payload) => {
                this.handleLifeShoppingListChange(payload);
            })
            .subscribe((status) => {
                console.log('[Realtime] Subscription status:', status);
            });
    }

    stopSync() {
        if (this.subscription) {
            supabase?.removeChannel(this.subscription);
            this.subscription = null;
            console.log('[Realtime] Subscription stopped.');
        }
    }

    private handleFinanceTransactionChange(payload: any) {
        const { eventType, new: newRec, old: oldRec } = payload;
        const store = useFinanceStore.getState();
        const currentUserId = useUserStore.getState().userProfile?.id;

        if (eventType === 'INSERT') {
            // Avoid duplication if the client already optimistically added it
            // Also ensure we don't add stuff from other users unless household applies (RLS handles this mostly)
            if (!store.transactions.find(t => t.id === newRec.id)) {
                store.setTransactions(prev => [newRec, ...prev]);
            }
        } else if (eventType === 'UPDATE') {
            store.updateTransaction(newRec.id, newRec);
        } else if (eventType === 'DELETE') {
            store.deleteTransaction(oldRec.id);
        }
    }

    private handleFinanceBudgetChange(payload: any) {
        const { eventType, new: newRec, old: oldRec } = payload;
        const store = useFinanceStore.getState();
        if (eventType === 'INSERT') {
            if (!store.budgets.find(b => b.id === newRec.id)) {
                store.setBudgets(prev => [...prev, newRec]);
            }
        } else if (eventType === 'UPDATE') {
            store.updateBudget(newRec.id, newRec);
        } else if (eventType === 'DELETE') {
            store.deleteBudget(oldRec.id);
        }
    }

    private handleLifeWeeklyPlanChange(payload: any) {
        const { eventType, new: newRec, old: oldRec } = payload;
        const store = useLifeStore.getState();
        if (eventType === 'INSERT') {
            if (!store.weeklyPlans.find(b => b.id === newRec.id)) {
                store.setWeeklyPlans(prev => [...prev, newRec]);
            }
        } else if (eventType === 'UPDATE') {
            store.updateWeeklyPlan(newRec.id, newRec);
        } else if (eventType === 'DELETE') {
            store.deleteWeeklyPlan(oldRec.id);
        }
    }

    private handleLifeShoppingListChange(payload: any) {
        const { eventType, new: newRec, old: oldRec } = payload;
        const store = useLifeStore.getState();
        if (eventType === 'INSERT') {
            if (!store.shoppingList.find(b => b.id === newRec.id)) {
                store.setShoppingList(prev => [...prev, newRec]);
            }
        } else if (eventType === 'UPDATE') {
            store.updateShoppingItem(newRec.id, newRec);
        } else if (eventType === 'DELETE') {
            store.deleteShoppingItem(oldRec.id);
        }
    }
}

export const realtimeService = new RealtimeService();
