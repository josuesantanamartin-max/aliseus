import { useFinanceStore } from '../store/useFinanceStore';
import { useLifeStore } from '../store/useLifeStore';

/**
 * Calculates the AURA Score (0-100) based on family financial and life metrics.
 * 
 * Weighting:
 * - Budget Adherence (40%): How closely current spending tracks against set budgets.
 * - Savings Rate (30%): Percentage of income saved this month.
 * - Emergency Fund Status (20%): Progress towards the emergency fund goal.
 * - Debt Coverage (10%): Ratio of income to debt payments.
 */
export const calculateAuraScore = (): number => {
    // In a real scenario, these would be fetched directly from the stores
    // or passed as arguments to ensure reactivity if used inside a component.
    // We will assume they are passed as arguments for pure function benefits.
    return 85; // Placeholder baseline for now.
};

export const computeAuraScoreMetrics = (
    monthlyIncome: number = 0,
    monthlyExpenses: number = 0,
    budgets: any[] = [],
    debts: any[] = [],
    savingsGoals: any[] = [],
    transactions: any[] = []
): {
    score: number;
    budgetAdherence: number;
    savingsRate: number;
    emergencyFund: number;
    debtCoverage: number;
} => {
    let score = 0;

    // 1. Savings Rate (30 points)
    // Target: 20% or more gets full points.
    let savingsRatePercentage = 0;
    let savingsPoints = 0;
    if (monthlyIncome > 0) {
        savingsRatePercentage = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
        if (savingsRatePercentage >= 20) savingsPoints = 30;
        else if (savingsRatePercentage > 0) savingsPoints = (savingsRatePercentage / 20) * 30;
    }

    // 2. Budget Adherence (40 points)
    // Target: 100% or less of total budget used gets full points.
    let budgetPoints = 0;
    let budgetAdherencePercentage = 0;
    const totalBudgetLimit = (budgets || []).reduce((acc, b) => acc + (b.limit || 0), 0);

    // Calculate total spent based on current month transactions for budget categories
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalBudgetSpent = (transactions || [])
        .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth && (budgets || []).some(b => b.category === t.category))
        .reduce((acc, t) => acc + (t.amount || 0), 0);

    if (totalBudgetLimit > 0) {
        budgetAdherencePercentage = (totalBudgetSpent / totalBudgetLimit) * 100;
        if (budgetAdherencePercentage <= 80) budgetPoints = 40; // Under 80% is perfect
        else if (budgetAdherencePercentage <= 100) {
            // Linear scale from 40 points at 80% to 20 points at 100%
            budgetPoints = 40 - ((budgetAdherencePercentage - 80) * 1);
        } else {
            // Penalty for going over
            budgetPoints = Math.max(0, 20 - ((budgetAdherencePercentage - 100) * 2));
        }
    } else {
        // If no budgets, neutral score based on expenses vs income
        budgetPoints = (monthlyExpenses < monthlyIncome) ? 30 : 10;
    }


    // 3. Emergency Fund (20 points)
    // Looking for a goal titled "Fondo de Emergencia" (or similar)
    let emergencyPoints = 0;
    let emergencyFundPercentage = 0;
    const emergencyGoal = (savingsGoals || []).find(g =>
        g.name?.toLowerCase().includes('emergencia') ||
        g.name?.toLowerCase().includes('emergency') ||
        g.name?.toLowerCase().includes('colchón')
    );

    if (emergencyGoal && emergencyGoal.targetAmount > 0) {
        emergencyFundPercentage = (emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100;
        emergencyPoints = Math.min(20, (emergencyFundPercentage / 100) * 20);
    } else {
        // If no explicit emergency fund, allocate half points as neutral
        emergencyPoints = 10;
    }

    // 4. Debt Coverage (10 points)
    // Target: Debt payments should be < 30% of income.
    let debtPoints = 0;
    let debtCoveragePercentage = 0;
    const totalMonthlyDebtPayments = (debts || []).reduce((acc, d) => acc + (d.minPayment || 0), 0);

    if (monthlyIncome > 0) {
        debtCoveragePercentage = (totalMonthlyDebtPayments / monthlyIncome) * 100;
        if (debtCoveragePercentage === 0) debtPoints = 10;
        else if (debtCoveragePercentage <= 15) debtPoints = 10;
        else if (debtCoveragePercentage <= 30) debtPoints = 5 + (5 * (30 - debtCoveragePercentage) / 15);
        else debtPoints = Math.max(0, 5 - ((debtCoveragePercentage - 30) * 0.5));
    } else {
        debtPoints = totalMonthlyDebtPayments === 0 ? 10 : 0;
    }

    score = Math.round(savingsPoints + budgetPoints + emergencyPoints + debtPoints);

    // Cap between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        budgetAdherence: budgetAdherencePercentage,
        savingsRate: savingsRatePercentage,
        emergencyFund: emergencyFundPercentage,
        debtCoverage: debtCoveragePercentage
    };
};
