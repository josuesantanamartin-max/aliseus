import React from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Check, Zap } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { stripeService } from '../../../../services/stripeService';

export const SubscriptionPanel = () => {
    const { subscription, language, userProfile } = useUserStore();
    const isSpanish = language === 'ES';

    const planName = subscription.plan === 'FAMILIA' ? 'Premium (Familiar)' : subscription.plan === 'PERSONAL' ? 'Pro' : 'Basic';

    const getStatusLabel = () => {
        if (subscription.status === 'ACTIVE') return isSpanish ? 'Suscripción Activa' : 'Active Subscription';
        if (subscription.status === 'NONE') return isSpanish ? 'Básico' : 'Basic';
        return subscription.status;
    };

    const featuresList = isSpanish
        ? ['Acceso ilimitado a todas las herramientas', 'Gestión de hasta 5 miembros', 'Transacciones sincronizadas al instante', 'Predicciones asistidas por IA', 'Sin anuncios ni banners', 'Soporte prioritario']
        : ['Unlimited access to all tools', 'Manage up to 5 members', 'Instantly synced transactions', 'AI-assisted predictions', 'No ads or banners', 'Priority support'];

    const handleUpgradeToFamily = async (interval: 'month' | 'year') => {
        if (!userProfile?.id) return;
        try {
            const priceId = interval === 'month'
                ? 'price_1T1atC3IoYNgqHKqk5IFpCDe'
                : 'price_1T1atD3IoYNgqHKq5Rqk8byX';

            await stripeService.createCheckoutSession({
                priceId,
                userId: userProfile.id
            });
        } catch (error) {
            console.error('Error upgrading:', error);
            alert(isSpanish ? 'Error al iniciar el pago con Stripe' : 'Error starting Stripe checkout');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-12 pb-12"
        >
            <div className="bg-white dark:bg-onyx-950 p-10 md:p-14 rounded-[50px] border border-slate-200 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Ambient Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 group-hover:bg-indigo-500/10 transition-all duration-1000" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-inner group-hover:border-blue-500/30 transition-all">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                            <span className="text-[10px] font-black text-blue-600 dark:text-indigo-200 uppercase tracking-[0.2em]">
                                {getStatusLabel()}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">
                                Aliseus <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-400 dark:to-rose-400">{planName}</span>
                            </h4>
                            <p className="text-slate-500 dark:text-indigo-200/60 font-medium text-lg max-w-md">
                                {isSpanish ? 'Tu tranquilidad está garantizada hasta el' : 'Your peace of mind is guaranteed until'} <span className="text-blue-600 dark:text-white font-black">{subscription.expiryDate || '12 Oct 2026'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[240px]">
                        <button
                            onClick={() => stripeService.createPortalSession({ customerId: userProfile?.id })}
                            className="w-full px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-indigo-950 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 dark:shadow-black/20 hover:bg-slate-800 dark:hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSpanish ? 'Suscripción en Stripe' : 'Subscription in Stripe'} <ExternalLink className="w-4 h-4" />
                        </button>

                        {subscription.plan !== 'FAMILIA' && (
                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] text-center">{isSpanish ? 'Opciones de Mejora' : 'Upgrade Options'}</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleUpgradeToFamily('month')}
                                        className="flex-1 px-5 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        3,99€/{isSpanish ? 'mes' : 'mo'}
                                    </button>
                                    <button
                                        onClick={() => handleUpgradeToFamily('year')}
                                        className="flex-1 px-5 py-4 bg-blue-500/10 dark:bg-indigo-500/20 hover:bg-blue-500/20 dark:hover:bg-indigo-500/30 text-blue-600 dark:text-indigo-400 border border-blue-500/20 dark:border-indigo-500/30 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        24,99€/{isSpanish ? 'año' : 'yr'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b border-slate-100 dark:border-white/5">
                    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md group-hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-4 mb-4 text-blue-600 dark:text-indigo-400">
                            <div className="p-2.5 bg-blue-500/10 dark:bg-indigo-500/10 rounded-xl border border-blue-500/20 dark:border-indigo-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {isSpanish ? 'Próximo Ciclo' : 'Next Billing Cycle'}
                            </h5>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">2,99€</span>
                            <span className="text-sm font-bold text-slate-400 dark:text-indigo-300/40 uppercase tracking-widest">/ {isSpanish ? 'mes' : 'month'}</span>
                        </div>
                    </div>
                    
                    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md group-hover:border-rose-500/20 transition-all flex flex-col justify-center">
                        <h5 className="text-[10px] font-black text-slate-400 dark:text-indigo-300/40 uppercase tracking-[0.2em] mb-4">
                            {isSpanish ? 'Acceso Familiar' : 'Family Sharing'}
                        </h5>
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-indigo-900 bg-slate-200 dark:bg-onyx-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-indigo-300 shadow-sm">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-indigo-900 bg-blue-50 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-blue-600 dark:text-indigo-400 shadow-sm">
                                +2
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12">
                    <h5 className="text-[11px] font-black text-slate-400 dark:text-indigo-300/60 uppercase tracking-[0.3em] mb-8 text-center flex items-center justify-center gap-6">
                        <div className="h-px w-12 bg-slate-200 dark:bg-indigo-500/20" />
                        {isSpanish ? 'Privilegios de tu Plan' : 'Plan Privileges'}
                        <div className="h-px w-12 bg-slate-200 dark:bg-indigo-500/20" />
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuresList.map((f, i) => (
                            <div key={i} className="flex items-start gap-4 group/item">
                                <div className="p-1 px-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover/item:scale-110 transition-transform shadow-sm">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-slate-600 dark:text-indigo-100/80 leading-snug">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
