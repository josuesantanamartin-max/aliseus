import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Check, Zap, CreditCard, FileText, Download } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { stripeService } from '@/services/stripeService';
import { cn } from '@/utils/cn';
import { ReferralWidget } from '@/components/dashboard/ReferralWidget';

export const PlanBillingPanel = () => {
    // Subscription hooks
    const { subscription, language, userProfile } = useUserStore();
    const isSpanish = language === 'ES';

    // Billing toggle state
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

    // Dynamic features list matching landing page
    const personalFeatures = isSpanish
        ? ['1 Usuario', 'Acceso Total', 'Bóveda Segura']
        : ['1 User', 'Full Access', 'Secure Vault'];

    const familyFeatures = isSpanish
        ? ['Hasta 5 Usuarios', 'Acceso Total', 'Bóveda Segura', 'Espacios Compartidos', 'Modo Junior', 'Soporte Prioritario']
        : ['Up to 5 Users', 'Full Access', 'Secure Vault', 'Shared Spaces', 'Junior Mode', 'Priority Support'];

    const handleUpgrade = async (plan: 'PERSONAL' | 'FAMILIA') => {
        if (!userProfile?.id) {
            alert(isSpanish ? 'Debes iniciar sesión para suscribirte a un plan. En modo Demo no es posible iniciar pagos.' : 'You must be logged in to subscribe. Not available in Demo mode.');
            return;
        }

        try {
            // Reemplaza los IDs "price_personal_..." con los de Stripe reales
            const priceId = plan === 'FAMILIA'
                ? (billingInterval === 'month' ? 'price_1T1atC3IoYNgqHKqk5IFpCDe' : 'price_1T1atD3IoYNgqHKq5Rqk8byX')
                : (billingInterval === 'month' ? 'price_personal_monthly' : 'price_personal_annual');

            await stripeService.createCheckoutSession({
                priceId,
                userId: userProfile.id
            });
        } catch (error) {
            console.error('Error upgrading:', error);
            alert(isSpanish ? 'Error al iniciar el pago con Stripe' : 'Error starting Stripe checkout');
        }
    };

    const handleManageSubscription = () => {
        if (!userProfile?.id) {
            alert(isSpanish ? 'Debes iniciar sesión para gestionar tu plan. En modo Demo no está disponible.' : 'You must be logged in to manage your plan. Not available in Demo mode.');
            return;
        }
        stripeService.createPortalSession({ customerId: userProfile.id });
    };

    const handleManageMethods = () => {
        if (!userProfile?.id) {
            alert(isSpanish ? 'Debes iniciar sesión para gestionar métodos de pago. En modo Demo no está disponible.' : 'You must be logged in to manage payment methods. Not available in Demo mode.');
            return;
        }
        stripeService.createPortalSession({ customerId: userProfile.id });
    };

    // Helper for billing interval text
    const intervalText = billingInterval === 'month' 
        ? (isSpanish ? 'mes' : 'month') 
        : (isSpanish ? 'año' : 'year');

    // Calculate static prices for UI based on interval
    const personalPrice = billingInterval === 'month' ? '2,99€' : '19,99€';
    const familyPrice = billingInterval === 'month' ? '3,99€' : '24,99€';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl space-y-16 pb-12 mx-auto"
        >
            {/* 1. MEMBERSHIP SECTION */}
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            {isSpanish ? 'Estado del Plan' : 'Plan Status'}
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isSpanish ? 'Tu membresía ' : 'Your membership '} 
                            <span className="text-blue-600">Aliseus</span>
                        </h2>
                    </div>

                    {/* Billing Toggle (Monthly / Annual) */}
                    <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner self-start md:self-end">
                        <button
                            onClick={() => setBillingInterval('month')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                billingInterval === 'month'
                                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {isSpanish ? 'Mensual' : 'Monthly'}
                        </button>
                        <button
                            onClick={() => setBillingInterval('year')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                billingInterval === 'year'
                                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {isSpanish ? 'Anual' : 'Annual'}
                        </button>
                    </div>
                </div>

                {/* Founder Benefit Banner */}
                {userProfile?.betaStatus === 'ALPHA' && (
                    <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className="mx-4 p-8 rounded-[40px] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white relative overflow-hidden shadow-2xl shadow-amber-500/30 group/founder"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl transform -rotate-3 group-hover/founder:rotate-0 transition-transform duration-500">
                                <Star className="w-10 h-10 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                            </div>
                            <div className="text-center md:text-left space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                    {isSpanish ? 'Acreditación Aliseus' : 'Aliseus Accreditation'}
                                </div>
                                <h5 className="text-3xl font-black tracking-tight leading-none">
                                    {subscription.isBetaExtraApplied 
                                        ? (isSpanish ? 'Beneficio Activado: 18 MESES' : 'Benefit Activated: 18 MONTHS')
                                        : (isSpanish ? '18 meses por el precio de 12' : '18 months for the price of 12')}
                                </h5>
                                <p className="text-amber-50/80 font-medium text-sm max-w-xl leading-relaxed">
                                    {subscription.isBetaExtraApplied 
                                        ? (isSpanish 
                                            ? 'Hemos extendido tu tranquilidad 6 meses adicionales sin coste. Tu suscripción anual es ahora de 18 meses.' 
                                            : 'We have extended your peace of mind for 6 additional months at no cost. Your annual subscription is now 18 months.')
                                        : (isSpanish 
                                            ? 'Como Socio Fundador, al contratar cualquier plan anual recibirás 6 meses extra cortesía de Aura AI.' 
                                            : 'As a Founding Partner, you will receive 6 extra months courtesy of Aura AI when purchasing any annual plan.')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Plan Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    {/* Personal Plan */}
                    <div className={cn(
                        "p-10 rounded-[45px] border relative overflow-hidden group/plan transition-all duration-500 flex flex-col justify-between min-h-[500px]",
                        subscription.plan === 'PERSONAL' 
                            ? "bg-white dark:bg-aliseus-900 border-blue-500 dark:border-blue-400 shadow-2xl shadow-blue-500/10" 
                            : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                    )}>
                        {subscription.plan === 'PERSONAL' && (
                            <div className="absolute top-6 right-6 px-3 py-1 bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                {isSpanish ? 'Tu Plan' : 'Your Plan'}
                            </div>
                        )}
                        
                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                    <Star className={cn("w-7 h-7", subscription.plan === 'PERSONAL' ? "text-blue-500 fill-blue-500" : "text-blue-400")} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Personal <span className="text-blue-500">Pro</span></h3>
                                    <p className="text-sm font-medium text-slate-500 mt-2">
                                        {isSpanish ? "Poder de organización total para un solo usuario." : "Total organization power for a single user."}
                                    </p>
                                </div>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{personalPrice}</span>
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/ {intervalText}</span>
                                </div>
                            </div>

                            <ul className="space-y-4">
                                {personalFeatures.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                                        <div className="w-5 h-5 flex-shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Check className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button 
                             onClick={() => subscription.plan === 'PERSONAL' ? handleManageSubscription() : handleUpgrade('PERSONAL')}
                             className={cn(
                                "w-full py-5 mt-8 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative z-10",
                                subscription.plan === 'PERSONAL'
                                    ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                                    : "bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95"
                             )}
                        >
                            {subscription.plan === 'PERSONAL' 
                                ? (isSpanish ? 'Gestionar Plan Actual' : 'Manage Current Plan') 
                                : (isSpanish ? 'Elegir Plan Pro' : 'Choose Pro Plan')}
                        </button>
                    </div>

                    {/* Family Plan */}
                    <div className={cn(
                        "p-10 rounded-[45px] border relative overflow-hidden group/plan transition-all duration-500 flex flex-col justify-between min-h-[500px]",
                        subscription.plan === 'FAMILIA' 
                            ? "bg-white dark:bg-aliseus-900 border-indigo-500 dark:border-indigo-400 shadow-2xl shadow-indigo-500/10" 
                            : "bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-transparent shadow-2xl shadow-indigo-500/20"
                    )}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                        {subscription.plan === 'FAMILIA' && (
                            <div className="absolute top-6 right-6 px-3 py-1 bg-indigo-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                {isSpanish ? 'Tu Plan' : 'Your Plan'}
                            </div>
                        )}
                        
                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center border",
                                    subscription.plan === 'FAMILIA' ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/20 border-white/20"
                                )}>
                                    <Zap className={cn("w-7 h-7", subscription.plan === 'FAMILIA' ? "text-indigo-500 fill-indigo-500" : "text-white fill-white")} />
                                </div>
                                <div>
                                    <h3 className={cn("text-4xl font-black tracking-tighter", subscription.plan === 'FAMILIA' ? "text-slate-900 dark:text-white" : "text-white")}>
                                        Familia <span className={subscription.plan === 'FAMILIA' ? "text-indigo-600" : "text-indigo-200"}>Premium</span>
                                    </h3>
                                    <p className={cn("text-sm font-medium mt-2", subscription.plan === 'FAMILIA' ? "text-slate-500" : "text-white/80")}>
                                        {isSpanish ? "Hasta 5 miembros con entorno colaborativo completo." : "Up to 5 members with full collaborative environment."}
                                    </p>
                                </div>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className={cn("text-3xl font-black", subscription.plan === 'FAMILIA' ? "text-slate-900 dark:text-white" : "text-white")}>{familyPrice}</span>
                                    <span className={cn("text-sm font-bold uppercase tracking-widest", subscription.plan === 'FAMILIA' ? "text-slate-400" : "text-white/60")}>/ {intervalText}</span>
                                </div>
                            </div>

                            <ul className="space-y-4">
                                {familyFeatures.map((f, i) => (
                                    <li key={i} className={cn("flex items-center gap-3 text-sm font-bold", subscription.plan === 'FAMILIA' ? "text-slate-600 dark:text-slate-300" : "text-white/90")}>
                                        <div className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button 
                             onClick={() => subscription.plan === 'FAMILIA' ? handleManageSubscription() : handleUpgrade('FAMILIA')}
                             className={cn(
                                "w-full py-5 mt-8 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative z-10",
                                subscription.plan === 'FAMILIA'
                                    ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                                    : "bg-white text-indigo-600 shadow-xl shadow-black/20 hover:bg-white/90 active:scale-95"
                             )}
                        >
                            {subscription.plan === 'FAMILIA' 
                                ? (isSpanish ? 'Gestionar Plan Actual' : 'Manage Current Plan') 
                                : (isSpanish ? 'Pasar a Premium' : 'Upgrade to Premium')}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. REFERRAL SECTION */}
            <div className="px-4">
                <ReferralWidget />
            </div>

            {/* 3. BILLING & PAYMENTS SECTION */}
            <div className="space-y-12 px-4 pt-12 border-t border-slate-200 dark:border-white/10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isSpanish ? 'Pagos y Facturación' : 'Payments & Billing'}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary Card Visualization - Premium Glassmorphism */}
                    <div className="relative group perspective-1000">
                        {/* Glow effect behind the card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[42px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                        
                        <div className="relative p-8 rounded-[40px] shadow-2xl overflow-hidden aspect-[1.6/1] flex flex-col justify-between border border-white/30 dark:border-white/10 bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-800/40 dark:to-slate-900/10 backdrop-blur-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                            {/* Glass reflections and shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/40 dark:via-white/5 dark:to-white/10 pointer-events-none" />
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 dark:bg-indigo-500/30 rounded-full blur-[60px]" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-400/20 dark:bg-violet-500/30 rounded-full blur-[60px]" />
                            
                            <div className="relative z-10 flex justify-between items-start">
                                {/* Credit Card Chip */}
                                <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-yellow-200/80 to-yellow-500/50 dark:from-yellow-400/50 dark:to-yellow-600/60 border border-yellow-100/50 shadow-inner flex flex-col justify-evenly px-2">
                                    <div className="w-full h-px bg-black/10" />
                                    <div className="w-full h-px bg-black/10" />
                                    <div className="w-full h-px bg-black/10" />
                                </div>
                                <span className="px-4 py-1.5 bg-blue-600 shadow-md text-[9px] font-black text-white uppercase tracking-[0.2em] rounded-full">
                                    {isSpanish ? 'Principal' : 'Default'}
                                </span>
                            </div>

                            <div className="relative z-10 space-y-5">
                                <div className="flex gap-4 items-center">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-1.5">
                                            {[1, 2, 3, 4].map(j => (
                                                <div key={`${i}-${j}`} className="w-2 h-2 bg-slate-800 dark:bg-white/80 rounded-full shadow-sm" />
                                            ))}
                                        </div>
                                    ))}
                                    <span className="text-2xl font-black text-slate-800 dark:text-white tracking-[0.2em] drop-shadow-sm">4242</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-white/50 uppercase tracking-widest mb-1">{isSpanish ? 'Titular' : 'Card Holder'}</p>
                                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest drop-shadow-sm">JOSUE S. MARTÍN</p>
                                    </div>
                                    <div className="text-right flex items-end gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 dark:text-white/50 uppercase tracking-widest mb-1">{isSpanish ? 'Expira' : 'Expires'}</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white tracking-widest drop-shadow-sm">12/28</p>
                                        </div>
                                        <div className="w-14 font-black italic text-2xl text-blue-800 dark:text-white drop-shadow-md text-right tracking-tighter">
                                            VISA
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Alternative Methods */}
                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                            <button className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-50 hover:-translate-y-1 dark:hover:bg-white/10 transition-all group flex flex-col items-center justify-center gap-2 shadow-sm">
                                <img src="https://cdn.simpleicons.org/applepay/black" className="w-10 h-8 object-contain dark:invert group-hover:scale-110 transition-transform" alt="Apple Pay" />
                                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Apple Pay</span>
                            </button>
                            <button className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-50 hover:-translate-y-1 dark:hover:bg-white/10 transition-all group flex flex-col items-center justify-center gap-2 shadow-sm">
                                <img src="https://cdn.simpleicons.org/googlepay/black" className="w-10 h-8 object-contain dark:invert group-hover:scale-110 transition-transform" alt="Google Pay" />
                                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Google Pay</span>
                            </button>
                            <button className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-[#FFB3C7]/10 hover:border-[#FFB3C7] hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2 shadow-sm">
                                <img src="https://cdn.simpleicons.org/klarna/black" className="w-10 h-8 object-contain dark:invert group-hover:scale-110 transition-transform" alt="Klarna" />
                                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Klarna</span>
                            </button>
                            <button className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-[#000000]/5 dark:hover:bg-white/10 hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2 shadow-sm">
                                <img src="https://cdn.simpleicons.org/revolut/black" className="w-10 h-8 object-contain dark:invert group-hover:scale-110 transition-transform" alt="Revolut" />
                                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Revolut</span>
                            </button>
                        </div>
                        <button onClick={handleManageSubscription} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            {isSpanish ? 'Gestionar Métodos' : 'Manage Methods'}
                            <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                        </button>
                    </div>
                </div>

                {/* Invoice Timeline Section */}
                <div className="space-y-8 pt-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Línea de Recibos' : 'Receipt Timeline'}
                            </h3>
                            <p className="text-[10px] font-black text-emerald-600/40 dark:text-emerald-300/40 uppercase tracking-widest mt-1">
                                {isSpanish ? 'Registro Financiero' : 'Financial Ledger'}
                            </p>
                        </div>
                    </div>

                    <div className="relative pl-8 space-y-6 before:absolute before:top-4 before:bottom-0 before:left-3 before:w-px before:bg-gradient-to-b before:from-emerald-500/30 before:via-slate-200 dark:before:via-white/10 before:to-transparent">
                        {[1, 2, 3].map((i) => {
                            const months = isSpanish ? ['Octubre', 'Noviembre', 'Diciembre'] : language === 'FR' ? ['Octobre', 'Novembre', 'Décembre'] : ['October', 'November', 'December'];
                            return (
                                <div key={i} className="relative group">
                                    <div className="absolute -left-[1.35rem] top-7 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] ring-4 ring-white dark:ring-aliseus-950 group-hover:scale-150 group-hover:bg-blue-500 transition-all duration-300" />
                                    
                                    <div className="w-full p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-hover:border-emerald-500/30 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {months[i - 1]} 12, 2026
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                                                    <Check className="w-2.5 h-2.5" /> {isSpanish ? 'Abonado' : 'Settled'}
                                                </span>
                                            </div>
                                            <h5 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                Aliseus Pro &middot; 1 {isSpanish ? 'Mes' : 'Month'}
                                            </h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ID Factura: #{202400 + i}</p>
                                        </div>
                                        <div className="text-left md:text-right flex flex-row md:flex-col justify-between items-center md:items-end">
                                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{subscription.plan === 'FAMILIA' ? '3,99€' : '2,99€'}</div>
                                            <button className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-end gap-1.5 md:mt-2">
                                                <Download className="w-3.5 h-3.5" /> {isSpanish ? 'Descargar PDF' : 'Download PDF'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            
        </motion.div>
    );
};

