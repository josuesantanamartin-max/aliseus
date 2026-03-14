import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import AuthGate from './components/auth/AuthGate';
import MainShell from './components/layout/MainShell';
import AcceptInvite from './components/pages/AcceptInvite';
import ThemeManager from './components/common/ThemeManager';
import ErrorBoundary from './components/common/ErrorBoundary';
import Toast from './components/common/Toast';
import CookieConsent from './components/common/CookieConsent';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import { VoiceAssistantFab } from './components/features/voice/VoiceAssistantFab';
import { monitoringService } from './services/monitoringService';
import { useUserStore } from '@/store/useUserStore';
import { useRealtimeSync } from './hooks/useRealtimeSync';

const App: React.FC = () => {
    const userProfile = useUserStore((state: any) => state.userProfile);
    const cookiePreferences = useUserStore((state: any) => state.cookiePreferences);

    // Initialize Realtime Sync
    useRealtimeSync();

    // Initialize monitoring service on app startup
    useEffect(() => {
        monitoringService.init();
        console.log('[App] Monitoring service initialized');
    }, []);

    const isInviteRoute = window.location.pathname.startsWith('/invite/');
    const inviteToken = isInviteRoute ? window.location.pathname.split('/')[2] : null;

    // Set user context when user changes
    useEffect(() => {
        if (userProfile && userProfile.id) {
            monitoringService.setUserContext({
                id: userProfile.id,
                email: userProfile.email,
                username: userProfile.full_name,
            });
            monitoringService.addBreadcrumb('User logged in', 'auth', {
                userId: userProfile.id,
            });
        } else {
            monitoringService.setUserContext(null);
        }
    }, [userProfile]);

    return (
        <ErrorBoundary>
            <PerformanceMonitor />
            <AuthGate>
                <ThemeManager />
                {isInviteRoute && inviteToken ? (
                    <AcceptInvite token={inviteToken} />
                ) : (
                    <MainShell />
                )}
                <br />
                <Toast />
                <CookieConsent />
                <VoiceAssistantFab />
            </AuthGate>
            {/* Only load Analytics if user consented to analytics cookies */}
            {cookiePreferences?.analytics && <Analytics />}
        </ErrorBoundary>
    );
};

export default App;
