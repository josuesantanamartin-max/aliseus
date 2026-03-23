import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { ProjectBudget, ProjectItem } from '../../../types';
import { Plus, Sparkles, Check } from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ProjectCard } from './projects/ProjectCard';
import { ProjectModal } from './projects/ProjectModal';
import { ProjectItemModal } from './projects/ProjectItemModal';

interface ProjectsProps {
    onViewTransactions: () => void;
}

const Projects: React.FC<ProjectsProps> = () => {
    const {
        projectBudgets, addProjectBudget, updateProjectBudget, deleteProjectBudget,
        projectItems, addProjectItem, updateProjectItem, deleteProjectItem,
    } = useFinanceStore();
    const { familyMembers } = useLifeStore();
    const { showError, showSuccess } = useErrorHandler();

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // ── Modal state ──────────────────────────────────────────────────────
    const [projectModal, setProjectModal] = useState<{ open: boolean; editId?: string; parentId?: string; data?: ProjectBudget }>({ open: false });
    const [itemModal, setItemModal] = useState<{ open: boolean; projectId: string; projectName: string; projectColor: string; editId?: string; data?: ProjectItem }>({
        open: false, projectId: '', projectName: '', projectColor: '#06b6d4'
    });

    const fmt = (n: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

    // ── Computed totals ─────────────────────────────────────────────────
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

    // ── Helpers ──────────────────────────────────────────────────────────
    const openNewProject = (parentId?: string) => {
        setProjectModal({ open: true, parentId });
    };

    const openEditProject = (p: ProjectBudget) => {
        setProjectModal({ open: true, editId: p.id, parentId: p.parentId, data: p });
    };

    const handleProjectSubmit = (data: any, editId?: string, parentId?: string) => {
        if (!data.name?.trim()) { showError(new Error('El nombre es requerido.')); return; }
        if (editId) {
            updateProjectBudget(editId, { ...data, parentId });
            showSuccess('Proyecto actualizado');
        } else {
            addProjectBudget({ id: crypto.randomUUID(), spent: 0, parentId, ...data });
            if (parentId) setExpandedIds(prev => new Set(prev).add(parentId));
            showSuccess(parentId ? 'Sub-proyecto creado' : 'Proyecto creado');
        }
        setProjectModal({ open: false });
    };

    const onDeleteProject = (id: string) => {
        const subs = projectBudgets.filter(p => p.parentId === id);
        const items = getItemsFor(id);
        const msg = `¿Eliminar este proyecto${subs.length ? ` y sus ${subs.length} sub-proyecto(s)` : ''}${items.length ? ` con ${items.length} partida(s)` : ''}? Esta acción no se puede deshacer.`;
        if (window.confirm(msg)) { deleteProjectBudget(id); showSuccess('Proyecto eliminado'); }
    };

    const openNewItem = (project: ProjectBudget) => {
        setItemModal({ open: true, projectId: project.id, projectName: project.name, projectColor: project.color || '#06b6d4' });
        setExpandedIds(prev => new Set(prev).add(project.id));
    };

    const openEditItem = (item: ProjectItem, project: ProjectBudget) => {
        setItemModal({ open: true, projectId: project.id, projectName: project.name, projectColor: project.color || '#06b6d4', editId: item.id, data: item });
    };

    const handleItemSubmit = (data: Omit<ProjectItem, 'id'>, editId?: string) => {
        if (!data.name?.trim()) { showError(new Error('El nombre de la partida es requerido.')); return; }
        if (editId) {
            updateProjectItem(editId, data);
            showSuccess('Partida actualizada');
        } else {
            addProjectItem({ id: crypto.randomUUID(), ...data });
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

    const handleUpdateItemStatus = (itemId: string, status: ProjectItem['status']) => {
        updateProjectItem(itemId, { status });
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
                                {activeRoots.map(p => (
                                    <ProjectCard
                                        key={p.id}
                                        project={p}
                                        subProjects={projectBudgets.filter(sub => sub.parentId === p.id)}
                                        allProjectBudgets={projectBudgets}
                                        projectItems={projectItems}
                                        familyMembers={familyMembers}
                                        expandedIds={expandedIds}
                                        fmt={fmt}
                                        getTotals={getTotals}
                                        getItemsFor={getItemsFor}
                                        onToggleExpand={toggleExpand}
                                        onOpenNewProject={openNewProject}
                                        onEditProject={openEditProject}
                                        onDeleteProject={onDeleteProject}
                                        onOpenNewItem={openNewItem}
                                        onOpenEditItem={openEditItem}
                                        onUpdateItemStatus={handleUpdateItemStatus}
                                        onDeleteItem={deleteProjectItem}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {completedRoots.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-onyx-100">
                            <h3 className="text-[11px] font-bold text-onyx-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Check className="w-4 h-4" /> Finalizados
                            </h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                                {completedRoots.map(p => (
                                    <ProjectCard
                                        key={p.id}
                                        project={p}
                                        subProjects={projectBudgets.filter(sub => sub.parentId === p.id)}
                                        allProjectBudgets={projectBudgets}
                                        projectItems={projectItems}
                                        familyMembers={familyMembers}
                                        expandedIds={expandedIds}
                                        fmt={fmt}
                                        getTotals={getTotals}
                                        getItemsFor={getItemsFor}
                                        onToggleExpand={toggleExpand}
                                        onOpenNewProject={openNewProject}
                                        onEditProject={openEditProject}
                                        onDeleteProject={onDeleteProject}
                                        onOpenNewItem={openNewItem}
                                        onOpenEditItem={openEditItem}
                                        onUpdateItemStatus={handleUpdateItemStatus}
                                        onDeleteItem={deleteProjectItem}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ProjectModal
                isOpen={projectModal.open}
                editId={projectModal.editId}
                parentId={projectModal.parentId}
                initialData={projectModal.data}
                projectBudgets={projectBudgets}
                familyMembers={familyMembers}
                onClose={() => setProjectModal({ open: false })}
                onSubmit={handleProjectSubmit}
            />

            <ProjectItemModal
                isOpen={itemModal.open}
                editId={itemModal.editId}
                projectId={itemModal.projectId}
                projectName={itemModal.projectName}
                projectColor={itemModal.projectColor}
                initialData={itemModal.data}
                onClose={() => setItemModal({ open: false, projectId: '', projectName: '', projectColor: '#06b6d4' })}
                onSubmit={handleItemSubmit}
            />
        </div>
    );
};

export default Projects;
