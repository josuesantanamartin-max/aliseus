import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface NetWorthSparklineProps {
    data: number[] | { date: string, value: number }[];
    color?: string;
    height?: number;
    trend?: 'up' | 'down' | 'neutral';
}

const NetWorthSparkline: React.FC<NetWorthSparklineProps> = ({
    data,
    color,
    height = 40,
    trend = 'neutral'
}) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (typeof data[0] === 'number') {
            return (data as number[]).map((value, i) => ({ value, index: i }));
        }
        return data as { date: string, value: number }[];
    }, [data]);

    // Auto-determine color based on trend if not provided
    const strokeColor = color || (
        trend === 'up' ? '#10b981' : // emerald-500
            trend === 'down' ? '#f43f5e' : // rose-500
                '#06b6d4' // cyan-500
    );

    const numericValues = useMemo(() => {
        if (!data || data.length === 0) return [0];
        if (typeof data[0] === 'number') {
            return data as number[];
        }
        return (data as { date: string, value: number }[]).map(d => d.value);
    }, [data]);

    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const padding = (max - min) * 0.1;

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <YAxis domain={[min - padding, max + padding]} hide />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={strokeColor}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default NetWorthSparkline;
