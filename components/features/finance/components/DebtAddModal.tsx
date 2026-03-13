import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Debt, Account } from '../../../../types';

interface DebtAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddDebt: (debt: Debt) => void;
    accounts: Account[];
    formatEUR: (amount: number) => string;
}

export const DebtAddModal: React.FC<DebtAddModalProps> = ({
    isOpen,
    onClose,
    onAddDebt,
    accounts,
    formatEUR
}) => {
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'LOAN' | 'MORTGAGE' | 'CREDIT_CARD'>('LOAN');
    const [newOriginal, setNewOriginal] = useState('');
    const [newBalance, setNewBalance] = useState('');
    const [newRate, setNewRate] = useState('');
    const [newMin, setNewMin] = useState('');
    const [newDay, setNewDay] = useState('');
    const [newAccountId, setNewAccountId] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');

    useEffect(() => {
        if (isOpen && accounts.length > 0 && !newAccountId) {
            setNewAccountId(accounts[0].id);
        }
    }, [isOpen, accounts, newAccountId]);

    const resetAddForm = () => {
        setNewName(''); setNewOriginal(''); setNewBalance(''); setNewRate(''); setNewMin(''); setNewDay(''); setNewAccountId(accounts[0]?.id || '');
        setNewStartDate(''); setNewEndDate('');
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newOriginal || !newBalance) return;

        const newDebt: Debt = {
            id: Math.random().toString(36).substr(2, 9),
            name: newName,
            type: newType,
            originalAmount: parseFloat(newOriginal),
            remainingBalance: parseFloat(newBalance),
            interestRate: parseFloat(newRate) || 0,
            minPayment: parseFloat(newMin) || 0,
            dueDate: newDay || '1',
            startDate: newStartDate || undefined,
            endDate: newEndDate || undefined,
            accountId: newAccountId,
            payments: []
        };

        onAddDebt(newDebt);
        resetAddForm();
    };

    const handleClose = () => {
        resetAddForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-900/40 backdrop-blur-md p-4 animate-fade-in text-cyan-900">
            <div className="bg-white rounded-onyx shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-onyx-100 relative shadow-cyan-500/10">
                <div className="bg-white px-10 py-8 flex justify-between items-center border-b border-onyx-50 sticky top-0 z-10">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl shadow-sm">
                                <Plus className="w-6 h-6" />
                            </div>
                            Nueva Deuda
                        </h3>
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-2 ml-16">Alta de pasivo financiero</p>
                    </div>
                    <button onClick={handleClose} className="text-onyx-400 hover:text-cyan-900 p-2.5 hover:bg-onyx-50 rounded-xl transition-all">
                        <X className="w-7 h-7" />
                    </button>
                </div>
                <form onSubmit={handleAddSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block text-center md:text-left">Nombre de la Obligación</label>
                            <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all placeholder:text-onyx-300 shadow-inner" placeholder="Ej: Hipoteca, Préstamo Personal..." />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Naturaleza</label>
                                <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all cursor-pointer shadow-inner">
                                    <option value="LOAN">Préstamo</option>
                                    <option value="MORTGAGE">Hipoteca</option>
                                    <option value="CREDIT_CARD">Tarjeta</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Día de Cobro</label>
                                <input type="number" min="1" max="31" value={newDay} onChange={(e) => setNewDay(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all shadow-inner" placeholder="1-31" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Importe Original</label>
                                <div className="relative group/input">
                                    <input required type="number" step="0.01" value={newOriginal} onChange={(e) => setNewOriginal(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-xl text-cyan-900 focus:bg-white transition-all shadow-inner text-center" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-onyx-300 font-bold">€</span>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Saldo Pendiente</label>
                                <div className="relative group/input">
                                    <input required type="number" step="0.01" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-xl text-cyan-900 focus:bg-white transition-all shadow-inner text-center" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-onyx-300 font-bold">€</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Tipo Interés (%)</label>
                                <input type="number" step="0.01" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-xl text-cyan-900 focus:bg-white transition-all shadow-inner text-center" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Cuota Mínima</label>
                                <input type="number" step="0.01" value={newMin} onChange={(e) => setNewMin(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-xl text-cyan-900 focus:bg-white transition-all shadow-inner text-center" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Cuenta de Pago Asociada</label>
                            <select value={newAccountId} onChange={(e) => setNewAccountId(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 transition-all cursor-pointer shadow-inner">
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatEUR(acc.balance)})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Fecha Apertura</label>
                                <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 text-xs focus:bg-white transition-all shadow-inner" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Vencimiento Final</label>
                                <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 text-xs focus:bg-white transition-all shadow-inner" />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-cyan-900/20 transition-all active:scale-95 group relative overflow-hidden">
                        <span className="relative z-10">Registrar Nueva Obligación</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </form>
            </div>
        </div>
    );
};
