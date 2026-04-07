import { Transaction } from '../types';
import { MERCHANT_MAPPINGS } from '../config/merchantMappings';

/**
 * Detect the delimiter used in a CSV file
 */
export const detectDelimiter = (csvText: string): string => {
    const firstLine = csvText.split('\n')[0];
    const delimiters = [',', ';', '\t', '|'];

    let maxCount = 0;
    let detectedDelimiter = ',';

    delimiters.forEach(delimiter => {
        const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
        if (count > maxCount) {
            maxCount = count;
            detectedDelimiter = delimiter;
        }
    });

    return detectedDelimiter;
};

/**
 * Find the most likely header row in a 2D array of data
 */
export const findHeaderRow = (data: any[][]): number => {
    const FINANCIAL_KEYWORDS = [
        'fecha', 'date', 'time', 'operación', 'operacion', 'anotación', 'anotacion',
        'importe', 'amount', 'cantidad', 'monto', 'valor', 'cargos', 'abonos', 'cargo/abono',
        'cargo', 'abono', 'saldo', 'balance', 'disponible', 'movimiento', 'mov.', 'detalle',
        'concepto', 'descripción', 'descripcion', 'memo', 'detail', 'payee', 'referencia',
        'beneficiario', 'pagador', 'sucursal', 'referencia univoca', 'referencia unívoca'
    ];

    let bestRow = 0;
    let maxMatches = 0;

    // Scan the first 20 rows
    const scanLimit = Math.min(data.length, 20);

    for (let i = 0; i < scanLimit; i++) {
        const row = data[i];
        if (!Array.isArray(row)) continue;

        let matches = 0;
        row.forEach(cell => {
            if (!cell) return;
            const str = String(cell).toLowerCase();
            if (FINANCIAL_KEYWORDS.some(kw => str.includes(kw))) {
                matches++;
            }
        });

        // We need at least 2 matches to consider it a header row
        if (matches >= 2 && matches > maxMatches) {
            maxMatches = matches;
            bestRow = i;
        }
    }

    return bestRow;
};

/**
 * Parse date from various formats to YYYY-MM-DD
 */
export const parseDate = (dateStr: string, format?: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    // Clean the date string
    const cleaned = dateStr.trim();

    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
        return cleaned;
    }

    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const ddmmyyyyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        // Assume DD/MM/YYYY for European format
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // YYYY/MM/DD or YYYY.MM.DD
    const yyyymmddMatch = cleaned.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (yyyymmddMatch) {
        const [, year, month, day] = yyyymmddMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try to parse as Date object (handles many formats)
    try {
        const date = new Date(cleaned);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        // Fall through to default
    }

    // Default to today if parsing fails
    return new Date().toISOString().split('T')[0];
};

/**
 * Detect date format from sample dates
 */
export const detectDateFormat = (dates: string[]): string => {
    if (dates.length === 0) return 'YYYY-MM-DD';

    const sample = dates.filter(d => d && d.trim()).slice(0, 10);

    // Check for YYYY-MM-DD
    if (sample.every(d => /^\d{4}-\d{2}-\d{2}$/.test(d))) {
        return 'YYYY-MM-DD';
    }

    // Check for DD/MM/YYYY
    if (sample.every(d => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d))) {
        return 'DD/MM/YYYY';
    }

    // Check for MM/DD/YYYY
    if (sample.every(d => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d))) {
        // Ambiguous - could be DD/MM or MM/DD
        // Default to DD/MM for European context
        return 'DD/MM/YYYY';
    }

    return 'YYYY-MM-DD';
};

/**
 * Clean and normalize description text
 */
export const cleanDescription = (description: string | undefined | null): string => {
    if (!description) return 'Sin descripción';

    // Convert to string and trim
    let cleaned = String(description).trim();

    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove common problematic characters but keep useful ones
    // Keep: letters, numbers, spaces, basic punctuation (.,;:()/-€$)
    cleaned = cleaned.replace(/[^\w\s.,;:()\/-€$áéíóúñÁÉÍÓÚÑüÜ]/gi, '');

    // If after cleaning it's empty, return default
    if (!cleaned || cleaned.trim() === '') {
        return 'Sin descripción';
    }

    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    return cleaned;
};

