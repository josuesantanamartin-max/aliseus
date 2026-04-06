import React, { useState, useEffect } from 'react';
import { Banknote, X, Clock } from 'lucide-react';
import { Debt, Account } from '../../../../types';

interface DebtPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDebt: Debt | null;
    accounts: Account[];
    formatEUR: (amount: number) => string;
    onAddTransaction: (transaction: any) => void;
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
    isOpen,
    onClose,
    selectedDebt,
    accounts,
    formatEUR,
    onAddTransaction
}) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');

    useEffect(() => {
        if (isOpen && selectedDebt) {
            setPaymentAmount(selectedDebt.minPayment.toString()); // default to min payment
            if (selectedDebt.accountId && accounts.some(a => a.id === selectedDebt.accountId)) {
                setSelectedAccountId(selectedDebt.accountId);
            } else {
                setSelectedAccountId(accounts[0]?.id || '');
            }
        }
    }, [isOpen, selectedDebt, accounts]);

    const handleRegisterPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDebt || !paymentAmount || !selectedAccountId) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        onAddTransaction({
            type: 'EXPENSE',
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Deudas',
            subCategory: selectedDebt.name,
            accountId: selectedAccountId,
            description: `Amortización ${selectedDebt.name}`
        });

        onClose();
        setPaymentAmount('');
    };

    if (!isOpen || !selectedDebt) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-900/40 backdrop-blur-md p-4 animate-fade-in text-cyan-900">
            <div className="bg-white rounded-Aliseus shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-aliseus-100 relative shadow-cyan-500/10">
                <div className="bg-white px-10 py-8 flex justify-between items-center border-b border-aliseus-50 sticky top-0 z-10">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm">
                                <Banknote className="w-6 h-6" />
                            </div>
                            Amortización
                        </h3>
                        <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mt-2 ml-16">Reducción de pasivo financiero</p>
                    </div>
                    <button onClick={onClose} className="text-aliseus-400 hover:text-cyan-900 p-2.5 hover:bg-aliseus-50 rounded-xl transition-all">
                        <X className="w-7 h-7" />
                    </button>
                </div>
                <form onSubmit={handleRegisterPayment} className="p-10 space-y-10">
                    <div>
                        <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-4 block text-center">Cantidad a Amortizar</label>
                        <div className="relative group/input">
                            <input autoFocus type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full p-8 bg-aliseus-50 border border-aliseus-100 rounded-3xl font-bold text-5xl text-cyan-900 focus:bg-white outline-none transition-all text-center shadow-inner" placeholder="0.00" />
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-aliseus-200 font-bold text-3xl group-focus-within/input:text-cyan-500 transition-colors">€</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest block">Cuenta de Origen</label>
                        <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full p-5 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-cyan-900 focus:bg-white outline-none cursor-pointer transition-all shadow-inner">
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatEUR(acc.balance)})</option>)}
                        </select>
                    </div>
                    <div className="p-8 bg-cyan-50/50 rounded-3xl border border-cyan-100/50 flex gap-6">
                        <div className="p-3 bg-white text-cyan-600 rounded-xl h-fit shadow-sm">
                            <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-semibold text-cyan-900/70 leading-relaxed">
                            Esta acción generará un asiento contable automático y actualizará el saldo disponible en tiempo real.
                        </p>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-cyan-900/20 transition-all active:scale-95 group relative overflow-hidden">
                        <span className="relative z-10">Confirmar Amortización</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-white/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </form>
            </div>
        </div>
    );
};
