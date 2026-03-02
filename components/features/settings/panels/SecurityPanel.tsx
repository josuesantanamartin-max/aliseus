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
            className="max-w-4xl space-y-8 pb-12 w-full"
        >
            <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {isSpanish ? 'Seguridad' : 'Security'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Gestión de autenticación, dispositivos y zona de peligro.' : 'Authentication, device management, and danger zone.'}
                </p>
            </div>

            <div className="space-y-6">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 flex items-center gap-3">
                    <Key className="w-6 h-6 text-indigo-500" /> {isSpanish ? 'Autenticación' : 'Authentication'}
                </h4>
                <div className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/40 dark:shadow-none space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-gray-100 dark:border-onyx-800 gap-4 group">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-800/50 shadow-inner group-hover:border-purple-200 transition-colors">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                    {isSpanish ? 'Autenticación 2FA' : '2FA Authentication'}
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-onyx-800 text-gray-500 dark:text-gray-400 text-[9px] uppercase tracking-widest rounded-lg border border-gray-200 dark:border-onyx-700 shadow-sm">
                                        {isSpanish ? 'Inactiva' : 'Inactive'}
                                    </span>
                                </h5>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-sm leading-relaxed">
                                    {isSpanish ? 'Protege tu cuenta con verificación móvil de dos pasos.' : 'Protect your account with two-step mobile verification.'}
                                </p>
                            </div>
                        </div>
                        <div className="w-14 h-8 bg-gray-200 dark:bg-onyx-800 rounded-full p-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-onyx-700 transition-colors shadow-inner flex shrink-0">
                            <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                        <button className="flex-1 px-6 py-4 bg-gray-50 dark:bg-onyx-950 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors border border-gray-200 dark:border-onyx-800 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-inner hover:shadow-md text-left flex justify-between items-center group">
                            {isSpanish ? 'Actualizar Contraseña' : 'Update Password'}
                            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </button>
                        <button className="flex-1 px-6 py-4 bg-gray-50 dark:bg-onyx-950 text-rose-600 dark:text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors border border-gray-200 dark:border-onyx-800 hover:border-rose-200 dark:hover:border-rose-800 shadow-inner hover:shadow-md text-left flex justify-between items-center group">
                            {isSpanish ? 'Cerrar todas las sesiones' : 'Sign out of all sessions'}
                            <LogOut className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-indigo-500" /> {isSpanish ? 'Legal y Cumplimiento' : 'Legal & Compliance'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => setActiveLegalPage('PRIVACY')} className="p-8 bg-white dark:bg-onyx-900 rounded-[2rem] border border-gray-100 dark:border-onyx-800 text-left hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-xl shadow-gray-200/40 dark:shadow-none hover:-translate-y-1 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors"></div>
                        <Globe className="w-8 h-8 text-indigo-500 mb-4" />
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight block mb-2">{isSpanish ? 'Política de Privacidad' : 'Privacy Policy'}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data usage & rights</span>
                    </button>
                    <button onClick={() => setActiveLegalPage('TERMS')} className="p-8 bg-white dark:bg-onyx-900 rounded-[2rem] border border-gray-100 dark:border-onyx-800 text-left hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-xl shadow-gray-200/40 dark:shadow-none hover:-translate-y-1 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors"></div>
                        <FileText className="w-8 h-8 text-indigo-500 mb-4" />
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight block mb-2">{isSpanish ? 'Términos de Servicio' : 'Terms of Service'}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Licensing & agreement</span>
                    </button>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-rose-100 dark:border-rose-900/30">
                <div className="bg-rose-50 dark:bg-rose-900/10 p-8 md:p-10 rounded-[2.5rem] border border-rose-200 dark:border-rose-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-colors"></div>
                    <h4 className="text-2xl font-black text-rose-950 dark:text-rose-400 tracking-tighter mb-3 relative z-10">
                        {isSpanish ? 'Zona de Peligro' : 'Danger Zone'}
                    </h4>
                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300 mb-8 max-w-2xl leading-relaxed relative z-10">
                        {isSpanish
                            ? 'Eliminar tu cuenta borrará permanentemente todos tus datos de nuestros servidores y de este dispositivo. No podrás recuperar esta información, ten cuidado.'
                            : 'Deleting your account will permanently wipe all your data from our servers and this device. You will not be able to recover this information.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <button onClick={handleResetSystem} className="px-8 py-4 bg-white dark:bg-onyx-950 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors shadow-sm text-center">
                            {isSpanish ? 'Restablecer Sistema' : 'Reset System'}
                        </button>
                        <button onClick={handleDeleteAccount} className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 dark:shadow-none transition-all active:scale-95 text-center flex items-center justify-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            {isSpanish ? 'ELIMINAR CUENTA' : 'DELETE ACCOUNT'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
