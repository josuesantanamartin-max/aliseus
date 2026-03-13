import React, { useState } from 'react';
import { ChevronLeft, Globe, Sparkles, Map, Wallet, ShieldCheck, Ticket, Calendar, PieChart, MapPin, ArrowRight, Plane, Hotel, Bed, ExternalLink } from 'lucide-react';
import { Trip } from '../../../../../types';
import { TravelItinerary } from './TravelItinerary';
import { TravelFinance } from './TravelFinance';
import { TravelDocuments } from './TravelDocuments';

interface TripDetailsProps {
    trip: Trip;
    currency: string;
    onBack: () => void;
}

type DetailTab = 'OVERVIEW' | 'ITINERARY' | 'FINANCE' | 'DOCUMENTS' | 'BOOKINGS';

export const TripDetails: React.FC<TripDetailsProps> = ({ trip, currency, onBack }) => {
    const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('OVERVIEW');

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

    const daysLeft = calculateDaysUntil(trip.startDate);

    return (
        <div className="h-full flex flex-col bg-[#FAFAFA] overflow-hidden animate-fade-in relative z-50">
            {/* HEADER */}
            <div className="relative h-72 shrink-0 bg-gray-900">
                <img src={trip.image} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                {/* Top Bar Navigation */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                    <button onClick={onBack} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10 group flex items-center gap-2">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Volver</span>
                    </button>
                    <div className="flex gap-2">
                        <button className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10 text-[10px] font-black uppercase tracking-widest">Compartir</button>
                        <button className="bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest">Editar</button>
                    </div>
                </div>

                {/* Header Title Area */}
                <div className="absolute bottom-8 left-8 right-8 z-20 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <span className="bg-rose-500/20 text-rose-200 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Misión Planificada</span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 leading-none drop-shadow-xl">{trip.destination}</h1>
                        <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] opacity-90 flex items-center gap-2 drop-shadow-md">
                            <Globe className="w-4 h-4" /> {trip.country}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex gap-6 text-center">
                        <div>
                            <p className="text-2xl font-black">{daysLeft > 0 ? daysLeft : 0}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Días a salida</p>
                        </div>
                        <div className="w-[1px] bg-white/20"></div>
                        <div>
                            <p className="text-2xl font-black">{Math.max(1, (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24))}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Días</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="bg-white border-b border-gray-100 px-8 flex overflow-x-auto custom-scrollbar shrink-0 sticky top-0 z-40">
                {[
                    { id: 'OVERVIEW', icon: Sparkles, label: 'Resumen' },
                    { id: 'ITINERARY', icon: Map, label: 'Itinerario' },
                    { id: 'FINANCE', icon: Wallet, label: 'Finanzas' },
                    { id: 'DOCUMENTS', icon: ShieldCheck, label: 'Bóveda' },
                    { id: 'BOOKINGS', icon: Ticket, label: 'Reservas' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveDetailTab(tab.id as DetailTab)}
                        className={`flex items-center gap-3 py-5 px-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${activeDetailTab === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeDetailTab === tab.id ? 'text-rose-500' : ''}`} /> {tab.label}
                        {activeDetailTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-full"></div>}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto">

                    {activeDetailTab === 'OVERVIEW' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Highlights Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                                    <div className="flex justify-between items-start">
                                        <Calendar className="w-5 h-5 text-rose-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">Fechas</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-sm tracking-tight">{new Date(trip.startDate).toLocaleDateString()}</p>
                                        <p className="font-black text-gray-900 text-sm tracking-tight">al {new Date(trip.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveDetailTab('FINANCE')}>
                                    <div className="flex justify-between items-start group">
                                        <PieChart className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded group-hover:bg-blue-100 transition-colors">Presupuesto</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-xl tracking-tight">{formatCurrency(trip.budget)}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatCurrency(trip.spent)} Usado</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveDetailTab('ITINERARY')}>
                                    <div className="flex justify-between items-start group">
                                        <MapPin className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded group-hover:bg-emerald-100 transition-colors">Actividades</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-xl tracking-tight">{trip.itinerary?.length || 0}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En Agenda</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveDetailTab('DOCUMENTS')}>
                                    <div className="flex justify-between items-start group">
                                        <ShieldCheck className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded group-hover:bg-orange-100 transition-colors">Bóveda</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-xl tracking-tight">{trip.checklist?.filter(c => c.completed).length || 0} / {trip.checklist?.length || 0}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completado</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Highlights Banner */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-8 md:p-10 border border-gray-700 relative overflow-hidden text-white shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10 md:w-2/3">
                                    <h3 className="text-2xl font-black mb-3">Tu próxima gran aventura</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">Revisa tu itinerario, asegura que tu presupuesto está bajo control y comprueba que tienes los visados listos antes de subir al avión.</p>
                                    <button onClick={() => setActiveDetailTab('ITINERARY')} className="bg-white text-gray-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                                        Explorar Agenda <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetailTab === 'ITINERARY' && (
                        <div className="animate-fade-in max-w-2xl mx-auto">
                            <TravelItinerary itinerary={trip.itinerary || []} />
                        </div>
                    )}

                    {activeDetailTab === 'FINANCE' && (
                        <div className="animate-fade-in max-w-2xl mx-auto">
                            <TravelFinance budget={trip.budget} spent={trip.spent} currency={currency} />
                        </div>
                    )}

                    {activeDetailTab === 'DOCUMENTS' && (
                        <div className="animate-fade-in max-w-3xl mx-auto">
                            <TravelDocuments checklist={trip.checklist} />
                        </div>
                    )}

                    {activeDetailTab === 'BOOKINGS' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Bookings Content */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Vuelos & Transporte</h3>
                                <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100">+ Añadir</button>
                            </div>
                            {(trip.flights?.length ?? 0) > 0 ? (
                                <div className="space-y-4">
                                    {trip.flights?.map(flight => (
                                        <div key={flight.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-gray-50 px-4 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-gray-400">{flight.airline} • {flight.flightNumber}</div>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-center">
                                                    <div className="text-3xl font-black text-gray-900">{flight.origin}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                                <div className="flex-1 px-8 flex flex-col items-center">
                                                    <div className="flex items-center gap-2 w-full">
                                                        <div className="h-[2px] bg-gray-200 flex-1"></div>
                                                        <Plane className="w-5 h-5 text-rose-400 rotate-90" />
                                                        <div className="h-[2px] bg-gray-200 flex-1"></div>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Directo</span>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-3xl font-black text-gray-900">{flight.destination}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                                <div className="text-xl font-black text-gray-900">
                                                    {flight.price ? formatCurrency(flight.price) : 'Precio no disponible'}
                                                </div>
                                                {flight.bookingUrl ? (
                                                    <a href={flight.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors shadow-lg active:scale-95">
                                                        <ExternalLink className="w-3 h-3" /> Reservar
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                                                        Busca vía aerolínea
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400">
                                    <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Sin vuelos registrados</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4 pt-8 border-t border-gray-50">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Alojamiento</h3>
                                <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100">+ Añadir</button>
                            </div>
                            {(trip.accommodations?.length ?? 0) > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {trip.accommodations?.map(acc => (
                                        <div key={acc.id} className="flex flex-col gap-4 p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition-all">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                                                    <Hotel className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-gray-900 text-lg">{acc.name}</h4>
                                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {acc.address}</p>
                                                    <div className="flex gap-3 mt-2">
                                                        <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">In: {new Date(acc.checkIn).toLocaleDateString()}</span>
                                                        <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Out: {new Date(acc.checkOut).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {acc.bookingUrl && (
                                                <a href={acc.bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors shadow-md">
                                                    Ver Hotel / Reservar
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400">
                                    <Bed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Sin alojamientos registrados</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