/**
 * Normalize amount string to number
 */
export const normalizeAmount = (amountStr: string): number => {
    if (!amountStr) return 0;

    // Remove currency symbols, spaces, and thousand separators (carefully)
    // Common formats: 1.234,56 (EU) or 1,234.56 (US)
    let cleaned = amountStr.toString().replace(/[€$£\s]/g, '');

    // If it has multiple dots/commas, it definitely has thousand separators
    const dots = (cleaned.match(/\./g) || []).length;
    const commas = (cleaned.match(/,/g) || []).length;

    if (commas > 0 && dots > 0) {
        // Both exist: find which one is the decimal separator (the last one)
        if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
            // EU Style: 1.234,56 -> 1234.56
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            // US Style: 1,234.56 -> 1234.56
            cleaned = cleaned.replace(/,/g, '');
        }
    } else if (commas > 1) {
        // Multiple commas: 1,234,567 -> 1234567
        cleaned = cleaned.replace(/,/g, '');
    } else if (dots > 1) {
        // Multiple dots: 1.234.567 -> 1234567
        cleaned = cleaned.replace(/\./g, '');
    } else if (commas === 1) {
        // Single comma: 1234,56 or 1,234
        // If it's at the end (2 digits), it's probably decimal
        if (/, \d{2}$|,\d{2}$/.test(cleaned.trim())) {
            cleaned = cleaned.replace(',', '.');
        } else if (cleaned.length >= 4 && cleaned.indexOf(',') === cleaned.length - 4) {
            // Thousands: 1,234
            cleaned = cleaned.replace(',', '');
        } else {
            // Unclear, assume decimal for EU preference context
            cleaned = cleaned.replace(',', '.');
        }
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Detect duplicates in transactions
 */
export const detectDuplicates = (
    newTransactions: Partial<Transaction>[],
    existingTransactions: Transaction[]
): { index: number; matches: Transaction[] }[] => {
    const duplicates: { index: number; matches: Transaction[] }[] = [];

    newTransactions.forEach((newTx, index) => {
        const matches = existingTransactions.filter(existingTx => {
            // Match by date, amount, and description
            const sameDate = existingTx.date === newTx.date;
            const sameAmount = Math.abs(existingTx.amount - (newTx.amount || 0)) < 0.01;
            const sameDescription = existingTx.description?.toLowerCase().trim() ===
                newTx.description?.toLowerCase().trim();

            return sameDate && sameAmount && sameDescription;
        });

        if (matches.length > 0) {
            duplicates.push({ index, matches });
        }
    });

    return duplicates;
};

/**
 * Validate transaction data
 */
export interface ValidationError {
    row: number;
    field: string;
    message: string;
    value: any;
}

export const validateTransactions = (
    transactions: Partial<Transaction>[]
): ValidationError[] => {
    const errors: ValidationError[] = [];

    transactions.forEach((tx, index) => {
        const row = index + 1;

        // Validate date
        if (!tx.date || tx.date === 'Invalid Date') {
            errors.push({
                row,
                field: 'date',
                message: 'Fecha inválida o faltante',
                value: tx.date
            });
        }

        // Validate amount
        if (tx.amount === undefined || tx.amount === null || isNaN(tx.amount)) {
            errors.push({
                row,
                field: 'amount',
                message: 'Cantidad inválida o faltante',
                value: tx.amount
            });
        }

        // Validate description
        if (!tx.description || tx.description.trim() === '' || tx.description === 'Sin descripción') {
            errors.push({
                row,
                field: 'description',
                message: 'Descripción faltante o genérica',
                value: tx.description
            });
        }
    });

    return errors;
};

/**
 * Get statistics from transactions
 */
export interface TransactionStats {
    total: number;
    income: number;
    expense: number;
    totalIncome: number;
    totalExpense: number;
    dateRange: { from: string; to: string };
    categories: { [key: string]: number };
}

export const getTransactionStats = (
    transactions: Partial<Transaction>[]
): TransactionStats => {
    const stats: TransactionStats = {
        total: transactions.length,
        income: 0,
        expense: 0,
        totalIncome: 0,
        totalExpense: 0,
        dateRange: { from: '', to: '' },
        categories: {}
    };

    if (transactions.length === 0) return stats;

    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    stats.dateRange.from = dates[0] || '';
    stats.dateRange.to = dates[dates.length - 1] || '';

    transactions.forEach(tx => {
        if (tx.type === 'INCOME') {
            stats.income++;
            stats.totalIncome += tx.amount || 0;
        } else {
            stats.expense++;
            stats.totalExpense += tx.amount || 0;
        }

        if (tx.category) {
            stats.categories[tx.category] = (stats.categories[tx.category] || 0) + 1;
        }
    });

    return stats;
};

/**
 * Normalize text for robust search matching (removes accents, special chars, extra spaces)
 */
export const normalizeTextForSearch = (text: string): string => {
    return text.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-zA-Z0-9\s]/g, " ") // Replace special chars with space
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' '); // Compress multiple spaces
};

