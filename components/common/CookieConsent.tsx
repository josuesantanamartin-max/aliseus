import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, Settings as SettingsIcon, Shield } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
    version: string;
}

const COOKIE_POLICY_VERSION = '1.0';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const { language, cookiePreferences, setCookiePreferences } = useUserStore();

    useEffect(() => {
        const stored = localStorage.getItem('Aliseus_cookie_preferences');
        if (stored) {
            try {
                const prefs: CookiePreferences = JSON.parse(stored);
                setCookiePreferences(prefs);
            } catch (e) {
                console.error('Error parsing cookie preferences:', e);
            }
        } else {
            // Show banner after delay if no preferences set
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [setCookiePreferences]);

    const handleAcceptAll = () => {
        const prefs: CookiePreferences = {
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
            version: COOKIE_POLICY_VERSION
        };
        savePreferences(prefs);
    };

    const handleDeclineAll = () => {
        const prefs: CookiePreferences = {
            essential: true, // Essential cookies always enabled
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
            version: COOKIE_POLICY_VERSION
        };
        savePreferences(prefs);
    };

    const handleSavePreferences = () => {
        if (!cookiePreferences) return;

        const prefs: CookiePreferences = {
            ...cookiePreferences,
            essential: true, // Always true
            timestamp: new Date().toISOString(),
            version: COOKIE_POLICY_VERSION
        };
        savePreferences(prefs);
        setShowPreferences(false);
    };

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem('Aliseus_cookie_preferences', JSON.stringify(prefs));
        setCookiePreferences(prefs);
        setIsVisible(false);
    };

    const togglePreference = (key: 'analytics' | 'marketing') => {
        if (!cookiePreferences) {
            setCookiePreferences({
                essential: true,
                analytics: key === 'analytics',
                marketing: key === 'marketing',
                timestamp: new Date().toISOString(),
                version: COOKIE_POLICY_VERSION
            });
        } else {
            setCookiePreferences({
                ...cookiePreferences,
                [key]: !cookiePreferences[key]
            });
        }
    };

    if (!isVisible) return null;

    const text = {
        ES: {
            title: 'Usamos Cookies',
            desc: 'Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y recordar tus preferencias.',
            acceptAll: 'Aceptar Todo',
            declineAll: 'Rechazar Todo',
            managePrefs: 'Gestionar Preferencias',
            learnMore: 'Leer Política',
            prefsTitle: 'Preferencias de Cookies',
            prefsDesc: 'Personaliza qué cookies quieres permitir. Las cookies esenciales son necesarias para el funcionamiento básico.',
            essential: 'Cookies Esenciales',
            essentialDesc: 'Necesarias para autenticación, seguridad y funcionalidad básica.',
            analytics: 'Cookies de Análisis',
            analyticsDesc: 'Nos ayudan a entender cómo usas la aplicación para mejorarla.',
            marketing: 'Cookies de Marketing',
            marketingDesc: 'Usadas para personalizar contenido y anuncios (futuro).',
            savePrefs: 'Guardar Preferencias',
            alwaysActive: 'Siempre activas'
        },
        EN: {
            title: 'We use Cookies',
            desc: 'We use cookies to enhance your experience, analyze traffic, and remember your preferences.',
            acceptAll: 'Accept All',
            declineAll: 'Decline All',
            managePrefs: 'Manage Preferences',
            learnMore: 'Read Policy',
            prefsTitle: 'Cookie Preferences',
            prefsDesc: 'Customize which cookies you want to allow. Essential cookies are required for basic functionality.',
            essential: 'Essential Cookies',
            essentialDesc: 'Required for authentication, security, and basic functionality.',
            analytics: 'Analytics Cookies',
            analyticsDesc: 'Help us understand how you use the app to improve it.',
            marketing: 'Marketing Cookies',
            marketingDesc: 'Used to personalize content and ads (future).',
            savePrefs: 'Save Preferences',
            alwaysActive: 'Always active'
        },
        FR: {
            title: 'Nous utilisons des Cookies',
            desc: 'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et mémoriser vos préférences.',
            acceptAll: 'Tout Accepter',
            declineAll: 'Tout Refuser',
            managePrefs: 'Gérer les Préférences',
            learnMore: 'Lire la Politique',
            prefsTitle: 'Préférences de Cookies',
            prefsDesc: 'Personnalisez les cookies que vous souhaitez autoriser. Les cookies essentiels sont nécessaires.',
            essential: 'Cookies Essentiels',
            essentialDesc: 'Nécessaires pour l\'authentification, la sécurité et les fonctionnalités de base.',
            analytics: 'Cookies d\'Analyse',
            analyticsDesc: 'Nous aident à comprendre comment vous utilisez l\'application.',
            marketing: 'Cookies Marketing',
            marketingDesc: 'Utilisés pour personnaliser le contenu et les publicités (futur).',
            savePrefs: 'Enregistrer les Préférences',
            alwaysActive: 'Toujours actifs'
        }
    };

    const t = text[language as keyof typeof text] || text['ES'];

    // Preferences Modal
    if (showPreferences) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-aliseus-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-aliseus-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                <Cookie className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.prefsTitle}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t.prefsDesc}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPreferences(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-aliseus-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Preferences List */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* Essential Cookies */}
                        <div className="p-4 bg-gray-50 dark:bg-aliseus-800 rounded-xl border border-gray-200 dark:border-aliseus-700">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t.essential}</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.essentialDesc}</p>
                                </div>
                                <span className="px-2 py-1 bg-gray-200 dark:bg-aliseus-700 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-md uppercase tracking-wider">
                                    {t.alwaysActive}
                                </span>
                            </div>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="p-4 bg-white dark:bg-aliseus-800 rounded-xl border border-gray-200 dark:border-aliseus-700">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{t.analytics}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.analyticsDesc}</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('analytics')}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${cookiePreferences?.analytics
                                            ? 'bg-indigo-600'
                                            : 'bg-gray-300 dark:bg-aliseus-700'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${cookiePreferences?.analytics ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Marketing Cookies */}
                        <div className="p-4 bg-white dark:bg-aliseus-800 rounded-xl border border-gray-200 dark:border-aliseus-700">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{t.marketing}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.marketingDesc}</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('marketing')}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${cookiePreferences?.marketing
                                            ? 'bg-indigo-600'
                                            : 'bg-gray-300 dark:bg-aliseus-700'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${cookiePreferences?.marketing ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-aliseus-800 bg-gray-50 dark:bg-aliseus-900">
                        <button
                            onClick={handleSavePreferences}
                            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {t.savePrefs}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Banner
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in-up">
            <div className="max-w-4xl mx-auto bg-white dark:bg-aliseus-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-aliseus-800 p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-full flex-shrink-0">
                    <Cookie className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t.desc}{' '}
                        <a href="/legal/privacy" className="underline hover:text-indigo-600 transition-colors">
                            {t.learnMore}
                        </a>
                        .
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowPreferences(true)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-aliseus-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-aliseus-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <SettingsIcon className="w-3 h-3" />
                        {t.managePrefs}
                    </button>
                    <button
                        onClick={handleDeclineAll}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-aliseus-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-aliseus-800 transition-colors"
                    >
                        {t.declineAll}
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="w-3 h-3" />
                        {t.acceptAll}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
