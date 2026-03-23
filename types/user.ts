export type UserPersona = 'STUDENT' | 'FREELANCER' | 'PROFESSIONAL' | 'COUPLE' | 'FAMILY' | 'ENTREPRENEUR' | 'RETIREE';

export interface GrowthRecord {
    date: string;
    height: number;
    weight: number;
}

export interface FamilyMember {
    id: string;
    name: string;
    relationship: string; // 'Mother', 'Father', 'Son', 'Daughter', etc.
    role: 'PARENT' | 'CHILD' | 'MEMBER';
    avatar: string;
    balance: number;
    weeklyAllowance: number;
    birthDate?: string;
    email?: string;
    phone?: string;
    isEmergencyContact?: boolean;
    growthHistory: GrowthRecord[];
    tags?: string[];
    activeAlerts?: number;
    healthStatus?: 'NORMAL' | 'SPECIAL_FOLLOWUP' | 'PENDING_REVIEW';
}
