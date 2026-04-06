import React from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { Plane, Utensils, Home, Lock, Baby, ArrowRight, Calendar } from 'lucide-react';

interface LifeOverviewProps {
    // All state managed via stores
}

const TEXTS: any = {
    ES: {
        greeting: 'Tu Vida Digital',
        subtitle: 'Todo tu mundo en un solo lugar.',
        kitchen: 'Cocina',
        travel: 'Viajes',
        spaces: 'Espacios',
        family: 'Familia',
        vault: 'Bóveda',
        nextTrip: 'Próximo Viaje',
        noTrips: 'Planifica tu próxima aventura',
        mealToday: 'Menú de Hoy',
        manage: 'Gestionar',
        familyStatus: 'Estado Familiar',
        members: 'Miembros'
    },
    EN: {
        greeting: 'Your Digital Life',
        subtitle: 'Your entire world in one place.',
        kitchen: 'Kitchen',
        travel: 'Travel',
        spaces: 'Spaces',
        family: 'Family',
        vault: 'Vault',
        nextTrip: 'Next Trip',
        noTrips: 'Plan your next adventure',
        mealToday: 'Menu Today',
        manage: 'Manage',
        familyStatus: 'Family Status',
        members: 'Members'
    },
    FR: {
        greeting: 'Votre Vie Numérique',
        subtitle: 'Tout votre monde au même endroit.',
        kitchen: 'Cuisine',
        travel: 'Voyages',
        spaces: 'Espaces',
        family: 'Famille',
        vault: 'Coffre-fort',
        nextTrip: 'Prochain Voyage',
        noTrips: 'Planifiez votre prochaine aventure',
        mealToday: 'Menu du Jour',
        manage: 'Gérer',
        familyStatus: 'Statut Familial',
        members: 'Membres'
    }
};

export const LifeOverview: React.FC<LifeOverviewProps> = () => {
    const { trips, familyMembers, weeklyPlans } = useLifeStore();
    const { language, setLifeActiveTab: setActiveTab } = useUserStore();

    const t = TEXTS[language as string] || TEXTS['ES'];
    const nextTrip = trips.length > 0 ? trips[0] : null;
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = weeklyPlans
        .flatMap(p => p.meals)
        .filter(m => m.date === today);
    const mealCount = todayMeals.length;

    return (
        <div className="p-6 md:p-8 animate-fade-in pb-24 md:pb-8 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">{t.greeting}</h1>
                <p className="text-gray-500 font-medium text-lg">{t.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

                <div
                    onClick={() => setActiveTab('kitchen-dashboard')}
                    className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-900/10 transition-transform hover:scale-[1.01]"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl"><Utensils className="w-6 h-6 text-white" /></div>
                                <span className="font-black uppercase tracking-widest text-sm opacity-80">{t.kitchen}</span>
                            </div>
                            <h3 className="text-2xl font-bold max-w-md">
                                {mealCount > 0 ? `${mealCount} comidas planificadas para hoy.` : 'Tu cocina está tranquila hoy.'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-sm bg-white/20 backdrop-blur-md w-fit px-4 py-2 rounded-full mt-4 group-hover:bg-white group-hover:text-emerald-700 transition-colors">
                            {t.manage} <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                    <Utensils className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700" />
                </div>

                <div
                    onClick={() => setActiveTab('travel')}
                    className="bg-white dark:bg-aliseus-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-aliseus-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl"><Plane className="w-6 h-6" /></div>
                        {nextTrip && <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full uppercase tracking-wider">Pronto</span>}
                    </div>
                    <h4 className="text-gray-400 dark:text-gray-500 font-black text-xs uppercase tracking-widest mb-1">{t.travel}</h4>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                        {nextTrip ? nextTrip.destination : t.noTrips}
                    </h3>
                    {nextTrip && (
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(nextTrip.startDate).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div
                    onClick={() => setActiveTab('family')}
                    className="bg-white dark:bg-aliseus-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-aliseus-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-yellow-200 dark:hover:border-yellow-900/50 hover:shadow-md transition-all"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-2xl"><Baby className="w-6 h-6" /></div>
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{familyMembers.length}</span>
                    </div>
                    <h4 className="text-gray-400 dark:text-gray-500 font-black text-xs uppercase tracking-widest mb-1">{t.family}</h4>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.members}</h3>
                    <div className="flex -space-x-2 mt-4">
                        {familyMembers.slice(0, 4).map((m, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-aliseus-700 border-2 border-white dark:border-aliseus-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                                {m.name[0]}
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('spaces')}
                    className="bg-white dark:bg-aliseus-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-aliseus-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-cyan-200 dark:hover:border-cyan-900/50 hover:shadow-md transition-all"
                >
                    <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-2xl w-fit mb-6"><Home className="w-6 h-6" /></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.spaces}</h3>
                    <p className="text-sm text-gray-400 mt-2 font-medium">Gestiona tu hogar</p>
                </div>

                <div
                    onClick={() => setActiveTab('vault')}
                    className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group cursor-pointer"
                >
                    <div className="relative z-10">
                        <div className="p-3 bg-white/10 text-white rounded-2xl w-fit mb-6 backdrop-blur-md"><Lock className="w-6 h-6" /></div>
                        <h3 className="text-xl font-bold">{t.vault}</h3>
                        <p className="text-sm text-slate-400 mt-2 font-medium">Seguridad Privada</p>
                    </div>
                    <Lock className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-500" />
                </div>

            </div>
        </div>
    );
};