/**
 * Detect category and subcategory from description using merchant mappings
 */
export const detectCategoryFromDescription = (
    description: string
): { category: string; subCategory?: string } | null => {
    if (!description) return null;

    const normalizedDesc = normalizeTextForSearch(description);

    for (const mapping of MERCHANT_MAPPINGS) {
        if (mapping.keywords.some(keyword => {
            const normalizedKeyword = normalizeTextForSearch(keyword);

            // For short keywords (like 'DIA', 'BP', 'KFC'), we use word boundaries 
            // to avoid false positives (e.g., 'DIARIO' containing 'DIA').
            if (normalizedKeyword.length <= 4) {
                const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
                return regex.test(normalizedDesc);
            }

            return normalizedDesc.includes(normalizedKeyword);
        })) {
            return {
                category: mapping.category,
                subCategory: mapping.subCategory
            };
        }
    }

    return null;
};

/**
 * Map category from CSV to existing categories
 */
export const mapCategory = (
    categoryStr: string | undefined | null,
    availableCategories: { id: string; name: string; subCategories: string[] }[],
    description?: string // Added description parameter
): { category: string; subCategory?: string } => {
    // 1. Try to detect by merchant description first (most accurate for bank CSVs)
    if (description) {
        const detected = detectCategoryFromDescription(description);
        if (detected) return detected;
    }

    if (!categoryStr) return { category: 'Otros' };

    const cleaned = categoryStr.trim().toLowerCase();

    // 2. Try exact match
    for (const cat of availableCategories) {
        if (cat.name.toLowerCase() === cleaned) {
            return { category: cat.name };
        }

        // Check subcategories
        for (const subCat of cat.subCategories) {
            if (subCat.toLowerCase() === cleaned) {
                return { category: cat.name, subCategory: subCat };
            }
        }
    }

    // 3. Try partial match
    for (const cat of availableCategories) {
        if (cleaned.includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(cleaned)) {
            return { category: cat.name };
        }
    }

    return { category: 'Otros' };
};

/**
 * Detect subcategory from description
 */
export const detectSubCategory = (
    description: string,
    category: string,
    categories: { id: string; name: string; subCategories: string[] }[]
): string | undefined => {
    if (!description) return undefined;

    const cleaned = description.toLowerCase();
    const categoryObj = categories.find(c => c.name === category);

    if (!categoryObj) return undefined;

    // Check if any subcategory keyword appears in description
    for (const subCat of categoryObj.subCategories) {
        const subCatLower = subCat.toLowerCase();
        if (cleaned.includes(subCatLower)) {
            return subCat;
        }
    }

    return undefined;
};

/**
 * Calculate balance impact from transactions
 */
export const calculateBalanceImpact = (
    transactions: Partial<Transaction>[],
    currentBalance: number
): { impact: number; finalBalance: number; incomeTotal: number; expenseTotal: number } => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach(tx => {
        if (tx.type === 'INCOME') {
            incomeTotal += tx.amount || 0;
        } else {
            expenseTotal += tx.amount || 0;
        }
    });

    const impact = incomeTotal - expenseTotal;
    const finalBalance = currentBalance + impact;

    return {
        impact,
        finalBalance,
        incomeTotal,
        expenseTotal
    };
};
