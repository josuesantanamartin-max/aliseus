import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../../types';

interface CashflowAreaChartProps {
    transactions: Transaction[];
    height?: number;
}

const CashflowAreaChart: React.FC<CashflowAreaChartProps> = ({ transactions, height = 300 }) => {
    const data = useMemo(() => {
        // Simple aggregation logic for the last 30 days
        const today = new Date();
        const days = 30;
        const chartData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

            const dayTxs = (transactions || []).filter(t => t.date.startsWith(dateStr) && t.category !== 'Transferencia');
            const inc = dayTxs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
            const exp = dayTxs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

            chartData.push({
                date: displayDate,
                ingresos: inc,
                gastos: exp,
                fullDate: dateStr
            });
        }
        return chartData;
    }, [transactions]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 dark:bg-onyx-900/80 backdrop-blur-md border border-onyx-100 dark:border-onyx-800 p-3 rounded-xl shadow-lg">
                    <p className="font-bold text-onyx-900 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-onyx-600 dark:text-onyx-300 capitalize">{entry.name}:</span>
                            <span className="font-bold" style={{ color: entry.color }}>{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-onyx-200 dark:text-onyx-800/50" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-onyx-400 dark:text-onyx-500"
                        minTickGap={20}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `€${value.toLocaleString('es-ES')}`}
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-onyx-400 dark:text-onyx-500"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                    <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CashflowAreaChart;
