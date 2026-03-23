import React, { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { SampleDataService } from '@/services/SampleDataService';
import {
    Wallet, Utensils, Home, Plane, ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react';

const FOCUS_AREAS = [
    {
        id: 'FINANCE',
        title: 'Finanzas',
        desc: 'Controla gastos, cuentas, presupuestos y deudas.',
        icon: Wallet,
        color: 'from-cyan-500 to-teal-500',
        ring: 'ring-cyan-500',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        border: 'border-cyan-500',
    },
    {
        id: 'KITCHEN',
        title: 'Cocina',
        desc: 'Recetas, despensa, menú semanal y lista de compra.',
        icon: Utensils,
        color: 'from-emerald-500 to-green-500',
        ring: 'ring-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-500',
    },
    {
        id: 'HOME',
        title: 'Hogar',
        desc: 'Agenda familiar, tareas y documentos del hogar.',
        icon: Home,
        color: 'from-rose-500 to-pink-500',
        ring: 'ring-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-500',
    },
    {
        id: 'TRAVEL',
        title: 'Viajes',
        desc: 'Planifica escapadas, documentos y presupuesto de viaje.',
        icon: Plane,
        color: 'from-blue-500 to-indigo-500',
        ring: 'ring-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500',
    },
];

const FocusPickerStep: React.FC = () => {
    const { setOnboardingStep, setOnboardingFocus, setSampleDataContext, userProfile } = useUserStore();
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (id: string) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleContinue = () => {
        const focus = selected.length > 0 ? selected : ['FINANCE']; // default to finance
        setOnboardingFocus(focus);

        // Load sample data and enable contextual banners
        SampleDataService.loadSampleData();
        setSampleDataContext(true);

        // Navigate to Currency step (or Family step if needed)
        const isFamily = userProfile?.persona_type?.some(p => p === 'FAMILY' || p === 'COUPLE');
        setOnboardingStep(isFamily ? 3 : 4);
    };

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
                ¿Qué quieres gestionar primero?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-lg">
                Selecciona las áreas que más te interesan. Cargaremos datos de ejemplo para que veas cómo funciona todo.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mb-10">
                {FOCUS_AREAS.map(area => {
                    const isSelected = selected.includes(area.id);
                    const Icon = area.icon;
                    return (
                        <div
                            key={area.id}
                            onClick={() => toggle(area.id)}
                            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] group ${
                                isSelected
                                    ? `${area.border} ${area.bg} shadow-md scale-[1.02]`
                                    : 'border-gray-100 dark:border-onyx-700 bg-white dark:bg-onyx-800 hover:border-gray-200 dark:hover:border-onyx-600'
                            }`}
                        >
                            {/* Checkbox */}
                            <div className="absolute top-4 right-4">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                        ? `bg-gradient-to-br ${area.color} border-transparent`
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-onyx-800'
                                }`}>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                            </div>

                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-7 h-7 text-white" />
                            </div>

                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{area.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{area.desc}</p>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between w-full max-w-md">
                <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Atrás
                </button>
                <button
                    onClick={handleContinue}
                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                    Continuar <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                No te preocupes, podrás acceder a todo después. Esto solo prioriza tu primera vista.
            </p>
        </div>
    );
};

export default FocusPickerStep;
