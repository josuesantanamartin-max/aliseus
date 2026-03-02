import { z } from 'zod';

const householdPermissionsSchema = z.object({
    canEditBudgets: z.boolean(),
    canAddTransactions: z.boolean(),
    canManageMembers: z.boolean(),
    canInviteUsers: z.boolean(),
    canEditSettings: z.boolean(),
});

const permissionMatrixSchema = z.object({
    roles: z.object({
        ADMIN: householdPermissionsSchema,
        MEMBER: householdPermissionsSchema,
        VIEWER: householdPermissionsSchema,
    }),
});

export const householdMemberSchema = z.object({
    userId: z.string(),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
    canViewAccounts: z.array(z.string()),
    canEditBudgets: z.boolean(),
    canAddTransactions: z.boolean(),
});

export const householdSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Household name is required"),
    ownerId: z.string(),
    currency: z.enum(['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR']),
    members: z.array(householdMemberSchema).default([]),
    sharedAccounts: z.array(z.string()).default([]),
    permissions: permissionMatrixSchema,
});

export const createHouseholdSchema = householdSchema.pick({
    name: true,
    currency: true,
});

export function validateHousehold(data: unknown) {
    return householdSchema.safeParse(data);
}

export type HouseholdInput = z.infer<typeof householdSchema>;
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
