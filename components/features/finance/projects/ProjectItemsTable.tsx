import React from 'react';
import { ProjectBudget, ProjectItem } from '@/types';
import { Plus, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface ProjectItemsTableProps {
    project: ProjectBudget;
    items: ProjectItem[];
    fmt: (n: number) => string;
    onOpenNewItem: (project: ProjectBudget) => void;
    onOpenEditItem: (item: ProjectItem, project: ProjectBudget) => void;
    onUpdateItemStatus: (itemId: string, status: ProjectItem['status']) => void;
    onDeleteItem: (itemId: string) => void;
}

export const ProjectItemsTable: React.FC<ProjectItemsTableProps> = ({
    project, items, fmt, onOpenNewItem, onOpenEditItem, onUpdateItemStatus, onDeleteItem,
}) => {
    const totalBudget = items.reduce((s, i) => s + i.budgetedAmount, 0);
    const totalActual = items.reduce((s, i) => s + i.actualAmount, 0);
    const diff = totalBudget - totalActual;

    return (
        <div className="mt-4 border-t border-aliseus-100 pt-4">
            {items.length === 0 ? (
                <p className="text-[10px] text-aliseus-400 text-center py-3">Sin partidas — añade elementos para hacer seguimiento</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-aliseus-400">
                                <th className="text-left pb-2 pr-4 w-[40%]">Partida</th>
                                <th className="text-right pb-2 pr-3">Presupuesto</th>
                                <th className="text-right pb-2 pr-3">Real</th>
                                <th className="text-right pb-2 pr-3">Diferencia</th>
                                <th className="pb-2 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-aliseus-50">
                            {items.map(item => {
                                const itemDiff = item.budgetedAmount - item.actualAmount;
                                return (
                                    <tr key={item.id} className="group hover:bg-aliseus-50/50 transition-colors">
                                        <td className="py-2.5 pr-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onUpdateItemStatus(item.id, item.status === 'DONE' ? 'PENDING' : 'DONE')}
                                                    className="flex-shrink-0 transition-colors"
                                                    style={{ color: item.status === 'DONE' ? project.color || '#06b6d4' : '#cbd5e1' }}
                                                >
                                                    {item.status === 'DONE'
                                                        ? <CheckCircle2 className="w-4 h-4" />
                                                        : <Circle className="w-4 h-4" />}
                                                </button>
                                                <span className={`font-semibold ${item.status === 'DONE' ? 'line-through text-aliseus-400' : 'text-cyan-900'}`}>{item.name}</span>
                                            </div>
                                            {item.notes && <p className="text-[9px] text-aliseus-400 mt-0.5 ml-6">{item.notes}</p>}
                                        </td>
                                        <td className="py-2.5 pr-3 text-right text-aliseus-600 font-bold tabular-nums">
                                            {item.budgetedAmount > 0 ? fmt(item.budgetedAmount) : <span className="text-aliseus-300">—</span>}
                                        </td>
                                        <td className="py-2.5 pr-3 text-right font-bold tabular-nums">
                                            <span style={{ color: item.actualAmount > item.budgetedAmount && item.budgetedAmount > 0 ? '#ef4444' : '#0e7490' }}>
                                                {item.actualAmount > 0 ? fmt(item.actualAmount) : <span className="text-aliseus-300">—</span>}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-[10px]">
                                            {item.budgetedAmount > 0 && item.actualAmount > 0 ? (
                                                <span className={itemDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                                    {itemDiff >= 0 ? '+' : ''}{fmt(itemDiff)}
                                                </span>
                                            ) : <span className="text-aliseus-300">—</span>}
                                        </td>
                                        <td className="py-2.5">
                                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onOpenEditItem(item, project)} className="p-1 hover:bg-cyan-50 rounded text-aliseus-400 hover:text-cyan-600 transition-colors"><Pencil className="w-3 h-3" /></button>
                                                <button onClick={() => { if (window.confirm('¿Eliminar esta partida?')) onDeleteItem(item.id); }} className="p-1 hover:bg-red-50 rounded text-aliseus-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {items.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 border-aliseus-200 text-[10px] font-black">
                                    <td className="pt-2.5 text-aliseus-600">TOTAL</td>
                                    <td className="pt-2.5 text-right text-aliseus-600 tabular-nums pr-3">{totalBudget > 0 ? fmt(totalBudget) : '—'}</td>
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
                onClick={() => onOpenNewItem(project)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-aliseus-200 hover:border-aliseus-400 rounded-xl text-[9px] font-bold uppercase tracking-widest text-aliseus-400 hover:text-aliseus-700 transition-all"
            >
                <Plus className="w-3 h-3" /> Añadir Partida
            </button>
        </div>
    );
};
