import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileJson, Download, Cookie, Brain, Clock } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { useFinanceStore } from '../../../../store/useFinanceStore';
import { useLifeStore } from '../../../../store/useLifeStore';

export const PrivacyPanel = () => {
    const {
        language,
        cookiePreferences,
        setCookiePreferences,
        aiPreferences,
        setAIPreferences,
        lastDataExport,
        setLastDataExport,
        userProfile
    } = useUserStore();

    const isSpanish = language === 'ES';
    const [isExporting, setIsExporting] = useState(false);

    const handleExportData = () => {
        setIsExporting(true);

        const data = {
            metadata: {
                version: '1.0',
                exportDate: new Date().toISOString(),
                userId: userProfile?.id || 'demo',
                gdprCompliant: true,
                dataRetentionPolicy: 'Data is retained as long as your account is active',
                dpoContact: 'dpo@aliseus.com'
            },
            userData: {
                profile: userProfile,
                preferences: {
                    language: useUserStore.getState().language,
                    currency: useUserStore.getState().currency,
                    theme: useUserStore.getState().theme,
                },
                cookiePreferences,
                aiPreferences,
            },
            financeData: {
                transactions: useFinanceStore.getState().transactions,
                accounts: useFinanceStore.getState().accounts,
                budgets: useFinanceStore.getState().budgets,
                goals: useFinanceStore.getState().goals,
                debts: useFinanceStore.getState().debts,
                categories: useFinanceStore.getState().categories,
            },
            lifeData: {
                pantryItems: useLifeStore.getState().pantryItems,
                shoppingList: useLifeStore.getState().shoppingList,
                familyMembers: useLifeStore.getState().familyMembers,
                weeklyPlans: useLifeStore.getState().weeklyPlans,
            },
            dashboardData: {
                layouts: useUserStore.getState().dashboardLayouts,
                widgets: useUserStore.getState().dashboardWidgets,
            },
            automationData: {
                rules: useUserStore.getState().automationRules,
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aliseus_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setLastDataExport(new Date().toISOString());

        setTimeout(() => {
            setIsExporting(false);
            alert(isSpanish ? 'Datos exportados correctamente' : 'Data exported successfully');
        }, 1000);
    };

    const toggleCookiePreference = (key: 'analytics' | 'marketing') => {
        if (!cookiePreferences) return;
        const updated = {
            ...cookiePreferences,
            [key]: !cookiePreferences[key],
            timestamp: new Date().toISOString()
        };
        setCookiePreferences(updated);
        localStorage.setItem('onyx_cookie_preferences', JSON.stringify(updated));
    };

    const toggleAIPreference = (key: 'enableRecommendations' | 'allowDataUsage') => {
        if (!aiPreferences) return;
        setAIPreferences({ [key]: !aiPreferences[key] });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-8 pb-12 w-full"
        >
            <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {isSpanish ? 'Privacidad' : 'Privacy'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Gestiona tus datos personales, cookies y preferencias de IA.' : 'Manage your personal data, cookies, and AI preferences.'}
                </p>
            </div>

            {/* Data Management Section */}
            <div className="space-y-6">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 flex items-center gap-3">
                    <FileJson className="w-6 h-6 text-indigo-500" /> {isSpanish ? 'Gestión de Datos' : 'Data Management'}
                </h4>
                <div className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/40 dark:shadow-none space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h5 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                                {isSpanish ? 'Exportar Mis Datos' : 'Export My Data'}
                            </h5>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                                {isSpanish ? 'Descarga una copia completa de todos tus datos en formato JSON.' : 'Download a complete copy of all your data in JSON format.'}
                            </p>
                            {lastDataExport && (
                                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {isSpanish ? 'Última exportación' : 'Last export'}: {new Date(lastDataExport).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? (isSpanish ? 'EXPORTANDO...' : 'EXPORTING...') : (isSpanish ? 'EXPORTAR DATOS' : 'EXPORT DATA')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Cookie Preferences Section */}
            <div className="space-y-6 pt-4">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 flex items-center gap-3">
                    <Cookie className="w-6 h-6 text-purple-500" /> {isSpanish ? 'Preferencias de Cookies' : 'Cookie Preferences'}
                </h4>
                <div className="bg-white dark:bg-onyx-900 p-4 sm:p-6 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/40 dark:shadow-none divide-y divide-gray-100 dark:divide-onyx-800">
                    <div className="py-4 px-2 sm:px-4 flex items-center justify-between gap-4">
                        <div>
                            <h5 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gray-400" />
                                {isSpanish ? 'Cookies Esenciales' : 'Essential Cookies'}
                            </h5>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {isSpanish ? 'Necesarias para el funcionamiento básico' : 'Required for basic functionality'}
                            </p>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-onyx-800 text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-200 dark:border-onyx-700 shadow-sm whitespace-nowrap">
                            {isSpanish ? 'Siempre Activas' : 'Always Active'}
                        </span>
                    </div>

                    <div className="py-4 px-2 sm:px-4 flex items-center justify-between gap-4">
                        <div>
                            <h5 className="text-base font-black text-gray-900 dark:text-white">
                                {isSpanish ? 'Cookies de Análisis' : 'Analytics Cookies'}
                            </h5>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {isSpanish ? 'Ayudan a mejorar la aplicación' : 'Help improve the application'}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleCookiePreference('analytics')}
                            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 outline-none ${cookiePreferences?.analytics ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-onyx-700'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${cookiePreferences?.analytics ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="py-4 px-2 sm:px-4 flex items-center justify-between gap-4">
                        <div>
                            <h5 className="text-base font-black text-gray-900 dark:text-white">
                                {isSpanish ? 'Cookies de Marketing' : 'Marketing Cookies'}
                            </h5>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {isSpanish ? 'Para contenido personalizado' : 'For personalized content'}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleCookiePreference('marketing')}
                            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 outline-none ${cookiePreferences?.marketing ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-onyx-700'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${cookiePreferences?.marketing ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Features Section */}
            <div className="space-y-6 pt-4">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 flex items-center gap-3">
                    <Brain className="w-6 h-6 text-blue-500" /> {isSpanish ? 'Funciones de IA' : 'AI Features'}
                </h4>
                <div className="bg-white dark:bg-onyx-900 p-4 sm:p-6 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/40 dark:shadow-none divide-y divide-gray-100 dark:divide-onyx-800">
                    <div className="py-4 px-2 sm:px-4 flex items-center justify-between gap-4">
                        <div>
                            <h5 className="text-base font-black text-gray-900 dark:text-white">
                                {isSpanish ? 'Recomendaciones IA' : 'AI Recommendations'}
                            </h5>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {isSpanish ? 'Recibe sugerencias personalizadas' : 'Receive personalized suggestions'}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleAIPreference('enableRecommendations')}
                            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 outline-none ${aiPreferences?.enableRecommendations ? 'bg-blue-500' : 'bg-gray-300 dark:bg-onyx-700'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${aiPreferences?.enableRecommendations ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="py-4 px-2 sm:px-4 flex items-center justify-between gap-4">
                        <div>
                            <h5 className="text-base font-black text-gray-900 dark:text-white">
                                {isSpanish ? 'Uso de Datos para IA' : 'Data Usage for AI'}
                            </h5>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {isSpanish ? 'Permitir que tus datos ayuden a mejorar los modelos' : 'Allow your data to help improve models'}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleAIPreference('allowDataUsage')}
                            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 outline-none ${aiPreferences?.allowDataUsage ? 'bg-blue-500' : 'bg-gray-300 dark:bg-onyx-700'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${aiPreferences?.allowDataUsage ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
