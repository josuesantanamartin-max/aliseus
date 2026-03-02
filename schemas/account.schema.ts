import { z } from 'zod';

/**
 * Account validation schema
 */
export const accountSchema = z
    .object({
        id: z.string().optional(),
        name: z
            .string()
            .min(1, 'Account name cannot be empty')
            .max(100, 'Account name must be less than 100 characters'),
        bankName: z.string().max(100, 'Bank name must be less than 100 characters').optional(),
        type: z.enum(['BANK', 'INVESTMENT', 'CASH', 'CREDIT', 'DEBIT', 'WALLET', 'ASSET']),
        balance: z
            .number()
            .finite('Balance must be a valid number'),
        currency: z.enum(['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR']),
        isRemunerated: z.boolean().optional(),
        tae: z
            .number()
            .min(0, 'TAE must be positive')
            .max(100, 'TAE must be less than 100%')
            .optional(),
        creditLimit: z
            .number()
            .positive('Credit limit must be positive')
            .optional(),
        cutoffDay: z
            .number()
            .int('Cutoff day must be an integer')
            .min(1, 'Cutoff day must be between 1 and 31')
            .max(31, 'Cutoff day must be between 1 and 31')
            .optional(),
        paymentDay: z
            .number()
            .int('Payment day must be an integer')
            .min(1, 'Payment day must be between 1 and 31')
            .max(31, 'Payment day must be between 1 and 31')
            .optional(),
        linkedAccountId: z.string().optional(),
        cadastralReference: z.string().optional(),
    })
    .refine(
        (data) => {
            // If type is CREDIT, creditLimit should be provided
            if (data.type === 'CREDIT' && !data.creditLimit) {
                return false;
            }
            return true;
        },
        {
            message: 'Credit limit is required for credit card accounts',
            path: ['creditLimit'],
        }
    )
    .refine(
        (data) => {
            // If type is CREDIT, cutoffDay and paymentDay should be provided
            if (data.type === 'CREDIT' && (!data.cutoffDay || !data.paymentDay)) {
                return false;
            }
            return true;
        },
        {
            message: 'Cutoff day and payment day are required for credit card accounts',
            path: ['cutoffDay'],
        }
    );

/**
 * Validate account data
 */
export function validateAccount(data: unknown) {
    return accountSchema.safeParse(data);
}

/**
 * Type inference from schema
 */
export type AccountInput = z.infer<typeof accountSchema>;
