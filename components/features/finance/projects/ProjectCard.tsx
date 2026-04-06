import React from 'react';
import { ProjectBudget, ProjectItem } from '@/types';
import {
    Plus, Pencil, Trash2, AlertTriangle, FolderOpen, Layers,
    ChevronDown, ChevronUp, FolderPlus, CalendarRange, Users, MapPin, Info
} from 'lucide-react';
import { SubProjectCard } from './SubProjectCard';
import { ProjectItemsTable } from './ProjectItemsTable';

interface FamilyMember {
    id: string;
    name: string;
    role: string;
}

interface ProjectCardProps {
    project: ProjectBudget;
    subProjects: ProjectBudget[];
    allProjectBudgets: ProjectBudget[];
    projectItems: ProjectItem[];
    familyMembers: FamilyMember[];
    expandedIds: Set<string>;
    fmt: (n: number) => string;
    getTotals: (projectId: string) => { budgeted: number; actual: number };
    getItemsFor: (projectId: string) => ProjectItem[];
    onToggleExpand: (id: string) => void;
    onOpenNewProject: (parentId?: string) => void;
    onEditProject: (project: ProjectBudget) => void;
    onDeleteProject: (id: string) => void;
    onOpenNewItem: (project: ProjectBudget) => void;
    onOpenEditItem: (item: ProjectItem, project: ProjectBudget) => void;
    onUpdateItemStatus: (itemId: string, status: ProjectItem['status']) => void;
    onDeleteItem: (itemId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    project, subProjects, allProjectBudgets, projectItems, familyMembers,
    expandedIds, fmt, getTotals, getItemsFor,
    onToggleExpand, onOpenNewProject, onEditProject, onDeleteProject,
    onOpenNewItem, onOpenEditItem, onUpdateItemStatus, onDeleteItem,
}) => {
    const { budgeted, actual } = getTotals(project.id);
    const pct = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
    const isOver = budgeted > 0 && actual > budgeted;
    const isExpanded = expandedIds.has(project.id);
    const pcol = project.color || '#06b6d4';
    const hasItems = getItemsFor(project.id).length > 0;

    return (
        <div className="bg-white rounded-3xl border border-aliseus-100 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-300 overflow-hidden group">
            <div className="h-1 w-full" style={{ backgroundColor: pcol }} />
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0"
                            style={{ backgroundColor: `${pcol}18`, color: pcol }}>
                            {subProjects.length > 0 ? <Layers className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-cyan-900 leading-tight">{project.name}</h3>
                            {project.description && <p className="text-xs text-aliseus-400 mt-0.5">{project.description}</p>}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${project.status === 'ACTIVE' ? 'bg-cyan-50 text-cyan-600' : 'bg-aliseus-50 text-aliseus-600'}`}>
                                    {project.status === 'ACTIVE' ? 'Activo' : 'Completado'}
                                </span>
                                {project.projectType && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 uppercase tracking-widest border border-amber-100/50">
                                        {project.projectType.replace('_', ' ')}
                                    </span>
                                )}
                                {project.importance && project.importance !== 'MEDIA' && (
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${project.importance === 'ALTA' ? 'bg-red-50 text-red-500' : 'bg-aliseus-50 text-aliseus-400'}`}>
                                        {project.importance === 'ALTA' ? 'Prioridad Alta' : 'Prioridad Baja'}
                                    </span>
                                )}
                                {subProjects.length > 0 && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-600 uppercase tracking-widest">{subProjects.length} bloques</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] text-aliseus-400">
                                {project.keyDate && (
                                    <span className="flex items-center gap-1 font-bold text-cyan-700">
                                        <CalendarRange className="w-3 h-3" /> Clave: {new Date(project.keyDate).toLocaleDateString()}
                                    </span>
                                )}
                                {project.primaryResponsibleId && (
                                    <span className="flex items-center gap-1 font-medium italic">
                                        <Users className="w-3 h-3 text-violet-400" /> Resp: {familyMembers.find(m => m.id === project.primaryResponsibleId)?.name}
                                    </span>
                                )}
                                {project.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {project.location}
                                    </span>
                                )}
                                {project.estimatedGuests && (
                                    <span className="flex items-center gap-1">
                                        <Info className="w-3 h-3" /> {project.estimatedGuests} pax
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {subProjects.length === 0 && (
                            <button onClick={() => onOpenNewItem(project)} className="p-2 hover:bg-cyan-50 rounded-xl text-aliseus-400 hover:text-cyan-600 transition-colors" title="Añadir partida">
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={() => onOpenNewProject(project.id)} className="p-2 hover:bg-violet-50 rounded-xl text-aliseus-400 hover:text-violet-600 transition-colors" title="Añadir sub-proyecto"><FolderPlus className="w-4 h-4" /></button>
                        <button onClick={() => onEditProject(project)} className="p-2 hover:bg-aliseus-50 rounded-xl text-aliseus-400 hover:text-cyan-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteProject(project.id)} className="p-2 hover:bg-red-50 rounded-xl text-aliseus-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-aliseus-50 rounded-2xl p-3 text-center">
                        <p className="text-[8px] font-black text-aliseus-400 uppercase tracking-widest mb-1">Presupuesto</p>
                        <p className="text-sm font-black text-aliseus-600">{budgeted > 0 ? fmt(budgeted) : '—'}</p>
                    </div>
                    <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: `${pcol}10` }}>
                        <p className="text-[8px] font-black text-aliseus-400 uppercase tracking-widest mb-1">Gasto Real</p>
                        <p className="text-sm font-black" style={{ color: pcol }}>{actual > 0 ? fmt(actual) : '—'}</p>
                    </div>
                    <div className={`rounded-2xl p-3 text-center ${budgeted > 0 && actual > 0 ? (actual > budgeted ? 'bg-red-50' : 'bg-emerald-50') : 'bg-aliseus-50'}`}>
                        <p className="text-[8px] font-black text-aliseus-400 uppercase tracking-widest mb-1">Diferencia</p>
                        <p className={`text-sm font-black ${budgeted > 0 && actual > 0 ? (actual > budgeted ? 'text-red-500' : 'text-emerald-600') : 'text-aliseus-300'}`}>
                            {budgeted > 0 && actual > 0 ? `${budgeted - actual >= 0 ? '+' : ''}${fmt(budgeted - actual)}` : '—'}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                {budgeted > 0 && (
                    <>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                            <span style={{ color: isOver ? '#ef4444' : pcol }}>{pct.toFixed(0)}% ejecutado</span>
                            <span className="text-aliseus-400">Restante: {fmt(Math.max(0, budgeted - actual))}</span>
                        </div>
                        <div className="w-full h-2.5 bg-aliseus-50 rounded-full overflow-hidden shadow-inner mb-1">
                            <div className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : ''}`}
                                style={{ width: `${pct}%`, ...(isOver ? {} : { background: `linear-gradient(90deg, ${pcol}88, ${pcol})` }) }} />
                        </div>
                        {isOver && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Presupuesto excedido</p>}
                    </>
                )}

                {/* Expand toggle */}
                <button onClick={() => onToggleExpand(project.id)}
                    className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-aliseus-400 hover:text-cyan-600 transition-colors pt-4 border-t border-aliseus-50 mt-3">
                    {subProjects.length > 0
                        ? <span>{isExpanded ? 'Ocultar' : 'Ver'} sub-proyectos ({subProjects.length})</span>
                        : <span>{isExpanded ? 'Ocultar' : 'Ver'} partidas ({hasItems ? getItemsFor(project.id).length : 0})</span>}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Expanded area */}
            {isExpanded && (
                <div className="border-t border-aliseus-100 bg-aliseus-50/40 px-6 pb-6 pt-4">
                    {subProjects.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {subProjects.map(sub => (
                                    <SubProjectCard
                                        key={sub.id}
                                        project={sub}
                                        items={getItemsFor(sub.id)}
                                        totals={getTotals(sub.id)}
                                        isExpanded={expandedIds.has(sub.id)}
                                        fmt={fmt}
                                        onToggleExpand={onToggleExpand}
                                        onEditProject={onEditProject}
                                        onDeleteProject={onDeleteProject}
                                        onOpenNewItem={onOpenNewItem}
                                        onOpenEditItem={onOpenEditItem}
                                        onUpdateItemStatus={onUpdateItemStatus}
                                        onDeleteItem={onDeleteItem}
                                    />
                                ))}
                            </div>
                            <button onClick={() => onOpenNewProject(project.id)}
                                className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-aliseus-200 hover:border-violet-300 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-aliseus-400 hover:text-violet-600 transition-all">
                                <Plus className="w-3.5 h-3.5" /> Añadir sub-proyecto
                            </button>
                        </>
                    ) : (
                        <ProjectItemsTable
                            project={project}
                            items={getItemsFor(project.id)}
                            fmt={fmt}
                            onOpenNewItem={onOpenNewItem}
                            onOpenEditItem={onOpenEditItem}
                            onUpdateItemStatus={onUpdateItemStatus}
                            onDeleteItem={onDeleteItem}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
