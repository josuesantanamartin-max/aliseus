import React from 'react';
import { CalendarRange, Scale } from 'lucide-react';

interface PeriodDetails {
    limit: number;
    spent: number;
    percentage: number;
    isExceeded: boolean;
}

interface BudgetSummaryCardsProps {
    selectedDetails: {
        monthly: PeriodDetails;
        yearly: PeriodDetails;
    };
    formatEUR: (amount: number) => string;
}

export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({ selectedDetails, formatEUR }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MONTHLY CARD */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${selectedDetails.monthly.limit > 0 ? 'bg-white border-onyx-100 shadow-sm' : 'bg-onyx-50/50 border-onyx-50 opacity-80'}`}>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarRange className="w-4 h-4 text-cyan-500" />
                            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">Este Mes</p>
                        </div>
                        <h3 className="text-3xl font-black text-cyan-900 tracking-tighter">{formatEUR(selectedDetails.monthly.spent)}</h3>
                    </div>
                    {selectedDetails.monthly.limit > 0 && (
                        <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${selectedDetails.monthly.isExceeded ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {selectedDetails.monthly.percentage.toFixed(0)}% Uso
                        </div>
                    )}
                </div>
                {selectedDetails.monthly.limit > 0 ? (
                    <div className="relative z-10">
                        <div className="w-full h-2 bg-onyx-100 rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${selectedDetails.monthly.isExceeded ? 'bg-red-500' : 'bg-cyan-500'}`}
                                style={{ width: `${Math.min(selectedDetails.monthly.percentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-right text-[10px] font-bold text-onyx-400 uppercase tracking-widest">
                            Límite: {formatEUR(selectedDetails.monthly.limit)}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-onyx-400 mt-2 font-medium">Sin límite mensual definido</p>
                )}
            </div>

            {/* YEARLY CARD */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${selectedDetails.yearly.limit > 0 ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white shadow-xl' : 'bg-onyx-50/50 border-onyx-50 opacity-80'}`}>
                {selectedDetails.yearly.limit > 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/30 rounded-full blur-2xl -mr-10 -mt-10"></div>}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Scale className={`w-4 h-4 ${selectedDetails.yearly.limit > 0 ? 'text-cyan-400' : 'text-onyx-300'}`} />
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedDetails.yearly.limit > 0 ? 'text-onyx-400' : 'text-onyx-400'}`}>Año Actual</p>
                        </div>
                        <h3 className={`text-3xl font-black tracking-tighter ${selectedDetails.yearly.limit > 0 ? 'text-white' : 'text-cyan-900'}`}>{formatEUR(selectedDetails.yearly.spent)}</h3>
                    </div>
                    {selectedDetails.yearly.limit > 0 && (
                        <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${selectedDetails.yearly.isExceeded ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                            {selectedDetails.yearly.percentage.toFixed(0)}% Uso
                        </div>
                    )}
                </div>
                {selectedDetails.yearly.limit > 0 ? (
                    <div className="relative z-10">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${selectedDetails.yearly.isExceeded ? 'bg-red-500' : 'bg-cyan-400'}`}
                                style={{ width: `${Math.min(selectedDetails.yearly.percentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-right text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Límite: {formatEUR(selectedDetails.yearly.limit)}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-onyx-400 mt-2 font-medium">Sin límite anual definido</p>
                )}
            </div>
        </div>
    );
};
