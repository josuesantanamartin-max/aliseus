import React, { useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { AlertCircle, ArrowUpRight, ShieldAlert, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CriticalAlerts() {
    const { debts, budgets, transactions } = useFinanceStore();
    const { pantryItems } = useLifeStore();
    const { setActiveApp, setLifeActiveTab } = useUserStore();
    const [dismissedAlerts, setDismissedAlerts] = React.useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('aliseus_dismissed_alerts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const alerts = useMemo(() => {
        const activeAlerts: {
            id: string;
            type: 'danger' | 'warning' | 'ai';
            icon: React.ElementType;
            message: string;
            subMessage?: string;
            actionLabel?: string;
            onClick?: () => void;
        }[] = [];
        const today = new Date();

        // 1. Debts due in <= 7 days
        debts.forEach(debt => {
            if (!debt.dueDate) return;
            const parts = debt.dueDate.split('-');
            let dDate = new Date(debt.dueDate);
            if (parts.length === 1) {
                dDate = new Date(today.getFullYear(), today.getMonth(), Number(parts[0]));
                if (dDate < today) dDate.setMonth(dDate.getMonth() + 1);
            } else if (parts.length === 2 && debt.dueDate.includes('-')) {
                dDate = new Date(`${today.getFullYear()}-${parts[1]}-${parts[0]}`);
            }

            const diffDays = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= 7) {
                activeAlerts.push({
                    id: `debt-${debt.id}`,
                    type: diffDays <= 3 ? 'danger' : 'warning',
                    icon: AlertCircle,
                    message: `Pago próximo: ${debt.name} (${debt.minPayment?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })})`,
                    subMessage: diffDays === 0 ? 'Vence hoy' : `Vence en ${diffDays} días`
                });
            }
        });

        // 2. Budgets > 90%
        budgets.forEach(budget => {
            const spent = transactions
                .filter(t => t.category === budget.category && t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            if (percentage >= 90) {
                activeAlerts.push({
                    id: `budget-${budget.id}`,
                    type: percentage >= 100 ? 'danger' : 'warning',
                    icon: ShieldAlert,
                    message: `Presupuesto al límite: ${budget.category}`,
                    subMessage: `${Math.round(percentage)}% consumido`
                });
            }
        });

        // 3. AI Meal Optimization (Expiring Food)
        const expiringItems = pantryItems.filter(item => {
            if (!item.expiryDate) return false;
            const expiry = new Date(item.expiryDate);
            const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 3;
        });

        if (expiringItems.length > 0) {
            activeAlerts.push({
                id: 'ai-optimization',
                type: 'ai',
                icon: Sparkles,
                message: `🥬 ${expiringItems.length} ingredientes caducan en menos de 3 días — ¿Optimizar menú?`,
                subMessage: 'Evita el desperdicio y ahorra automáticamente.',
                actionLabel: 'Ver',
                onClick: () => {
                    setActiveApp('life');
                    setLifeActiveTab('kitchen-dashboard');
                }
            });
        }

        return activeAlerts.filter(a => !dismissedAlerts.includes(a.id));
    }, [debts, budgets, transactions, pantryItems, dismissedAlerts, setActiveApp, setLifeActiveTab]);

    const handleDismiss = (id: string) => {
        setDismissedAlerts(prev => {
            const next = [...prev, id];
            localStorage.setItem('aliseus_dismissed_alerts', JSON.stringify(next));
            return next;
        });
    };

    if (alerts.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-3">
            <AnimatePresence>
                {alerts.map((alert) => {
                    const Icon = alert.icon;
                    const isDanger = alert.type === 'danger';
                    const isAI = alert.type === 'ai';

                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0 }}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border relative overflow-hidden group",
                                isDanger
                                    ? "bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-900 dark:text-red-100"
                                    : isAI
                                        ? "bg-cyan-50/50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-900 dark:text-cyan-100"
                                        : "bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-100"
                            )}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    isDanger ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                                        : isAI ? "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{alert.message}</span>
                                    {alert.subMessage && (
                                        <span className={cn(
                                            "text-xs font-medium",
                                            isDanger ? "text-red-600/80 dark:text-red-400/80"
                                                : isAI ? "text-cyan-600/80 dark:text-cyan-400/80"
                                                    : "text-amber-600/80 dark:text-amber-400/80"
                                        )}>
                                            {alert.subMessage}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {alert.actionLabel && alert.onClick && (
                                <button
                                    onClick={alert.onClick}
                                    className={cn(
                                        "ml-auto mr-3 px-4 py-1.5 text-xs font-bold rounded-lg transition-transform hover:scale-105 shadow-sm",
                                        isAI ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    )}
                                >
                                    {alert.actionLabel}
                                </button>
                            )}

                            <button
                                onClick={() => handleDismiss(alert.id)}
                                className={cn(
                                    "p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
                                    isDanger ? "text-red-600 dark:text-red-400"
                                        : isAI ? "text-cyan-600 dark:text-cyan-400"
                                            : "text-amber-600 dark:text-amber-400"
                                )}
                                aria-label="Dismiss alert"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
