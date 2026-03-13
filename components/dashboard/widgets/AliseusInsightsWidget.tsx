import React, { useMemo } from 'react';
import { DashboardDataProps } from '../WidgetRegistry';
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface Insight {
    id: string;
    type: 'warning' | 'success' | 'info' | 'critical';
    title: string;
    description: string;
    actionLabel?: string;
    actionTab?: string;
}

const AliseusInsightsWidget: React.FC<DashboardDataProps> = ({
    transactions,
    budgets,
    accounts,
    monthlyExpenses,
    monthlyIncome,
    onNavigate
}) => {

    const insights = useMemo(() => {
        const generatedInsights: Insight[] = [];

        // Calculate spent for budget
        const calculateSpent = (category: string, subCategory?: string) => {
            const year = new Date().getFullYear();
            const month = new Date().getMonth();
            return transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getFullYear() === year && tDate.getMonth() === month &&
                        t.type === 'EXPENSE' && t.category === category &&
                        (subCategory ? t.subCategory === subCategory : true);
                })
                .reduce((sum, t) => sum + t.amount, 0);
        };

        // 1. Budget Warnings
        budgets.forEach(budget => {
            const spent = calculateSpent(budget.category, budget.subCategory);
            const limit = budget.budgetType === 'PERCENTAGE' && budget.percentage ? (monthlyIncome * budget.percentage) / 100 : budget.limit;

            if (spent > 0 && limit > 0) {
                const percentage = (spent / limit) * 100;
                if (percentage >= 90) {
                    generatedInsights.push({
                        id: `budget_critical_${budget.id}`,
                        type: 'critical',
                        title: 'Presupuesto Crítico',
                        description: `Has consumido el ${percentage.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}% del presupuesto de ${budget.category}.`,
                        actionLabel: 'Ver Presupuestos',
                        actionTab: 'budgets'
                    });
                } else if (percentage >= 75) {
                    generatedInsights.push({
                        id: `budget_warning_${budget.id}`,
                        type: 'warning',
                        title: 'Presupuesto Elevado',
                        description: `El presupuesto de ${budget.category} está al ${percentage.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%.`,
                        actionLabel: 'Ajustar',
                        actionTab: 'budgets'
                    });
                }
            }
        });

        // 2. Savings Rate Insight
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
        if (monthlyIncome > 0) {
            if (savingsRate < 10 && savingsRate > 0) {
                generatedInsights.push({
                    id: 'savings_low',
                    type: 'warning',
                    title: 'Ahorro Bajo',
                    description: `Tu tasa de ahorro es del ${savingsRate.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%. Se recomienda al menos un 20%.`,
                    actionLabel: 'Ver Gastos',
                    actionTab: 'analytics'
                });
            } else if (savingsRate < 0) {
                generatedInsights.push({
                    id: 'savings_negative',
                    type: 'critical',
                    title: 'Déficit Mensual',
                    description: `Tus gastos superan tus ingresos este mes por ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(monthlyExpenses - monthlyIncome)}.`,
                    actionLabel: 'Analizar',
                    actionTab: 'analytics'
                });
            } else if (savingsRate > 30) {
                generatedInsights.push({
                    id: 'savings_excellent',
                    type: 'success',
                    title: 'Ahorro Óptimo',
                    description: `¡Excelente ritmo! Tienes una tasa de ahorro del ${savingsRate.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%.`,
                    actionLabel: 'Ver Resumen',
                    actionTab: 'dashboard'
                });
            }
        }

        // 3. High expense in specific category (e.g. Restaurants or Leisure)
        const currentMonthTransactions = transactions.filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() === new Date().getMonth());
        const categoryTotals = currentMonthTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        const leisureCategories = ['Restaurantes', 'Ocio', 'Entretenimiento'];
        let leisureTotal = 0;
        leisureCategories.forEach(cat => {
            if (categoryTotals[cat]) leisureTotal += categoryTotals[cat];
        });

        if (monthlyIncome > 0 && (leisureTotal / monthlyIncome) > 0.15) {
            generatedInsights.push({
                id: 'high_leisure',
                type: 'info',
                title: 'Patrón Detectado',
                description: `Tus gastos en ocio/restaurantes representan más del 15% de tus ingresos este mes.`,
                actionLabel: 'Revisar',
                actionTab: 'transactions'
            });
        }

        // 4. Fallback if no insights
        if (generatedInsights.length === 0) {
            generatedInsights.push({
                id: 'all_good',
                type: 'success',
                title: 'Todo en Orden',
                description: 'Tus finanzas y presupuestos marchan según lo planeado. No hay alertas críticas.',
            });
        }

        // Return top 3 insights prioritizing critical and warnings
        return generatedInsights
            .sort((a, b) => {
                const priority = { 'critical': 4, 'warning': 3, 'info': 2, 'success': 1 };
                return priority[b.type] - priority[a.type];
            })
            .slice(0, 3);

    }, [transactions, budgets, monthlyExpenses, monthlyIncome]);

    const getTypeStyles = (type: Insight['type']) => {
        switch (type) {
            case 'critical': return { icon: AlertTriangle, bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800/30', text: 'text-rose-700 dark:text-rose-400', iconColor: 'text-rose-600 dark:text-rose-500' };
            case 'warning': return { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/30', text: 'text-amber-700 dark:text-amber-400', iconColor: 'text-amber-500 dark:text-amber-500' };
            case 'success': return { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/30', text: 'text-emerald-700 dark:text-emerald-400', iconColor: 'text-emerald-600 dark:text-emerald-500' };
            case 'info': return { icon: Lightbulb, bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800/30', text: 'text-cyan-700 dark:text-cyan-400', iconColor: 'text-cyan-600 dark:text-cyan-500' };
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-onyx-900 rounded-[2rem] border border-onyx-100 dark:border-onyx-800 p-6 md:p-8 shadow-sm relative overflow-hidden group/widget hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-bl from-indigo-50/50 dark:from-indigo-900/10 to-transparent opacity-0 group-hover/widget:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-inner group-hover/widget:scale-110 transition-transform">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    Aliseus Insights
                </h3>
            </div>

            <p className="text-sm font-bold text-onyx-400 dark:text-onyx-500 mb-6 uppercase tracking-widest relative z-10">
                Análisis Proactivo
            </p>

            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {insights.map(insight => {
                    const styles = getTypeStyles(insight.type);
                    const Icon = styles.icon;
                    return (
                        <div key={insight.id} className={`p-4 rounded-2xl border ${styles.bg} ${styles.border} transition-all`}>
                            <div className="flex items-start gap-3">
                                <div className={`shrink-0 mt-0.5 ${styles.iconColor}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-bold ${styles.text} mb-1`}>{insight.title}</h4>
                                    <p className="text-xs font-medium text-onyx-600 dark:text-onyx-300 leading-relaxed mb-3">
                                        {insight.description}
                                    </p>
                                    {insight.actionLabel && (
                                        <button
                                            onClick={() => onNavigate('finance', insight.actionTab)}
                                            className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-onyx-500 dark:text-onyx-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            {insight.actionLabel} <ArrowRight className="w-3 h-3" />
                                        </button>
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

export default AliseusInsightsWidget;
