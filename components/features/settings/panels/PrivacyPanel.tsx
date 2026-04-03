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
                dpoContact: 'privacidad@aliseus.com'
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
                layouts: (useUserStore.getState() as any).dashboardLayouts ?? [],
                widgets: (useUserStore.getState() as any).dashboardWidgets ?? [],
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
            className="max-w-4xl space-y-12 pb-12 w-full"
        >
            {/* Data Management Section */}
            <section className="bg-white dark:bg-onyx-900/50 p-10 md:p-14 rounded-[50px] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-indigo-400 rounded-2xl border border-blue-500/20 shadow-inner">
                            <FileJson className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Exportación de Datos' : 'Data Portability'}
                            </h4>
                            <p className="text-[10px] font-black text-blue-600/40 dark:text-indigo-300/40 uppercase tracking-widest mt-1">Transparencia Total de Aliseus</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
                        <div className="space-y-4">
                            <p className="text-sm font-black text-slate-600 dark:text-indigo-100/60 leading-relaxed max-w-sm">
                                {isSpanish ? 'Descarga una copia completa de tu vida digital en Aliseus. Formato JSON estándar para máxima compatibilidad.' : 'Download a complete record of your Aliseus digital life. Standard JSON format for maximum interoperability.'}
                            </p>
                            {lastDataExport && (
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-indigo-400/50 uppercase tracking-[0.2em]">
                                    <Clock className="w-3.5 h-3.5" />
                                    {isSpanish ? 'Último Pulso' : 'Last Pulse'}: {new Date(lastDataExport).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="relative group/export px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-indigo-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 dark:shadow-indigo-600/10 hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0 overflow-hidden"
                        >
                            <Download className={`w-4 h-4 transition-transform group-hover/export:-translate-y-1 ${isExporting ? 'animate-bounce' : ''}`} />
                            {isExporting ? (isSpanish ? 'Generando...' : 'Generating...') : (isSpanish ? 'Iniciar Descarga' : 'Start Download')}
                            <div className="absolute inset-0 bg-blue-500/10 dark:bg-indigo-500/10 opacity-0 group-hover/export:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Privacy Toggles Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cookies */}
                <section className="bg-white dark:bg-onyx-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20 shadow-inner">
                                <Cookie className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Rastreo y Cookies' : 'Tracking & Cookies'}
                            </h4>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'analytics', label: isSpanish ? 'Análisis de Uso' : 'Usage Analytics', desc: isSpanish ? 'Mejora de experiencia' : 'Experience improvement' },
                                { key: 'marketing', label: isSpanish ? 'Personalización' : 'Tailored Ads', desc: isSpanish ? 'Contenido relevante' : 'Relevant content' }
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm">
                                    <div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.label}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleCookiePreference(item.key as any)}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${cookiePreferences?.[item.key as 'analytics' | 'marketing'] ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-200 dark:bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${cookiePreferences?.[item.key as 'analytics' | 'marketing'] ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AI Preferences */}
                <section className="bg-white dark:bg-onyx-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
                                <Brain className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Inteligencia Aura' : 'Aura Intelligence'}
                            </h4>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'enableRecommendations', label: isSpanish ? 'Sugerencias 360' : '360 Suggestions', desc: isSpanish ? 'Basadas en tus hábitos' : 'Based on your habits' },
                                { key: 'allowDataUsage', label: isSpanish ? 'Aprendizaje Federado' : 'Federated Learning', desc: isSpanish ? 'Mejorar modelos Aura' : 'Refine Aura models' }
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm">
                                    <div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.label}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleAIPreference(item.key as any)}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${aiPreferences?.[item.key as 'enableRecommendations' | 'allowDataUsage'] ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-200 dark:bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${aiPreferences?.[item.key as 'enableRecommendations' | 'allowDataUsage'] ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};
