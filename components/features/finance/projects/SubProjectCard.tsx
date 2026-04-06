import React from 'react';
import { ProjectBudget, ProjectItem } from '@/types';
import { Pencil, Trash2, AlertTriangle, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectItemsTable } from './ProjectItemsTable';

interface SubProjectCardProps {
    project: ProjectBudget;
    items: ProjectItem[];
    totals: { budgeted: number; actual: number };
    isExpanded: boolean;
    fmt: (n: number) => string;
    onToggleExpand: (id: string) => void;
    onEditProject: (project: ProjectBudget) => void;
    onDeleteProject: (id: string) => void;
    onOpenNewItem: (project: ProjectBudget) => void;
    onOpenEditItem: (item: ProjectItem, project: ProjectBudget) => void;
    onUpdateItemStatus: (itemId: string, status: ProjectItem['status']) => void;
    onDeleteItem: (itemId: string) => void;
}

export const SubProjectCard: React.FC<SubProjectCardProps> = ({
    project, items, totals, isExpanded, fmt,
    onToggleExpand, onEditProject, onDeleteProject,
    onOpenNewItem, onOpenEditItem, onUpdateItemStatus, onDeleteItem,
}) => {
    const { budgeted, actual } = totals;
    const pct = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
    const isOver = budgeted > 0 && actual > budgeted;
    const pcol = project.color || '#06b6d4';

    return (
        <div className="rounded-2xl border border-aliseus-100 bg-white overflow-hidden">
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
                            {project.description && <p className="text-[9px] text-aliseus-400">{project.description}</p>}
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditProject(project)} className="p-1.5 hover:bg-aliseus-50 rounded-lg text-aliseus-400 hover:text-cyan-600 transition-colors"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => onDeleteProject(project.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-aliseus-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                </div>

                {/* Mini progress */}
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                    <span className="text-cyan-900">{fmt(actual)} real</span>
                    <span className="text-aliseus-400">{budgeted > 0 ? `de ${fmt(budgeted)} presup.` : 'Sin presupuesto'}</span>
                </div>
                {budgeted > 0 && (
                    <div className="w-full h-1.5 bg-aliseus-100 rounded-full overflow-hidden mb-1">
                        <div className={`h-full rounded-full ${isOver ? 'bg-red-400' : 'bg-gradient-to-r from-cyan-400 to-teal-400'}`}
                            style={{ width: `${pct}%`, backgroundColor: isOver ? undefined : pcol, transition: 'width 0.7s' }} />
                    </div>
                )}
                {isOver && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Excedido</p>}

                <button onClick={() => onToggleExpand(project.id)}
                    className="mt-3 w-full flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-aliseus-400 hover:text-cyan-600 transition-colors pt-2 border-t border-aliseus-50"
                >
                    <span>{isExpanded ? 'Ocultar' : 'Ver'} partidas ({items.length})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                    <ProjectItemsTable
                        project={project}
                        items={items}
                        fmt={fmt}
                        onOpenNewItem={onOpenNewItem}
                        onOpenEditItem={onOpenEditItem}
                        onUpdateItemStatus={onUpdateItemStatus}
                        onDeleteItem={onDeleteItem}
                    />
                )}
            </div>
        </div>
    );
};
