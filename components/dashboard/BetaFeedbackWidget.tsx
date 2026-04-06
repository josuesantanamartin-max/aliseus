import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, CheckCircle2, Bug, Lightbulb, HelpCircle, Sparkles } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { DASHBOARD_TEXTS } from '../../i18n/dashboardTexts';
import { cn } from '../../utils/cn';

export default function BetaFeedbackWidget({ variant = 'floating' }: { variant?: 'floating' | 'sidebar' }) {
    const { language } = useUserStore();
    const t = DASHBOARD_TEXTS[language as 'ES' | 'EN']?.feedback || DASHBOARD_TEXTS.ES.feedback;

    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<'BUG' | 'IDEA' | 'QUESTION'>('BUG');
    const [message, setMessage] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        
        // Simulación de envío (En el futuro esto iría a Supabase o una API)
        console.log('[Beta Feedback]', { type, message, timestamp: new Date().toISOString(), language });
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setIsSending(false);
        setIsSent(true);
        setMessage('');

        // Auto cerrar después de 3 segundos
        setTimeout(() => {
            setIsSent(false);
            setIsOpen(false);
        }, 3000);
    };

    return (
        <>
            {/* Button Selector Based on Variant */}
            {variant === 'floating' ? (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center border border-white/20 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare className="w-6 h-6" />
                    {/* Notification dot */}
                    <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                </motion.button>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group relative text-aliseus-400 dark:text-aliseus-500 hover:text-aliseus-900 dark:hover:text-aliseus-200 hover:bg-aliseus-50/50 dark:hover:bg-aliseus-900/50"
                >
                    <div className="relative">
                        <MessageSquare className="w-5 h-5 transition-all duration-300 text-aliseus-400 group-hover:text-blue-600 group-hover:scale-110" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-70" />
                    </div>
                    <span className="text-[13px] tracking-tight">Soporte y Feedback</span>
                </motion.button>
            )}

            {/* Modal Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSending && !isSent && setIsOpen(false)}
                            className="absolute inset-0 bg-aliseus-950/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-aliseus-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-aliseus-800"
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                                        <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-aliseus-800 rounded-full text-slate-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {isSent ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-10"
                                    >
                                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-800/50">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.thanks}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Building Aliseus together.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                                {t.modalTitle}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                {t.modalSubtitle}
                                            </p>
                                        </div>

                                        {/* Type Selector */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['BUG', 'IDEA', 'QUESTION'] as const).map((opt) => {
                                                const isActive = type === opt;
                                                const Icon = opt === 'BUG' ? Bug : opt === 'IDEA' ? Lightbulb : HelpCircle;
                                                const label = opt === 'BUG' ? t.typeBug : opt === 'IDEA' ? t.typeIdea : t.typeQuestion;
                                                
                                                return (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setType(opt)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center",
                                                            isActive 
                                                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                                                                : "bg-slate-50/50 dark:bg-aliseus-800/50 border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-aliseus-800"
                                                        )}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <span className="text-[10px] font-black uppercase tracking-tight leading-tight">
                                                            {opt === 'BUG' ? 'Error' : opt === 'IDEA' ? 'Idea' : 'Duda'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Message Field */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                                {t.labelMessage}
                                            </label>
                                            <textarea
                                                required
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder={t.placeholder}
                                                className="w-full h-32 bg-slate-50 dark:bg-aliseus-800/50 border border-slate-100 dark:border-aliseus-800 rounded-[1.5rem] p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSending || !message.trim()}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {t.send}
                                                    <Send className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
