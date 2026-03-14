import React from 'react';
import { Map, Plus, Luggage, Globe, Sparkles, MapPin, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { Trip } from '@/types';

interface TravelHubProps {
    trips: Trip[];
    currency: string;
    onOpenMap: () => void;
    onNewTrip: () => void;
    onSelectTrip: (id: string) => void;
}

export const TravelHub: React.FC<TravelHubProps> = ({ trips, currency, onOpenMap, onNewTrip, onSelectTrip }) => {

    const calculateDaysUntil = (dateStr: string) => {
        const today = new Date();
        const target = new Date(dateStr);
        const diff = target.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(amount);

    const totalTrips = trips.length;
    const upcomingTrips = trips.filter(t => t.status === 'UPCOMING').length;
    const uniqueCountries = new Set(trips.map(t => t.country).filter(Boolean)).size;

    return (
        <div className="space-y-8 p-8 animate-fade-in pb-20 overflow-y-auto h-full">
            {/* Hub Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                        Aliseus Experiencias <span className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-[10px] px-3 py-1 rounded-full tracking-widest uppercase shadow-md">Pro</span>
                    </h2>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Tu pasaporte inteligente al mundo</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onOpenMap} className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                        <Map className="w-4 h-4" /> Mapa Mundial
                    </button>
                    <button onClick={onNewTrip} className="bg-gray-900 text-white px-8 py-3 rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Nueva Aventura
                    </button>
                </div>
            </div>

            {/* Hub Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Luggage className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Viajes Totales</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">{totalTrips}</p>
                        <p className="text-xs font-bold text-emerald-500 mt-1">{upcomingTrips} Próximos</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Países Visitados</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">{uniqueCountries}</p>
                        <p className="text-xs font-bold text-gray-400 mt-1">Explorador Global</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Millas Aliseus</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">12,450</p>
                        <p className="text-xs font-bold text-emerald-500 mt-1">Nivel Oro</p>
                    </div>
                </div>
            </div>

            {/* Trip Grid */}
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">Tus Expediciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trips.map(trip => {
                        const daysLeft = calculateDaysUntil(trip.startDate);
                        return (
                            <div key={trip.id} onClick={() => onSelectTrip(trip.id)} className="group cursor-pointer bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-[380px]">
                                <div className="h-1/2 relative overflow-hidden bg-rose-50">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                                    {trip.image ? <img src={trip.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full bg-rose-100 flex items-center justify-center"><Map className="w-12 h-12 text-rose-300" /></div>}
                                    <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                                        <h3 className="text-3xl font-black tracking-tighter leading-none mb-2">{trip.destination}</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.country}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 z-20">
                                        {daysLeft > 0 ? (
                                            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg">Faltan {daysLeft} días</span>
                                        ) : (
                                            <span className="bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700 shadow-lg">Completado</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Calendar className="w-4 h-4" /></div>
                                            <span className="text-xs font-black uppercase tracking-wider">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><Wallet className="w-4 h-4" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Control de Gasto</span>
                                                <span className="text-sm font-black text-gray-900 tracking-tight">{formatCurrency(trip.spent)} <span className="text-gray-400 font-medium">/ {formatCurrency(trip.budget)}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-gray-500 shadow-sm z-10">TÚ</div>
                                            <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-rose-600 shadow-sm z-0">+1</div>
                                        </div>
                                        <button className="bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-rose-500 transition-colors shadow-md">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
