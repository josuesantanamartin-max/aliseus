import React from 'react';
import { Target, Banknote, Calendar, Zap, AlertCircle, TrendingDown, ArrowRight, Save, ShieldAlert, Trash2, Plus } from 'lucide-react';
import { Debt } from '../../../../types';

interface DebtDetailMainProps {
    selectedDebt: Debt;
    formatEUR: (amount: number) => string;
    handleDeleteDebt: (id: string) => void;
    setShowPaymentModal: (show: boolean) => void;
    showSimulation: boolean;
    setShowSimulation: (show: boolean) => void;
    simulationExtra: number;
    setSimulationExtra: (amount: number) => void;
    calculatePayoff: (debt: Debt, extraPayment?: number) => { months: number, totalInterest: number, remainingData: any[] };
}

export const DebtDetailMain: React.FC<DebtDetailMainProps> = ({
    selectedDebt,
    formatEUR,
    handleDeleteDebt,
    setShowPaymentModal,
    showSimulation,
    setShowSimulation,
    simulationExtra,
    setSimulationExtra,
    calculatePayoff
}) => {
    const currentPayoff = calculatePayoff(selectedDebt);
    const simulatedPayoff = showSimulation ? calculatePayoff(selectedDebt, simulationExtra) : null;
    const monthsSaved = simulatedPayoff ? currentPayoff.months - simulatedPayoff.months : 0;
    const interestSaved = simulatedPayoff ? currentPayoff.totalInterest - simulatedPayoff.totalInterest : 0;
    const progress = ((selectedDebt.originalAmount - selectedDebt.remainingBalance) / selectedDebt.originalAmount) * 100;

    return (
        <div className="md:col-span-8 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-onyx-100 shadow-xl shadow-onyx-200/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -mx-32 -my-32 opacity-50 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-black text-cyan-950 tracking-tight">{selectedDebt.name}</h2>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-widest font-bold rounded-xl border border-emerald-200">
                                {progress.toFixed(1)}% Pagado
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-onyx-400 flex items-center gap-2">
                            Tipo de deuda: <span className="text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">{selectedDebt.type}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-cyan-900 text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-cyan-800 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20"
                        >
                            <Plus className="w-4 h-4" /> Registrar Pago
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-onyx-50 p-4 rounded-2xl border border-onyx-100">
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Target className="w-3 h-3 text-cyan-600" /> Restante
                        </p>
                        <p className="text-2xl font-black text-cyan-900">{formatEUR(selectedDebt.remainingBalance)}</p>
                        <p className="text-xs font-bold text-onyx-400 mt-1">de {formatEUR(selectedDebt.originalAmount)}</p>
                    </div>
                    <div className="bg-onyx-50 p-4 rounded-2xl border border-onyx-100">
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Banknote className="w-3 h-3 text-emerald-500" /> Pago Min.
                        </p>
                        <p className="text-2xl font-black text-cyan-900">{formatEUR(selectedDebt.minPayment)}</p>
                        <p className="text-xs font-bold text-onyx-400 mt-1">Mensual</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-red-600" /> Interés
                        </p>
                        <p className="text-2xl font-black text-red-700">{selectedDebt.interestRate}%</p>
                        <p className="text-xs font-bold text-red-400 mt-1">APR</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Tiempo
                        </p>
                        <p className="text-2xl font-black text-amber-700">
                            {Math.floor(currentPayoff.months / 12)}a {currentPayoff.months % 12}m
                        </p>
                        <p className="text-xs font-bold text-amber-500 mt-1">Estimado</p>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">Progreso de liquidación</p>
                        <p className="font-bold text-cyan-900 text-sm">{formatEUR(selectedDebt.originalAmount - selectedDebt.remainingBalance)} Pagado</p>
                    </div>
                    <div className="w-full h-4 bg-onyx-100 rounded-full overflow-hidden shadow-inner flex">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                        </div>
                    </div>
                </div>

                {/* Simulador de Pagos */}
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white relative overflow-hidden ring-4 ring-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Zap className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Simulador de Aceleración</h3>
                                <p className="text-xs text-indigo-200 font-medium">Ve cómo pagos extra destruyen el interés</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={showSimulation} onChange={() => setShowSimulation(!showSimulation)} />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    {showSimulation && (
                        <div className="relative z-10 animate-fade-in">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-full md:w-1/3">
                                    <label className="block text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Pago Mensual Extra</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">€</span>
                                        <input
                                            type="number"
                                            value={simulationExtra}
                                            onChange={(e) => setSimulationExtra(Number(e.target.value))}
                                            className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white font-bold text-lg placeholder-white/30"
                                            placeholder="100"
                                            min="0"
                                            step="10"
                                        />
                                    </div>
                                    <p className="text-[10px] text-indigo-300 mt-2 text-center">Nuevo pago total: {formatEUR(selectedDebt.minPayment + simulationExtra)}</p>
                                </div>

                                <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <Save className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Ahorro en Intereses</p>
                                        <p className="text-2xl font-black text-emerald-400">{formatEUR(interestSaved)}</p>
                                        <p className="text-xs text-indigo-200 mt-1 line-through opacity-70">de {formatEUR(currentPayoff.totalInterest)}</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <TrendingDown className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Tiempo Ahorrado</p>
                                        <p className="text-2xl font-black text-emerald-400">
                                            {monthsSaved >= 12 ? `${Math.floor(monthsSaved / 12)}a ` : ''}{monthsSaved % 12}m
                                        </p>
                                        <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1">
                                            <span>Nuevo final:</span> <ArrowRight className="w-3 h-3" /> <span className="font-bold">{Math.floor(simulatedPayoff!.months / 12)}a {simulatedPayoff!.months % 12}m</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-red-100 flex justify-end">
                    <button
                        onClick={() => handleDeleteDebt(selectedDebt.id)}
                        className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar Deuda
                    </button>
                </div>

                <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
                    <div className="text-xs">
                        <p className="font-bold mb-1">Impacto del Interés Compuesto</p>
                        <p>Si solo realizas el pago mínimo, terminarás pagando <strong>{formatEUR(currentPayoff.totalInterest)}</strong> solo en intereses over {Math.floor(currentPayoff.months / 12)} años y {currentPayoff.months % 12} meses.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
