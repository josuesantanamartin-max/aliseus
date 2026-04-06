import React from 'react';
import { formatEUR } from './accountConstants';

interface AccountStatsCardsProps {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
}

export const AccountStatsCards: React.FC<AccountStatsCardsProps> = ({ netWorth, totalAssets, totalLiabilities }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: 'Patrimonio Neto', value: netWorth, color: 'cyan' },
            { label: 'Activos Totales', value: totalAssets, color: 'emerald' },
            { label: 'Pasivos', value: totalLiabilities, color: 'red' },
        ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-Aliseus shadow-sm border border-aliseus-100 flex flex-col justify-between h-32 overflow-hidden group hover:shadow-lg transition-all relative">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50/50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />
                <p className="text-aliseus-400 font-bold text-[10px] uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
                <h3 className="text-4xl font-bold text-cyan-900 tracking-tight relative z-10">{formatEUR(stat.value)}</h3>
            </div>
        ))}
    </div>
);
