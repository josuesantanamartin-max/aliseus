import React, { useState, useEffect, useMemo } from 'react';
import { useFinanceStore } from '../../../../store/useFinanceStore';
import { useUserStore } from '../../../../store/useUserStore';
import { useFinanceControllers } from '../../../../hooks/useFinanceControllers';
import { Transaction, QuickAction } from '../../../../types';
import { useCurrency } from '../../../../hooks/useCurrency';
import {
  Plus, Database, FileUp, X, Upload, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Repeat, Sparkles, Loader2
} from 'lucide-react';
import { suggestCategory } from '../../../../services/geminiService';
import TransactionFilters from './components/TransactionFilters';
import TransactionStats from './components/TransactionStats';
import TransactionList from './components/TransactionList';
import CSVImportModal from './components/CSVImportModal';
import { validateTransaction } from '../../../../schemas/transaction.schema';
import { formatZodErrors } from '../../../../utils/validation';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { Button } from '../../../ui/Button';


interface TransactionsProps {
  initialFilters?: { category?: string; subCategory?: string; initialDate?: string; type?: 'INCOME' | 'EXPENSE'; accountId?: string } | null;
  onClearFilters?: () => void;
}

const Transactions: React.FC<TransactionsProps> = ({
  initialFilters,
  onClearFilters,
}) => {
  const { transactions, accounts, debts, goals, categories, projectBudgets } = useFinanceStore();
  const { currency, quickAction, setQuickAction } = useUserStore();
  const { addTransaction, transfer, editTransaction, deleteTransaction } = useFinanceControllers();
  const { formatPrice: formatEUR, symbol } = useCurrency();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'MONTH' | 'YEAR'>('MONTH');

  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 7));
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<'' | 'INCOME' | 'EXPENSE'>('');
  const [filterAccountId, setFilterAccountId] = useState<string>('');
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);

  useEffect(() => {
    if (viewMode === 'YEAR' && filterDate.length > 4) {
      setFilterDate(filterDate.substring(0, 4));
    } else if (viewMode === 'MONTH' && filterDate.length === 4) {
      setFilterDate(`${filterDate}-01`);
    }
  }, [viewMode]);

  // ADD FORM STATE
  const [mode, setMode] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [projectId, setProjectId] = useState('');

  // EDIT FORM STATE
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRecurring, setEditRecurring] = useState(false);
  const [editFrequency, setEditFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [editProjectId, setEditProjectId] = useState('');

  // Error handling
  const { showError, showSuccess } = useErrorHandler();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (quickAction) {
      if (quickAction.type === 'ADD_EXPENSE') {
        setMode('EXPENSE');
        setIsFormOpen(true);
        setCategory(''); setSubCategory(''); setDescription('');
      } else if (quickAction.type === 'ADD_INCOME') {
        setMode('INCOME');
        setIsFormOpen(true);
        setCategory(''); setSubCategory(''); setDescription('');
      } else if (quickAction.type === 'ADD_TRANSFER') {
        setMode('TRANSFER');
        setIsFormOpen(true);
        setDescription('');
      }
      setQuickAction(null);
    }
  }, [quickAction, setQuickAction]);

  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.initialDate) setFilterDate(initialFilters.initialDate);
      if (initialFilters.category) setFilterCategory(initialFilters.category);
      if (initialFilters.subCategory) setFilterSubCategory(initialFilters.subCategory);
      if (initialFilters.accountId) setFilterAccountId(initialFilters.accountId);
      if (initialFilters.type) setFilterType(initialFilters.type);
    }
  }, [initialFilters]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (viewMode === 'MONTH') {
        if (!t.date.startsWith(filterDate)) return false;
      } else {
        if (!t.date.startsWith(filterDate.substring(0, 4))) return false;
      }

      if (filterCategory && t.category !== filterCategory) return false;
      if (filterSubCategory && t.subCategory !== filterSubCategory) return false;
      if (filterType && t.type !== filterType) return false;
      if (filterAccountId && t.accountId !== filterAccountId) return false;
      if (showRecurringOnly && !t.isRecurring) return false;
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [transactions, filterDate, filterCategory, filterSubCategory, filterType, filterAccountId, showRecurringOnly, searchTerm, viewMode]);

  const filteredIncome = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const filteredExpenses = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);

  const activeFiltersCount = [filterCategory, filterSubCategory, filterType, filterAccountId, showRecurringOnly].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCategory('');
    setFilterSubCategory('');
    setFilterType('');
    setFilterAccountId('');
    setShowRecurringOnly(false);
    setSearchTerm('');
    if (onClearFilters) onClearFilters();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors({});

    if (mode === 'TRANSFER') {
      if (!accountId || !toAccountId || !amount) {
        showError(new Error('Por favor completa todos los campos requeridos'));
        return;
      }
      transfer(accountId, toAccountId, parseFloat(amount), date, linkedGoalId || undefined, description);
      showSuccess('Transferencia realizada exitosamente');
    } else {
      // Validate transaction data
      const transactionData = {
        type: mode as 'INCOME' | 'EXPENSE',
        amount: parseFloat(amount),
        date,
        category,
        subCategory,
        accountId,
        description,
        notes,
        isRecurring,
        frequency: isRecurring ? recurrenceFrequency : undefined,
        projectId: projectId || undefined
      };

      const result = validateTransaction(transactionData);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        setValidationErrors(errors);
        showError(new Error('Por favor corrige los errores de validación'));
        return;
      }

      addTransaction(result.data as Omit<Transaction, 'id'>);
      showSuccess(`${mode === 'INCOME' ? 'Ingreso' : 'Gasto'} registrado exitosamente`);
    }

    setIsFormOpen(false);
    resetAddForm();
  };

  const resetAddForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setSubCategory('');
    setToAccountId('');
    setLinkedGoalId('');
    setNotes('');
    setIsRecurring(false);
    setProjectId('');
    setValidationErrors({});
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    // Clear previous errors
    setValidationErrors({});

    const updatedTransaction = {
      ...editingTransaction,
      amount: parseFloat(editAmount),
      date: editDate,
      category: editCategory,
      subCategory: editSubCategory,
      accountId: editAccountId,
      description: editDescription,
      notes: editNotes,
      isRecurring: editRecurring,
      frequency: editRecurring ? editFrequency : undefined,
      projectId: editProjectId || undefined
    };

    // Validate updated transaction
    const result = validateTransaction(updatedTransaction);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      setValidationErrors(errors);
      showError(new Error('Por favor corrige los errores de validación'));
      return;
    }

    editTransaction(result.data as Transaction);
    showSuccess('Transacción actualizada exitosamente');
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setEditAmount(t.amount.toString());
    setEditDate(t.date);
    setEditCategory(t.category);
    setEditSubCategory(t.subCategory || '');
    setEditAccountId(t.accountId);
    setEditDescription(t.description);
    setEditNotes(t.notes || '');
    setEditRecurring(t.isRecurring || false);
    if (t.frequency) setEditFrequency(t.frequency);
    setEditProjectId(t.projectId || '');
    setIsEditModalOpen(true);
  };

  const handleBatchImport = (importedTransactions: Partial<Transaction>[]) => {
    const targetAccountId = filterAccountId || accounts[0]?.id;
    if (!targetAccountId) return;

    // Find the newest transaction date to adjust the view
    let newestDate = filterDate;

    importedTransactions.forEach(t => {
      const txDate = t.date || new Date().toISOString().split('T')[0];
      if (txDate.startsWith(txDate.slice(0, 7)) && txDate > newestDate) {
        // Simplistic check to move to the month of imported data
      }

      // Better: collect all months and pick the most frequent or highest one
      const transactionData = {
        id: crypto.randomUUID(),
        type: t.type as 'INCOME' | 'EXPENSE',
        amount: t.amount || 0,
        date: txDate,
        category: t.category || 'Otros',
        subCategory: t.subCategory || '',
        accountId: targetAccountId,
        description: t.description || 'Importado via CSV',
        notes: t.notes || '',
        isRecurring: false,
      };

      const result = validateTransaction(transactionData);
      if (result.success) {
        addTransaction(result.data as Transaction);
      }
    });

    // Auto-adjust filterDate if imported transactions are in a different month
    if (importedTransactions.length > 0) {
      const dates = importedTransactions.map(t => t.date).filter(Boolean) as string[];
      if (dates.length > 0) {
        const latestImported = dates.sort().reverse()[0];
        const latestMonth = latestImported.slice(0, 7);
        if (latestMonth !== filterDate) {
          setFilterDate(latestMonth);
        }
      }
    }

    setIsImportModalOpen(false);
    showSuccess(`${importedTransactions.length} transacciones importadas. Vista actualizada al mes de los movimientos.`);
  };

  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSmartCategorization = async () => {
    const desc = isEditModalOpen ? editDescription : description;
    if (!desc) return;

    setIsSuggesting(true);
    const availableCategories = categories.map(c => c.name);
    const suggestion = await suggestCategory(desc, availableCategories);

    if (suggestion) {
      if (isEditModalOpen) {
        setEditCategory(suggestion);
        // Reset subcategory as it might not match
        setEditSubCategory('');
      } else {
        setCategory(suggestion);
        setSubCategory('');
      }
    }
    setIsSuggesting(false);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-12 pb-32 max-w-7xl mx-auto animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-cyan-900 tracking-tight">Movimientos</h1>
          <p className="text-xs font-bold text-onyx-400 mt-3 uppercase tracking-[0.2em]">Gestión detallada de tu flujo de caja</p>
        </div>
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="p-5 group relative"
          >
            <Upload className="w-6 h-6" />
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-cyan-900 text-white text-[10px] uppercase font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-2xl border border-onyx-800">Importar CSV</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsFormOpen(true)}
            className="px-10 py-5 rounded-2xl group font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-4"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Nueva Transacción
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-12">
        <TransactionStats
          filteredIncome={filteredIncome}
          filteredExpenses={filteredExpenses}
        />

        <TransactionFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterDate={filterDate} setFilterDate={setFilterDate}
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterSubCategory={filterSubCategory} setFilterSubCategory={setFilterSubCategory}
          filterType={filterType} setFilterType={setFilterType}
          filterAccountId={filterAccountId} setFilterAccountId={setFilterAccountId}
          showRecurringOnly={showRecurringOnly} setShowRecurringOnly={setShowRecurringOnly}
          viewMode={viewMode} setViewMode={setViewMode}
          categories={categories}
          accounts={accounts}
          clearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <TransactionList
          transactions={filteredTransactions}
          onEdit={openEditModal}
          onDelete={deleteTransaction}
          accounts={accounts}
        />
      </div>

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBatchImport}
      />

      {(isFormOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-cyan-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in text-cyan-900">
          <div className="bg-white rounded-onyx shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border border-onyx-100 relative shadow-cyan-500/10">
            <div className="bg-white px-10 py-8 flex justify-between items-center border-b border-onyx-50 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4">
                  <div className={`p-3 rounded-xl shadow-sm ${isEditModalOpen ? 'bg-cyan-50 text-cyan-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isEditModalOpen ? <Database className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                  {isEditModalOpen ? 'Editar Movimiento' : 'Nueva Transacción'}
                </h2>
                <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-2 ml-16">Registro contable de flujos monetarios</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => { setIsFormOpen(false); setIsEditModalOpen(false); }}
                className="p-2.5 rounded-xl"
              >
                <X className="w-7 h-7" />
              </Button>
            </div>

            <form onSubmit={isEditModalOpen ? handleUpdateTransaction : handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
              {!isEditModalOpen && (
                <div className="flex bg-onyx-50 p-1.5 rounded-2xl border border-onyx-100 shadow-inner">
                  <button type="button" onClick={() => setMode('EXPENSE')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${mode === 'EXPENSE' ? 'bg-white shadow-lg text-red-600 border border-red-50' : 'text-onyx-400 hover:text-onyx-600'}`}>Gasto</button>
                  <button type="button" onClick={() => setMode('INCOME')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${mode === 'INCOME' ? 'bg-white shadow-lg text-emerald-600 border border-emerald-50' : 'text-onyx-400 hover:text-onyx-600'}`}>Ingreso</button>
                  <button type="button" onClick={() => setMode('TRANSFER')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${mode === 'TRANSFER' ? 'bg-white shadow-lg text-cyan-600 border border-cyan-50' : 'text-onyx-400 hover:text-onyx-600'}`}>Traspaso</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Cantidad</label>
                  <div className="relative group/input">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-onyx-300 font-bold text-2xl group-focus-within/input:text-cyan-600 transition-colors">{symbol}</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={isEditModalOpen ? editAmount : amount}
                      onChange={e => isEditModalOpen ? setEditAmount(e.target.value) : setAmount(e.target.value)}
                      className="w-full p-6 pl-14 bg-onyx-50 border border-onyx-100 rounded-3xl font-bold text-4xl text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-cyan-500/20 transition-all outline-none text-center shadow-inner"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Fecha</label>
                    <input
                      required
                      type="date"
                      value={isEditModalOpen ? editDate : date}
                      onChange={e => isEditModalOpen ? setEditDate(e.target.value) : setDate(e.target.value)}
                      className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all shadow-inner uppercase tracking-widest text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">{mode === 'TRANSFER' ? 'Cuenta de Origen' : 'Cuenta'}</label>
                    <select
                      required
                      value={isEditModalOpen ? editAccountId : accountId}
                      onChange={e => isEditModalOpen ? setEditAccountId(e.target.value) : setAccountId(e.target.value)}
                      className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all shadow-inner cursor-pointer"
                    >
                      <option value="">Seleccionar cuenta...</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({formatEUR(acc.balance)})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {mode === 'TRANSFER' && !isEditModalOpen && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Cuenta de Destino</label>
                    <select
                      required
                      value={toAccountId}
                      onChange={e => setToAccountId(e.target.value)}
                      className="w-full p-5 bg-cyan-50 border border-cyan-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all shadow-inner cursor-pointer"
                    >
                      <option value="">Seleccionar cuenta destino...</option>
                      {accounts.filter(a => a.id !== accountId).map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({formatEUR(acc.balance)})</option>
                      ))}
                    </select>
                  </div>
                )}

                {mode !== 'TRANSFER' && (
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Categoría</label>
                      <select
                        required
                        value={isEditModalOpen ? editCategory : category}
                        onChange={e => isEditModalOpen ? setEditCategory(e.target.value) : setCategory(e.target.value)}
                        className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all shadow-inner"
                      >
                        <option value="">Seleccionar...</option>
                        {categories.filter(c => c.type === (isEditModalOpen ? editingTransaction?.type : mode)).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Subcategoría</label>
                      <select
                        value={isEditModalOpen ? editSubCategory : subCategory}
                        onChange={e => isEditModalOpen ? setEditSubCategory(e.target.value) : setSubCategory(e.target.value)}
                        className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all shadow-inner"
                      >
                        <option value="">Opcional...</option>
                        {categories.find(c => c.name === (isEditModalOpen ? editCategory : category))?.subCategories.map(sc => (
                          <option key={sc} value={sc}>{sc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Project chips — only for expenses with active projects */}
                {(mode === 'EXPENSE' || (isEditModalOpen && editingTransaction?.type === 'EXPENSE')) &&
                  projectBudgets.filter(p => p.status === 'ACTIVE').length > 0 && (
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest whitespace-nowrap">Proyecto</span>
                        {/* "None" chip */}
                        <button
                          type="button"
                          onClick={() => isEditModalOpen ? setEditProjectId('') : setProjectId('')}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${(isEditModalOpen ? editProjectId : projectId) === ''
                              ? 'bg-onyx-800 text-white border-onyx-800'
                              : 'bg-onyx-50 text-onyx-400 border-onyx-200 hover:border-onyx-400'
                            }`}
                        >
                          Ninguno
                        </button>
                        {/* Parent project chips */}
                        {projectBudgets
                          .filter(p => !p.parentId && p.status === 'ACTIVE')
                          .map(parent => {
                            const subs = projectBudgets.filter(s => s.parentId === parent.id && s.status === 'ACTIVE');
                            const currentVal = isEditModalOpen ? editProjectId : projectId;
                            const parentSelected = currentVal === parent.id;
                            const subSelected = subs.some(s => s.id === currentVal);
                            return (
                              <div key={parent.id} className="flex items-center gap-1 flex-wrap">
                                {/* Parent chip (only clickable if no sub-projects, else just a label) */}
                                {subs.length === 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => isEditModalOpen ? setEditProjectId(parent.id) : setProjectId(parent.id)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${parentSelected
                                        ? 'text-white border-transparent shadow-sm'
                                        : 'bg-white border-onyx-200 hover:border-onyx-300 text-onyx-600'
                                      }`}
                                    style={parentSelected ? { backgroundColor: parent.color || '#06b6d4', borderColor: parent.color || '#06b6d4' } : {}}
                                  >
                                    {parent.name}
                                  </button>
                                ) : (
                                  <>
                                    {/* Parent label (non-selectable, acts as group header) */}
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${subSelected ? 'text-white border-transparent' : 'bg-white border-onyx-200 text-onyx-400'
                                        }`}
                                      style={subSelected ? { backgroundColor: parent.color || '#06b6d4', borderColor: parent.color || '#06b6d4' } : {}}
                                    >
                                      {parent.name}
                                    </span>
                                    {/* Sub-project chips */}
                                    {subs.map(sub => {
                                      const isSelected = currentVal === sub.id;
                                      return (
                                        <button
                                          key={sub.id}
                                          type="button"
                                          onClick={() => isEditModalOpen ? setEditProjectId(sub.id) : setProjectId(sub.id)}
                                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${isSelected
                                              ? 'text-white border-transparent shadow-sm'
                                              : 'bg-white border-onyx-200 hover:border-onyx-300 text-onyx-600'
                                            }`}
                                          style={isSelected ? { backgroundColor: sub.color || parent.color || '#06b6d4', borderColor: sub.color || parent.color || '#06b6d4' } : {}}
                                        >
                                          ↳ {sub.name}
                                        </button>
                                      );
                                    })}
                                  </>
                                )}
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  )}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Descripción / Concepto</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={isEditModalOpen ? editDescription : description}
                      onChange={e => isEditModalOpen ? setEditDescription(e.target.value) : setDescription(e.target.value)}
                      className="w-full p-5 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-cyan-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all shadow-inner placeholder:text-onyx-200 pr-12"
                      placeholder="Ej: Compra mensual en Mercadona"
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={handleSmartCategorization}
                      disabled={isSuggesting || !(isEditModalOpen ? editDescription : description)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-500"
                      title="Auto-detectar categoría con IA"
                    >
                      {isSuggesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-onyx-50/50 p-8 rounded-3xl border border-onyx-100 shadow-inner group/notes">
                <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-5">Notas Adicionales</p>
                <textarea
                  value={isEditModalOpen ? editNotes : notes}
                  onChange={e => isEditModalOpen ? setEditNotes(e.target.value) : setNotes(e.target.value)}
                  className="w-full p-6 bg-white border border-onyx-100 rounded-2xl font-semibold text-onyx-700 focus:ring-4 focus:ring-cyan-500/5 focus:border-cyan-500/20 transition-all outline-none resize-none h-32 shadow-sm"
                  placeholder="Añade detalles relevantes sobre este movimiento..."
                />
              </div>

              <div className="flex bg-cyan-50/50 p-6 rounded-3xl border border-cyan-100/50 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center">
                    <input type="checkbox" id="rec" checked={isEditModalOpen ? editRecurring : isRecurring} onChange={e => isEditModalOpen ? setEditRecurring(e.target.checked) : setIsRecurring(e.target.checked)} className="w-6 h-6 text-cyan-600 rounded-lg border-onyx-200 focus:ring-cyan-500/20 cursor-pointer" />
                  </div>
                  <label htmlFor="rec" className="text-[11px] font-bold text-onyx-700 uppercase tracking-widest cursor-pointer">Transacción Recurrente</label>
                </div>
                {(isEditModalOpen ? editRecurring : isRecurring) && (
                  <select value={isEditModalOpen ? editFrequency : recurrenceFrequency} onChange={e => isEditModalOpen ? setEditFrequency(e.target.value as any) : setRecurrenceFrequency(e.target.value as any)} className="bg-white border border-cyan-100 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-cyan-600 outline-none focus:ring-4 focus:ring-cyan-500/5 shadow-sm">
                    <option value="WEEKLY">Semanal</option>
                    <option value="BIWEEKLY">Quincenal</option>
                    <option value="MONTHLY">Mensual</option>
                    <option value="YEARLY">Anual</option>
                  </select>
                )}
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full py-6 rounded-3xl font-bold text-[11px] uppercase tracking-[0.3em] overflow-hidden group"
              >
                <span className="relative z-10">{isEditModalOpen ? 'Actualizar Registro' : 'Confirmar Transacción'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-white/5 to-cyan-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default Transactions;
