'use client';

import React from 'react';
import { Bell, TrendingDown, ArrowRight, Plane, Clock } from 'lucide-react';
import { PriceAlert } from '@/types';
import { useLifeStore } from '@/store/useLifeStore';

const PriceAlertWidget: React.FC = () => {
    const { priceAlerts } = useLifeStore();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
    };

    if (priceAlerts.length === 0) {
        return (
            <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full -ml-12 -mb-12" />
                
                <div className="w-16 h-16 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-6 relative z-10">
                    <Bell className="w-8 h-8 text-rose-400" />
                </div>
                
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">Alertas de Precio</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-[220px] mx-auto">Te avisaremos cuando bajen los vuelos a tus destinos favoritos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col lowercase-stats">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/20 flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight leading-none">Oportunidades</h3>
                        <p className="text-[10px] font-bold text-rose-400/60 uppercase tracking-widest mt-1">Vuelos en oferta</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {priceAlerts.map((alert) => (
                    <div key={alert.id} className="group bg-white/5 backdrop-blur-md border border-white/5 p-5 rounded-[2rem] hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Plane className="w-3 h-3 text-rose-400" />
                                <span className="text-sm font-black text-white">{alert.destination}</span>
                            </div>
                            {alert.isDrop && (
                                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">Oferta</span>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ahora</span>
                                <span className="text-lg font-black text-white leading-none">{formatCurrency(alert.currentPrice)}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Objetivo</span>
                                <span className="text-lg font-black text-gray-600 leading-none">{formatCurrency(alert.targetPrice)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            Actualizado {new Date(alert.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PriceAlertWidget;
