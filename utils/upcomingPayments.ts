import { Transaction, Debt, Account } from '../types';

export interface UpcomingPayment {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    category: string;
    source: 'RECURRING' | 'DEBT' | 'CREDIT_CARD';
    isPaid: boolean;
    accountId?: string;
    daysUntilDue: number;
    isOverdue: boolean;
}

/**
 * Obtiene los próximos pagos basados en transacciones recurrentes y deudas
 */
export function getUpcomingPayments(
    transactions: Transaction[],
    debts: Debt[],
    accounts: Account[],
    daysAhead: number = 30
): UpcomingPayment[] {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysAhead);

    const upcomingPayments: UpcomingPayment[] = [];

    // 1. TRANSACCIONES RECURRENTES
    const recurringTransactions = (transactions || []).filter(t =>
        t.isRecurring && t.type === 'EXPENSE'
    );

    recurringTransactions.forEach(transaction => {
        const nextDueDate = calculateNextDueDate(transaction, today);

        if (nextDueDate && nextDueDate <= futureDate) {
            const daysUntil = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            upcomingPayments.push({
                id: `recurring_${transaction.id}`,
                name: transaction.description || transaction.category,
                amount: transaction.amount,
                dueDate: nextDueDate.toISOString().split('T')[0],
                category: transaction.category,
                source: 'RECURRING',
                isPaid: false,
                accountId: transaction.accountId,
                daysUntilDue: daysUntil,
                isOverdue: daysUntil < 0
            });
        }
    });

    // 2. PAGOS MÍNIMOS DE DEUDAS
    (debts || []).forEach(debt => {
        const dayOfMonth = parseInt(debt.dueDate);
        const nextDueDate = getNextPaymentDate(dayOfMonth, today);

        if (nextDueDate && nextDueDate <= futureDate) {
            const daysUntil = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            upcomingPayments.push({
                id: `debt_${debt.id}`,
                name: `Pago ${debt.name}`,
                amount: debt.minPayment,
                dueDate: nextDueDate.toISOString().split('T')[0],
                category: 'Deudas',
                source: 'DEBT',
                isPaid: false,
                accountId: debt.accountId,
                daysUntilDue: daysUntil,
                isOverdue: daysUntil < 0
            });
        }
    });

    // 3. TARJETAS DE CRÉDITO (fecha de pago)
    const creditCards = (accounts || []).filter(a => a.type === 'CREDIT' && a.paymentDay);

    creditCards.forEach(card => {
        if (card.paymentDay) {
            const nextPaymentDate = getNextPaymentDate(card.paymentDay, today);

            if (nextPaymentDate && nextPaymentDate <= futureDate) {
                const daysUntil = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                // Calcular saldo pendiente (simplificado)
                const pendingBalance = Math.abs(card.balance);

                if (pendingBalance > 0) {
                    upcomingPayments.push({
                        id: `credit_${card.id}`,
                        name: `Pago ${card.name}`,
                        amount: pendingBalance,
                        dueDate: nextPaymentDate.toISOString().split('T')[0],
                        category: 'Tarjeta de Crédito',
                        source: 'CREDIT_CARD',
                        isPaid: false,
                        accountId: card.linkedAccountId,
                        daysUntilDue: daysUntil,
                        isOverdue: daysUntil < 0
                    });
                }
            }
        }
    });

    // Ordenar por fecha de vencimiento
    return upcomingPayments.sort((a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
}

/**
 * Calcula la próxima fecha de vencimiento para una transacción recurrente
 */
function calculateNextDueDate(transaction: Transaction, fromDate: Date): Date | null {
    if (!transaction.frequency) return null;

    const lastDate = new Date(transaction.date);
    const result = new Date(lastDate);

    switch (transaction.frequency) {
        case 'WEEKLY':
            while (result <= fromDate) {
                result.setDate(result.getDate() + 7);
            }
            break;
        case 'BIWEEKLY':
            while (result <= fromDate) {
                result.setDate(result.getDate() + 14);
            }
            break;
        case 'MONTHLY':
            while (result <= fromDate) {
                result.setMonth(result.getMonth() + 1);
            }
            break;
        case 'YEARLY':
            while (result <= fromDate) {
                result.setFullYear(result.getFullYear() + 1);
            }
            break;
    }

    return result;
}

/**
 * Obtiene la próxima fecha de pago basada en el día del mes
 */
function getNextPaymentDate(dayOfMonth: number, fromDate: Date): Date {
    const result = new Date(fromDate);
    result.setDate(dayOfMonth);

    // Si ya pasó este mes, ir al siguiente
    if (result <= fromDate) {
        result.setMonth(result.getMonth() + 1);
    }

    // Ajustar si el día no existe en el mes (ej: 31 en febrero)
    if (result.getDate() !== dayOfMonth) {
        result.setDate(0); // Último día del mes anterior
    }

    return result;
}

/**
 * Calcula el total de pagos próximos
 */
export function getTotalUpcomingPayments(payments: UpcomingPayment[]): number {
    return payments.reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Obtiene pagos urgentes (próximos 3 días)
 */
export function getUrgentPayments(payments: UpcomingPayment[]): UpcomingPayment[] {
    return payments.filter(p => p.daysUntilDue <= 3 && p.daysUntilDue >= 0);
}

/**
 * Obtiene pagos vencidos
 */
export function getOverduePayments(payments: UpcomingPayment[]): UpcomingPayment[] {
    return payments.filter(p => p.isOverdue);
}
