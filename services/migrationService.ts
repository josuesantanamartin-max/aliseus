import { syncService } from './syncService';
import { supabase } from './supabaseClient';

/**
 * Service for migrating data from localStorage to Supabase
 * This runs automatically on first login with a Supabase account
 */
export const migrationService = {
    MIGRATION_KEY: 'onyx_migration_completed',

    /**
     * Check if migration has already been completed
     */
    isMigrationCompleted(): boolean {
        return localStorage.getItem(this.MIGRATION_KEY) === 'true';
    },

    /**
     * Mark migration as completed
     */
    markMigrationCompleted(): void {
        localStorage.setItem(this.MIGRATION_KEY, 'true');
    },

    /**
     * Get data from localStorage stores
     */
    getLocalData() {
        const financeData = localStorage.getItem('onyx_finance_store');
        const lifeData = localStorage.getItem('onyx_life_store');

        return {
            finance: financeData ? JSON.parse(financeData).state : null,
            life: lifeData ? JSON.parse(lifeData).state : null
        };
    },

    /**
     * Migrate all data from localStorage to Supabase
     */
    async migrateToCloud(): Promise<{ success: boolean; message: string; details?: any }> {
        // Check if Supabase is connected
        if (!supabase) {
            return {
                success: false,
                message: 'Supabase no está configurado'
            };
        }

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return {
                success: false,
                message: 'Usuario no autenticado'
            };
        }

        // Check if migration already completed
        if (this.isMigrationCompleted()) {
            return {
                success: true,
                message: 'Migración ya completada anteriormente'
            };
        }

        try {
            const localData = this.getLocalData();
            const migrationResults = {
                finance: { accounts: 0, transactions: 0, budgets: 0, goals: 0, debts: 0 },
                life: { pantry: 0, recipes: 0, shoppingList: 0, weeklyPlan: 0, familyMembers: 0 }
            };

            // === MIGRATE FINANCE DATA ===
            if (localData.finance) {
                const { accounts, transactions, budgets, goals, debts } = localData.finance;

                // Migrate Accounts
                if (accounts && accounts.length > 0) {
                    for (const account of accounts) {
                        try {
                            await syncService.saveAccount(account);
                            migrationResults.finance.accounts++;
                        } catch (e) {
                            console.error('Error migrating account:', account.id, e);
                        }
                    }
                }

                // Migrate Transactions
                if (transactions && transactions.length > 0) {
                    for (const transaction of transactions) {
                        try {
                            await syncService.saveTransaction(transaction);
                            migrationResults.finance.transactions++;
                        } catch (e) {
                            console.error('Error migrating transaction:', transaction.id, e);
                        }
                    }
                }

                // Migrate Budgets
                if (budgets && budgets.length > 0) {
                    for (const budget of budgets) {
                        try {
                            await syncService.saveBudget(budget);
                            migrationResults.finance.budgets++;
                        } catch (e) {
                            console.error('Error migrating budget:', budget.id, e);
                        }
                    }
                }

                // Migrate Goals
                if (goals && goals.length > 0) {
                    for (const goal of goals) {
                        try {
                            await syncService.saveGoal(goal);
                            migrationResults.finance.goals++;
                        } catch (e) {
                            console.error('Error migrating goal:', goal.id, e);
                        }
                    }
                }

                // Migrate Debts
                if (debts && debts.length > 0) {
                    for (const debt of debts) {
                        try {
                            await syncService.saveDebt(debt);
                            migrationResults.finance.debts++;
                        } catch (e) {
                            console.error('Error migrating debt:', debt.id, e);
                        }
                    }
                }
            }

            // === MIGRATE LIFE DATA ===
            if (localData.life) {
                const { pantryItems, recipes, shoppingList, weeklyPlan, familyMembers } = localData.life;

                // Migrate Pantry Items
                if (pantryItems && pantryItems.length > 0) {
                    for (const item of pantryItems) {
                        try {
                            await syncService.savePantryItem(item);
                            migrationResults.life.pantry++;
                        } catch (e) {
                            console.error('Error migrating pantry item:', item.name, e);
                        }
                    }
                }

                // Migrate Recipes
                if (recipes && recipes.length > 0) {
                    for (const recipe of recipes) {
                        try {
                            await syncService.saveRecipe(recipe);
                            migrationResults.life.recipes++;
                        } catch (e) {
                            console.error('Error migrating recipe:', recipe.id, e);
                        }
                    }
                }

                // Migrate Shopping List
                if (shoppingList && shoppingList.length > 0) {
                    for (const item of shoppingList) {
                        try {
                            await syncService.saveShoppingItem(item);
                            migrationResults.life.shoppingList++;
                        } catch (e) {
                            console.error('Error migrating shopping item:', item.id, e);
                        }
                    }
                }

                // Migrate Weekly Plan
                if (weeklyPlan && Object.keys(weeklyPlan).length > 0) {
                    try {
                        await syncService.saveWeeklyPlan(weeklyPlan);
                        migrationResults.life.weeklyPlan = Object.keys(weeklyPlan).length;
                    } catch (e) {
                        console.error('Error migrating weekly plan:', e);
                    }
                }

                // Migrate Family Members
                if (familyMembers && familyMembers.length > 0) {
                    for (const member of familyMembers) {
                        try {
                            await syncService.saveFamilyMember(member);
                            migrationResults.life.familyMembers++;
                        } catch (e) {
                            console.error('Error migrating family member:', member.id, e);
                        }
                    }
                }
            }

            // Mark migration as completed
            this.markMigrationCompleted();

            const totalMigrated =
                Object.values(migrationResults.finance).reduce((a, b) => a + b, 0) +
                Object.values(migrationResults.life).reduce((a, b) => a + b, 0);

            return {
                success: true,
                message: `Migración completada: ${totalMigrated} elementos migrados a Aliseus Cloud`,
                details: migrationResults
            };

        } catch (error: any) {
            console.error('Migration error:', error);
            return {
                success: false,
                message: `Error durante la migración: ${error.message}`,
                details: error
            };
        }
    },

    /**
     * Reset migration status (for testing purposes)
     */
    resetMigrationStatus(): void {
        localStorage.removeItem(this.MIGRATION_KEY);
    }
};
