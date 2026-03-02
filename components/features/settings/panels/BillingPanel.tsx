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
            className="max-w-4xl space-y-8 pb-12"
        >
            <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {isSpanish ? 'Facturación' : 'Billing'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Historial de pagos y métodos de facturación.' : 'Payment history and billing methods.'}
                </p>
            </div>

            <div className="space-y-6">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-indigo-500" /> {isSpanish ? 'Método de Pago' : 'Payment Method'}
                </h4>
                <div className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/40 dark:shadow-none space-y-6 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-12 bg-gray-50 dark:bg-onyx-950 rounded-xl flex items-center justify-center border border-gray-200 dark:border-onyx-800 shadow-inner group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors">
                                <span className="font-black text-lg text-indigo-600 dark:text-indigo-400 italic flex items-center justify-center">VISA</span>
                            </div>
                            <div>
                                <h5 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                    {isSpanish ? 'Visa terminada en' : 'Visa ending in'} <span className="text-indigo-500">4242</span>
                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] uppercase tracking-widest rounded-md border border-emerald-200 dark:border-emerald-800">
                                        Default
                                    </span>
                                </h5>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                                    {isSpanish ? 'Expira' : 'Expires'}: 12/28
                                </p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-gray-50 dark:bg-onyx-950 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-onyx-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner hover:shadow-md shrink-0">
                            {isSpanish ? 'Actualizar' : 'Update'}
                        </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-onyx-800 pt-6">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                            {isSpanish ? 'Añadir otro método' : 'Add another method'}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-4 bg-white dark:bg-onyx-900 border border-gray-200 dark:border-onyx-700 text-gray-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-onyx-800 transition-colors shadow-sm">
                                <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-5 h-5 dark:invert" alt="Apple Pay" />
                                Apple Pay
                            </button>
                            <button className="flex items-center justify-center gap-3 py-4 bg-[#003087] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#002266] transition-colors shadow-sm">
                                <img src="https://www.svgrepo.com/show/475667/paypal-color.svg" className="w-5 h-5" alt="PayPal" />
                                PayPal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-500" /> {isSpanish ? 'Historial de Facturas' : 'Invoice History'}
                </h4>
                <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden">
                    {[1, 2, 3].map((i) => {
                        const months = isSpanish ? ['Oct', 'Nov', 'Dic'] : language === 'FR' ? ['Oct', 'Nov', 'Déc'] : ['Oct', 'Nov', 'Dec'];
                        return (
                            <div key={i} className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-onyx-800 last:border-0 hover:bg-gray-50 dark:hover:bg-onyx-950/50 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-onyx-950 rounded-xl flex items-center justify-center border border-gray-200 dark:border-onyx-800 shadow-inner group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors">
                                        <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h5 className="text-base font-black text-gray-900 dark:text-white mb-2">
                                            {isSpanish ? 'Factura' : 'Invoice'} #{1000 + i}
                                        </h5>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                            <Check className="w-3 h-3" /> {months[i - 1]} 12, 2026
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{priceStr}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    );
};
