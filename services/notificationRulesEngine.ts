// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Aliseus â€” Notification Rules Engine
//  Pure function: takes app data â†’ returns notifications to add.
//  All IDs are deterministic so repeated evaluations don't create duplicates.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { AliseusNotification } from '../types/notifications';
import { Budget, Goal, Debt, Transaction } from '../types';
import { Ingredient, ShoppingItem, Trip } from '../types';
import { Language } from '../types/shared';

// â”€â”€â”€ i18n labels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const t = (lang: Language, key: string): string => {
    const strings: Record<string, Record<Language, string>> = {
        // Budget
        'budget.exceeded.title': { ES: 'âš ï¸ Presupuesto superado', EN: 'âš ï¸ Budget exceeded', FR: 'âš ï¸ Budget dépassé' },
        'budget.exceeded.msg': { ES: 'Has superado el límite de "{cat}": {spent} / {limit}', EN: 'You exceeded the "{cat}" budget: {spent} / {limit}', FR: 'Vous avez dépassé le budget "{cat}": {spent} / {limit}' },
        'budget.warning.title': { ES: 'ðŸ“Š Presupuesto al {pct}%', EN: 'ðŸ“Š Budget at {pct}%', FR: 'ðŸ“Š Budget Ã  {pct}%' },
        'budget.warning.msg': { ES: 'Llevas {spent} de {limit} en "{cat}"', EN: '{spent} of {limit} used in "{cat}"', FR: '{spent} sur {limit} utilisé dans "{cat}"' },
        'budget.action': { ES: 'Ver presupuestos', EN: 'View budgets', FR: 'Voir les budgets' },
        // Goal
        'goal.completed.title': { ES: 'ðŸŽ‰ ¡Meta alcanzada!', EN: 'ðŸŽ‰ Goal reached!', FR: 'ðŸŽ‰ Objectif atteint !' },
        'goal.completed.msg': { ES: 'Has completado la meta "{name}"', EN: 'You completed the goal "{name}"', FR: 'Vous avez atteint l\'objectif "{name}"' },
        'goal.deadline.title': { ES: 'â³ Meta próxima a vencer', EN: 'â³ Goal deadline approaching', FR: 'â³ Ã‰chéance d\'objectif proche' },
        'goal.deadline.msg': { ES: '"{name}" vence en {days} días y llevas {pct}%', EN: '"{name}" is due in {days} days and you\'re at {pct}%', FR: '"{name}" expire dans {days} jours et vous Ãªtes Ã  {pct}%' },
        'goal.action': { ES: 'Ver metas', EN: 'View goals', FR: 'Voir les objectifs' },
        // Debt
        'debt.due.title': { ES: 'ðŸ’³ Pago de deuda próximo', EN: 'ðŸ’³ Debt payment due', FR: 'ðŸ’³ Paiement de dette proche' },
        'debt.due.msg': { ES: 'Vence el pago mínimo de "{name}": {amount}', EN: 'Minimum payment due for "{name}": {amount}', FR: 'Paiement minimum dÃ» pour "{name}": {amount}' },
        'debt.action': { ES: 'Ver deudas', EN: 'View debts', FR: 'Voir les dettes' },
        // Pantry
        'pantry.empty.title': { ES: 'ðŸ›’ Sin stock en despensa', EN: 'ðŸ›’ Pantry item out of stock', FR: 'ðŸ›’ Article de garde-manger épuisé' },
        'pantry.empty.msg': { ES: 'Te has quedado sin "{name}"', EN: 'You\'re out of "{name}"', FR: 'Vous n\'avez plus de "{name}"' },
        'pantry.low.title': { ES: 'ðŸ“¦ Stock bajo en despensa', EN: 'ðŸ“¦ Low pantry stock', FR: 'ðŸ“¦ Stock faible en garde-manger' },
        'pantry.low.msg': { ES: 'Queda poco de "{name}": {qty} {unit}', EN: 'Low stock of "{name}": {qty} {unit}', FR: 'Stock faible de "{name}": {qty} {unit}' },
        'pantry.action': { ES: 'Ver despensa', EN: 'View pantry', FR: 'Voir le garde-manger' },
        // Shopping
        'shopping.pending.title': { ES: 'ðŸ›ï¸ Lista de compras pendiente', EN: 'ðŸ›ï¸ Shopping list pending', FR: 'ðŸ›ï¸ Liste de courses en attente' },
        'shopping.pending.msg': { ES: 'Tienes {count} artículo(s) por comprar', EN: 'You have {count} item(s) to buy', FR: 'Vous avez {count} article(s) Ã  acheter' },
        'shopping.action': { ES: 'Ver lista', EN: 'View list', FR: 'Voir la liste' },
        // Trip
        'trip.soon.title': { ES: 'âœˆï¸ Viaje próximo', EN: 'âœˆï¸ Upcoming trip', FR: 'âœˆï¸ Voyage imminent' },
        'trip.soon.msg': { ES: '"{name}" sale en {days} días', EN: '"{name}" departs in {days} days', FR: '"{name}" part dans {days} jours' },
        'trip.action': { ES: 'Ver viajes', EN: 'View trips', FR: 'Voir les voyages' },
        // Recurring
        'recurring.due.title': { ES: 'ðŸ”„ Confirmar pago recurrente', EN: 'ðŸ”„ Confirm recurring payment', FR: 'ðŸ”„ Confirmer le paiement récurrent' },
        'recurring.due.msg': { ES: 'Â¿Se ha cobrado "{name}"? ({amount})', EN: 'Has "{name}" been charged? ({amount})', FR: '"{name}" a-t-il été facturé ? ({amount})' },
        'recurring.action': { ES: 'Confirmar ahora', EN: 'Confirm now', FR: 'Confirmer maintenant' },
    };
    return strings[key]?.[lang] ?? strings[key]?.['EN'] ?? key;
};

