export interface HouseholdPermissions {
    canEditBudgets: boolean;
    canAddTransactions: boolean;
    canManageMembers: boolean;
    canInviteUsers: boolean;
    canEditSettings: boolean;
}

export interface PermissionMatrix {
    roles: {
        ADMIN: HouseholdPermissions;
        MEMBER: HouseholdPermissions;
        VIEWER: HouseholdPermissions;
    };
}

export interface HouseholdMember {
    userId: string;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    joinedAt: string;
    // Specific overrides or granular permissions
    canViewAccounts: string[]; // List of Account IDs this user can view
    canEditBudgets: boolean;
    canAddTransactions: boolean;
}

export interface Household {
    id: string;
    name: string;
    ownerId: string; // The creator/owner
    currency: 'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR';
    members: HouseholdMember[];
    sharedAccounts: string[]; // List of Account IDs shared in this household
    permissions: PermissionMatrix;
    createdAt: string;
    updatedAt: string;
}
