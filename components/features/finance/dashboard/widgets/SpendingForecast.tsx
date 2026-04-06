
import React, { useMemo } from 'react';
import { Transaction } from '../../../../../types';
import { TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '../../../../../hooks/useCurrency';

interface SpendingForecastProps {
    transactions: Transaction[];
}


const SpendingForecast: React.FC<SpendingForecastProps> = ({ transactions }) => {
    const { formatPrice } = useCurrency();
    const forecastData = useMemo(() => {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const currentDay = today.getDate();
        const daysRemaining = daysInMonth - currentDay;
        const currentMonth = today.toISOString().slice(0, 7);

        const currentMonthSpent = transactions
            .filter(t => t.type === 'EXPENSE' && t.date.startsWith(currentMonth) && t.category !== 'Transferencia')
            .reduce((sum, t) => sum + t.amount, 0);

        const dailyAverage = currentDay > 0 ? currentMonthSpent / currentDay : 0;
        const projectedTotal = currentMonthSpent + (dailyAverage * daysRemaining);
        const projectedRemaining = dailyAverage * daysRemaining;

        const last3Months: number[] = [];
        for (let i = 1; i <= 3; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().slice(0, 7);
            const monthTotal = transactions
                .filter(t => t.type === 'EXPENSE' && t.date.startsWith(monthStr) && t.category !== 'Transferencia')
                .reduce((sum, t) => sum + t.amount, 0);
            last3Months.push(monthTotal);
        }
        const avgLast3Months = last3Months.reduce((a, b) => a + b, 0) / last3Months.length;

        return {
            currentMonthSpent,
            projectedTotal,
            projectedRemaining,
            dailyAverage,
            avgLast3Months,
            currentDay,
            daysInMonth,
            daysRemaining
        };
    }, [transactions]);

    return (
        <div className="bg-white p-10 rounded-Aliseus border border-aliseus-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-cyan-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
                        Proyección de Gastos
                    </h3>
                    <p className="text-xs font-semibold text-aliseus-400 mt-2 uppercase tracking-[0.15em]">Basado en tendencias del periodo actual</p>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-aliseus-50/50 rounded-2xl border border-aliseus-100 group-hover:bg-red-50/30 group-hover:border-red-100 transition-all">
                        <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2 group-hover:text-red-700">Gastado hoy</p>
                        <p className="text-2xl font-bold text-aliseus-900 tracking-tight">{formatPrice(forecastData.currentMonthSpent)}</p>
                        <p className="text-[10px] font-semibold text-aliseus-400 mt-1 uppercase tracking-widest">{forecastData.currentDay} de {forecastData.daysInMonth} d</p>
                    </div>
                    <div className="p-6 bg-aliseus-50/50 rounded-2xl border border-aliseus-100 group-hover:bg-amber-50/30 group-hover:border-amber-100 transition-all">
                        <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2 group-hover:text-amber-700">Proyección</p>
                        <p className="text-2xl font-bold text-aliseus-900 tracking-tight">{formatPrice(forecastData.projectedTotal)}</p>
                        <p className="text-[10px] font-semibold text-aliseus-400 mt-1 uppercase tracking-widest">{formatPrice(forecastData.dailyAverage)}/día</p>
                    </div>
                    <div className="p-6 bg-aliseus-50/50 rounded-2xl border border-aliseus-100 group-hover:bg-cyan-50/30 group-hover:border-cyan-100 transition-all">
                        <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2 group-hover:text-cyan-700">Media 3 meses</p>
                        <p className="text-2xl font-bold text-aliseus-900 tracking-tight">{formatPrice(forecastData.avgLast3Months)}</p>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold mt-1.5 ${forecastData.projectedTotal > forecastData.avgLast3Months ? 'text-red-600' : 'text-emerald-600'}`}>
                            {forecastData.projectedTotal > forecastData.avgLast3Months ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {Math.abs(((forecastData.projectedTotal - forecastData.avgLast3Months) / forecastData.avgLast3Months) * 100).toFixed(1)}% vs Media
                        </div>
                    </div>
                </div>

                <div className="h-[220px] bg-aliseus-50/30 rounded-3xl p-6 border border-aliseus-100/50 h-full flex flex-col">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Gasto Real', value: forecastData.currentMonthSpent },
                            { name: 'Resto Estimado', value: forecastData.projectedRemaining },
                        ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="6 6" stroke="#E2E8F0" vertical={false} />
                            <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94A3B8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value, 0)} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '12px' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', marginBottom: '4px' }}
                                formatter={(value: number) => [formatPrice(value, 0), 'Cantidad']}
                            />
                            <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                                <Cell fill="#F43F5E" />
                                <Cell fill="#F59E0B" fillOpacity={0.6} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
};

export default SpendingForecast;
