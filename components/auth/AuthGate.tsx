import React, { useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useUserStore } from '../../store/useUserStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useLifeStore } from '../../store/useLifeStore';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { realtimeService } from '../../services/realtimeService';
import AliseusLanding from '../layout/AliseusLanding';
import OnboardingWizard from '../onboarding/OnboardingWizard';
import { invitationService } from '../../services/invitationService';

interface AuthGateProps {
    children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const {
        isAuthenticated, setAuthenticated,
        isDemoMode, setDemoMode,
        language, setLanguage,
        addSyncLog, setUserProfile,
        hasCompletedOnboarding
    } = useUserStore();

    const { loadFromCloud, setMockData, clearAllData } = useFinanceStore();
    const { loadFromCloud: loadLifeFromCloud } = useLifeStore();

    const loadAll = async () => {
        try {
            await useHouseholdStore.getState().fetchHouseholds();
            await loadFromCloud();
            await loadLifeFromCloud();
        } catch (error) {
            console.error('[AuthGate] Error loadAll:', error);
        }
    };

    const [isInitializing, setIsInitializing] = React.useState(true);

    const getInvitationCodeFromUrl = () => {
        const isInviteRoute = window.location.pathname.startsWith('/invite/');
        if (isInviteRoute) {
            return window.location.pathname.split('/')[2];
        }
        
        const params = new URLSearchParams(window.location.search);
        return params.get('code');
    };

    // Capture isDemoMode at mount time via ref so changes to it don't re-trigger
    // the auth initialization effect (which would cause duplicate listeners and
    // potentially clearAllData() firing after Google OAuth sets isDemoMode to false).
    const isDemoModeRef = useRef(isDemoMode);

    // --- AUTH INITIALIZATION --- runs ONCE on mount ---
    useEffect(() => {
        const initialDemoMode = isDemoModeRef.current;
        console.log("[AuthGate] Initializing Auth...", { initialDemoMode, isAuthenticated, hash: window.location.hash });

        if (supabase) {
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                    console.error("[AuthGate] Error getting session:", error);
                    setIsInitializing(false);
                    return;
                }

                if (session) {
                    console.log("[AuthGate] Session found! Upgrading to real mode.", session.user.email);
                    setAuthenticated(true);
                    setDemoMode(false); // Force exit demo mode if we have a real session

                    // Map Supabase metadata to our store structure
                    const profile = {
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Usuario Aliseus',
                        avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                    };

                    setUserProfile(profile);

                    if (session.user.user_metadata?.hasCompletedOnboarding) {
                        useUserStore.getState().completeOnboarding();
                    }

                    // Await loadAll so we don't flash the onboarding screen if it's going to be bypassed
                    loadAll().then(() => {
                        addSyncLog({ message: "Conectado a Aliseus Cloud (Supabase)", timestamp: Date.now(), type: "SYSTEM" });
                        realtimeService.startSync();
                        setIsInitializing(false);
                    });
                } else {
                    console.log("[AuthGate] No active session found.");
                    // Only apply demo mode if NO real session exists AND we are not handling a redirect hash
                    const hasOAuthCallback = window.location.hash.includes('access_token') || window.location.search.includes('code=');
                    if (initialDemoMode && !hasOAuthCallback) {
                        console.log("[AuthGate] Falling back to Demo Mode.");
                        setMockData();
                        setAuthenticated(true);
                    }
                    setIsInitializing(false);
                }
            });

