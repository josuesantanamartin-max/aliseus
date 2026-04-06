import React, { useState } from 'react';
import {
    PiggyBank, Heart, ArrowRight, Check, Sparkles, LayoutDashboard,
    Smartphone, BarChart3, Fingerprint, Cloud, Zap, Shield, Users,
    TrendingUp, Clock, Globe, ChevronDown, ChevronUp, X, Minus, CheckCircle2,
    TrendingDown, Utensils, Calendar, Archive, Target, CreditCard, ShoppingCart,
    Lock, Monitor, ShieldCheck, FileUp
} from 'lucide-react';
import { Language } from '@/types';
import { PRODUCT_DETAILS_BY_LANG } from './landingData';
import { PaymentMethods } from '../../common/PaymentMethods';

interface LandingHomeProps {
    t: any;
    language: Language;
    setShowLoginModal: (show: boolean) => void;
    onNavigate: (view: 'HOME' | 'FINANCE' | 'LIFE') => void;
}

export const LandingHome: React.FC<LandingHomeProps> = ({
    t,
    language,
    setShowLoginModal,
    onNavigate
}) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

    const handleScrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    const faqs = [
        {
            q: '¿Qué es Aliseus exactamente?',
            a: 'Aliseus es una plataforma integral que unifica la gestión financiera personal y la organización del hogar en un solo lugar. Combina un sistema operativo financiero completo (presupuestos, deudas, inversiones) con herramientas inteligentes para la vida diaria (planificación de menús, gestión de despensa, viajes).'
        },
        {
            q: '¿Cómo se diferencia de otras apps de finanzas o gestión del hogar?',
            a: 'La mayoría de apps se centran en una sola área. Aliseus es única porque conecta tus finanzas con tu vida real. Por ejemplo, si planeas un viaje, Aliseus te muestra automáticamente el impacto en tu presupuesto mensual.'
        },
        {
            q: '¿Mis datos están seguros?',
            a: 'Absolutamente. Aliseus utiliza encriptación AES-256 (el estándar bancario) para proteger tus datos en reposo y en tránsito. La seguridad biométrica (FaceID/TouchID) está en nuestra hoja de ruta como una funcionalidad central de la futura aplicación móvil nativa.'
        },
        {
            q: '¿Qué significa ser Socio Fundador?',
            a: 'Al entrar en la beta, bloqueas el acceso a una herramienta en constante evolución. Estos precios no son una oferta temporal; son nuestros precios estándar y éticos para siempre. Los usuarios de la beta recibiréis, además, beneficios exclusivos que os comunicaremos personalmente.'
        },
        {
            q: '¿Puede usar Aliseus toda mi familia?',
            a: 'Sí. El plan Familiar permite hasta 5 usuarios con espacios compartidos. Podéis gestionar presupuestos conjuntos, menús semanales y el calendario del hogar sin duplicar esfuerzos.'
        },
        {
            q: '¿Hay algún compromiso de permanencia?',
            a: 'Ninguno. Puedes cancelar tu suscripción en cualquier momento. Aliseus nace para darte libertad y tranquilidad, no para atarte a un contrato.'
        }
    ];

    const COMPARISON_FEATURES: Record<string, { ES: string; EN: string; FR: string }[]> = {
        features: [
            { ES: 'Gestión de Transacciones',              EN: 'Transaction Management',              FR: 'Gestion des Transactions' },
            { ES: 'Presupuestos Inteligentes con IA',       EN: 'Smart AI Budgets',                    FR: 'Budgets Intelligents IA' },
            { ES: 'Análisis Predictivo con IA',             EN: 'Predictive AI Analysis',               FR: 'Analyse Prédictive IA' },
            { ES: 'Importación CSV / Extractos',            EN: 'CSV / Statement Import',               FR: 'Import CSV / Relevés' },
            { ES: 'Planificador de Menús con IA',           EN: 'AI Meal Planner',                      FR: 'Planificateur de Repas IA' },
            { ES: 'Gestión de Despensa e Inventario',       EN: 'Pantry & Inventory Management',        FR: 'Gestion du Garde-Manger' },
            { ES: 'Conexión Finanzas ↔ Vida Real',          EN: 'Finance ↔ Real Life Integration',      FR: 'Intégration Finances ↔ Vie' },
            { ES: 'Calculadora de Deudas (Avalancha/Bola)', EN: 'Debt Calculator (Avalanche/Snowball)',  FR: 'Calculateur de Dettes' },
            { ES: 'Centro de Mando Inteligente (Capas Fijas)', EN: 'Smart Command Center (Fixed Layers)', FR: 'Centre de Commande (Couches Fixes)' },
            { ES: 'Modo Colaborativo Familiar',             EN: 'Family Collaborative Mode',            FR: 'Mode Collaboratif Familial' },
            { ES: 'Simulador de Jubilación',                EN: 'Retirement Simulator',                 FR: 'Simulateur de Retraite' },
            { ES: 'Bóveda Digital de Documentos',           EN: 'Digital Document Vault',               FR: 'Coffre-fort Numérique' },
            { ES: 'Planificador de Viajes con IA',          EN: 'AI Travel Planner',                    FR: 'Planificateur de Voyages IA' },
            { ES: 'Centro de Ayuda Multilingüe',            EN: 'Multilingual Help Center',             FR: 'Centre d\'Aide Multilingue' },
            { ES: 'Privacidad GDPR Completa',               EN: 'Full GDPR Privacy',                    FR: 'Confidentialité RGPD Complète' },
            { ES: 'Soporte Familiar (5 usuarios)',          EN: 'Family Support (5 users)',             FR: 'Support Familial (5 utilisateurs)' },
        ]
    };

    const lang = language as 'ES' | 'EN' | 'FR';
    const comparisonFeatures = [
        { feature: COMPARISON_FEATURES.features[0][lang],  manual: true,  other: true,  aliseus: true },
        { feature: COMPARISON_FEATURES.features[1][lang],  manual: false, other: true,  aliseus: true },
        { feature: COMPARISON_FEATURES.features[2][lang],  manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[3][lang],  manual: false, other: true,  aliseus: true },
        { feature: COMPARISON_FEATURES.features[4][lang],  manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[5][lang],  manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[6][lang],  manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[7][lang],  manual: false, other: true,  aliseus: true },
        { feature: COMPARISON_FEATURES.features[8][lang],  manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[9][lang],  manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[10][lang], manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[11][lang], manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[12][lang], manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[13][lang], manual: false, other: true,  aliseus: true },
        { feature: COMPARISON_FEATURES.features[14][lang], manual: false, other: false, aliseus: true },
        { feature: COMPARISON_FEATURES.features[15][lang], manual: false, other: false, aliseus: true },
    ];

    return (
        <div className="animate-fade-in">

            {/* ── Hero Section — Dark Premium ── */}
            <section className="relative pt-32 pb-28 px-6 overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-teal-950">
                {/* Ambient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">

                    {/* Live badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-8 ml-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                        </span>
                        <span className="text-[11px] font-bold text-white/80 tracking-widest uppercase">SOCIOS FUNDADORES</span>
                    </div>

                    <h1 className="flex justify-center mb-8">
                        <img src="/logo-aliseus.png" alt="Aliseus" className="h-24 md:h-32 lg:h-40 object-contain" />
                    </h1>
                    <p className="text-xl md:text-2xl text-cyan-200 max-w-4xl mx-auto mb-6 leading-relaxed font-light whitespace-pre-line">{t.heroSubtitle}</p>
                    <p className="text-lg text-white/60 max-w-3xl mx-auto mb-12">
                        Conecta tus <strong className="text-white">finanzas</strong> con tu <strong className="text-white">vida familiar</strong>. Gestiona presupuestos compartidos, planifica menús basados en lo que tienes y organiza tu hogar, todo desde un mismo lugar.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:from-cyan-400 hover:to-teal-500 transition-all shadow-xl shadow-cyan-500/30 hover:-translate-y-1"
                        >
                            {t.ctaStart} <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-sm text-white/40 mt-6 font-medium">Acceso gratuito en fase Socio Fundador • Sin pagos iniciales • Configuración en 2 min</p>

                    {/* Dashboard Preview */}
                    <div className="mt-16 relative w-full max-w-5xl mx-auto rounded-t-xl shadow-2xl overflow-hidden border-t border-x border-white/10 ring-1 ring-white/5 bg-[#0A0A0A]">
                        {/* Decorative top bar (browser-like) */}
                        <div className="bg-white/5 backdrop-blur-md px-4 py-3 flex items-center gap-2 border-b border-white/10">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="bg-white/5 rounded-full px-4 py-1 text-[11px] text-white/50 border border-white/10 font-medium">
                                    app.aliseus.app
                                </div>
                            </div>
                        </div>
                        {/* The actual screenshot */}
                        <img
                            src="/dashboard-preview.png"
                            alt="Aliseus Dashboard Preview"
                            className="w-full object-cover block aspect-[16/9] bg-gray-900"
                        />
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '2 Módulos', label: 'Finanzas + Vida' },
                            { value: '40+', label: 'Características' },
                            { value: '100%', label: 'GDPR y Privacidad' },
                            { value: 'IA', label: 'Análisis Inteligente' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-cyan-600 mb-1">{stat.value}</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                            <Zap className="w-4 h-4" />
                            Cómo Funciona
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">De Caos a Claridad en 3 Pasos</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Empieza a tomar control de tus finanzas y tu vida en minutos, no en horas.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                step: '1',
                                title: 'Conecta Tu Realidad',
                                desc: 'Registra tus cuentas bancarias, tarjetas, inversiones y deudas. Añade tu despensa actual y preferencias alimentarias.',
                                icon: LayoutDashboard,
                                gradient: 'from-cyan-600 to-cyan-800',
                                iconBg: 'bg-cyan-100',
                                iconColor: 'text-cyan-600'
                            },
                            {
                                step: '2',
                                title: 'Aliseus Analiza y Sugiere',
                                desc: 'La IA analiza tus patrones de gasto, detecta suscripciones olvidadas, y genera menús semanales basados en tu presupuesto.',
                                icon: Sparkles,
                                gradient: 'from-teal-600 to-teal-800',
                                iconBg: 'bg-teal-100',
                                iconColor: 'text-teal-600'
                            },
                            {
                                step: '3',
                                title: 'Toma Decisiones Inteligentes',
                                desc: 'Recibe alertas proactivas, visualiza el impacto de tus decisiones, y alcanza tus metas financieras más rápido.',
                                icon: TrendingUp,
                                gradient: 'from-emerald-600 to-emerald-800',
                                iconBg: 'bg-emerald-100',
                                iconColor: 'text-emerald-600'
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 relative border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                <div className={`absolute -top-4 left-8 w-12 h-12 bg-gradient-to-br ${item.gradient} text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg`}>
                                    {item.step}
                                </div>
                                <div className={`w-16 h-16 ${item.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 mt-6`}>
                                    <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-center">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Estado de la Beta & Transparencia ── */}
            <section className="py-20 bg-slate-900 border-t border-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                </span>
                                <span className="text-xs font-bold tracking-widest uppercase">Transparencia de la Beta</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Qué puedes esperar hoy?</h2>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                Aliseus está en fase de <strong className="text-white">Socio Fundador</strong>. Esto significa que la plataforma base es 100% funcional y segura (cumplimos estrictamente con la GDPR y no vendemos tus datos), pero seguimos puliendo detalles basados en la retroalimentación de nuestros primeros usuarios.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Ya Disponible (100% Funcional)</h4>
                                        <p className="text-sm text-slate-400 mt-1">Dashboards, presupuestos por IA, despensa inteligente, creador de menús, importación CSV, y cálculos avanzados.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Próximamente</h4>
                                        <p className="text-sm text-slate-400 mt-1">Sincronización bancaria automática, conexión directa con supermercados, App Nativa iOS/Android y Seguridad Biométrica Avanzada.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative z-10">
                                <Shield className="w-10 h-10 text-cyan-400 mb-6" />
                                <h3 className="text-xl font-bold mb-3">Compromiso de Privacidad</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                    Tu información financiera y familiar es tuya. Usamos cifrado de grado bancario para proteger tus datos. Nunca venderemos tus hábitos de consumo o recetas a terceros. Puedes reclamar el borrado total de tus datos en cualquier momento.
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-700 text-xs font-bold text-slate-300">Cumplimiento GDPR</div>
                                    <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-700 text-xs font-bold text-slate-300">Sin Anuncios</div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/10 blur-3xl z-0 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Para quién es Aliseus (Segmentación) ── */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.audienceTitle}</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            {t.audienceSubtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {t.audienceProfiles.map((profile: any) => (
                            <div key={profile.id} className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:border-cyan-200 transition-all duration-300">
                                <div className="mb-6 flex items-center justify-between">
                                    {profile.id === 'pareja' || profile.id === 'couple' ? (
                                        <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center">
                                            <Heart className="w-6 h-6 text-cyan-600" />
                                        </div>
                                    ) : profile.id === 'familia' || profile.id === 'family' ? (
                                        <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-teal-600" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-slate-600" />
                                        </div>
                                    )}
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-cyan-500 transition-colors">
                                        {profile.tagline}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{profile.title}</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                                    {profile.desc}
                                </p>
                                <ul className="space-y-3">
                                    {profile.features.map((feat: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-xs text-gray-500">
                                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AI Magic Connection (The Moat) ── */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-teal-600/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Text Content */}
                        <div className="lg:w-1/2 text-left">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                                <Sparkles className="w-4 h-4" />
                                {t.magicTag}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                {t.magicTitle}
                            </h2>
                            <p className="text-xl text-cyan-200 font-light mb-8 italic">
                                "{t.magicSubtitle}"
                            </p>

                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-cyan-500 to-teal-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                                <p className="text-slate-300 text-lg leading-relaxed">
                                    {t.magicExample}
                                </p>
                            </div>

                            <ul className="mt-8 space-y-4">
                                {[
                                    { text: "1. Detecta comida a punto de caducar", icon: CheckCircle2 },
                                    { text: "2. Genera un menú semanal perfecto", icon: CheckCircle2 },
                                    { text: "3. Crea tu lista de la compra", icon: CheckCircle2 },
                                    { text: "4. Ajusta tu presupuesto al céntimo", icon: CheckCircle2 }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-400">
                                        <item.icon className="w-5 h-5 text-emerald-400" />
                                        <span className="font-medium text-white/80">{item.text}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Savings Widget */}
                            <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                                        <TrendingDown className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-cyan-300 font-black uppercase tracking-[0.2em] text-[10px] mb-1">
                                            {t.magicSavingsTitle}
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-white">{t.magicSavingsValue}</span>
                                        </div>
                                        <p className="text-slate-400 text-xs mt-1 font-medium italic">
                                            {t.magicSavingsDetail}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="lg:w-1/2 w-full">
                            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-sm">
                                {/* Flow Illustration */}
                                <div className="flex flex-col gap-4 relative">

                                    {/* Connection Line */}
                                    <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-red-500 via-cyan-500 to-teal-500 opacity-30 z-0"></div>

                                    {/* Fridge Item */}
                                    <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-red-500/30 rounded-2xl relative z-10 shadow-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                                <Archive className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">Salmón Fresco</p>
                                                <p className="text-red-400 text-xs">Cadució próxima detectada</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full animate-pulse border border-red-500/30">Alerta 3 días</span>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex justify-center -my-3 relative z-20">
                                        <div className="w-8 h-8 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center shadow-lg">
                                            <ArrowRight className="w-4 h-4 text-cyan-400 rotate-90" />
                                        </div>
                                    </div>

                                    {/* AI Magic */}
                                    <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-cyan-500/30 rounded-2xl relative overflow-hidden group z-10 shadow-lg shadow-cyan-900/40">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">Receta: Salmón al Horno</p>
                                                <p className="text-cyan-400 text-xs">Generado por IA para 4 personas</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]">Optimizando</span>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex justify-center -my-3 relative z-20">
                                        <div className="w-8 h-8 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center shadow-lg">
                                            <ArrowRight className="w-4 h-4 text-teal-400 rotate-90" />
                                        </div>
                                    </div>

                                    {/* Budget / Savings */}
                                    <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-teal-500/30 rounded-2xl z-10 shadow-lg shadow-teal-900/40">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                                                <PiggyBank className="w-5 h-5 text-teal-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">Presupuesto Actualizado</p>
                                                <p className="text-teal-400 text-xs">Alineado con Lista de Compra</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-bold text-lg">12€</p>
                                            <p className="text-emerald-500/70 text-[10px] uppercase font-bold tracking-wider">Ahorro Estimado</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Module Pillars ── */}
            <section id="features" className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{t.pillarsTitle}</h2>
                        <p className="text-lg text-gray-500">{t.pillarsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                        {/* Finance Card */}
                        <button onClick={() => onNavigate('FINANCE')} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all group relative overflow-hidden flex flex-col justify-between text-left h-[560px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-900 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                                    <PiggyBank className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Módulo Finanzas</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-6">{PRODUCT_DETAILS_BY_LANG[language].finance.description}</p>
                                <ul className="space-y-2 mb-6">
                                    {[
                                        { icon: Target, text: 'Metas de ahorro con progreso visual' },
                                        { icon: CreditCard, text: 'Eliminación de deudas estratégica' },
                                        { icon: BarChart3, text: 'Análisis predictivo con IA' },
                                        { icon: TrendingUp, text: 'Simulador de jubilación e inversiones' },
                                        { icon: Calendar, text: 'Importación CSV y categorización IA' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <item.icon className="w-4 h-4 text-cyan-600" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                                {/* Star Benefit callout */}
                                <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3">
                                    <div className="flex-shrink-0 mt-0.5 w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center shadow-sm">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-black text-amber-500 tracking-[0.2em] uppercase mb-0.5">{t.heroStarBadge}</span>
                                        <span className="text-xs font-semibold text-amber-900 leading-snug">{t.heroStarBenefit}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 font-bold text-cyan-600 flex items-center gap-2">Explorar Detalles <ArrowRight className="w-4 h-4" /></div>
                        </button>

                        {/* Life Card */}
                        <button onClick={() => onNavigate('LIFE')} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all group relative overflow-hidden flex flex-col justify-between text-left h-[560px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl shadow-teal-500/30 group-hover:scale-110 transition-transform">
                                    <Heart className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Módulo Vida</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-6">{PRODUCT_DETAILS_BY_LANG[language].vida.description}</p>
                                <ul className="space-y-2">
                                    {[
                                        { icon: Utensils, text: 'Planificador IA de menús semanales' },
                                        { icon: ShoppingCart, text: 'Listas de compra y despensa automáticas' },
                                        { icon: Archive, text: 'Bóveda segura de documentos' },
                                        { icon: Globe, text: 'Planificador de viajes con IA' },
                                        { icon: Calendar, text: 'Calendario familiar integrado' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <item.icon className="w-4 h-4 text-teal-600" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative z-10 font-bold text-teal-600 flex items-center gap-2">Explorar Detalles <ArrowRight className="w-4 h-4" /></div>
                        </button>
                    </div>

                    {/* Aura — full-width dashboard card */}
                    <div className="max-w-5xl mx-auto mt-8">
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 md:p-14 overflow-hidden border border-white/10 shadow-2xl">
                            {/* Ambient glow */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-600/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row gap-12">
                                {/* Left: name + description */}
                                <div className="md:w-1/2">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-700 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-cyan-500/30">
                                        <LayoutDashboard className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
                                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">Dashboard Central</span>
                                    </div>
                                    <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">{PRODUCT_DETAILS_BY_LANG[language].dashboard.title}</h3>
                                    <p className="text-cyan-300 font-medium mb-6 text-lg italic">{PRODUCT_DETAILS_BY_LANG[language].dashboard.subtitle}</p>
                                    <p className="text-slate-300 text-lg leading-relaxed">{PRODUCT_DETAILS_BY_LANG[language].dashboard.description}</p>
                                    
                                    <div className="mt-8 relative h-[250px] sm:h-[300px] w-full max-w-md mx-auto md:mx-0 group">
                                        {/* Back Image (Finance) */}
                                        <div className="absolute top-0 right-0 w-[85%] rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform translate-x-2 -translate-y-2 group-hover:translate-x-6 group-hover:-translate-y-6 transition-all duration-500 z-10 opacity-70 group-hover:opacity-100">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-teal-500 z-20"></div>
                                            <img src="/finance-preview.png" alt="Aura Finance Preview" className="w-full h-auto object-cover" />
                                        </div>

                                        {/* Front Image (Kitchen) */}
                                        <div className="absolute bottom-0 left-0 w-[90%] rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform group-hover:scale-[1.02] transition-transform duration-500 z-20">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500 z-20"></div>
                                            <img src="/kitchen-preview.png" alt="Aura Kitchen Preview" className="w-full h-auto object-cover" />
                                            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md p-2 sm:p-3 rounded-xl border border-white/10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-bold text-[11px] sm:text-xs">Aura Widgets</p>
                                                    <p className="text-cyan-400 text-[9px] sm:text-[10px]">Módulos Conectados</p>
                                                </div>
                                                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {PRODUCT_DETAILS_BY_LANG[language].dashboard.integrations.map((tag: string, i: number) => (
                                            <span key={i} className="bg-white/10 border border-white/20 text-white/70 text-xs font-bold px-3 py-1.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: features */}
                                <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {PRODUCT_DETAILS_BY_LANG[language].dashboard.features.map((f: { title: string; desc: string }, i: number) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                                            <p className="text-white font-bold text-sm mb-1">{f.title}</p>
                                            <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Comparison Table ── */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por Qué Aliseus?</h2>
                        <p className="text-lg text-gray-500">Comparación con métodos tradicionales y otras aplicaciones</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Característica</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-500">Manual<br />(Excel)</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-500">Otras Apps</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-cyan-600 bg-cyan-50">Aliseus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {comparisonFeatures.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.feature}</td>
                                            <td className="px-6 py-4 text-center">
                                                {item.manual ? (
                                                    <><CheckCircle2 className="w-5 h-5 text-gray-400 mx-auto" /><span className="sr-only">Sí</span></>
                                                ) : (
                                                    <><X className="w-5 h-5 text-gray-300 mx-auto" /><span className="sr-only">No</span></>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.other ? (
                                                    <><CheckCircle2 className="w-5 h-5 text-gray-400 mx-auto" /><span className="sr-only">Sí</span></>
                                                ) : (
                                                    <><X className="w-5 h-5 text-gray-300 mx-auto" /><span className="sr-only">No</span></>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center bg-cyan-50/50">
                                                {item.aliseus && (
                                                    <><CheckCircle2 className="w-5 h-5 text-cyan-600 mx-auto" /><span className="sr-only">Sí</span></>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Benefits Grid ── */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">{t.benefitsTitle}</h2>
                        <p className="text-lg text-gray-500">{t.benefitsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: ShieldCheck, title: "Cifrado AES-256", desc: "Tus datos están protegidos con encriptación de nivel bancario, la más segura del mundo hoy." },
                            { icon: Lock, title: "Privacidad Absoluta", desc: "Tus datos financieros son solo tuyos. No vendemos información ni mostramos anuncios." },
                            { icon: BarChart3, title: "IA Proactiva", desc: "Presupuestos IA, análisis predictivo, categorización automática y simulador de jubilación." },
                            { icon: Monitor, title: "Experiencia Web Pro", desc: "Una interfaz fluida y rápida optimizada para el uso diario desde tu ordenador o tablet." },
                            { icon: Users, title: "Modo Colaborativo", desc: "Hasta 5 miembros familiares con roles y permisos personalizables." },
                            { icon: Archive, title: "Bóveda Digital", desc: "Tus contratos, pasaportes y pólizas, protegidos con encriptación bancaria y siempre a mano." },
                            { icon: Globe, title: "Multilingüe", desc: "Disponible en Español, English y Français. Centro de Ayuda en 3 idiomas." },
                            { icon: FileUp, title: "Importación Flexible", desc: "Importa extractos bancarios CSV con vinculación automática a tus cuentas de forma segura." }
                        ].map((benefit, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:-translate-y-1 transition-all group">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-50 to-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:from-cyan-100 group-hover:to-teal-200 transition-all">
                                    <benefit.icon className="w-6 h-6 text-cyan-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
                        <p className="text-lg text-gray-500">Todo lo que necesitas saber sobre Aliseus</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-900 pr-4">{faq.q}</span>
                                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-cyan-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed animate-fade-in border-t border-gray-100 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-8">
                        <Shield className="w-4 h-4" />
                        Acceso Beta Limitado
                    </div>
                    <h2 className="text-4xl font-bold mb-4 tracking-tight text-gray-900">{t.pricingTitle}</h2>
                    <p className="text-gray-500 text-lg max-w-3xl mx-auto mb-12 font-medium">{t.pricingSubtitle}</p>

                    {/* Ethical Pricing Mission Block */}
                    <div className="max-w-4xl mx-auto mb-16 p-8 rounded-3xl bg-emerald-50 border border-emerald-100 text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-200/30 transition-all duration-700"></div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                                <Heart className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-emerald-900 mb-2">{t.pricingMissionTitle}</h4>
                                <p className="text-emerald-800/80 text-sm leading-relaxed tracking-tight underline-offset-4 decoration-emerald-200">
                                    {t.pricingMissionDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`text-sm font-bold ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>{t.billingMonthly}</span>
                        <button
                            onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                            className="w-14 h-8 bg-cyan-600 rounded-full p-1 relative transition-colors duration-300"
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${billingPeriod === 'annual' ? 'translate-x-6' : ''}`} />
                        </button>
                        <span className={`text-sm font-bold ${billingPeriod === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                            {t.billingAnnual} <span className="text-emerald-500 text-xs ml-1">({t.savePercent})</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* TIER 2: PERSONAL */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all flex flex-col text-left group relative">
                            {billingPeriod === 'annual' && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl uppercase tracking-[0.1em] shadow-lg shadow-emerald-500/20">
                                    {t.pricingFairPrice}
                                </div>
                            )}
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-6 w-fit tracking-wider">{t.personalPlan}</span>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-5xl font-bold text-gray-900">
                                    {billingPeriod === 'monthly' ? t.personalPriceMonthly : t.personalPriceAnnual}
                                </h3>
                                <span className="text-gray-400 font-bold text-xs">
                                    {billingPeriod === 'monthly' ? t.perMonth : t.perYear}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-8">{t.personalDesc}</p>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featUser1}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featAccess}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featVault}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-gray-900" /><span className="text-gray-700">{t.featJunior}</span></div>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all">{t.personalCta}</button>
                        </div>

                        {/* TIER 3: FAMILY — cyan premium */}
                        <div className="bg-gradient-to-br from-cyan-900 to-teal-950 text-white rounded-3xl p-8 shadow-xl shadow-cyan-500/20 flex flex-col text-left relative z-10 transition-all hover:scale-[1.02]">
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30">BEST VALUE</div>
                            <span className="bg-white/10 text-white/80 text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-6 w-fit tracking-wider border border-white/20">{t.familyPlan}</span>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-5xl font-bold">
                                    {billingPeriod === 'monthly' ? t.familyPriceMonthly : t.familyPriceAnnual}
                                </h3>
                                <span className="text-cyan-300 font-bold text-xs">
                                    {billingPeriod === 'monthly' ? t.perMonth : t.perYear}
                                </span>
                            </div>
                            <p className="text-cyan-300 text-sm mb-8">{t.familyDesc}</p>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span className="font-bold">{t.featUser5}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.featShared}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.featJunior}</span></div>
                                <div className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /><span>{t.featPriority}</span></div>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 rounded-2xl bg-white text-cyan-900 font-bold hover:bg-cyan-50 transition-all shadow-lg">{t.familyCta}</button>
                            {billingPeriod === 'annual' && (
                                <p className="text-[10px] text-cyan-400 text-center mt-4 uppercase tracking-widest font-bold">{t.singlePayment}</p>
                            )}
                        </div>
                    </div>

                    {/* Savings vs Cost connection */}
                    <div className="mt-20 max-w-3xl mx-auto">
                        <div className="p-1 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-12"></div>
                        <p className="text-xl font-medium text-gray-900 mb-4 italic leading-relaxed">
                            "{t.pricingSavingsConnection}"
                        </p>
                        <div className="flex flex-col items-center gap-4 mt-12 pt-12 border-t border-gray-100">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pagos Seguros Procesados por Stripe</p>
                            <PaymentMethods className="scale-110 opacity-80" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 bg-gradient-to-br from-slate-950 via-cyan-950 to-teal-950 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-cyan-600/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/3 w-[400px] h-[300px] bg-teal-600/20 rounded-full blur-[80px]" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para transformar tu vida financiera?</h2>
                    <p className="text-cyan-200 max-w-2xl mx-auto mb-10 text-lg">
                        Únete a la plataforma que conecta tus finanzas con tu vida real.
                    </p>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-cyan-400 hover:to-teal-500 transition-all shadow-xl shadow-cyan-500/30 hover:-translate-y-1 inline-flex items-center gap-3"
                    >
                        {t.ctaStart} <ArrowRight className="w-6 h-6" />
                    </button>
                    <p className="text-sm text-white/40 mt-6 font-medium">Acceso gratuito en fase Socio Fundador • Sin pagos iniciales</p>
                </div>
            </section>
        </div>
    );
};
