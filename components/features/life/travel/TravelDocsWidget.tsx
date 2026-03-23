'use client';

import React from 'react';
import { ShieldCheck, FileText, AlertCircle, Calendar, Plus, ExternalLink, User } from 'lucide-react';
import { TravelDocument } from '@/types';
import { useLifeStore } from '@/store/useLifeStore';

const TravelDocsWidget: React.FC = () => {
    const { travelDocuments } = useLifeStore();

    const isExpiringSoon = (date: string) => {
        const expiry = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays < 180; // Less than 6 months
    };

    const isExpired = (date: string) => {
        return new Date(date) < new Date();
    };

    if (travelDocuments.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Bóveda Documental</h3>
                <p className="text-sm text-gray-500 font-medium max-w-[200px] mx-auto mb-6">Guarda tus documentos y recibe alertas de caducidad.</p>
                <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">
                    Añadir Documento
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">Documentación</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Bóveda de Seguridad</p>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {travelDocuments.map((doc) => {
                    const expiringSoon = isExpiringSoon(doc.expiryDate);
                    const expired = isExpired(doc.expiryDate);
                    
                    return (
                        <div key={doc.id} className="group p-5 rounded-[2rem] border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:border-transparent transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900">{doc.label}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <User className="w-3 h-3 text-gray-400" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{doc.owner}</span>
                                        </div>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </div>

                            <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-gray-50">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-[11px] font-bold text-gray-600">Vence: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                                </div>
                                {expired ? (
                                    <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">
                                        <AlertCircle className="w-3 h-3" /> Caducado
                                    </span>
                                ) : expiringSoon ? (
                                    <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">
                                        <AlertCircle className="w-3 h-3" /> Renovar
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                                        Vigilado
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TravelDocsWidget;
