import React, { useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { Goal } from '../../../types';
import { Calculator, Calendar, Target, Plus, Clock, Pencil, Trash2, Sparkles, Banknote, Plane, Car, Home, Heart, Baby, PiggyBank, TrendingUp, GripVertical, AlertCircle, CheckCircle2, Archive, CalendarDays } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../../utils/cn';

interface GoalsProps {
  // All state managed via stores
}

const Goals: React.FC<GoalsProps> = () => {
  const { goals, setGoals, accounts } = useFinanceStore();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

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
    const reordered = [...goals];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setGoals(() => reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Effect to select first goal on load
  React.useEffect(() => {
    if (goals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  const [simMonthly, setSimMonthly] = useState<number | ''>('');


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formAccountId, setFormAccountId] = useState('');

  const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatTimeRemaining = (totalMonths: number) => {
    if (totalMonths === Infinity || isNaN(totalMonths)) return '∞';
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    if (months === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
  };

  const resetForm = () => {
    setFormName(''); setFormTarget(''); setFormCurrent(''); setFormDeadline(''); setFormAccountId(''); setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (goal: Goal) => {
    setFormName(goal.name); setFormTarget(goal.targetAmount.toString()); setFormCurrent(goal.currentAmount.toString()); setFormDeadline(goal.deadline || ''); setFormAccountId(goal.accountId || ''); setEditingId(goal.id); setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goalData: any = {
      name: formName,
      targetAmount: parseFloat(formTarget),
      currentAmount: parseFloat(formCurrent),
      deadline: formDeadline || undefined,
      accountId: formAccountId || undefined,
      payments: []
    };
    if (editingId) {
      setGoals((prev) => prev.map(g => g.id === editingId ? { ...goalData, id: editingId } : g));
    } else {
      const newGoal = { ...goalData, id: Math.random().toString(36).substr(2, 9) };
      setGoals((prev) => [...prev, newGoal]);
    }
    resetForm();
  };

  const onDeleteGoal = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta meta?')) {
      if (selectedGoalId === id) setSelectedGoalId(null);
      // Use setTimeout to allow render to clear selectedGoalId effect before removing data
      setTimeout(() => {
        setGoals((prev) => prev.filter(g => g.id !== id));
      }, 0);
    }
  };

  // ... (keep existing helper functions like formatEUR, submit, delete) ...

  // Calculate Total Monthly Savings Needed
  const totalMonthlyNeeded = goals.reduce((acc, goal) => {
    if (!goal.deadline) return acc;
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return acc;

    const today = new Date();
    const d = new Date(goal.deadline);

    // Check if goal is expired
    if (d < today) return acc;

    const months = (d.getFullYear() - today.getFullYear()) * 12 + (d.getMonth() - today.getMonth());

    // Only count if it's a realistic future date
    return acc + (remaining / Math.max(months, 1));
  }, 0);

  // ... (keep existing helper functions like formatEUR, submit, delete) ...

  return (
    <div className="space-y-10 animate-fade-in pb-10" key="goals-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Metas de Ahorro</h2>
          <p className="text-xs font-semibold text-aliseus-400 mt-2 uppercase tracking-[0.2em]">Ingeniería de Futuro</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => { setIsFormOpen(true); setEditingId(null); }} className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-95">
            <Plus className="w-5 h-5" /> Nueva Meta
          </button>
        )}
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-aliseus-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2">Total Ahorrado</p>
            <h3 className="text-3xl font-black text-cyan-900 tracking-tight">{formatEUR(goals.reduce((acc, g) => acc + g.currentAmount, 0))}</h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-aliseus-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2">Objetivo Global</p>
            <h3 className="text-3xl font-black text-cyan-900 tracking-tight">{formatEUR(goals.reduce((acc, g) => acc + g.targetAmount, 0))}</h3>
          </div>
          <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-aliseus-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-2">Aporte Mensual Pendiente</p>
            <h3 className="text-3xl font-black text-cyan-900 tracking-tight">{formatEUR(totalMonthlyNeeded)}<span className="text-sm text-aliseus-400 font-bold">/mes</span></h3>
          </div>
          <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* SIDEBAR LIST */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-aliseus-100">
            <h3 className="font-bold text-cyan-900 text-lg">Tus Metas</h3>
            <span className="text-xs font-bold bg-aliseus-100 px-2 py-1 rounded-lg text-aliseus-500">{goals.length} Activas</span>
          </div>

          <div className="space-y-3">
            {goals.map((goal, index) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isSelected = selectedGoalId === goal.id;
              const isCompleted = progress >= 100;
              const isDraggedOver = dragOverIndex === index && dragIndex !== index;

              // Icon Logic
              let GoalIcon = Target;
              const lowerName = goal.name.toLowerCase();
              if (lowerName.includes('viaje')) GoalIcon = Plane;
              else if (lowerName.includes('coche')) GoalIcon = Car;
              else if (lowerName.includes('casa')) GoalIcon = Home;
              else if (lowerName.includes('boda')) GoalIcon = Heart;
              else if (lowerName.includes('bebé')) GoalIcon = Baby;
              else if (lowerName.includes('fondo') || lowerName.includes('ahorro')) GoalIcon = PiggyBank;

              return (
                <div
                  key={goal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden select-none",
                    isSelected ? "bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-transparent shadow-xl scale-[1.02]" : "bg-white text-cyan-900 border-aliseus-100 hover:border-cyan-200 hover:bg-slate-50",
                    isDraggedOver && "border-cyan-400 border-2 scale-[1.01] shadow-md shadow-cyan-200",
                    dragIndex === index && "opacity-50"
                  )}
                >
                  <div className={cn("absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing", isSelected ? "text-white/30" : "text-aliseus-300")}>
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex justify-between items-center mb-3 pl-3 text-inherit">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", isSelected ? "bg-white/10" : "bg-aliseus-50 text-aliseus-500")}>
                        <GoalIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight line-clamp-1">{goal.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className={cn("text-[8px] font-bold uppercase tracking-wider", isSelected ? "text-white/50" : "text-aliseus-400")}>
                            {isCompleted ? 'Completado' : 'En Progreso'}
                          </p>
                          {goal.deadline && new Date(goal.deadline) < new Date() && !isCompleted && (
                            <span className={cn("px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter", isSelected ? "bg-white text-red-600" : "bg-red-50 text-red-600")}>Vencida</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg leading-none">{formatEUR(goal.currentAmount)}</p>
                    </div>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className={cn("w-full h-1.5 rounded-full overflow-hidden", isSelected ? "bg-white/10" : "bg-aliseus-100")}>
                    <div className={cn("h-full rounded-full", isCompleted ? "bg-emerald-400" : isSelected ? "bg-cyan-400" : "bg-cyan-500")} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          {goals.length === 0 && (
            <div className="text-center p-10 bg-aliseus-50/50 border-2 border-dashed border-aliseus-100 rounded-3xl flex flex-col items-center justify-center text-aliseus-300">
              <Target className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sin metas activas</p>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="md:col-span-8 space-y-6">
          {isFormOpen ? (
            <div className="bg-white p-10 rounded-Aliseus shadow-xl border border-aliseus-100 animate-fade-in relative overflow-hidden w-full">
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-aliseus-50">
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-cyan-900">{editingId ? 'Editar Meta' : 'Nueva Meta'}</h4>
                  <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mt-1">Configura tu objetivo financiero</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-aliseus-50 rounded-full transition-colors"><Trash2 className="w-5 h-5 text-aliseus-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-3 block">Nombre de la Meta</label>
                  <input required autoFocus type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-4 bg-aliseus-50 border border-aliseus-100 rounded-xl font-bold text-cyan-900 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-aliseus-300" placeholder="Ej: Viaje a Japón..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-3 block">Objetivo Total (€)</label>
                    <div className="relative">
                      <input required type="number" value={formTarget} onChange={e => setFormTarget(e.target.value)} className="w-full p-4 pl-10 bg-aliseus-50 border border-aliseus-100 rounded-xl font-bold text-xl text-cyan-900 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all" />
                      <Target className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-aliseus-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-3 block">Guardado Actualmente (€)</label>
                    <div className="relative">
                      <input required type="number" value={formCurrent} onChange={e => setFormCurrent(e.target.value)} className="w-full p-4 pl-10 bg-aliseus-50 border border-aliseus-100 rounded-xl font-bold text-xl text-cyan-900 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all" />
                      <Banknote className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-aliseus-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-3 block">Fecha Objetivo (Opcional)</label>
                  <input type="date" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} className="w-full p-4 bg-aliseus-50 border border-aliseus-100 rounded-xl font-bold text-cyan-900 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] mb-3 block">Cuenta de Ahorro Asociada (Opcional)</label>
                  <select value={formAccountId} onChange={e => setFormAccountId(e.target.value)} className="w-full p-4 bg-aliseus-50 border border-aliseus-100 rounded-xl font-bold text-cyan-900 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer appearance-none">
                    <option value="">-- Sin cuenta asociada --</option>
                    {accounts.filter(a => a.type !== 'CREDIT').map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({formatEUR(acc.balance)})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-aliseus-500 hover:bg-aliseus-50 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-cyan-900/20 transition-all active:scale-95">Guardar Meta</button>
                </div>
              </form>
            </div>
          ) : selectedGoal ? (
            <>
              {/* DETAIL CARD */}
              <div className="bg-white p-6 md:p-8 lg:p-10 rounded-3xl shadow-sm border border-aliseus-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="flex justify-between items-start mb-6 md:mb-10 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-cyan-600 to-teal-600 text-white rounded-lg"><Target className="w-4 h-4" /></div>
                      <p className="text-xs font-bold text-aliseus-400 uppercase tracking-[0.2em]">Meta Seleccionada</p>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-5xl font-black text-cyan-900 tracking-tight mb-2">{selectedGoal.name}</h3>
                    <div className="flex flex-col gap-1">
                      {selectedGoal.deadline && (
                        <p className={cn(
                          "text-sm font-bold flex items-center gap-2",
                          new Date(selectedGoal.deadline) < new Date() && selectedGoal.currentAmount < selectedGoal.targetAmount ? "text-red-500" : "text-aliseus-400"
                        )}>
                          <Clock className="w-4 h-4" /> Objetivo: {new Date(selectedGoal.deadline).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          {new Date(selectedGoal.deadline) < new Date() && selectedGoal.currentAmount < selectedGoal.targetAmount && <span className="bg-red-50 text-[10px] px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-tighter">Fecha Pasada</span>}
                        </p>
                      )}
                      {selectedGoal.accountId && (() => {
                        const acc = accounts.find(a => a.id === selectedGoal.accountId);
                        return acc ? (
                          <p className="text-sm font-bold text-cyan-600 flex items-center gap-2 mt-1">
                            <Banknote className="w-4 h-4" /> Vinculada a: {acc.name} ({formatEUR(acc.balance)})
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(selectedGoal)} className="p-3 bg-aliseus-50 hover:bg-aliseus-100 rounded-xl text-aliseus-500 hover:text-cyan-900 transition-colors"><Pencil className="w-5 h-5" /></button>
                    <button onClick={() => onDeleteGoal(selectedGoal.id)} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>

                {/* Status Alert for Expired Goals */}
                {selectedGoal.deadline && new Date(selectedGoal.deadline) < new Date() && selectedGoal.currentAmount < selectedGoal.targetAmount && (
                  <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white text-red-600 rounded-xl shadow-sm"><AlertCircle className="w-6 h-6" /></div>
                      <div>
                        <p className="font-black text-red-900 text-lg tracking-tight">¡Fecha objetivo alcanzada!</p>
                        <p className="text-red-700/70 text-sm font-bold">Aún faltan {formatEUR(selectedGoal.targetAmount - selectedGoal.currentAmount)} para completar esta meta.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button
                        onClick={() => handleEdit(selectedGoal)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-red-100 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 border border-red-200 transition-all uppercase tracking-widest"
                      >
                        <CalendarDays className="w-4 h-4" /> Renovar Fecha
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Quieres archivar esta meta?')) {
                            setGoals(prev => prev.filter(g => g.id !== selectedGoal.id));
                          }
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-red-900/10 transition-all uppercase tracking-widest"
                      >
                        <Archive className="w-4 h-4" /> Archivar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-1">Tu Progreso</p>
                    <p className="text-4xl font-black text-emerald-600 tracking-tight mb-4">{formatEUR(selectedGoal.currentAmount)}</p>
                    <div className="w-full bg-aliseus-100 h-4 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100)}%` }}>
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-aliseus-400">{((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(0)}% Completado</p>
                      {selectedGoal.deadline && selectedGoal.currentAmount < selectedGoal.targetAmount && (() => {
                        const today = new Date();
                        const deadline = new Date(selectedGoal.deadline);
                        if (deadline < today) return null;

                        const monthsDiff = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());
                        const monthsRemaining = Math.max(1, monthsDiff);
                        const remainingAmount = selectedGoal.targetAmount - selectedGoal.currentAmount;
                        const monthlyNeeded = remainingAmount / monthsRemaining;

                        if (monthlyNeeded > 0) {
                          return (
                            <p className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg">
                              Necesitas aportar aún: {formatEUR(monthlyNeeded)}/mes
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end items-end text-right">
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-1">Meta Total</p>
                    <p className="text-3xl font-bold text-aliseus-300 tracking-tight">{formatEUR(selectedGoal.targetAmount)}</p>
                    <p className="text-sm font-bold text-aliseus-400 mt-2">Faltan {formatEUR(selectedGoal.targetAmount - selectedGoal.currentAmount)}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
              </div>

              {/* SIMULATOR FOR THIS GOAL */}
              <div className="bg-white p-8 rounded-Aliseus shadow-sm border border-aliseus-100 group relative overflow-hidden transition-all duration-500 hover:shadow-md">
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="p-2.5 bg-aliseus-50 text-cyan-900 rounded-xl"><Calculator className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-900 uppercase tracking-widest">Proyector de Ahorro</h3>
                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mt-0.5">Define tu aportación y visualiza tu meta</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                  <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest px-1">Aportación Mensual (€)</label>
                      <input
                        autoFocus
                        type="number"
                        value={simMonthly}
                        placeholder="Ahorro mensual..."
                        onChange={(e) => setSimMonthly(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-lg md:text-xl font-black bg-transparent border-b border-aliseus-100 focus:border-cyan-500 outline-none transition-colors pb-2"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white p-6 rounded-3xl shadow-xl shadow-cyan-900/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5 leading-none">Alcanzarás tu meta en</p>
                        <div className="flex items-baseline gap-2">
                          <div className="text-3xl font-black">
                            {typeof simMonthly === 'number' && simMonthly > 0
                              ? formatTimeRemaining(Math.ceil((selectedGoal.targetAmount - selectedGoal.currentAmount) / simMonthly))
                              : '---'}
                          </div>
                        </div>

                        {(typeof simMonthly === 'number' && simMonthly > 0) ? (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-[9px] text-cyan-200 font-bold uppercase tracking-widest mb-1">Fecha estimada</p>
                            <p className="text-white font-bold text-sm">
                              {new Date(new Date().setMonth(new Date().getMonth() + Math.ceil((selectedGoal.targetAmount - selectedGoal.currentAmount) / simMonthly))).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[9px] text-cyan-200/60 font-medium leading-relaxed mt-4 italic">
                            Introduce una aportación mensual para proyectar tu éxito financiero.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VIZ SECTION */}
                  <div className="lg:col-span-8 flex flex-col">
                    <div className="flex-1 h-[240px] w-full min-h-[240px]">
                      {typeof simMonthly === 'number' && simMonthly > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={Array.from({ length: Math.min(Math.ceil((selectedGoal.targetAmount - selectedGoal.currentAmount) / simMonthly), 24) + 1 }).map((_, i) => {
                              const amount = selectedGoal.currentAmount + (simMonthly * i);
                              return {
                                month: i === 0 ? 'Hoy' : `Mes ${i}`,
                                balance: amount,
                                target: selectedGoal.targetAmount
                              };
                            })}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" hide />
                            <YAxis hide domain={[0, selectedGoal.targetAmount * 1.1]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: number) => [formatEUR(value), 'Saldo Proyectado']}
                              labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                            />
                            <Area type="monotone" dataKey="balance" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                            {/* Target Line */}
                            <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeDasharray="5 5" fill="none" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full bg-aliseus-50/50 rounded-3xl border border-dashed border-aliseus-100 flex flex-col items-center justify-center p-10 text-center">
                          <div className="p-4 bg-white rounded-full shadow-sm text-aliseus-200 mb-4 animate-pulse"><TrendingUp className="w-8 h-8" /></div>
                          <p className="text-xs font-bold text-aliseus-400 uppercase tracking-widest max-w-[200px]">Esperando aportación para generar curva de ahorro...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-aliseus-300 min-h-[400px]">
              <Target className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Selecciona una meta para ver detalles</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Goals;
