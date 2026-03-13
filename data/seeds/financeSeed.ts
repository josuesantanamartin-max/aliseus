import { Account, Budget, CategoryStructure, Debt, Goal, Transaction, DashboardWidget } from '../../types';
import { INITIAL_CATEGORIES } from '../../constants';

// --- DATA GENERATOR UTILS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const generateTransactions = () => {
    const transactions: Transaction[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2); // 2 years of history
    const endDate = new Date();

    // Ingresos mensuales totales equilibrados: ~3.250â‚¬
    const salaryAmount = 2950;
    const extraIncomeAmount = 300;

    // Gastos Fijos equilibrados: ~1.500â‚¬
    const mortgageAmount = 850;
    const savingTransfer = 400;

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay(); // 0 Sun, 6 Sat
        const dayNum = currentDate.getDate();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        const isLastMonth = year === endDate.getFullYear() && month === endDate.getMonth();

        // 1. INGRESOS
        if (dayNum === 1) {
            transactions.push({
                id: generateId(), type: 'INCOME', amount: salaryAmount, date: dateStr,
                category: 'Trabajo', subCategory: 'Salario', accountId: '1',
                description: 'Nómina Aliseus Corp', isRecurring: true
            });
        }
        if (dayNum === 15) {
            transactions.push({
                id: generateId(), type: 'INCOME', amount: extraIncomeAmount, date: dateStr,
                category: 'Negocios', subCategory: 'Consultoría', accountId: '1',
                description: 'Servicios Profesionales Extra', isRecurring: true
            });
        }

        // 2. TRASPASOS (Ahorro e Hipoteca)
        if (dayNum === 2) {
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: savingTransfer, date: dateStr,
                category: 'Transferencia', subCategory: 'Ahorro', accountId: '1',
                description: 'Ahorro Automático', isRecurring: true
            });
            transactions.push({
                id: generateId(), type: 'INCOME', amount: savingTransfer, date: dateStr,
                category: 'Transferencia', subCategory: 'Desde otra cuenta', accountId: '6',
                description: 'Ahorro recibido', isRecurring: true
            });
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: mortgageAmount, date: dateStr,
                category: 'Transferencia', subCategory: 'Entre Cuentas', accountId: '1',
                description: 'Fondo para Hipoteca', isRecurring: true
            });
            transactions.push({
                id: generateId(), type: 'INCOME', amount: mortgageAmount, date: dateStr,
                category: 'Transferencia', subCategory: 'Desde otra cuenta', accountId: '5',
                description: 'Fondo Hipoteca Recibido', isRecurring: true
            });
        }

        // 3. GASTOS FIJOS
        if (dayNum === 5) {
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: mortgageAmount, date: dateStr,
                category: 'Vivienda', subCategory: 'Hipoteca', accountId: '5',
                description: 'Pago Hipoteca', isRecurring: true
            });
        }
        if (dayNum === 7) {
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: 120 + (Math.random() * 20), date: dateStr,
                category: 'Servicios', subCategory: 'Luz', accountId: '1',
                description: 'Factura Luz', isRecurring: true
            });
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: 45, date: dateStr,
                category: 'Servicios', subCategory: 'Internet', accountId: '1',
                description: 'Fibra', isRecurring: true
            });
        }

        // 4. GASTOS VARIABLES (CALIBRADOS)
        if (dayOfWeek === 5) { // Supermercado semanal: ~450â‚¬ mes
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: 90 + (Math.random() * 30), date: dateStr,
                category: 'Alimentación', subCategory: 'Supermercado', accountId: '1',
                description: 'Compra Semanal'
            });
        }
        if (dayOfWeek === 6 && Math.random() > 0.4) { // Ocio: ~250â‚¬ mes
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: 40 + (Math.random() * 40), date: dateStr,
                category: 'Alimentación', subCategory: 'Restaurantes', accountId: '4', // Visa Oro
                description: 'Cena fuera'
            });
        }
        if (dayNum === 3 || dayNum === 18) { // Gasolina: ~140â‚¬ mes
            transactions.push({
                id: generateId(), type: 'EXPENSE', amount: 65 + (Math.random() * 10), date: dateStr,
                category: 'Transporte', subCategory: 'Gasolina', accountId: '4', // Visa Oro
                description: 'Combustible'
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generatedTransactions = generateTransactions();

// Additional specific transactions for the very last days to ensure "recent" view is populated
const recentTransactions: Transaction[] = [
    { id: generateId(), type: 'INCOME', amount: 15.50, date: new Date().toISOString().split('T')[0], category: 'Otros', subCategory: 'Varios', accountId: '1', description: 'Venta Wallapop' },
    { id: generateId(), type: 'EXPENSE', amount: 3.50, date: new Date().toISOString().split('T')[0], category: 'Alimentación', subCategory: 'Cafeterías', accountId: '3', description: 'Café de hoy' },
];

export const DEFAULT_FINANCE_WIDGETS: DashboardWidget[] = [
    { id: 'HEALTH_SCORE', visible: true, order: 1 },
    { id: 'KPI_CARDS', visible: true, order: 2 },
    { id: 'BUDGET_GOALS_SUMMARY', visible: true, order: 3 },
    { id: 'CHART_EVOLUTION', visible: true, order: 4 },
    { id: 'CHART_FLOW', visible: true, order: 5 },
    { id: 'TOP_EXPENSES', visible: true, order: 6 },
    { id: 'RECENT_LIST', visible: true, order: 7 },
];

export const EXPENSE_CATEGORIES: CategoryStructure[] = INITIAL_CATEGORIES.filter(c => c.type === 'EXPENSE');
export const INCOME_CATEGORIES: CategoryStructure[] = INITIAL_CATEGORIES.filter(c => c.type === 'INCOME');

export const MOCK_ACCOUNTS: Account[] = [
    { id: '1', name: 'Cuenta Nómina', bankName: 'Banco Santander', type: 'BANK', balance: 32450.80, currency: 'EUR', isRemunerated: false },
    { id: '5', name: 'Cuenta Hipoteca', bankName: 'Banco Santander', type: 'BANK', balance: 2450.00, currency: 'EUR', isRemunerated: false },
    { id: '2', name: 'Cartera Indexada', bankName: 'MyInvestor', type: 'INVESTMENT', balance: 18500.00, currency: 'EUR', isRemunerated: true, tae: 3.75 },
    { id: '6', name: 'Ahorro al 4%', bankName: 'Trade Republic', type: 'BANK', balance: 5200.00, currency: 'EUR', isRemunerated: true, tae: 4.0 },
    { id: '3', name: 'Efectivo', type: 'CASH', balance: 120.00, currency: 'EUR' },
    { id: '4', name: 'Visa Oro', bankName: 'Banco Santander', type: 'CREDIT', balance: -454.30, currency: 'EUR', creditLimit: 3000, cutoffDay: 20, paymentDay: 5, linkedAccountId: '1' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [...recentTransactions, ...generatedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const MOCK_BUDGETS: Budget[] = [];

export const MOCK_GOALS: Goal[] = [
    { id: '1', name: 'Entrada Piso', targetAmount: 40000, currentAmount: 18500, deadline: '2026-12-31', accountId: '2' },
    { id: '2', name: 'Viaje Japón 2026', targetAmount: 5000, currentAmount: 2200, deadline: '2026-08-01', accountId: '6', linkedTripId: 'trip-1' },
];

export const MOCK_DEBTS: Debt[] = [
    {
        id: '1', name: 'Hipoteca Casa', type: 'MORTGAGE', originalAmount: 250000, remainingBalance: 185400,
        interestRate: 3.5, minPayment: 850, dueDate: '5', accountId: '5', payments: [], startDate: '2020-01-01', endDate: '2045-01-01'
    }
];
