import { useEffect, useState, useCallback } from 'react';
import { syncService } from '../services/syncService';
import { migrationService } from '../services/migrationService';
import { useFinanceStore } from '../store/useFinanceStore';
import { useLifeStore } from '../store/useLifeStore';
import { useUserStore } from '../store/useUserStore';
import { supabase } from '../services/supabaseClient';
import { offlineQueueService } from '../services/offlineQueueService';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncState {
    status: SyncStatus;
    lastSync: number | null;
    error: string | null;
}

/**
 * Hook to manage cloud synchronization state and operations
 */
export const useSync = () => {
    const [syncState, setSyncState] = useState<SyncState>({
        status: 'idle',
        lastSync: null,
        error: null
    });

    const { isAuthenticated, isDemoMode } = useUserStore();
    const financeStore = useFinanceStore();
    const lifeStore = useLifeStore();

    /**
     * Perform full sync from cloud
     */
    const syncFromCloud = useCallback(async () => {
        if (!supabase || isDemoMode) return;

        setSyncState(prev => ({ ...prev, status: 'syncing', error: null }));

        try {
            // First, process any pending offline mutations
            await offlineQueueService.processQueue();

            const cloudData = await syncService.syncAllFromCloud();

            if (cloudData) {
                // Update stores with cloud data
                if (cloudData.finance.accounts.length > 0) {
                    financeStore.setAccounts(cloudData.finance.accounts);
                }
                if (cloudData.finance.transactions.length > 0) {
                    financeStore.setTransactions(cloudData.finance.transactions);
                }
                if (cloudData.finance.budgets.length > 0) {
                    financeStore.setBudgets(cloudData.finance.budgets);
                }
                if (cloudData.finance.goals.length > 0) {
                    financeStore.setGoals(cloudData.finance.goals);
                }
                if (cloudData.finance.debts.length > 0) {
                    financeStore.setDebts(cloudData.finance.debts);
                }

                // Life data
                if (cloudData.life.pantry.length > 0) {
                    lifeStore.setPantryItems(cloudData.life.pantry);
                }
                if (cloudData.life.recipes.length > 0) {
                    lifeStore.setRecipes(cloudData.life.recipes);
                }
                if (cloudData.life.shoppingList.length > 0) {
                    lifeStore.setShoppingList(cloudData.life.shoppingList);
                }
                if (cloudData.life.weeklyPlans && cloudData.life.weeklyPlans.length > 0) {
                    lifeStore.setWeeklyPlans(cloudData.life.weeklyPlans);
                }
                if (cloudData.life.familyMembers.length > 0) {
                    lifeStore.setFamilyMembers(cloudData.life.familyMembers);
                }
            }

            setSyncState({
                status: 'success',
                lastSync: Date.now(),
                error: null
            });
        } catch (error: any) {
            console.error('Sync error:', error);
            setSyncState({
                status: 'error',
                lastSync: null,
                error: error.message || 'Error al sincronizar'
            });
        }
    }, [isDemoMode, financeStore, lifeStore]);

    /**
     * Perform automatic migration on first login
     */
    const performMigration = useCallback(async () => {
        if (!supabase || isDemoMode || migrationService.isMigrationCompleted()) {
            return;
        }

        setSyncState(prev => ({ ...prev, status: 'syncing', error: null }));

        try {
            const result = await migrationService.migrateToCloud();

            if (result.success) {
                console.log('✅ Migration successful:', result.message, result.details);
                // After migration, sync from cloud to get any data that might have been merged
                await syncFromCloud();
            } else {
                console.error('❌ Migration failed:', result.message);
                setSyncState(prev => ({
                    ...prev,
                    status: 'error',
                    error: result.message
                }));
            }
        } catch (error: any) {
            console.error('Migration error:', error);
            setSyncState(prev => ({
                ...prev,
                status: 'error',
                error: error.message
            }));
        }
    }, [isDemoMode, syncFromCloud]);

    /**
     * Auto-sync on authentication state change
     */
    useEffect(() => {
        if (isAuthenticated && !isDemoMode && supabase) {
            // First, try migration if needed
            performMigration().then(() => {
                // Then sync from cloud
                syncFromCloud();
            });
        }
    }, [isAuthenticated, isDemoMode, performMigration, syncFromCloud]);

    /**
     * Periodic auto-sync every 5 minutes
     */
    useEffect(() => {
        if (!isAuthenticated || isDemoMode || !supabase) return;

        const interval = setInterval(() => {
            syncFromCloud();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [isAuthenticated, isDemoMode, syncFromCloud]);

    /**
     * Listen for online/offline events
     */
    useEffect(() => {
        const handleOnline = () => {
            if (isAuthenticated && !isDemoMode) {
                syncFromCloud();
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [isAuthenticated, isDemoMode, syncFromCloud]);

    return {
        ...syncState,
        syncFromCloud,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        canSync: isAuthenticated && !isDemoMode && !!supabase
    };
};
