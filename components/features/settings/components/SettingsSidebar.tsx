import React from 'react';
import { motion } from 'framer-motion';
import {
    User, Globe, Layers, Zap, Star, CreditCard, Shield, Lock,
    ChevronRight, Sparkles, Layout
} from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';


interface SettingsSidebarProps {
    activeSection: string;
    onSelectSection: (section: string) => void;
    language: string;
}

const MENU_ITEMS = [
    { id: 'profile', icon: User, labelES: 'Mi Perfil y Familia', labelEN: 'My Profile & Family' },
    { id: 'general', icon: Globe, labelES: 'Preferencias', labelEN: 'Preferences' },
    { id: 'personalization', icon: Layout, labelES: 'Personalización', labelEN: 'Personalization' },
    { id: 'categories', icon: Layers, labelES: 'Categorías', labelEN: 'Categories' },
    { id: 'automation', icon: Zap, labelES: 'Automatización', labelEN: 'Automation' },
    { id: 'subscription', icon: Star, labelES: 'Suscripción', labelEN: 'Subscription' },
    { id: 'billing', icon: CreditCard, labelES: 'Facturación', labelEN: 'Billing' },
    { id: 'security', icon: Lock, labelES: 'Seguridad', labelEN: 'Security' },
    { id: 'privacy', icon: Shield, labelES: 'Privacidad', labelEN: 'Privacy' },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
    activeSection,
    onSelectSection,
    language
}) => {
    const { userProfile } = useUserStore();

    return (
        <div className="w-full md:w-80 h-full bg-white dark:bg-onyx-950 border-r border-gray-100 dark:border-onyx-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">

            {/* Hero Identity Card */}
            <div className="p-6">
                <div className="bg-gradient-to-br from-indigo-950 to-onyx-950 rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-indigo-900/20 group cursor-pointer border border-indigo-900/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg">
                                <div className="w-full h-full bg-onyx-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-white">
                                            {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-onyx-950 rounded-full flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="font-black text-white text-lg tracking-tight leading-none mb-1">
                                {userProfile?.full_name || 'Usuario'}
                            </h3>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">
                                    Aliseus Basic
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 space-y-1 pb-6">
                {MENU_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    const label = language === 'ES' ? item.labelES : item.labelEN;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelectSection(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${isActive
                                ? 'bg-gray-900 dark:bg-white shadow-md'
                                : 'hover:bg-gray-50 dark:hover:bg-onyx-900 border border-transparent'
                                }`}
                        >
                            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${isActive
                                ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black'
                                : 'bg-gray-100 dark:bg-onyx-800 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30'
                                }`}>
                                <item.icon className="w-4 h-4" />
                            </div>

                            <span className={`relative z-10 flex-1 text-left text-sm font-bold tracking-tight transition-colors ${isActive
                                ? 'text-white dark:text-black'
                                : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                }`}>
                                {label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute inset-0 bg-gray-900 dark:bg-white"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

        </div>
    );
};
