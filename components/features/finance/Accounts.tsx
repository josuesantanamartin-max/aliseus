import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Account, CadastralData, Transaction } from '../../../types';
import {
  Wallet, CreditCard, Banknote, Landmark, Plus, Pencil, Trash2, X,
  TrendingUp, ArrowRightLeft, Layers, ArrowUpRight, ArrowDownRight,
  ArrowRight, GripVertical, PiggyBank, Building2, Wifi, CheckCircle2,
  ChevronLeft, ShieldCheck
} from 'lucide-react';
import { useFinanceControllers } from '../../../hooks/useFinanceControllers';
import { fetchCadastralData, isValidCadastralReference } from '../../../services/catastroService';
import { syncService } from '../../../services/syncService';

interface AccountsProps {
  onViewTransactions: (accountId: string) => void;
}

// ─── Account type config ────────────────────────────────────────────────────
const ACCOUNT_TYPES = [
  { value: 'BANK', label: 'Cuenta Corriente', sub: 'Cuenta bancaria estándar', icon: Landmark, color: 'cyan' },
  { value: 'SAVINGS', label: 'Cuenta de Ahorro', sub: 'Con interés / remunerada', icon: PiggyBank, color: 'emerald' },
  { value: 'CASH', label: 'Efectivo', sub: 'Dinero en mano', icon: Banknote, color: 'amber' },
  { value: 'CREDIT', label: 'Tarjeta Crédito', sub: 'Pago diferido / límite', icon: CreditCard, color: 'rose' },
  { value: 'DEBIT', label: 'Tarjeta Débito', sub: 'Cargo directo a cuenta', icon: CreditCard, color: 'violet' },
  { value: 'INVESTMENT', label: 'Inversión', sub: 'Fondos, ETFs, acciones', icon: TrendingUp, color: 'blue' },
  { value: 'ASSET', label: 'Activo', sub: 'Inmuebles, bienes', icon: Layers, color: 'stone' },
  { value: 'WALLET', label: 'Billetera Digital', sub: 'PayPal, Bizum, Revolut…', icon: Wallet, color: 'fuchsia' },
] as const;

const CARD_NETWORKS = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'AMEX', label: 'American Express' },
  { value: 'OTHER', label: 'Otra red' },
];

const colorMap: Record<string, string> = {
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 ring-cyan-500',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500',
  amber: 'bg-amber-50 text-amber-600 border-amber-200 ring-amber-500',
  rose: 'bg-rose-50 text-rose-600 border-rose-200 ring-rose-500',
  violet: 'bg-violet-50 text-violet-600 border-violet-200 ring-violet-500',
  blue: 'bg-blue-50 text-blue-600 border-blue-200 ring-blue-500',
  stone: 'bg-stone-50 text-stone-600 border-stone-200 ring-stone-500',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 ring-fuchsia-500',
};

// ─── Blank form state ─────────────────────────────────────────────────────── 
const blankForm = () => ({
  name: '', bankName: '', balance: '', currency: 'EUR',
  iban: '', description: '', tae: '', creditLimit: '', cutoffDay: '', paymentDay: '',
  paymentMode: 'END_OF_MONTH' as 'END_OF_MONTH' | 'REVOLVING',
  cardNetwork: 'VISA' as Account['cardNetwork'],
  linkedAccountId: '',
  isRemunerated: false,
  cadastralReference: '',
});

