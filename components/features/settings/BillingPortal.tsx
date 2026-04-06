import React, { useState } from 'react';
import { CreditCard, Check, AlertCircle, Calendar, Download, ExternalLink, Crown, Zap, ShieldCheck } from 'lucide-react';
import { useSubscription } from '../../../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../../../types/subscription';
import { useUserStore } from '../../../store/useUserStore';
import { PaymentMethods } from '../../common/PaymentMethods';

const BillingPortal: React.FC = () => {
    const { language } = useUserStore();
    const {
        subscription,
        loading,
        plan,
        isActive,
        isCanceled,
        daysUntilRenewal,
        subscribeToPlan,
        manageBilling,
        cancelSubscription,
        reactivateSubscription
    } = useSubscription();

    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const texts = {
        ES: {
            title: 'Suscripción y Facturación',
            currentPlan: 'Plan Actual',
            status: 'Estado',
            renewsOn: 'Se renueva el',
            canceledOn: 'Cancelado el',
            endsOn: 'Termina el',
            upgrade: 'Mejorar Plan',
            manageBilling: 'Gestionar Facturación',
            cancelSub: 'Cancelar Suscripción',
            reactivate: 'Reactivar Suscripción',
            monthly: 'Mensual',
            annual: 'Anual',
            save48: 'Ahorra 48%',
            features: 'Características',
            usage: 'Uso Actual',
            unlimited: 'Ilimitado',
            active: 'Activa',
            canceled: 'Cancelada',
            trial: 'Prueba',
            pastDue: 'Pago Vencido',
            cancelWarning: '¿Estás seguro de que quieres cancelar?',
            cancelDesc: 'Mantendrás acceso hasta el final de tu período de facturación actual.',
            confirmCancel: 'Sí, Cancelar',
            keepSub: 'Mantener Suscripción',
            upgradeTitle: 'Mejorar a Aliseus Familia',
            upgradeDesc: 'Desbloquea todas las funciones premium',
            perMonth: '/mes',
            perYear: '/año',
            billedMonthly: 'Facturado mensualmente',
            billedAnnually: 'Facturado anualmente'
        },
        EN: {
            title: 'Subscription & Billing',
            currentPlan: 'Current Plan',
            status: 'Status',
            renewsOn: 'Renews on',
            canceledOn: 'Canceled on',
            endsOn: 'Ends on',
            upgrade: 'Upgrade Plan',
            manageBilling: 'Manage Billing',
            cancelSub: 'Cancel Subscription',
            reactivate: 'Reactivate Subscription',
            monthly: 'Monthly',
            annual: 'Annual',
            save48: 'Save 48%',
            features: 'Features',
            usage: 'Current Usage',
            unlimited: 'Unlimited',
            active: 'Active',
            canceled: 'Canceled',
            trial: 'Trial',
            pastDue: 'Past Due',
            cancelWarning: 'Are you sure you want to cancel?',
            cancelDesc: 'You\'ll keep access until the end of your current billing period.',
            confirmCancel: 'Yes, Cancel',
            keepSub: 'Keep Subscription',
            upgradeTitle: 'Upgrade to Aliseus Family',
            upgradeDesc: 'Unlock all premium features',
            perMonth: '/month',
            perYear: '/year',
            billedMonthly: 'Billed monthly',
            billedAnnually: 'Billed annually'
        },
        FR: {
            title: 'Abonnement et Facturation',
            currentPlan: 'Plan Actuel',
            status: 'Statut',
            renewsOn: 'Renouvelle le',
            canceledOn: 'Annulé le',
            endsOn: 'Se termine le',
            upgrade: 'Améliorer le Plan',
            manageBilling: 'Gérer la Facturation',
            cancelSub: 'Annuler l\'Abonnement',
            reactivate: 'Réactiver l\'Abonnement',
            monthly: 'Mensuel',
            annual: 'Annuel',
            save48: 'Économisez 48%',
            features: 'Fonctionnalités',
            usage: 'Utilisation Actuelle',
            unlimited: 'Illimité',
            active: 'Actif',
            canceled: 'Annulé',
            trial: 'Essai',
            pastDue: 'Paiement en Retard',
            cancelWarning: 'Êtes-vous sûr de vouloir annuler?',
            cancelDesc: 'Vous garderez l\'accès jusqu\'à la fin de votre période de facturation actuelle.',
            confirmCancel: 'Oui, Annuler',
            keepSub: 'Garder l\'Abonnement',
            upgradeTitle: 'Passer à Aliseus Famille',
            upgradeDesc: 'Débloquez toutes les fonctionnalités premium',
            perMonth: '/mois',
            perYear: '/an',
            billedMonthly: 'Facturé mensuellement',
            billedAnnually: 'Facturé annuellement'
        }
    };

    const t = texts[language];

    const handleUpgrade = async () => {
        setActionLoading(true);
        try {
            await subscribeToPlan('FAMILIA', billingPeriod);
        } catch (error) {
            console.error('Upgrade error:', error);
            alert('Error al mejorar el plan');
        } finally {
            setActionLoading(false);
        }
    };

    const handleManageBilling = async () => {
        setActionLoading(true);
        try {
            await manageBilling();
        } catch (error) {
            console.error('Portal error:', error);
            alert('Error al abrir el portal de facturación');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        setActionLoading(true);
        try {
            await cancelSubscription();
            setShowCancelConfirm(false);
        } catch (error) {
            console.error('Cancel error:', error);
            alert('Error al cancelar la suscripción');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivate = async () => {
        setActionLoading(true);
        try {
            await reactivateSubscription();
        } catch (error) {
            console.error('Reactivate error:', error);
            alert('Error al reactivar la suscripción');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (!subscription) return null;

        const statusConfig = {
            ACTIVE: { color: 'bg-green-100 text-green-800', text: t.active },
            CANCELED: { color: 'bg-red-100 text-red-800', text: t.canceled },
            TRIAL: { color: 'bg-blue-100 text-blue-800', text: t.trial },
            PAST_DUE: { color: 'bg-yellow-100 text-yellow-800', text: t.pastDue },
            NONE: { color: 'bg-gray-100 text-gray-800', text: t.active }
        };

        const config = statusConfig[subscription.status];

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            </div>

            {/* Current Plan Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {plan.name[language]}
                            </h3>
                            {subscription?.tier === 'FAMILIA' && (
                                <Crown className="w-5 h-5 text-yellow-500" />
                            )}
                        </div>
                        <p className="text-gray-600">{plan.description[language]}</p>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* Billing Info */}
                {subscription?.currentPeriodEnd && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {isCanceled ? t.endsOn : t.renewsOn}:{' '}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            {daysUntilRenewal !== null && ` (${daysUntilRenewal} días)`}
                        </span>
                    </div>
                )}

                {/* Price */}
                {subscription?.tier === 'FAMILIA' && (
                    <div className="text-3xl font-bold text-gray-900 mb-6">
                        {plan.price.monthly}€
                        <span className="text-lg font-normal text-gray-600">{t.perMonth}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {subscription?.tier === 'FREE' && (
                        <button
                            onClick={handleUpgrade}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Zap className="w-4 h-4" />
                            {t.upgrade}
                        </button>
                    )}

                    {subscription?.tier === 'FAMILIA' && isActive && (
                        <>
                            <button
                                onClick={handleManageBilling}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t.manageBilling}
                            </button>

                            {!isCanceled && (
                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    {t.cancelSub}
                                </button>
                            )}

                            {isCanceled && (
                                <button
                                    onClick={handleReactivate}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    {t.reactivate}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.features}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.features.map((feature) => (
                        <div key={feature.id} className="flex items-start gap-3">
                            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-600' : 'text-gray-300'}`} />
                            <div>
                                <p className={`text-sm font-medium ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {feature.name[language]}
                                </p>
                                {feature.limit && (
                                    <p className="text-xs text-gray-500">{feature.limit}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Usage (if applicable) */}
            {subscription && subscription.tier === 'FREE' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.usage}</h3>
                    <div className="space-y-3">
                        {Object.entries(subscription.usage).map(([key, value]) => {
                            const limits = plan.limits;
                            const limitKey = `max${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof limits;
                            const limit = limits[limitKey];

                            if (typeof limit !== 'number') return null;

                            const percentage = (value / limit) * 100;

                            return (
                                <div key={key}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 capitalize">{key}</span>
                                        <span className="text-gray-600">
                                            {value} / {limit}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${percentage >= 100 ? 'bg-red-600' :
                                                percentage >= 80 ? 'bg-yellow-500' :
                                                    'bg-blue-600'
                                                }`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Upgrade CTA (for FREE users) */}
            {subscription?.tier === 'FREE' && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{t.upgradeTitle}</h3>
                            <p className="text-blue-100 mb-4">{t.upgradeDesc}</p>

                            {/* Billing Period Toggle */}
                            <div className="inline-flex bg-white/20 rounded-lg p-1 mb-4">
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'monthly'
                                        ? 'bg-white text-blue-600'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    {t.monthly}
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('annual')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'annual'
                                        ? 'bg-white text-blue-600'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    {t.annual}
                                    <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
                                        {t.save48}
                                    </span>
                                </button>
                            </div>

                            <div className="text-3xl font-bold mb-1">
                                {billingPeriod === 'monthly' ? '2,99€' : '19,99€'}
                                <span className="text-lg font-normal text-blue-100">
                                    {billingPeriod === 'monthly' ? t.perMonth : t.perYear}
                                </span>
                            </div>
                            <p className="text-sm text-blue-200 mb-2">Plan Familia: {billingPeriod === 'monthly' ? '3,99€' : '24,99€'}{billingPeriod === 'monthly' ? t.perMonth : t.perYear}</p>
                            <p className="text-sm text-blue-100">
                                {billingPeriod === 'monthly' ? t.billedMonthly : t.billedAnnually}
                            </p>
                        </div>
                        <button
                            onClick={handleUpgrade}
                            disabled={actionLoading}
                            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        >
                            {t.upgrade}
                        </button>
                    </div>

                    {/* Accepted Payment Methods indicator for upgrade */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-blue-100/60">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pagos 100% Seguros con Stripe</span>
                        </div>
                        <PaymentMethods variant="light" className="opacity-90 scale-90" />
                    </div>
                </div>
            )
            }

            {/* Cancel Confirmation Modal */}
            {
                showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{t.cancelWarning}</h3>
                            </div>
                            <p className="text-gray-600 mb-6">{t.cancelDesc}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    {t.keepSub}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {t.confirmCancel}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default BillingPortal;
