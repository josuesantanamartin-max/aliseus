// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Aliseus â€” Notification Types
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type NotificationType = 'warning' | 'danger' | 'success' | 'info';
export type NotificationModule = 'finance' | 'life' | 'system';
export type NotificationCategory =
    | 'budget'
    | 'goal'
    | 'debt'
    | 'pantry'
    | 'trip'
    | 'shopping'
    | 'system';

export interface AliseusNotification {
    /** Deterministic ID based on rule + entity, prevents duplicates */
    id: string;
    type: NotificationType;
    module: NotificationModule;
    category: NotificationCategory;
    title: string;
    message: string;
    /** Label for the CTA button shown on the notification card */
    actionLabel?: string;
    /** Where to navigate when the user clicks the action button */
    actionTarget?: { app: string; tab?: string };
    /** Functional action type if any */
    actionType?: 'CONFIRM_TRANSACTION' | 'NAVIGATE';
    /** Arbitrary metadata for the action, e.g. transaction template */
    metadata?: any;
    read: boolean;
    createdAt: string; // ISO string
    dismissedAt?: string;
}
