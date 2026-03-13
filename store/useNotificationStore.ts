import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AliseusNotification } from '../types/notifications';

interface NotificationState {
    notifications: AliseusNotification[];
}

interface NotificationActions {
    /** Add a notification. Silently ignores duplicates (same id). */
    addNotification: (n: AliseusNotification) => void;
    /** Add many at once, ignoring duplicates. */
    addNotifications: (ns: AliseusNotification[]) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    clearDismissed: () => void;
}

interface NotificationComputed {
    unreadCount: () => number;
    activeNotifications: () => AliseusNotification[];
}

type NotificationStore = NotificationState & NotificationActions & NotificationComputed;

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],

            addNotification: (n) => {
                set((state) => {
                    const exists = state.notifications.some((x) => x.id === n.id);
                    if (exists) return state;
                    return { notifications: [n, ...state.notifications] };
                });
            },

            addNotifications: (ns) => {
                set((state) => {
                    const existingIds = new Set(state.notifications.map((x) => x.id));
                    const incoming = ns.filter((n) => !existingIds.has(n.id));
                    if (incoming.length === 0) return state;
                    return { notifications: [...incoming, ...state.notifications] };
                });
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                }));
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                }));
            },

            dismiss: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, dismissedAt: new Date().toISOString(), read: true } : n
                    ),
                }));
            },

            dismissAll: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({
                        ...n,
                        dismissedAt: n.dismissedAt ?? new Date().toISOString(),
                        read: true,
                    })),
                }));
            },

            clearDismissed: () => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => !n.dismissedAt),
                }));
            },

            // Computed helpers â€” called as functions because Zustand doesn't support getters natively
            unreadCount: () => get().notifications.filter((n) => !n.read && !n.dismissedAt).length,
            activeNotifications: () => get().notifications.filter((n) => !n.dismissedAt),
        }),
        {
            name: 'onyx_notifications',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
