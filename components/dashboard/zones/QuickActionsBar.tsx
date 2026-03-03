import React from 'react';
import { Plus, UploadCloud, Plane, Target, BarChart2, Users } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';

export default function QuickActionsBar() {
    const { setActiveApp, setLifeActiveTab, setFinanceActiveTab } = useUserStore();

    const actions = [
        { label: 'Añadir Transacción', icon: Plus, action: () => alert('Mock: Add Transaction Modal'), color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-500/10' },
        { label: 'Importar CSV', icon: UploadCloud, action: () => alert('Mock: Import CSV Modal'), color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
        { label: 'Buscar Vuelos', icon: Plane, action: () => { setActiveApp('life'); setLifeActiveTab('travel'); }, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
        { label: 'Objetivos', icon: Target, action: () => { setActiveApp('finance'); setFinanceActiveTab('goals'); }, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { label: 'Informe Mensual', icon: BarChart2, action: () => alert('Mock: Monthly Report Modal'), color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        { label: 'Gestión Familiar', icon: Users, action: () => alert('Mock: Family Management Modal'), color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none">
            <div className="bg-white/90 dark:bg-onyx-800/90 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-200/50 dark:border-onyx-700/50 p-2 pointer-events-auto flex items-center justify-between overflow-x-auto hide-scrollbar gap-2 transition-transform hover:scale-[1.01] duration-300">
                {actions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={i}
                            onClick={action.action}
                            className={`flex flex-col items-center justify-center gap-1.5 min-w-[72px] md:min-w-[96px] py-2 px-1 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-onyx-700 group active:scale-95`}
                        >
                            <div className={`p-2 rounded-full ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap text-center">
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
