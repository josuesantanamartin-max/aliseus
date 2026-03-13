import React from 'react';
import {
    X, Shield, Phone, Mail, Calendar, Heart,
    TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft,
    FileText, Award, Activity, History
} from 'lucide-react';
import { FamilyMember } from '../../../../types';
import { GrowthChart } from './GrowthChart';
import { useCurrency } from '../../../../hooks/useCurrency';

interface FamilyDetailPanelProps {
    member: FamilyMember;
    onClose: () => void;
}

export const FamilyDetailPanel: React.FC<FamilyDetailPanelProps> = ({ member, onClose }) => {
    const isChild = member.role === 'CHILD';
    const { formatPrice } = useCurrency();

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#FAFAFA] shadow-2xl z-[150] flex flex-col animate-slide-in overflow-hidden border-l border-gray-100">
            {/* Header */}
            <div className="p-8 pb-32 bg-gray-900 relative overflow-hidden shrink-0">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

                <div className="flex justify-between items-start relative z-10">
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                        {member.isEmergencyContact && (
                            <div className="bg-red-500/20 text-red-100 px-3 py-1.5 rounded-xl border border-red-500/30 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                <Shield className="w-3 h-3 text-red-500 fill-current" /> Emergencia
                            </div>
                        )}
                        <div className="bg-white/10 text-white px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                            {member.relationship}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-end gap-6 relative z-10">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md border-4 border-white/10 flex items-center justify-center text-4xl shadow-2xl overflow-hidden group">
                        {member.avatar.length < 5 ? (
                            <span className="group-hover:scale-110 transition-transform">{member.avatar}</span>
                        ) : (
                            <img src={member.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        )}
                    </div>
                    <div className="mb-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{member.name}</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                            {isChild ? 'Círculo Junior' : 'Perfil Administrador'}
                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                            {member.birthDate ? `${Math.floor((new Date().getTime() - new Date(member.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} años` : 'Edad N/D'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Tabs/Scroll Area */}
            <div className="flex-1 -mt-24 relative z-20 overflow-y-auto custom-scrollbar p-8 pt-0 space-y-6">

                {/* Quick Info Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <Wallet className="w-6 h-6 text-emerald-500 mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance</p>
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">{formatPrice(member.balance)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <Award className="w-6 h-6 text-blue-500 mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recompensas</p>
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">12</h4>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <Activity className="w-6 h-6 text-purple-500 mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actividad</p>
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">Alta</h4>
                    </div>
                </div>

                {/* Growth Chart for Children */}
                {isChild && (
                    <GrowthChart data={member.growthHistory} name={member.name} />
                )}

                {/* Financial History */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ãšltimos Movimientos</h4>
                        </div>
                        {isChild && (
                            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Gestionar Paga</button>
                        )}
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-gray-900">Asignación Semanal</h5>
                                    <p className="text-[10px] font-bold text-gray-400">14 Feb, 2026</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-emerald-600">+{formatPrice(10)}</span>
                        </div>
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <ArrowDownLeft className="w-4 h-4" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-gray-900">Compra de App Store</h5>
                                    <p className="text-[10px] font-bold text-gray-400">12 Feb, 2026</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-red-600">-{formatPrice(4.99)}</span>
                        </div>
                    </div>
                </div>

                {/* Documents & Info */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Documentación y Contacto</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all cursor-pointer">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">DNI / Pasaporte</p>
                            <span className="text-xs font-bold text-gray-700">Oculto por seguridad</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all cursor-pointer">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Seguro Médico</p>
                            <span className="text-xs font-bold text-gray-700">Sanitas Aliseus #423...</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                        {member.phone && (
                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">{member.phone}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                        )}
                        {member.email && (
                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">{member.email}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="p-8 bg-white border-t border-gray-100 shadow-lg flex gap-4 shrink-0">
                <button className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl">
                    Editar Perfil
                </button>
                <button className="px-6 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">
                    Eliminar
                </button>
            </div>
        </div>
    );
};
