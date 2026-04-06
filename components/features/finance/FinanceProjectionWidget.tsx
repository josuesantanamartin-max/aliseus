import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useUserStore } from '../../../store/useUserStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react';

type Timeframe = '1M' | '3M' | '6M' | '1Y';

const FinanceProjectionWidget = () => {
    const { transactions, accounts } = useFinanceStore();
    const { currency } = useUserStore();
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const currentBalance = useMemo(() => accounts.reduce((acc, curr) => acc + curr.balance, 0), [accounts]);

    const getDaysForTimeframe = (tf: Timeframe) => {
        switch (tf) {
            case '1M': return 30;
            case '3M': return 90;
            case '6M': return 180;
            case '1Y': return 365;
            default: return 30;
        }
    };

    const daysToProject = getDaysForTimeframe(timeframe);

    // Calculate Average Daily Net Flow (Always use Last 30 Days as base for accuracy)
    const projectionData = useMemo(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const recentTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);

        const income = recentTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const expenses = recentTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

        const netFlow = income - expenses;
        const dailyAvg = netFlow / 30;

        // Generate next N days
        const data = [];
        let predictedBalance = currentBalance;

        // Determine spacing for data points to keep chart from being too dense for larger timeframes
        const step = daysToProject <= 30 ? 1 : daysToProject <= 90 ? 3 : daysToProject <= 180 ? 7 : 14;

        for (let i = 0; i <= daysToProject; i += step) {
            const date = new Date();
            date.setDate(today.getDate() + i);

            // Format date for tooltip
            const formattedDate = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', ...(daysToProject > 180 ? { year: 'numeric' } : {}) });

            data.push({
                day: i === 0 ? 'Hoy' : `+${i}d`,
                displayDate: formattedDate,
                date: date.toISOString().split('T')[0],
                balance: predictedBalance,
                trend: dailyAvg >= 0 ? 'positive' : 'negative'
            });

            // Add the average daily change multiplied by step
            predictedBalance += (dailyAvg * step);
        }

        // Ensure the exact last day is always included if the step missed it
        if (data[data.length - 1].day !== `+${daysToProject}d`) {
            const finalDate = new Date();
            finalDate.setDate(today.getDate() + daysToProject);
            data.push({
                day: `+${daysToProject}d`,
                displayDate: finalDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', ...(daysToProject > 180 ? { year: 'numeric' } : {}) }),
                date: finalDate.toISOString().split('T')[0],
                balance: currentBalance + (dailyAvg * daysToProject),
                trend: dailyAvg >= 0 ? 'positive' : 'negative'
            });
        }

        return { data, dailyAvg };
    }, [transactions, currentBalance, daysToProject]);

    const isPositive = projectionData.dailyAvg >= 0;
    const projectedAmount = projectionData.data[projectionData.data.length - 1].balance;
    // const difference = projectedAmount - currentBalance;

    const getTimeframeLabel = (tf: Timeframe) => {
        switch (tf) {
            case '1M': return '1 Mes';
            case '3M': return '3 Meses';
            case '6M': return '6 Meses';
            case '1Y': return '1 Año';
        }
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-3xl border border-gray-100 dark:border-aliseus-800 shadow-sm h-full flex flex-col relative">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-cyan-500" />
                            Proyección a {getTimeframeLabel(timeframe)}
                        </h3>

                        {/* Dropdown Container */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="bg-gray-50 dark:bg-aliseus-800 hover:bg-gray-100 dark:hover:bg-aliseus-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-gray-200 dark:border-aliseus-700"
                            >
                                {getTimeframeLabel(timeframe)} <ChevronDown className="w-3 h-3" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-aliseus-800 border border-gray-100 dark:border-aliseus-700 shadow-xl rounded-xl py-2 w-32 animate-in fade-in slide-in-from-top-2">
                                    {(['1M', '3M', '6M', '1Y'] as Timeframe[]).map((tf) => (
                                        <button
                                            key={tf}
                                            onClick={() => {
                                                setTimeframe(tf);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${timeframe === tf ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-aliseus-700 font-medium'}`}
                                        >
                                            {getTimeframeLabel(tf)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Base: Tendencia de últimos 30 días</p>
                </div>
                <div className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0 ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {isPositive ? 'Crecimiento' : 'Descenso'}
                </div>
            </div>

            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData.data}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            interval={timeframe === '1M' ? 5 : "preserveStartEnd"}
                            minTickGap={20}
                        />
                        <YAxis
                            hide
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}
                            itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                            labelStyle={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                            labelFormatter={(label, payload) => {
                                // Extract the formatted displayDate we prepared
                                if (payload && payload.length > 0) {
                                    return payload[0].payload.displayDate || label;
                                }
                                return label;
                            }}
                            formatter={(value: number | string | Array<number | string> | undefined) => [new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency || 'EUR' }).format(Number(value) || 0), 'Balance Estimado']}
                        />
                        <ReferenceLine y={currentBalance} stroke="#E5E7EB" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke={isPositive ? '#10B981' : '#EF4444'}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50 dark:border-aliseus-800">
                <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Balance Actual</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency || 'EUR' }).format(currentBalance)}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Monto Estimado</p>
                    <p className={`text-lg font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency || 'EUR' }).format(projectedAmount)}
                    </p>
                </div>
            </div>

            {/* Click outside handler overlay for custom dropdown */}
            {isDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
            )}
        </div>
    );
};

export default FinanceProjectionWidget;