const Accounts: React.FC<AccountsProps> = ({ onViewTransactions }) => {
  const { accounts, setAccounts, transactions, addAccount, updateAccount, deleteAccount } = useFinanceStore();
  const { transfer } = useFinanceControllers();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // step 1 = type selector, step 2 = form
  const [selectedType, setSelectedType] = useState<Account['type']>('BANK');

  // ── Form fields ──
  const [form, setForm] = useState(blankForm());
  const setF = (k: keyof ReturnType<typeof blankForm>, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  // ── Cadastral ──
  const [cadastralData, setCadastralData] = useState<CadastralData | null>(null);
  const [isFetchingCadastral, setIsFetchingCadastral] = useState(false);
  const [cadastralError, setCadastralError] = useState('');

  // ── Linked cards being created with a BANK/SAVINGS account ──
  const [linkedCards, setLinkedCards] = useState<Array<{ name: string; cardNetwork: Account['cardNetwork']; type: 'CREDIT' | 'DEBIT'; creditLimit: string }>>([]);
  const addLinkedCard = () => setLinkedCards(prev => [...prev, { name: '', cardNetwork: 'VISA', type: 'CREDIT', creditLimit: '' }]);
  const removeLinkedCard = (i: number) => setLinkedCards(prev => prev.filter((_, idx) => idx !== i));
  const updateLinkedCard = (i: number, key: string, val: any) =>
    setLinkedCards(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c));

  useEffect(() => {
    const visible = accounts.filter(a => a.type !== 'CREDIT' && a.type !== 'DEBIT');
    if (visible.length > 0 && (!selectedAccountId || !accounts.find(a => a.id === selectedAccountId))) {
      setSelectedAccountId(visible[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // ── Formats ──
  const formatEUR = (n: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n);

  // ── Stats ──
  const totalAssets = accounts.filter(a => a.type !== 'CREDIT').reduce((s, a) => s + (a.balance > 0 ? a.balance : 0), 0);
  const totalLiabilities = accounts.filter(a => a.type === 'CREDIT').reduce((s, a) => s + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // ── Modal helpers ──
  const openNew = () => {
    setEditingId(null);
    setForm(blankForm());
    setCadastralData(null);
    setCadastralError('');
    setLinkedCards([]);
    setSelectedType('BANK');
    setStep(1);
    setIsModalOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditingId(account.id);
    setSelectedType(account.type);
    setForm({
      name: account.name, bankName: account.bankName || '', balance: account.balance.toString(),
      currency: account.currency, iban: (account as any).iban || '', description: (account as any).description || '',
      tae: account.tae?.toString() || '', creditLimit: account.creditLimit?.toString() || '',
      cutoffDay: account.cutoffDay?.toString() || '', paymentDay: account.paymentDay?.toString() || '',
      paymentMode: account.paymentMode || 'END_OF_MONTH',
      cardNetwork: account.cardNetwork || 'VISA',
      linkedAccountId: account.linkedAccountId || '',
      isRemunerated: account.isRemunerated || false,
      cadastralReference: account.cadastralReference || '',
    });
    setCadastralData(account.cadastralData || null);
    setCadastralError('');
    setLinkedCards([]);
    setStep(2);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setStep(1); };

  const handleFetchCadastral = async () => {
    if (!form.cadastralReference.trim()) { setCadastralError('Introduce una referencia catastral'); return; }
    if (!isValidCadastralReference(form.cadastralReference)) { setCadastralError('Formato inválido (20 caracteres)'); return; }
    setIsFetchingCadastral(true); setCadastralError('');
    const result = await fetchCadastralData(form.cadastralReference);
    setIsFetchingCadastral(false);
    if (result.success && result.data) {
      setCadastralData(result.data);
      if (!form.name) setF('name', `Inmueble ${result.data.uso || 'Residencial'}`);
    } else { setCadastralError(result.error || 'Error consultando Catastro'); setCadastralData(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const base: Account = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: form.name,
      bankName: form.bankName || undefined,
      type: selectedType,
      balance: parseFloat(form.balance) || 0,
      currency: form.currency as any,
      description: form.description || undefined,
      iban: form.iban || undefined,
    };

    const isBankLike = selectedType === 'BANK' || selectedType === 'SAVINGS';
    const isCard = selectedType === 'CREDIT' || selectedType === 'DEBIT';

    if (isBankLike) {
      base.isRemunerated = form.isRemunerated || selectedType === 'SAVINGS';
      if (base.isRemunerated && form.tae) base.tae = parseFloat(form.tae);
    }
    if (isCard) {
      base.cardNetwork = form.cardNetwork;
      base.linkedAccountId = form.linkedAccountId || undefined;
      if (selectedType === 'CREDIT') {
        if (form.creditLimit) base.creditLimit = parseFloat(form.creditLimit);
        if (form.cutoffDay) base.cutoffDay = parseInt(form.cutoffDay);
        if (form.paymentDay) base.paymentDay = parseInt(form.paymentDay);
        base.paymentMode = form.paymentMode;
      }
    }
    if (selectedType === 'ASSET') {
      base.cadastralReference = form.cadastralReference || undefined;
      base.cadastralData = cadastralData || undefined;
    }

    if (editingId) {
      updateAccount(editingId, base);
    } else {
      await addAccount(base);
      // Create linked cards
      for (const card of linkedCards) {
        if (!card.name.trim()) continue;
        const cardAccount: Account = {
          id: Math.random().toString(36).substr(2, 9),
          name: card.name,
          bankName: form.bankName || undefined,
          type: card.type,
          balance: 0,
          currency: form.currency as any,
          cardNetwork: card.cardNetwork,
          linkedAccountId: base.id,
          creditLimit: card.creditLimit ? parseFloat(card.creditLimit) : undefined,
          paymentMode: 'END_OF_MONTH',
        };
        await addAccount(cardAccount);
      }
    }
    closeModal();
  };

  // ── Delete / settle ──
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar esta cuenta?')) {
      if (selectedAccountId === id) setSelectedAccountId(null);
      deleteAccount(id);
    }
  };

  const handleSettle = (e: React.MouseEvent, card: Account) => {
    e.stopPropagation();
    if (!card.linkedAccountId) return alert('Sin cuenta asociada.');
    const debt = Math.abs(card.balance);
    if (debt === 0) return alert('Sin deuda.');
    if (window.confirm(`¿Liquidar ${formatEUR(debt)}?`)) transfer(card.linkedAccountId, card.id, debt, 'Liquidación tarjeta');
  };

  // ── Drag ──
  const visibleAccounts = accounts.filter(a => a.type !== 'CREDIT' && a.type !== 'DEBIT');

  const handleDragStart = (e: React.DragEvent, i: number) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIndex(i); };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); setDragOverIndex(null); return; }
    const reordered = [...visibleAccounts];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const hidden = accounts.filter(a => a.type === 'CREDIT' || a.type === 'DEBIT');
    setAccounts(() => [...reordered, ...hidden]);
    syncService.saveAccountsOrder(reordered).catch(err => console.error('[Accounts] order save failed:', err));
    setDragIndex(null); setDragOverIndex(null);
  };

  // ── Account stats ──
  const getAccountStats = (account: Account) => {
    if (!account) return { monthDiff: 0, yearDiff: 0, isMonthUp: false, isYearUp: false, prevMonthBalance: 0, yearStartBalance: 0 };
    const today = new Date(); const cm = today.getMonth(); const cy = today.getFullYear();
    const accTxs = transactions.filter(t => t.accountId === account.id);
    const thisMonth = accTxs.filter(t => { const d = new Date(t.date); return d.getMonth() === cm && d.getFullYear() === cy; });
    const flowMonth = thisMonth.reduce((s, t) => s + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
    const prevBal = account.balance - flowMonth;
    const thisYear = accTxs.filter(t => new Date(t.date).getFullYear() === cy);
    const flowYear = thisYear.reduce((s, t) => s + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
    const yearBal = account.balance - flowYear;
    return { monthDiff: account.balance - prevBal, isMonthUp: account.balance >= prevBal, prevMonthBalance: prevBal, yearDiff: account.balance - yearBal, isYearUp: account.balance >= yearBal, yearStartBalance: yearBal };
  };

  const stats = selectedAccount ? getAccountStats(selectedAccount) : null;
  const linkedCardsForSelected = selectedAccount ? accounts.filter(a => (a.type === 'CREDIT' || a.type === 'DEBIT') && a.linkedAccountId === selectedAccount.id) : [];

  const getTypeConfig = (type: string) => ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[0];
  const getTypeLabel = (type: string) => getTypeConfig(type).label;
  const getIcon = (type: string) => { const C = getTypeConfig(type).icon; return <C className="w-5 h-5" />; };

  // ─── Render credit/debit card tile ───
  const renderCard = (card: Account) => {
    const isCredit = card.type === 'CREDIT';
    const debt = isCredit ? Math.abs(card.balance) : 0;
    const util = isCredit && card.creditLimit ? (debt / card.creditLimit) * 100 : 0;
    return (
      <div key={card.id} onClick={() => onViewTransactions(card.id)}
        className={`relative overflow-hidden rounded-onyx shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer group h-40 flex flex-col justify-between p-6 ${isCredit ? 'bg-cyan-900 text-white border border-onyx-800' : 'bg-emerald-950 text-white border border-emerald-900'}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-12 -mt-12 transition-all duration-700 group-hover:scale-150 ${isCredit ? 'bg-cyan-500' : 'bg-emerald-400'}`} />
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Wifi className="w-4 h-4 rotate-90 text-white/40" />
            <div className="w-10 h-7 bg-white/10 rounded-lg border border-white/10 flex items-center justify-center"><div className="w-5 h-4 bg-white/20 rounded-md" /></div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">{card.cardNetwork || (isCredit ? 'CREDIT' : 'DEBIT')}</p>
            {card.bankName && <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">{card.bankName}</p>}
          </div>
        </div>
        <div className="relative z-10">
          <h4 className="font-bold text-base tracking-wide text-white truncate mb-1">{card.name}</h4>
          <p className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">•••• •••• {card.id.substring(0, 4)}</p>
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1.5">{isCredit ? 'Deuda' : 'Saldo'}</p>
            <p className={`text-2xl font-bold tracking-tight ${isCredit && debt > 0 ? 'text-red-300' : 'text-white'}`}>
              {isCredit && debt > 0 ? '-' : ''}{formatEUR(isCredit ? debt : card.balance)}
            </p>
            {isCredit && card.creditLimit && <p className="text-[9px] text-white/30 mt-0.5">Límite: {formatEUR(card.creditLimit)}</p>}
          </div>
          <div className="flex items-center gap-3 -mb-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button onClick={e => { e.stopPropagation(); openEdit(card); }} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-md border border-white/10"><Pencil className="w-4 h-4" /></button>
            {isCredit && debt > 0 && <button onClick={e => handleSettle(e, card)} className="p-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors border border-cyan-400 shadow-lg shadow-cyan-500/20"><ArrowRightLeft className="w-4 h-4" /></button>}
            <button onClick={e => handleDelete(e, card.id)} className="p-2.5 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-colors border border-red-500/20"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        {isCredit && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-cyan-950/20"><div className={`h-full transition-all duration-1000 ${util > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`} style={{ width: `${Math.min(util, 100)}%` }} /></div>}
      </div>
    );
  };

  const isCardType = selectedType === 'CREDIT' || selectedType === 'DEBIT';
  const isBankLike = selectedType === 'BANK' || selectedType === 'SAVINGS';

  // ─── FIELD SECTIONS ─────────────────────────────────────────────────────── 
  const renderFormFields = () => (
    <div className="space-y-6">
      {/* Basic info — always */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="label-xs">Nombre de la cuenta</label>
          <input required value={form.name} onChange={e => setF('name', e.target.value)} className="input-field" placeholder={isCardType ? 'Ej: Visa Santander' : 'Ej: Cuenta Principal'} />
        </div>
        <div>
          <label className="label-xs">{isCardType ? 'Banco emisor' : 'Banco / Entidad'}</label>
          <input value={form.bankName} onChange={e => setF('bankName', e.target.value)} className="input-field" placeholder="Ej: BBVA, Santander…" />
        </div>
        {!isCardType && (
          <div>
            <label className="label-xs">Saldo Actual</label>
            <input required type="number" step="0.01" value={form.balance} onChange={e => setF('balance', e.target.value)} className="input-field text-xl font-bold" placeholder="0.00" />
          </div>
        )}
        {!isCardType && (
          <div>
            <label className="label-xs">Moneda</label>
            <select value={form.currency} onChange={e => setF('currency', e.target.value)} className="input-field">
              {['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        {(selectedType === 'BANK' || selectedType === 'SAVINGS') && (
          <div>
            <label className="label-xs">IBAN <span className="text-onyx-300 normal-case font-normal">(opcional)</span></label>
            <input value={form.iban} onChange={e => setF('iban', e.target.value)} className="input-field font-mono tracking-widest" placeholder="ES00 0000 0000 00 …" />
          </div>
        )}
        <div className={isCardType ? 'col-span-2' : ''}>
          <label className="label-xs">Descripción <span className="text-onyx-300 normal-case font-normal">(opcional)</span></label>
          <input value={form.description} onChange={e => setF('description', e.target.value)} className="input-field" placeholder="Notas sobre esta cuenta…" />
        </div>
      </div>

      {/* ── BANK / SAVINGS extras ── */}
      {isBankLike && (
        <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-4">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Opciones de rentabilidad</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setF('isRemunerated', !form.isRemunerated)}
              className={`w-11 h-6 rounded-full transition-colors ${form.isRemunerated || selectedType === 'SAVINGS' ? 'bg-emerald-500' : 'bg-onyx-200'} flex items-center`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isRemunerated || selectedType === 'SAVINGS' ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-semibold text-cyan-900">Cuenta remunerada / genera intereses</span>
          </label>
          {(form.isRemunerated || selectedType === 'SAVINGS') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-xs">TAE / Interés Anual (%)</label>
                <input type="number" step="0.01" value={form.tae} onChange={e => setF('tae', e.target.value)} className="input-field" placeholder="2.50" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CREDIT / DEBIT extras ── */}
      {isCardType && (
        <div className="space-y-5">
          {/* Card network + link to account */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label-xs">Red de la tarjeta</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {CARD_NETWORKS.map(n => (
                  <button key={n.value} type="button" onClick={() => setF('cardNetwork', n.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.cardNetwork === n.value ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-onyx-500 border-onyx-200 hover:border-cyan-300'}`}>
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-xs">Moneda</label>
              <select value={form.currency} onChange={e => setF('currency', e.target.value)} className="input-field">
                {['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Settlement account — any bank account, including external */}
          <div className="p-5 bg-cyan-50/60 rounded-2xl border border-cyan-100 space-y-3">
            <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Cuenta de cargo (liquidación)
            </p>
            <p className="text-xs text-onyx-400">Selecciona la cuenta desde la que se carga el pago al finalizar el mes. Puede ser de cualquier banco.</p>
            <select value={form.linkedAccountId} onChange={e => setF('linkedAccountId', e.target.value)} className="input-field">
              <option value="">Sin cuenta vinculada</option>
              {accounts.filter(a => a.type === 'BANK' || a.type === 'SAVINGS').map(a => (
                <option key={a.id} value={a.id}>{a.name}{a.bankName ? ` · ${a.bankName}` : ''}</option>
              ))}
            </select>
          </div>

          {/* Credit-only fields */}
          {selectedType === 'CREDIT' && (
            <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-4">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">Configuración de crédito</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="label-xs">Saldo actual (deuda)</label>
                  <input type="number" step="0.01" value={form.balance} onChange={e => setF('balance', e.target.value)} className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="label-xs">Límite de crédito</label>
                  <input type="number" step="0.01" value={form.creditLimit} onChange={e => setF('creditLimit', e.target.value)} className="input-field" placeholder="3000" />
                </div>
                <div>
                  <label className="label-xs">Día de corte</label>
                  <input type="number" min="1" max="31" value={form.cutoffDay} onChange={e => setF('cutoffDay', e.target.value)} className="input-field" placeholder="25" />
                </div>
                <div>
                  <label className="label-xs">Día de pago</label>
                  <input type="number" min="1" max="31" value={form.paymentDay} onChange={e => setF('paymentDay', e.target.value)} className="input-field" placeholder="5" />
                </div>
              </div>
              <div>
                <label className="label-xs">Modo de pago mensual</label>
                <div className="flex gap-3 mt-1">
                  {[{ val: 'END_OF_MONTH', label: 'Saldo total' }, { val: 'REVOLVING', label: 'En cuotas (revolving)' }].map(m => (
                    <button key={m.val} type="button" onClick={() => setF('paymentMode', m.val)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.paymentMode === m.val ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-onyx-500 border-onyx-200 hover:border-rose-300'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ASSET fields ── */}
      {selectedType === 'ASSET' && (
        <div className="p-5 bg-stone-50/60 rounded-2xl border border-stone-100 space-y-3">
          <p className="text-[10px] font-bold text-stone-700 uppercase tracking-widest">Referencia Catastral</p>
          <div className="flex gap-2">
            <input value={form.cadastralReference} onChange={e => setF('cadastralReference', e.target.value)} className="flex-1 input-field font-mono" placeholder="20 caracteres" />
            <button type="button" onClick={handleFetchCadastral} disabled={isFetchingCadastral}
              className="px-4 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition disabled:opacity-50">
              {isFetchingCadastral ? '…' : 'Consultar'}
            </button>
          </div>
          {cadastralError && <p className="text-xs text-red-500">{cadastralError}</p>}
          {cadastralData && <div className="p-3 bg-white rounded-xl text-xs text-cyan-900 border border-cyan-100">{cadastralData.uso} — {cadastralData.superficie} m²</div>}
        </div>
      )}

      {/* ── Linked cards (new account) ── */}
      {isBankLike && !editingId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">Tarjetas vinculadas a esta cuenta</p>
            <button type="button" onClick={addLinkedCard} className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Añadir tarjeta
            </button>
          </div>
          {linkedCards.length === 0 && (
            <p className="text-xs text-onyx-300 italic">Puedes añadir tarjetas de débito o crédito que se carguen a esta cuenta (del mismo banco o de otro).</p>
          )}
          {linkedCards.map((card, i) => (
            <div key={i} className="p-4 bg-onyx-50/50 rounded-2xl border border-onyx-100 grid grid-cols-2 gap-3">
              <div className="col-span-2 flex justify-between items-center">
                <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">Tarjeta {i + 1}</p>
                <button type="button" onClick={() => removeLinkedCard(i)} className="text-onyx-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="col-span-2">
                <label className="label-xs">Nombre</label>
                <input value={card.name} onChange={e => updateLinkedCard(i, 'name', e.target.value)} className="input-field" placeholder="Ej: Visa Santander" />
              </div>
              <div>
                <label className="label-xs">Tipo</label>
                <select value={card.type} onChange={e => updateLinkedCard(i, 'type', e.target.value)} className="input-field">
                  <option value="CREDIT">Crédito</option>
                  <option value="DEBIT">Débito</option>
                </select>
              </div>
              <div>
                <label className="label-xs">Red</label>
                <select value={card.cardNetwork} onChange={e => updateLinkedCard(i, 'cardNetwork', e.target.value)} className="input-field">
                  {CARD_NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              {card.type === 'CREDIT' && (
                <div className="col-span-2">
                  <label className="label-xs">Límite de crédito</label>
                  <input type="number" value={card.creditLimit} onChange={e => updateLinkedCard(i, 'creditLimit', e.target.value)} className="input-field" placeholder="3000" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Cuentas y Activos</h2>
          <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Gestión integral de tu patrimonio</p>
        </div>
        {!isModalOpen && (
          <button onClick={openNew} className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-95">
            <Plus className="w-5 h-5" /> Nueva Cuenta
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Patrimonio Neto', value: netWorth, color: 'cyan' },
          { label: 'Activos Totales', value: totalAssets, color: 'emerald' },
          { label: 'Pasivos', value: totalLiabilities, color: 'red' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-onyx shadow-sm border border-onyx-100 flex flex-col justify-between h-32 overflow-hidden group hover:shadow-lg transition-all relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50/50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />
            <p className="text-onyx-400 font-bold text-[10px] uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
            <h3 className="text-4xl font-bold text-cyan-900 tracking-tight relative z-10">{formatEUR(stat.value)}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* ── Sidebar list ── */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-onyx-100">
            <h3 className="font-bold text-cyan-900 text-lg">Tus Cuentas</h3>
            <span className="text-xs font-bold bg-onyx-100 px-2 py-1 rounded-lg text-onyx-500">{visibleAccounts.length} Activas</span>
          </div>
          <div className="space-y-3">
            {visibleAccounts.map((account, index) => {
              const isSelected = selectedAccountId === account.id;
              const isDraggedOver = dragOverIndex === index && dragIndex !== index;
              const cfg = getTypeConfig(account.type);
              const Icon = cfg.icon;
              return (
                <div key={account.id} draggable
                  onDragStart={e => handleDragStart(e, index)} onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)} onDragEnd={handleDragEnd}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden select-none
                    ${isSelected ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white text-cyan-900 border-onyx-100 hover:border-cyan-200 hover:bg-slate-50'}
                    ${isDraggedOver ? 'border-cyan-400 border-2 scale-[1.01] shadow-md shadow-cyan-200' : ''}
                    ${dragIndex === index ? 'opacity-50' : ''}`}>
                  <div className={`absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ${isSelected ? 'text-white/30' : 'text-onyx-300'}`}>
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex justify-between items-center mb-1 pl-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : `${colorMap[cfg.color].split(' ').slice(0, 2).join(' ')}`}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        {account.bankName && <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/50' : 'text-onyx-400'}`}>{account.bankName}</p>}
                        <p className="font-semibold text-sm leading-tight line-clamp-1">{account.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-white/40' : 'text-onyx-300'}`}>{cfg.label}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-2 pl-3">
                    <p className="font-bold text-lg leading-none">{formatEUR(account.balance)}</p>
                    {account.isRemunerated && account.tae && <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>{account.tae}% TAE</p>}
                  </div>
                  {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="md:col-span-8 space-y-6">
          {isModalOpen ? (
            <div className="bg-white p-8 rounded-onyx shadow-xl border border-onyx-100 animate-fade-in relative overflow-hidden w-full">
              {/* Modal header */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-onyx-50">
                <div className="flex items-center gap-3">
                  {step === 2 && !editingId && (
                    <button type="button" onClick={() => setStep(1)} className="p-2 hover:bg-onyx-50 rounded-full transition-colors text-onyx-400 hover:text-onyx-700">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight text-cyan-900">{editingId ? 'Editar' : (step === 1 ? 'Nueva cuenta' : getTypeLabel(selectedType))}</h4>
                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-1">
                      {editingId ? 'Actualizar información' : (step === 1 ? 'Elige el tipo' : 'Paso 2 · Información')}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-onyx-50 rounded-full transition-colors"><X className="w-5 h-5 text-onyx-400" /></button>
              </div>

              {/* STEP 1: Type selector */}
              {step === 1 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ACCOUNT_TYPES.map(t => {
                    const Icon = t.icon;
                    const cls = colorMap[t.color];
                    return (
                      <button key={t.value} type="button"
                        onClick={() => { setSelectedType(t.value as Account['type']); setStep(2); }}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-onyx-100 hover:border-cyan-300 hover:shadow-md transition-all group text-left">
                        <div className={`p-3 rounded-xl ${cls.split(' ').slice(0, 2).join(' ')} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-cyan-900 text-center leading-tight">{t.label}</p>
                          <p className="text-[10px] text-onyx-400 text-center leading-tight mt-0.5">{t.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* STEP 2: Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type badge */}
                  {!editingId && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${colorMap[getTypeConfig(selectedType).color].split(' ').slice(0, 3).join(' ')}`}>
                      {React.createElement(getTypeConfig(selectedType).icon, { className: 'w-3.5 h-3.5' })}
                      {getTypeLabel(selectedType)}
                    </div>
                  )}

                  {renderFormFields()}

                  <div className="flex gap-4 pt-4 border-t border-onyx-50">
                    <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-onyx-500 hover:bg-onyx-50 transition-colors">Cancelar</button>
                    <button type="submit" className="flex-[2] bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-cyan-900/20 transition-all active:scale-95">
                      {editingId ? 'Guardar cambios' : `Crear ${linkedCards.filter(c => c.name.trim()).length > 0 ? `+ ${linkedCards.filter(c => c.name.trim()).length} tarjeta(s)` : ''}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : selectedAccount ? (
            <div className="space-y-8">
              <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-onyx-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-onyx-400 uppercase tracking-[0.2em] mb-1">{selectedAccount.bankName || getTypeLabel(selectedAccount.type)}</p>
                    <h3 className="text-3xl lg:text-4xl font-black text-cyan-900 tracking-tight mb-2">{selectedAccount.name}</h3>
                    {selectedAccount.isRemunerated && selectedAccount.tae && (
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        <TrendingUp className="w-3 h-3" /> Remunerada {selectedAccount.tae}% TAE
                      </div>
                    )}
                    {(selectedAccount as any).iban && <p className="text-xs font-mono text-onyx-300 mt-2">{(selectedAccount as any).iban}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(selectedAccount)} className="p-3 bg-onyx-50 hover:bg-onyx-100 rounded-xl text-onyx-500 hover:text-cyan-900 transition-colors"><Pencil className="w-5 h-5" /></button>
                    <button onClick={e => handleDelete(e, selectedAccount.id)} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                {stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative z-10">
                    {[
                      { label: 'Vs Mes Pasado', diff: stats.monthDiff, up: stats.isMonthUp, prev: stats.prevMonthBalance, prevLabel: 'Final Mes Pasado' },
                      { label: 'Vs Año Anterior', diff: stats.yearDiff, up: stats.isYearUp, prev: stats.yearStartBalance, prevLabel: 'Inicio de Año' },
                    ].map(s => (
                      <div key={s.label} className="bg-onyx-50/50 p-4 md:p-6 rounded-2xl border border-onyx-100/50">
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">{s.label}</p>
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-onyx-400 mb-1">{s.prevLabel}</p>
                            <p className="text-base md:text-lg font-bold text-onyx-600">{formatEUR(s.prev)}</p>
                          </div>
                          <div className={`flex items-center gap-1 text-xs md:text-sm font-black px-3 py-1.5 rounded-lg shrink-0 ${s.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {s.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {formatEUR(Math.abs(s.diff))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-end mt-8 pt-8 border-t border-onyx-100 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Saldo Actual</p>
                    <h2 className={`text-4xl lg:text-6xl font-black tracking-tighter ${selectedAccount.type === 'CREDIT' && selectedAccount.balance < 0 ? 'text-red-500' : 'text-cyan-900'}`}>{formatEUR(selectedAccount.balance)}</h2>
                  </div>
                  <button onClick={() => onViewTransactions(selectedAccount.id)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-primary hover:text-cyan-700 transition-colors">
                    Ver Movimientos <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              </div>

              {/* Associated cards */}
              {linkedCardsForSelected.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-onyx-400 uppercase tracking-widest">Tarjetas vinculadas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {linkedCardsForSelected.map(card => renderCard(card))}
                  </div>
                </div>
              )}
              {linkedCardsForSelected.length === 0 && selectedAccount.type !== 'CREDIT' && selectedAccount.type !== 'DEBIT' && (
                <div className="bg-onyx-50/30 p-8 rounded-3xl border border-dashed border-onyx-100 flex flex-col items-center justify-center text-center">
                  <CreditCard className="w-10 h-10 text-onyx-200 mb-3" />
                  <p className="text-xs font-bold text-onyx-400 uppercase tracking-widest">No hay tarjetas asociadas</p>
                  <button onClick={openNew} className="mt-3 text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Añadir tarjeta
                  </button>
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

      {/* ── Global CSS helpers ── */}
      <style>{`
        .label-xs { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 0.5rem; }
        .input-field { width: 100%; padding: 0.875rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-weight: 600; color: #0e4f6e; outline: none; transition: all 0.15s; }
        .input-field:focus { background: white; box-shadow: 0 0 0 3px rgba(6,182,212,0.1); border-color: #06b6d4; }
      `}</style>
    </div>
  );
};

export default Accounts;
