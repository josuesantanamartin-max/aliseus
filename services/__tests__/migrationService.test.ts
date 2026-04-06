import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrationService } from '../migrationService';

// Mock dependencies
const mockSaveAccount = vi.fn();
const mockSaveTransaction = vi.fn();
const mockSaveBudget = vi.fn();
const mockSaveGoal = vi.fn();
const mockSaveDebt = vi.fn();
const mockSavePantryItem = vi.fn();
const mockSaveRecipe = vi.fn();
const mockSaveShoppingItem = vi.fn();
const mockSaveWeeklyPlan = vi.fn();
const mockSaveFamilyMember = vi.fn();
const mockGetUser = vi.fn();

vi.mock('../syncService', () => ({
    syncService: {
        saveAccount: mockSaveAccount,
        saveTransaction: mockSaveTransaction,
        saveBudget: mockSaveBudget,
        saveGoal: mockSaveGoal,
        saveDebt: mockSaveDebt,
        savePantryItem: mockSavePantryItem,
        saveRecipe: mockSaveRecipe,
        saveShoppingItem: mockSaveShoppingItem,
        saveWeeklyPlan: mockSaveWeeklyPlan,
        saveFamilyMember: mockSaveFamilyMember,
    },
}));

vi.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: mockGetUser,
        },
    },
}));

