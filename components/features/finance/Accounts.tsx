import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Account, CadastralData, Transaction } from '../../../types';
import {
  Wallet, CreditCard, Banknote, Landmark, Plus, Pencil, Trash2, X,
  TrendingUp, ShieldCheck, CircuitBoard, ArrowRightLeft, Wifi, Layers, Search, CheckCircle,
  ArrowUpRight, ArrowDownRight, ArrowRight, GripVertical
} from 'lucide-react';
import { useFinanceControllers } from '../../../hooks/useFinanceControllers';
import { fetchCadastralData, isValidCadastralReference } from '../../../services/catastroService';

interface AccountsProps {
  onViewTransactions: (accountId: string) => void;
}

const Accounts: React.FC<AccountsProps> = ({ onViewTransactions }) => {
  const { accounts, setAccounts, transactions, addAccount, updateAccount, deleteAccount } = useFinanceStore();
  const { transfer } = useFinanceControllers();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Drag-to-reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Initialize selection
  useEffect(() => {
    // Only select if we have accounts and none is selected
    // Also, careful not to select a hidden account (CREDIT/DEBIT) if we are filtering them?
    // User asked to hide them from "Tus Cuentas", so defaulting to a BANK/ASSET/CASH/INVESTMENT account is better.
    const visibleAccounts = accounts.filter(a => a.type !== 'CREDIT' && a.type !== 'DEBIT');
    if (visibleAccounts.length > 0 && (!selectedAccountId || !accounts.find(a => a.id === selectedAccountId))) {
      setSelectedAccountId(visibleAccounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [type, setType] = useState<Account['type']>('BANK');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('EUR');

  const [isRemunerated, setIsRemunerated] = useState(false);
  const [tae, setTae] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');

  // Cadastral State (for ASSET type)
  const [cadastralReference, setCadastralReference] = useState('');
  const [cadastralData, setCadastralData] = useState<CadastralData | null>(null);
  const [isFetchingCadastral, setIsFetchingCadastral] = useState(false);
  const [cadastralError, setCadastralError] = useState('');

  // Derived Stats
  const totalAssets = accounts.filter(a => a.type !== 'CREDIT').reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0);
  const totalLiabilities = accounts.filter(a => a.type === 'CREDIT').reduce((sum, acc) => sum + (acc.balance < 0 ? Math.abs(acc.balance) : 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'BANK': return 'Cuenta Corriente';
      case 'CASH': return 'Efectivo';
      case 'CREDIT': return 'Tarjeta Crédito';
      case 'DEBIT': return 'Tarjeta Débito';
      case 'INVESTMENT': return 'Inversión';
      case 'ASSET': return 'Activo Fijo';
      case 'WALLET': return 'Billetera';
      default: return type;
    }
  };

  const formatEUR = (amount: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(amount);

  const resetForm = () => {
    setName(''); setBankName(''); setType('BANK'); setBalance(''); setCurrency('EUR');
    setIsRemunerated(false); setTae(''); setCreditLimit(''); setCutoffDay('');
    setPaymentDay(''); setLinkedAccountId(''); setEditingId(null); setIsModalOpen(false);
    setCadastralReference(''); setCadastralData(null); setCadastralError('');
  };

  const handleFetchCadastralData = async () => {
    if (!cadastralReference.trim()) {
      setCadastralError('Por favor, introduce una referencia catastral');
      return;
    }

    if (!isValidCadastralReference(cadastralReference)) {
      setCadastralError('Formato inválido. La referencia debe tener 20 caracteres.');
      return;
    }

    setIsFetchingCadastral(true);
    setCadastralError('');

    const result = await fetchCadastralData(cadastralReference);

    setIsFetchingCadastral(false);

    if (result.success && result.data) {
      setCadastralData(result.data);
      // Auto-fill name if empty
      if (!name) {
        setName(`Inmueble ${result.data.uso || 'Residencial'}`);
      }
    } else {
      setCadastralError(result.error || 'Error al consultar el Catastro');
      setCadastralData(null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, account: Account) => {
    e.stopPropagation(); setName(account.name); setBankName(account.bankName || '');
    setType(account.type); setBalance(account.balance.toString()); setCurrency(account.currency);
    setIsRemunerated(account.isRemunerated || false); setTae(account.tae?.toString() || '');
    setCreditLimit(account.creditLimit?.toString() || ''); setCutoffDay(account.cutoffDay?.toString() || '');
    setPaymentDay(account.paymentDay?.toString() || ''); setLinkedAccountId(account.linkedAccountId || '');
    setCadastralReference(account.cadastralReference || ''); setCadastralData(account.cadastralData || null);
    setEditingId(account.id); setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar esta cuenta?')) {
      if (selectedAccountId === id) setSelectedAccountId(null);
      deleteAccount(id);
    }
  };

  const handleSettleClick = (e: React.MouseEvent, card: Account) => {
    e.stopPropagation();
    if (!card.linkedAccountId) return alert("Esta tarjeta no tiene cuenta asociada.");
    const debt = Math.abs(card.balance);
    if (debt === 0) return alert("Sin deuda.");
    if (window.confirm(`¿Confirmas liquidar ${formatEUR(debt)}?`)) {
      transfer(card.linkedAccountId, card.id, debt, "Liquidación de tarjeta");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accountData: any = {
      name,
      bankName: bankName || undefined,
      type,
      balance: parseFloat(balance),
      currency,
      linkedAccountId: (type === 'CREDIT' || type === 'DEBIT') ? linkedAccountId : undefined
    };
    if (type === 'BANK') {
      accountData.isRemunerated = isRemunerated;
      if (isRemunerated) accountData.tae = parseFloat(tae);
    }
    if (type === 'CREDIT') {
      accountData.creditLimit = parseFloat(creditLimit);
      accountData.cutoffDay = parseInt(cutoffDay);
      accountData.paymentDay = parseInt(paymentDay);
    }
    if (type === 'ASSET') {
      accountData.cadastralReference = cadastralReference || undefined;
      accountData.cadastralData = cadastralData || undefined;
    }

    if (editingId) {
      updateAccount(editingId, accountData);
    } else {
      const newAccount = { ...accountData, id: Math.random().toString(36).substr(2, 9) };
      addAccount(newAccount);
    }
    resetForm();
  };

  // Drag handlers — operate on visible accounts only
  const visibleAccounts = accounts.filter(a => a.type !== 'CREDIT' && a.type !== 'DEBIT');

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
    const reordered = [...visibleAccounts];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const hidden = accounts.filter(a => a.type === 'CREDIT' || a.type === 'DEBIT');
    setAccounts(() => [...reordered, ...hidden]);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BANK': return <Landmark className="w-5 h-5" />;
      case 'CASH': return <Banknote className="w-5 h-5" />;
      case 'INVESTMENT': return <TrendingUp className="w-5 h-5" />;
      case 'ASSET': return <Layers className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const renderCard = (card: Account, isIndented: boolean = false) => {
    const isCredit = card.type === 'CREDIT';
    const limitAmount = card.creditLimit || 0;
    const currentDebt = isCredit ? Math.abs(card.balance) : 0;
    const utilization = isCredit && limitAmount > 0 ? (currentDebt / limitAmount) * 100 : 0;

    return (
      <div
        key={card.id}
        onClick={() => onViewTransactions(card.id)}
        className={`relative overflow-hidden rounded-onyx shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer group h-40 flex flex-col justify-between p-6 ${isCredit
          ? 'bg-cyan-900 text-white border border-onyx-800'
          : 'bg-emerald-950 text-white border border-emerald-900'
          } ${isIndented ? 'scale-[0.98] origin-left' : ''}`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-12 -mt-12 transition-all duration-700 group-hover:scale-150 ${isCredit ? 'bg-cyan-500' : 'bg-emerald-400'}`}></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Wifi className="w-4 h-4 rotate-90 text-white/40" />
            <div className="w-10 h-7 bg-white/10 rounded-lg border border-white/10 flex items-center justify-center">
              <div className="w-5 h-4 bg-white/20 rounded-md"></div>
            </div>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">{isCredit ? 'Premium Credit' : 'Signature Debit'}</p>
        </div>

        <div className="relative z-10">
          <h4 className="font-bold text-base tracking-wide text-white truncate mb-1">{card.name}</h4>
          <p className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">•••• •••• {card.id.substring(0, 4)}</p>
        </div>

        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1.5">{isCredit ? 'Deuda' : 'Saldo'}</p>
            <p className={`text-2xl font-bold tracking-tight ${isCredit && currentDebt > 0 ? 'text-red-300' : 'text-white'}`}>
              {isCredit && currentDebt > 0 ? '-' : ''}{formatEUR(isCredit ? currentDebt : card.balance)}
            </p>
          </div>

          <div className="flex items-center gap-3 -mb-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button onClick={(e) => handleEditClick(e, card)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-md border border-white/10"><Pencil className="w-4 h-4" /></button>
            {isCredit && currentDebt > 0 && (
              <button onClick={(e) => handleSettleClick(e, card)} className="p-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors border border-cyan-400 shadow-lg shadow-cyan-500/20"><ArrowRightLeft className="w-4 h-4" /></button>
            )}
            <button onClick={(e) => handleDeleteClick(e, card.id)} className="p-2.5 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-colors border border-red-500/20"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>

        {isCredit && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-cyan-950/20">
            <div className={`h-full transition-all duration-1000 ${utilization > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
          </div>
        )}
      </div>
    );
  };

  // --- STATS CALCULATION LOGIC ---
  const getAccountStats = (account: Account) => {
    if (!account) return { monthDiff: 0, yearDiff: 0, isMonthUp: false, isYearUp: false, prevMonthBalance: 0, yearStartBalance: 0 };

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const accTxs = transactions.filter(t => t.accountId === account.id);

    // Month Logic
    const txsThisMonth = accTxs.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const flowThisMonth = txsThisMonth.reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
    const balanceEndLastMonth = account.balance - flowThisMonth;

    const monthDiff = account.balance - balanceEndLastMonth;
    const isMonthUp = monthDiff >= 0;

    // Year Logic
    const txsThisYear = accTxs.filter(t => new Date(t.date).getFullYear() === currentYear);
    const flowThisYear = txsThisYear.reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
    const balanceEndLastYear = account.balance - flowThisYear;

    const yearDiff = account.balance - balanceEndLastYear;
    const isYearUp = yearDiff >= 0;

    return { monthDiff, yearDiff, isMonthUp, isYearUp, prevMonthBalance: balanceEndLastMonth, yearStartBalance: balanceEndLastYear };
  };

  const stats = selectedAccount ? getAccountStats(selectedAccount) : null;
  const linkedCards = selectedAccount ? accounts.filter(a => (a.type === 'CREDIT' || a.type === 'DEBIT') && a.linkedAccountId === selectedAccount.id) : [];

  return (
    <div className="space-y-10 animate-fade-in pb-10" key="accounts-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Cuentas y Activos</h2>
          <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Gestión integral de tu patrimonio</p>
        </div>
        {!isModalOpen && (
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-95">
            <Plus className="w-5 h-5" /> Nueva Cuenta
          </button>
        )}
      </div>

      {/* GLOBAL STATS (Small Version) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-onyx shadow-sm border border-onyx-100 flex flex-col justify-between h-32 overflow-hidden group hover:shadow-lg transition-all relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50/50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-onyx-400 font-bold text-[10px] uppercase tracking-[0.2em] relative z-10">Patrimonio Neto</p>
          <h3 className="text-4xl font-bold text-cyan-900 tracking-tight relative z-10">{formatEUR(netWorth)}</h3>
          <div className="w-full bg-onyx-50 h-2 mt-2 rounded-full overflow-hidden relative z-10 border border-onyx-100/50">
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(6,182,212,0.3)]" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-onyx shadow-sm border border-onyx-100 flex flex-col justify-between h-32 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-onyx-400 font-bold text-[10px] uppercase tracking-[0.2em]">Activos Totales</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-4xl font-bold text-cyan-900 tracking-tight relative z-10">{formatEUR(totalAssets)}</h3>
        </div>
        <div className="bg-white p-6 rounded-onyx shadow-sm border border-onyx-100 flex flex-col justify-between h-32 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-onyx-400 font-bold text-[10px] uppercase tracking-[0.2em]">Pasivos</p>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><TrendingUp className="w-4 h-4 transform rotate-180" /></div>
          </div>
          <h3 className="text-4xl font-bold text-cyan-900 tracking-tight relative z-10">{formatEUR(totalLiabilities)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* SIDEBAR LIST */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-onyx-100">
            <h3 className="font-bold text-cyan-900 text-lg">Tus Cuentas</h3>
            <span className="text-xs font-bold bg-onyx-100 px-2 py-1 rounded-lg text-onyx-500">{accounts.filter(a => a.type !== 'CREDIT' && a.type !== 'DEBIT').length} Activas</span>
          </div>

          <div className="space-y-3">
            {visibleAccounts.map((account, index) => {
              const isSelected = selectedAccountId === account.id;
              const isRemuneratedAcc = account.isRemunerated;
              const isDraggedOver = dragOverIndex === index && dragIndex !== index;

              return (
                <div
                  key={account.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden select-none
                    ${isSelected ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white text-cyan-900 border-onyx-100 hover:border-cyan-200 hover:bg-slate-50'}
                    ${isDraggedOver ? 'border-cyan-400 border-2 scale-[1.01] shadow-md shadow-cyan-200' : ''}
                    ${dragIndex === index ? 'opacity-50' : ''}`}
                >
                  <div className={`absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ${isSelected ? 'text-white/30' : 'text-onyx-300'}`}>
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex justify-between items-center mb-1 pl-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-600'}`}>{getIcon(account.type)}</div>
                      <div>
                        {account.bankName && <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/50' : 'text-onyx-400'}`}>{account.bankName}</p>}
                        <p className="font-semibold text-sm leading-tight line-clamp-1">{account.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-2 pl-3">
                    <p className={`font-bold text-lg leading-none`}>{formatEUR(account.balance)}</p>
                    {isRemuneratedAcc && account.tae && <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>{account.tae}% TAE</p>}
                  </div>
                  {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN DETAIL CONTENT */}
        <div className="md:col-span-8 space-y-6">
          {isModalOpen ? (
            <div className="bg-white p-10 rounded-onyx shadow-xl border border-onyx-100 animate-fade-in relative overflow-hidden w-full">
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-onyx-50">
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-cyan-900">{editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}</h4>
                  <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-1">INFORMACIÓN DE LA CUENTA</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-onyx-50 rounded-full transition-colors"><X className="w-5 h-5 text-onyx-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Nombre</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-cyan-900 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 outline-none" placeholder="Ej: Cuenta Principal" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Banco</label>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-cyan-900 outline-none" placeholder="Ej: BBVA" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Tipo</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-cyan-900 outline-none cursor-pointer">
                      <option value="BANK">Bancaria</option>
                      <option value="CASH">Efectivo</option>
                      <option value="ASSET">Activo</option>
                      <option value="CREDIT">Crédito</option>
                      <option value="DEBIT">Débito</option>
                      <option value="INVESTMENT">Inversión</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Saldo / Valor</label>
                    <input required type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-3xl text-cyan-900 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-onyx-50">
                  <div className="col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isRemunerated} onChange={e => setIsRemunerated(e.target.checked)} className="w-5 h-5 rounded-lg text-cyan-600 border-onyx-200 focus:ring-cyan-500" />
                      <span className="font-bold text-sm text-onyx-700">Cuenta Remunerada / Inversión con Retorno</span>
                    </label>
                  </div>
                  {isRemunerated && (
                    <div>
                      <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">TAE / Interés Anual (%)</label>
                      <input type="number" step="0.01" value={tae} onChange={e => setTae(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-cyan-900 outline-none" placeholder="2.5" />
                    </div>
                  )}
                </div>

                {type === 'ASSET' && (
                  <div className="bg-onyx-50/50 p-6 rounded-2xl border border-onyx-100">
                    <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 block">Ref. Catastral</label>
                    <div className="flex gap-2">
                      <input type="text" value={cadastralReference} onChange={e => setCadastralReference(e.target.value)} className="flex-1 p-3 bg-white border border-onyx-200 rounded-xl" />
                      <button type="button" onClick={handleFetchCadastralData} className="px-4 bg-cyan-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-cyan-700 transition">Consultar</button>
                    </div>
                    {cadastralData && <div className="mt-4 p-4 bg-white rounded-xl text-xs text-cyan-900 border border-cyan-100">{cadastralData.uso} - {cadastralData.superficie} m²</div>}
                  </div>
                )}

                {(type === 'CREDIT' || type === 'DEBIT') && (
                  <div className="bg-onyx-50/50 p-6 rounded-2xl border border-onyx-100 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2 block">Cuenta Vinculada</label>
                      <select value={linkedAccountId} onChange={e => setLinkedAccountId(e.target.value)} className="w-full p-3 bg-white border border-onyx-200 rounded-xl font-bold text-sm">
                        <option value="">Seleccionar...</option>
                        {accounts.filter(a => a.type === 'BANK').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-onyx-500 hover:bg-onyx-50 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-cyan-900/20 transition-all active:scale-95">Guardar</button>
                </div>
              </form>
            </div>
          ) : selectedAccount ? (
            <div className="space-y-8">
              {/* DETAIL HEADER CARD */}
              <div className="bg-white p-6 md:p-8 lg:p-10 rounded-3xl shadow-sm border border-onyx-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-onyx-400 uppercase tracking-[0.2em] mb-1">{selectedAccount.bankName || getAccountTypeLabel(selectedAccount.type)}</p>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-cyan-900 tracking-tight mb-2">{selectedAccount.name}</h3>
                    {selectedAccount.isRemunerated && selectedAccount.tae && (
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        <TrendingUp className="w-3 h-3" />
                        Cuenta Remunerada {selectedAccount.tae}% TAE
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={(e) => handleEditClick(e, selectedAccount)} className="p-3 bg-onyx-50 hover:bg-onyx-100 rounded-xl text-onyx-500 hover:text-cyan-900 transition-colors"><Pencil className="w-5 h-5" /></button>
                    <button onClick={(e) => handleDeleteClick(e, selectedAccount.id)} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>

                {/* STATS COMPARISON */}
                {stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative z-10">
                    {/* Month Comparison */}
                    <div className="bg-onyx-50/50 p-4 md:p-6 rounded-2xl border border-onyx-100/50">
                      <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Vs Mes Pasado</p>
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-onyx-400 mb-1">Final Mes Pasado</p>
                          <p className="text-base md:text-lg font-bold text-onyx-600">{formatEUR(stats.prevMonthBalance)}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-xs md:text-sm font-black px-2 md:px-3 py-1.5 rounded-lg shrink-0 ${stats.isMonthUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {stats.isMonthUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {formatEUR(Math.abs(stats.monthDiff))}
                        </div>
                      </div>
                    </div>

                    {/* Year Comparison */}
                    <div className="bg-onyx-50/50 p-4 md:p-6 rounded-2xl border border-onyx-100/50">
                      <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Vs Año Anterior</p>
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-onyx-400 mb-1">Inicio de Año</p>
                          <p className="text-base md:text-lg font-bold text-onyx-600">{formatEUR(stats.yearStartBalance)}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-xs md:text-sm font-black px-2 md:px-3 py-1.5 rounded-lg shrink-0 ${stats.isYearUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {stats.isYearUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {formatEUR(Math.abs(stats.yearDiff))}
                        </div>
                      </div>
                    </div>

                    {/* Remunerated Stats */}
                    {selectedAccount.isRemunerated && selectedAccount.tae && (
                      <>
                        <div className="bg-emerald-50/50 p-4 md:p-6 rounded-2xl border border-emerald-100/50">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Rentabilidad Anual (Est.)</p>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs font-semibold text-emerald-400 mb-1">{selectedAccount.tae}% TAE</p>
                              <p className="text-base md:text-lg font-bold text-emerald-700">+{formatEUR(selectedAccount.balance * (selectedAccount.tae / 100))}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                          </div>
                        </div>

                        <div className="bg-emerald-50/50 p-4 md:p-6 rounded-2xl border border-emerald-100/50">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Rentabilidad Mensual</p>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs font-semibold text-emerald-400 mb-1">Aprox.</p>
                              <p className="text-base md:text-lg font-bold text-emerald-700">+{formatEUR((selectedAccount.balance * (selectedAccount.tae / 100)) / 12)}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-end mt-6 md:mt-8 pt-6 md:pt-8 border-t border-onyx-100 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Saldo Actual</p>
                    <h2 className={`text-3xl md:text-4xl lg:text-6xl font-black tracking-tighter ${selectedAccount.type === 'CREDIT' && selectedAccount.balance < 0 ? 'text-red-500' : 'text-cyan-900'}`}>{formatEUR(selectedAccount.balance)}</h2>
                  </div>
                  <div>
                    <button onClick={() => onViewTransactions(selectedAccount.id)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-primary hover:text-cyan-700 transition-colors">
                      Ver Movimientos <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
              </div>

              {/* ASSOCIATED CARDS */}
              {(linkedCards.length > 0 || selectedAccount.linkedAccountId) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* If this is a BANK account, show its children cards */}
                  {linkedCards.map(card => renderCard(card, false))}
                </div>
              )}

              {linkedCards.length === 0 && selectedAccount.type === 'BANK' && (
                <div className="bg-onyx-50/30 p-8 rounded-3xl border border-dashed border-onyx-100 flex flex-col items-center justify-center text-center">
                  <CreditCard className="w-10 h-10 text-onyx-200 mb-3" />
                  <p className="text-xs font-bold text-onyx-400 uppercase tracking-widest">No hay tarjetas asociadas</p>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-onyx-300 min-h-[400px]">
              <Landmark className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Selecciona una cuenta para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts;
