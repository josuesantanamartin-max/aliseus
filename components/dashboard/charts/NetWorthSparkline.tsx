import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface NetWorthSparklineProps {
    data: { date: string; value: number }[];
    height?: number;
    color?: string;
}

const NetWorthSparkline: React.FC<NetWorthSparklineProps> = ({ data, height = 60, color = '#10b981' }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, fill: color }}
                />
                <Tooltip
                    formatter={(value: number) =>
                        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
                    }
                    labelFormatter={(label) => label}
                    contentStyle={{
                        background: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        fontSize: 11,
                    }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default NetWorthSparkline;
