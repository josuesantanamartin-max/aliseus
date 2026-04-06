import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Recipe, Ingredient, ShoppingItem, Trip, WishlistDestination, PriceAlert, TravelDocument, FamilyMember, FamilyEvent, DashboardWidget, WeeklyPlan } from '../types';
import { MOCK_RECIPES, MOCK_PANTRY } from '../data/seeds/lifeSeed';
import { syncService } from '../services/syncService';
import { recipeService } from '../services/recipes/recipeService';
import { idbStorage } from '../utils/idbStorage';
import { offlineQueueService } from '../services/offlineQueueService';

interface LifeState {
    weeklyPlans: WeeklyPlan[];
    pantryItems: Ingredient[];
    shoppingList: ShoppingItem[];
    recipes: Recipe[];
    trips: Trip[];
    travelWishlist: WishlistDestination[];
    priceAlerts: PriceAlert[];
    travelDocuments: TravelDocument[];
    familyMembers: FamilyMember[];
    familyEvents: FamilyEvent[];
    widgets: DashboardWidget[];
    vaultDocuments: any[];
    homeAssets: any[];
    recipeToOpen: Recipe | null;
    isSmartPlannerOpen: boolean;
}

interface LifeActions {
    setWeeklyPlans: (updater: WeeklyPlan[] | ((prev: WeeklyPlan[]) => WeeklyPlan[])) => void;
    setPantryItems: (updater: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])) => void;
    setShoppingList: (updater: ShoppingItem[] | ((prev: ShoppingItem[]) => ShoppingItem[])) => void;
    setRecipes: (updater: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
    setTrips: (updater: Trip[] | ((prev: Trip[]) => Trip[])) => void;
    setTravelWishlist: (updater: WishlistDestination[] | ((prev: WishlistDestination[]) => WishlistDestination[])) => void;
    setPriceAlerts: (updater: PriceAlert[] | ((prev: PriceAlert[]) => PriceAlert[])) => void;
    setTravelDocuments: (updater: TravelDocument[] | ((prev: TravelDocument[]) => TravelDocument[])) => void;
    setFamilyMembers: (updater: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => void;
    setFamilyEvents: (updater: FamilyEvent[] | ((prev: FamilyEvent[]) => FamilyEvent[])) => void;
    setWidgets: (updater: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;
    setVaultDocuments: (updater: any[] | ((prev: any[]) => any[])) => void;
    setHomeAssets: (updater: any[] | ((prev: any[]) => any[])) => void;
    setRecipeToOpen: (recipe: Recipe | null) => void;
    setIsSmartPlannerOpen: (isOpen: boolean) => void;

    // Granular CRUD — all wired to syncService
    refreshSampleRecipes: () => void;
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (id: string, updates: Partial<Recipe>) => void;
    deleteRecipe: (id: string) => void;
    importExternalRecipe: (recipe: Recipe) => Promise<void>;
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
    
    // travel extensions
    addWishlistItem: (item: WishlistDestination) => void;
    updateWishlistItem: (id: string, updates: Partial<WishlistDestination>) => void;
    deleteWishlistItem: (id: string) => void;
    addPriceAlert: (alert: PriceAlert) => void;
    updatePriceAlert: (id: string, updates: Partial<PriceAlert>) => void;
    deletePriceAlert: (id: string) => void;
    addTravelDocument: (doc: TravelDocument) => void;
    updateTravelDocument: (id: string, updates: Partial<TravelDocument>) => void;
    deleteTravelDocument: (id: string) => void;

    addFamilyMember: (member: FamilyMember) => void;
    updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
    deleteFamilyMember: (id: string) => void;
    addFamilyEvent: (event: FamilyEvent) => void;
    updateFamilyEvent: (id: string, updates: Partial<FamilyEvent>) => void;
    deleteFamilyEvent: (id: string) => void;

    // Cloud sync
    loadFromCloud: () => Promise<void>;
}

const sync = <T>(
    fn: () => Promise<void>,
    label: string,
    syncMethod: keyof typeof syncService,
    payload: any
) => fn().catch(e => {
    console.warn(`[useLifeStore] ${label} sync failed, enqueuing for later:`, e);
    offlineQueueService.enqueue(syncMethod, payload);
});

export const useLifeStore = create<LifeState & LifeActions>()(
    persist(
        (set, get) => ({
            weeklyPlans: [],
            pantryItems: [],
            shoppingList: [],
            recipes: [],
            trips: [],
            travelWishlist: [],
            priceAlerts: [],
            travelDocuments: [],
            familyMembers: [],
            familyEvents: [],
            widgets: [],
            vaultDocuments: [],
            homeAssets: [],
            recipeToOpen: null,
            isSmartPlannerOpen: false,

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
            setTravelWishlist: (updater) => set((state) => ({
                travelWishlist: typeof updater === 'function' ? updater(state.travelWishlist) : updater
            })),
            setPriceAlerts: (updater) => set((state) => ({
                priceAlerts: typeof updater === 'function' ? updater(state.priceAlerts) : updater
            })),
            setTravelDocuments: (updater) => set((state) => ({
                travelDocuments: typeof updater === 'function' ? updater(state.travelDocuments) : updater
            })),
            setFamilyMembers: (updater) => set((state) => ({
                familyMembers: typeof updater === 'function' ? updater(state.familyMembers) : updater
            })),
            setFamilyEvents: (updater) => set((state) => ({
                familyEvents: typeof updater === 'function' ? updater(state.familyEvents) : updater
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
            setIsSmartPlannerOpen: (isOpen) => set({ isSmartPlannerOpen: isOpen }),

            // ── Recipes ──
            refreshSampleRecipes: () => {
                set({ 
                    recipes: MOCK_RECIPES,
                    pantryItems: MOCK_PANTRY 
                });
                localStorage.setItem('Aliseus_sample_data_loaded', 'true');
            },
            addRecipe: (recipe) => {
                set((state) => ({ recipes: [...state.recipes, recipe] }));
                sync(() => syncService.saveRecipe(recipe), 'addRecipe', 'saveRecipe', recipe);
            },
            updateRecipe: (id, updates) => {
                set((state) => ({ recipes: state.recipes.map(r => r.id === id ? { ...r, ...updates } : r) }));
                const updated = get().recipes.find(r => r.id === id);
                if (updated) sync(() => syncService.saveRecipe({ ...updated, ...updates }), 'updateRecipe', 'saveRecipe', { ...updated, ...updates });
            },
            deleteRecipe: (id) => {
                set((state) => ({ recipes: state.recipes.filter(r => r.id !== id) }));
                sync(() => syncService.deleteRecipe(id), 'deleteRecipe', 'deleteRecipe', id);
            },
            importExternalRecipe: async (recipe) => {
                try {
                    // Saves to Supabase and estimates calories through Gemini.
                    const finalRecipe = await recipeService.saveRecipeToBox(recipe);
                    set((state) => ({ recipes: [finalRecipe, ...state.recipes] }));
                } catch (e) {
                    console.error("Failed to import external recipe", e);
                    throw e;
                }
            },

            // ── Pantry ──
            addPantryItem: (item) => {
                set((state) => ({ pantryItems: [...state.pantryItems, item] }));
                sync(() => syncService.savePantryItem(item), 'addPantryItem', 'savePantryItem', item);
            },
            updatePantryItem: (id, updates) => {
                set((state) => ({ pantryItems: state.pantryItems.map(i => i.id === id ? { ...i, ...updates } : i) }));
                const updated = get().pantryItems.find(i => i.id === id);
                if (updated) sync(() => syncService.savePantryItem({ ...updated, ...updates }), 'updatePantryItem', 'savePantryItem', { ...updated, ...updates });
            },
            deletePantryItem: (id) => {
                set((state) => ({ pantryItems: state.pantryItems.filter(i => i.id !== id) }));
                sync(() => syncService.deletePantryItem(id), 'deletePantryItem', 'deletePantryItem', id);
            },

            // ── Shopping list ──
            addShoppingItem: (item) => {
                set((state) => ({ shoppingList: [...state.shoppingList, item] }));
                sync(() => syncService.saveShoppingItem(item), 'addShoppingItem', 'saveShoppingItem', item);
            },
            updateShoppingItem: (id, updates) => {
                set((state) => ({ shoppingList: state.shoppingList.map(i => i.id === id ? { ...i, ...updates } : i) }));
                const updated = get().shoppingList.find(i => i.id === id);
                if (updated) sync(() => syncService.saveShoppingItem({ ...updated, ...updates }), 'updateShoppingItem', 'saveShoppingItem', { ...updated, ...updates });
            },
            deleteShoppingItem: (id) => {
                set((state) => ({ shoppingList: state.shoppingList.filter(i => i.id !== id) }));
                sync(() => syncService.deleteShoppingItem(id), 'deleteShoppingItem', 'deleteShoppingItem', id);
            },

            // ── Weekly plan — saved as bulk blob ──
            addWeeklyPlan: (plan) => {
                set((state) => ({ weeklyPlans: [...state.weeklyPlans, plan] }));
                const updated = [...get().weeklyPlans];
                sync(() => syncService.saveWeeklyPlan(updated), 'addWeeklyPlan', 'saveWeeklyPlan', updated);
            },
            updateWeeklyPlan: (id, updates) => {
                set((state) => ({ weeklyPlans: state.weeklyPlans.map(p => p.id === id ? { ...p, ...updates } : p) }));
                sync(() => syncService.saveWeeklyPlan(get().weeklyPlans), 'updateWeeklyPlan', 'saveWeeklyPlan', get().weeklyPlans);
            },
            deleteWeeklyPlan: (id) => {
                set((state) => ({ weeklyPlans: state.weeklyPlans.filter(p => p.id !== id) }));
                sync(() => syncService.saveWeeklyPlan(get().weeklyPlans), 'deleteWeeklyPlan', 'saveWeeklyPlan', get().weeklyPlans);
            },

            // ── Trips (viajes) ──
            addTrip: (trip) => {
                set((state) => ({ trips: [...state.trips, trip] }));
                sync(() => syncService.saveTrip(trip), 'addTrip', 'saveTrip', trip);
            },
            updateTrip: (id, updates) => {
                set((state) => ({ trips: state.trips.map(t => t.id === id ? { ...t, ...updates } : t) }));
                const updated = get().trips.find(t => t.id === id);
                if (updated) sync(() => syncService.saveTrip({ ...updated, ...updates }), 'updateTrip', 'saveTrip', { ...updated, ...updates });
            },
            deleteTrip: (id) => {
                set((state) => ({ trips: state.trips.filter(t => t.id !== id) }));
                sync(() => syncService.deleteTrip(id), 'deleteTrip', 'deleteTrip', id);
            },

            // ── Travel Wishlist ──
            addWishlistItem: (item) => {
                set((state) => ({ travelWishlist: [...state.travelWishlist, item] }));
                // sync implementation can be added to syncService later
            },
            updateWishlistItem: (id, updates) => {
                set((state) => ({ travelWishlist: state.travelWishlist.map(i => i.id === id ? { ...i, ...updates } : i) }));
            },
            deleteWishlistItem: (id) => {
                set((state) => ({ travelWishlist: state.travelWishlist.filter(i => i.id !== id) }));
            },

            // ── Price Alerts ──
            addPriceAlert: (alert) => {
                set((state) => ({ priceAlerts: [...state.priceAlerts, alert] }));
            },
            updatePriceAlert: (id, updates) => {
                set((state) => ({ priceAlerts: state.priceAlerts.map(a => a.id === id ? { ...a, ...updates } : a) }));
            },
            deletePriceAlert: (id) => {
                set((state) => ({ priceAlerts: state.priceAlerts.filter(a => a.id !== id) }));
            },

            // ── Travel Documents ──
            addTravelDocument: (doc) => {
                set((state) => ({ travelDocuments: [...state.travelDocuments, doc] }));
            },
            updateTravelDocument: (id, updates) => {
                set((state) => ({ travelDocuments: state.travelDocuments.map(d => d.id === id ? { ...d, ...updates } : d) }));
            },
            deleteTravelDocument: (id) => {
                set((state) => ({ travelDocuments: state.travelDocuments.filter(d => d.id !== id) }));
            },

            // ── Family members ──
            addFamilyMember: (member) => {
                set((state) => ({ familyMembers: [...state.familyMembers, member] }));
                sync(() => syncService.saveFamilyMember(member), 'addFamilyMember', 'saveFamilyMember', member);
            },
            updateFamilyMember: (id, updates) => {
                set((state) => ({ familyMembers: state.familyMembers.map(m => m.id === id ? { ...m, ...updates } : m) }));
                const updated = get().familyMembers.find(m => m.id === id);
                if (updated) sync(() => syncService.saveFamilyMember({ ...updated, ...updates }), 'updateFamilyMember', 'saveFamilyMember', { ...updated, ...updates });
            },
            deleteFamilyMember: (id) => {
                set((state) => ({ familyMembers: state.familyMembers.filter(m => m.id !== id) }));
                sync(() => syncService.deleteFamilyMember(id), 'deleteFamilyMember', 'deleteFamilyMember', id);
            },

            // ── Family Events ──
            addFamilyEvent: (event) => {
                set((state) => ({ familyEvents: [...state.familyEvents, event] }));
                sync(() => syncService.saveFamilyEvent(event), 'addFamilyEvent', 'saveFamilyEvent', event);
            },
            updateFamilyEvent: (id, updates) => {
                set((state) => ({ familyEvents: state.familyEvents.map(e => e.id === id ? { ...e, ...updates } : e) }));
                const updated = get().familyEvents.find(e => e.id === id);
                if (updated) sync(() => syncService.saveFamilyEvent({ ...updated, ...updates }), 'updateFamilyEvent', 'saveFamilyEvent', { ...updated, ...updates });
            },
            deleteFamilyEvent: (id) => {
                set((state) => ({ familyEvents: state.familyEvents.filter(e => e.id !== id) }));
                sync(() => syncService.deleteFamilyEvent(id), 'deleteFamilyEvent', 'deleteFamilyEvent', id);
            },

            // ── Cloud load — called by AuthGate on login ──
            loadFromCloud: async () => {
                try {
                    const [cloudPantry, cloudRecipes, cloudShopping, cloudWeekly, cloudFamily, cloudTrips, cloudEvents] = await Promise.all([
                        syncService.fetchPantry(),
                        recipeService.getMyRecipes(), // use the newly centralized recipeService
                        syncService.fetchShoppingList(),
                        syncService.fetchWeeklyPlan(),
                        syncService.fetchFamilyMembers(),
                        syncService.fetchTrips(),
                        syncService.fetchFamilyEvents(),
                    ]);

                    console.log(`[useLifeStore] loadFromCloud: pantry=${cloudPantry.length} recipes=${cloudRecipes.length} shopping=${cloudShopping.length} weekly=${cloudWeekly.length} family=${cloudFamily.length} trips=${cloudTrips.length} events=${cloudEvents.length}`);

                    set((state) => ({
                        pantryItems: cloudPantry.length > 0 ? cloudPantry : state.pantryItems,
                        recipes: cloudRecipes.length > 0 ? cloudRecipes : state.recipes,
                        shoppingList: cloudShopping.length > 0 ? cloudShopping : state.shoppingList,
                        weeklyPlans: cloudWeekly.length > 0 ? cloudWeekly : state.weeklyPlans,
                        familyMembers: cloudFamily.length > 0 ? cloudFamily : state.familyMembers,
                        trips: cloudTrips.length > 0 ? cloudTrips : state.trips,
                        familyEvents: cloudEvents.length > 0 ? cloudEvents : state.familyEvents,
                    }));
                } catch (e) {
                    console.error('[useLifeStore] loadFromCloud failed:', e);
                }
            },
            clearAllData: () => set({
                weeklyPlans: [],
                pantryItems: [],
                shoppingList: [],
                recipes: [],
                trips: [],
                travelWishlist: [],
                priceAlerts: [],
                travelDocuments: [],
                familyMembers: [],
                familyEvents: [],
                vaultDocuments: [],
                homeAssets: [],
            })
        }),
        {
            name: 'aliseus_life_store',
            storage: createJSONStorage(() => idbStorage),
            // Don't persist mock-only fields that should come from Supabase
            partialize: (state) => ({
                weeklyPlans: state.weeklyPlans,
                pantryItems: state.pantryItems,
                shoppingList: state.shoppingList,
                recipes: state.recipes,
                trips: state.trips,
                travelWishlist: state.travelWishlist,
                priceAlerts: state.priceAlerts,
                travelDocuments: state.travelDocuments,
                familyMembers: state.familyMembers,
                familyEvents: state.familyEvents,
                widgets: state.widgets,
                vaultDocuments: state.vaultDocuments,
                homeAssets: state.homeAssets,
            }),
        }
    )
);
