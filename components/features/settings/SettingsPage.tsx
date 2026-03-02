import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, Globe, Layers, Zap, Star, CreditCard, Shield, Lock, Layout } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { SettingsSidebar } from './components/SettingsSidebar';
import { ProfilePanel } from './panels/ProfilePanel';
import { PreferencesPanel } from './panels/PreferencesPanel';
import { PersonalizationPanel } from './panels/PersonalizationPanel';
import { CategoriesPanel } from './panels/CategoriesPanel';
import { AutomationPanel } from './panels/AutomationPanel';
import { SubscriptionPanel } from './panels/SubscriptionPanel';
import { BillingPanel } from './panels/BillingPanel';
import { SecurityPanel } from './panels/SecurityPanel';
import { PrivacyPanel } from './panels/PrivacyPanel';

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
    { id: 'general', icon: Globe, labelES: 'General', labelEN: 'General' },
    { id: 'personalization', icon: Layout, labelES: 'Diseño', labelEN: 'Layout' },
    { id: 'categories', icon: Layers, labelES: 'Categorías', labelEN: 'Categories' },
    { id: 'automation', icon: Zap, labelES: 'Reglas', labelEN: 'Rules' },
    { id: 'subscription', icon: Star, labelES: 'Plan', labelEN: 'Plan' },
    { id: 'billing', icon: CreditCard, labelES: 'Pagos', labelEN: 'Billing' },
    { id: 'security', icon: Lock, labelES: 'Seguridad', labelEN: 'Security' },
    { id: 'privacy', icon: Shield, labelES: 'Privacidad', labelEN: 'Privacy' },
];

export const SettingsPage: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const { language } = useUserStore();

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfilePanel key="profile" />;
            case 'general':
                return <PreferencesPanel key="general" />;
            case 'personalization':
                return <PersonalizationPanel key="personalization" />;
            case 'categories':
                return <CategoriesPanel key="categories" />;
            case 'automation':
                return <AutomationPanel key="automation" />;
            case 'subscription':
                return <SubscriptionPanel key="subscription" />;
            case 'billing':
                return <BillingPanel key="billing" />;
            case 'security':
                return <SecurityPanel key="security" />;
            case 'privacy':
                return <PrivacyPanel key="privacy" />;
            default:
                return <PanelPlaceholder title={activeSection} key={activeSection} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-gray-50 dark:bg-onyx-950 relative overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden bg-white dark:bg-onyx-950 border-b border-gray-100 dark:border-onyx-800 p-4 flex justify-between items-center z-20 sticky top-0 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Layout className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-black text-lg text-gray-900 dark:text-white tracking-tight">Aliseus Settings</h2>
                </div>
                <button onClick={onMenuClick} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 bg-gray-50 dark:bg-onyx-900 rounded-xl border border-gray-200 dark:border-onyx-800 shadow-sm active:scale-95">
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full shrink-0 z-10 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <SettingsSidebar
                    activeSection={activeSection}
                    onSelectSection={setActiveSection}
                    language={language}
                />
            </div>

            {/* Mobile Horizontal Scroll Menu */}
            <div className="md:hidden flex overflow-x-auto p-3 bg-white/80 dark:bg-onyx-950/80 backdrop-blur-md border-b border-gray-100 dark:border-onyx-800 gap-2 shrink-0 custom-scrollbar z-10 sticky top-[73px]">
                {MOBILE_MENU_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    const label = language === 'ES' ? item.labelES : item.labelEN;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-[1rem] text-[10px] uppercase font-black tracking-widest transition-all duration-300 flex items-center gap-2 border ${isActive
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white shadow-md'
                                : 'bg-gray-50 dark:bg-onyx-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-onyx-800 shadow-inner'
                                }`}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-0 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-onyx-950/50">
                <div className="max-w-5xl mx-auto min-h-full p-4 md:p-10 lg:p-12">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
