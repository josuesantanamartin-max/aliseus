import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, CreditCard, Shield, Check, Star, Download, Camera, Pencil, Calendar, Heart
} from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { useFinanceStore } from '../../../../store/useFinanceStore';
import { useLifeStore } from '../../../../store/useLifeStore';
import { supabase } from '../../../../services/supabaseClient';

export const ProfilePanel = () => {
    const { userProfile, setUserProfile, subscription, language } = useUserStore();
    const { familyMembers } = useLifeStore();
    const { transactions, goals } = useFinanceStore();

    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
    const [editProfileName, setEditProfileName] = useState('');
    const [editProfileAvatar, setEditProfileAvatar] = useState('');

    // Stats
    const totalTransactions = transactions.length;
    const totalGoals = goals.length;
    const joinDate = userProfile?.id ? 'Enero 2025' : 'Oct 2024';

    const handleOpenProfileEdit = () => {
        setEditProfileName(userProfile?.full_name || '');
        setEditProfileAvatar(userProfile?.avatar_url || '');
        setIsProfileEditOpen(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!supabase) return;
            const updates = { full_name: editProfileName, avatar_url: editProfileAvatar };
            const { error } = await supabase.auth.updateUser({ data: updates });
            if (error) throw error;
            setUserProfile({ ...userProfile, ...updates } as any);
            setIsProfileEditOpen(false);
            alert('Perfil actualizado correctamente');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert('Error al actualizar perfil: ' + error.message);
        }
    };

    const handleExportData = () => {
        const data = {
            userProfile: useUserStore.getState().userProfile,
            finance: {
                transactions: useFinanceStore.getState().transactions,
                accounts: useFinanceStore.getState().accounts,
                budgets: useFinanceStore.getState().budgets,
                goals: useFinanceStore.getState().goals,
                debts: useFinanceStore.getState().debts,
                categories: useFinanceStore.getState().categories,
            },
            life: {
                pantryItems: useLifeStore.getState().pantryItems,
                shoppingList: useLifeStore.getState().shoppingList,
                familyMembers: useLifeStore.getState().familyMembers,
                weeklyPlans: useLifeStore.getState().weeklyPlans,
            },
            settings: {
                language: useUserStore.getState().language,
                currency: useUserStore.getState().currency,
                automationRules: useUserStore.getState().automationRules,
            },
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `onyx_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
        >
            {/* 1. PREMIUM HEADER */}
            <div className="relative mb-12 rounded-[40px] overflow-hidden bg-white/40 dark:bg-onyx-950 border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-2xl group ring-1 ring-slate-200/50 dark:ring-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/40 to-white/80 dark:from-[#0c0c1e] dark:via-indigo-950/40 dark:to-onyx-950" />
                
                {/* Dynamic Aura Glows */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group/avatar cursor-pointer" onClick={handleOpenProfileEdit}>
                        <div className="w-36 h-36 md:w-48 md:h-48 bg-white p-2 rounded-[40px] backdrop-blur-md shadow-2xl relative transition-all duration-700 group-hover/avatar:scale-105 ring-1 ring-slate-200/50 group-hover/avatar:rotate-3">
                            <div className="w-full h-full rounded-[34px] bg-slate-50 dark:bg-onyx-900 overflow-hidden relative">
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
                                        <User className="w-20 h-20 text-blue-400 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 backdrop-blur-sm">
                                    <Camera className="w-10 h-10 text-white scale-75 group-hover/avatar:scale-100 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-3.5 bg-blue-600 rounded-2xl text-white shadow-xl border-[4px] border-white dark:border-[#0c0c1e] group-hover/avatar:scale-110 group-hover/avatar:rotate-12 transition-all duration-500">
                            <Pencil className="w-4.5 h-4.5 font-bold" />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`inline-flex items-center gap-2.5 px-4 py-1.5 bg-white backdrop-blur-xl rounded-full mb-6 border border-slate-200 dark:border-white/10 shadow-sm`}
                        >
                            <Star className={`w-3.5 h-3.5 ${subscription.plan === 'FAMILIA' ? 'text-amber-500' : 'text-blue-500'} fill-current`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white">
                                {subscription.plan === 'FAMILIA' ? 'Aura Diamond' : subscription.plan === 'PERSONAL' ? 'Aura Pro' : 'Free Account'}
                            </span>
                        </motion.div>
                        
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-5">
                            {userProfile?.full_name || 'Usuario Aliseus'}
                        </h2>
                        
                        <div className="flex flex-col md:flex-row items-center gap-5">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 rounded-2xl border border-blue-500/10 backdrop-blur-sm">
                                <span className="text-blue-600 dark:text-indigo-300 font-black text-xs tracking-tight">@{userProfile?.email?.split('@')[0] || 'aura_user'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                <span className="uppercase tracking-widest opacity-80 underline decoration-blue-500/30 underline-offset-4">{userProfile?.email || 'user@aliseus.com'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PREMIUM STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Transacciones', value: totalTransactions, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/5 border-blue-500/10' },
                    { label: 'Metas Logradas', value: totalGoals, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/5 border-emerald-500/10' },
                    { label: 'Miembros', value: familyMembers.length, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/5 border-rose-500/10' },
                    { label: 'Desde', value: joinDate, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/5 border-amber-500/10' }
                ].map((stat, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white/40 dark:bg-onyx-900/50 p-8 rounded-[32px] border border-slate-200/50 dark:border-onyx-800 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-xl hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-[20px] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10">{stat.value}</span>
                        <span className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-2 relative z-10">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            <hr className="border-slate-100 dark:border-onyx-800 my-4" />

            {/* 3. HOUSEHOLD & COLLABORATION */}
            <div className="space-y-16">
                {/* Data Vault */}
                <div className="bg-emerald-50/30 dark:bg-onyx-950 p-10 md:p-14 rounded-[40px] border border-emerald-200/50 dark:border-white/5 shadow-xl shadow-emerald-500/5 relative overflow-hidden group ring-1 ring-emerald-500/10">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors duration-700" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex-1 text-center lg:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400 mb-4 block opacity-80">Data Portability</span>
                            <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center justify-center lg:justify-start gap-4 mb-5">
                                <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                                </div>
                                Bóveda de Datos
                            </h4>
                            <p className="text-base text-slate-600 dark:text-gray-400 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                                Eres el único dueño de tu información. Genera un paquete cifrado con todo tu historial financiero,
                                configuraciones familiares y registros de Aliseus.
                            </p>
                        </div>
                        <div className="w-full lg:w-auto shrink-0">
                            <button onClick={handleExportData} className="w-full lg:w-auto px-10 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-4 hover:-translate-y-1">
                                <Download className="w-6 h-6" /> Exportar JSON
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            <AnimatePresence>
                {isProfileEditOpen && (
                    <div className="fixed inset-0 bg-[#0c0c1e]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                        <motion.form
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onSubmit={handleUpdateProfile}
                            className="bg-white dark:bg-onyx-900 rounded-[48px] p-10 max-w-lg w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5 ring-1 ring-white/10"
                        >
                            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 opacity-20" />
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px]" />

                            <div className="relative z-10 text-center mb-10">
                                <div className="w-32 h-32 mx-auto bg-onyx-950 rounded-[40px] p-2 shadow-2xl mb-6 relative group/modal-avatar">
                                    <div className="w-full h-full rounded-[34px] bg-onyx-900 overflow-hidden ring-1 ring-white/10">
                                        {editProfileAvatar ? (
                                            <img src={editProfileAvatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-full h-full p-8 text-gray-800" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-onyx-950">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Perfiles Aliseus</h3>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest opacity-60">Personaliza tu identidad digital</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest ml-2">Nombre de Identidad</label>
                                    <input
                                        type="text"
                                        value={editProfileName}
                                        onChange={e => setEditProfileName(e.target.value)}
                                        className="w-full p-5 bg-gray-50 dark:bg-onyx-950 border border-gray-100 dark:border-onyx-800 rounded-[20px] font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-inner text-lg tracking-tight"
                                        placeholder="Tu nombre real o alias"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest ml-2">URL del Avatar Maestro</label>
                                    <input
                                        type="text"
                                        value={editProfileAvatar}
                                        onChange={e => setEditProfileAvatar(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full p-5 bg-gray-50 dark:bg-onyx-950 border border-gray-100 dark:border-onyx-800 rounded-[20px] font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm dark:text-white shadow-inner font-mono tracking-tight"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5 mt-12 relative z-10">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileEditOpen(false)}
                                    className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-onyx-800 hover:bg-gray-200 dark:hover:bg-onyx-700 rounded-[20px] transition-all active:scale-95"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-5 bg-indigo-600 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-1 active:scale-95 transition-all"
                                >
                                    Sincronizar
                                </button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
