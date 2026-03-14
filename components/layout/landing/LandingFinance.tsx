import React from 'react';
import {
    PiggyBank, TrendingUp, Shield, ArrowRight, Target, CreditCard,
    BarChart3, Wallet, Calculator, TrendingDown, Lock, Sparkles,
    PieChart, Receipt, Calendar, AlertCircle, CheckCircle2, Zap
} from 'lucide-react';
import { Language } from '@/types';

interface LandingFinanceProps {
    t: any;
    language: Language;
    setShowLoginModal: (show: boolean) => void;
}

export const LandingFinance: React.FC<LandingFinanceProps> = ({ setShowLoginModal }) => {
    const features = [
        { icon: Wallet, title: 'Gestión Multi-Cuenta', desc: 'Visualiza todas tus cuentas bancarias, tarjetas e inversiones en un solo lugar. Importación inteligente CSV con categorización automática, sin vincular bancos.' },
        { icon: Receipt, title: 'Transacciones Inteligentes', desc: 'Categorización automática con IA. Detecta suscripciones recurrentes y patrones de gasto para alertarte de anomalías.' },
        { icon: PieChart, title: 'Presupuestos Flexibles', desc: 'Crea presupuestos por categoría, porcentaje de ingresos o cantidad fija. Alertas en tiempo real cuando te acercas al límite.' },
        { icon: Target, title: 'Metas de Ahorro', desc: 'Define objetivos financieros con fechas límite. Visualiza tu progreso y recibe sugerencias de ahorro automáticas.' },
        { icon: CreditCard, title: 'Eliminación de Deudas', desc: 'Estrategias Bola de Nieve y Avalancha. Calcula cuánto ahorrarás en intereses y cuándo estarás libre de deudas.' },
        { icon: TrendingUp, title: 'Seguimiento de Inversiones', desc: 'Monitorea tu cartera de inversiones. Calcula rendimientos, dividendos y evolución del patrimonio neto.' },
        { icon: BarChart3, title: 'Análisis Predictivo', desc: 'Proyecciones de flujo de caja detalladas a 1, 3, 6 y 12 meses. Único en el mercado para anticipar problemas de liquidez antes de que ocurran.' },
        { icon: Sparkles, title: 'Asesor Financiero IA (Gemini Pro)', desc: 'Análisis inteligente potenciado por Google Gemini Pro con recomendaciones personalizadas para optimizar gastos y aumentar ahorros.' },
        { icon: Calculator, title: 'Calculadoras Avanzadas', desc: 'Simulador de hipotecas, interés compuesto, jubilación y más. Toma decisiones informadas con datos precisos.' },
        { icon: Lock, title: 'Seguridad Bancaria', desc: 'Encriptación de extremo a extremo. Tus datos financieros están protegidos con los mismos estándares que usan los bancos.' },
        { icon: Calendar, title: 'Transacciones Recurrentes', desc: 'Programa ingresos y gastos automáticos. Aliseus los registra por ti sin intervención manual.' },
        { icon: TrendingDown, title: 'Alertas Inteligentes', desc: 'Notificaciones de gastos inusuales, vencimientos de facturas, oportunidades de ahorro y más.' }
    ];

    const useCases = [
        {
            title: 'Eliminar €15,000 en Deudas de Tarjeta',
            scenario: 'María tenía 3 tarjetas de crédito con un total de €15,000 en deuda al 18% de interés.',
            solution: 'Con la estrategia Avalancha de Aliseus, priorizó la tarjeta con mayor interés mientras pagaba el mínimo en las otras.',
            result: 'Pagó toda su deuda en 24 meses y ahorró €2,400 en intereses comparado con pagos mínimos.',
            savings: '€2,400 ahorrados',
            time: '24 meses'
        },
        {
            title: 'Ahorrar para Entrada de Piso',
            scenario: 'Carlos necesitaba €40,000 para la entrada de su primera vivienda en 3 años.',
            solution: 'Aliseus analizó sus gastos, identificó €450/mes en suscripciones innecesarias y creó un plan de ahorro automático.',
            result: 'Alcanzó su meta 6 meses antes de lo previsto gracias a la optimización de gastos y ahorro disciplinado.',
            savings: '€40,000 ahorrados',
            time: '30 meses'
        },
        {
            title: 'Gestionar Múltiples Fuentes de Ingresos',
            scenario: 'Laura es freelance con ingresos variables de 5 clientes diferentes más ingresos pasivos de inversiones.',
            solution: 'Aliseus centraliza todos sus ingresos, calcula impuestos estimados y crea presupuestos adaptativos basados en ingresos reales.',
            result: 'Redujo el estrés financiero, nunca más se quedó sin liquidez y aumentó su tasa de ahorro del 15% al 28%.',
            savings: '+13% ahorro',
            time: 'Mensual'
        }
    ];

    return (
        <div className="animate-fade-in">
            {/* ── Hero Section — Dark Premium ── */}
            <section className="relative pt-32 pb-28 px-6 overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-teal-950">
                {/* Ambient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl mb-6 shadow-inner backdrop-blur-sm">
                        <PiggyBank className="w-12 h-12 text-cyan-400" />
                    </div>

                    <h1 className="flex justify-center items-end gap-3 mb-6">
                        <img src="/logo-aliseus.png" alt="Aliseus" className="h-24 md:h-32 lg:h-36 object-contain" />
                        <span className="text-3xl md:text-5xl font-light text-cyan-200 mb-2 md:mb-4">Finanzas</span>
                    </h1>

                    <p className="text-2xl text-cyan-100 max-w-4xl mx-auto leading-relaxed mb-4 font-light">
                        El sistema operativo financiero personal más avanzado
                    </p>
                    <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">
                        Deja de rastrear gastos manualmente. Empieza a construir patrimonio real con decisiones inteligentes basadas en datos.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 max-w-5xl mx-auto">
                    {[
                        { value: '12+', label: 'Características Principales' },
                        { value: '100%', label: 'Seguridad Bancaria' },
                        { value: 'Tiempo Real', label: 'Sincronización' },
                        { value: 'IA Integrada', label: 'Análisis Inteligente' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-3xl font-black text-cyan-600 mb-1">{stat.value}</div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Comprehensive Features Grid */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitas para dominar tus finanzas</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Desde el control básico de gastos hasta estrategias avanzadas de inversión y eliminación de deudas.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all group">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                                    <feature.icon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button onClick={() => setShowLoginModal(true)} className="bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-200 px-8 py-4 rounded-2xl font-bold text-lg hover:-translate-y-1 transition-all shadow-sm inline-flex items-center gap-2">
                            Empieza a Controlar tu Dinero <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Use Cases Section */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Casos de Éxito Reales</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Descubre cómo personas como tú han transformado sus finanzas con Aliseus.
                        </p>
                    </div>
                    <div className="space-y-8">
                        {useCases.map((useCase, i) => (
                            <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{useCase.title}</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Situación</span>
                                                </div>
                                                <p className="text-gray-600">{useCase.scenario}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Solución Aliseus</span>
                                                </div>
                                                <p className="text-gray-600">{useCase.solution}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resultado</span>
                                                </div>
                                                <p className="text-gray-600">{useCase.result}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:w-48 flex lg:flex-col gap-4 lg:gap-6 justify-center lg:justify-start">
                                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 text-center shadow-sm">
                                            <div className="text-2xl font-black text-emerald-600 mb-1">{useCase.savings}</div>
                                            <div className="text-xs text-gray-500 font-bold uppercase">Impacto</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-blue-100 text-center shadow-sm">
                                            <div className="text-2xl font-black text-blue-600 mb-1">{useCase.time}</div>
                                            <div className="text-xs text-gray-500 font-bold uppercase">Plazo</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:-translate-y-1 transition-all shadow-xl shadow-cyan-500/20 inline-flex items-center gap-2">
                            Quiero Lograr mis Metas <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Deep Dive Features */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Características en Profundidad</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Smart Budgeting */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold">Presupuestos Inteligentes</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Crea presupuestos que se adaptan a tu realidad financiera. No más límites rígidos que nunca cumples.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700"><strong>Basados en porcentaje:</strong> Asigna el 30% de tus ingresos a vivienda automáticamente</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700"><strong>Cantidad fija:</strong> €500/mes para alimentación, sin importar tus ingresos</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700"><strong>Alertas proactivas:</strong> Notificación cuando alcances el 80% del límite</span>
                                </li>
                            </ul>
                        </div>

                        {/* Debt Payoff */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                                    <TrendingDown className="w-6 h-6 text-rose-600" />
                                </div>
                                <h3 className="text-2xl font-bold">Calculadora de Deudas</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Visualiza exactamente cuándo estarás libre de deudas y cuánto ahorrarás en intereses.
                            </p>
                            <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-6 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-gray-700">Estrategia Avalancha</span>
                                    <span className="text-xs bg-white px-2 py-1 rounded-full font-bold text-rose-600">Recomendado</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tiempo hasta libertad:</span>
                                        <span className="font-bold text-gray-900">28 meses</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ahorro en intereses:</span>
                                        <span className="font-bold text-emerald-600">€3,240</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic">
                                *Comparado con pagos mínimos durante 7 años
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-br from-cyan-800 to-teal-900 text-white rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-cyan-500/20">
                    <div className="absolute top-0 left-1/4 w-[300px] h-[200px] bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-teal-500/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Toma el control de tu futuro financiero hoy</h2>
                        <p className="text-cyan-200 max-w-2xl mx-auto mb-10 text-lg">
                            Únete a quienes han pasado del caos financiero a la claridad total con Aliseus.
                        </p>
                        <button onClick={() => setShowLoginModal(true)} className="bg-white text-cyan-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-cyan-50 hover:-translate-y-1 transition-all shadow-xl inline-flex items-center gap-3">
                            Comenzar Gratis <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-sm text-cyan-300 mt-6">Prueba 14 días gratis • Después, desde 2,99€/mes • Cancela cuando quieras</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
