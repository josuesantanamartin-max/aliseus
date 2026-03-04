import React, { useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useUserStore } from '../../store/useUserStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import OnyxLanding from '../layout/OnyxLanding';
import OnboardingWizard from '../onboarding/OnboardingWizard';

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

    const [isInitializing, setIsInitializing] = React.useState(true);

    // --- AUTH INITIALIZATION ---
    useEffect(() => {
        console.log("[AuthGate] Initializing Auth...", { isDemoMode, isAuthenticated, hash: window.location.hash });

        if (supabase) {
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                    console.error("[AuthGate] Error getting session:", error);
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
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Usuario Onyx',
                        avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                    };

                    setUserProfile(profile);
                    loadFromCloud();
                    addSyncLog({ message: "Conectado a Onyx Cloud (Supabase)", timestamp: Date.now(), type: "SYSTEM" });
                } else {
                    console.log("[AuthGate] No active session found.");
                    // Only apply demo mode if NO real session exists AND we are not handling a redirect hash
                    if (isDemoMode && !window.location.hash.includes('access_token')) {
                        console.log("[AuthGate] Falling back to Demo Mode.");
                        setMockData();
                        setAuthenticated(true);
                    }
                }
                setIsInitializing(false);
            });

            const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log("[AuthGate] Auth state changed:", event, session?.user?.email);
                if (session) {
                    setAuthenticated(true);
                    setDemoMode(false);

                    const profile = {
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Usuario Onyx',
                        avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                    };

                    setUserProfile(profile);
                    loadFromCloud();
                } else if (!isDemoMode) {
                    setAuthenticated(false);
                    setUserProfile(null);
                } else {
                    // Supabase client is not available
                    if (isDemoMode && !window.location.hash.includes('access_token')) {
                        setMockData();
                        setAuthenticated(true);
                    } else if (!isDemoMode && !window.location.hash.includes('access_token')) {
                        // If no supabase, not in demo mode, and not an OAuth redirect, ensure authenticated is false
                        setAuthenticated(false);
                        setUserProfile(null);
                        clearAllData();
                    }
                    setIsInitializing(false);
                }
            });

            return () => {
                authSubscription.unsubscribe();
            };
        } else {
            if (isDemoMode && !window.location.hash.includes('access_token')) {
                setMockData();
                setAuthenticated(true);
            }
            setIsInitializing(false);
        }
    }, [isDemoMode, setAuthenticated, setDemoMode, addSyncLog, setUserProfile, loadFromCloud, setMockData, clearAllData]);

    const handleLogin = async (method: 'DEMO' | 'GOOGLE' | 'EMAIL' | 'NOTION', data?: { email: string, password: string, isRegister: boolean }) => {
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
                        redirectTo: window.location.origin
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
                    const { error } = await supabase.auth.signUp({
                        email: data.email,
                        password: data.password,
                    });
                    if (error) throw error;
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

    if (isInitializing && !isAuthenticated && window.location.hash.includes('access_token')) {
        // Prevent flashing the landing page while Supabase processes the OAuth callback
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <OnyxLanding onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
    }

    // New: Check for Onboarding Completion check
    if (!hasCompletedOnboarding) {
        return <OnboardingWizard />;
    }

    return <>{children}</>;
};

export default AuthGate;
