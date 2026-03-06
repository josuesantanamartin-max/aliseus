import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { ProjectBudget } from '../../../types';
import {
    Plus, Pencil, Trash2, X, AlertTriangle, FolderOpen,
    Home, CalendarRange, Check, Sparkles, ChevronDown, ChevronUp,
    FolderPlus, Layers
} from 'lucide-react';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface ProjectsProps {
    onViewTransactions: () => void;
}

const PRESET_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

const Projects: React.FC<ProjectsProps> = ({ onViewTransactions }) => {
    const { projectBudgets, addProjectBudget, updateProjectBudget, deleteProjectBudget, transactions } = useFinanceStore();
    const { showError, showSuccess } = useErrorHandler();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Form state
    const [formParentId, setFormParentId] = useState<string | undefined>(undefined);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [limit, setLimit] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<ProjectBudget['status']>('ACTIVE');
    const [color, setColor] = useState('#06b6d4');

    const formatEUR = (amount: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

    const getDirectSpent = (projectId: string) =>
        transactions
            .filter(t => t.type === 'EXPENSE' && t.projectId === projectId)
            .reduce((sum, t) => sum + t.amount, 0);

    // Get all sub-project IDs recursively (for total spent on parent)
    const getSubProjects = (parentId: string): ProjectBudget[] =>
        projectBudgets.filter(p => p.parentId === parentId);

    const getTotalSpent = (projectId: string): number => {
        const direct = getDirectSpent(projectId);
        const subTotal = getSubProjects(projectId).reduce((sum, sub) => sum + getTotalSpent(sub.id), 0);
        return direct + subTotal;
    };

    const getTotalLimit = (projectId: string): number => {
        const project = projectBudgets.find(p => p.id === projectId);
        if (!project) return 0;
        const subs = getSubProjects(projectId);
        if (subs.length === 0) return project.limit;
        // If parent has sub-projects, limit is the sum of children limits (or parent's own if set)
        const subLimitSum = subs.reduce((sum, sub) => sum + getTotalLimit(sub.id), 0);
        return project.limit > 0 ? project.limit : subLimitSum;
    };

    // Top-level projects (no parentId)
    const rootProjects = useMemo(() =>
        projectBudgets.filter(p => !p.parentId),
        [projectBudgets]
    );
    const activeRootProjects = rootProjects.filter(p => p.status === 'ACTIVE');
    const completedRootProjects = rootProjects.filter(p => p.status === 'COMPLETED');

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const resetForm = () => {
        setName(''); setDescription(''); setLimit('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(''); setStatus('ACTIVE'); setColor('#06b6d4');
        setFormParentId(undefined); setEditingId(null); setIsModalOpen(false);
    };

    const openNewProject = (parentId?: string) => {
        resetForm();
        setFormParentId(parentId);
        setIsModalOpen(true);
    };

    const handleEditClick = (project: ProjectBudget) => {
        setName(project.name);
        setDescription(project.description || '');
        setLimit(project.limit > 0 ? project.limit.toString() : '');
        setStartDate(project.startDate);
        setEndDate(project.endDate || '');
        setStatus(project.status);
        setColor(project.color || '#06b6d4');
        setFormParentId(project.parentId);
        setEditingId(project.id);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numLimit = parseFloat(limit) || 0;
        if (!name.trim()) { showError(new Error('El nombre del proyecto es requerido.')); return; }

        if (editingId) {
            updateProjectBudget(editingId, { name, description: description || undefined, limit: numLimit, startDate, endDate: endDate || undefined, status, color, parentId: formParentId });
            showSuccess('Proyecto actualizado exitosamente');
        } else {
            const newProject: ProjectBudget = {
                id: Math.random().toString(36).substr(2, 9),
                parentId: formParentId,
                name,
                description: description || undefined,
                limit: numLimit,
                spent: 0,
                startDate,
                endDate: endDate || undefined,
                status,
                color,
            };
            addProjectBudget(newProject);
            if (formParentId) setExpandedIds(prev => new Set(prev).add(formParentId));
            showSuccess(formParentId ? 'Sub-proyecto creado exitosamente' : 'Proyecto creado exitosamente');
        }
        resetForm();
    };

    const onDeleteProject = (id: string) => {
        const subs = getSubProjects(id);
        const msg = subs.length > 0
            ? `¿Eliminar este proyecto y sus ${subs.length} sub-proyecto(s)? Esta acción no se puede deshacer.`
            : '¿Eliminar este proyecto? Los gastos asociados no se eliminarán.';
        if (window.confirm(msg)) {
            deleteProjectBudget(id);
            showSuccess('Proyecto eliminado');
        }
    };

    // ── Sub-project mini card ──────────────────────────────────────────────
    const SubProjectCard = ({ project }: { project: ProjectBudget }) => {
        const spent = getTotalSpent(project.id);
        const totalLimit = getTotalLimit(project.id);
        const percentage = totalLimit > 0 ? (spent / totalLimit) * 100 : 0;
        const isExceeded = totalLimit > 0 && spent > totalLimit;

        return (
            <div className="bg-onyx-50/70 rounded-2xl p-4 border border-onyx-100 hover:border-cyan-200 hover:bg-white transition-all group relative">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#06b6d4' }} />
                        <div>
                            <p className="font-bold text-sm text-cyan-900">{project.name}</p>
                            {project.description && <p className="text-[10px] text-onyx-400 mt-0.5">{project.description}</p>}
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(project)} className="p-1.5 hover:bg-white rounded-lg text-onyx-400 hover:text-cyan-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onDeleteProject(project.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-onyx-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-bold mb-2">
                    <span className="text-cyan-900">{formatEUR(spent)}</span>
                    <span className="text-onyx-400">{totalLimit > 0 ? `de ${formatEUR(totalLimit)}` : 'Sin límite'}</span>
                </div>

                {totalLimit > 0 && (
                    <div className="w-full h-1.5 bg-onyx-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${isExceeded ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-teal-400'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                )}
                {isExceeded && (
                    <p className="text-[9px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Excedido
                    </p>
                )}
            </div>
        );
    };

    // ── Parent project card ────────────────────────────────────────────────
    const ParentProjectCard = ({ project }: { project: ProjectBudget }) => {
        const subs = getSubProjects(project.id);
        const totalSpent = getTotalSpent(project.id);
        const totalLimit = getTotalLimit(project.id);
        const percentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
        const isExceeded = totalLimit > 0 && totalSpent > totalLimit;
        const isExpanded = expandedIds.has(project.id);
        const hasSubprojects = subs.length > 0;
        const projectColor = project.color || '#06b6d4';

        return (
            <div className="bg-white rounded-3xl border border-onyx-100 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-300 overflow-hidden group">
                {/* Color accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: projectColor }} />

                <div className="p-6">
                    {/* Header row */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0"
                                style={{ backgroundColor: `${projectColor}18`, color: projectColor }}>
                                {hasSubprojects ? <Layers className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-cyan-900 leading-tight">{project.name}</h3>
                                {project.description && <p className="text-xs text-onyx-400 mt-0.5">{project.description}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${project.status === 'ACTIVE' ? 'bg-cyan-50 text-cyan-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {project.status === 'ACTIVE' ? 'Activo' : 'Completado'}
                                    </span>
                                    {hasSubprojects && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-600 uppercase tracking-widest">
                                            {subs.length} sub-proyectos
                                        </span>
                                    )}
                                    {project.endDate && (
                                        <span className="text-[10px] text-onyx-400 font-medium flex items-center gap-1">
                                            <CalendarRange className="w-3 h-3" /> {new Date(project.endDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openNewProject(project.id)}
                                className="p-2 hover:bg-cyan-50 rounded-xl text-onyx-400 hover:text-cyan-600 transition-colors"
                                title="Añadir sub-proyecto">
                                <FolderPlus className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditClick(project)} className="p-2 hover:bg-onyx-50 rounded-xl text-onyx-400 hover:text-cyan-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-2 hover:bg-red-50 rounded-xl text-onyx-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Total Gastado</p>
                            <p className="text-2xl font-black text-cyan-900 tracking-tighter">{formatEUR(totalSpent)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Presupuesto</p>
                            <p className="text-sm font-bold text-onyx-500">{totalLimit > 0 ? formatEUR(totalLimit) : 'Sin límite'}</p>
                        </div>
                    </div>

                    {totalLimit > 0 && (
                        <div className="space-y-1.5 mb-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span className={isExceeded ? 'text-red-500' : 'text-cyan-600'}>{percentage.toFixed(1)}%</span>
                                <span className="text-onyx-400">Restante: {formatEUR(Math.max(0, totalLimit - totalSpent))}</span>
                            </div>
                            <div className="w-full h-2.5 bg-onyx-50 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${isExceeded ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-teal-500'}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                            {isExceeded && (
                                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                    <AlertTriangle className="w-3 h-3" /> Presupuesto excedido
                                </p>
                            )}
                        </div>
                    )}

                    {/* Expand/Collapse sub-projects */}
                    {hasSubprojects && (
                        <button
                            onClick={() => toggleExpand(project.id)}
                            className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-onyx-400 hover:text-cyan-600 transition-colors pt-3 border-t border-onyx-50 mt-1"
                        >
                            <span>{isExpanded ? 'Ocultar' : 'Ver'} sub-proyectos ({subs.length})</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* Sub-projects panel */}
                {isExpanded && hasSubprojects && (
                    <div className="px-6 pb-6 space-y-3 bg-onyx-50/40 border-t border-onyx-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {subs.map(sub => <SubProjectCard key={sub.id} project={sub} />)}
                        </div>
                        <button
                            onClick={() => openNewProject(project.id)}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-onyx-200 hover:border-cyan-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-onyx-400 hover:text-cyan-600 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Añadir sub-proyecto
                        </button>
                    </div>
                )}

                {/* No sub-projects yet: show prompt */}
                {!hasSubprojects && isExpanded && (
                    <div className="px-6 pb-6 pt-4 border-t border-onyx-50 text-center">
                        <button
                            onClick={() => openNewProject(project.id)}
                            className="text-xs text-cyan-600 font-bold flex items-center gap-1.5 mx-auto hover:text-cyan-800 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Crear primer sub-proyecto
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Proyectos y Eventos</h2>
                    <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Presupuestos Puntuales (Reformas, Bodas, Viajes…)</p>
                </div>
                <button
                    onClick={() => openNewProject()}
                    className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-6 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo Proyecto</span>
                </button>
            </div>

            {rootProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-dashed border-onyx-200 rounded-3xl bg-onyx-50/50">
                    <Sparkles className="w-16 h-16 text-cyan-200 mb-6" />
                    <h3 className="text-xl font-bold text-cyan-900 mb-2">No hay proyectos activos</h3>
                    <p className="text-onyx-500 text-center max-w-md text-sm leading-relaxed mb-6">
                        Crea proyectos para hacer seguimiento de eventos puntuales como una reforma, una boda o un viaje. Cada proyecto puede tener sub-proyectos por zonas o etapas.
                    </p>
                    <button onClick={() => openNewProject()} className="px-6 py-3 bg-white border border-onyx-200 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-200 text-cyan-700 font-bold text-xs uppercase tracking-widest transition-all">
                        Crear mi primer proyecto
                    </button>
                </div>
            ) : (
                <div className="space-y-12">
                    {activeRootProjects.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-bold text-cyan-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Proyectos en Curso
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {activeRootProjects.map(p => <ParentProjectCard key={p.id} project={p} />)}
                            </div>
                        </div>
                    )}
                    {completedRootProjects.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-onyx-100">
                            <h3 className="text-[11px] font-bold text-onyx-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Check className="w-4 h-4" /> Proyectos Finalizados
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                                {completedRootProjects.map(p => <ParentProjectCard key={p.id} project={p} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-950/40 backdrop-blur-md p-4 animate-fade-in text-cyan-900">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col relative">
                        <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-onyx-50 sticky top-0 z-10">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-3 text-cyan-900">
                                <div className="p-2.5 rounded-xl shadow-inner bg-cyan-50 text-cyan-600">
                                    {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                                {editingId ? 'Editar' : (formParentId ? 'Nuevo Sub-Proyecto' : 'Nuevo Proyecto')}
                            </h3>
                            {formParentId && !editingId && (
                                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    {projectBudgets.find(p => p.id === formParentId)?.name}
                                </span>
                            )}
                            <button onClick={resetForm} className="text-onyx-400 hover:text-cyan-900 transition-all p-2 hover:bg-onyx-50 rounded-xl"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">
                                    {formParentId ? 'Nombre del Sub-Proyecto' : 'Nombre del Proyecto'}
                                </label>
                                <input
                                    type="text" required value={name} onChange={e => setName(e.target.value)}
                                    placeholder={formParentId ? 'Ej. Baño Principal' : 'Ej. Reforma Casa'}
                                    className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Descripción (Opcional)</label>
                                <input
                                    type="text" value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Breve descripción o notas"
                                    className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Presupuesto Límite (€)</label>
                                    <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Opcional" className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Estado</label>
                                    <select value={status} onChange={e => setStatus(e.target.value as 'ACTIVE' | 'COMPLETED')} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors">
                                        <option value="ACTIVE">Activo</option>
                                        <option value="COMPLETED">Completado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Fecha Inicio</label>
                                    <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Fecha Fin (Opc.)</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Color</label>
                                <div className="flex gap-3 flex-wrap">
                                    {PRESET_COLORS.map(c => (
                                        <button key={c} type="button" onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-onyx-800' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-cyan-900/20 transition-all">
                                {editingId ? 'Guardar Cambios' : (formParentId ? 'Crear Sub-Proyecto' : 'Crear Proyecto')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
