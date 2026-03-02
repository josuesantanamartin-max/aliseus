import React, { useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useFinanceControllers } from '../../../hooks/useFinanceControllers';
import { Debt, Transaction } from '../../../types';
import { Calculator, Home, Car, CreditCard, Plus, Banknote, Clock, X, History, Flame, CalendarRange, PieChart, Sparkles, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface DebtsProps {
    // All state now managed via stores
}

const Debts: React.FC<DebtsProps> = () => {
    const { debts, setDebts, accounts } = useFinanceStore();
    const { addTransaction } = useFinanceControllers();

    const [selectedDebtId, setSelectedDebtId] = useState<string>(debts[0]?.id || '');
    const [extraPayment, setExtraPayment] = useState<number>(0);
    const [lumpSum, setLumpSum] = useState<number>(0);
    const [simulatorMode, setSimulatorMode] = useState<'MONTHLY' | 'LUMP_SUM'>('MONTHLY');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

    // Drag-to-reorder state
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === dropIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }
        const reordered = [...debts];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, moved);
        setDebts(() => reordered);
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // Add Debt Form State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<Debt['type']>('LOAN');
    const [newOriginal, setNewOriginal] = useState('');
    const [newBalance, setNewBalance] = useState('');
    const [newRate, setNewRate] = useState('');
    const [newMin, setNewMin] = useState('');
    const [newDay, setNewDay] = useState('');
    const [newAccountId, setNewAccountId] = useState(accounts[0]?.id || '');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');

    const selectedDebt = debts.find(d => d.id === selectedDebtId);

    // Interest Calculations
    const calculateMonthlyInterest = (debt: Debt) => {
        return (debt.remainingBalance * (debt.interestRate / 100)) / 12;
    };

    const totalMonthlyInterest = debts.reduce((sum, d) => sum + calculateMonthlyInterest(d), 0);

    const getIcon = (type: string) => {
        switch (type) {
            case 'MORTGAGE': return <Home className="w-5 h-5" />;
            case 'LOAN': return <Car className="w-5 h-5" />;
            default: return <CreditCard className="w-5 h-5" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'MORTGAGE': return 'Hipoteca';
            case 'LOAN': return 'Préstamo';
            default: return 'Tarjeta';
        }
    };

    const openPaymentModal = () => {
        if (selectedDebt) {
            if (selectedDebt.accountId) {
                setSelectedAccountId(selectedDebt.accountId);
            } else {
                setSelectedAccountId(accounts[0]?.id || '');
            }
        }
        setIsPaymentModalOpen(true);
    };

    const onDeleteDebt = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta deuda?')) {
            setDebts((prev) => prev.filter(d => d.id !== id));
            if (selectedDebtId === id) setSelectedDebtId('');
        }
    };

    const calculatePayoff = (debt: Debt, extra: number, lump: number = 0) => {
        let balance = Math.max(0, debt.remainingBalance - lump);
        let months = 0; let totalInterest = 0;
        const monthlyRate = (debt.interestRate / 100) / 12;

        if (balance === 0) return { months: 0, totalInterest: 0, payoffDate: 'Hoy', isPossible: true };

        while (balance > 0 && months < 600) { // Limit to 50 years to prevent infinite loops
            const interest = balance * monthlyRate;
            totalInterest += interest;
            const principalPayment = (debt.minPayment + extra) - interest;

            if (principalPayment <= 0 && extra === 0) return { isPossible: false, months: 0, totalInterest: 0, payoffDate: 'Nunca' };

            balance -= principalPayment;
            months++;
            if (balance < 0) balance = 0;
        }
        const today = new Date(); today.setMonth(today.getMonth() + months);
        return { months, totalInterest, payoffDate: today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }), isPossible: true };
    };

    const calculateTimeline = (debt: Debt) => {
        if (!debt.endDate) return null;
        const start = debt.startDate ? new Date(debt.startDate) : new Date();
        const end = new Date(debt.endDate);
        const today = new Date();

        const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const monthsElapsed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
        const monthsRemaining = Math.max(0, totalMonths - monthsElapsed);

        let necessaryPayment = 0;
        if (monthsRemaining > 0) {
            const r = (debt.interestRate / 100) / 12;
            if (r === 0) necessaryPayment = debt.remainingBalance / monthsRemaining;
            else necessaryPayment = (debt.remainingBalance * r) / (1 - Math.pow(1 + r, -monthsRemaining));
        }

        return { totalMonths, monthsElapsed, monthsRemaining, necessaryPayment };
    };

    const handleRegisterPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDebt || !paymentAmount || !selectedAccountId) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        addTransaction({
            type: 'EXPENSE',
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            category: 'Deudas',
            subCategory: selectedDebt.name,
            accountId: selectedAccountId,
            description: `Amortización ${selectedDebt.name}`
        });

        setIsPaymentModalOpen(false);
        setPaymentAmount('');
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

        setDebts((prev: Debt[]) => [...prev, newDebt]);

        setIsAddModalOpen(false);
        resetAddForm();
    };

    const resetAddForm = () => {
        setNewName(''); setNewOriginal(''); setNewBalance(''); setNewRate(''); setNewMin(''); setNewDay(''); setNewAccountId(accounts[0]?.id || '');
        setNewStartDate(''); setNewEndDate('');
    };

    const simulation = selectedDebt ? calculatePayoff(selectedDebt, simulatorMode === 'MONTHLY' ? extraPayment : 0, simulatorMode === 'LUMP_SUM' ? lumpSum : 0) : null;
    const baseSimulation = selectedDebt ? calculatePayoff(selectedDebt, 0, 0) : null;
    const timeline = selectedDebt ? calculateTimeline(selectedDebt) : null;
    const formatEUR = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

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

            {/* GLOBAL OVERVIEW SECTION - Now separated at the top */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-onyx-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-2">Pasivo Total Global</p>
                        <h3 className="text-3xl font-black text-cyan-900 tracking-tight">{formatEUR(debts.reduce((acc, d) => acc + d.remainingBalance, 0))}</h3>
                    </div>
                    <div className="p-4 bg-onyx-50 text-cyan-900 rounded-2xl group-hover:scale-110 transition-transform">
                        <Banknote className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-onyx-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-2">Compromiso Mensual</p>
                        <h3 className="text-3xl font-black text-cyan-900 tracking-tight">{formatEUR(debts.reduce((acc, d) => acc + d.minPayment, 0))}</h3>
                    </div>
                    <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <Flame className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-onyx-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-2">Carga de Intereses</p>
                        <h3 className="text-3xl font-black text-red-600 tracking-tight">-{formatEUR(totalMonthlyInterest)}<span className="text-sm text-onyx-400 font-bold">/mes</span></h3>
                    </div>
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <PieChart className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* SIDEBAR LIST */}
                <div className="md:col-span-4 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-onyx-100">
                        <h3 className="font-bold text-cyan-900 text-lg">Tus Deudas</h3>
                        <span className="text-xs font-bold bg-onyx-100 px-2 py-1 rounded-lg text-onyx-500">{debts.length} Activas</span>
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
                                        ${isSelected ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white text-cyan-900 border-onyx-100 hover:border-cyan-200 hover:bg-slate-50'}
                                        ${isDraggedOver ? 'border-cyan-400 border-2 scale-[1.01] shadow-md shadow-cyan-200' : ''}
                                        ${dragIndex === index ? 'opacity-50' : ''}`}
                                >
                                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ${isSelected ? 'text-white/30' : 'text-onyx-300'}`}>
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex justify-between items-center mb-3 pl-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-onyx-50'}`}>{getIcon(debt.type)}</div>
                                            <div>
                                                <p className="font-semibold text-sm leading-tight">{debt.name}</p>
                                                <p className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/50' : 'text-onyx-400'}`}>{getLabel(debt.type)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg leading-none">{formatEUR(debt.remainingBalance)}</p>
                                        </div>
                                    </div>
                                    {/* Mini Progress Bar */}
                                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/10' : 'bg-onyx-100'}`}>
                                        <div className={`h-full rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-cyan-900'}`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {debts.length === 0 && (
                        <div className="text-center p-10 bg-onyx-50/50 border-2 border-dashed border-onyx-100 rounded-3xl flex flex-col items-center justify-center text-onyx-300">
                            <Banknote className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sin deudas</p>
                        </div>
                    )}
                </div>

                {selectedDebt && (
                    <div className="md:col-span-8 space-y-8">
                        {/* MAIN DEBT CARD */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-onyx-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                            {/* Header & Balance */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 mb-6 pb-6 md:mb-8 md:pb-8 border-b border-onyx-50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-gradient-to-br from-cyan-600 to-teal-600 text-white rounded-lg"><CreditCard className="w-4 h-4" /></div>
                                        <p className="text-xs font-bold text-onyx-400 uppercase tracking-[0.2em]">Deuda Pendiente</p>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-cyan-900 tracking-tight">{formatEUR(selectedDebt.remainingBalance)}</h3>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={openPaymentModal} className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-cyan-900/10 transition-all active:scale-95 flex items-center justify-center gap-3">
                                        <Plus className="w-4 h-4" /> Registrar Pago
                                    </button>
                                    <button onClick={() => onDeleteDebt(selectedDebt.id)} className="p-4 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-600 transition-colors border border-red-100/50">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                <div className="p-4 bg-onyx-50/50 rounded-2xl border border-onyx-100/50 group/metric hover:bg-white hover:shadow-sm transition-all">
                                    <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Vencimiento</p>
                                    <p className="text-sm font-bold text-cyan-900 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-cyan-600" /> Día {selectedDebt.dueDate}
                                    </p>
                                </div>
                                <div className="p-4 bg-onyx-50/50 rounded-2xl border border-onyx-100/50 group/metric hover:bg-white hover:shadow-sm transition-all">
                                    <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Interés (TAE)</p>
                                    <p className="text-sm font-bold text-cyan-900 flex items-center gap-2">
                                        <PieChart className="w-3.5 h-3.5 text-orange-500" /> {selectedDebt.interestRate}%
                                    </p>
                                </div>
                                <div className="p-4 bg-onyx-50/50 rounded-2xl border border-onyx-100/50 group/metric hover:bg-white hover:shadow-sm transition-all">
                                    <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Carga Mensual</p>
                                    <p className="text-sm font-bold text-red-600 flex items-center gap-2">
                                        <Flame className="w-3.5 h-3.5" /> -{formatEUR(calculateMonthlyInterest(selectedDebt))}
                                    </p>
                                </div>
                                <div className="p-4 bg-onyx-50/50 rounded-2xl border border-onyx-100/50 group/metric hover:bg-white hover:shadow-sm transition-all">
                                    <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Cuota Mínima</p>
                                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                        <Banknote className="w-3.5 h-3.5" /> {formatEUR(selectedDebt.minPayment)}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                        </div>

                        {timeline && (
                            <div className="bg-white p-10 rounded-onyx shadow-sm border border-onyx-100 hover:shadow-md transition-all duration-500">
                                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-onyx-50">
                                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                                        <CalendarRange className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-cyan-900 tracking-tight">Cronología del Préstamo</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em]">Progreso Temporal</span>
                                            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">{timeline.monthsElapsed} / {timeline.totalMonths} Meses</span>
                                        </div>
                                        <div className="relative h-3 bg-onyx-50 rounded-full overflow-hidden border border-onyx-100/30">
                                            <div className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((timeline.monthsElapsed / timeline.totalMonths) * 100, 100)}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-onyx-500 uppercase tracking-widest px-1">
                                            <span>Inicio: {new Date(selectedDebt.startDate!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span>Fin: {new Date(selectedDebt.endDate!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className="bg-onyx-50/50 p-8 rounded-3xl border border-onyx-100/50 flex flex-col justify-center relative overflow-hidden group/theo">
                                        <div className="absolute top-0 right-0 w-24 h-full bg-cyan-500/5 -skew-x-12 translate-x-8 group-hover/theo:translate-x-0 transition-transform duration-700"></div>
                                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-3 relative z-10">Cuota Teórica Sugerida</p>
                                        <div className="flex items-end gap-3 relative z-10">
                                            <span className="text-3xl font-bold text-cyan-900 tracking-tight">{formatEUR(timeline.necessaryPayment)}</span>
                                            <span className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-widest ${selectedDebt.minPayment >= timeline.necessaryPayment ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {selectedDebt.minPayment >= timeline.necessaryPayment ? 'Objetivo OK' : 'Por debajo'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-onyx-400 mt-3 font-semibold relative z-10 italic">Cálculo basado en la fecha de vencimiento configurada.</p>
                                    </div>
                                </div>
                            </div>
                        )}


                        <div className="bg-white p-10 rounded-onyx shadow-sm border border-onyx-100 hover:shadow-md transition-all duration-500">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-onyx-50">
                                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                                    <PieChart className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-cyan-900 tracking-tight">Desglose de Cuota Mínima</h3>
                            </div>

                            {(() => {
                                const monthlyInt = calculateMonthlyInterest(selectedDebt);
                                const principalPart = Math.max(0, selectedDebt.minPayment - monthlyInt);
                                const intPercent = Math.min(100, (monthlyInt / selectedDebt.minPayment) * 100);

                                return (
                                    <div className="space-y-6">
                                        <div className="relative h-14 w-full rounded-2xl overflow-hidden font-bold text-[10px] uppercase tracking-widest text-white text-center shadow-inner group/bars">
                                            <div className="absolute inset-0 flex">
                                                <div className="bg-red-500 h-full flex items-center justify-center transition-all duration-1000 relative group/red" style={{ width: `${intPercent}%` }}>
                                                    {intPercent > 15 && <span className="relative z-10">Interés {intPercent.toFixed(0)}%</span>}
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/red:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div className="bg-emerald-500 h-full flex items-center justify-center transition-all duration-1000 relative group/green" style={{ width: `${100 - intPercent}%` }}>
                                                    {(100 - intPercent) > 15 && <span className="relative z-10">Capital {(100 - intPercent).toFixed(0)}%</span>}
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/green:opacity-100 transition-opacity"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 px-2">
                                            <div className="flex items-center gap-4 group/item">
                                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover/item:scale-110 transition-transform"><Flame className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-0.5">Gastas en Intereses</p>
                                                    <p className="text-lg font-bold text-red-600">{formatEUR(monthlyInt)}/mes</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 group/item">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover/item:scale-110 transition-transform"><Banknote className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-0.5">Amortizas Capital</p>
                                                    <p className="text-lg font-bold text-emerald-600">{formatEUR(principalPart)}/mes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        <div className="bg-white p-10 rounded-onyx shadow-sm border border-onyx-100 hover:shadow-md transition-all duration-500 relative overflow-hidden group/accel">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-onyx-50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg transition-transform group-hover/accel:scale-110">
                                        <Calculator className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-cyan-900 tracking-tight">Acelerador de Amortización</h3>
                                </div>

                                {/* Toggle Mode */}
                                <div className="flex bg-onyx-50 p-1 rounded-xl border border-onyx-100">
                                    <button
                                        onClick={() => setSimulatorMode('MONTHLY')}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            simulatorMode === 'MONTHLY' ? "bg-white text-cyan-900 shadow-sm" : "text-onyx-400 hover:text-onyx-600"
                                        )}
                                    >
                                        Mensual
                                    </button>
                                    <button
                                        onClick={() => setSimulatorMode('LUMP_SUM')}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            simulatorMode === 'LUMP_SUM' ? "bg-white text-cyan-900 shadow-sm" : "text-onyx-400 hover:text-onyx-600"
                                        )}
                                    >
                                        Extraordinario
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div>
                                    {simulatorMode === 'MONTHLY' ? (
                                        <>
                                            <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-8">Inyección Mensual Extra</label>
                                            <div className="flex items-center gap-8">
                                                <div className="flex-1 relative h-6 flex items-center">
                                                    <input type="range" min="0" max="2000" step="50" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} className="w-full h-1.5 bg-onyx-200 rounded-full appearance-none cursor-pointer accent-cyan-500" />
                                                </div>
                                                <div className="bg-gradient-to-br from-cyan-600 to-teal-600 px-6 py-3 rounded-xl font-bold text-white shadow-xl min-w-[110px] text-center text-lg transition-transform hover:scale-105">+{extraPayment}€</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-[0.2em] mb-8">Amortización Extraordinaria (Hoy)</label>
                                            <div className="space-y-6">
                                                <div className="relative group/input">
                                                    <input
                                                        type="number"
                                                        value={lumpSum || ''}
                                                        onChange={(e) => setLumpSum(Number(e.target.value))}
                                                        className="w-full p-6 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-3xl text-cyan-900 focus:bg-white outline-none transition-all placeholder:text-onyx-200"
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-onyx-300 font-bold text-xl group-focus-within/input:text-cyan-600 transition-colors">€</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[1000, 5000, 10000, 20000].map(val => (
                                                        <button
                                                            key={val}
                                                            onClick={() => setLumpSum(val)}
                                                            className="flex-1 py-2 bg-onyx-50 hover:bg-onyx-100 text-onyx-500 font-bold text-[10px] rounded-lg border border-onyx-100 transition-all"
                                                        >
                                                            +{val.toLocaleString('es-ES')}€
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-8 p-6 bg-cyan-50/50 rounded-2xl border border-cyan-100/50 flex gap-4">
                                        <div className="p-2 bg-white text-cyan-600 rounded-lg shadow-sm h-fit"><Sparkles className="w-4 h-4" /></div>
                                        <p className="text-[11px] text-cyan-900 font-semibold leading-relaxed">
                                            {simulatorMode === 'MONTHLY'
                                                ? "Al inyectar capital extra mensualmente, reduces drásticamente los intereses pagados y el tiempo de vida de la deuda."
                                                : "Un pago extraordinario puntual reduce el capital pendiente de inmediato, ahorrando intereses de forma masiva sobre el capital amortizado."}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-onyx-50/50 rounded-3xl p-8 space-y-8 border border-onyx-100/50">
                                    {baseSimulation?.isPossible && simulation?.isPossible ? (
                                        <>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[10px] font-bold text-onyx-400 uppercase tracking-widest px-1">
                                                    <span>Sin Extra</span>
                                                    <span>{baseSimulation.months} Meses</span>
                                                </div>
                                                <div className="w-full bg-onyx-200/50 h-2.5 rounded-full overflow-hidden">
                                                    <div className="bg-onyx-300 h-full w-full"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[10px] font-bold text-cyan-900 uppercase tracking-widest px-1">
                                                    <span className="flex items-center gap-2">
                                                        {simulatorMode === 'MONTHLY' ? 'Con Extra Mensual' : 'Con Pago Único'}
                                                        {simulation.months === 0 && <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded italic">PAGADO</span>}
                                                    </span>
                                                    <span className="text-emerald-600 font-black flex items-center gap-1">
                                                        <Flame className="w-3 h-3" /> -{Math.max(0, baseSimulation.months - simulation.months)} MESES
                                                    </span>
                                                </div>
                                                <div className="w-full bg-onyx-200/50 h-2.5 rounded-full overflow-hidden shadow-inner">
                                                    <div className="bg-cyan-900 h-full shadow-[0_0_12px_rgba(2,6,23,0.3)] transition-all duration-1000 ease-out" style={{ width: `${(simulation.months / baseSimulation.months) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="pt-8 mt-4 border-t border-onyx-200/50 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-onyx-500 uppercase tracking-widest">Ahorro Real Estimado</span>
                                                <div className="text-right">
                                                    <span className="text-3xl font-bold text-emerald-600 tracking-tight">{formatEUR(Math.max(0, baseSimulation.totalInterest - simulation.totalInterest))}</span>
                                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">En Intereses Evitados</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-onyx-400 text-xs italic">Simulación no disponible</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-onyx shadow-sm border border-onyx-100 overflow-hidden hover:shadow-md transition-all duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-2 bg-onyx-50 text-onyx-400 rounded-lg">
                                    <History className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-cyan-900 tracking-tight">Historial de Pagos</h3>
                            </div>
                            <div className="overflow-x-auto -mx-10">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-onyx-50/50 text-onyx-400 text-[9px] font-bold uppercase tracking-[0.2em] border-y border-onyx-100/50">
                                        <tr>
                                            <th className="px-10 py-5">Fecha</th>
                                            <th className="px-10 py-5">Referencia</th>
                                            <th className="px-10 py-5 text-center">Estado</th>
                                            <th className="px-10 py-5 text-right">Amortización</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-onyx-50">
                                        {selectedDebt.payments && selectedDebt.payments.length > 0 ? (
                                            selectedDebt.payments.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p) => {
                                                return (
                                                    <tr key={p.id} className="hover:bg-onyx-50/30 transition-all group/row">
                                                        <td className="px-10 py-6 font-bold text-onyx-600 group-hover/row:text-cyan-900 transition-colors">{new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td className="px-10 py-6">
                                                            <span className="text-[10px] font-mono text-onyx-300 bg-onyx-50 px-2.5 py-1.5 rounded-lg border border-onyx-100/50 group-hover/row:border-cyan-100 transition-colors uppercase">IDX-{p.id.substring(0, 6)}</span>
                                                        </td>
                                                        <td className="px-10 py-6 text-center">
                                                            <div className="flex items-center justify-center gap-2 text-emerald-500 group-hover/row:scale-110 transition-transform">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                                <span className="text-[9px] font-bold uppercase tracking-widest">Procesado</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <span className="font-bold text-cyan-900 text-base block tracking-tight">-{formatEUR(p.amount)}</span>
                                                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest opacity-0 group-hover/row:opacity-100 translate-y-2 group-hover/row:translate-y-0 transition-all duration-300">Confirmado</span>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-20 text-center text-onyx-300">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="p-6 bg-onyx-50 rounded-full shadow-inner"><Clock className="w-10 h-10 opacity-20" /></div>
                                                        <span className="text-[11px] font-bold uppercase tracking-widest">Sin amortizaciones registradas</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {isAddModalOpen && (
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
                                <button onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="text-onyx-400 hover:text-cyan-900 p-2.5 hover:bg-onyx-50 rounded-xl transition-all">
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
                )}


                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-900/40 backdrop-blur-md p-4 animate-fade-in text-cyan-900">
                        <div className="bg-white rounded-onyx shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-onyx-100 relative shadow-cyan-500/10">
                            <div className="bg-white px-10 py-8 flex justify-between items-center border-b border-onyx-50 sticky top-0 z-10">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm">
                                            <Banknote className="w-6 h-6" />
                                        </div>
                                        Amortización
                                    </h3>
                                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-2 ml-16">Reducción de pasivo financiero</p>
                                </div>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="text-onyx-400 hover:text-cyan-900 p-2.5 hover:bg-onyx-50 rounded-xl transition-all">
                                    <X className="w-7 h-7" />
                                </button>
                            </div>
                            <form onSubmit={handleRegisterPayment} className="p-10 space-y-10">
                                <div>
                                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-4 block text-center">Cantidad a Amortizar</label>
                                    <div className="relative group/input">
                                        <input autoFocus type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full p-8 bg-onyx-50 border border-onyx-100 rounded-3xl font-bold text-5xl text-cyan-900 focus:bg-white outline-none transition-all text-center shadow-inner" placeholder="0.00" />
                                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-onyx-200 font-bold text-3xl group-focus-within/input:text-cyan-500 transition-colors">€</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest block">Cuenta de Origen</label>
                                    <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white outline-none cursor-pointer transition-all shadow-inner">
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
                )}
            </div>
        </div>
    );
};


export default Debts;
