import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useFinanceStore } from '../../../store/financeStore';
import { Debt } from '../../../types';

import { DebtOverviewCards } from './components/DebtOverviewCards';
import { DebtListSidebar } from './components/DebtListSidebar';
import { DebtDetailMain } from './components/DebtDetailMain';
import { DebtAddModal } from './components/DebtAddModal';
import { DebtPaymentModal } from './components/DebtPaymentModal';

const Debts: React.FC = () => {
    const { debts: storeDebts, setDebts, accounts, addTransaction } = useFinanceStore();
    const [debts, setLocalDebts] = useState<Debt[]>(storeDebts || []);

    useEffect(() => {
        setLocalDebts(storeDebts || []);
    }, [storeDebts]);

    const handleUpdateDebts = (newDebts: Debt[]) => {
        setLocalDebts(newDebts);
        setDebts(newDebts);
    };

    const [selectedDebtId, setSelectedDebtId] = useState<string>('');
    const selectedDebt = debts.find(d => d.id === selectedDebtId) || null;

    useEffect(() => {
        if (!selectedDebtId && debts.length > 0) {
            setSelectedDebtId(debts[0].id);
        }
    }, [debts, selectedDebtId]);

    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [showSimulation, setShowSimulation] = useState(false);
    const [simulationExtra, setSimulationExtra] = useState(100);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => { e.currentTarget.classList.add('opacity-50'); }, 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === dropIndex) return;

        const newDebts = [...debts];
        const draggedDebt = newDebts[dragIndex];
        newDebts.splice(dragIndex, 1);
        newDebts.splice(dropIndex, 0, draggedDebt);
        handleUpdateDebts(newDebts);
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDeleteDebt = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta deuda?')) {
            handleUpdateDebts(debts.filter(d => d.id !== id));
            if (selectedDebtId === id) setSelectedDebtId('');
        }
    };

    const calculatePayoff = (debt: Debt, extra: number = 0, lump: number = 0) => {
        let balance = Math.max(0, debt.remainingBalance - lump);
        let months = 0; let totalInterest = 0;
        const monthlyRate = (debt.interestRate / 100) / 12;

        if (balance === 0) return { months: 0, totalInterest: 0, payoffDate: 'Hoy', isPossible: true, remainingData: [] };

        const remainingData = [];

        while (balance > 0 && months < 600) {
            const interest = balance * monthlyRate;
            totalInterest += interest;
            const principalPayment = (debt.minPayment + extra) - interest;

            if (principalPayment <= 0 && extra === 0) return { isPossible: false, months: 0, totalInterest: 0, payoffDate: 'Nunca', remainingData: [] };

            balance -= principalPayment;
            months++;
            if (balance < 0) balance = 0;

            remainingData.push({ month: months, balance, interest, principal: principalPayment });
        }
        const today = new Date(); today.setMonth(today.getMonth() + months);
        return { months, totalInterest, payoffDate: today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }), isPossible: true, remainingData };
    };

    const formatEUR = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

    const totalMonthlyInterest = debts.reduce((acc, debt) => {
        const monthlyRate = (debt.interestRate / 100) / 12;
        return acc + (debt.remainingBalance * monthlyRate);
    }, 0);

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Deudas y Préstamos</h2>
                    <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Plan para eliminar deudas</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20">
                    <Plus className="w-5 h-5" /> Nueva Deuda
                </button>
            </div>

            <DebtOverviewCards
                debts={debts}
                totalMonthlyInterest={totalMonthlyInterest}
                formatEUR={formatEUR}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <DebtListSidebar
                    debts={debts}
                    selectedDebtId={selectedDebtId}
                    setSelectedDebtId={setSelectedDebtId}
                    dragIndex={dragIndex}
                    dragOverIndex={dragOverIndex}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    handleDragEnd={handleDragEnd}
                    formatEUR={formatEUR}
                />

                {selectedDebt && (
                    <DebtDetailMain
                        selectedDebt={selectedDebt}
                        formatEUR={formatEUR}
                        handleDeleteDebt={handleDeleteDebt}
                        setShowPaymentModal={setIsPaymentModalOpen}
                        showSimulation={showSimulation}
                        setShowSimulation={setShowSimulation}
                        simulationExtra={simulationExtra}
                        setSimulationExtra={setSimulationExtra}
                        calculatePayoff={calculatePayoff}
                    />
                )}
            </div>

            <DebtAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddDebt={(debt) => handleUpdateDebts([...debts, debt])}
                accounts={accounts}
                formatEUR={formatEUR}
            />

            <DebtPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                selectedDebt={selectedDebt}
                accounts={accounts}
                formatEUR={formatEUR}
                onAddTransaction={addTransaction}
            />
        </div>
    );
};

export default Debts;
