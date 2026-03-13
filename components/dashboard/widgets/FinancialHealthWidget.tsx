import React, { useMemo } from 'react';
import { DashboardDataProps } from '../WidgetRegistry';
import { calculateFinancialHealth, getHealthScoreColor, getHealthLevelText } from '../../../utils/financialHealth';
import { Activity, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

const FinancialHealthWidget: React.FC<DashboardDataProps> = ({
    transactions,
    accounts,
    debts,
    budgets,
    selectedDate
}) => {
    const healthData = useMemo(() =>
        calculateFinancialHealth(transactions, accounts, debts, budgets, selectedDate),
        [transactions, accounts, debts, budgets, selectedDate]
    );

    const { score, breakdown, recommendations, trend, level } = healthData;
    const scoreColor = getHealthScoreColor(score);
    const levelText = getHealthLevelText(level);

    // Calcular porcentaje para el círculo
    const circumference = 2 * Math.PI * 45; // radio = 45
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const TrendIcon = trend === 'UP' ? TrendingUp : trend === 'DOWN' ? TrendingDown : Minus;

    return (
        <div className="bg-white dark:bg-onyx-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-onyx-800 hover:shadow-lg transition-all h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Salud Financiera
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{levelText}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                    <TrendIcon className="w-4 h-4" />
                </div>
            </div>

            {/* Circular Score */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                        {/* Background circle */}
                        <circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200 dark:text-onyx-800"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke={scoreColor}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black" style={{ color: scoreColor }}>
                            {score}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">/ 100</span>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-6">
                <BreakdownItem
                    label="Ahorro"
                    score={breakdown.savingsRatio.score}
                    max={30}
                    value={`${Math.round(breakdown.savingsRatio.value * 100)}%`}
                />
                <BreakdownItem
                    label="Deuda"
                    score={breakdown.debtRatio.score}
                    max={25}
                    value={`${Math.round(breakdown.debtRatio.value * 100)}%`}
                />
                <BreakdownItem
                    label="Emergencia"
                    score={breakdown.emergencyFund.score}
                    max={20}
                    value={`${Math.round(breakdown.emergencyFund.value * 100)}%`}
                />
                <BreakdownItem
                    label="Presupuesto"
                    score={breakdown.budgetCompliance.score}
                    max={15}
                    value={`${Math.round(breakdown.budgetCompliance.value * 100)}%`}
                />
                <BreakdownItem
                    label="Diversificación"
                    score={breakdown.diversification.score}
                    max={10}
                    value={`${breakdown.diversification.value} fuentes`}
                />
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <h4 className="text-xs font-black text-blue-900 dark:text-blue-100 uppercase tracking-wide">
                            Recomendaciones
                        </h4>
                    </div>
                    <ul className="space-y-1.5 ml-6">
                        {recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                • {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Componente auxiliar para mostrar cada factor
const BreakdownItem: React.FC<{ label: string; score: number; max: number; value: string }> = ({
    label,
    score,
    max,
    value
}) => {
    const percentage = (score / max) * 100;

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-onyx-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default FinancialHealthWidget;
