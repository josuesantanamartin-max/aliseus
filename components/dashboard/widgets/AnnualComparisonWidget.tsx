import React, { useMemo } from 'react';
import { DashboardDataProps } from '../WidgetRegistry';
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AnnualComparisonWidget: React.FC<DashboardDataProps> = ({
    transactions,
    selectedDate
}) => {
    const comparisonData = useMemo(() => {
        const currentYear = selectedDate.getFullYear();
        const yearsToCompare = 4; // Muestra el año seleccionado y los 3 anteriores (4 barras en total)

        const yearlyData = Array.from({ length: yearsToCompare }, (_, i) => {
            const year = currentYear - i;
            const yearTransactions = (transactions || []).filter(t => new Date(t.date).getFullYear() === year);

            const income = yearTransactions
                .filter(t => t.type === 'INCOME' && t.category !== 'Transferencia')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = yearTransactions
                .filter(t => t.type === 'EXPENSE' && t.category !== 'Transferencia')
                .reduce((sum, t) => sum + t.amount, 0);

            const savings = income - expenses;

            return { year, income, expenses, savings };
        });

        // Comparativa principal es entre los dos años más recientes
        const current = yearlyData[0];
        const previous = yearlyData[1];

        // Calcular variaciones
        const incomeChange = previous.income > 0
            ? ((current.income - previous.income) / previous.income) * 100
            : 0;

        const expensesChange = previous.expenses > 0
            ? ((current.expenses - previous.expenses) / previous.expenses) * 100
            : 0;

        const savingsChange = previous.savings !== 0
            ? ((current.savings - previous.savings) / Math.abs(previous.savings)) * 100
            : 0;

        return {
            currentYear,
            previousYear: currentYear - 1,
            yearlyData,
            current,
            previous,
            changes: {
                income: incomeChange,
                expenses: expensesChange,
                savings: savingsChange
            }
        };
    }, [transactions, selectedDate]);

    const { currentYear, previousYear, yearlyData, current, previous, changes } = comparisonData;

    // Calcular altura de barras (normalizado al valor máximo global)
    const maxValue = Math.max(
        ...yearlyData.map(d => Math.max(d.income, d.expenses))
    );

    return (
        <div className="bg-white dark:bg-onyx-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-onyx-800 hover:shadow-lg transition-all h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Comparativa Anual
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Últimos {yearlyData.length} años
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparison Bars */}
            <div className="space-y-6 mb-6">
                {/* Ingresos */}
                <ComparisonBar
                    label="Ingresos"
                    data={yearlyData.map(d => ({ year: d.year, value: d.income }))}
                    change={changes.income}
                    maxValue={maxValue}
                    color="green"
                    positiveIsGood={true}
                />

                {/* Gastos */}
                <ComparisonBar
                    label="Gastos"
                    data={yearlyData.map(d => ({ year: d.year, value: d.expenses }))}
                    change={changes.expenses}
                    maxValue={maxValue}
                    color="red"
                    positiveIsGood={false}
                />
            </div>

            {/* Savings Summary */}
            <div className={`rounded-xl p-4 border mt-auto ${current.savings >= 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                }`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Ahorro Neto {currentYear}
                    </span>
                    <ChangeIndicator value={changes.savings} />
                </div>
                <p className={`text-2xl font-black ${current.savings >= 0
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                    }`}>
                    {current.savings.toFixed(2)}€
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    vs {previous.savings.toFixed(2)}€ en {previousYear}
                </p>
            </div>
        </div>
    );
};

// Componente auxiliar para barras de comparación
const ComparisonBar: React.FC<{
    label: string;
    data: { year: number; value: number }[];
    change: number;
    maxValue: number;
    color: 'green' | 'red';
    positiveIsGood: boolean;
}> = ({ label, data, change, maxValue, color, positiveIsGood }) => {
    const colorClasses = {
        green: 'bg-green-500 text-green-600 dark:text-green-400',
        red: 'bg-red-500 text-red-600 dark:text-red-400'
    };

    const isPositiveChange = change > 0;
    const isGoodChange = positiveIsGood ? isPositiveChange : !isPositiveChange;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{label}</span>
                <ChangeIndicator value={change} isGood={isGoodChange} />
            </div>

            <div className="space-y-3">
                {data.map((item, index) => {
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                    // Solo el año actual tiene opacidad total, el resto tiene menor opacidad
                    const isCurrent = index === 0;
                    const opacityClass = isCurrent ? 'opacity-100' : 'opacity-40';
                    const textClass = isCurrent ? 'font-black text-gray-900 dark:text-white' : 'font-semibold text-gray-500 dark:text-gray-400';

                    return (
                        <div key={item.year} className="group relative">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="font-bold text-gray-400 dark:text-gray-500">{item.year}</span>
                                <span className={textClass}>
                                    {item.value.toFixed(2)}€
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-onyx-800/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${colorClasses[color].split(' ')[0]} ${opacityClass} rounded-full transition-all duration-700 ease-out group-hover:opacity-100`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Componente auxiliar para indicador de cambio
const ChangeIndicator: React.FC<{ value: number; isGood?: boolean }> = ({ value, isGood }) => {
    const isPositive = value > 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    // Si no se especifica isGood, usar verde para positivo y rojo para negativo
    const color = isGood !== undefined
        ? isGood ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
        : isPositive ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';

    if (value === 0) {
        return <span className="text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-onyx-800">0.0%</span>;
    }

    return (
        <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${color}`}>
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-black tracking-wider">
                {Math.abs(value).toFixed(1)}%
            </span>
        </div>
    );
};

export default AnnualComparisonWidget;

