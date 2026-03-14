import React, { Suspense } from 'react';
import Sidebar from './Sidebar';
import ModuleLoader from '../common/ui/ModuleLoader';
import FloatingActionButton from '../common/ui/FloatingActionButton';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '../../services/supabaseClient';
import { PageTransition } from '../common/animations/PageTransition';
import { useNotificationEngine } from '../../hooks/useNotificationEngine';

// Lazy loaded modules
const FinanceModule = React.lazy(() => import('../features/finance/FinanceModule'));
const LifeModule = React.lazy(() => import('../features/life/LifeModule'));
const SettingsPage = React.lazy(() => import('../features/settings/SettingsPage'));
const CustomizableDashboard = React.lazy(() => import('../dashboard/AuraDashboard'));
const HelpCenter = React.lazy(() => import('../pages/HelpCenter'));

const MainShell: React.FC = () => {
    // Mount the notification rules engine — evaluates Finance & Life state proactively
    useNotificationEngine();

    const {
        activeApp, setActiveApp,
        setFinanceActiveTab, setLifeActiveTab,
        setSidebarOpen,
        setDemoMode, setAuthenticated
    } = useUserStore();

    const handleLogout = async () => {
        if (supabase) await supabase.auth.signOut();
        setDemoMode(false);
        setAuthenticated(false);
    };

    const handleGlobalNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
    };

    const renderModule = () => {
        return (
            <Suspense fallback={<ModuleLoader />}>
                <PageTransition key={activeApp}>
                    {(() => {
                        switch (activeApp) {
                            case 'dashboard': return <CustomizableDashboard />;
                            case 'finance': return <FinanceModule onMenuClick={() => setSidebarOpen(true)} onNavigate={handleGlobalNavigate} />;
                            case 'life': return <LifeModule onMenuClick={() => setSidebarOpen(true)} />;
                            case 'settings': return <SettingsPage onMenuClick={() => setSidebarOpen(true)} />;
                            case 'help': return <HelpCenter />;
                            default: return null;
                        }
                    })()}
                </PageTransition>
            </Suspense>
        );
    };

    return (
        <div className="flex h-screen bg-onyx-50 font-sans text-onyx-950 overflow-hidden relative">
            <Sidebar onLogout={handleLogout} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-primary transition-colors duration-300">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {renderModule()}
                </div>
            </main>
            <FloatingActionButton />
        </div>
    );
};

export default MainShell;
