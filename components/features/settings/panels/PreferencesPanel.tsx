import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Coins, Check } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';

export const PreferencesPanel = () => {
    const { language, setLanguage, currency, setCurrency } = useUserStore();

    const isSpanish = language === 'ES';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-8 pb-12"
        >
            <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {isSpanish ? 'Preferencias' : 'Preferences'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Idioma, moneda y configuración regional.' : 'Language, currency, and region settings.'}
                </p>
            </div>

            {/* Language Section */}
            <div className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-onyx-800 transition-all hover:shadow-2xl group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            {isSpanish ? 'Idioma / Language' : 'Language'}
                        </h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {isSpanish ? 'Preferencias de Idioma' : 'Language Preferences'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['ES', 'EN', 'FR'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang as any)}
                            className={`py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 ${language === lang
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : 'bg-gray-50 dark:bg-onyx-950 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-onyx-800 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-onyx-700'
                                }`}
                        >
                            {lang === 'ES' ? 'Español' : lang === 'EN' ? 'English' : 'Français'}
                            {language === lang && <Check className="w-5 h-5 bg-white/20 p-1 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Currency Section */}
            <div className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-onyx-800 transition-all hover:shadow-2xl group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            {isSpanish ? 'Moneda Principal' : 'Primary Currency'}
                        </h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {isSpanish ? 'Divisa de Referencia' : 'Reference Currency'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR'].map((curr) => (
                        <button
                            key={curr}
                            onClick={() => setCurrency(curr as any)}
                            className={`py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 ${currency === curr
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 dark:shadow-none'
                                    : 'bg-gray-50 dark:bg-onyx-950 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-onyx-800 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-onyx-700'
                                }`}
                        >
                            {curr}
                            {currency === curr && <Check className="w-5 h-5 bg-white/20 p-1 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
