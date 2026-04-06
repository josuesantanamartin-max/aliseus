import React from 'react';
import { Sparkles, User, ShieldCheck } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const WelcomeStep: React.FC = () => {
    const { setOnboardingStep } = useUserStore();

    return (
        <div className="flex flex-col items-center text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg mb-8">
                <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                Bienvenido a tu nueva<br />libertad financiera
            </h2>

            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mb-10">
                Aliseus es más que una hoja de cálculo. Es un sistema inteligente diseñado para adaptarse a tu vida, tus metas y tu estilo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mb-10">
                <div className="p-4 bg-gray-50 dark:bg-aliseus-800 rounded-xl border border-gray-100 dark:border-aliseus-700">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 mx-auto text-blue-600 dark:text-blue-400">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">100% Privado</h3>
                    <p className="text-xs text-gray-500">Tus datos nunca salen de tu dispositivo local.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-aliseus-800 rounded-xl border border-gray-100 dark:border-aliseus-700">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 mx-auto text-purple-600 dark:text-purple-400">
                        <User className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Personalizado</h3>
                    <p className="text-xs text-gray-500">Se adapta a si eres estudiante, familia o pro.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-aliseus-800 rounded-xl border border-gray-100 dark:border-aliseus-700">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 mx-auto text-green-600 dark:text-green-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Automatizado</h3>
                    <p className="text-xs text-gray-500">Reglas inteligentes para ordenar tus gastos.</p>
                </div>
            </div>

            <button
                onClick={() => setOnboardingStep(1)}
                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-lg hover:transform hover:scale-105 transition-all text-lg w-full md:w-auto"
            >
                Configurar mi Perfil →
            </button>
        </div>
    );
};

export default WelcomeStep;
