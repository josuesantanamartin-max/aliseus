const fs = require('fs');
const file = 'd:/Users/Josué/Desktop/Aliseus/components/dashboard/zones/AuraFinanceOverview.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newImports = `import { AvailableBalanceWidget } from './finance/AvailableBalanceWidget';
import { TotalSavingsWidget } from './finance/TotalSavingsWidget';
import { MonthBalanceWidget } from './finance/MonthBalanceWidget';
import { BudgetControlWidget } from './finance/BudgetControlWidget';
import { EvolutionChartWidget } from './finance/EvolutionChartWidget';
import { FixedPaymentsWidget, PendingFixedPayment } from './finance/FixedPaymentsWidget';
import { DetailedBudgetWidget } from './finance/DetailedBudgetWidget';

export type { PendingFixedPayment };`;

// Replace imports: lines 3 to 33 (indexes 2 to 32)
lines.splice(2, 31, newImports);

// Find the start of the return statement
const returnIdx = lines.findIndex(l => l.trim() === 'return (');

const newJsx = `    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AvailableBalanceWidget 
                    totalBalance={totalBalance} 
                    accounts={accounts} 
                    savingsAccounts={savingsAccounts} 
                />
                <TotalSavingsWidget 
                    totalSavings={totalSavings} 
                    savingsThisMonth={savingsThisMonth} 
                    savingsAccounts={savingsAccounts} 
                />
                <MonthBalanceWidget 
                    monthBalance={monthBalance} 
                    monthlyIncome={monthlyIncome} 
                    monthlyExpenses={monthlyExpenses} 
                />
                <BudgetControlWidget 
                    globalBudgetLimit={globalBudgetLimit} 
                    globalBudgetSpent={globalBudgetSpent} 
                    globalBudgetRemaining={globalBudgetRemaining} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <EvolutionChartWidget 
                        chartData={chartData} 
                        chartColor={chartColor} 
                        chartAccountId={chartAccountId} 
                        setChartAccountId={setChartAccountId} 
                        chartTimeframe={chartTimeframe} 
                        setChartTimeframe={setChartTimeframe} 
                        accounts={accounts} 
                    />
                    <FixedPaymentsWidget 
                        fixedPayments={fixedPayments} 
                    />
                </div>

                <div className="lg:col-span-1">
                    <DetailedBudgetWidget 
                        detailedBudget={detailedBudget} 
                    />
                </div>
            </div>
        </div>
    );
}`;

lines.splice(returnIdx, lines.length - returnIdx, newJsx);
fs.writeFileSync(file, lines.join('\n'));
