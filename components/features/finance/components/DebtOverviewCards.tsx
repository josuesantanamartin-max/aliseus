import React from 'react';
import { Banknote, Flame, PieChart } from 'lucide-react';
import { Debt } from '../../../../types';

interface DebtOverviewCardsProps {
    debts: Debt[];
    totalMonthlyInterest: number;
    formatEUR: (amount: number) => string;
}

export const DebtOverviewCards: React.FC<DebtOverviewCardsProps> = ({ debts, totalMonthlyInterest, formatEUR }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-aliseus-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2">Pasivo Total Global</p>
                    <h3 className="text-3xl font-black text-cyan-900 tracking-tight">{formatEUR(debts.reduce((acc, d) => acc + d.remainingBalance, 0))}</h3>
                </div>
                <div className="p-4 bg-aliseus-50 text-cyan-900 rounded-2xl group-hover:scale-110 transition-transform">
                    <Banknote className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-aliseus-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2">Compromiso Mensual</p>
                    <h3 className="text-3xl font-black text-cyan-900 tracking-tight">{formatEUR(debts.reduce((acc, d) => acc + d.minPayment, 0))}</h3>
                </div>
                <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-aliseus-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2">Carga de Intereses</p>
                    <h3 className="text-3xl font-black text-red-600 tracking-tight">-{formatEUR(totalMonthlyInterest)}<span className="text-sm text-aliseus-400 font-bold">/mes</span></h3>
                </div>
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <PieChart className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};
