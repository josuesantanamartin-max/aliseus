import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Transaction } from '../../../types';

interface CashflowAreaChartProps {
    transactions: Transaction[];
    height?: number;
}

const CashflowAreaChart: React.FC<CashflowAreaChartProps> = ({ transactions, height = 250 }) => {
    const data = useMemo(() => {
        const today = new Date();
        const months: { name: string; Ingresos: number; Gastos: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStr = d.toISOString().slice(0, 7);
            const txs = transactions.filter(t => t.date.startsWith(monthStr));
            months.push({
                name: d.toLocaleDateString('es-ES', { month: 'short' }),
                Ingresos: txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
                Gastos: txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
            });
        }
        return months;
    }, [transactions]);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="gradInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                <Tooltip
                    formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} fill="url(#gradInc)" dot={false} />
                <Area type="monotone" dataKey="Gastos" stroke="#f43f5e" strokeWidth={2} fill="url(#gradExp)" dot={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default CashflowAreaChart;
