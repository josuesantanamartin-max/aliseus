import React from 'react';
import { Wallet, TrendingUp, CreditCard, PieChart, Info } from 'lucide-react';

interface TravelFinanceProps {
    budget: number;
    spent: number;
    currency: string;
}

export const TravelFinance: React.FC<TravelFinanceProps> = ({ budget, spent, currency }) => {
    const progress = Math.min((spent / budget) * 100, 100);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                            <Wallet className="w-3 h-3" /> Control de Presupuesto
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tracking-tighter">{formatCurrency(spent)}</span>
                            <span className="text-xl font-medium text-gray-400">/ {formatCurrency(budget)}</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        <span>Utilizado {progress.toFixed(0)}%</span>
                        <span>Restante {formatCurrency(budget - spent)}</span>
                    </div>
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-white/10 p-0.5">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-300'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-sm">Tarjetas Vinculadas</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Aliseus Black â€¢â€¢â€¢ 4092</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-sm">Desglose de Gastos</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 text-purple-600 hover:underline cursor-pointer">Ver Analítica</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 border border-blue-100/50">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-xs font-medium text-blue-700 leading-relaxed">
                    Tus gastos en este viaje se sincronizan automáticamente con tu módulo de <strong>Finanzas</strong>. Las extracciones en cajeros internacionales tienen 0% de comisión con tu plan Círculo Aliseus Pro.
                </p>
            </div>
        </div>
    );
};
