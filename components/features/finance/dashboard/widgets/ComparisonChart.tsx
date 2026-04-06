
import React, { useMemo } from 'react';
import { Transaction } from '../../../../../types';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonChartProps {
    transactions: Transaction[];
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

const ComparisonChart: React.FC<ComparisonChartProps> = ({ transactions }) => {
    const comparisonChartData = useMemo(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const prevMonth = new Date();
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const prevMonthStr = prevMonth.toISOString().slice(0, 7);

        const currentData = transactions
            .filter(t => t.date.startsWith(currentMonth) && t.category !== 'Transferencia')
            .reduce((acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const prevData = transactions
            .filter(t => t.date.startsWith(prevMonthStr) && t.category !== 'Transferencia')
            .reduce((acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        return [
            {
                category: 'Ingresos',
                actual: currentData.INCOME || 0,
                anterior: prevData.INCOME || 0,
            },
            {
                category: 'Gastos',
                actual: currentData.EXPENSE || 0,
                anterior: prevData.EXPENSE || 0,
            },
            {
                category: 'Balance',
                actual: (currentData.INCOME || 0) - (currentData.EXPENSE || 0),
                anterior: (prevData.INCOME || 0) - (prevData.EXPENSE || 0),
            }
        ];
    }, [transactions]);

    return (
        <div className="bg-white p-10 rounded-Aliseus border border-aliseus-100 shadow-sm hover:shadow-lg transition-all duration-500 group">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-xl font-bold text-cyan-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-aliseus-50 text-cyan-primary rounded-lg group-hover:bg-cyan-50 transition-colors"><Activity className="w-5 h-5" /></div>
                        Comparativa Mensual
                    </h3>
                    <p className="text-[10px] font-bold text-aliseus-400 mt-2 uppercase tracking-[0.2em]">Rendimiento frente al periodo anterior</p>
                </div>
            </div>

            <div className="space-y-10">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis
                                dataKey="category"
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
                            <Bar dataKey="actual" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Mes Actual" barSize={32} />
                            <Bar dataKey="anterior" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="Mes Anterior" barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4">
                    {comparisonChartData.map((item) => {
                        const change = item.anterior > 0
                            ? ((item.actual - item.anterior) / item.anterior) * 100
                            : 0;
                        const isPositiveChange = item.category === 'Ingresos' || item.category === 'Balance'
                            ? change > 0
                            : change < 0;

                        return (
                            <div key={item.category} className="p-5 bg-aliseus-50/50 rounded-2xl border border-aliseus-100/30 hover:bg-white hover:shadow-md transition-all duration-300">
                                <p className="text-[9px] font-bold text-aliseus-400 uppercase tracking-widest mb-2.5">{item.category}</p>
                                <p className="text-lg font-bold text-cyan-900 tracking-tight mb-2">{formatEUR(item.actual)}</p>
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isPositiveChange ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {isPositiveChange ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                    {Math.abs(change).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ComparisonChart;
