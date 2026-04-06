import React from 'react';
import CashflowAreaChart from '../../../../dashboard/charts/CashflowAreaChart';
import { Transaction } from '../../../../../types';
import { TrendingUp } from 'lucide-react';

interface CashflowWidgetProps {
    transactions: Transaction[];
    monthlyIncome: number;
    monthlyExpenses: number;
    isExpanded?: boolean;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const CashflowWidget: React.FC<CashflowWidgetProps> = ({ transactions, monthlyIncome, monthlyExpenses, isExpanded }) => {
    const chartHeight = isExpanded ? 400 : 250;

    return (
        <div className="flex flex-col h-full w-full">
            <h3 className="text-xs font-black text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest mb-2 flex justify-between">
                <span>Flujo de Caja</span>
                <span className="text-emerald-500">{formatCurrency(monthlyIncome - monthlyExpenses)} Neto</span>
            </h3>
            <div className={`flex-1 w-full mt-2 -ml-2`} style={{ minHeight: chartHeight }}>
                <CashflowAreaChart transactions={transactions} height={chartHeight} />
            </div>
        </div>
    );
};

export default CashflowWidget;
