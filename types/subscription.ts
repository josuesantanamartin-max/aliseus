/**
 * Subscription Types and Configuration
 * Defines subscription tiers, limits, and features
 */

export type SubscriptionTier = 'FREE' | 'PERSONAL' | 'FAMILIA';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIAL' | 'NONE';

export interface SubscriptionLimits {
    maxTransactions: number | null; // null = unlimited
    maxBudgets: number | null;
    maxAccounts: number | null;
    maxRecipes: number | null;
    maxFamilyMembers: number;
    maxAIGenerations: number | null; // per month
    maxBackups: number;
    maxDashboardLayouts: number;
    canExportData: boolean;
    canUseAI: boolean;
    canCollaborate: boolean;
    canCustomizeDashboard: boolean;
    prioritySupport: boolean;
    offlineMode: boolean;
}

export interface SubscriptionFeature {
    id: string;
    name: {
        ES: string;
        EN: string;
        FR: string;
    };
    description: {
        ES: string;
        EN: string;
        FR: string;
    };
    included: boolean;
    limit?: string; // e.g., "10/mes", "Ilimitado"
}

export interface SubscriptionPlan {
    tier: SubscriptionTier;
    name: {
        ES: string;
        EN: string;
        FR: string;
    };
    description: {
        ES: string;
        EN: string;
        FR: string;
    };
    price: {
        monthly: number; // in EUR
        annual: number;  // in EUR
    };
    stripePriceIds: {
        monthly: string;
        annual: string;
    };
    limits: SubscriptionLimits;
    features: SubscriptionFeature[];
    popular?: boolean;
}

