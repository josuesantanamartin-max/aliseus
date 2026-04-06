import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Database, ShieldCheck, Zap } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { DASHBOARD_TEXTS } from '@/i18n/dashboardTexts';

interface BetaWelcomeCardProps {
    onSetupClick: () => void;
}

export const BetaWelcomeCard: React.FC<BetaWelcomeCardProps> = ({ onSetupClick }) => {
    const { language } = useUserStore();
    const { setMockData } = useFinanceStore();
    
    const texts = (DASHBOARD_TEXTS as any)[language || 'ES']?.finance?.emptyState || DASHBOARD_TEXTS.ES.finance.emptyState;

    const handleDemoMode = () => {
        if (setMockData) {
            setMockData();
        }
    };


    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto rounded-[2.5rem] bg-white dark:bg-aliseus-900 border border-slate-100 dark:border-aliseus-800 shadow-2xl overflow-hidden relative"
        >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
                {/* Visual Side */}
                <div className="w-full md:w-1/2 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" />
                        Socio Fundador Aliseus
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                            {texts.title}
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {texts.subtitle}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            onClick={onSetupClick}
                            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/10 dark:shadow-white/5 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
                        >
                            {texts.primaryAction}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button 
                            onClick={() => {
                                // Logic to trigger demo mode in Finance Store
                                setMockData();
                            }}

                            className="px-8 py-4 bg-slate-50 dark:bg-aliseus-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-100 dark:hover:bg-aliseus-700 transition-all border border-slate-100 dark:border-aliseus-700 flex items-center justify-center gap-3"
                        >
                            <Database className="w-5 h-5" />
                            {texts.secondaryAction}
                        </button>
                    </div>
                </div>

                {/* Benefits Side */}
                <div className="w-full md:w-1/2 bg-slate-50/50 dark:bg-aliseus-800/40 rounded-[2rem] p-8 border border-slate-100 dark:border-aliseus-800/50">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
                        {texts.benefitTitle}
                    </h3>

                    <div className="space-y-6">
                        {texts.benefits.map((benefit: string, idx: number) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-aliseus-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-aliseus-700 group-hover:scale-110 transition-transform">
                                    {idx === 0 && <ShieldCheck className="w-6 h-6 text-emerald-500" />}
                                    {idx === 1 && <Zap className="w-6 h-6 text-amber-500" />}
                                    {idx === 2 && <Sparkles className="w-6 h-6 text-indigo-500" />}
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-snug">
                                        {benefit}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-200 dark:border-aliseus-700 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-aliseus-900 bg-slate-200 dark:bg-aliseus-700" />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            +40 familias pioneras
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
