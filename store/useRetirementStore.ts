import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RetirementPlan } from '../types';
import { retirementService } from '../services/retirementService';
import { retirementCalculator } from '../utils/retirementCalculator';

interface RetirementState {
    plans: RetirementPlan[];
    activePlanId: string | null;
    isLoading: boolean;
    error: string | null;
}

interface RetirementActions {
    fetchPlans: () => Promise<void>;
    createPlan: (plan: any) => Promise<void>; // Using 'any' for input, but should be RetirementPlanInput
    updatePlan: (id: string, updates: any) => Promise<void>;
    deletePlan: (id: string) => Promise<void>;
    setActivePlan: (id: string) => void;
    runSimulation: (plan: RetirementPlan) => RetirementPlan; // Returns local plan with updated projection
}

export const useRetirementStore = create<RetirementState & RetirementActions>()(
    persist(
        (set, get) => ({
            plans: [],
            activePlanId: null,
            isLoading: false,
            error: null,

            fetchPlans: async () => {
                set({ isLoading: true, error: null });
                try {
                    const plans = await retirementService.getPlans();
                    // Calculate projections for each plan on load (or we could store them)
                    const plansWithProjections = plans.map(p => {
                        const projection = retirementCalculator.calculate(
                            p.currentAge,
                            p.targetAge,
                            p.currentSavings,
                            p.monthlyContribution,
                            p.expectedReturn,
                            p.inflationRate,
                            p.targetMonthlyIncome
                        );
                        return { ...p, projection };
                    });

                    set({ plans: plansWithProjections, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            createPlan: async (planData) => {
                set({ isLoading: true, error: null });
                try {
                    // @ts-ignore
                    await retirementService.createPlan(planData);
                    get().fetchPlans();
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            updatePlan: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    await retirementService.updatePlan(id, updates);
                    get().fetchPlans();
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            deletePlan: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await retirementService.deletePlan(id);
                    set(state => ({
                        plans: state.plans.filter(p => p.id !== id),
                        activePlanId: state.activePlanId === id ? null : state.activePlanId,
                        isLoading: false
                    }));
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            setActivePlan: (id) => set({ activePlanId: id }),

            runSimulation: (plan) => {
                const projection = retirementCalculator.calculate(
                    plan.currentAge,
                    plan.targetAge,
                    plan.currentSavings,
                    plan.monthlyContribution,
                    plan.expectedReturn,
                    plan.inflationRate,
                    plan.targetMonthlyIncome
                );
                return { ...plan, projection };
            }
        }),
        {
            name: 'aliseus_retirement_store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                activePlanId: state.activePlanId // Only persist active selection, plans are fetched
            }),
        }
    )
);
