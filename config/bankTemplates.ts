/**
 * Pre-configured CSV templates for popular Spanish banks
 */

export interface BankTemplate {
    id: string;
    name: string;
    logo?: string;
    delimiter: string;
    dateFormat: string;
    encoding?: string;
    columns: {
        date: string;
        amount: string;
        description: string;
        category?: string;
        type?: string;
    };
    amountNegativeIsExpense?: boolean; // If true, negative amounts are expenses
}

export const BANK_TEMPLATES: { [key: string]: BankTemplate } = {
    BBVA: {
        id: 'BBVA',
        name: 'BBVA',
        delimiter: ';',
        dateFormat: 'DD/MM/YYYY',
        columns: {
            date: 'Fecha',
            amount: 'Importe',
            description: 'Concepto',
        },
        amountNegativeIsExpense: true,
    },
    SANTANDER: {
        id: 'SANTANDER',
        name: 'Santander',
        delimiter: ';',
        dateFormat: 'DD/MM/YYYY',
        columns: {
            date: 'Fecha Operación',
            amount: 'Importe EUR',
            description: 'Concepto',
        },
        amountNegativeIsExpense: true,
    },
    CAIXABANK: {
        id: 'CAIXABANK',
        name: 'CaixaBank',
        delimiter: ';',
        dateFormat: 'DD/MM/YYYY',
        columns: {
            date: 'Fecha operación',
            amount: 'Importe',
            description: 'Descripción',
        },
        amountNegativeIsExpense: true,
    },
    ING: {
        id: 'ING',
        name: 'ING',
        delimiter: ';',
        dateFormat: 'DD/MM/YYYY',
        columns: {
            date: 'Fecha',
            amount: 'Cantidad',
            description: 'Descripción',
        },
        amountNegativeIsExpense: true,
    },
    N26: {
        id: 'N26',
        name: 'N26',
        delimiter: ',',
        dateFormat: 'YYYY-MM-DD',
        columns: {
            date: 'Date',
            amount: 'Amount (EUR)',
            description: 'Payee',
        },
        amountNegativeIsExpense: true,
    },
    REVOLUT: {
        id: 'REVOLUT',
        name: 'Revolut',
        delimiter: ',',
        dateFormat: 'YYYY-MM-DD',
        columns: {
            date: 'Started Date',
            amount: 'Amount',
            description: 'Description',
            type: 'Type',
        },
        amountNegativeIsExpense: false, // Revolut uses Type column
    },
    BANKINTER: {
        id: 'BANKINTER',
        name: 'Bankinter',
        delimiter: ';',
        dateFormat: 'DD/MM/YYYY',
        columns: {
            date: 'Fecha',
            amount: 'Importe',
            description: 'Concepto',
        },
        amountNegativeIsExpense: true,
    },
    SABADELL: {
        id: 'SABADELL',
        name: 'Banco Sabadell',
        delimiter: ';',
        dateFormat: 'DD/MM/YYYY',
        columns: {
            date: 'Fecha',
            amount: 'Importe',
            description: 'Concepto',
        },
        amountNegativeIsExpense: true,
    },
};

export const getBankTemplate = (bankId: string): BankTemplate | null => {
    return BANK_TEMPLATES[bankId] || null;
};

export const getAllBankTemplates = (): BankTemplate[] => {
    return Object.values(BANK_TEMPLATES);
};
