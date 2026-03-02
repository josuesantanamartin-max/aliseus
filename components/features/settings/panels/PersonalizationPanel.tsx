import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Palette, Zap } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { DEFAULT_WIDGETS } from '../../../../constants';

export const PersonalizationPanel = () => {
    const { theme, setTheme, setDashboardWidgets, language } = useUserStore();

    const isSpanish = language === 'ES';

    const handleResetLayout = () => {
        if (window.confirm(isSpanish ? '¿Estás seguro de resetear el diseño del dashboard?' : 'Are you sure you want to reset the dashboard layout?')) {
            setDashboardWidgets(DEFAULT_WIDGETS);
        }
    };

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
                    {isSpanish ? 'Personalización' : 'Personalization'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Temas, apariencia y organización del dashboard.' : 'Themes, appearance, and dashboard layout.'}
                </p>
            </div>

            {/* Theme Section */}
            <div className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-onyx-800 transition-all hover:shadow-2xl group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Palette className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            {isSpanish ? 'Tema de la Interfaz' : 'App Theme'}
                        </h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {isSpanish ? 'Elige cómo se ve Aliseus' : 'Choose how Aliseus looks'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { id: 'light', label: 'Light Mode', icon: '☀️', color: 'from-amber-100 to-orange-50 text-amber-600 border-amber-200', bg: 'bg-gray-50' },
                        { id: 'dark', label: 'Dark Mode', icon: '🌙', color: 'from-indigo-950 to-gray-900 text-indigo-300 border-indigo-900', bg: 'bg-onyx-950' },
                        { id: 'system', label: 'System', icon: '💻', color: 'from-gray-100 to-gray-50 dark:from-onyx-800 dark:to-onyx-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-onyx-700', bg: 'bg-white dark:bg-onyx-900' }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setTheme(mode.id as any)}
                            className={`p-6 rounded-3xl border flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-95 overflow-hidden relative ${theme === mode.id || (theme === 'system' && mode.id === 'system')
                                    ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-200/50 dark:shadow-none'
                                    : `${mode.bg} border-transparent hover:shadow-xl hover:border-gray-200 dark:hover:border-onyx-700`
                                }`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br opacity-40 ${mode.color}`}></div>
                            <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner bg-white/50 dark:bg-black/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500`}>
                                {mode.icon}
                            </div>
                            <span className={`relative z-10 text-[10px] font-black uppercase tracking-widest ${theme === mode.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {mode.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dashboard Layout Section */}
            <div className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-onyx-800 transition-all hover:shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Layout className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                {isSpanish ? 'Diseño del Dashboard' : 'Dashboard Layout'}
                            </h4>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                                {isSpanish ? 'Gestiona los widgets de tu pantalla principal.' : 'Manage the widgets on your home screen.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleResetLayout}
                        className="shrink-0 px-6 py-4 bg-gray-100 dark:bg-onyx-800 hover:bg-gray-200 dark:hover:bg-onyx-700 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4 text-amber-500" />
                        {isSpanish ? 'Restaurar por Defecto' : 'Reset to Default'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
