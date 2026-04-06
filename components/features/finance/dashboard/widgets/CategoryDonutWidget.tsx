import React from 'react';
import CategoryDonutChart from '../../../../dashboard/charts/CategoryDonutChart';
import { Transaction } from '../../../../../types';
import { PieChart } from 'lucide-react';

interface CategoryDonutWidgetProps {
    transactions: Transaction[];
    isExpanded?: boolean;
}

const CategoryDonutWidget: React.FC<CategoryDonutWidgetProps> = ({ transactions, isExpanded }) => {
    const chartHeight = isExpanded ? 400 : 220;

    return (
        <div className="flex flex-col h-full w-full">
            <h3 className="text-xs font-black text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest mb-4">
                Gastos por Categoría
            </h3>
            <div className="flex-1 w-full mt-2" style={{ minHeight: chartHeight }}>
                <CategoryDonutChart transactions={transactions} height={chartHeight} />
            </div>
            <div className="mt-4 pt-4 border-t border-aliseus-100 dark:border-aliseus-800/50 flex justify-center text-xs text-aliseus-400 font-bold">
                Mes actual
            </div>
        </div>
    );
};

export default CategoryDonutWidget;
