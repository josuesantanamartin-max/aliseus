
import React, { useMemo } from 'react';
import { Transaction } from '../../../../../types';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
    transactions: Transaction[];
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

const TrendChart: React.FC<TrendChartProps> = ({ transactions }) => {
    const trendChartData = useMemo(() => {
        const months: string[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toISOString().slice(0, 7));
        }

        return months.map(month => {
            const monthIncome = transactions
                .filter(t => t.type === 'INCOME' && t.date.startsWith(month) && t.category !== 'Transferencia')
                .reduce((sum, t) => sum + t.amount, 0);

            const monthExpenses = transactions
                .filter(t => t.type === 'EXPENSE' && t.date.startsWith(month) && t.category !== 'Transferencia')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                Ingresos: monthIncome,
                Gastos: monthExpenses,
                Balance: monthIncome - monthExpenses
            };
        });
    }, [transactions]);

    return (
        <div className="bg-white dark:bg-aliseus-900 p-10 rounded-Aliseus border border-aliseus-100 dark:border-aliseus-800 shadow-sm hover:shadow-lg transition-all duration-500 group">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-xl font-bold text-cyan-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-aliseus-50 dark:bg-aliseus-800 text-cyan-primary rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/50 transition-colors"><TrendingUp className="w-5 h-5" /></div>
                        Tendencias Temporales
                    </h3>
                    <p className="text-[10px] font-bold text-aliseus-400 dark:text-aliseus-500 mt-2 uppercase tracking-[0.2em]">Últimos 6 meses de actividad</p>
                </div>
            </div>

            <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#94A3B8"
                            fontSize={10}
                            fontWeight={600}
                            axisLine={false}
                            tickLine={false}
                            tick={{ dy: 10 }}
                        />
                        <YAxis
                            stroke="#94A3B8"
                            fontSize={10}
                            fontWeight={600}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => value.toLocaleString('es-ES')}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                        />
                        <Area type="monotone" dataKey="Ingresos" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="Gastos" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;
