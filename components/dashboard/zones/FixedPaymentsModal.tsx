import React, { useState } from 'react';
import { X, CheckCircle2, CircleDashed, CalendarCheck } from 'lucide-react';
import { Transaction } from '../../../types';

export interface PendingFixedPayment {
    id: string;
    category: string;
    expectedAmount: number;
    paidAmount: number;
    remainingAmount: number;
}

interface FixedPaymentsModalProps {
    onClose: () => void;
    paidItems: Transaction[];
    pendingItems: PendingFixedPayment[];
    formatCurrency: (val: number) => string;
}

export const FixedPaymentsModal: React.FC<FixedPaymentsModalProps> = ({ onClose, paidItems, pendingItems, formatCurrency }) => {
    const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID'>('PENDING');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-onyx-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 dark:border-onyx-800">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-onyx-800 flex justify-between items-center bg-slate-50/50 dark:bg-onyx-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Pagos Fijos</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Detalle del Mes</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-onyx-800 rounded-full shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-6 pb-2 shrink-0">
                    <div className="flex bg-slate-100 dark:bg-onyx-800 p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('PENDING')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'PENDING'
                                ? 'bg-white dark:bg-onyx-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Pendientes ({pendingItems.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('PAID')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'PAID'
                                ? 'bg-white dark:bg-onyx-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Pagados ({paidItems.length})
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'PENDING' && (
                        <div className="space-y-4 animate-fade-in text-left">
                            {pendingItems.length === 0 ? (
                                <div className="text-center py-10">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">¡Todo pagado! No hay pagos fijos pendientes.</p>
                                </div>
                            ) : (
                                pendingItems.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700 rounded-2xl p-4 flex justify-between items-center hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <CircleDashed className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{item.category}</p>
                                                {item.paidAmount > 0 && (
                                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                        Pagado: {formatCurrency(item.paidAmount)} de {formatCurrency(item.expectedAmount)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 dark:text-white">{formatCurrency(item.remainingAmount)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restante</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'PAID' && (
                        <div className="space-y-4 animate-fade-in text-left">
                            {paidItems.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-onyx-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CalendarCheck className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Aún no se ha registrado ningún pago fijo este mes.</p>
                                </div>
                            ) : (
                                paidItems.map((tx) => (
                                    <div key={tx.id} className="bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700 rounded-2xl p-4 flex justify-between items-center hover:border-emerald-200 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.description || tx.category}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-slate-100 dark:bg-onyx-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold uppercase">{tx.category}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-slate-900 dark:text-white">{formatCurrency(tx.amount)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
