import React, { useState } from 'react';
import { UserPersona } from '@/types';
import { useUserStore } from '@/store/useUserStore';
import { GraduationCap, Briefcase, Users2, Rocket, Laptop, CheckCircle2, Heart, Coffee } from 'lucide-react';

const PROFILES: { id: UserPersona; title: string; desc: string; icon: any; color: string }[] = [
    {
        id: 'STUDENT',
        title: 'Estudiante',
        desc: 'Gestión simple. Enfocado en presupuesto semanal y ahorro.',
        icon: GraduationCap,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'FREELANCER',
        title: 'Freelancer',
        desc: 'Control de ingresos irregulares, impuestos y gastos deducibles.',
        icon: Laptop,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'PROFESSIONAL',
        title: 'Profesional',
        desc: 'Gestión de nómina, inversiones y patrimonio neto.',
        icon: Briefcase,
        color: 'from-slate-700 to-slate-900'
    },
    {
        id: 'COUPLE',
        title: 'Pareja',
        desc: 'Finanzas compartidas, división de gastos y objetivos comunes.',
        icon: Heart,
        color: 'from-rose-500 to-red-500'
    },
    {
        id: 'FAMILY',
        title: 'Familia',
        desc: 'Presupuesto hogar, gastos compartidos e hijos.',
        icon: Users2,
        color: 'from-emerald-500 to-teal-500'
    },
    {
        id: 'ENTREPRENEUR',
        title: 'Emprendedor',
        desc: 'Flujo de caja, separación personal/negocio y métricas.',
        icon: Rocket,
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 'RETIREE',
        title: 'Jubilado',
        desc: 'Control de pensiones, presupuestos fijos y ahorro a largo plazo.',
        icon: Coffee,
        color: 'from-amber-500 to-orange-500'
    }
];

const ProfileSelectionStep: React.FC = () => {
    const { setOnboardingStep, setUserProfile, userProfile } = useUserStore();
    const [selected, setSelected] = useState<UserPersona[]>([]);

    const handleSelect = (id: UserPersona) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((p) => p !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleContinue = () => {
        if (selected.length > 0) {
            setUserProfile({
                ...userProfile,
                persona_type: selected
            });

            // If 'FAMILY' or 'COUPLE' is selected, go to Family Setup (Step 2), otherwise skip to Currency (Step 3)
            if (selected.includes('FAMILY') || selected.includes('COUPLE')) {
                setOnboardingStep(3);
            } else {
                setOnboardingStep(4);
            }
        }
    };

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
                ¿Cuál te describe mejor?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                Puedes seleccionar varias opciones. Personalizaremos Aliseus según tu perfil.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-10">
                {PROFILES.map((profile) => {
                    const isSelected = selected.includes(profile.id);
                    return (
                        <div
                            key={profile.id}
                            onClick={() => handleSelect(profile.id)}
                            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${isSelected
                                ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:border-cyan-500 shadow-md transform scale-[1.02]'
                                : 'border-gray-100 dark:border-onyx-700 bg-white dark:bg-onyx-800 hover:border-cyan-200 dark:hover:border-cyan-800'
                                }`}
                        >
                            <div className="absolute top-4 right-4 text-cyan-600 dark:text-cyan-400">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-600 border-cyan-600 dark:border-cyan-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-onyx-800'}`}>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                            </div>

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profile.color} flex items-center justify-center shadow-md mb-4`}>
                                <profile.icon className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{profile.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {profile.desc}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between w-full max-w-md">
                <button
                    onClick={() => setOnboardingStep(1)}
                    className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Atrás
                </button>

                <div className="relative group">
                    <button
                        onClick={handleContinue}
                        disabled={selected.length === 0}
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${selected.length > 0
                            ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-onyx-700 dark:text-gray-500'
                            }`}
                    >
                        Continuar
                    </button>
                    {selected.length === 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-3 rounded-md pointer-events-none z-10 hidden md:block">
                            Selecciona al menos un perfil para continuar
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-gray-900"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSelectionStep;
