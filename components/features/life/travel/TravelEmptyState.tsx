import React from 'react';
import { Plane, Compass, Sparkles, Plus, Map, Globe } from 'lucide-react';

interface TravelEmptyStateProps {
    onNewTrip: () => void;
}

export const TravelEmptyState: React.FC<TravelEmptyStateProps> = ({ onNewTrip }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
            <div className="relative mb-12">
                {/* Visual Group */}
                <div className="w-64 h-64 bg-rose-50 rounded-full flex items-center justify-center relative shadow-inner">
                    <Globe className="w-32 h-32 text-rose-200 animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Plane className="w-20 h-20 text-rose-500 drop-shadow-2xl animate-float" />
                    </div>
                </div>
                
                {/* Floating Icons */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center animate-bounce-slow">
                    <Compass className="w-6 h-6 text-blue-500" />
                </div>
                <div className="absolute bottom-4 -left-8 w-14 h-14 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center rotate-12 animate-float" style={{ animationDelay: '1s' }}>
                    <Map className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="absolute -bottom-2 right-4 w-10 h-10 bg-rose-500 rounded-full shadow-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="text-center max-w-md">
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">
                    El mundo te está esperando
                </h3>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-2 opacity-60">
                    Aura Experiencias
                </p>
                <p className="text-gray-400 font-medium leading-relaxed mb-10">
                    Planifica tu primera aventura inteligente. Gestiona vuelos, hoteles y presupuestos en un solo lugar con la ayuda de nuestra IA.
                </p>

                <button 
                    onClick={onNewTrip}
                    className="group bg-gray-900 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl hover:bg-rose-500 transition-all active:scale-95 font-black text-xs uppercase tracking-widest flex items-center gap-3 mx-auto"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Planifica tu primer viaje
                </button>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 opacity-40">
                <div className="text-center">
                    <p className="font-black text-gray-900 text-sm">IA Planner</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Diseñamos tu ruta</p>
                </div>
                <div className="text-center">
                    <p className="font-black text-gray-900 text-sm">Sync Financiera</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Control de gasto real</p>
                </div>
                <div className="hidden md:block text-center">
                    <p className="font-black text-gray-900 text-sm">Bóveda Documental</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Todo seguro y a mano</p>
                </div>
            </div>
        </div>
    );
};
