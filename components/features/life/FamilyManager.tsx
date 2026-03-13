import React, { useState } from 'react';
import {
    Users, Plus, Gift, Calendar, Heart, MessageSquare, Phone, MapPin,
    Search, Filter, MoreVertical, Edit2, Trash2, Mail, ExternalLink,
    Clock, Bell, Star, Shield, Activity, Wallet, ChevronRight
} from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { FamilyMember } from '../../../types';
import { FamilySharedCalendar } from './family/FamilySharedCalendar';
import { FamilyDetailPanel } from './family/FamilyDetailPanel';
import { AnimatePresence } from 'framer-motion';
import { useCurrency } from '../../../hooks/useCurrency';

export const FamilyManager: React.FC = () => {
    const { familyMembers } = useLifeStore();
    const { language } = useUserStore();
    const { formatPrice } = useCurrency();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'IMMEDIATE' | 'EXTENDED' | 'FRIENDS'>('ALL');
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

    const filteredMembers = familyMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.relationship.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || (
            selectedCategory === 'IMMEDIATE' && member.role !== 'MEMBER' ||
            selectedCategory === 'FRIENDS' && member.relationship === 'Amigo'
        );
        return matchesSearch && matchesCategory;
    });

    const totalFamilyBalance = familyMembers.reduce((sum, m) => sum + (m.balance || 0), 0);

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in pb-20 p-8 overflow-y-auto custom-scrollbar bg-[#FAFAFA]">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                        Círculo Aliseus <span className="bg-gray-900 text-white text-[10px] px-3 py-1 rounded-full tracking-widest uppercase">Pro</span>
                    </h2>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Gestión Inteligente de Hogar y Bienestar</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                        <Wallet className="w-4 h-4" /> Capital: {formatPrice(totalFamilyBalance)}
                    </button>
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
                        <Plus className="w-5 h-5" /> Añadir Miembro
                    </button>
                </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-emerald-200 transition-all">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] group-hover:scale-110 transition-transform"><Heart className="w-6 h-6 fill-current" /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cumpleaños</p>
                        <h4 className="text-xl font-black text-gray-900">2 este mes</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-blue-200 transition-all">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-[1.5rem] group-hover:scale-110 transition-transform"><Bell className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aviso Paga</p>
                        <h4 className="text-xl font-black text-gray-900">En 2 días</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-purple-200 transition-all">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-[1.5rem] group-hover:scale-110 transition-transform"><Activity className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Citas Médicas</p>
                        <h4 className="text-xl font-black text-gray-900">Ver mañana</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-red-200 transition-all">
                    <div className="p-4 bg-red-50 text-red-600 rounded-[1.5rem] group-hover:scale-110 transition-transform"><Shield className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">S.O.S.</p>
                        <h4 className="text-xl font-black text-gray-900">3 Contactos</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content Area (Left) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o parentesco..."
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                                {['ALL', 'IMMEDIATE', 'EXTENDED', 'FRIENDS'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat as any)}
                                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        {cat === 'ALL' ? 'Todos' : cat === 'IMMEDIATE' ? 'Directo' : cat === 'EXTENDED' ? 'Extendida' : 'Amigos'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredMembers.map(member => (
                                    <div
                                        key={member.id}
                                        onClick={() => setSelectedMember(member)}
                                        className="group bg-white border border-gray-100 rounded-[2.5rem] p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative cursor-pointer overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><ChevronRight className="w-5 h-5" /></div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-3xl border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                                    {member.avatar.length < 5 ? member.avatar : <img src={member.avatar} className="w-full h-full object-cover" />}
                                                </div>
                                                {member.isEmergencyContact && (
                                                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-2 rounded-full border-2 border-white shadow-lg animate-pulse">
                                                        <Shield className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-tight">{member.name}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">{member.relationship}</span>
                                                    {member.role === 'CHILD' && <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">Junior</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="p-4 bg-gray-50/50 rounded-2xl flex flex-col justify-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Balance</p>
                                                <span className="text-lg font-black text-gray-900 tracking-tight">{formatPrice(member.balance)}</span>
                                            </div>
                                            <div className="p-4 bg-gray-50/50 rounded-2xl flex flex-col justify-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Ãšltima Actividad</p>
                                                <span className="text-xs font-black text-gray-600 tracking-tight">Hace 2h</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-gray-900 text-white p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest group/btn">
                                                <Users className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Gestionar
                                            </button>
                                            <button className="px-4 bg-emerald-50 text-emerald-600 rounded-xl transition-all flex items-center justify-center hover:bg-emerald-600 hover:text-white">
                                                <Wallet className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Card */}
                                <button className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-gray-300 hover:text-emerald-500 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group min-h-[250px]">
                                    <Plus className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-sm uppercase tracking-widest">Añadir Nuevo</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Content Area (Right) */}
                <div className="lg:col-span-4 space-y-8 h-[calc(100vh-280px)] sticky top-8">
                    <FamilySharedCalendar />
                </div>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
                {selectedMember && (
                    <>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140] animate-fade-in"
                            onClick={() => setSelectedMember(null)}
                        />
                        <FamilyDetailPanel
                            member={selectedMember}
                            onClose={() => setSelectedMember(null)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};