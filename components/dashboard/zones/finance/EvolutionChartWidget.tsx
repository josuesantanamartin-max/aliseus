import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { cn, formatCurrency } from './widgetUtils';

export interface EvolutionChartWidgetProps {
    chartData: any[];
    chartColor: string;
    chartAccountId: string;
    setChartAccountId: (id: string) => void;
    chartTimeframe: '1m' | '6m' | '1y' | '3y' | '5y';
    setChartTimeframe: (tf: '1m' | '6m' | '1y' | '3y' | '5y') => void;
    accounts: any[];
}

export const EvolutionChartWidget: React.FC<EvolutionChartWidgetProps> = ({
    chartData, chartColor, chartAccountId, setChartAccountId,
    chartTimeframe, setChartTimeframe, accounts
}) => {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    Evolución del Dinero
                </h3>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700 rounded-lg p-1 flex">
                        {(['1m', '6m', '1y', '3y', '5y'] as const).map(tf => (
                            <button
                                key={tf}
                                onClick={() => setChartTimeframe(tf)}
                                className={cn(
                                    "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                                    chartTimeframe === tf
                                        ? "bg-white dark:bg-onyx-600 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <select
                            value={chartAccountId}
                            onChange={(e) => setChartAccountId(e.target.value)}
                            className="appearance-none bg-slate-50 dark:bg-onyx-800 border border-slate-100 dark:border-onyx-700 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                        >
                            <option value="all">Todas las cuentas</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* The Chart */}
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-onyx-800/50" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            dy={10}
                            minTickGap={20}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickFormatter={(value) => value.toLocaleString('es-ES')}
                            width={80}
                            dx={-10}
                        />
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                            formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Balance']}
                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke={chartColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: chartColor }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
