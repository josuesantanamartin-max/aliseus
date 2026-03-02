import React from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Check, Zap } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { stripeService } from '../../../../services/stripeService';

export const SubscriptionPanel = () => {
    const { subscription, language } = useUserStore();
    const isSpanish = language === 'ES';

    const planName = subscription.plan === 'FAMILIA' ? 'Premium' : subscription.plan === 'PERSONAL' ? 'Pro' : 'Basic';

    const getStatusLabel = () => {
        if (subscription.status === 'ACTIVE') return isSpanish ? 'Suscripción Activa' : 'Active Subscription';
        if (subscription.status === 'NONE') return isSpanish ? 'Básico' : 'Basic';
        return subscription.status;
    };

    const featuresList = isSpanish
        ? ['Acceso ilimitado a todas las herramientas', 'Gestión de miembros ilimitados', 'Transacciones sincronizadas automáticamente', 'Predicciones asistidas por IA', 'Sin anuncios ni banners', 'Soporte prioritario']
        : ['Unlimited access to all tools', 'Unlimited members management', 'Automated transaction syncing', 'AI-assisted predictions', 'No ads or banners', 'Priority support'];

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
                    {isSpanish ? 'Suscripción' : 'Subscription'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Gestiona tu plan de Aliseus' : 'Manage your Aliseus plan'}
                </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-rose-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 group-hover:bg-rose-500/20 transition-colors duration-700"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                    <div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-inner`}>
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">
                                {getStatusLabel()}
                            </span>
                        </div>
                        <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                            Aliseus {planName}
                        </h4>
                        <p className="text-indigo-200 font-medium">
                            {isSpanish ? 'Tu plan actual está activo hasta el' : 'Your current plan is active until'} {subscription.expiryDate || '12 Oct 2026'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 shrink-0">
                        <button
                            onClick={() => stripeService.createPortalSession()}
                            className="px-8 py-4 bg-white text-indigo-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-gray-50 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                        >
                            {isSpanish ? 'Gestionar en Stripe' : 'Manage in Stripe'} <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="px-8 py-4 bg-indigo-800/50 text-indigo-200 border border-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-800 transition-all text-center">
                            {isSpanish ? 'Cambiar Plan' : 'Change Plan'}
                        </button>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-indigo-700/50 pt-8">
                    <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 backdrop-blur-sm">
                        <h5 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">
                            {isSpanish ? 'Próximo Cobro' : 'Next Billing'}
                        </h5>
                        <p className="text-2xl font-black text-white">2,99€ <span className="text-sm font-medium text-indigo-300">/ {isSpanish ? 'mes' : 'month'} ({planName})</span></p>
                    </div>
                </div>

                <div className="relative z-10 mt-8 pt-8 border-t border-indigo-700/50">
                    <h5 className="font-bold text-indigo-200 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" /> {isSpanish ? 'Beneficios de tu plan' : 'Your plan benefits'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        {featuresList.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-sm font-medium text-indigo-100">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
