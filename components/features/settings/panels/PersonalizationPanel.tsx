import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Palette, Zap } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';

export const PersonalizationPanel = () => {
    const { theme, setTheme, language } = useUserStore();

    const isSpanish = language === 'ES';

    const handleResetLayout = () => {
        // La restauración del layout estará disponible en la próxima versión
        // TODO: implement when dashboardWidgets are part of useUserStore
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-12 pb-12"
        >
            {/* Theme Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {isSpanish ? 'Tema de la Interfaz' : 'App Theme'}
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { 
                            id: 'light', 
                            label: isSpanish ? 'Modo Claro' : 'Light Mode', 
                            icon: '☀️', 
                            preview: 'from-amber-100 via-orange-50 to-white',
                            accent: 'text-amber-600',
                            border: 'border-amber-200/50'
                        },
                        { 
                            id: 'dark', 
                            label: isSpanish ? 'Modo Oscuro' : 'Dark Mode', 
                            icon: '🌙', 
                            preview: 'from-[#0c0c1e] via-indigo-950 to-onyx-950',
                            accent: 'text-indigo-400',
                            border: 'border-indigo-500/30'
                        },
                        { 
                            id: 'system', 
                            label: isSpanish ? 'Sistema' : 'System', 
                            icon: '💻', 
                            preview: 'from-gray-100 via-white to-gray-200 dark:from-[#0c0c1e] dark:via-onyx-900 dark:to-onyx-950',
                            accent: 'text-emerald-500',
                            border: 'border-gray-200 dark:border-onyx-700'
                        }
                    ].map((mode) => (
                        <motion.button
                            key={mode.id}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTheme(mode.id as any)}
                            className={`group relative h-64 rounded-[40px] overflow-hidden border-2 transition-all duration-500 ${
                                theme === mode.id || (theme === 'system' && mode.id === 'system')
                                    ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-2xl'
                                    : 'border-transparent hover:border-gray-200 dark:hover:border-white/10 bg-white dark:bg-onyx-900'
                            }`}
                        >
                            {/* Visual Preview */}
                            <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-110 ${mode.preview}`} />
                            
                            {/* Glass Overlay for content */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-[2px]" />
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                <span className="text-5xl mb-4 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    {mode.icon}
                                </span>
                                <span className={`text-xs font-black uppercase tracking-[0.2em] ${
                                    theme === mode.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                    {mode.label}
                                </span>
                                
                                {theme === mode.id && (
                                    <motion.div 
                                        layoutId="active-theme-indicator"
                                        className="mt-4 px-3 py-1 bg-indigo-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg"
                                    >
                                        Active
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Dashboard Layout Section */}
            <section className="bg-white/40 dark:bg-onyx-900/50 p-10 md:p-14 rounded-[50px] border border-slate-200/50 dark:border-onyx-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-inner">
                                <Layout className="w-6 h-6" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Arquitectura del Dashboard' : 'Dashboard Architecture'}
                            </h4>
                        </div>
                        <p className="text-lg text-slate-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
                            {isSpanish 
                                ? 'Restablece la configuración original de tus widgets si deseas volver a empezar con el diseño maestro de Aura.' 
                                : 'Reset your widget configuration to start fresh with the Aura master design.'}
                        </p>
                    </div>
                    
                    <button
                        onClick={handleResetLayout}
                        className="shrink-0 px-10 py-6 bg-white dark:bg-onyx-800 hover:bg-slate-50 dark:hover:bg-onyx-700 text-slate-900 dark:text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg border border-slate-200 dark:border-onyx-600 flex items-center gap-4"
                    >
                        <Zap className="w-5 h-5 text-amber-500" />
                        {isSpanish ? 'Restaurar Diseño' : 'Reset Architecture'}
                    </button>
                </div>
            </section>
        </motion.div>
    );
};
