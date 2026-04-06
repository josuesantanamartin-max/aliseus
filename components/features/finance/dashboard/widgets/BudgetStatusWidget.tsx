import React from 'react';
import { Budget, Transaction } from '../../../../../types';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetStatusWidgetProps {
    budgets: Budget[];
    transactions: Transaction[];
    currentIncome: number; // For percentage based budgets
    currency: string;
    selectedDate: Date;
    timeMode: 'MONTH' | 'YEAR';
}

const BudgetStatusWidget: React.FC<BudgetStatusWidgetProps> = ({ budgets, transactions, currentIncome, currency, selectedDate, timeMode }) => {

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency || 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    // Calculate spent amount for a given category and optional subcategory
    const calculateSpent = (category: string, subCategory?: string) => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        return transactions
            .filter(t => {
                const tDate = new Date(t.date);
                const isSamePeriod = timeMode === 'MONTH'
                    ? (tDate.getFullYear() === year && tDate.getMonth() === month)
                    : (tDate.getFullYear() === year);

                return isSamePeriod && t.type === 'EXPENSE' && t.category === category && (subCategory ? t.subCategory === subCategory : true);
            })
            .reduce((sum, t) => sum + t.amount, 0);
    };

    // Group budgets by category
    const groupedBudgets = budgets.reduce((acc, budget) => {
        if (!acc[budget.category]) {
            acc[budget.category] = {
                totalLimit: 0,
                totalSpent: 0,
                subcategories: [],
                hasCategoryBudget: false
            };
        }

        // Calculate effective limit
        let limit = budget.limit;
        if (budget.budgetType === 'PERCENTAGE' && budget.percentage) {
            limit = (currentIncome * budget.percentage) / 100;
        }

        // Calculate spent for this specific budget (category + subCategory if exists)
        const spent = calculateSpent(budget.category, budget.subCategory);

        if (budget.subCategory) {
            // It's a subcategory budget
            acc[budget.category].subcategories.push({
                name: budget.subCategory,
                limit,
                spent,
                percentage: limit > 0 ? (spent / limit) * 100 : 0
            });
        } else {
            // It's a category-level budget
            acc[budget.category].totalLimit = limit;
            acc[budget.category].hasCategoryBudget = true;
        }

        return acc;
    }, {} as Record<string, { totalLimit: number; totalSpent: number; subcategories: Array<{ name: string; limit: number; spent: number; percentage: number }>; hasCategoryBudget: boolean }>);

    // Calculate total spent for each category and sum subcategory limits if no category budget exists
    Object.keys(groupedBudgets).forEach(category => {
        groupedBudgets[category].totalSpent = calculateSpent(category);

        // If no category-level budget exists, sum the subcategory limits
        if (!groupedBudgets[category].hasCategoryBudget && groupedBudgets[category].subcategories.length > 0) {
            groupedBudgets[category].totalLimit = groupedBudgets[category].subcategories.reduce((sum, sub) => sum + sub.limit, 0);
        }
    });

    // Sort categories by percentage used
    const sortedCategories = Object.entries(groupedBudgets).sort((a, b) => {
        const aPercentage = a[1].totalLimit > 0 ? (a[1].totalSpent / a[1].totalLimit) * 100 : 0;
        const bPercentage = b[1].totalLimit > 0 ? (b[1].totalSpent / b[1].totalLimit) * 100 : 0;
        return bPercentage - aPercentage;
    });

    if (sortedCategories.length === 0) {
        return (
            <div className="bg-white dark:bg-aliseus-900 p-8 rounded-Aliseus border border-aliseus-100 dark:border-aliseus-800 shadow-sm">
                <div className="flex flex-col items-center justify-center text-center opacity-50 py-16">
                    <Activity className="w-12 h-12 text-aliseus-200 dark:text-aliseus-700 mb-3" />
                    <p className="text-sm font-bold text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest">Sin presupuestos activos</p>
                    <p className="text-xs text-aliseus-300 dark:text-aliseus-600 mt-1">Define presupuestos para controlar tus gastos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-[2rem] border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-lg transition-all h-full flex flex-col relative overflow-hidden group/widget">
            <div className="flex justify-between items-center mb-4 shrink-0 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl shadow-inner group-hover/widget:scale-110 transition-transform">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-cyan-900 dark:text-white tracking-tight">Control de Presupuestos</h3>
                    </div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest">
                        {timeMode === 'MONTH'
                            ? selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                            : selectedDate.getFullYear()}
                    </p>
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {sortedCategories.map(([category, data]) => {
                    const categoryPercentage = data.totalLimit > 0 ? (data.totalSpent / data.totalLimit) * 100 : 0;
                    const hasSubcategories = data.subcategories.length > 0;

                    return (
                        <div key={category} className="p-4 bg-aliseus-50/50 dark:bg-aliseus-800/50 rounded-2xl border border-aliseus-100 dark:border-aliseus-700 hover:bg-white dark:hover:bg-aliseus-800 hover:shadow-sm transition-all">
                            {/* Category Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Left: Category Summary */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-[10px] font-black text-aliseus-400 dark:text-aliseus-500 uppercase tracking-[0.15em] truncate pr-2">
                                            {category}
                                        </span>
                                        <span className={`text-xl font-black shrink-0 ${categoryPercentage > 100 ? 'text-red-500' :
                                            categoryPercentage > 80 ? 'text-amber-500' : 'text-emerald-500'
                                            }`}>
                                            {categoryPercentage.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black text-cyan-900 dark:text-white tracking-tight">
                                            {formatMoney(data.totalSpent)}
                                        </span>
                                        <span className="text-[10px] font-bold text-aliseus-400 dark:text-aliseus-500 truncate">
                                            / {formatMoney(data.totalLimit)}
                                        </span>
                                    </div>

                                    <div className="w-full bg-aliseus-100 dark:bg-aliseus-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${categoryPercentage > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                categoryPercentage > 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                    'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                }`}
                                            style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                                        ></div>
                                    </div>

                                    {categoryPercentage > 100 && (
                                        <div className="flex items-center gap-1.5 text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 mt-2">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                                Excedido en {formatMoney(data.totalSpent - data.totalLimit)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Subcategories */}
                                <div className="space-y-2">
                                    {hasSubcategories ? (
                                        <div className="space-y-1.5">
                                            {data.subcategories.sort((a, b) => b.percentage - a.percentage).map((sub, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-aliseus-900 rounded-xl border border-aliseus-100 dark:border-aliseus-700">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <p className="text-xs font-bold text-aliseus-800 dark:text-aliseus-200 truncate">{sub.name}</p>
                                                        <p className="text-[10px] font-bold text-aliseus-400 dark:text-aliseus-500 truncate mt-0.5">
                                                            {formatMoney(sub.spent)} / {formatMoney(sub.limit)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="w-16 bg-aliseus-100 dark:bg-aliseus-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                            <div
                                                                className={`h-full rounded-full ${sub.percentage > 100 ? 'bg-red-500' :
                                                                    sub.percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    }`}
                                                                style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-[10px] font-black tracking-widest min-w-[35px] text-right ${sub.percentage > 100 ? 'text-red-500' :
                                                            sub.percentage > 80 ? 'text-amber-500' : 'text-emerald-500'
                                                            }`}>
                                                            {sub.percentage.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-40 py-2">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-aliseus-400">Sin subcategorías</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetStatusWidget;
