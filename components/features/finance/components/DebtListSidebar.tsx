import React from 'react';
import { GripVertical, Banknote, Home, Car, CreditCard } from 'lucide-react';
import { Debt } from '../../../../types';

interface DebtListSidebarProps {
    debts: Debt[];
    selectedDebtId: string;
    setSelectedDebtId: (id: string) => void;
    dragIndex: number | null;
    dragOverIndex: number | null;
    handleDragStart: (e: React.DragEvent, index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDrop: (e: React.DragEvent, dropIndex: number) => void;
    handleDragEnd: () => void;
    formatEUR: (amount: number) => string;
}

export const getDebtIcon = (type: string) => {
    switch (type) {
        case 'MORTGAGE': return <Home className="w-5 h-5" />;
        case 'LOAN': return <Car className="w-5 h-5" />;
        default: return <CreditCard className="w-5 h-5" />;
    }
};

export const getDebtLabel = (type: string) => {
    switch (type) {
        case 'MORTGAGE': return 'Hipoteca';
        case 'LOAN': return 'Préstamo';
        default: return 'Tarjeta';
    }
};

export const DebtListSidebar: React.FC<DebtListSidebarProps> = ({
    debts,
    selectedDebtId,
    setSelectedDebtId,
    dragIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    formatEUR
}) => {
    return (
        <div className="md:col-span-4 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-aliseus-100">
                <h3 className="font-bold text-cyan-900 text-lg">Tus Deudas</h3>
                <span className="text-xs font-bold bg-aliseus-100 px-2 py-1 rounded-lg text-aliseus-500">{debts.length} Activas</span>
            </div>

            <div className="space-y-3">
                {debts.map((debt, index) => {
                    const progress = ((debt.originalAmount - debt.remainingBalance) / debt.originalAmount) * 100;
                    const isSelected = selectedDebtId === debt.id;
                    const isDraggedOver = dragOverIndex === index && dragIndex !== index;

                    return (
                        <div
                            key={debt.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSelectedDebtId(debt.id)}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden select-none
                                ${isSelected ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white text-cyan-900 border-aliseus-100 hover:border-cyan-200 hover:bg-slate-50'}
                                ${isDraggedOver ? 'border-cyan-400 border-2 scale-[1.01] shadow-md shadow-cyan-200' : ''}
                                ${dragIndex === index ? 'opacity-50' : ''}`}
                        >
                            <div className={`absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ${isSelected ? 'text-white/30' : 'text-aliseus-300'}`}>
                                <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex justify-between items-center mb-3 pl-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-aliseus-50'}`}>{getDebtIcon(debt.type)}</div>
                                    <div>
                                        <p className="font-semibold text-sm leading-tight">{debt.name}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/50' : 'text-aliseus-400'}`}>{getDebtLabel(debt.type)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg leading-none">{formatEUR(debt.remainingBalance)}</p>
                                </div>
                            </div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/10' : 'bg-aliseus-100'}`}>
                                <div className={`h-full rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-cyan-900'}`} style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {debts.length === 0 && (
                <div className="text-center p-10 bg-aliseus-50/50 border-2 border-dashed border-aliseus-100 rounded-3xl flex flex-col items-center justify-center text-aliseus-300">
                    <Banknote className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sin deudas</p>
                </div>
            )}
        </div>
    );
};
