import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, FileText, Download, Check } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';

export const BillingPanel = () => {
    const { language } = useUserStore();
    const isSpanish = language === 'ES';

    const priceStr = '2,99€'; // Static for UI mock

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-12 pb-12"
        >
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-indigo-400 rounded-2xl border border-blue-500/20 shadow-inner">
                        <CreditCard className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isSpanish ? 'Método de Pago' : 'Payment Method'}
                        </h3>
                        <p className="text-[10px] font-black text-blue-600/40 dark:text-indigo-300/40 uppercase tracking-widest mt-1">Gestión Segura de Aura</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary Card Visualization */}
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group aspect-[1.6/1] flex flex-col justify-between border border-white/20">
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700" />
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="w-14 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center">
                                <span className="font-black text-white italic tracking-tighter">VISA</span>
                            </div>
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black text-white uppercase tracking-[0.2em] rounded-full">
                                {isSpanish ? 'Principal' : 'Default'}
                            </span>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-1.5">
                                        {[1, 2, 3, 4].map(j => (
                                            <div key={j} className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                                        ))}
                                    </div>
                                ))}
                                <span className="text-xl font-black text-white tracking-[0.2em]">4242</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">{isSpanish ? 'Titular' : 'Card Holder'}</p>
                                    <p className="text-sm font-black text-white uppercase tracking-widest">JOSUE S. MARTÍN</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">{isSpanish ? 'Expira' : 'Expires'}</p>
                                    <p className="text-sm font-black text-white tracking-widest">12/28</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Alternative Methods */}
                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="flex gap-4">
                            <button className="flex-1 p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all group flex flex-col items-center gap-3 shadow-sm">
                                <div className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                                    <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-6 h-6 dark:invert" alt="Apple Pay" />
                                </div>
                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Apple Pay</span>
                            </button>
                            <button className="flex-1 p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all group flex flex-col items-center gap-3 shadow-sm">
                                <div className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                                    <img src="https://www.svgrepo.com/show/475667/paypal-color.svg" className="w-6 h-6" alt="PayPal" />
                                </div>
                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">PayPal</span>
                            </button>
                        </div>
                        <button className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-4">
                            {isSpanish ? 'Cambiar Método' : 'Change Method'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice History Section */}
            <div className="space-y-8 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Historial de Facturas' : 'Invoice History'}
                            </h3>
                            <p className="text-[10px] font-black text-emerald-600/40 dark:text-emerald-300/40 uppercase tracking-widest mt-1">Transacciones Recientes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 dark:bg-onyx-900/50 rounded-[40px] border border-slate-200/50 dark:border-white/5 overflow-hidden backdrop-blur-sm shadow-xl shadow-slate-200/40 dark:shadow-none">
                    {[1, 2, 3].map((i) => {
                        const months = isSpanish ? ['Oct', 'Nov', 'Dic'] : language === 'FR' ? ['Oct', 'Nov', 'Déc'] : ['Oct', 'Nov', 'Dec'];
                        return (
                            <div key={i} className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-white/60 dark:hover:bg-white/5 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-blue-500/50 transition-colors shadow-inner">
                                        <Download className="w-6 h-6 text-slate-400 dark:text-indigo-400/60 group-hover:text-blue-500 dark:group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <div>
                                        <h5 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                            {isSpanish ? 'Factura de' : 'Invoice for'} {months[i - 1]}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{202400 + i}</span>
                                            <div className="w-1 h-1 bg-slate-200 dark:bg-gray-700 rounded-full" />
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <Check className="w-3 h-3" /> {isSpanish ? 'Pagado' : 'Paid'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{priceStr}</div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{months[i - 1]} 12, 2026</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    );
};
