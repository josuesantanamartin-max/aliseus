import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../../store/useNotificationStore';

interface NotificationBadgeProps {
    onClick: () => void;
    isActive?: boolean;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick, isActive }) => {
    const unreadCount = useNotificationStore((s) => s.unreadCount());
    const hasDanger = useNotificationStore((s) =>
        s.notifications.some((n) => !n.read && !n.dismissedAt && n.type === 'danger')
    );

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                    ? 'text-aliseus-950 dark:text-white font-bold bg-aliseus-50 dark:bg-aliseus-900 border border-aliseus-100 dark:border-aliseus-800 shadow-sm'
                    : 'text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-900 dark:hover:text-aliseus-200 hover:bg-aliseus-50/50 dark:hover:bg-aliseus-900/50'
                }`}
            aria-label="Notification Center"
        >
            <div className="relative">
                <Bell
                    className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-indigo-primary scale-110' : 'text-aliseus-400 group-hover:text-aliseus-600 group-hover:scale-110'
                        } ${unreadCount > 0 ? 'animate-[wiggle_1s_ease-in-out]' : ''}`}
                />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none ${hasDanger ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'
                                }`}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <span className="text-[13px] tracking-tight">Notificaciones</span>
        </motion.button>
    );
};

export default NotificationBadge;
