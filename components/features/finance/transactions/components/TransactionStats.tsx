
import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Banknote } from 'lucide-react';
import { useCurrency } from '../../../../../hooks/useCurrency';

interface TransactionStatsProps {
    filteredIncome: number;
    filteredExpenses: number;
}


const TransactionStats: React.FC<TransactionStatsProps> = ({ filteredIncome, filteredExpenses }) => {
    const { formatPrice: formatEUR } = useCurrency();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-10 rounded-Aliseus border border-aliseus-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 -mr-4 -mt-4">
                    <ArrowUpCircle className="w-40 h-40 text-emerald-600" />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100/50">
                        <ArrowUpCircle className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em]">Ingresos del Periodo</p>
                </div>
                <h3 className="text-4xl font-bold text-cyan-900 tracking-tight relative z-10">{formatEUR(filteredIncome)}</h3>
            </div>

            <div className="bg-white p-10 rounded-Aliseus border border-aliseus-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 -mr-4 -mt-4">
                    <ArrowDownCircle className="w-40 h-40 text-red-600" />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shadow-sm border border-red-100/50">
                        <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em]">Gastos Realizados</p>
                </div>
                <h3 className="text-4xl font-bold text-cyan-900 tracking-tight relative z-10">{formatEUR(filteredExpenses)}</h3>
            </div>

            <div className="bg-white p-10 rounded-Aliseus border border-aliseus-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 -mr-4 -mt-4">
                    <Banknote className="w-40 h-40 text-cyan-600" />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl shadow-sm border border-cyan-100/50">
                        <Banknote className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em]">Balance Neto</p>
                </div>
                <h3 className={`text-4xl font-bold tracking-tight relative z-10 ${filteredIncome - filteredExpenses >= 0 ? 'text-cyan-900' : 'text-red-600'}`}>
                    {formatEUR(filteredIncome - filteredExpenses)}
                </h3>
                <div className={`mt-4 w-full h-1.5 rounded-full overflow-hidden ${filteredIncome - filteredExpenses >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className={`h-full rounded-full transition-all duration-1000 ${filteredIncome - filteredExpenses >= 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`} style={{ width: '100%' }}></div>
                </div>
            </div>
        </div>
    );
};


export default TransactionStats;
