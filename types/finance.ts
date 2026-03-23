export type TransactionType = 'INCOME' | 'EXPENSE';
export type QuickActionType = 'ADD_EXPENSE' | 'ADD_INCOME' | 'ADD_TRANSFER' | 'ADD_INGREDIENT' | 'ADD_SHOPPING_ITEM' | 'SCAN_RECEIPT' | 'ADD_TASK';

export interface QuickAction {
    type: QuickActionType;
    timestamp: number;
}

export interface CategoryStructure {
    id: string;
    name: string;
    subCategories: string[];
    color?: string;
    icon?: string;
    type: 'INCOME' | 'EXPENSE';
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    date: string;
    category: string;
    subCategory?: string;
    projectId?: string;
    accountId: string;
    description: string;
    isRecurring?: boolean;
    frequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
    notes?: string;
}

export interface CadastralData {
    referencia: string;
    superficie?: number;
    añoConstruccion?: number;
    uso?: string;
    localizacion?: {
        bloque?: string;
        escalera?: string;
        planta?: string;
        puerta?: string;
    };
    lastUpdated?: string;
}

export interface Account {
    id: string;
    name: string;
    bankName?: string;
    type: 'BANK' | 'SAVINGS' | 'INVESTMENT' | 'CASH' | 'CREDIT' | 'DEBIT' | 'WALLET' | 'ASSET';
    balance: number;
    currency: 'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR';
    color?: string;
    description?: string;
    iban?: string;
    /** For CREDIT / DEBIT cards */
    cardNetwork?: 'VISA' | 'MASTERCARD' | 'AMEX' | 'OTHER';
    isRemunerated?: boolean;
    tae?: number;
    creditLimit?: number;
    cutoffDay?: number;
    paymentDay?: number;
    /** Only for CREDIT cards: how the monthly balance is settled */
    paymentMode?: 'END_OF_MONTH' | 'REVOLVING';
    /** For CREDIT: accrued charges in the current billing cycle (positive number) */
    statementBalance?: number;
    linkedAccountId?: string;
    cadastralReference?: string;
    cadastralData?: CadastralData;
}

export interface Budget {
    id: string;
    category: string;
    subCategory?: string;
    limit: number;
    period: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
    budgetType: 'FIXED' | 'PERCENTAGE';
    percentage?: number;
    startDate?: string;
    endDate?: string;
}

export interface ProjectBudget {
    id: string;
    parentId?: string; // If set, this is a sub-project
    name: string;
    description?: string;
    limit: number;
    spent: number;
    startDate: string;
    endDate?: string;
    status: 'ACTIVE' | 'COMPLETED';
    color?: string;
    icon?: string;
    
    // New fields for Family Brain integration
    projectType?: 'REFORMA' | 'VIAJE' | 'EVENTO_FAMILIAR' | 'OTROS';
    keyDate?: string; // Target date (event day, delivery, etc)
    primaryResponsibleId?: string; // Reference to FamilyMember id
    
    // Specific for EVENTO_FAMILIAR
    location?: string;
    estimatedGuests?: string;
    importance?: 'BAJA' | 'MEDIA' | 'ALTA';
}

export interface ProjectItem {
    id: string;
    projectId: string; // References ProjectBudget.id
    name: string;
    budgetedAmount: number;
    actualAmount: number;
    notes?: string;
    status: 'PENDING' | 'DONE';
}

export interface DebtPayment {
    id: string;
    date: string;
    amount: number;
}

export interface Debt {
    id: string;
    name: string;
    type: 'MORTGAGE' | 'LOAN' | 'CREDIT_CARD';
    originalAmount: number;
    remainingBalance: number;
    interestRate: number;
    minPayment: number;
    dueDate: string; // Day of month for payment
    startDate?: string; // Loan start date
    endDate?: string;   // Loan maturity date
    accountId?: string;
    payments: DebtPayment[];
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    accountId?: string;
    linkedTripId?: string;
}
