import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Ingredient, ShoppingItem, Recipe, Trip, FamilyMember, DashboardWidget } from '../types';
import { WeeklyPlan, Chore } from '../types/life';
import { syncService } from '../services/syncService';

interface LifeState {
    weeklyPlans: WeeklyPlan[];
    pantryItems: Ingredient[];
    shoppingList: ShoppingItem[];
    recipes: Recipe[];
    trips: Trip[];
    familyMembers: FamilyMember[];
    widgets: DashboardWidget[];
    vaultDocuments: any[];
    homeAssets: any[];
    recipeToOpen: Recipe | null;
}

interface LifeActions {
    setWeeklyPlans: (updater: WeeklyPlan[] | ((prev: WeeklyPlan[]) => WeeklyPlan[])) => void;
    setPantryItems: (updater: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])) => void;
    setShoppingList: (updater: ShoppingItem[] | ((prev: ShoppingItem[]) => ShoppingItem[])) => void;
    setRecipes: (updater: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
    setTrips: (updater: Trip[] | ((prev: Trip[]) => Trip[])) => void;
    setFamilyMembers: (updater: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => void;
    setWidgets: (updater: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;
    setVaultDocuments: (updater: any[] | ((prev: any[]) => any[])) => void;
    setHomeAssets: (updater: any[] | ((prev: any[]) => any[])) => void;
    setRecipeToOpen: (recipe: Recipe | null) => void;

    // Granular CRUD — all wired to syncService
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (id: string, updates: Partial<Recipe>) => void;
    deleteRecipe: (id: string) => void;
    addPantryItem: (item: Ingredient) => void;
    updatePantryItem: (id: string, updates: Partial<Ingredient>) => void;
    deletePantryItem: (id: string) => void;
    addShoppingItem: (item: ShoppingItem) => void;
    updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
    deleteShoppingItem: (id: string) => void;
    addWeeklyPlan: (plan: WeeklyPlan) => void;
    updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;
    deleteWeeklyPlan: (id: string) => void;
    addTrip: (trip: Trip) => void;
    updateTrip: (id: string, updates: Partial<Trip>) => void;
    deleteTrip: (id: string) => void;
    addFamilyMember: (member: FamilyMember) => void;
    updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
    deleteFamilyMember: (id: string) => void;

    // Cloud sync
    loadFromCloud: () => Promise<void>;
}

const sync = <T>(
    fn: () => Promise<void>,
    label: string
) => fn().catch(e => console.error(`[useLifeStore] ${label} sync failed:`, e));

export const useLifeStore = create<LifeState & LifeActions>()(
    persist(
        (set, get) => ({
            weeklyPlans: [],
            pantryItems: [],
            shoppingList: [],
            recipes: [],
            trips: [],
            familyMembers: [],
            widgets: [],
            vaultDocuments: [],
            homeAssets: [],
            recipeToOpen: null,

            // ── Bulk setters (used by loadFromCloud and bulk operations) ──
            setWeeklyPlans: (updater) => set((state) => ({
                weeklyPlans: typeof updater === 'function' ? updater(state.weeklyPlans) : updater
            })),
            setPantryItems: (updater) => set((state) => ({
                pantryItems: typeof updater === 'function' ? updater(state.pantryItems) : updater
            })),
            setShoppingList: (updater) => set((state) => ({
                shoppingList: typeof updater === 'function' ? updater(state.shoppingList) : updater
            })),
            setRecipes: (updater) => set((state) => ({
                recipes: typeof updater === 'function' ? updater(state.recipes) : updater
            })),
            setTrips: (updater) => set((state) => ({
                trips: typeof updater === 'function' ? updater(state.trips) : updater
            })),
            setFamilyMembers: (updater) => set((state) => ({
                familyMembers: typeof updater === 'function' ? updater(state.familyMembers) : updater
            })),
            setWidgets: (updater) => set((state) => ({
                widgets: typeof updater === 'function' ? updater(state.widgets) : updater
            })),
            setVaultDocuments: (updater) => set((state) => ({
                vaultDocuments: typeof updater === 'function' ? updater(state.vaultDocuments) : updater
            })),
            setHomeAssets: (updater) => set((state) => ({
                homeAssets: typeof updater === 'function' ? updater(state.homeAssets) : updater
            })),
            setRecipeToOpen: (recipe) => set({ recipeToOpen: recipe }),

            // ── Recipes ──
            addRecipe: (recipe) => {
                set((state) => ({ recipes: [...state.recipes, recipe] }));
                sync(() => syncService.saveRecipe(recipe), 'addRecipe');
            },
            updateRecipe: (id, updates) => {
                set((state) => ({ recipes: state.recipes.map(r => r.id === id ? { ...r, ...updates } : r) }));
                const updated = get().recipes.find(r => r.id === id);
                if (updated) sync(() => syncService.saveRecipe({ ...updated, ...updates }), 'updateRecipe');
            },
            deleteRecipe: (id) => {
                set((state) => ({ recipes: state.recipes.filter(r => r.id !== id) }));
                sync(() => syncService.deleteRecipe(id), 'deleteRecipe');
            },

            // ── Pantry ──
            addPantryItem: (item) => {
                set((state) => ({ pantryItems: [...state.pantryItems, item] }));
                sync(() => syncService.savePantryItem(item), 'addPantryItem');
            },
            updatePantryItem: (id, updates) => {
                set((state) => ({ pantryItems: state.pantryItems.map(i => i.id === id ? { ...i, ...updates } : i) }));
                const updated = get().pantryItems.find(i => i.id === id);
                if (updated) sync(() => syncService.savePantryItem({ ...updated, ...updates }), 'updatePantryItem');
            },
            deletePantryItem: (id) => {
                set((state) => ({ pantryItems: state.pantryItems.filter(i => i.id !== id) }));
                sync(() => syncService.deletePantryItem(id), 'deletePantryItem');
            },

            // ── Shopping list ──
            addShoppingItem: (item) => {
                set((state) => ({ shoppingList: [...state.shoppingList, item] }));
                sync(() => syncService.saveShoppingItem(item), 'addShoppingItem');
            },
            updateShoppingItem: (id, updates) => {
                set((state) => ({ shoppingList: state.shoppingList.map(i => i.id === id ? { ...i, ...updates } : i) }));
                const updated = get().shoppingList.find(i => i.id === id);
                if (updated) sync(() => syncService.saveShoppingItem({ ...updated, ...updates }), 'updateShoppingItem');
            },
            deleteShoppingItem: (id) => {
                set((state) => ({ shoppingList: state.shoppingList.filter(i => i.id !== id) }));
                sync(() => syncService.deleteShoppingItem(id), 'deleteShoppingItem');
            },

            // ── Weekly plan — saved as bulk blob ──
            addWeeklyPlan: (plan) => {
                set((state) => ({ weeklyPlans: [...state.weeklyPlans, plan] }));
                const updated = [...get().weeklyPlans];
                sync(() => syncService.saveWeeklyPlan(updated), 'addWeeklyPlan');
            },
            updateWeeklyPlan: (id, updates) => {
                set((state) => ({ weeklyPlans: state.weeklyPlans.map(p => p.id === id ? { ...p, ...updates } : p) }));
                sync(() => syncService.saveWeeklyPlan(get().weeklyPlans), 'updateWeeklyPlan');
            },
            deleteWeeklyPlan: (id) => {
                set((state) => ({ weeklyPlans: state.weeklyPlans.filter(p => p.id !== id) }));
                sync(() => syncService.saveWeeklyPlan(get().weeklyPlans), 'deleteWeeklyPlan');
            },

            // ── Trips (viajes) ──
            addTrip: (trip) => {
                set((state) => ({ trips: [...state.trips, trip] }));
                sync(() => syncService.saveTrip(trip), 'addTrip');
            },
            updateTrip: (id, updates) => {
                set((state) => ({ trips: state.trips.map(t => t.id === id ? { ...t, ...updates } : t) }));
                const updated = get().trips.find(t => t.id === id);
                if (updated) sync(() => syncService.saveTrip({ ...updated, ...updates }), 'updateTrip');
            },
            deleteTrip: (id) => {
                set((state) => ({ trips: state.trips.filter(t => t.id !== id) }));
                sync(() => syncService.deleteTrip(id), 'deleteTrip');
            },

            // ── Family members ──
            addFamilyMember: (member) => {
                set((state) => ({ familyMembers: [...state.familyMembers, member] }));
                sync(() => syncService.saveFamilyMember(member), 'addFamilyMember');
            },
            updateFamilyMember: (id, updates) => {
                set((state) => ({ familyMembers: state.familyMembers.map(m => m.id === id ? { ...m, ...updates } : m) }));
                const updated = get().familyMembers.find(m => m.id === id);
                if (updated) sync(() => syncService.saveFamilyMember({ ...updated, ...updates }), 'updateFamilyMember');
            },
            deleteFamilyMember: (id) => {
                set((state) => ({ familyMembers: state.familyMembers.filter(m => m.id !== id) }));
                sync(() => syncService.deleteFamilyMember(id), 'deleteFamilyMember');
            },

            // ── Cloud load — called by AuthGate on login ──
            loadFromCloud: async () => {
                try {
                    const [cloudPantry, cloudRecipes, cloudShopping, cloudWeekly, cloudFamily, cloudTrips] = await Promise.all([
                        syncService.fetchPantry(),
                        syncService.fetchRecipes(),
                        syncService.fetchShoppingList(),
                        syncService.fetchWeeklyPlan(),
                        syncService.fetchFamilyMembers(),
                        syncService.fetchTrips(),
                    ]);

                    console.log(`[useLifeStore] loadFromCloud: pantry=${cloudPantry.length} recipes=${cloudRecipes.length} shopping=${cloudShopping.length} weekly=${cloudWeekly.length} family=${cloudFamily.length} trips=${cloudTrips.length}`);

                    set((state) => ({
                        pantryItems: cloudPantry.length > 0 ? cloudPantry : state.pantryItems,
                        recipes: cloudRecipes.length > 0 ? cloudRecipes : state.recipes,
                        shoppingList: cloudShopping.length > 0 ? cloudShopping : state.shoppingList,
                        weeklyPlans: cloudWeekly.length > 0 ? cloudWeekly : state.weeklyPlans,
                        familyMembers: cloudFamily.length > 0 ? cloudFamily : state.familyMembers,
                        trips: cloudTrips.length > 0 ? cloudTrips : state.trips,
                    }));
                } catch (e) {
                    console.error('[useLifeStore] loadFromCloud failed:', e);
                }
            },
        }),
        {
            name: 'onyx_life_store',
            storage: createJSONStorage(() => localStorage),
            // Don't persist mock-only fields that should come from Supabase
            partialize: (state) => ({
                weeklyPlans: state.weeklyPlans,
                pantryItems: state.pantryItems,
                shoppingList: state.shoppingList,
                recipes: state.recipes,
                trips: state.trips,
                familyMembers: state.familyMembers,
                widgets: state.widgets,
                vaultDocuments: state.vaultDocuments,
                homeAssets: state.homeAssets,
            }),
        }
    )
);
