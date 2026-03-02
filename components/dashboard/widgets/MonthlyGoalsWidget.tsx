import React, { useMemo } from 'react';
import { DashboardDataProps } from '../WidgetRegistry';
import { Target, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const MonthlyGoalsWidget: React.FC<DashboardDataProps> = ({
    goals,
    selectedDate
}) => {
    const monthlyGoalsData = useMemo(() => {
        const now = selectedDate;
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Filtrar metas que tienen deadline en el mes actual
        const monthlyGoals = (goals || []).filter(goal => {
            if (!goal.deadline) return false;
            const deadline = new Date(goal.deadline);
            return deadline >= monthStart && deadline <= monthEnd;
        });

        // Calcular progreso y proyección para cada meta
        return monthlyGoals.map(goal => {
            const progress = goal.targetAmount > 0
                ? (goal.currentAmount / goal.targetAmount) * 100
                : 0;

            const remaining = goal.targetAmount - goal.currentAmount;
            const deadline = new Date(goal.deadline!);
            const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const daysPassed = now.getDate();
            const expectedProgress = (daysPassed / daysInMonth) * 100;

            // Determinar si está en ritmo
            const isOnTrack = progress >= expectedProgress;
            const isCompleted = progress >= 100;
            const isAtRisk = !isCompleted && daysRemaining <= 5 && progress < 80;

            // Proyección de cumplimiento
            const dailyRate = daysPassed > 0 ? goal.currentAmount / daysPassed : 0;
            const projectedAmount = dailyRate * daysInMonth;
            const willComplete = projectedAmount >= goal.targetAmount;

            return {
                ...goal,
                progress,
                remaining,
                daysRemaining,
                isOnTrack,
                isCompleted,
                isAtRisk,
                willComplete,
                projectedAmount
            };
        });
    }, [goals, selectedDate]);

    const completedGoals = monthlyGoalsData.filter(g => g.isCompleted).length;
    const totalGoals = monthlyGoalsData.length;

    return (
        <div className="bg-white dark:bg-onyx-900 rounded-[2rem] p-6 shadow-sm border border-onyx-100 dark:border-onyx-800 hover:shadow-lg transition-all h-full flex flex-col relative overflow-hidden group/widget">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover/widget:scale-110 transition-transform">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-onyx-900 dark:text-white uppercase tracking-wide">
                            Objetivos del Mes
                        </h3>
                        <p className="text-xs text-onyx-500 dark:text-onyx-400 font-bold">
                            {completedGoals} de {totalGoals} completados
                        </p>
                    </div>
                </div>
                {totalGoals > 0 && (
                    <div className="text-right">
                        <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
                            {Math.round((completedGoals / totalGoals) * 100)}%
                        </p>
                    </div>
                )}
            </div>

            {/* Goals List */}
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {monthlyGoalsData.length === 0 ? (
                    <div className="text-center py-8">
                        <Target className="w-10 h-10 text-onyx-300 dark:text-onyx-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-onyx-500 dark:text-onyx-400">
                            No hay metas para este mes
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-onyx-400 dark:text-onyx-500 mt-1 font-bold">
                            Crea metas con deadline actual
                        </p>
                    </div>
                ) : (
                    monthlyGoalsData.map((goal) => (
                        <div
                            key={goal.id}
                            className={`p-3 rounded-xl border transition-all hover:shadow-md ${goal.isCompleted
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50'
                                : goal.isAtRisk
                                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50'
                                    : 'bg-onyx-50 dark:bg-onyx-800 border-onyx-200 dark:border-onyx-700 hover:bg-white dark:hover:bg-onyx-900'
                                }`}
                        >
                            {/* Goal Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    {goal.isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                    ) : goal.isAtRisk ? (
                                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                                    ) : (
                                        <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-onyx-900 dark:text-white truncate">
                                            {goal.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Clock className="w-3 h-3 text-onyx-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-onyx-500 dark:text-onyx-400">
                                                {goal.daysRemaining > 0
                                                    ? `${goal.daysRemaining} d restantes`
                                                    : goal.daysRemaining === 0
                                                        ? 'Último día'
                                                        : 'Vencido'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-2 shrink-0">
                                    <p className="text-xs font-black text-onyx-900 dark:text-white">
                                        {goal.currentAmount.toFixed(0)}€
                                    </p>
                                    <p className="text-[10px] font-bold text-onyx-500 dark:text-onyx-400">
                                        / {goal.targetAmount.toFixed(0)}€
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-2">
                                <div className="h-1.5 bg-onyx-200 dark:bg-onyx-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${goal.isCompleted
                                            ? 'bg-emerald-500'
                                            : goal.isAtRisk
                                                ? 'bg-rose-500'
                                                : goal.isOnTrack
                                                    ? 'bg-cyan-500'
                                                    : 'bg-amber-500'
                                            }`}
                                        style={{ width: `${Math.min(100, goal.progress)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between text-[10px]">
                                <span className={`font-bold uppercase tracking-widest ${goal.isCompleted
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : goal.isAtRisk
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : goal.isOnTrack
                                            ? 'text-cyan-600 dark:text-cyan-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                    }`}>
                                    {goal.isCompleted
                                        ? '¡Completado!'
                                        : goal.isAtRisk
                                            ? 'En riesgo'
                                            : goal.isOnTrack
                                                ? 'En buen ritmo'
                                                : 'Necesita impulso'
                                    }
                                </span>
                                <span className="text-onyx-500 dark:text-onyx-400 font-bold">
                                    {goal.progress.toFixed(0)}%
                                </span>
                            </div>

                            {/* Projection */}
                            {!goal.isCompleted && (
                                <div className="mt-2 pt-2 border-t border-onyx-200 dark:border-onyx-700/50">
                                    <p className="text-[10px] font-bold text-onyx-600 dark:text-onyx-400 uppercase tracking-widest flex items-center justify-between">
                                        <span>Proyección: {goal.projectedAmount.toFixed(0)}€</span>
                                        {goal.willComplete ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">✓ Cumplirá</span>
                                        ) : (
                                            <span className="text-amber-600 dark:text-amber-400">
                                                ⚠ -{(goal.targetAmount - goal.projectedAmount).toFixed(0)}€
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MonthlyGoalsWidget;

