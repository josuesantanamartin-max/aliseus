import { RetirementProjection, RetirementPlan } from '../types';

export const retirementCalculator = {
    /**
     * Calculates the retirement projection based on inputs.
     * Based on compound interest formula with monthly contributions.
     */
    calculate: (
        currentAge: number,
        targetAge: number,
        currentSavings: number,
        monthlyContribution: number,
        expectedReturn: number, // Annual %
        inflationRate: number, // Annual %
        targetMonthlyIncome: number
    ): RetirementProjection => {
        const yearsToInvest = targetAge - currentAge;
        const months = yearsToInvest * 12;

        const nominalRate = expectedReturn / 100;
        const inflation = inflationRate / 100;
        const realRate = (1 + nominalRate) / (1 + inflation) - 1;
        const monthlyRealRate = realRate / 12;

        let totalSavings = currentSavings;

        // Future Value with monthly compounding and monthly contributions
        if (monthlyRealRate !== 0) {
            // Combined FV formula: FV of Lump Sum + FV of Annuity
            totalSavings = (currentSavings * Math.pow(1 + monthlyRealRate, months)) +
                (monthlyContribution * (Math.pow(1 + monthlyRealRate, months) - 1) / monthlyRealRate);
        } else {
            totalSavings = currentSavings + (monthlyContribution * months);
        }

        // Years of Funding: Supports growth during drawdown
        // N = -ln(1 - (PV*i/PMT)) / ln(1+i)
        // This formula ACCOUNTs for the remaining balance growing at 'i' while withdrawing 'PMT'
        let monthsOfFunding = 0;
        if (totalSavings <= 0) {
            monthsOfFunding = 0;
        } else if (monthlyRealRate === 0) {
            monthsOfFunding = totalSavings / targetMonthlyIncome;
        } else {
            // If interest generated >= withdrawal, it lasts "forever"
            if (totalSavings * monthlyRealRate >= targetMonthlyIncome) {
                monthsOfFunding = 1200; // 100 years
            } else {
                monthsOfFunding = -Math.log(1 - (totalSavings * monthlyRealRate / targetMonthlyIncome)) / Math.log(1 + monthlyRealRate);
            }
        }

        const sustainableMonthlyIncome = (totalSavings * 0.04) / 12;

        return {
            totalSavings: Math.round(totalSavings),
            monthlyIncome: Math.round(sustainableMonthlyIncome),
            yearsOfFunding: parseFloat((monthsOfFunding / 12).toFixed(1)),
        };
    },

    /**
     * Calculates the monthly contribution needed to reach a target income.
     * Uses the 4% rule to determine target capital.
     */
    calculateRequiredContribution: (
        currentAge: number,
        targetAge: number,
        currentSavings: number,
        expectedReturn: number,
        inflationRate: number,
        targetMonthlyIncome: number
    ): number => {
        const yearsToInvest = targetAge - currentAge;
        const months = yearsToInvest * 12;
        // Target capital to support income indefinitely (4% rule)
        const targetCapital = (targetMonthlyIncome * 12) / 0.04;

        const nominalRate = expectedReturn / 100;
        const inflation = inflationRate / 100;
        const realRate = (1 + nominalRate) / (1 + inflation) - 1;
        const monthlyRealRate = realRate / 12;

        if (months <= 0) return 0;

        const fvOfCurrentSavings = currentSavings * Math.pow(1 + monthlyRealRate, months);
        const neededFromContributions = targetCapital - fvOfCurrentSavings;

        if (neededFromContributions <= 0) return 0;
        if (monthlyRealRate === 0) return neededFromContributions / months;

        // PMT = FV / [((1 + r)^n - 1) / r]
        return neededFromContributions / ((Math.pow(1 + monthlyRealRate, months) - 1) / monthlyRealRate);
    },

    /**
     * Generates recommendations based on the gap.
     */
    getRecommendations: (
        projection: RetirementProjection,
        targetMonthlyIncome: number,
        requiredContribution: number,
        currentContribution: number
    ): { text: string; type: 'success' | 'warning' | 'error' }[] => {
        const recommendations: { text: string; type: 'success' | 'warning' | 'error' }[] = [];
        const gap = targetMonthlyIncome - projection.monthlyIncome;

        if (gap <= 0) {
            recommendations.push({
                text: "¡Vas por buen camino! Tu plan actual cubre e incluso supera tu objetivo de ingresos.",
                type: 'success'
            });
        } else {
            const extraContribution = Math.max(0, requiredContribution - currentContribution);

            if (projection.yearsOfFunding < 20) {
                recommendations.push({
                    text: `Alerta Crítica: Tienes una brecha de ${gap.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/mes. Tu capital se agotará en ${projection.yearsOfFunding} años.`,
                    type: 'error'
                });
            } else {
                recommendations.push({
                    text: `Atención: Tu ingreso mensual sostenible (${projection.monthlyIncome.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€) es inferior a tu objetivo de ${targetMonthlyIncome.toLocaleString('es-ES')}€/mes.`,
                    type: 'warning'
                });
            }

            if (extraContribution > 0) {
                recommendations.push({
                    text: `Aumentar tu aportación en ${extraContribution.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/mes (total ${requiredContribution.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€) cerraría esta brecha por completo.`,
                    type: 'warning'
                });
            }
        }

        return recommendations;
    }
};
