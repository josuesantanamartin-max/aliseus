import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../../types';

interface CategoryDonutChartProps {
    transactions: Transaction[];
    month?: number;
    year?: number;
    height?: number;
}

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#64748b'];

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
    transactions,
    month = new Date().getMonth(),
    year = new Date().getFullYear(),
    height = 250
}) => {
    const data = useMemo(() => {
        const expenses = (transactions || []).filter(t => {
            const date = new Date(t.date);
            return t.type === 'EXPENSE' &&
                t.category !== 'Transferencia' &&
                date.getMonth() === month &&
                date.getFullYear() === year;
        });

        const grouped: Record<string, number> = {};
        expenses.forEach(t => {
            const cat = t.category || 'Otros';
            grouped[cat] = (grouped[cat] || 0) + t.amount;
        });

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            // Take top 5, merge rest into 'Otros'
            .reduce((acc, curr, i, arr) => {
                if (i < 5) {
                    acc.push(curr);
                } else if (i === 5) {
                    const otrosValue = arr.slice(5).reduce((sum, item) => sum + item.value, 0);
                    acc.push({ name: 'Otros', value: otrosValue });
                }
                return acc;
            }, [] as { name: string, value: number }[]);

    }, [transactions, month, year]);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percent = ((data.value / total) * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 });
            return (
                <div className="bg-white/80 dark:bg-onyx-900/80 backdrop-blur-md border border-onyx-100 dark:border-onyx-800 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: payload[0].color }} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-onyx-500 dark:text-onyx-400 uppercase tracking-wider">{data.name}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-onyx-900 dark:text-white">{formatCurrency(data.value)}</span>
                            <span className="text-xs font-bold text-onyx-400">{percent}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center text-onyx-400 dark:text-onyx-500 font-bold" style={{ height }}>
                No hay gastos registrados
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-onyx-400 uppercase tracking-widest">Gasto Total</span>
                <span className="text-xl font-black text-onyx-900 dark:text-white">{formatCurrency(total)}</span>
            </div>
        </div>
    );
};

export default CategoryDonutChart;