describe('MigrationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    });

    describe('isMigrationCompleted', () => {
        it('should return false if migration not completed', () => {
            expect(migrationService.isMigrationCompleted()).toBe(false);
        });

        it('should return true if migration completed', () => {
            localStorage.setItem('Aliseus_migration_completed', 'true');
            expect(migrationService.isMigrationCompleted()).toBe(true);
        });
    });

    describe('markMigrationCompleted', () => {
        it('should mark migration as completed', () => {
            migrationService.markMigrationCompleted();
            expect(localStorage.getItem('Aliseus_migration_completed')).toBe('true');
        });
    });

    describe('resetMigrationStatus', () => {
        it('should reset migration status', () => {
            localStorage.setItem('Aliseus_migration_completed', 'true');
            migrationService.resetMigrationStatus();
            expect(localStorage.getItem('Aliseus_migration_completed')).toBeNull();
        });
    });

    describe('getLocalData', () => {
        it('should get finance data from localStorage', () => {
            const financeData = {
                state: {
                    accounts: [{ id: '1', name: 'Bank' }],
                    transactions: [{ id: '1', amount: 100 }],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));

            const data = migrationService.getLocalData();

            expect(data.finance).toEqual(financeData.state);
        });

        it('should get life data from localStorage', () => {
            const lifeData = {
                state: {
                    recipes: [{ id: '1', name: 'Pasta' }],
                    pantryItems: [{ id: '1', name: 'Tomatoes' }],
                },
            };

            localStorage.setItem('Aliseus_life_store', JSON.stringify(lifeData));

            const data = migrationService.getLocalData();

            expect(data.life).toEqual(lifeData.state);
        });

        it('should return null for missing data', () => {
            const data = migrationService.getLocalData();

            expect(data.finance).toBeNull();
            expect(data.life).toBeNull();
        });
    });

    describe('migrateToCloud', () => {
        it('should return error if user not authenticated', async () => {
            mockGetUser.mockResolvedValueOnce({ data: { user: null } });

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(false);
            expect(result.message).toContain('no autenticado');
        });

        it('should return success if migration already completed', async () => {
            localStorage.setItem('Aliseus_migration_completed', 'true');

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(result.message).toContain('ya completada');
        });

        it('should migrate finance accounts', async () => {
            const financeData = {
                state: {
                    accounts: [
                        { id: '1', name: 'Bank Account' },
                        { id: '2', name: 'Savings' },
                    ],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            mockSaveAccount.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveAccount).toHaveBeenCalledTimes(2);
            expect(result.details.finance.accounts).toBe(2);
        });

        it('should migrate finance transactions', async () => {
            const financeData = {
                state: {
                    transactions: [
                        { id: '1', amount: 100 },
                        { id: '2', amount: 200 },
                        { id: '3', amount: 300 },
                    ],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            mockSaveTransaction.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveTransaction).toHaveBeenCalledTimes(3);
            expect(result.details.finance.transactions).toBe(3);
        });

        it('should migrate finance budgets', async () => {
            const financeData = {
                state: {
                    budgets: [{ id: '1', category: 'Food', limit: 500 }],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            mockSaveBudget.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveBudget).toHaveBeenCalledTimes(1);
        });

        it('should migrate finance goals', async () => {
            const financeData = {
                state: {
                    goals: [{ id: '1', name: 'Vacation', target: 5000 }],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            mockSaveGoal.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveGoal).toHaveBeenCalledTimes(1);
        });

        it('should migrate finance debts', async () => {
            const financeData = {
                state: {
                    debts: [{ id: '1', name: 'Loan', balance: 10000 }],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            mockSaveDebt.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveDebt).toHaveBeenCalledTimes(1);
        });

        it('should migrate life pantry items', async () => {
            const lifeData = {
                state: {
                    pantryItems: [
                        { id: '1', name: 'Tomatoes' },
                        { id: '2', name: 'Pasta' },
                    ],
                },
            };

            localStorage.setItem('Aliseus_life_store', JSON.stringify(lifeData));
            mockSavePantryItem.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSavePantryItem).toHaveBeenCalledTimes(2);
        });

        it('should migrate life recipes', async () => {
            const lifeData = {
                state: {
                    recipes: [{ id: '1', name: 'Pasta Carbonara' }],
                },
            };

            localStorage.setItem('Aliseus_life_store', JSON.stringify(lifeData));
            mockSaveRecipe.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveRecipe).toHaveBeenCalledTimes(1);
        });

        it('should migrate life shopping list', async () => {
            const lifeData = {
                state: {
                    shoppingList: [{ id: '1', name: 'Milk' }],
                },
            };

            localStorage.setItem('Aliseus_life_store', JSON.stringify(lifeData));
            mockSaveShoppingItem.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveShoppingItem).toHaveBeenCalledTimes(1);
        });

        it('should migrate life weekly plan', async () => {
            const lifeData = {
                state: {
                    weeklyPlan: {
                        monday: { breakfast: 'Cereal' },
                        tuesday: { lunch: 'Pasta' },
                    },
                },
            };

            localStorage.setItem('Aliseus_life_store', JSON.stringify(lifeData));
            mockSaveWeeklyPlan.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveWeeklyPlan).toHaveBeenCalledTimes(1);
        });

        it('should migrate life family members', async () => {
            const lifeData = {
                state: {
                    familyMembers: [{ id: '1', name: 'John' }],
                },
            };

            localStorage.setItem('Aliseus_life_store', JSON.stringify(lifeData));
            mockSaveFamilyMember.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true);
            expect(mockSaveFamilyMember).toHaveBeenCalledTimes(1);
        });

        it('should handle migration errors gracefully', async () => {
            const financeData = {
                state: {
                    accounts: [{ id: '1', name: 'Bank' }],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            mockSaveAccount.mockRejectedValueOnce(new Error('Save failed'));

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(true); // Should continue despite errors
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should mark migration as completed after success', async () => {
            const financeData = {
                state: {
                    accounts: [{ id: '1', name: 'Bank' }],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            mockSaveAccount.mockResolvedValue({});

            await migrationService.migrateToCloud();

            expect(localStorage.getItem('Aliseus_migration_completed')).toBe('true');
        });

        it('should calculate total migrated items', async () => {
            const financeData = {
                state: {
                    accounts: [{ id: '1' }, { id: '2' }],
                    transactions: [{ id: '1' }],
                },
            };

            const lifeData = {
                state: {
                    recipes: [{ id: '1' }],
                },
            };

            localStorage.setItem('Aliseus_finance_store', JSON.stringify(financeData));
            localStorage.setItem('Aliseus_life_store', JSON.stringify(lifeData));

            mockSaveAccount.mockResolvedValue({});
            mockSaveTransaction.mockResolvedValue({});
            mockSaveRecipe.mockResolvedValue({});

            const result = await migrationService.migrateToCloud();

            expect(result.message).toContain('4 elementos migrados');
        });

        it('should handle complete migration failure', async () => {
            mockGetUser.mockRejectedValueOnce(new Error('Auth error'));

            const result = await migrationService.migrateToCloud();

            expect(result.success).toBe(false);
            expect(result.message).toContain('Error durante la migración');
        });
    });
});
