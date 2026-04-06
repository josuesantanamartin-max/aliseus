import React from 'react';
import { motion } from 'framer-motion';
import {
    User, Globe, Layers, Zap, Star, CreditCard, Shield, Lock,
    ChevronRight, Sparkles, Layout, Users, Ticket
} from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';


interface SettingsSidebarProps {
    activeSection: string;
    onSelectSection: (section: string) => void;
    language: string;
    isAdmin?: boolean;
}

const MENU_ITEMS = [
    { id: 'profile', icon: User, labelES: 'Mi Perfil', labelEN: 'My Profile' },
    { id: 'plan_billing', icon: Star, labelES: 'Suscripción y Pagos', labelEN: 'Subscription & Billing' },
    { id: 'family', icon: Users, labelES: 'Hogar / Familia', labelEN: 'Household / Family' },
    { id: 'general', icon: Globe, labelES: 'Preferencias', labelEN: 'Preferences' },
    { id: 'personalization', icon: Layout, labelES: 'Personalización', labelEN: 'Personalization' },
    { id: 'categories', icon: Layers, labelES: 'Categorías', labelEN: 'Categories' },
    { id: 'automation', icon: Zap, labelES: 'Automatización', labelEN: 'Automation' },
    { id: 'security', icon: Lock, labelES: 'Seguridad', labelEN: 'Security' },
    { id: 'privacy', icon: Shield, labelES: 'Privacidad', labelEN: 'Privacy' },
    { id: 'invitations', icon: Ticket, labelES: 'Invitaciones', labelEN: 'Invitations' },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
    activeSection,
    onSelectSection,
    language,
    isAdmin = false
}) => {
    const { userProfile, subscription } = useUserStore();
    const visibleItems = isAdmin ? MENU_ITEMS : MENU_ITEMS.filter(item => item.id !== 'invitations');

    return (
        <div className="w-full md:w-[340px] h-full bg-white/40 dark:bg-aliseus-950/70 backdrop-blur-2xl border-r border-slate-200/50 dark:border-aliseus-800/80 flex flex-col shrink-0 overflow-y-auto no-scrollbar relative">
            {/* Identity Section */}
            <div className="p-8 pb-6">
                <div className="bg-gradient-to-br from-white via-slate-50 to-white dark:from-[#0c0c1e] dark:via-[#1a1a3a] dark:to-aliseus-950 rounded-[32px] p-6 relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/40 group cursor-pointer border border-white dark:border-white/5 ring-1 ring-slate-200/50 dark:ring-indigo-500/20">
                    {/* Animated Background Orbs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-[30px] translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-500 p-[1.5px] shadow-lg ring-2 ring-white dark:ring-black/50">
                                <div className="w-full h-full bg-slate-50 dark:bg-aliseus-950 rounded-[19px] flex items-center justify-center overflow-hidden">
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                                            {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 border-[3px] border-white dark:border-aliseus-950 rounded-[8px] flex items-center justify-center shadow-lg">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-1.5 truncate">
                                {userProfile?.full_name || 'Usuario Aliseus'}
                            </h3>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm">
                                <Star className={`w-3 h-3 ${subscription.plan === 'FAMILIA' ? 'text-amber-500' : 'text-blue-500'} fill-current`} />
                                <span className="text-[8px] font-black text-slate-600 dark:text-white uppercase tracking-widest">
                                    {subscription.plan === 'FAMILIA' ? 'Aura Diamond' : subscription.plan === 'PERSONAL' ? 'Aura Pro' : 'Free Account'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-5 space-y-1.5 pb-10">
                {visibleItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const label = language === 'ES' ? item.labelES : item.labelEN;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelectSection(item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[22px] transition-all duration-300 relative group overflow-hidden ${isActive
                                ? 'shadow-xl shadow-blue-500/10 dark:shadow-none bg-slate-900 dark:bg-white'
                                : 'hover:bg-white/80 dark:hover:bg-aliseus-900/50 border border-transparent hover:border-slate-100 dark:hover:border-aliseus-800'
                                }`}
                        >
                            <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-500 ${isActive
                                ? 'bg-white/10 dark:bg-black/5 text-white dark:text-black shadow-inner rotate-3'
                                : 'bg-slate-100 dark:bg-aliseus-800 text-slate-400 dark:text-aliseus-400 group-hover:scale-110 group-hover:shadow-md'
                                }`}>
                                <item.icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                            </div>

                            <span className={`relative z-10 flex-1 text-left text-[13px] font-black tracking-tight transition-all duration-300 uppercase ${isActive
                                ? 'text-white dark:text-black opacity-100'
                                : 'text-slate-500 dark:text-aliseus-400 group-hover:text-slate-900 dark:group-hover:text-white'
                                }`}>
                                {label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="settings-nav-active"
                                    className="absolute inset-x-0 bottom-0 top-0 bg-slate-900 dark:bg-white z-0"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                            
                            {!isActive && (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-aliseus-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};
