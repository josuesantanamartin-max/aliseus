import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUserStore } from '@/store/useUserStore';
import { Account, CadastralData } from '@/types';
import { Plus } from 'lucide-react';
import { useFinanceControllers } from '@/hooks/useFinanceControllers';
import { fetchCadastralData, isValidCadastralReference } from '@/services/catastroService';
import { syncService } from '@/services/syncService';
import { blankForm, formatEUR, AccountFormState } from './accounts/accountConstants';
import { AccountStatsCards } from './accounts/AccountStatsCards';
import { AccountSidebar } from './accounts/AccountSidebar';
import { AccountForm } from './accounts/AccountForm';
import { AccountDetailPanel } from './accounts/AccountDetailPanel';
import { validateAccount } from '@/schemas/account.schema';
import { formatZodErrors } from '@/utils/validation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
interface AccountsProps {
  onViewTransactions: (accountId: string) => void;
}

const Accounts: React.FC<AccountsProps> = ({ onViewTransactions }) => {
  const { accounts, setAccounts, transactions, addAccount, updateAccount, deleteAccount } = useFinanceStore();
  const { financeSelectedAccountId, setFinanceSelectedAccountId } = useUserStore();
  const { transfer } = useFinanceControllers();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(financeSelectedAccountId);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<Account['type']>('BANK');

  // ── Form fields ──
  const [form, setForm] = useState(blankForm());
  const setF = (k: keyof AccountFormState, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { showError, showSuccess } = useErrorHandler();

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
      const newId = visible[0].id;
      setSelectedAccountId(newId);
      setFinanceSelectedAccountId(newId);
    }
  }, [accounts, selectedAccountId, setFinanceSelectedAccountId]);

  useEffect(() => {
    if (financeSelectedAccountId && financeSelectedAccountId !== selectedAccountId) {
      setSelectedAccountId(financeSelectedAccountId);
    }
  }, [financeSelectedAccountId]);

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    setFinanceSelectedAccountId(id);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // ── Stats ──
  const totalAssets = accounts.filter(a => a.type !== 'CREDIT').reduce((s: number, a: Account) => s + (a.balance > 0 ? a.balance : 0), 0);
  const totalLiabilities = accounts.filter(a => a.type === 'CREDIT').reduce((s: number, a: Account) => s + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);
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
    setValidationErrors({});
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
    setValidationErrors({});
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setStep(1); setValidationErrors({}); };

  const handleFetchCadastral = async () => {
    if (!form.cadastralReference.trim()) { setCadastralError('Introduce una referencia catastral'); return; }
    if (!isValidCadastralReference(form.cadastralReference)) { setCadastralError('Formato inválido (20 caracteres)'); return; }
    setIsFetchingCadastral(true); setCadastralError('');
    try {
      const result = await fetchCadastralData(form.cadastralReference);
      if (result.success && result.data) {
        setCadastralData(result.data);
        if (!form.name) setF('name', `Inmueble ${result.data.uso || 'Residencial'}`);
      } else { setCadastralError(result.error || 'Error consultando Catastro'); setCadastralData(null); }
    } catch (error) {
      showError(error);
      setCadastralError('Error consultando Catastro');
    } finally {
      setIsFetchingCadastral(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      const base: any = {
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

      // Validating main account
      const result = validateAccount(base);
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        setValidationErrors(errors);
        showError(new Error('Por favor corrige los errores de validación'));
        return;
      }

      if (editingId) {
        await updateAccount(editingId, base as Account);
        showSuccess('Cuenta actualizada correctamente');
      } else {
        await addAccount(base as Account);
        for (const card of linkedCards) {
          if (!card.name.trim()) continue;
          const cardAccount: any = {
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
          
          const cardResult = validateAccount(cardAccount);
          if (!cardResult.success) {
            showError(new Error(`Error de validación en tarjeta vinculada: ${card.name}`));
            continue; // Proceed with others if one fails
          }
          await addAccount(cardAccount as Account);
        }
        showSuccess('Cuenta creada correctamente');
      }
      closeModal();
    } catch (error) {
      showError(error);
    }
  };

  // ── Delete / settle ──
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar esta cuenta?')) {
      if (selectedAccountId === id) {
        setSelectedAccountId(null);
        setFinanceSelectedAccountId(null);
      }
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
    syncService.saveAccountsOrder(reordered).catch((err: any) => console.error('[Accounts] order save failed:', err));
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

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Cuentas y Activos</h2>
          <p className="text-xs font-semibold text-aliseus-400 mt-2 uppercase tracking-[0.2em]">Gestión integral de tu patrimonio</p>
        </div>
        {!isModalOpen && (
          <button onClick={openNew} className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-95">
            <Plus className="w-5 h-5" /> Nueva Cuenta
          </button>
        )}
      </div>

      <AccountStatsCards netWorth={netWorth} totalAssets={totalAssets} totalLiabilities={totalLiabilities} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <AccountSidebar
          accounts={visibleAccounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={handleSelectAccount}
          dragIndex={dragIndex} dragOverIndex={dragOverIndex}
          onDragStart={handleDragStart} onDragOver={handleDragOver}
          onDrop={handleDrop} onDragEnd={handleDragEnd}
        />

        {/* ── Main content ── */}
        <div className="md:col-span-8 space-y-6">
          {isModalOpen ? (
            <AccountForm
              isOpen={isModalOpen}
              editingId={editingId}
              step={step} setStep={setStep}
              selectedType={selectedType} setSelectedType={setSelectedType}
              form={form} setF={setF}
              cadastralData={cadastralData} cadastralError={cadastralError}
              isFetchingCadastral={isFetchingCadastral} onFetchCadastral={handleFetchCadastral}
              linkedCards={linkedCards} onAddLinkedCard={addLinkedCard}
              onRemoveLinkedCard={removeLinkedCard} onUpdateLinkedCard={updateLinkedCard}
              accounts={accounts} onClose={closeModal} onSubmit={handleSubmit}
              validationErrors={validationErrors}
            />
          ) : (
            <AccountDetailPanel
              account={selectedAccount}
              stats={stats}
              linkedCards={linkedCardsForSelected}
              onEdit={openEdit}
              onDelete={handleDelete}
              onViewTransactions={onViewTransactions}
              onSettle={handleSettle}
              onOpenNew={openNew}
            />
          )}
        </div>
      </div>

      {/* ── Global CSS helpers ── */}
      <style>{`
        .label-xs { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 0.5rem; }
        .input-field { width: 100%; padding: 0.875rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-weight: 600; color: #0e4f6e; outline: none; transition: all 0.15s; }
        .input-field:focus { background: white; box-shadow: 0 0 0 3px rgba(6,182,212,0.1); border-color: #06b6d4; }
      `}
      </style>
    </div>
  );
};

export default Accounts;
