import React from 'react';
import {
    Heart, Utensils, Plane, Archive, ArrowRight, ChefHat, ShoppingCart,
    Calendar, Clock, Leaf, DollarSign, Users, BookOpen, AlertTriangle,
    CheckCircle2, Zap, Sparkles, Package, Apple, Coffee
} from 'lucide-react';
import { Language } from '@/types';

interface LandingLifeProps {
    t: any;
    language: Language;
    setShowLoginModal: (show: boolean) => void;
}

export const LandingLife: React.FC<LandingLifeProps> = ({ setShowLoginModal }) => {
    const kitchenFeatures = [
        { icon: Sparkles, title: 'Planificador IA de Menús', desc: 'Genera menús semanales completos basados en tus preferencias, restricciones dietéticas y presupuesto. En segundos.' },
        { icon: BookOpen, title: 'Biblioteca de Recetas', desc: 'Miles de recetas con búsqueda avanzada por ingredientes, tiempo de preparación, dificultad y tipo de cocina.' },
        { icon: Package, title: 'Inventario de Despensa', desc: 'Registra lo que tienes en casa. Aliseus te sugiere recetas basadas en ingredientes disponibles para reducir desperdicio.' },
        { icon: ShoppingCart, title: 'Lista de Compra Automática', desc: 'Añade una receta al menú y los ingredientes que no tienes se agregan automáticamente a tu lista de compra.' },
        { icon: AlertTriangle, title: 'Alertas de Caducidad', desc: 'Notificaciones cuando los productos están próximos a caducar. Sugerencias de recetas para aprovecharlos.' },
        { icon: Apple, title: 'Información Nutricional', desc: 'Calorías, macros y micronutrientes calculados automáticamente para cada receta y comida del día.' },
        { icon: Clock, title: 'Programación de Meal Prep', desc: 'Organiza sesiones de preparación de comidas. Optimiza tu tiempo cocinando en lotes para toda la semana.' },
        { icon: Users, title: 'Preferencias Familiares', desc: 'Gestiona alergias, intolerancias y preferencias de cada miembro de la familia. Menús personalizados para todos.' },
        { icon: DollarSign, title: 'Coste por Comida', desc: 'Calcula el precio real de cada receta basándose en ingredientes. Optimiza tu presupuesto de alimentación.' },
        { icon: Leaf, title: 'Gestión de Sobras', desc: 'Registra sobras y recibe sugerencias creativas para reutilizarlas. Reduce el desperdicio de comida hasta un 40%.' }
    ];

    const lifeFeatures = [
        { icon: Plane, title: 'Planificador de Viajes Integrado', desc: 'Busca vuelos en tiempo real. Crea itinerarios detallados por día, establece presupuestos compartidos y guarda billetes y reservas.' },
        { icon: Archive, title: 'Bóveda Digital Segura', desc: 'Almacena pasaportes, seguros, contratos y documentos importantes con encriptación de grado militar. Acceso biométrico desde cualquier dispositivo cuando más lo necesitas.' },
        { icon: Calendar, title: 'Calendario Familiar', desc: 'Sincroniza eventos escolares, citas médicas y reuniones. Evita solapamientos y mantén a todos los miembros de la casa en la misma página automáticamente.' },
        { icon: Coffee, title: 'Inventario del Hogar', desc: 'Registra electrodomésticos, garantías y fechas de mantenimiento. Recibe alertas antes de que expire una garantía importante o toque revisión.' }
    ];

    const useCases = [
        {
            title: 'Eliminar el Estrés de "¿Qué Comemos Hoy?"',
            scenario: 'Ana pasaba 30 minutos diarios decidiendo qué cocinar, a menudo recurriendo a comida rápida por falta de planificación.',
            solution: 'Con el planificador IA de Aliseus, genera menús semanales en 2 minutos cada domingo. La lista de compra se crea automáticamente.',
            result: 'Ahorra 3.5 horas semanales, redujo gastos en comida rápida en €200/mes y come más saludable.',
            savings: '€200/mes',
            time: '3.5h/semana'
        },
        {
            title: 'Reducir Desperdicio de Comida en 40%',
            scenario: 'La familia Martínez tiraba €120/mes en comida caducada o sobras olvidadas en el frigorífico.',
            solution: 'Aliseus les alertó de productos próximos a caducar y sugirió recetas para aprovecharlos. El sistema de sobras les ayudó a reutilizar todo.',
            result: 'Redujeron el desperdicio de €120 a €70 mensuales. Ahorro anual de €600 y menor impacto ambiental.',
            savings: '€600/año',
            time: '40% menos desperdicio'
        },
        {
            title: 'Planificar Viaje Europeo de 2 Semanas',
            scenario: 'Pedro quería visitar 5 ciudades europeas pero la planificación era abrumadora: vuelos, hoteles, itinerarios, documentos.',
            solution: 'Con la búsqueda de vuelos reales en Aliseus, planificó todas las rutas sin salir de la app. El sistema centralizó sus reservas, itinerarios y calculó el presupuesto previsto.',
            result: 'Planificó el viaje completo en 4 horas vs. 2 semanas de investigación. Viaje sin estrés con todo organizado.',
            savings: 'Sin estrés',
            time: '4 horas de planificación'
        }
    ];

    return (
        <div className="animate-fade-in">
            {/* ── Hero Section — Dark Premium ── */}
            <section className="relative pt-32 pb-28 px-6 overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
                {/* Ambient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl mb-6 shadow-inner backdrop-blur-sm">
                        <Heart className="w-12 h-12 text-purple-400" />
                    </div>

                    <h1 className="flex justify-center items-end gap-3 mb-6">
                        <img src="/logo-aliseus.png" alt="Aliseus" className="h-24 md:h-32 lg:h-36 object-contain" />
                        <span className="text-3xl md:text-5xl font-light text-purple-200 mb-2 md:mb-4">Vida</span>
                    </h1>

                    <p className="text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed mb-4 font-light">
                        Automatiza tu hogar y diseña experiencias memorables
                    </p>
                    <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">
                        Porque la vida es para vivirla, no para gestionarla. Aliseus se encarga de la logística para que tú disfrutes de los momentos.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 max-w-5xl mx-auto">
                    {[
                        { value: '14+', label: 'Características' },
                        { value: '40%', label: 'Menos Desperdicio' },
                        { value: '3.5h', label: 'Ahorradas/Semana' },
                        { value: 'IA', label: 'Planificación Inteligente' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-3xl font-black text-purple-600 mb-1">{stat.value}</div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Kitchen Intelligence Section */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                            <ChefHat className="w-4 h-4" />
                            Cocina Inteligente
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Del caos culinario a la organización total</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Planificación de menús con IA, gestión de despensa, listas automáticas y mucho más.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kitchenFeatures.map((feature, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-purple-100 transition-all group">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                    <feature.icon className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Life Management Section */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                            <Plane className="w-4 h-4" />
                            Gestión de Vida
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Organiza todo lo que importa</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Viajes, documentos importantes, calendario familiar y más. Todo centralizado y seguro.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {lifeFeatures.map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all group">
                                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                                    <feature.icon className="w-7 h-7 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button onClick={() => setShowLoginModal(true)} className="bg-white text-orange-600 border-2 border-orange-100 hover:border-orange-200 px-8 py-4 rounded-2xl font-bold text-lg hover:-translate-y-1 transition-all shadow-sm inline-flex items-center gap-2">
                            Simplificar mi Día a Día <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Use Cases Section */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Historias de Transformación</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Descubre cómo Aliseus ha simplificado la rutina diaria de personas como tú.
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
                                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Situación</span>
                                                </div>
                                                <p className="text-gray-600">{useCase.scenario}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap className="w-4 h-4 text-purple-500" />
                                                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Solución Aliseus</span>
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
                                            <div className="text-xs text-gray-500 font-bold uppercase">Beneficio</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-purple-100 text-center shadow-sm">
                                            <div className="text-2xl font-black text-purple-600 mb-1">{useCase.time}</div>
                                            <div className="text-xs text-gray-500 font-bold uppercase">Impacto</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:-translate-y-1 transition-all shadow-xl shadow-cyan-500/20 inline-flex items-center gap-2">
                            Quiero Más Tiempo Libre <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Workflow Visualization */}
                <div className="mb-24 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-[3rem] p-12 border border-cyan-100">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">De Nevera Vacía a Menú Completo en 3 Clics</h2>
                        <p className="text-lg text-gray-600">El flujo de trabajo más simple que hayas visto</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { step: '1', title: 'Genera Menú con IA', desc: 'Dile a Aliseus tus preferencias: "Menú saludable para 4 personas, presupuesto €80"', icon: Sparkles },
                            { step: '2', title: 'Revisa y Ajusta', desc: 'Aliseus genera 7 días de comidas. Arrastra y suelta para personalizar a tu gusto.', icon: Calendar },
                            { step: '3', title: 'Lista Automática', desc: 'Todos los ingredientes que no tienes en despensa se añaden a tu lista de compra.', icon: ShoppingCart }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 text-center relative">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                                    {item.step}
                                </div>
                                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-4">
                                    <item.icon className="w-8 h-8 text-cyan-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-br from-cyan-800 to-teal-900 text-white rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-cyan-500/20">
                    <div className="absolute top-0 left-1/4 w-[300px] h-[200px] bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-teal-500/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Diseña la vida que quieres vivir</h2>
                        <p className="text-cyan-200 max-w-2xl mx-auto mb-10 text-lg">
                            Aliseus se encarga del caos logístico para que tú disfrutes de los momentos que realmente importan.
                        </p>
                        <button onClick={() => setShowLoginModal(true)} className="bg-white text-cyan-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-cyan-50 hover:-translate-y-1 transition-all shadow-xl inline-flex items-center gap-3">
                            Empezar 14 días gratis <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-sm text-cyan-300 mt-6">Después, desde 2,99€/mes • Cancela cuando quieras</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
