import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { ProjectBudget, ProjectItem } from '../../../types';
import {
    Plus, Pencil, Trash2, X, AlertTriangle, FolderOpen,
    CalendarRange, Check, Sparkles, ChevronDown, ChevronUp,
    FolderPlus, Layers, CheckCircle2, Circle
} from 'lucide-react';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface ProjectsProps {
    onViewTransactions: () => void;
}

const PRESET_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

const Projects: React.FC<ProjectsProps> = () => {
    const {
        projectBudgets, addProjectBudget, updateProjectBudget, deleteProjectBudget,
        projectItems, addProjectItem, updateProjectItem, deleteProjectItem,
    } = useFinanceStore();
    const { showError, showSuccess } = useErrorHandler();

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // ── Project modal ──────────────────────────────────────────────────────
    const [projectModal, setProjectModal] = useState<{ open: boolean; editId?: string; parentId?: string }>({ open: false });
    const [pName, setPName] = useState('');
    const [pDesc, setPDesc] = useState('');
    const [pLimit, setPLimit] = useState('');
    const [pStart, setPStart] = useState(new Date().toISOString().split('T')[0]);
    const [pEnd, setPEnd] = useState('');
    const [pStatus, setPStatus] = useState<ProjectBudget['status']>('ACTIVE');
    const [pColor, setPColor] = useState('#06b6d4');

    // ── Item modal ─────────────────────────────────────────────────────────
    const [itemModal, setItemModal] = useState<{ open: boolean; projectId: string; projectName: string; projectColor: string; editId?: string }>({
        open: false, projectId: '', projectName: '', projectColor: '#06b6d4'
    });
    const [iName, setIName] = useState('');
    const [iBudget, setIBudget] = useState('');
    const [iActual, setIActual] = useState('');
    const [iNotes, setINotes] = useState('');
    const [iStatus, setIStatus] = useState<ProjectItem['status']>('PENDING');

    const fmt = (n: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

    // ── Computed totals from items ─────────────────────────────────────────
    const getItemsFor = (projectId: string) => projectItems.filter(i => i.projectId === projectId);

    const getTotals = (projectId: string): { budgeted: number; actual: number } => {
        const direct = getItemsFor(projectId);
        const subs = projectBudgets.filter(p => p.parentId === projectId);
        const subTotals = subs.reduce(
            (acc, s) => {
                const t = getTotals(s.id);
                return { budgeted: acc.budgeted + t.budgeted, actual: acc.actual + t.actual };
            },
            { budgeted: 0, actual: 0 }
        );
        return {
            budgeted: direct.reduce((s, i) => s + i.budgetedAmount, 0) + subTotals.budgeted,
            actual: direct.reduce((s, i) => s + i.actualAmount, 0) + subTotals.actual,
        };
    };

    // ── Project modal helpers ──────────────────────────────────────────────
    const openNewProject = (parentId?: string) => {
        setPName(''); setPDesc(''); setPLimit('');
        setPStart(new Date().toISOString().split('T')[0]);
        setPEnd(''); setPStatus('ACTIVE'); setPColor('#06b6d4');
        setProjectModal({ open: true, parentId });
    };

    const openEditProject = (p: ProjectBudget) => {
        setPName(p.name); setPDesc(p.description || ''); setPLimit(p.limit > 0 ? p.limit.toString() : '');
        setPStart(p.startDate); setPEnd(p.endDate || ''); setPStatus(p.status); setPColor(p.color || '#06b6d4');
        setProjectModal({ open: true, editId: p.id, parentId: p.parentId });
    };

    const handleProjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pName.trim()) { showError(new Error('El nombre es requerido.')); return; }
        const base = { name: pName, description: pDesc || undefined, limit: parseFloat(pLimit) || 0, startDate: pStart, endDate: pEnd || undefined, status: pStatus, color: pColor };
        if (projectModal.editId) {
            updateProjectBudget(projectModal.editId, { ...base, parentId: projectModal.parentId });
            showSuccess('Proyecto actualizado');
        } else {
            addProjectBudget({ id: crypto.randomUUID(), spent: 0, parentId: projectModal.parentId, ...base });
            if (projectModal.parentId) setExpandedIds(prev => new Set(prev).add(projectModal.parentId!));
            showSuccess(projectModal.parentId ? 'Sub-proyecto creado' : 'Proyecto creado');
        }
        setProjectModal({ open: false });
    };

    const onDeleteProject = (id: string) => {
        const subs = projectBudgets.filter(p => p.parentId === id);
        const items = getItemsFor(id);
        const msg = `¿Eliminar este proyecto${subs.length ? ` y sus ${subs.length} sub-proyecto(s)` : ''}${items.length ? ` con ${items.length} partida(s)` : ''}? Esta acción no se puede deshacer.`;
        if (window.confirm(msg)) { deleteProjectBudget(id); showSuccess('Proyecto eliminado'); }
    };

    // ── Item modal helpers ─────────────────────────────────────────────────
    const openNewItem = (project: ProjectBudget) => {
        setIName(''); setIBudget(''); setIActual(''); setINotes(''); setIStatus('PENDING');
        setItemModal({ open: true, projectId: project.id, projectName: project.name, projectColor: project.color || '#06b6d4' });
        setExpandedIds(prev => new Set(prev).add(project.id));
    };

    const openEditItem = (item: ProjectItem, project: ProjectBudget) => {
        setIName(item.name); setIBudget(item.budgetedAmount > 0 ? item.budgetedAmount.toString() : '');
        setIActual(item.actualAmount > 0 ? item.actualAmount.toString() : '');
        setINotes(item.notes || ''); setIStatus(item.status);
        setItemModal({ open: true, projectId: project.id, projectName: project.name, projectColor: project.color || '#06b6d4', editId: item.id });
    };

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!iName.trim()) { showError(new Error('El nombre de la partida es requerido.')); return; }
        const base: Omit<ProjectItem, 'id'> = {
            projectId: itemModal.projectId,
            name: iName,
            budgetedAmount: parseFloat(iBudget) || 0,
            actualAmount: parseFloat(iActual) || 0,
            notes: iNotes || undefined,
            status: iStatus,
        };
        if (itemModal.editId) {
            updateProjectItem(itemModal.editId, base);
            showSuccess('Partida actualizada');
        } else {
            addProjectItem({ id: crypto.randomUUID(), ...base });
            showSuccess('Partida añadida');
        }
        setItemModal({ open: false, projectId: '', projectName: '', projectColor: '#06b6d4' });
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // ── Items table (inside a project card) ───────────────────────────────
    const ItemsTable = ({ project }: { project: ProjectBudget }) => {
        const items = getItemsFor(project.id);
        const totalBudget = items.reduce((s, i) => s + i.budgetedAmount, 0);
        const totalActual = items.reduce((s, i) => s + i.actualAmount, 0);
        const diff = totalBudget - totalActual;

        return (
            <div className="mt-4 border-t border-onyx-100 pt-4">
                {items.length === 0 ? (
                    <p className="text-[10px] text-onyx-400 text-center py-3">Sin partidas — añade elementos para hacer seguimiento</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-[9px] font-black uppercase tracking-widest text-onyx-400">
                                    <th className="text-left pb-2 pr-4 w-[40%]">Partida</th>
                                    <th className="text-right pb-2 pr-3">Presupuesto</th>
                                    <th className="text-right pb-2 pr-3">Real</th>
                                    <th className="text-right pb-2 pr-3">Diferencia</th>
                                    <th className="pb-2 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-onyx-50">
                                {items.map(item => {
                                    const itemDiff = item.budgetedAmount - item.actualAmount;
                                    return (
                                        <tr key={item.id} className="group hover:bg-onyx-50/50 transition-colors">
                                            <td className="py-2.5 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateProjectItem(item.id, { status: item.status === 'DONE' ? 'PENDING' : 'DONE' })}
                                                        className="flex-shrink-0 transition-colors"
                                                        style={{ color: item.status === 'DONE' ? project.color || '#06b6d4' : '#cbd5e1' }}
                                                    >
                                                        {item.status === 'DONE'
                                                            ? <CheckCircle2 className="w-4 h-4" />
                                                            : <Circle className="w-4 h-4" />}
                                                    </button>
                                                    <span className={`font-semibold ${item.status === 'DONE' ? 'line-through text-onyx-400' : 'text-cyan-900'}`}>{item.name}</span>
                                                </div>
                                                {item.notes && <p className="text-[9px] text-onyx-400 mt-0.5 ml-6">{item.notes}</p>}
                                            </td>
                                            <td className="py-2.5 pr-3 text-right text-onyx-600 font-bold tabular-nums">
                                                {item.budgetedAmount > 0 ? fmt(item.budgetedAmount) : <span className="text-onyx-300">—</span>}
                                            </td>
                                            <td className="py-2.5 pr-3 text-right font-bold tabular-nums">
                                                <span style={{ color: item.actualAmount > item.budgetedAmount && item.budgetedAmount > 0 ? '#ef4444' : '#0e7490' }}>
                                                    {item.actualAmount > 0 ? fmt(item.actualAmount) : <span className="text-onyx-300">—</span>}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-[10px]">
                                                {item.budgetedAmount > 0 && item.actualAmount > 0 ? (
                                                    <span className={itemDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                                        {itemDiff >= 0 ? '+' : ''}{fmt(itemDiff)}
                                                    </span>
                                                ) : <span className="text-onyx-300">—</span>}
                                            </td>
                                            <td className="py-2.5">
                                                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditItem(item, project)} className="p-1 hover:bg-cyan-50 rounded text-onyx-400 hover:text-cyan-600 transition-colors"><Pencil className="w-3 h-3" /></button>
                                                    <button onClick={() => { if (window.confirm('¿Eliminar esta partida?')) deleteProjectItem(item.id); }} className="p-1 hover:bg-red-50 rounded text-onyx-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {items.length > 0 && (
                                <tfoot>
                                    <tr className="border-t-2 border-onyx-200 text-[10px] font-black">
                                        <td className="pt-2.5 text-onyx-600">TOTAL</td>
                                        <td className="pt-2.5 text-right text-onyx-600 tabular-nums pr-3">{totalBudget > 0 ? fmt(totalBudget) : '—'}</td>
                                        <td className="pt-2.5 text-right tabular-nums pr-3" style={{ color: totalActual > totalBudget && totalBudget > 0 ? '#ef4444' : '#0e7490' }}>
                                            {totalActual > 0 ? fmt(totalActual) : '—'}
                                        </td>
                                        <td className="pt-2.5 text-right tabular-nums pr-3">
                                            {totalBudget > 0 && totalActual > 0 ? (
                                                <span className={diff >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                                    {diff >= 0 ? '+' : ''}{fmt(diff)}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
                <button
                    onClick={() => openNewItem(project)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-onyx-200 hover:border-onyx-400 rounded-xl text-[9px] font-bold uppercase tracking-widest text-onyx-400 hover:text-onyx-700 transition-all"
                >
                    <Plus className="w-3 h-3" /> Añadir Partida
                </button>
            </div>
        );
    };

    // ── Sub-project card ───────────────────────────────────────────────────
    const SubProjectCard = ({ project }: { project: ProjectBudget }) => {
        const { budgeted, actual } = getTotals(project.id);
        const pct = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
        const isOver = budgeted > 0 && actual > budgeted;
        const isExpanded = expandedIds.has(project.id);
        const pcol = project.color || '#06b6d4';

        return (
            <div className="rounded-2xl border border-onyx-100 bg-white overflow-hidden">
                <div className="h-0.5 w-full" style={{ backgroundColor: pcol }} />
                <div className="p-4">
                    <div className="flex justify-between items-start mb-3 group">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${pcol}18`, color: pcol }}>
                                <FolderOpen className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-cyan-900">{project.name}</p>
                                {project.description && <p className="text-[9px] text-onyx-400">{project.description}</p>}
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditProject(project)} className="p-1.5 hover:bg-onyx-50 rounded-lg text-onyx-400 hover:text-cyan-600 transition-colors"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-onyx-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    </div>

                    {/* Mini progress */}
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                        <span className="text-cyan-900">{fmt(actual)} real</span>
                        <span className="text-onyx-400">{budgeted > 0 ? `de ${fmt(budgeted)} presup.` : 'Sin presupuesto'}</span>
                    </div>
                    {budgeted > 0 && (
                        <div className="w-full h-1.5 bg-onyx-100 rounded-full overflow-hidden mb-1">
                            <div className={`h-full rounded-full ${isOver ? 'bg-red-400' : 'bg-gradient-to-r from-cyan-400 to-teal-400'}`}
                                style={{ width: `${pct}%`, backgroundColor: isOver ? undefined : pcol, transition: 'width 0.7s' }} />
                        </div>
                    )}
                    {isOver && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Excedido</p>}

                    <button onClick={() => toggleExpand(project.id)}
                        className="mt-3 w-full flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-onyx-400 hover:text-cyan-600 transition-colors pt-2 border-t border-onyx-50"
                    >
                        <span>{isExpanded ? 'Ocultar' : 'Ver'} partidas ({getItemsFor(project.id).length})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && <ItemsTable project={project} />}
                </div>
            </div>
        );
    };

    // ── Parent project card ────────────────────────────────────────────────
    const ParentProjectCard = ({ project }: { project: ProjectBudget }) => {
        const subs = projectBudgets.filter(p => p.parentId === project.id);
        const { budgeted, actual } = getTotals(project.id);
        const pct = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
        const isOver = budgeted > 0 && actual > budgeted;
        const isExpanded = expandedIds.has(project.id);
        const pcol = project.color || '#06b6d4';
        const hasItems = getItemsFor(project.id).length > 0;

        return (
            <div className="bg-white rounded-3xl border border-onyx-100 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-300 overflow-hidden group">
                <div className="h-1 w-full" style={{ backgroundColor: pcol }} />
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0"
                                style={{ backgroundColor: `${pcol}18`, color: pcol }}>
                                {subs.length > 0 ? <Layers className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-cyan-900 leading-tight">{project.name}</h3>
                                {project.description && <p className="text-xs text-onyx-400 mt-0.5">{project.description}</p>}
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${project.status === 'ACTIVE' ? 'bg-cyan-50 text-cyan-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {project.status === 'ACTIVE' ? 'Activo' : 'Completado'}
                                    </span>
                                    {subs.length > 0 && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-600 uppercase tracking-widest">{subs.length} sub-proyectos</span>}
                                    {project.endDate && (
                                        <span className="text-[10px] text-onyx-400 font-medium flex items-center gap-1">
                                            <CalendarRange className="w-3 h-3" /> {new Date(project.endDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {subs.length === 0 && (
                                <button onClick={() => openNewItem(project)} className="p-2 hover:bg-cyan-50 rounded-xl text-onyx-400 hover:text-cyan-600 transition-colors" title="Añadir partida">
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => openNewProject(project.id)} className="p-2 hover:bg-violet-50 rounded-xl text-onyx-400 hover:text-violet-600 transition-colors" title="Añadir sub-proyecto"><FolderPlus className="w-4 h-4" /></button>
                            <button onClick={() => openEditProject(project)} className="p-2 hover:bg-onyx-50 rounded-xl text-onyx-400 hover:text-cyan-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-2 hover:bg-red-50 rounded-xl text-onyx-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-onyx-50 rounded-2xl p-3 text-center">
                            <p className="text-[8px] font-black text-onyx-400 uppercase tracking-widest mb-1">Presupuesto</p>
                            <p className="text-sm font-black text-onyx-600">{budgeted > 0 ? fmt(budgeted) : '—'}</p>
                        </div>
                        <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: `${pcol}10` }}>
                            <p className="text-[8px] font-black text-onyx-400 uppercase tracking-widest mb-1">Gasto Real</p>
                            <p className="text-sm font-black" style={{ color: pcol }}>{actual > 0 ? fmt(actual) : '—'}</p>
                        </div>
                        <div className={`rounded-2xl p-3 text-center ${budgeted > 0 && actual > 0 ? (actual > budgeted ? 'bg-red-50' : 'bg-emerald-50') : 'bg-onyx-50'}`}>
                            <p className="text-[8px] font-black text-onyx-400 uppercase tracking-widest mb-1">Diferencia</p>
                            <p className={`text-sm font-black ${budgeted > 0 && actual > 0 ? (actual > budgeted ? 'text-red-500' : 'text-emerald-600') : 'text-onyx-300'}`}>
                                {budgeted > 0 && actual > 0 ? `${budgeted - actual >= 0 ? '+' : ''}${fmt(budgeted - actual)}` : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {budgeted > 0 && (
                        <>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                <span style={{ color: isOver ? '#ef4444' : pcol }}>{pct.toFixed(0)}% ejecutado</span>
                                <span className="text-onyx-400">Restante: {fmt(Math.max(0, budgeted - actual))}</span>
                            </div>
                            <div className="w-full h-2.5 bg-onyx-50 rounded-full overflow-hidden shadow-inner mb-1">
                                <div className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : ''}`}
                                    style={{ width: `${pct}%`, ...(isOver ? {} : { background: `linear-gradient(90deg, ${pcol}88, ${pcol})` }) }} />
                            </div>
                            {isOver && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Presupuesto excedido</p>}
                        </>
                    )}

                    {/* Expand toggle */}
                    <button onClick={() => toggleExpand(project.id)}
                        className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-onyx-400 hover:text-cyan-600 transition-colors pt-4 border-t border-onyx-50 mt-3">
                        {subs.length > 0
                            ? <span>{isExpanded ? 'Ocultar' : 'Ver'} sub-proyectos ({subs.length})</span>
                            : <span>{isExpanded ? 'Ocultar' : 'Ver'} partidas ({hasItems ? getItemsFor(project.id).length : 0})</span>}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Expanded area */}
                {isExpanded && (
                    <div className="border-t border-onyx-100 bg-onyx-50/40 px-6 pb-6 pt-4">
                        {subs.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {subs.map(sub => <SubProjectCard key={sub.id} project={sub} />)}
                                </div>
                                <button onClick={() => openNewProject(project.id)}
                                    className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-onyx-200 hover:border-violet-300 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-onyx-400 hover:text-violet-600 transition-all">
                                    <Plus className="w-3.5 h-3.5" /> Añadir sub-proyecto
                                </button>
                            </>
                        ) : (
                            <ItemsTable project={project} />
                        )}
                    </div>
                )}
            </div>
        );
    };

    const rootProjects = useMemo(() => projectBudgets.filter(p => !p.parentId), [projectBudgets]);
    const activeRoots = rootProjects.filter(p => p.status === 'ACTIVE');
    const completedRoots = rootProjects.filter(p => p.status === 'COMPLETED');

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Proyectos y Eventos</h2>
                    <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Presupuestos Puntuales — Reformas, Bodas, Viajes…</p>
                </div>
                <button onClick={() => openNewProject()}
                    className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-6 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-95">
                    <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo Proyecto</span>
                </button>
            </div>

            {rootProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-dashed border-onyx-200 rounded-3xl bg-onyx-50/50">
                    <Sparkles className="w-16 h-16 text-cyan-200 mb-6" />
                    <h3 className="text-xl font-bold text-cyan-900 mb-2">Sin proyectos aún</h3>
                    <p className="text-onyx-500 text-center max-w-md text-sm leading-relaxed mb-6">
                        Crea un proyecto (ej. "Reforma Casa"), añade sub-proyectos por zonas ("Baño", "Cocina") y dentro de cada uno, tus partidas: mampara, alicatado, plato de ducha… con su presupuesto y coste real.
                    </p>
                    <button onClick={() => openNewProject()} className="px-6 py-3 bg-white border border-onyx-200 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-200 text-cyan-700 font-bold text-xs uppercase tracking-widest transition-all">
                        Crear mi primer proyecto
                    </button>
                </div>
            ) : (
                <div className="space-y-12">
                    {activeRoots.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-bold text-cyan-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Proyectos en Curso
                            </h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {activeRoots.map(p => <ParentProjectCard key={p.id} project={p} />)}
                            </div>
                        </div>
                    )}
                    {completedRoots.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-onyx-100">
                            <h3 className="text-[11px] font-bold text-onyx-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Check className="w-4 h-4" /> Finalizados
                            </h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                                {completedRoots.map(p => <ParentProjectCard key={p.id} project={p} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Project Modal ── */}
            {projectModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-950/40 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-8 py-5 flex justify-between items-center border-b border-onyx-50 sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-cyan-900 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                                    {projectModal.editId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                                {projectModal.editId ? 'Editar' : (projectModal.parentId ? 'Nuevo Sub-Proyecto' : 'Nuevo Proyecto')}
                            </h3>
                            {projectModal.parentId && !projectModal.editId && (
                                <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> {projectBudgets.find(p => p.id === projectModal.parentId)?.name}
                                </span>
                            )}
                            <button onClick={() => setProjectModal({ open: false })} className="text-onyx-400 hover:text-cyan-900 p-2 hover:bg-onyx-50 rounded-xl"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleProjectSubmit} className="p-8 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Nombre</label>
                                <input type="text" required value={pName} onChange={e => setPName(e.target.value)}
                                    placeholder={projectModal.parentId ? 'Ej. Baño Superior' : 'Ej. Reforma Casa'}
                                    className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Descripción</label>
                                <input type="text" value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Opcional"
                                    className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Fecha Inicio</label>
                                    <input type="date" required value={pStart} onChange={e => setPStart(e.target.value)}
                                        className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Fecha Fin</label>
                                    <input type="date" value={pEnd} onChange={e => setPEnd(e.target.value)}
                                        className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Estado</label>
                                    <select value={pStatus} onChange={e => setPStatus(e.target.value as 'ACTIVE' | 'COMPLETED')}
                                        className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors">
                                        <option value="ACTIVE">Activo</option>
                                        <option value="COMPLETED">Completado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Color</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {PRESET_COLORS.map(c => (
                                            <button key={c} type="button" onClick={() => setPColor(c)}
                                                className={`w-7 h-7 rounded-full transition-all ${pColor === c ? 'scale-125 ring-2 ring-offset-2 ring-onyx-800' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-lg transition-all bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                                {projectModal.editId ? 'Guardar Cambios' : (projectModal.parentId ? 'Crear Sub-Proyecto' : 'Crear Proyecto')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Item (Partida) Modal ── */}
            {itemModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-950/40 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-onyx-50 sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${itemModal.projectColor}18`, color: itemModal.projectColor }}>
                                    <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-onyx-400 uppercase tracking-widest">{itemModal.editId ? 'Editar' : 'Nueva'} Partida</p>
                                    <p className="font-bold text-cyan-900 text-sm">{itemModal.projectName}</p>
                                </div>
                            </div>
                            <button onClick={() => setItemModal({ open: false, projectId: '', projectName: '', projectColor: '#06b6d4' })}
                                className="text-onyx-400 hover:text-cyan-900 p-2 hover:bg-onyx-50 rounded-xl"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleItemSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Nombre de la Partida</label>
                                <input type="text" required value={iName} onChange={e => setIName(e.target.value)}
                                    placeholder="Ej. Mampara de ducha"
                                    className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Presupuesto (€)</label>
                                    <input type="number" step="0.01" min="0" value={iBudget} onChange={e => setIBudget(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors text-right" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Coste Real (€)</label>
                                    <input type="number" step="0.01" min="0" value={iActual} onChange={e => setIActual(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors text-right" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Notas (Opcional)</label>
                                <input type="text" value={iNotes} onChange={e => setINotes(e.target.value)}
                                    placeholder="Proveedor, enlace, notas…"
                                    className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Estado</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIStatus('PENDING')}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${iStatus === 'PENDING' ? 'bg-onyx-800 text-white border-onyx-800' : 'bg-white border-onyx-200 text-onyx-500 hover:border-onyx-400'}`}>
                                        Pendiente
                                    </button>
                                    <button type="button" onClick={() => setIStatus('DONE')}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${iStatus === 'DONE' ? 'text-white border-transparent' : 'bg-white border-onyx-200 text-onyx-500 hover:border-onyx-400'}`}
                                        style={iStatus === 'DONE' ? { backgroundColor: itemModal.projectColor, borderColor: itemModal.projectColor } : {}}>
                                        Hecho ✓
                                    </button>
                                </div>
                            </div>
                            <button type="submit"
                                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-lg transition-all"
                                style={{ background: `linear-gradient(135deg, ${itemModal.projectColor}, ${itemModal.projectColor}bb)` }}>
                                {itemModal.editId ? 'Guardar Cambios' : 'Añadir Partida'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
