import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, Users, Globe, Layers, Zap, Star, CreditCard, Shield, Lock, Layout, Ticket } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
import { SettingsSidebar } from './components/SettingsSidebar';
import { ProfilePanel } from './panels/ProfilePanel';
import { FamilyPanel } from './panels/FamilyPanel';
import { PreferencesPanel } from './panels/PreferencesPanel';
import { PersonalizationPanel } from './panels/PersonalizationPanel';
import { CategoriesPanel } from './panels/CategoriesPanel';
import { AutomationPanel } from './panels/AutomationPanel';
import { SubscriptionPanel } from './panels/SubscriptionPanel';
import { BillingPanel } from './panels/BillingPanel';
import { SecurityPanel } from './panels/SecurityPanel';
import { PrivacyPanel } from './panels/PrivacyPanel';
import InvitationManager from './InvitationManager';

// Placeholder panels to be replaced incrementally
const PanelPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full flex items-center justify-center p-8"
    >
        <div className="text-center p-12 bg-white dark:bg-onyx-900 rounded-[3rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/50 dark:shadow-none w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">{title}</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading premium panel...</p>
        </div>
    </motion.div>
);

const MOBILE_MENU_ITEMS = [
    { id: 'profile', icon: User, labelES: 'Perfil', labelEN: 'Profile' },
    { id: 'family', icon: Users, labelES: 'Familia', labelEN: 'Family' },
    { id: 'general', icon: Globe, labelES: 'General', labelEN: 'General' },
    { id: 'personalization', icon: Layout, labelES: 'Diseño', labelEN: 'Layout' },
    { id: 'categories', icon: Layers, labelES: 'Categorías', labelEN: 'Categories' },
    { id: 'automation', icon: Zap, labelES: 'Reglas', labelEN: 'Rules' },
    { id: 'subscription', icon: Star, labelES: 'Plan', labelEN: 'Plan' },
    { id: 'billing', icon: CreditCard, labelES: 'Pagos', labelEN: 'Billing' },
    { id: 'security', icon: Lock, labelES: 'Seguridad', labelEN: 'Security' },
    { id: 'privacy', icon: Shield, labelES: 'Privacidad', labelEN: 'Privacy' },
    { id: 'invitations', icon: Ticket, labelES: 'Invitaciones', labelEN: 'Invitations' },
];

export const SettingsPage: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const { language, userProfile } = useUserStore();

    const isAdmin = userProfile?.email && ADMIN_EMAILS.includes(userProfile.email.toLowerCase());
    const visibleMenuItems = isAdmin ? MOBILE_MENU_ITEMS : MOBILE_MENU_ITEMS.filter(item => item.id !== 'invitations');

    const activeItem = MOBILE_MENU_ITEMS.find(item => item.id === activeSection);
    const activeLabel = activeItem ? (language === 'ES' ? activeItem.labelES : activeItem.labelEN) : '';

    const renderContent = () => {
        switch (activeSection) {
            case 'profile': return <ProfilePanel key="profile" />;
            case 'family': return <FamilyPanel key="family" />;
            case 'general': return <PreferencesPanel key="general" />;
            case 'personalization': return <PersonalizationPanel key="personalization" />;
            case 'categories': return <CategoriesPanel key="categories" />;
            case 'automation': return <AutomationPanel key="automation" />;
            case 'subscription': return <SubscriptionPanel key="subscription" />;
            case 'billing': return <BillingPanel key="billing" />;
            case 'security': return <SecurityPanel key="security" />;
            case 'privacy': return <PrivacyPanel key="privacy" />;
            case 'invitations': return <InvitationManager key="invitations" />;
            default: return <PanelPlaceholder title={activeSection} key={activeSection} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-slate-50/50 dark:bg-onyx-950 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 dark:bg-indigo-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 dark:bg-cyan-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Mobile Header */}
            <header className="md:hidden bg-white/80 dark:bg-onyx-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-onyx-800 p-4 flex justify-between items-center z-30 sticky top-0 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Layout className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-base text-gray-900 dark:text-white tracking-tight leading-none mb-0.5">Ajustes</h2>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{activeLabel}</p>
                    </div>
                </div>
                <button onClick={onMenuClick} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all p-2.5 bg-gray-50/50 dark:bg-onyx-900/50 rounded-2xl border border-gray-100 dark:border-onyx-800 shadow-sm active:scale-90">
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block h-full shrink-0 z-20 relative">
                <SettingsSidebar
                    activeSection={activeSection}
                    onSelectSection={setActiveSection}
                    language={language}
                    isAdmin={!!isAdmin}
                />
            </aside>

            {/* Mobile Horizontal Scroll Menu */}
            <nav className="md:hidden flex overflow-x-auto px-4 py-3 bg-white/40 dark:bg-onyx-950/40 backdrop-blur-md border-b border-gray-100/50 dark:border-onyx-800/50 gap-2.5 shrink-0 no-scrollbar z-20 sticky top-[73px]">
                {visibleMenuItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const label = language === 'ES' ? item.labelES : item.labelEN;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-[14px] text-[10px] uppercase font-black tracking-[0.1em] transition-all duration-500 flex items-center gap-2 border ${isActive
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white shadow-xl shadow-gray-900/10 dark:shadow-white/5 scale-105'
                                : 'bg-white/50 dark:bg-onyx-900/50 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-onyx-800 hover:bg-white dark:hover:bg-onyx-800'
                                }`}
                        >
                            <item.icon className={`w-3.5 h-3.5 ${isActive ? 'scale-110' : ''}`} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto min-h-full p-5 md:p-12 lg:p-16">
                    <div className="mb-10 hidden md:block">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-3 block">Configuración de Sistema</span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter capitalize">
                            {activeLabel}
                        </h1>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
