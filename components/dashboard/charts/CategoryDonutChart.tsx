import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '../../../types';

interface CategoryDonutChartProps {
    transactions: Transaction[];
    height?: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ transactions, height = 220 }) => {
    const data = useMemo(() => {
        const today = new Date();
        const monthStr = today.toISOString().slice(0, 7);
        const grouped: Record<string, number> = {};
        transactions
            .filter(t => t.type === 'EXPENSE' && t.date.startsWith(monthStr))
            .forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs" style={{ minHeight: height }}>
                Sin gastos este mes
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={height * 0.22}
                    outerRadius={height * 0.38}
                    paddingAngle={3}
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CategoryDonutChart;
