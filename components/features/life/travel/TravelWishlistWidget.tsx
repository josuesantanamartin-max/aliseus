'use client';

import React from 'react';
import { Heart, MapPin, Plane, ArrowRight, Plus } from 'lucide-react';
import { WishlistDestination } from '@/types';
import { useLifeStore } from '@/store/useLifeStore';

const TravelWishlistWidget: React.FC = () => {
    const { travelWishlist, addWishlistItem } = useLifeStore();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
    };

    if (travelWishlist.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-rose-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Wishlist Vacía</h3>
                    <p className="text-sm text-gray-500 font-medium max-w-[200px]">Guarda destinos para trackear precios y planear después.</p>
                </div>
                <button 
                    onClick={() => {/* Open search or mock add */}}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Explorar
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">Wishlist</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Destinos Soñados</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {travelWishlist.map((dest) => (
                    <div key={dest.id} className="group relative flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-transparent hover:border-rose-100 hover:bg-rose-50/30 transition-all cursor-pointer">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                            {dest.image ? (
                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                    <MapPin className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-gray-900 truncate">{dest.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dest.country}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Plane className="w-3 h-3 text-rose-400" />
                                <span className="text-xs font-black text-rose-600 tracking-tight">Desde {formatCurrency(dest.estimatedPrice)}</span>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-gray-900" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TravelWishlistWidget;
