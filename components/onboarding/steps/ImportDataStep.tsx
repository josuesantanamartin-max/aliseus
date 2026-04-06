import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import { UploadCloud, CheckCircle, ArrowRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

const ImportDataStep: React.FC = () => {
    const { setOnboardingStep, completeOnboarding, setSubscription } = useUserStore();
    // const navigate = useNavigate(); // Assuming we are using react-router

    const handleComplete = async () => {
        completeOnboarding();
        // Give users Premium Personal status right away after onboarding so they don't see "BASIC"
        setSubscription({ plan: 'PERSONAL', status: 'ACTIVE', isBetaExtraApplied: false });

        // Save onboarding completion to Supabase user_metadata
        try {
            const { supabase } = await import('@/services/supabaseClient');
            if (supabase) {
                await supabase.auth.updateUser({
                    data: { hasCompletedOnboarding: true }
                });
            }
        } catch (error) {
            console.error("Failed to save onboarding state to Supabase:", error);
        }

        // State update triggers AuthGate re-render automatically
    };

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
                ¿Tienes datos anteriores?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                Puedes importar tus transacciones desde un Excel o CSV ahora, o hacerlo más tarde desde la configuración.
            </p>

            <div className="w-full bg-gray-50 dark:bg-aliseus-800/50 border-2 border-dashed border-gray-200 dark:border-aliseus-700 rounded-2xl p-10 flex flex-col items-center justify-center mb-10 cursor-pointer hover:border-cyan-400 transition-colors group">
                <div className="w-16 h-16 bg-white dark:bg-aliseus-800 rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Arrastra tu archivo aquí</h3>
                <p className="text-sm text-gray-500 mb-4">Soporta .csv y .xslx</p>
                <button className="text-xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2 rounded-lg">
                    Explorar archivos
                </button>
            </div>

            <div className="flex justify-between w-full max-w-md">
                <button
                    onClick={() => setOnboardingStep(5)}
                    className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Atrás
                </button>

                <button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                    Finalizar y Entrar
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <button
                onClick={handleComplete}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
            >
                Omitir importación por ahora
            </button>
        </div>
    );
};

export default ImportDataStep;
