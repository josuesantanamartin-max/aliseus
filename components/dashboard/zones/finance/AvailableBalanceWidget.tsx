import React from 'react';
import { Wallet } from 'lucide-react';
import { cn, formatCurrency } from './widgetUtils';

export interface AvailableBalanceWidgetProps {
    totalBalance: number;
    accounts: any[];
    savingsAccounts: any[];
}

export const AvailableBalanceWidget: React.FC<AvailableBalanceWidgetProps> = ({ totalBalance, accounts, savingsAccounts }) => {
    return (
        <div className="bg-white dark:bg-onyx-900 rounded-3xl p-6 border border-slate-100 dark:border-onyx-800/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saldo Disponible</h3>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(totalBalance)}
                </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-onyx-800/80">
                {accounts
                    .filter(a => ['BANK', 'CASH', 'WALLET'].includes(a.type))
                    .filter(a => !savingsAccounts.some(sa => sa.id === a.id)) // EXCLUDE SAVINGS
                    .map(a => (
                        <div key={a.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium truncate mr-2">{a.name}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(a.balance)}</span>
                        </div>
                    ))
                }
                {accounts.some(a => ['CREDIT', 'DEBIT'].includes(a.type)) && (
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Tarjetas excluidas del disponible</p>
                )}
            </div>
        </div>
    );
};