export interface UserSubscription {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: string; // ISO date
    cancelAtPeriodEnd?: boolean;
    trialEnd?: string; // ISO date
    usage: {
        transactions: number;
        budgets: number;
        accounts: number;
        recipes: number;
        aiGenerations: number; // this month
        backups: number;
        familyMembers: number;
    };
}

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
    FREE: {
        tier: 'FREE',
        name: {
            ES: 'Aliseus Básico',
            EN: 'Aliseus Basic',
            FR: 'Aliseus Basique'
        },
        description: {
            ES: 'Perfecto para empezar a organizar tus finanzas',
            EN: 'Perfect to start organizing your finances',
            FR: 'Parfait pour commencer Ã  organiser vos finances'
        },
        price: {
            monthly: 0,
            annual: 0
        },
        stripePriceIds: {
            monthly: '',
            annual: ''
        },
        limits: {
            maxTransactions: 500,
            maxBudgets: 5,
            maxAccounts: 3,
            maxRecipes: 50,
            maxFamilyMembers: 1,
            maxAIGenerations: 10, // per month
            maxBackups: 3,
            maxDashboardLayouts: 2,
            canExportData: true,
            canUseAI: true,
            canCollaborate: false,
            canCustomizeDashboard: true,
            prioritySupport: false,
            offlineMode: false
        },
        features: [
            {
                id: 'transactions',
                name: { ES: 'Transacciones', EN: 'Transactions', FR: 'Transactions' },
                description: { ES: 'Hasta 500 transacciones', EN: 'Up to 500 transactions', FR: 'Jusqu\'Ã  500 transactions' },
                included: true,
                limit: '500'
            },
            {
                id: 'budgets',
                name: { ES: 'Presupuestos', EN: 'Budgets', FR: 'Budgets' },
                description: { ES: 'Hasta 5 presupuestos', EN: 'Up to 5 budgets', FR: 'Jusqu\'Ã  5 budgets' },
                included: true,
                limit: '5'
            },
            {
                id: 'accounts',
                name: { ES: 'Cuentas bancarias', EN: 'Bank accounts', FR: 'Comptes bancaires' },
                description: { ES: 'Hasta 3 cuentas', EN: 'Up to 3 accounts', FR: 'Jusqu\'Ã  3 comptes' },
                included: true,
                limit: '3'
            },
            {
                id: 'recipes',
                name: { ES: 'Recetas', EN: 'Recipes', FR: 'Recettes' },
                description: { ES: 'Hasta 50 recetas', EN: 'Up to 50 recipes', FR: 'Jusqu\'Ã  50 recettes' },
                included: true,
                limit: '50'
            },
            {
                id: 'ai',
                name: { ES: 'IA Generativa', EN: 'Generative AI', FR: 'IA Générative' },
                description: { ES: '10 generaciones/mes', EN: '10 generations/month', FR: '10 générations/mois' },
                included: true,
                limit: '10/mes'
            },
            {
                id: 'collaboration',
                name: { ES: 'Colaboración familiar', EN: 'Family collaboration', FR: 'Collaboration familiale' },
                description: { ES: 'No disponible', EN: 'Not available', FR: 'Non disponible' },
                included: false
            },
            {
                id: 'support',
                name: { ES: 'Soporte', EN: 'Support', FR: 'Support' },
                description: { ES: 'Soporte estándar', EN: 'Standard support', FR: 'Support standard' },
                included: true
            }
        ]
    },
    PERSONAL: {
        tier: 'PERSONAL',
        name: {
            ES: 'Aliseus Personal',
            EN: 'Aliseus Personal',
            FR: 'Aliseus Personnel'
        },
        description: {
            ES: 'Todo el poder de Aliseus para un solo usuario',
            EN: 'All the power of Aliseus for a single user',
            FR: 'Toute la puissance d\'Aliseus pour un seul utilisateur'
        },
        price: {
            monthly: 2.99,
            annual: 19.99 // ~45% discount vs monthly
        },
        stripePriceIds: {
            monthly: 'price_1T1atB3IoYNgqHKq1XoqDxcT',
            annual: 'price_1T1atC3IoYNgqHKqQzV4QbRI'
        },
        limits: {
            maxTransactions: null, // unlimited
            maxBudgets: null,
            maxAccounts: null,
            maxRecipes: null,
            maxFamilyMembers: 1,
            maxAIGenerations: null, // unlimited
            maxBackups: 10,
            maxDashboardLayouts: 5,
            canExportData: true,
            canUseAI: true,
            canCollaborate: false,
            canCustomizeDashboard: true,
            prioritySupport: false,
            offlineMode: true
        },
        features: [
            {
                id: 'unlimited',
                name: { ES: 'Todo ilimitado', EN: 'Everything unlimited', FR: 'Tout illimité' },
                description: { ES: 'Transacciones, presupuestos, cuentas y recetas sin límite', EN: 'Unlimited transactions, budgets, accounts and recipes', FR: 'Transactions, budgets, comptes et recettes illimités' },
                included: true,
                limit: 'âˆž'
            },
            {
                id: 'ai_unlimited',
                name: { ES: 'IA ilimitada', EN: 'Unlimited AI', FR: 'IA illimitée' },
                description: { ES: 'Generaciones ilimitadas con IA', EN: 'Unlimited AI generations', FR: 'Générations IA illimitées' },
                included: true,
                limit: 'âˆž'
            },
            {
                id: 'offline',
                name: { ES: 'Modo offline', EN: 'Offline mode', FR: 'Mode hors ligne' },
                description: { ES: 'Funciona sin conexión', EN: 'Works without connection', FR: 'Fonctionne sans connexion' },
                included: true
            },
            {
                id: 'dashboard',
                name: { ES: 'Dashboard personalizable', EN: 'Customizable dashboard', FR: 'Dashboard personnalisable' },
                description: { ES: 'Hasta 5 layouts', EN: 'Up to 5 layouts', FR: 'Jusqu\'Ã  5 layouts' },
                included: true,
                limit: '5'
            },
            {
                id: 'backups',
                name: { ES: 'Backups', EN: 'Backups', FR: 'Sauvegardes' },
                description: { ES: 'Hasta 10 backups', EN: 'Up to 10 backups', FR: 'Jusqu\'Ã  10 sauvegardes' },
                included: true,
                limit: '10'
            },
            {
                id: 'support',
                name: { ES: 'Soporte estándar', EN: 'Standard support', FR: 'Support standard' },
                description: { ES: 'Soporte por email', EN: 'Email support', FR: 'Support par email' },
                included: true
            }
        ],
        popular: true
    },
    FAMILIA: {
        tier: 'FAMILIA',
        name: {
            ES: 'Aliseus Familia',
            EN: 'Aliseus Family',
            FR: 'Aliseus Famille'
        },
        description: {
            ES: 'Para familias que quieren gestionar juntos',
            EN: 'For families who want to manage together',
            FR: 'Pour les familles qui veulent gérer ensemble'
        },
        price: {
            monthly: 3.99,
            annual: 24.99 // ~48% discount vs monthly
        },
        stripePriceIds: {
            monthly: 'price_1T1atC3IoYNgqHKqk5IFpCDe',
            annual: 'price_1T1atD3IoYNgqHKq5Rqk8byX'
        },
        limits: {
            maxTransactions: null, // unlimited
            maxBudgets: null,
            maxAccounts: null,
            maxRecipes: null,
            maxFamilyMembers: 5,
            maxAIGenerations: null, // unlimited
            maxBackups: 20,
            maxDashboardLayouts: 10,
            canExportData: true,
            canUseAI: true,
            canCollaborate: true,
            canCustomizeDashboard: true,
            prioritySupport: true,
            offlineMode: true
        },
        features: [
            {
                id: 'unlimited',
                name: { ES: 'Todo ilimitado', EN: 'Everything unlimited', FR: 'Tout illimité' },
                description: { ES: 'Transacciones, presupuestos, cuentas y recetas sin límite', EN: 'Unlimited transactions, budgets, accounts and recipes', FR: 'Transactions, budgets, comptes et recettes illimités' },
                included: true,
                limit: 'âˆž'
            },
            {
                id: 'family',
                name: { ES: 'Hasta 5 miembros', EN: 'Up to 5 members', FR: 'Jusqu\'Ã  5 membres' },
                description: { ES: 'Gestión familiar completa', EN: 'Complete family management', FR: 'Gestion familiale complÃ¨te' },
                included: true,
                limit: '5'
            },
            {
                id: 'ai_unlimited',
                name: { ES: 'IA ilimitada', EN: 'Unlimited AI', FR: 'IA illimitée' },
                description: { ES: 'Generaciones ilimitadas con IA', EN: 'Unlimited AI generations', FR: 'Générations IA illimitées' },
                included: true,
                limit: 'âˆž'
            },
            {
                id: 'collaboration',
                name: { ES: 'Espacios compartidos', EN: 'Shared spaces', FR: 'Espaces partagés' },
                description: { ES: 'Colaboración en tiempo real', EN: 'Real-time collaboration', FR: 'Collaboration en temps réel' },
                included: true
            },
            {
                id: 'junior',
                name: { ES: 'Aliseus Junior', EN: 'Aliseus Junior', FR: 'Aliseus Junior' },
                description: { ES: 'Modo para niños', EN: 'Kids mode', FR: 'Mode enfants' },
                included: true
            },
            {
                id: 'priority',
                name: { ES: 'Soporte prioritario', EN: 'Priority support', FR: 'Support prioritaire' },
                description: { ES: 'Respuesta en 12 horas', EN: '12-hour response', FR: 'Réponse en 12 heures' },
                included: true
            },
            {
                id: 'offline',
                name: { ES: 'Modo offline', EN: 'Offline mode', FR: 'Mode hors ligne' },
                description: { ES: 'Funciona sin conexión', EN: 'Works without connection', FR: 'Fonctionne sans connexion' },
                included: true
            },
            {
                id: 'backups',
                name: { ES: 'Backups avanzados', EN: 'Advanced backups', FR: 'Sauvegardes avancées' },
                description: { ES: 'Hasta 20 backups', EN: 'Up to 20 backups', FR: 'Jusqu\'Ã  20 sauvegardes' },
                included: true,
                limit: '20'
            }
        ],
        popular: true
    }
};

