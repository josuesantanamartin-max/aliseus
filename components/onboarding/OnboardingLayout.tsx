import React from 'react';

interface OnboardingLayoutProps {
    children: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-aliseus-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-white dark:bg-aliseus-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-aliseus-800">
                {/* Logo Header */}
                <div className="p-8 border-b border-gray-100 dark:border-aliseus-800 flex justify-center">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Aliseus"
                            className="h-10 w-auto object-contain drop-shadow-sm"
                        />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-cyan-600 uppercase leading-none">Aliseus</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">La tranquilidad de tu familia.</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
                    {children}
                </div>
            </div>

            {/* Footer / Legal */}
            <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
                © 2026 Aliseus. Configuración inicial segura.
            </div>
        </div>
    );
};

export default OnboardingLayout;
