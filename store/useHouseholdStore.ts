import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Household, HouseholdMember } from '../types';
import { householdService } from '../services/householdService';

interface HouseholdState {
    households: Household[];
    activeHouseholdId: string | null;
    members: HouseholdMember[];
    isLoading: boolean;
    error: string | null;
}

interface HouseholdActions {
    fetchHouseholds: () => Promise<void>;
    setActiveHousehold: (id: string) => void;
    createHousehold: (name: string, currency: 'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR') => Promise<void>;
    fetchMembers: (householdId: string) => Promise<void>;
    inviteMember: (email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') => Promise<any>;
    joinHousehold: (token: string) => Promise<void>;
    leaveHousehold: (id: string) => Promise<void>;
    deleteHousehold: (id: string) => Promise<void>;
}

export const useHouseholdStore = create<HouseholdState & HouseholdActions>()(
    persist(
        (set, get) => ({
            households: [],
            activeHouseholdId: null,
            members: [],
            isLoading: false,
            error: null,

            fetchHouseholds: async () => {
                set({ isLoading: true, error: null });
                try {
                    const households = await householdService.getMyHouseholds();
                    set({ households, isLoading: false });

                    // If no active household, set the first one
                    const state = get();
                    if (!state.activeHouseholdId && households.length > 0) {
                        set({ activeHouseholdId: households[0].id });
                    }
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            setActiveHousehold: (id) => {
                set({ activeHouseholdId: id });
                // Optionally fetch members immediately
                get().fetchMembers(id);
            },

            createHousehold: async (name, currency) => {
                set({ isLoading: true, error: null });
                try {
                    // @ts-ignore
                    const id = await householdService.createHousehold({ name, currency });
                    await get().fetchHouseholds(); // Refresh list and wait
                    
                    // Set the newly created household as active
                    if (id) {
                        set({ activeHouseholdId: id });
                    }
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchMembers: async (householdId) => {
                // Avoid fetching if not active? 
                // For now just fetch.
                try {
                    // @ts-ignore
                    const members = await householdService.getHouseholdMembers(householdId);
                    set({ members });
                } catch (e: any) {
                    console.error("Failed to fetch members", e);
                }
            },

            inviteMember: async (email, role) => {
                const { activeHouseholdId } = get();
                if (!activeHouseholdId) throw new Error("No active household");
                const invite = await householdService.inviteMember(activeHouseholdId, email, role);
                return invite;
            },

            joinHousehold: async (token: string) => {
                set({ isLoading: true, error: null });
                try {
                    await householdService.acceptInvitation(token);
                    await get().fetchHouseholds();
                    set({ isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            leaveHousehold: async (id) => {
                set({ isLoading: true });
                try {
                    await householdService.leaveHousehold(id);
                    await get().fetchHouseholds();
                    
                    // If the leaving household was active, set a different one
                    const state = get();
                    if (state.activeHouseholdId === id) {
                        set({ activeHouseholdId: state.households[0]?.id || null });
                    }
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            deleteHousehold: async (id) => {
                set({ isLoading: true });
                try {
                    await householdService.deleteHousehold(id);
                    await get().fetchHouseholds();
                    
                    const state = get();
                    if (state.activeHouseholdId === id) {
                        set({ activeHouseholdId: state.households[0]?.id || null });
                    }
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            }
        }),
        {
            name: 'aliseus_household_store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                activeHouseholdId: state.activeHouseholdId,
                // We might not want to persist households if they change often, but for performance it's okay
                households: state.households,
            }),
        }
    )
);