/**
 * Check if user has reached a limit
 */
export const hasReachedLimit = (
    subscription: UserSubscription,
    limitType: keyof UserSubscription['usage']
): boolean => {
    const plan = SUBSCRIPTION_PLANS[subscription.tier];
    const limit = plan.limits[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}` as keyof SubscriptionLimits];

    if (limit === null) return false; // unlimited
    if (typeof limit === 'number') {
        return subscription.usage[limitType] >= limit;
    }
    return false;
};

/**
 * Get remaining usage for a limit
 */
export const getRemainingUsage = (
    subscription: UserSubscription,
    limitType: keyof UserSubscription['usage']
): number | null => {
    const plan = SUBSCRIPTION_PLANS[subscription.tier];
    const limitKey = `max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}` as keyof SubscriptionLimits;
    const limit = plan.limits[limitKey];

    if (limit === null) return null; // unlimited
    if (typeof limit === 'number') {
        return Math.max(0, limit - subscription.usage[limitType]);
    }
    return null;
};

/**
 * Check if user can use a feature
 */
export const canUseFeature = (
    subscription: UserSubscription,
    feature: keyof SubscriptionLimits
): boolean => {
    const plan = SUBSCRIPTION_PLANS[subscription.tier];
    const featureValue = plan.limits[feature];

    if (typeof featureValue === 'boolean') {
        return featureValue;
    }
    return true; // if it's a number, check with hasReachedLimit instead
};

/**
 * Get upgrade benefits
 */
export const getUpgradeBenefits = (currentTier: SubscriptionTier): string[] => {
    if (currentTier === 'FAMILIA') return [];

    if (currentTier === 'PERSONAL') return [
        'Hasta 5 miembros de familia',
        'Espacios compartidos y colaboración',
        'Modo Aliseus Junior para niños',
        'Soporte prioritario (12h)',
        'Hasta 20 backups',
        '10 layouts de dashboard'
    ];

    return [
        'Transacciones, presupuestos y cuentas ilimitadas',
        'IA ilimitada para recetas y categorización',
        'Dashboard personalizable',
        'Modo offline',
        'Hasta 10 backups'
    ];
};
