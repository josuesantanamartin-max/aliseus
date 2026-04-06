import React from 'react';
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';

interface SavingsRateWidgetProps {
    monthlyIncome: number;
    monthlyExpenses: number;
}

const SavingsRateWidget: React.FC<SavingsRateWidgetProps> = ({ monthlyIncome, monthlyExpenses }) => {
    let savingsRate = 0;
    if (monthlyIncome > 0) {
        savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
    }

    const isHealthy = savingsRate >= 20;
    const isNegative = savingsRate < 0;

    return (
        <div className="bg-white dark:bg-aliseus-900 p-5 rounded-[2rem] border border-aliseus-100 dark:border-aliseus-800 shadow-sm relative overflow-hidden h-full flex flex-col justify-between group/widget hover:shadow-lg transition-all">
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl transition-colors ${isNegative ? 'bg-rose-500/5 group-hover/widget:bg-rose-500/10' : isHealthy ? 'bg-emerald-500/5 group-hover/widget:bg-emerald-500/10' : 'bg-amber-500/5 group-hover/widget:bg-amber-500/10'}`}></div>

            <div className="flex justify-between items-start relative z-10">
                <div className={`p-2.5 rounded-2xl shadow-inner group-hover/widget:scale-110 transition-transform ${isNegative ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600' : isHealthy ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600'}`}>
                    <PiggyBank className="w-5 h-5" />
                </div>
                {savingsRate !== 0 && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isNegative ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800' : isHealthy ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800'}`}>
                        {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {Math.abs(savingsRate).toFixed(1)}%
                    </span>
                )}
            </div>

            <div className="relative z-10 mt-4">
                <h4 className="text-[10px] font-black text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest mb-1">Tasa de Ahorro</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-cyan-900 dark:text-white tracking-tighter">
                        {savingsRate.toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="relative z-10 mt-6 w-full bg-aliseus-50 dark:bg-aliseus-800 h-1.5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${isNegative ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : isHealthy ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'}`}
                    style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                ></div>
            </div>
            <p className="text-[11px] font-bold text-aliseus-400 mt-3 relative z-10">
                {isNegative ? 'Gastando más de lo ingresado' : isHealthy ? '¡Ahorro óptimo > 20%!' : 'Apunta a ahorrar el 20%'}
            </p>
        </div>
    );
};

export default SavingsRateWidget;
