import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLifeStore } from '../store/useLifeStore';
import { useUserStore } from '../store/useUserStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { FamilyEvent } from '../types/life';
import { ShoppingItem } from '../types';

/**
 * Hook to manage Supabase Realtime synchronization for Collaborative Lists
 * such as Shopping List and Family Agenda.
 * Listens for INSERT, UPDATE, DELETE events and merges them locally.
 */
export const useRealtimeSync = () => {
    const { isAuthenticated, isDemoMode } = useUserStore();
    const activeHouseholdId = useHouseholdStore(state => state.activeHouseholdId);

    // We use pure setters to avoid triggering syncService.save...
    const { shoppingList, setShoppingList, familyEvents, setFamilyEvents } = useLifeStore();

    useEffect(() => {
        if (!isAuthenticated || isDemoMode || !supabase || !activeHouseholdId) return;

        console.log('[useRealtimeSync] Subscribing to collaborative tables...');

        const channel = supabase
            .channel('collaborative-life')
            // --- SHOPPING LIST SYNCHRONIZATION ---
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'life_shopping_list',
                    filter: `household_id=eq.${activeHouseholdId}`
                },
                (payload) => {
                    const { eventType, new: newRec, old: oldRec } = payload;

                    if (eventType === 'INSERT') {
                        // Check if already in list to avoid duplicates
                        useLifeStore.setState((state) => ({
                            shoppingList: state.shoppingList.some(i => i.id === newRec.id)
                                ? state.shoppingList
                                : [...state.shoppingList, newRec as ShoppingItem]
                        }));
                    } else if (eventType === 'UPDATE') {
                        useLifeStore.setState((state) => ({
                            shoppingList: state.shoppingList.map(i => i.id === newRec.id ? (newRec as ShoppingItem) : i)
                        }));
                    } else if (eventType === 'DELETE') {
                        useLifeStore.setState((state) => ({
                            shoppingList: state.shoppingList.filter(i => i.id !== oldRec.id)
                        }));
                    }
                }
            )
            // --- FAMILY EVENTS (AGENDA) SYNCHRONIZATION ---
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'life_family_events',
                    filter: `household_id=eq.${activeHouseholdId}`
                },
                (payload) => {
                    const { eventType, new: newRec, old: oldRec } = payload;

                    const formatEvent = (dbRec: any): FamilyEvent => ({
                        id: dbRec.id,
                        title: dbRec.title,
                        time: dbRec.time_str,
                        location: dbRec.location,
                        type: dbRec.event_type as FamilyEvent['type']
                    });

                    if (eventType === 'INSERT') {
                        useLifeStore.setState((state) => ({
                            familyEvents: state.familyEvents.some(e => e.id === newRec.id)
                                ? state.familyEvents
                                : [...state.familyEvents, formatEvent(newRec)]
                        }));
                    } else if (eventType === 'UPDATE') {
                        useLifeStore.setState((state) => ({
                            familyEvents: state.familyEvents.map(e => e.id === newRec.id ? formatEvent(newRec) : e)
                        }));
                    } else if (eventType === 'DELETE') {
                        useLifeStore.setState((state) => ({
                            familyEvents: state.familyEvents.filter(e => e.id !== oldRec.id)
                        }));
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'finance_transactions',
                    filter: `household_id=eq.${activeHouseholdId}`
                },
                (payload) => {
                    const { eventType, new: newRec, old: oldRec } = payload;
                    const store = useFinanceStore.getState();

                    if (eventType === 'INSERT') {
                        if (!store.transactions.some(t => t.id === newRec.id)) {
                            store.setTransactions(prev => [newRec as any, ...prev]);
                        }
                    } else if (eventType === 'UPDATE') {
                        store.updateTransaction(newRec.id, newRec as any);
                    } else if (eventType === 'DELETE') {
                        store.deleteTransaction(oldRec.id);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'finance_budgets',
                    filter: `household_id=eq.${activeHouseholdId}`
                },
                (payload) => {
                    const { eventType, new: newRec, old: oldRec } = payload;
                    const store = useFinanceStore.getState();

                    if (eventType === 'INSERT') {
                        if (!store.budgets.some(b => b.id === newRec.id)) {
                            store.setBudgets(prev => [...prev, newRec as any]);
                        }
                    } else if (eventType === 'UPDATE') {
                        store.updateBudget(newRec.id, newRec as any);
                    } else if (eventType === 'DELETE') {
                        store.deleteBudget(oldRec.id);
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[useRealtimeSync] Realtime connection established');
                } else if (status === 'CLOSED') {
                    console.log('[useRealtimeSync] Realtime connection closed');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('[useRealtimeSync] Realtime connection error');
                }
            });

        return () => {
            console.log('[useRealtimeSync] Unsubscribing...');
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated, isDemoMode, activeHouseholdId]);
};
