
import React, { useMemo } from 'react';
import { Transaction } from '../../../../../types';
import { PieChart as PieChartIcon, ArrowRight, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryDistributionChartProps {
    transactions: Transaction[];
    onNavigate: (app: string, tab?: string) => void;
    selectedDate: Date;
    timeMode: 'MONTH' | 'YEAR';
    onFilter?: (category: string, subCategory?: string) => void;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
    transactions,
    onNavigate,
    selectedDate,
    timeMode,
    onFilter
}) => {

    const { chartData, total } = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const filteredTxs = transactions.filter(t => {
            const tDate = new Date(t.date);
            if (timeMode === 'YEAR') {
                return tDate.getFullYear() === year && t.type === 'EXPENSE' && t.category !== 'Transferencia';
            } else {
                return tDate.getFullYear() === year && tDate.getMonth() === month && t.type === 'EXPENSE' && t.category !== 'Transferencia';
            }
        });

        const grouped = filteredTxs.reduce((acc, t) => {
            const cat = t.category || 'Otros';
            const subCat = t.subCategory || 'General';

            if (!acc[cat]) {
                acc[cat] = { value: 0, subcategories: {} };
            }
            acc[cat].value += t.amount;
            acc[cat].subcategories[subCat] = (acc[cat].subcategories[subCat] || 0) + t.amount;

            return acc;
        }, {} as Record<string, { value: number; subcategories: Record<string, number> }>);

        const data = Object.entries(grouped)
            .map(([name, data]) => ({
                name,
                value: data.value,
                subcategories: Object.entries(data.subcategories)
                    .map(([subName, subValue]) => ({ name: subName, value: subValue }))
                    .sort((a, b) => b.value - a.value)
            }))
            .sort((a, b) => b.value - a.value); // Top categories first

        const totalAmount = data.reduce((sum, d) => sum + d.value, 0);
        return { chartData: data, total: totalAmount };
    }, [transactions, selectedDate, timeMode]);

    const COLORS = ['#6366F1', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    const periodLabel = timeMode === 'MONTH'
        ? selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        : selectedDate.getFullYear().toString();

    const handleCategoryClick = (category: string) => {
        if (onFilter) {
            onFilter(category);
        }
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 p-8 rounded-3xl border border-aliseus-100 dark:border-aliseus-800 shadow-sm relative overflow-hidden group h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
                <div>
                    <h3 className="text-xl font-bold text-cyan-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-primary dark:text-cyan-400 rounded-lg"><PieChartIcon className="w-5 h-5" /></div>
                        Distribución de Gastos
                    </h3>
                    <p className="text-xs font-semibold text-aliseus-400 dark:text-aliseus-500 mt-2 uppercase tracking-[0.15em] flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        {periodLabel}
                    </p>
                </div>
                <button onClick={() => onNavigate('finance', 'transactions')} className="text-xs font-bold text-aliseus-400 hover:text-cyan-900 flex items-center gap-2 transition-colors group">
                    Ver detalles <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {chartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-aliseus-300 dark:text-aliseus-600 relative z-10 min-h-[300px]">
                    <PieChartIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">Sin datos en este periodo</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative z-10 flex-1">
                    {/* Left Column: Pie Chart */}
                    <div className="relative h-[300px] lg:h-full min-h-[300px] flex items-center justify-center col-span-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    onClick={(data) => handleCategoryClick(data.name)}
                                    className="cursor-pointer focus:outline-none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    formatter={(value: number) => [formatEUR(value), '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest">Total</span>
                            <span className="text-3xl font-black text-cyan-900 dark:text-white tracking-tight mt-1">{formatEUR(total)}</span>
                        </div>
                    </div>

                    {/* Right Column: Detailed List */}
                    <div className="col-span-1 lg:col-span-2 space-y-6 lg:max-h-[500px] lg:overflow-y-auto custom-scrollbar pr-4">
                        {chartData.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const color = COLORS[index % COLORS.length];

                            return (
                                <div
                                    key={item.name}
                                    className="p-5 bg-aliseus-50/50 dark:bg-aliseus-800/50 rounded-2xl border border-aliseus-100/50 dark:border-aliseus-700/50 hover:bg-white dark:hover:bg-aliseus-800 hover:shadow-md transition-all group/item"
                                >
                                    {/* Category Header */}
                                    <div
                                        onClick={() => handleCategoryClick(item.name)}
                                        className="flex items-center justify-between mb-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white dark:ring-aliseus-800" style={{ backgroundColor: color }}></div>
                                            <span className="text-base font-bold text-aliseus-900 dark:text-white group-hover/item:text-cyan-primary transition-colors">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-black text-cyan-900 dark:text-white tracking-tight">{formatEUR(item.value)}</p>
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 h-1.5 bg-aliseus-200 dark:bg-aliseus-700 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-aliseus-400">{percentage.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subcategories */}
                                    <div className="space-y-2 pl-8 border-l-2 border-dashed border-aliseus-100 dark:border-aliseus-700 ml-2">
                                        {item.subcategories.slice(0, 5).map((sub, idx) => (
                                            <div
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onFilter) onFilter(item.name, sub.name);
                                                }}
                                                className="flex justify-between items-center text-xs group/sub cursor-pointer hover:bg-aliseus-100/50 dark:hover:bg-aliseus-700/50 p-1.5 rounded-lg -mx-1.5 transition-colors relative z-20"
                                            >
                                                <span className="text-aliseus-500 dark:text-aliseus-400 font-medium group-hover/sub:text-cyan-primary transition-colors pointer-events-none">{sub.name}</span>
                                                <span className="text-aliseus-700 dark:text-aliseus-300 font-bold pointer-events-none">{formatEUR(sub.value)}</span>
                                            </div>
                                        ))}
                                        {item.subcategories.length > 5 && (
                                            <p className="text-[10px] text-aliseus-400 italic text-right">+{item.subcategories.length - 5} más...</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-soft/10 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
};

export default CategoryDistributionChart;