            const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log("[AuthGate] Auth state changed:", event, session?.user?.email);
                if (session) {
                    setAuthenticated(true);
                    setDemoMode(false);

                    const profile = {
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Usuario Aliseus',
                        avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                    };

                    setUserProfile(profile);

                    if (session.user.user_metadata?.hasCompletedOnboarding) {
                        useUserStore.getState().completeOnboarding();
                    }

                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        loadAll().then(() => {
                            realtimeService.startSync();
                        });
                    }
                } else {
                    // User signed out
                    setAuthenticated(false);
                    setUserProfile(null);
                    realtimeService.stopSync();
                    if (!isDemoModeRef.current) {
                        clearAllData();
                    }
                }
            });

            return () => {
                authSubscription.unsubscribe();
            };
        } else {
            if (initialDemoMode && !window.location.hash.includes('access_token')) {
                setMockData();
                setAuthenticated(true);
            }
            setIsInitializing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run ONCE on mount â€” isDemoMode changes must NOT re-trigger auth init

    const handleLogin = async (method: 'DEMO' | 'GOOGLE' | 'EMAIL' | 'NOTION', data?: { email: string, password: string, isRegister: boolean, invitationCode?: string }) => {
        console.log(`[AuthGate] handleLogin called with method: ${method}`);

        if (method === 'DEMO') {
            setDemoMode(true);
            setMockData();
            setAuthenticated(true);
            addSyncLog({ message: "Modo Demo activado (Local)", timestamp: Date.now(), type: "SYSTEM" });
        } else if (method === 'GOOGLE' && supabase) {
            try {
                console.log("[AuthGate] Initiating Google OAuth Login...");
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/`
                    }
                });
                if (error) {
                    console.error("[AuthGate] Google OAuth Error returned:", error);
                    throw error;
                }
                console.log("[AuthGate] Google OAuth Redirect initiated successfully");
            } catch (error: any) {
                console.error("[AuthGate] Caught Google Login Error:", error);
                alert(`Error al iniciar sesión con Google: ${error.message}`);
            }
        } else if (method === 'NOTION' && supabase) {
            try {
                console.log("[AuthGate] Initiating Notion OAuth Login...");
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'notion',
                    options: {
                        redirectTo: window.location.origin
                    }
                });
                if (error) throw error;
            } catch (error: any) {
                alert(`Error al iniciar sesión con Notion: ${error.message}`);
                console.error(error);
            }
        } else if (method === 'EMAIL' && supabase && data) {
            try {
                console.log(`[AuthGate] Attempting ${data.isRegister ? 'Signup' : 'Login'} with Email: ${data.email}`);
                if (data.isRegister) {
                    const { data: signUpData, error } = await supabase.auth.signUp({
                        email: data.email,
                        password: data.password,
                    });
                    if (error) throw error;

                    // Consume invitation code if we have one
                    const inviteToken = data.invitationCode || getInvitationCodeFromUrl();
                    if (inviteToken && signUpData.user) {
                        try {
                            const success = await invitationService.useCode(inviteToken, signUpData.user.id);
                            if (!success) {
                                console.warn('[AuthGate] Failed to mark invitation code as used, but registration continued.');
                            }
                        } catch (invError) {
                            console.error('[AuthGate] Error consuming invitation code:', invError);
                        }
                    }

                    alert("¡Registro con éxito! Por favor, verifica tu email o inicia sesión.");
                } else {
                    const { error } = await supabase.auth.signInWithPassword({
                        email: data.email,
                        password: data.password,
                    });
                    if (error) throw error;
                }
            } catch (error: any) {
                alert(`Error de autenticación: ${error.message}`);
                console.error(error);
            }
        } else if (!supabase) {
            console.error("[AuthGate] Supabase client is not initialized!");
            alert("Para activar el login real, configura las claves de Supabase en tu entorno.");
        }
    };

    if (isInitializing) {
        // Show spinner while checking session and loading possible initial data
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const inviteToken = getInvitationCodeFromUrl();
        
        return (
            <AliseusLanding 
                onLogin={handleLogin} 
                language={language} 
                setLanguage={setLanguage} 
                inviteToken={inviteToken}
            />
        );
    }

    // New: Check for Onboarding Completion check
    if (!hasCompletedOnboarding) {
        return <OnboardingWizard />;
    }

    return <>{children}</>;
};

export default AuthGate;
