import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, CreditCard, Shield, Check, Star, Download, Camera, Pencil, Calendar, Heart
} from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { useFinanceStore } from '../../../../store/useFinanceStore';
import { useLifeStore } from '../../../../store/useLifeStore';
import { supabase } from '../../../../services/supabaseClient';
import { HouseholdManager } from '../../collaboration/HouseholdManager';
import { MemberManagement } from '../../collaboration/MemberManagement';
import { HouseholdChat } from '../../collaboration/HouseholdChat';

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
            className="space-y-8"
        >
            {/* 1. PREMIUM HEADER */}
            <div className="relative mb-8 rounded-[2.5rem] overflow-hidden bg-gray-900 dark:bg-onyx-950 border border-gray-800 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-gray-900"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/30 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-500/30 transition-colors duration-700"></div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-center gap-8">
                    <div className="relative cursor-pointer" onClick={handleOpenProfileEdit}>
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 p-2 rounded-full backdrop-blur-md shadow-2xl relative transition-transform duration-500 hover:scale-105">
                            <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden relative">
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 p-3 bg-indigo-500 rounded-full text-white shadow-lg border-4 border-gray-900 hover:bg-indigo-400 transition-colors">
                            <Pencil className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r rounded-full mb-3 shadow-lg ${subscription.plan === 'FAMILIA' ? 'from-amber-400 to-orange-500 shadow-orange-500/20' : subscription.plan === 'PERSONAL' ? 'from-indigo-400 to-violet-500 shadow-indigo-500/20' : 'from-gray-400 to-gray-500 shadow-gray-500/20'}`}>
                            <Star className="w-3 h-3 text-white fill-white" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">
                                {subscription.plan === 'FAMILIA' ? 'Aliseus Premium' : subscription.plan === 'PERSONAL' ? 'Aliseus Pro' : 'Aliseus Basic'}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-3 drop-shadow-md">
                            {userProfile?.full_name || 'Usuario Aliseus'}
                        </h2>
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 text-gray-300 font-medium text-sm">
                            <span className="text-indigo-300 font-bold bg-indigo-500/20 px-3 py-1 rounded-lg backdrop-blur-md border border-indigo-500/30 text-xs">
                                @{userProfile?.email?.split('@')[0] || 'aliseus_user'}
                            </span>
                            <span className="hidden md:inline text-gray-500">•</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{userProfile?.email || 'user@aliseus.com'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PREMIUM STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white dark:bg-onyx-900 p-6 rounded-[2rem] border border-gray-100 dark:border-onyx-800 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{totalTransactions}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transacciones</span>
                </div>
                <div className="bg-white dark:bg-onyx-900 p-6 rounded-[2rem] border border-gray-100 dark:border-onyx-800 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Check className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{totalGoals}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Metas Logradas</span>
                </div>
                <div className="bg-white dark:bg-onyx-900 p-6 rounded-[2rem] border border-gray-100 dark:border-onyx-800 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{familyMembers.length}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Miembros</span>
                </div>
                <div className="bg-white dark:bg-onyx-900 p-6 rounded-[2rem] border border-gray-100 dark:border-onyx-800 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter pt-1 pb-1">{joinDate}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Desde</span>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-onyx-800" />

            {/* 3. HOUSEHOLD & COLLABORATION */}
            <div className="space-y-12">
                {/* Bóveda de Datos */}
                <div className="bg-gray-900 dark:bg-onyx-950 p-8 md:p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 text-center md:text-left">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Bóveda de Seguridad</span>
                            <h4 className="text-3xl font-black text-white tracking-tighter flex items-center justify-center md:justify-start gap-3 mb-3">
                                <Shield className="w-8 h-8 text-emerald-500" /> Exportar Datos
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium max-w-lg mx-auto md:mx-0">
                                Eres el único dueño de tu información. Genera un paquete cifrado con todo tu historial financiero,
                                configuraciones familiares y registros de Aliseus.
                            </p>
                        </div>
                        <div className="w-full md:w-auto shrink-0">
                            <button onClick={handleExportData} className="w-full md:w-auto px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-gray-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                                <Download className="w-5 h-5" /> Descargar JSON
                            </button>
                        </div>
                    </div>
                </div>

                {/* Household Management */}
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter">Gestión del Hogar</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <HouseholdManager />
                            <MemberManagement />
                        </div>
                        <div className="lg:h-[600px] bg-white dark:bg-onyx-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-onyx-800 overflow-hidden">
                            <HouseholdChat />
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isProfileEditOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.form
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onSubmit={handleUpdateProfile}
                        className="bg-white dark:bg-onyx-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                        <div className="relative z-10 -mt-2">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-onyx-950 rounded-full p-2 shadow-lg mb-4 border border-gray-100 dark:border-onyx-800">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-onyx-900 overflow-hidden relative">
                                    {editProfileAvatar ? <img src={editProfileAvatar} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-gray-300 dark:text-gray-600" />}
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-center text-gray-900 dark:text-white mb-6">Editar Tu Perfil</h3>
                        </div>

                        <div className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={editProfileName}
                                    onChange={e => setEditProfileName(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-onyx-950 border border-gray-200 dark:border-onyx-800 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">URL Avatar</label>
                                <input
                                    type="text"
                                    value={editProfileAvatar}
                                    onChange={e => setEditProfileAvatar(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-4 bg-gray-50 dark:bg-onyx-950 border border-gray-200 dark:border-onyx-800 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
                            <button
                                type="button"
                                onClick={() => setIsProfileEditOpen(false)}
                                className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-onyx-800 hover:bg-gray-200 dark:hover:bg-onyx-700 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
                            >
                                Guardar
                            </button>
                        </div>
                    </motion.form>
                </div>
            )}
        </motion.div>
    );
};
