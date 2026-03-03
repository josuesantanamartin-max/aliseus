import React from 'react';
import { Account } from '../../../../../types';
import { Wallet, CreditCard, Coins, TrendingUp, ChevronRight, Landmark } from 'lucide-react';

interface AccountsSummaryWidgetProps {
    accounts: Account[];
    onNavigate: (app: string, tab?: string) => void;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

const AccountsSummaryWidget: React.FC<AccountsSummaryWidgetProps> = ({ accounts, onNavigate }) => {

    // Group accounts by type or simplified logic
    const getTypeName = (type: Account['type']) => {
        switch (type) {
            case 'BANK': return 'Banco';
            case 'CREDIT': return 'Tarjeta Crédito';
            case 'DEBIT': return 'Tarjeta Débito';
            case 'INVESTMENT': return 'Inversión';
            case 'CASH': return 'Efectivo';
            case 'WALLET': return 'Billetera';
            default: return type;
        }
    };

    const getIcon = (type: Account['type']) => {
        switch (type) {
            case 'BANK': return Landmark;
            case 'CREDIT':
            case 'DEBIT': return CreditCard;
            case 'INVESTMENT': return TrendingUp;
            case 'CASH':
            case 'WALLET': return Coins;
            default: return Wallet;
        }
    };

    const getColor = (type: Account['type']) => {
        switch (type) {
            case 'BANK': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'CREDIT': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'INVESTMENT': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const sortedAccounts = [...accounts].sort((a, b) => b.balance - a.balance);

    return (
        <div className="bg-white dark:bg-onyx-900 p-6 rounded-3xl border border-onyx-100 dark:border-onyx-800 shadow-sm flex flex-col h-full group">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-onyx-900 dark:text-white">Mis Cuentas</h3>
                        <p className="text-[10px] text-onyx-400 dark:text-onyx-500 font-bold uppercase tracking-widest">
                            {accounts.length} Cuentas Activas
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('finance', 'accounts')}
                    className="p-2 hover:bg-onyx-50 dark:hover:bg-onyx-800 rounded-lg text-onyx-400 hover:text-cyan-600 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 -mr-2 pr-2">
                {sortedAccounts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <Wallet className="w-8 h-8 text-onyx-200 mb-2" />
                        <p className="text-sm text-onyx-400 mb-4">No hay cuentas</p>
                        <button onClick={() => onNavigate('finance', 'accounts')} className="px-4 py-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800 rounded-xl text-xs font-bold hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors shadow-sm">
                            Añadir Cuenta
                        </button>
                    </div>
                ) : (
                    sortedAccounts.map(account => {
                        const Icon = getIcon(account.type);
                        const colorClass = getColor(account.type);

                        return (
                            <div
                                key={account.id}
                                onClick={() => onNavigate('finance', 'accounts')}
                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-onyx-50 dark:hover:bg-onyx-800 transition-colors cursor-pointer group/item border border-transparent hover:border-onyx-100 dark:hover:border-onyx-700"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-onyx-900 dark:text-white">{account.name}</p>
                                        <p className="text-[10px] font-bold text-onyx-400 dark:text-onyx-500 uppercase tracking-wider">{getTypeName(account.type)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${account.balance < 0 ? 'text-red-500' : 'text-onyx-900 dark:text-white'}`}>
                                        {formatEUR(account.balance)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-onyx-100 dark:border-onyx-800 flex justify-between items-center">
                <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">Total</span>
                <span className="text-lg font-black text-onyx-900 dark:text-white">
                    {formatEUR(accounts.reduce((acc, curr) => acc + curr.balance, 0))}
                </span>
            </div>
        </div>
    );
};

export default AccountsSummaryWidget;
