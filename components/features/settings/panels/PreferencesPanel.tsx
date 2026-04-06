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
            className="max-w-4xl space-y-12 pb-12"
        >
            {/* Language Section */}
            <section className="bg-white dark:bg-aliseus-900/50 p-10 md:p-14 rounded-[50px] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-indigo-400 rounded-2xl border border-blue-500/20 shadow-inner">
                            <Globe className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Idioma Maestro' : 'Master Language'}
                            </h4>
                            <p className="text-[10px] font-black text-blue-600/40 dark:text-indigo-300/40 uppercase tracking-widest mt-1">Localización Global de Aliseus</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {['ES', 'EN', 'FR'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang as any)}
                                className={`group/btn relative py-6 px-8 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] flex flex-col items-center justify-center gap-4 transition-all duration-500 border overflow-hidden shadow-sm ${language === lang
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20'
                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                    }`}
                            >
                                <span className="relative z-10">{lang === 'ES' ? 'Español' : lang === 'EN' ? 'English' : 'Français'}</span>
                                {language === lang ? (
                                    <div className="w-2 h-2 bg-white rounded-full drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                ) : (
                                    <div className="w-2 h-2 bg-slate-200 dark:bg-white/10 rounded-full group-hover/btn:bg-slate-300 dark:group-hover/btn:bg-white/30 transition-colors" />
                                )}
                                {language === lang && (
                                    <motion.div 
                                        layoutId="pref-language-glow"
                                        className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Currency Section */}
            <section className="bg-white dark:bg-aliseus-900/50 p-10 md:p-14 rounded-[50px] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-2xl relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
                            <Coins className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Divisa de Referencia' : 'Reference Currency'}
                            </h4>
                            <p className="text-[10px] font-black text-emerald-600/40 dark:text-emerald-300/40 uppercase tracking-widest mt-1">Unificación Financiera</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD'].map((curr) => (
                            <button
                                key={curr}
                                onClick={() => setCurrency(curr as any)}
                                className={`relative py-5 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-between transition-all duration-500 border shadow-sm ${currency === curr
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/20'
                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                    }`}
                            >
                                <span>{curr}</span>
                                {currency === curr && (
                                    <Check className="w-4 h-4 bg-white/20 p-1 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </motion.div>
    );
};
