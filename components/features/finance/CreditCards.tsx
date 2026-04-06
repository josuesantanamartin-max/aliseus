import React, { useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useFinanceControllers } from '../../../hooks/useFinanceControllers';
import { Account } from '../../../types';
import { CreditCard, Plus, Calendar, TrendingDown, RefreshCw, X, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../../../hooks/useCurrency';

interface CreditCardsProps {
  // All state managed via stores
}

const CreditCards: React.FC<CreditCardsProps> = () => {
  const { accounts, setAccounts } = useFinanceStore();
  const { transfer } = useFinanceControllers();
  const { formatPrice: formatEUR } = useCurrency();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [paymentMode, setPaymentMode] = useState<'END_OF_MONTH' | 'REVOLVING'>('END_OF_MONTH');
  const [linkedAccountId, setLinkedAccountId] = useState('');

  const creditCards = accounts.filter(acc => acc.type === 'CREDIT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limit) return;

    const newAccount: Account = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: 'CREDIT',
      balance: -Math.abs(parseFloat(currentBalance) || 0),
      currency: 'EUR',
      creditLimit: parseFloat(limit),
      cutoffDay: parseInt(cutoffDay) || 1,
      paymentDay: parseInt(paymentDay) || 5,
      paymentMode,
      linkedAccountId: linkedAccountId || undefined,
      statementBalance: Math.abs(parseFloat(currentBalance) || 0),
    };

    setAccounts((prev: Account[]) => [...prev, newAccount]);
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setLimit('');
    setCutoffDay('');
    setPaymentDay('');
    setCurrentBalance('');
    setPaymentMode('END_OF_MONTH');
    setLinkedAccountId('');
  };

  // Settle the current billing cycle: transfers statementBalance from linked bank account to the card
  const handleSettleCycle = (card: Account) => {
    const amount = card.statementBalance ?? 0;
    if (amount <= 0) return;
    const sourceId = card.linkedAccountId;
    if (!sourceId) {
      alert('Esta tarjeta no tiene una cuenta bancaria vinculada. Vincúlala primero para liquidar.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    transfer(sourceId, card.id, amount, today, undefined, `Liquidación ciclo ${card.name}`);
    // Reset the statement cycle counter
    setAccounts((prev: Account[]) => prev.map(acc =>
      acc.id === card.id ? { ...acc, statementBalance: 0 } : acc
    ));
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-extrabold text-cyan-900 tracking-tight">Mis Tarjetas</h2>
          <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mt-2">Gestión de límites y ciclos de facturación</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-4 bg-cyan-900 hover:bg-aliseus-800 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-cyan-900/20 active:scale-95 group"
        >
          {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />}
          {isFormOpen ? 'Cerrar Panel' : 'Nueva Tarjeta'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-aliseus-100 mb-12 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
          <h3 className="text-xl font-bold mb-10 text-cyan-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-cyan-50 text-cyan-primary rounded-xl">
              <Plus className="w-6 h-6" />
            </div>
            Alta de Tarjeta de Crédito
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="col-span-1 md:col-span-2 space-y-3">
              <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest ml-1">Denominación del Plástico</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: VISA Infinite Platinum" className="w-full p-5 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-primary/5 outline-none transition-all shadow-inner" />
            </div>

            {/* Payment Mode */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest ml-1">Modo de Pago</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPaymentMode('END_OF_MONTH')} className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${paymentMode === 'END_OF_MONTH' ? 'border-cyan-500 bg-cyan-50' : 'border-aliseus-100 bg-aliseus-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className={`w-4 h-4 ${paymentMode === 'END_OF_MONTH' ? 'text-cyan-500' : 'text-aliseus-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-aliseus-700">Fin de Mes</span>
                  </div>
                  <p className="text-[10px] text-aliseus-400 ml-6">Saldo íntegro liquidado al cierre del ciclo</p>
                </button>
                <button type="button" onClick={() => setPaymentMode('REVOLVING')} className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${paymentMode === 'REVOLVING' ? 'border-amber-500 bg-amber-50' : 'border-aliseus-100 bg-aliseus-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCw className={`w-4 h-4 ${paymentMode === 'REVOLVING' ? 'text-amber-500' : 'text-aliseus-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-aliseus-700">Revolving</span>
                  </div>
                  <p className="text-[10px] text-aliseus-400 ml-6">Pago mínimo mensual, deuda acumulable</p>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest ml-1">Cupo Disponible (€)</label>
              <input type="number" required value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full p-5 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-xl text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest ml-1">Utilización Inicial (€)</label>
              <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} placeholder="0.00" className="w-full p-5 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-xl text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-primary/5 outline-none transition-all shadow-inner" />
            </div>

            {/* Linked bank account for auto-settlement */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest ml-1">Cuenta Bancaria Vinculada (para liquidaciones)</label>
              <select value={linkedAccountId} onChange={e => setLinkedAccountId(e.target.value)} className="w-full p-5 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-primary/5 outline-none transition-all shadow-inner cursor-pointer">
                <option value="">Sin vincular</option>
                {accounts.filter(a => a.type === 'BANK' || a.type === 'WALLET').map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({formatEUR(a.balance)})</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest ml-1">Día de Facturación</label>
              <input type="number" min="1" max="31" value={cutoffDay} onChange={(e) => setCutoffDay(e.target.value)} placeholder="Ej: 20" className="w-full p-5 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest ml-1">Día de Liquidación</label>
              <input type="number" min="1" max="31" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} placeholder="Ej: 5" className="w-full p-5 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-primary/5 outline-none transition-all shadow-inner" />
            </div>

            <div className="col-span-1 md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-cyan-900 hover:bg-aliseus-800 text-white py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-cyan-900/20 active:scale-95 group relative overflow-hidden">
                <span className="relative z-10">Consolidar Registro de Tarjeta</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => {
          const limitAmount = card.creditLimit || 0;
          const currentDebt = Math.abs(card.balance);
          const available = limitAmount - currentDebt;
          const utilization = limitAmount > 0 ? (currentDebt / limitAmount) * 100 : 0;
          const isHighUtilization = utilization > 80;
          const cycleDebt = card.statementBalance ?? 0;
          const linkedBank = accounts.find(a => a.id === card.linkedAccountId);
          const modeLabel = card.paymentMode === 'REVOLVING' ? 'Revolving' : 'Fin de Mes';
          const modeColor = card.paymentMode === 'REVOLVING' ? 'text-amber-600 bg-amber-50' : 'text-cyan-600 bg-cyan-50';

          return (
            <div key={card.id} className="group relative overflow-hidden bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-aliseus-100 shadow-2xl shadow-cyan-900/5 hover:shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-extrabold text-xl text-cyan-900 tracking-tight mb-2">{card.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="p-1 px-3 bg-cyan-900 text-white rounded-lg text-[9px] font-mono tracking-widest">VISA</div>
                    <span className="text-[10px] text-aliseus-400 font-mono tracking-wider">**** {card.id.substring(0, 4)}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${modeColor}`}>{modeLabel}</span>
                  </div>
                </div>
                <div className="p-4 bg-aliseus-50 text-aliseus-400 rounded-2xl group-hover:bg-cyan-50 group-hover:text-cyan-primary transition-all duration-500">
                  <CreditCard className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-aliseus-400 uppercase tracking-widest mb-1">Deuda Total</p>
                    <p className="text-2xl font-black text-cyan-900 tracking-tight">{formatEUR(currentDebt)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-aliseus-400 uppercase tracking-widest mb-1">Ciclo Actual</p>
                    <p className={`text-2xl font-black tracking-tight ${cycleDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatEUR(cycleDebt)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-aliseus-400">Cupo Total: {formatEUR(limitAmount)}</span>
                    <span className={isHighUtilization ? 'text-red-500' : 'text-emerald-500'}>{formatEUR(available)} LIBRE</span>
                  </div>
                  <div className="w-full bg-aliseus-100 rounded-full h-3 p-1 shadow-inner relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${isHighUtilization ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-cyan-500 to-cyan-400'}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-aliseus-50">
                  <div className="bg-aliseus-50/50 p-3 rounded-2xl border border-aliseus-100/50">
                    <p className="text-[8px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-1">Cierre Ciclo</p>
                    <p className="font-black text-aliseus-900 text-sm">Día {card.cutoffDay || '--'}</p>
                  </div>
                  <div className="bg-aliseus-50/50 p-3 rounded-2xl border border-aliseus-100/50">
                    <p className="text-[8px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-1">Vencimiento</p>
                    <p className="font-black text-aliseus-900 text-sm">Día {card.paymentDay || '--'}</p>
                  </div>
                </div>

                {/* Linked bank account info */}
                {linkedBank && (
                  <div className="bg-aliseus-50/50 p-3 rounded-2xl border border-aliseus-100/50 flex items-center gap-3">
                    <ArrowRightLeft className="w-4 h-4 text-aliseus-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold text-aliseus-400 uppercase tracking-[0.2em]">Cuenta Vinculada</p>
                      <p className="font-bold text-aliseus-900 text-[11px] truncate">{linkedBank.name} · {formatEUR(linkedBank.balance)}</p>
                    </div>
                  </div>
                )}

                {/* Liquidar Ciclo button */}
                <button
                  onClick={() => handleSettleCycle(card)}
                  disabled={cycleDebt <= 0}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${cycleDebt > 0
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20 active:scale-95'
                    : 'bg-aliseus-100 text-aliseus-400 cursor-not-allowed'
                    }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  {cycleDebt > 0 ? `Liquidar ${formatEUR(cycleDebt)}` : 'Ciclo al día ✓'}
                </button>
              </div>
            </div>
          );
        })}

        {creditCards.length === 0 && !isFormOpen && (
          <div className="col-span-full text-center p-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tienes tarjetas de crédito registradas.</p>
            <button onClick={() => setIsFormOpen(true)} className="mt-2 text-blue-950 font-medium hover:underline">Añadir una ahora</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCards;
