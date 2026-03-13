
import React from 'react';
import { Debt } from '../../../../../types';
import { CreditCard, Home, Car, ShieldCheck, ArrowRight } from 'lucide-react';

interface ActiveDebtsWidgetProps {
    debts: Debt[];
    onNavigate: (app: string, tab?: string) => void;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

const ActiveDebtsWidget: React.FC<ActiveDebtsWidgetProps> = ({ debts, onNavigate }) => {
    const activeDebts = debts.filter(d => d.remainingBalance > 0).sort((a, b) => b.remainingBalance - a.remainingBalance);

    return (
        <div>
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold text-cyan-900 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                    Deudas y Préstamos
                </h3>
                <button onClick={() => onNavigate('finance', 'debts')} className="text-xs font-bold text-onyx-400 hover:text-cyan-900 flex items-center gap-2 transition-colors group">
                    Ver todo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {activeDebts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {activeDebts.map(debt => {
                        const progress = ((debt.originalAmount - debt.remainingBalance) / debt.originalAmount) * 100;
                        const monthlyInterest = (debt.remainingBalance * (debt.interestRate / 100)) / 12;

                        let DebtIcon = CreditCard;
                        if (debt.type === 'MORTGAGE') DebtIcon = Home;
                        if (debt.type === 'LOAN') DebtIcon = Car;

                        const debtTypeLabels: Record<string, string> = {
                            'MORTGAGE': 'HIPOTECA',
                            'LOAN': 'PRÉSTAMO',
                            'CREDIT_CARD': 'TARJETA',
                            'OTHER': 'OTRA'
                        };

                        return (
                            <div key={debt.id} onClick={() => onNavigate('finance', 'debts')} className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-onyx-100 dark:border-onyx-800 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 min-h-[160px] h-full flex flex-col">
                                <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-red-50/20 dark:from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center gap-5 md:w-1/3">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl shadow-inner group-hover:scale-105 transition-transform">
                                        <DebtIcon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-cyan-900 dark:text-white leading-none mb-1.5">{debt.name}</h4>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[9px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800 uppercase tracking-tighter">
                                                {debtTypeLabels[debt.type] || debt.type}
                                            </span>
                                            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-800 uppercase">
                                                {debt.interestRate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2.5 min-w-0">
                                    <div className="flex justify-between items-end gap-4">
                                        <div className="flex items-end gap-5">
                                            <div>
                                                <p className="text-[9px] font-black text-red-900/40 dark:text-red-300/40 uppercase tracking-widest mb-0.5">Pendiente</p>
                                                <p className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tighter leading-none">{formatEUR(debt.remainingBalance)}</p>
                                            </div>
                                            <div className="h-8 w-px bg-onyx-100 dark:bg-onyx-800 mb-0.5"></div>
                                            <div className="whitespace-nowrap">
                                                <p className="text-[9px] font-black text-onyx-400 dark:text-onyx-500 uppercase tracking-widest mb-0.5">Original</p>
                                                <p className="text-base font-bold text-onyx-400 dark:text-onyx-500 tracking-tight leading-none">{formatEUR(debt.originalAmount)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[11px] font-black text-onyx-600 dark:text-onyx-300 bg-onyx-50 dark:bg-onyx-800 px-2.5 py-0.5 rounded-full border border-onyx-100 dark:border-onyx-700">{progress.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-onyx-50 dark:bg-onyx-800 h-2.5 rounded-full overflow-hidden border border-onyx-100/50 dark:border-onyx-700/50 relative">
                                        <div className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-1000 shadow-[0_0_8px_rgba(220,38,38,0.15)]" style={{ width: `${progress}%` }}></div>
                                    </div>

                                    <div className="flex justify-between items-center text-[9px] font-black text-onyx-400 uppercase tracking-widest">
                                        <p className="flex items-center gap-1.5 text-amber-700/70 truncate">
                                            <ArrowRight className="w-2.5 h-2.5 rotate-45 shrink-0" /> Interés: ~{formatEUR(Math.abs(monthlyInterest))}/mes
                                        </p>
                                        <p className="text-red-900/20 whitespace-nowrap ml-2">Vence: {debt.endDate ? new Date(debt.endDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-onyx border border-onyx-100 text-center shadow-sm">
                    <div className="w-16 h-16 bg-onyx-50 text-onyx-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-onyx-900 mb-2">¡Sin deudas activas!</h4>
                    <p className="text-xs text-onyx-400 font-bold uppercase tracking-[0.2em]">Tu salud financiera es excelente</p>
                </div>
            )}
        </div>
    );
};

export default ActiveDebtsWidget;
