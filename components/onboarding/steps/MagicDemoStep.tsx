import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChefHat, ShoppingCart, TrendingDown } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useCurrency } from '../../../hooks/useCurrency';

export const MagicDemoStep: React.FC = () => {
    const { setOnboardingStep } = useUserStore();
    const { formatPrice } = useCurrency();
    const [demoState, setDemoState] = useState(0);

    // Auto-advance the demo every 3 seconds for a smooth 9-second experience
    useEffect(() => {
        if (demoState < 3) {
            const timer = setTimeout(() => {
                setDemoState(prev => prev + 1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [demoState]);

    const handleNext = () => {
        setOnboardingStep(2); // Go to Profile Selection
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative overflow-hidden"
            >
                {/* Background ambient glow matching Aliseus cyan/teal brand */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent mb-4">
                        La magia de Aliseus
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto h-12">
                        {demoState === 0 && "Conectamos todo tu hogar. Empezando por la nevera."}
                        {demoState === 1 && "Nuestra IA crea menús perfectos para no desperdiciar nada."}
                        {demoState === 2 && "Genera listas exactas y actualiza tu presupuesto al instante."}
                        {demoState === 3 && "Tu vida, sincronizada y optimizada automáticamente."}
                    </p>

                    <div className="relative h-64 flex items-center justify-center mb-8">
                        <AnimatePresence mode="wait">
                            {demoState === 0 && (
                                <motion.div
                                    key="fridge"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 flex flex-col items-center gap-4 w-full max-w-sm"
                                >
                                    <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
                                        <ChefHat className="w-8 h-8" />
                                    </div>
                                    <div className="text-left w-full">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Despensa detecta:</p>
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 border-l-2 border-red-400 pl-3">
                                            <span>Salmón y Leche</span>
                                            <span className="text-red-500 font-medium">Caducan mñn</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {demoState === 1 && (
                                <motion.div
                                    key="ai"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-cyan-100 dark:border-cyan-900/30 flex flex-col items-center gap-4 w-full max-w-sm"
                                >
                                    <div className="p-3 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-full relative">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 border-2 border-cyan-400 rounded-full border-t-transparent" />
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <div className="text-left w-full">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">IA Optimizando...</p>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            ✨ Receta sugerida:<br />
                                            <span className="font-medium text-cyan-600 dark:text-cyan-400">Salmón al horno con crema</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {demoState >= 2 && (
                                <motion.div
                                    key="finish"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-900/30 flex flex-col gap-4 w-full max-w-sm"
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <ShoppingCart className="w-6 h-6 text-emerald-500 mb-2" />
                                            <span className="text-xs text-center text-gray-500">Lista exacta<br />creada</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-white rounded-bl-lg">
                                                <TrendingDown className="w-3 h-3" />
                                            </div>
                                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(12, 0)}</span>
                                            <span className="text-xs text-center text-emerald-700 dark:text-emerald-300 font-medium">Ahorro hoy</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-center gap-2 mb-8">
                        {[0, 1, 2].map((dot) => (
                            <div
                                key={dot}
                                onClick={() => setDemoState(dot)}
                                className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${demoState >= dot ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-300 dark:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center w-full mt-4">
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                        >
                            Saltar demo
                        </button>

                        <button
                            onClick={handleNext}
                            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${demoState === 3
                                ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:scale-105'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                                }`}
                            disabled={demoState < 3}
                        >
                            Empezar <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
