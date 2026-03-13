import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, BellOff, CheckCheck, AlertTriangle,
    TrendingUp, ShoppingCart, Plane, Package, Wallet, Target, CreditCard
} from 'lucide-react';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceControllers } from '../../../hooks/useFinanceControllers';
import { AliseusNotification, NotificationCategory, NotificationType } from '../../../types/notifications';
import { Language } from '../../../types/shared';

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TEXTS: Record<string, Record<Language, string>> = {
    title: { ES: 'Notificaciones', EN: 'Notifications', FR: 'Notifications' },
    empty: { ES: 'Todo en orden', EN: 'All clear', FR: 'Tout est bon' },
    emptyMsg: { ES: 'No tienes alertas pendientes', EN: 'No pending alerts', FR: 'Aucune alerte en attente' },
    markAll: { ES: 'Todo leído', EN: 'Mark all read', FR: 'Tout marquer lu' },
    dismiss: { ES: 'Descartar', EN: 'Dismiss', FR: 'Rejeter' },
    finance: { ES: 'Finanzas', EN: 'Finance', FR: 'Finances' },
    life: { ES: 'Vida', EN: 'Life', FR: 'Vie' },
    system: { ES: 'Sistema', EN: 'System', FR: 'SystÃ¨me' },
};

const tt = (lang: Language, key: string) => TEXTS[key]?.[lang] ?? TEXTS[key]?.['EN'] ?? key;

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const typeStyles: Record<NotificationType, { border: string; icon: string; bg: string }> = {
    danger: { border: 'border-l-red-500', icon: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
    warning: { border: 'border-l-amber-500', icon: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    success: { border: 'border-l-green-500', icon: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
    info: { border: 'border-l-indigo-500', icon: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
};

const CategoryIcon: React.FC<{ category: NotificationCategory; className?: string }> = ({ category, className }) => {
    const props = { className: className ?? 'w-4 h-4' };
    switch (category) {
        case 'budget': return <Wallet {...props} />;
        case 'goal': return <Target {...props} />;
        case 'debt': return <CreditCard {...props} />;
        case 'pantry': return <Package {...props} />;
        case 'shopping': return <ShoppingCart {...props} />;
        case 'trip': return <Plane {...props} />;
        default: return <AlertTriangle {...props} />;
    }
};

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
};

// â”€â”€â”€ Single notification row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NotificationItem: React.FC<{
    n: AliseusNotification;
    lang: Language;
    onDismiss: (id: string) => void;
    onAction: (n: AliseusNotification) => void;
}> = ({ n, lang, onDismiss, onAction }) => {
    const styles = typeStyles[n.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative flex flex-col gap-2 p-3 rounded-xl border-l-4 ${styles.border} ${styles.bg} ${!n.read ? 'ring-1 ring-inset ring-onyx-100 dark:ring-onyx-800' : 'opacity-70'}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CategoryIcon category={n.category} className={`w-3.5 h-3.5 flex-shrink-0 ${styles.icon}`} />
                    <p className="text-[12px] font-bold text-onyx-900 dark:text-white truncate">{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] text-onyx-400">{timeAgo(n.createdAt)}</span>
                    <button
                        onClick={() => onDismiss(n.id)}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-onyx-200 dark:hover:bg-onyx-700 transition-colors text-onyx-400 hover:text-onyx-700 dark:hover:text-white"
                        title={tt(lang, 'dismiss')}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <p className="text-[11px] text-onyx-500 dark:text-onyx-400 leading-relaxed">{n.message}</p>

            {/* Action button */}
            {n.actionLabel && (n.actionTarget || n.actionType) && (
                <button
                    onClick={() => onAction(n)}
                    className="self-start text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2 transition-colors"
                >
                    {n.actionLabel} â†’
                </button>
            )}
        </motion.div>
    );
};

// â”€â”€â”€ Main panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const { language, setActiveApp, setFinanceActiveTab, setLifeActiveTab } = useUserStore();
    const { addTransaction } = useFinanceControllers();
    const {
        activeNotifications,
        unreadCount,
        dismiss,
        markAllAsRead,
        markAsRead,
    } = useNotificationStore();

    const notifications = activeNotifications();

    const handleAction = useCallback(async (n: AliseusNotification) => {
        markAsRead(n.id);

        // Functional Actions
        if (n.actionType === 'CONFIRM_TRANSACTION' && n.metadata?.transaction) {
            await addTransaction(n.metadata.transaction);
            dismiss(n.id); // Also dismiss if confirmed
        }

        // Navigation Actions
        if (n.actionTarget) {
            setActiveApp(n.actionTarget.app);
            if (n.actionTarget.app === 'finance' && n.actionTarget.tab) setFinanceActiveTab(n.actionTarget.tab);
            if (n.actionTarget.app === 'life' && n.actionTarget.tab) setLifeActiveTab(n.actionTarget.tab);
        }
        onClose();
    }, [markAsRead, addTransaction, dismiss, setActiveApp, setFinanceActiveTab, setLifeActiveTab, onClose]);

    const handleDismiss = useCallback((id: string) => {
        dismiss(id);
    }, [dismiss]);

    // Group by module
    const financeNotes = notifications.filter((n) => n.module === 'finance');
    const lifeNotes = notifications.filter((n) => n.module === 'life');
    const systemNotes = notifications.filter((n) => n.module === 'system');

    const renderGroup = (label: string, items: AliseusNotification[]) => {
        if (items.length === 0) return null;
        return (
            <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-onyx-400 dark:text-onyx-600 px-1">{label}</p>
                {items.map((n) => (
                    <NotificationItem
                        key={n.id}
                        n={n}
                        lang={language}
                        onDismiss={handleDismiss}
                        onAction={handleAction}
                    />
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-72 h-full w-80 bg-white dark:bg-onyx-950 border-r border-onyx-100 dark:border-onyx-800 z-40 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-5 border-b border-onyx-100 dark:border-onyx-800 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-onyx-900 dark:text-white">{tt(language, 'title')}</span>
                                {unreadCount() > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                                        {unreadCount()}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount() > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        title={tt(language, 'markAll')}
                                        className="p-1.5 rounded-lg text-onyx-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-onyx-400 hover:text-onyx-700 hover:bg-onyx-100 dark:hover:bg-onyx-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {notifications.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center h-full gap-3 text-center py-16"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <BellOff className="w-6 h-6 text-green-500" />
                                    </div>
                                    <p className="text-sm font-bold text-onyx-800 dark:text-onyx-200">{tt(language, 'empty')}</p>
                                    <p className="text-[11px] text-onyx-400 max-w-[180px]">{tt(language, 'emptyMsg')}</p>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {renderGroup(tt(language, 'finance'), financeNotes)}
                                    {renderGroup(tt(language, 'life'), lifeNotes)}
                                    {renderGroup(tt(language, 'system'), systemNotes)}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer gradient fade */}
                        <div className="h-6 bg-gradient-to-t from-white dark:from-onyx-950 to-transparent flex-shrink-0 pointer-events-none -mt-6" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationCenter;
