import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { formatCurrency } from './widgetUtils';

export interface PendingFixedPayment {
    id: string;
    category: string;
    expectedAmount: number;
    paidAmount: number;
    remainingAmount: number;
}

export interface FixedPaymentsWidgetProps {
    fixedPayments: {
        paid: number;
        expected: number;
        remaining: number;
        items: any[];
        pendingItems: PendingFixedPayment[];
    };
}

export const FixedPaymentsWidget: React.FC<FixedPaymentsWidgetProps> = ({ fixedPayments }) => {
    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-3xl p-6 border border-slate-100 dark:border-aliseus-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-slate-400" />
                    Pagos Fijos del Mes
                </h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(fixedPayments.paid)}</span>
                    <span className="text-xs font-bold text-slate-400">/ {formatCurrency(fixedPayments.expected)}</span>
                </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-aliseus-800 rounded-full h-1.5 mb-2 overflow-hidden shrink-0">
                <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (fixedPayments.paid / Math.max(1, fixedPayments.expected)) * 100)}% ` }}
                />
            </div>

            <div className="flex justify-between items-center text-xs font-bold mb-4 shrink-0">
                <span className="text-slate-500">
                    {fixedPayments.items.length} pagados
                </span>
                <span className="text-slate-800 dark:text-slate-300">
                    {fixedPayments.pendingItems ? fixedPayments.pendingItems.length : 0} pendientes
                </span>
            </div>

            {/* Contenedor scrolleable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-3 min-h-[140px] max-h-[160px]">
                {/* Pendientes */}
                {fixedPayments.pendingItems && fixedPayments.pendingItems.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-aliseus-900/90 backdrop-blur-sm py-1 z-10">Pendientes</h4>
                        {fixedPayments.pendingItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-50 dark:bg-aliseus-800/50 p-2 rounded-xl">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mr-2">{item.category}</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.remainingAmount)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagados */}
                {fixedPayments.items && fixedPayments.items.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 dark:bg-aliseus-900/90 backdrop-blur-sm py-1 z-10">Pagados</h4>
                        {fixedPayments.items.map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center bg-slate-50 dark:bg-aliseus-800/50 p-2 rounded-xl">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate mr-2">{tx.description || tx.category}</span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(tx.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {fixedPayments.items.length === 0 && (!fixedPayments.pendingItems || fixedPayments.pendingItems.length === 0) && (
                    <div className="text-center text-xs text-slate-400 py-4">
                        No hay pagos fijos programados.
                    </div>
                )}
            </div>
        </div>
    );
};