const fmt = (amount: number, currency: string) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const replace = (str: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), str);

// â”€â”€â”€ Types accepted by the engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface FinanceSnapshot {
    budgets: Budget[];
    transactions: Transaction[];
    goals: Goal[];
    debts: Debt[];
    currency: string;
}

export interface LifeSnapshot {
    pantryItems: Ingredient[];
    shoppingList: ShoppingItem[];
    trips: Trip[];
}

// â”€â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const now = () => new Date();
const daysUntil = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = d.getTime() - now().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const spentByBudget = (budget: Budget, transactions: Transaction[], currency: string): number => {
    const currentMonth = now().getMonth();
    const currentYear = now().getFullYear();
    return transactions
        .filter((tx) => {
            const d = new Date(tx.date);
            if (budget.period === 'MONTHLY') {
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear
                    && tx.type === 'EXPENSE' && tx.category === budget.category;
            }
            if (budget.period === 'YEARLY') {
                return d.getFullYear() === currentYear
                    && tx.type === 'EXPENSE' && tx.category === budget.category;
            }
            // CUSTOM: between startDate and endDate
            if (budget.startDate && budget.endDate) {
                return d >= new Date(budget.startDate) && d <= new Date(budget.endDate)
                    && tx.type === 'EXPENSE' && tx.category === budget.category;
            }
            return false;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
};

// â”€â”€â”€ Main evaluator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function evaluateRules(
    finance: FinanceSnapshot,
    life: LifeSnapshot,
    lang: Language = 'ES'
): AliseusNotification[] {
    const results: AliseusNotification[] = [];
    const ts = new Date().toISOString();

    // â”€â”€ Finance: Budgets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const budget of finance.budgets) {
        const spent = spentByBudget(budget, finance.transactions, finance.currency);
        const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        if (pct >= 100) {
            results.push({
                id: `budget-exceeded-${budget.id}`,
                type: 'danger',
                module: 'finance',
                category: 'budget',
                title: t(lang, 'budget.exceeded.title'),
                message: replace(t(lang, 'budget.exceeded.msg'), {
                    cat: budget.category,
                    spent: fmt(spent, finance.currency),
                    limit: fmt(budget.limit, finance.currency),
                }),
                actionLabel: t(lang, 'budget.action'),
                actionTarget: { app: 'finance', tab: 'budgets' },
                read: false,
                createdAt: ts,
            });
        } else if (pct >= 80) {
            results.push({
                id: `budget-warning-${budget.id}-${Math.floor(pct / 5) * 5}`,
                type: 'warning',
                module: 'finance',
                category: 'budget',
                title: replace(t(lang, 'budget.warning.title'), { pct: Math.round(pct) }),
                message: replace(t(lang, 'budget.warning.msg'), {
                    cat: budget.category,
                    spent: fmt(spent, finance.currency),
                    limit: fmt(budget.limit, finance.currency),
                }),
                actionLabel: t(lang, 'budget.action'),
                actionTarget: { app: 'finance', tab: 'budgets' },
                read: false,
                createdAt: ts,
            });
        }
    }

    // â”€â”€ Finance: Goals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const goal of finance.goals) {
        const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

        if (pct >= 100) {
            results.push({
                id: `goal-completed-${goal.id}`,
                type: 'success',
                module: 'finance',
                category: 'goal',
                title: t(lang, 'goal.completed.title'),
                message: replace(t(lang, 'goal.completed.msg'), { name: goal.name }),
                actionLabel: t(lang, 'goal.action'),
                actionTarget: { app: 'finance', tab: 'goals' },
                read: false,
                createdAt: ts,
            });
        } else if (goal.deadline) {
            const days = daysUntil(goal.deadline);
            if (days >= 0 && days <= 30 && pct < 80) {
                results.push({
                    id: `goal-deadline-${goal.id}-${days}`,
                    type: 'warning',
                    module: 'finance',
                    category: 'goal',
                    title: t(lang, 'goal.deadline.title'),
                    message: replace(t(lang, 'goal.deadline.msg'), {
                        name: goal.name,
                        days,
                        pct: Math.round(pct),
                    }),
                    actionLabel: t(lang, 'goal.action'),
                    actionTarget: { app: 'finance', tab: 'goals' },
                    read: false,
                    createdAt: ts,
                });
            }
        }
    }

    // â”€â”€ Finance: Debts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const debt of finance.debts) {
        const dueDay = parseInt(debt.dueDate, 10);
        const today = now().getDate();
        // Trigger if payment day is today or tomorrow
        if (!isNaN(dueDay) && (dueDay === today || dueDay === today + 1)) {
            results.push({
                id: `debt-due-${debt.id}-${now().getFullYear()}-${now().getMonth()}`,
                type: 'danger',
                module: 'finance',
                category: 'debt',
                title: t(lang, 'debt.due.title'),
                message: replace(t(lang, 'debt.due.msg'), {
                    name: debt.name,
                    amount: fmt(debt.minPayment, finance.currency),
                }),
                actionLabel: t(lang, 'debt.action'),
                actionTarget: { app: 'finance', tab: 'debts' },
                read: false,
                createdAt: ts,
            });
        }
    }

    // â”€â”€ Life: Pantry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const item of life.pantryItems) {
        const qty = item.quantity ?? 0;
        const min = (item as any).minQuantity ?? 1;

        if (qty <= 0) {
            results.push({
                id: `pantry-empty-${item.id}`,
                type: 'warning',
                module: 'life',
                category: 'pantry',
                title: t(lang, 'pantry.empty.title'),
                message: replace(t(lang, 'pantry.empty.msg'), { name: item.name }),
                actionLabel: t(lang, 'pantry.action'),
                actionTarget: { app: 'life', tab: 'kitchen' },
                read: false,
                createdAt: ts,
            });
        } else if (qty <= min) {
            results.push({
                id: `pantry-low-${item.id}`,
                type: 'info',
                module: 'life',
                category: 'pantry',
                title: t(lang, 'pantry.low.title'),
                message: replace(t(lang, 'pantry.low.msg'), {
                    name: item.name,
                    qty,
                    unit: item.unit ?? '',
                }),
                actionLabel: t(lang, 'pantry.action'),
                actionTarget: { app: 'life', tab: 'kitchen' },
                read: false,
                createdAt: ts,
            });
        }
    }

    // â”€â”€ Life: Shopping list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const pendingItems = life.shoppingList.filter((i) => !(i as any).purchased);
    if (pendingItems.length > 0) {
        results.push({
            id: `shopping-pending-${pendingItems.length}`,
            type: 'info',
            module: 'life',
            category: 'shopping',
            title: t(lang, 'shopping.pending.title'),
            message: replace(t(lang, 'shopping.pending.msg'), { count: pendingItems.length }),
            actionLabel: t(lang, 'shopping.action'),
            actionTarget: { app: 'life', tab: 'kitchen-list' },
            read: false,
            createdAt: ts,
        });
    }

    // â”€â”€ Life: Trips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const trip of life.trips) {
        const departure = trip.startDate;
        if (!departure) continue;
        const days = daysUntil(departure);
        if (days >= 0 && days <= 7) {
            results.push({
                id: `trip-soon-${trip.id}-${days}`,
                type: 'info',
                module: 'life',
                category: 'trip',
                title: t(lang, 'trip.soon.title'),
                message: replace(t(lang, 'trip.soon.msg'), { name: trip.destination, days }),
                actionLabel: t(lang, 'trip.action'),
                actionTarget: { app: 'life', tab: 'travel' },
                read: false,
                createdAt: ts,
            });
        }
    }

    // â”€â”€ Finance: Recurring Payments Confirmation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const recurringTxs = finance.transactions.filter(t => t.isRecurring && t.type === 'EXPENSE');
    const today = now();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (const rt of recurringTxs) {
        // Find if this recurring transaction has already been paid THIS month
        const alreadyPaid = finance.transactions.some(t =>
            t.category === rt.category &&
            t.accountId === rt.accountId &&
            Math.abs(t.amount - rt.amount) < 0.01 &&
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear &&
            t.id !== rt.id // Don't count the original template if it's in the same month
        );

        if (!alreadyPaid) {
            // Check if it's due today or in the past (recent)
            const rtDate = new Date(rt.date);
            // We assume it's roughly the same day of the month
            const dueThisMonth = new Date(currentYear, currentMonth, rtDate.getDate());
            const daysDiff = Math.floor((today.getTime() - dueThisMonth.getTime()) / (1000 * 60 * 60 * 24));

            // Trigger if it's due today or was due in the last 7 days
            if (daysDiff >= 0 && daysDiff <= 7) {
                results.push({
                    id: `recurring-confirm-${rt.id}-${currentYear}-${currentMonth}`,
                    type: 'info',
                    module: 'finance',
                    category: 'budget',
                    title: t(lang, 'recurring.due.title'),
                    message: replace(t(lang, 'recurring.due.msg'), {
                        name: rt.description || rt.category,
                        amount: fmt(rt.amount, finance.currency),
                    }),
                    actionLabel: t(lang, 'recurring.action'),
                    actionType: 'CONFIRM_TRANSACTION',
                    metadata: {
                        templateId: rt.id,
                        transaction: {
                            type: 'EXPENSE',
                            amount: rt.amount,
                            category: rt.category,
                            subCategory: rt.subCategory,
                            accountId: rt.accountId,
                            description: rt.description,
                            date: dueThisMonth.toISOString().split('T')[0],
                            isRecurring: false, // The new one is not a template itself
                        }
                    },
                    read: false,
                    createdAt: ts,
                });
            }
        }
    }

    return results;
}
