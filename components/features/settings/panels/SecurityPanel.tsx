import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Smartphone, ExternalLink, LogOut, Shield, Globe, FileText, Trash2 } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';

export const SecurityPanel = () => {
    const { language } = useUserStore();
    const isSpanish = language === 'ES';

    const [activeLegalPage, setActiveLegalPage] = useState<'NONE' | 'PRIVACY' | 'TERMS'>('NONE');

    const handleResetSystem = () => {
        const confirmText = window.prompt(isSpanish ? 'Escribe REINICIAR para borrar todo y empezar de cero.' : 'Type RESET to wipe everything and start over.');
        if (confirmText === (isSpanish ? 'REINICIAR' : 'RESET')) {
            alert("System Reset Triggered (Mock)");
        }
    };

    const handleDeleteAccount = () => {
        const confirmText = window.prompt(isSpanish ? 'Escribe ELIMINAR CUENTA para borrar tu cuenta permanentemente.' : 'Type DELETE ACCOUNT to permanently delete your account.');
        if (confirmText === (isSpanish ? 'ELIMINAR CUENTA' : 'DELETE ACCOUNT')) {
            alert("Account Deletion Triggered (Mock)");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-12 pb-12 w-full"
        >
            {/* Authentication Section */}
            <section className="bg-white dark:bg-aliseus-900/50 p-10 md:p-14 rounded-[50px] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-indigo-400 rounded-2xl border border-blue-500/20 shadow-inner">
                            <Key className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Bóveda de Seguridad' : 'Security Vault'}
                            </h4>
                            <p className="text-[10px] font-black text-blue-600/40 dark:text-indigo-300/40 uppercase tracking-widest mt-1">Blindaje de Acceso Aliseus</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md group/factor shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20 group-hover/factor:scale-110 transition-transform shadow-inner">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                    {isSpanish ? 'Doble Factor (2FA)' : 'Two-Factor (2FA)'}
                                    <span className="px-2 py-0.5 bg-slate-200/50 dark:bg-white/5 text-slate-400 dark:text-white/30 text-[8px] uppercase tracking-[0.2em] rounded-md border border-slate-200 dark:border-white/10">
                                        {isSpanish ? 'Nivel 1' : 'Level 1'}
                                    </span>
                                </h5>
                                <p className="text-[10px] font-black text-slate-400 dark:text-indigo-200/40 uppercase tracking-widest mt-1">Protección avanzada via App</p>
                            </div>
                        </div>
                        <button className="relative w-14 h-7 bg-slate-200 dark:bg-white/10 rounded-full transition-all group-hover/factor:bg-slate-300 dark:group-hover/factor:bg-white/15">
                            <div className="absolute top-1 left-1 w-5 h-5 bg-white dark:bg-white/20 rounded-full transition-transform shadow-sm" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button className="group/btn px-8 py-6 bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-indigo-200 flex items-center justify-between transition-all shadow-sm hover:shadow-md">
                            <span className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-blue-500 opacity-50 dark:text-indigo-400 dark:opacity-50 group-hover/btn:opacity-100" />
                                {isSpanish ? 'Cambiar Contraseña' : 'Rotate Password'}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                        </button>
                        <button className="group/btn px-8 py-6 bg-rose-50 dark:bg-rose-500/5 hover:bg-white dark:hover:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300 flex items-center justify-between transition-all shadow-sm hover:shadow-md">
                            <span className="flex items-center gap-3">
                                <LogOut className="w-4 h-4 text-rose-500 opacity-50 dark:text-rose-400 dark:opacity-50 group-hover/btn:opacity-100" />
                                {isSpanish ? 'Forzar Cierre Global' : 'Global Sign Out'}
                            </span>
                            <LogOut className="w-3.5 h-3.5 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Legal Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { id: 'PRIVACY' as const, icon: Globe, label: isSpanish ? 'Privacidad' : 'Privacy', desc: 'Data control' },
                    { id: 'TERMS' as const, icon: FileText, label: isSpanish ? 'Condiciones' : 'Terms', desc: 'Legals' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveLegalPage(item.id)}
                        className="p-10 bg-white dark:bg-aliseus-900/50 rounded-[40px] border border-slate-200 dark:border-white/5 flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-blue-200 dark:hover:border-white/10 transition-all text-left group shadow-xl shadow-slate-200/40 dark:shadow-none"
                    >
                        <div className="p-4 bg-blue-500/10 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform border border-blue-500/20 shadow-inner">
                            <item.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight block">{item.label}</span>
                            <span className="text-[9px] font-black text-blue-600/30 dark:text-indigo-300/30 uppercase tracking-[0.2em]">{item.desc}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Danger Zone */}
            <section className="relative overflow-hidden p-1 bg-gradient-to-br from-rose-500/20 to-transparent rounded-[50px]">
                <div className="bg-white dark:bg-aliseus-950 p-10 md:p-14 rounded-[48px] space-y-8 relative overflow-hidden border border-rose-100 dark:border-white/5 shadow-2xl shadow-rose-500/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black text-rose-600 dark:text-rose-500 tracking-tighter mb-4">
                            {isSpanish ? 'Zona Crítica' : 'Critical Zone'}
                        </h4>
                        <p className="text-sm font-black text-slate-400 dark:text-rose-200/40 leading-relaxed max-w-2xl">
                            {isSpanish
                                ? 'Las acciones aquí son irreversibles. Restablecer el sistema borrará cada transacción, miembro y dato almacenado. Procede con extrema cautela.'
                                : 'Actions here are irreversible. Resetting the system will wipe every transaction, member, and data point. Proceed with extreme caution.'}
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleResetSystem}
                            className="px-10 py-5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm"
                        >
                            {isSpanish ? 'Reiniciar Aliseus' : 'Reset Aliseus'}
                        </button>
                        <button 
                            onClick={handleDeleteAccount}
                            className="px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isSpanish ? 'Eliminar cuenta permanentemente' : 'Permanent Deletion'}
                        </button>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};
