import React, { useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useCurrency } from '../../../hooks/useCurrency';
import { Wallet, Building2, Plus, Trash2, CreditCard, ArrowRight, Settings2 } from 'lucide-react';
import { Account } from '../../../types';

const INITIAL_ACCOUNTS: Partial<Account>[] = [
    { name: 'Efectivo', type: 'CASH', balance: 0, currency: 'EUR' },
    { name: 'Cuenta Principal', type: 'BANK', balance: 0, currency: 'EUR' }
];

const ACCOUNT_TYPES = [
    { value: 'CASH', label: 'Efectivo', icon: Wallet },
    { value: 'BANK', label: 'Banco', icon: Building2 },
    { value: 'CREDIT', label: 'Tarjeta Crédito', icon: CreditCard }
];

const AccountsStep: React.FC = () => {
    const { setOnboardingStep } = useUserStore();
    const { addAccount } = useFinanceStore();
    const { symbol, formatPrice } = useCurrency();

    // Manage local list of accounts to be created
    const [accountsToCreate, setAccountsToCreate] = useState<Partial<Account>[]>(INITIAL_ACCOUNTS);

    // Form for new account
    const [isAdding, setIsAdding] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newBankName, setNewBankName] = useState('');
    const [newAccountType, setNewAccountType] = useState('BANK');
    const [newAccountBalance, setNewAccountBalance] = useState('0');
    const [isRemunerated, setIsRemunerated] = useState(false);
    const [tae, setTae] = useState('0');
    const [addLinkedCard, setAddLinkedCard] = useState(false);

    const handleAddToList = () => {
        if (!newAccountName.trim()) return;

        const newAccounts = [...accountsToCreate];
        const mainId = Math.random().toString(36).substr(2, 9);

        newAccounts.push({
            id: mainId,
            name: newAccountName,
            bankName: newBankName,
            type: newAccountType as any,
            balance: parseFloat(newAccountBalance) || 0,
            isRemunerated: isRemunerated,
            tae: isRemunerated ? parseFloat(tae) : undefined,
            currency: 'EUR'
        });

        if (addLinkedCard && newAccountType === 'BANK') {
            newAccounts.push({
                name: `Tarjeta ${newAccountName}`,
                bankName: newBankName,
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                linkedAccountId: mainId
            });
        }

        setAccountsToCreate(newAccounts);

        // Reset form
        setNewAccountName('');
        setNewBankName('');
        setNewAccountBalance('0');
        setIsRemunerated(false);
        setTae('0');
        setAddLinkedCard(false);
        setIsAdding(false);
    };

    const handleRemove = (index: number) => {
        const newList = [...accountsToCreate];
        newList.splice(index, 1);
        setAccountsToCreate(newList);
    };

    const handleContinue = () => {
        // Create all accounts in store
        accountsToCreate.forEach(acc => {
            const newAccount: Account = {
                id: Math.random().toString(36).substr(2, 9),
                name: acc.name || 'Cuenta',
                type: acc.type || 'BANK',
                balance: acc.balance || 0,
                currency: acc.currency || 'EUR',
                ...acc
            };
            addAccount(newAccount);
        });
        setOnboardingStep(6); // Go to Import (Step 6)
    };

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
                Tus Cuentas
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-lg">
                Estas son las cuentas que crearemos para ti. Puedes personalizarlas, añadir más o eliminarlas.
            </p>

            {/* List of Accounts to Create */}
            <div className="w-full space-y-3 mb-6">
                {accountsToCreate.map((acc, idx) => {
                    const TypeIcon = ACCOUNT_TYPES.find(t => t.value === acc.type)?.icon || Wallet;
                    return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-onyx-800 rounded-xl border border-gray-100 dark:border-onyx-700 shadow-sm animate-fade-in-up">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                    <TypeIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{acc.name}</h4>
                                    <p className="text-xs text-gray-500">{ACCOUNT_TYPES.find(t => t.value === acc.type)?.label || acc.type} • {formatPrice(acc.balance || 0)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemove(idx)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Add Custom Account inline */}
            {isAdding ? (
                <div className="w-full bg-gray-50 dark:bg-onyx-800/50 p-6 rounded-2xl mb-6 animate-scale-in border border-cyan-100 dark:border-cyan-900/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Nombre Personalizado</label>
                            <input
                                value={newAccountName}
                                onChange={e => setNewAccountName(e.target.value)}
                                placeholder="Ej: Mi Cuenta Ahorro"
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Tipo de Cuenta</label>
                            <select
                                value={newAccountType}
                                onChange={(e) => setNewAccountType(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Banco (Opcional)</label>
                            <input
                                value={newBankName}
                                onChange={e => setNewBankName(e.target.value)}
                                placeholder="Ej: Santander, BBVA..."
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Saldo Inicial</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={newAccountBalance}
                                    onChange={e => setNewAccountBalance(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                            </div>
                        </div>
                    </div>

                    {newAccountType === 'BANK' && (
                        <div className="space-y-4 mb-6 p-4 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-xl border border-cyan-100 dark:border-cyan-900/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-cyan-600" />
                                    <span className="text-sm font-bold text-cyan-900 dark:text-cyan-100">Opciones Extra</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isRemunerated}
                                        onChange={e => setIsRemunerated(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 transition-colors">¿Cuenta remunerada?</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={addLinkedCard}
                                        onChange={e => setAddLinkedCard(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 transition-colors">¿Añadir tarjeta asociada?</span>
                                </label>
                            </div>

                            {isRemunerated && (
                                <div className="flex items-center gap-3 animate-fade-in">
                                    <span className="text-sm text-gray-500">TAE (%)</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tae}
                                        onChange={e => setTae(e.target.value)}
                                        className="w-20 p-2 rounded-lg border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-onyx-700 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAddToList}
                            className="px-8 py-2.5 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200 dark:shadow-none transition-all"
                        >
                            Añadir a la lista
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-10 hover:underline"
                >
                    <Plus className="w-4 h-4" /> Añadir otra cuenta
                </button>
            )}

            <div className="flex justify-between w-full max-w-md">
                <button
                    onClick={() => setOnboardingStep(4)} // Back to Currency
                    className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Atrás
                </button>

                <button
                    onClick={handleContinue}
                    className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700 hover:scale-105 transition-all flex items-center gap-2"
                >
                    {accountsToCreate.length > 0 ? 'Crear Cuentas' : 'Saltar paso'} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default AccountsStep;
