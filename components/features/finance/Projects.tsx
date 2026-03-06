import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { ProjectBudget } from '../../../types';
import {
    Plus, Pencil, Trash2, X, AlertTriangle,
    Home, HelpCircle, TrendingUp, CalendarRange, Check, AlertCircle, Sparkles
} from 'lucide-react';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface ProjectsProps {
    onViewTransactions: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ onViewTransactions }) => {
    const { projectBudgets, setProjectBudgets, transactions } = useFinanceStore();
    const { showError, showSuccess } = useErrorHandler();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<ProjectBudget['status']>('ACTIVE');
    const [color, setColor] = useState('#06b6d4'); // Default cyan-500
    const [icon, setIcon] = useState('Home');

    const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

    const getSpentAmount = (projectId: string) => {
        return transactions
            .filter(t => t.type === 'EXPENSE' && t.projectId === projectId)
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const activeProjects = projectBudgets.filter(p => p.status === 'ACTIVE');
    const completedProjects = projectBudgets.filter(p => p.status === 'COMPLETED');

    const resetForm = () => {
        setName('');
        setLimit('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setStatus('ACTIVE');
        setColor('#06b6d4');
        setIcon('Home');
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEditClick = (project: ProjectBudget) => {
        setName(project.name);
        setLimit(project.limit.toString());
        setStartDate(project.startDate);
        setEndDate(project.endDate || '');
        setStatus(project.status);
        setColor(project.color || '#06b6d4');
        setIcon(project.icon || 'Home');
        setEditingId(project.id);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numLimit = parseFloat(limit) || 0;
        if (!name.trim()) {
            showError(new Error('El nombre del proyecto es requerido.'));
            return;
        }

        if (editingId) {
            setProjectBudgets(prev => prev.map(p => p.id === editingId ? {
                ...p, name, limit: numLimit, startDate, endDate: endDate || undefined, status, color, icon
            } : p));
            showSuccess('Proyecto actualizado exitosamente');
        } else {
            const newProject: ProjectBudget = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                limit: numLimit,
                spent: 0, // will be calculated dynamically but interface needs it
                startDate,
                endDate: endDate || undefined,
                status,
                color,
                icon
            };
            setProjectBudgets(prev => [...prev, newProject]);
            showSuccess('Proyecto creado exitosamente');
        }
        resetForm();
    };

    const onDeleteProject = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto? Los gastos asociados perderán la referencia al proyecto, pero no se eliminarán.')) {
            setProjectBudgets(prev => prev.filter(p => p.id !== id));
            showSuccess('Proyecto eliminado');
        }
    };

    const ProjectCard = ({ project }: { project: ProjectBudget }) => {
        const spent = getSpentAmount(project.id);
        const percentage = project.limit > 0 ? (spent / project.limit) * 100 : 0;
        const isExceeded = project.limit > 0 && spent > project.limit;

        return (
            <div className="bg-white p-6 rounded-3xl border border-onyx-100 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-300 group flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" style={{ backgroundColor: project.color || '#06b6d4' }}></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${project.color}15`, color: project.color || '#06b6d4' }}>
                            <Home className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-cyan-900 leading-tight">{project.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${project.status === 'ACTIVE' ? 'bg-cyan-50 text-cyan-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {project.status === 'ACTIVE' ? 'Activo' : 'Completado'}
                                </span>
                                {project.endDate && (
                                    <span className="text-[10px] text-onyx-400 font-medium flex items-center gap-1">
                                        <CalendarRange className="w-3 h-3" /> Hasta {new Date(project.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(project)} className="p-2 hover:bg-onyx-50 rounded-xl text-onyx-400 hover:text-cyan-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteProject(project.id)} className="p-2 hover:bg-red-50 rounded-xl text-onyx-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="mt-auto relative z-10 space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Gastado</p>
                            <p className="text-2xl font-black text-cyan-900 tracking-tighter">{formatEUR(spent)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Presupuesto</p>
                            <p className="text-sm font-bold text-onyx-500">{project.limit > 0 ? formatEUR(project.limit) : 'Sin límite'}</p>
                        </div>
                    </div>

                    {project.limit > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span className={isExceeded ? 'text-red-500' : 'text-cyan-600'}>{percentage.toFixed(1)}%</span>
                                <span className="text-onyx-400 tracking-wider">Restante: {formatEUR(Math.max(0, project.limit - spent))}</span>
                            </div>
                            <div className="w-full h-2.5 bg-onyx-50 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${isExceeded ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-cyan-500'}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                            {isExceeded && (
                                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-2">
                                    <AlertTriangle className="w-3 h-3" /> Presupuesto excedido
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-cyan-900 tracking-tight">Proyectos y Eventos</h2>
                    <p className="text-xs font-semibold text-onyx-400 mt-2 uppercase tracking-[0.2em]">Presupuestos Puntuables (Reformas, Bodas, etc.)</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-6 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-95">
                        <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo Proyecto</span>
                    </button>
                </div>
            </div>

            {projectBudgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-dashed border-onyx-200 rounded-3xl bg-onyx-50/50">
                    <Sparkles className="w-16 h-16 text-cyan-200 mb-6" />
                    <h3 className="text-xl font-bold text-cyan-900 mb-2">No hay proyectos activos</h3>
                    <p className="text-onyx-500 text-center max-w-md text-sm leading-relaxed mb-6">
                        Crea proyectos para hacer seguimiento de eventos puntuales como la reforma de un baño, una boda o un viaje especial.
                    </p>
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="px-6 py-3 bg-white border border-onyx-200 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-200 text-cyan-700 font-bold text-xs uppercase tracking-widest transition-all">Crear mi primer proyecto</button>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Active Projects */}
                    {activeProjects.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-bold text-cyan-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span> Proyectos en Curso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {activeProjects.map(p => <ProjectCard key={p.id} project={p} />)}
                            </div>
                        </div>
                    )}

                    {/* Completed Projects */}
                    {completedProjects.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-onyx-100">
                            <h3 className="text-[11px] font-bold text-onyx-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Check className="w-4 h-4" /> Proyectos Finalizados
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                                {completedProjects.map(p => <ProjectCard key={p.id} project={p} />)}
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
                                {editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                            </h3>
                            <button onClick={resetForm} className="text-onyx-400 hover:text-cyan-900 transition-all p-2 hover:bg-onyx-50 rounded-xl"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Nombre del Proyecto</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Reforma Baño Principal" className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
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
                                <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">Color de Identificación</label>
                                <div className="flex gap-3">
                                    {['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'].map(c => (
                                        <button
                                            key={c} type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-onyx-800' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-cyan-900/20 transition-all">
                                {editingId ? 'Guardar Cambios' : 'Crear Proyecto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
