import React, { useState } from 'react';
import { ProjectItem } from '@/types';
import { Plus, X } from 'lucide-react';

interface ProjectItemModalProps {
    isOpen: boolean;
    editId?: string;
    projectId: string;
    projectName: string;
    projectColor: string;
    initialData?: ProjectItem;
    onClose: () => void;
    onSubmit: (data: Omit<ProjectItem, 'id'>, editId?: string) => void;
}

export const ProjectItemModal: React.FC<ProjectItemModalProps> = ({
    isOpen, editId, projectId, projectName, projectColor, initialData,
    onClose, onSubmit,
}) => {
    const [iName, setIName] = useState(initialData?.name || '');
    const [iBudget, setIBudget] = useState(initialData?.budgetedAmount && initialData.budgetedAmount > 0 ? initialData.budgetedAmount.toString() : '');
    const [iActual, setIActual] = useState(initialData?.actualAmount && initialData.actualAmount > 0 ? initialData.actualAmount.toString() : '');
    const [iNotes, setINotes] = useState(initialData?.notes || '');
    const [iStatus, setIStatus] = useState<ProjectItem['status']>(initialData?.status || 'PENDING');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!iName.trim()) return;
        onSubmit({
            projectId,
            name: iName,
            budgetedAmount: parseFloat(iBudget) || 0,
            actualAmount: parseFloat(iActual) || 0,
            notes: iNotes || undefined,
            status: iStatus,
        }, editId);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-950/40 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 flex justify-between items-center border-b border-aliseus-50 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${projectColor}18`, color: projectColor }}>
                            <Plus className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-aliseus-400 uppercase tracking-widest">{editId ? 'Editar' : 'Nueva'} Partida</p>
                            <p className="font-bold text-cyan-900 text-sm">{projectName}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="text-aliseus-400 hover:text-cyan-900 p-2 hover:bg-aliseus-50 rounded-xl"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-2">Nombre de la Partida</label>
                        <input type="text" required value={iName} onChange={e => setIName(e.target.value)}
                            placeholder="Ej. Mampara de ducha"
                            className="w-full p-4 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-2">Presupuesto (€)</label>
                            <input type="number" step="0.01" min="0" value={iBudget} onChange={e => setIBudget(e.target.value)}
                                placeholder="0,00"
                                className="w-full p-4 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors text-right" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-2">Coste Real (€)</label>
                            <input type="number" step="0.01" min="0" value={iActual} onChange={e => setIActual(e.target.value)}
                                placeholder="0,00"
                                className="w-full p-4 bg-aliseus-50 border border-aliseus-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors text-right" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-2">Notas (Opcional)</label>
                        <input type="text" value={iNotes} onChange={e => setINotes(e.target.value)}
                            placeholder="Proveedor, enlace, notas…"
                            className="w-full p-4 bg-aliseus-50 border border-aliseus-100 rounded-2xl text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mb-2">Estado</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIStatus('PENDING')}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${iStatus === 'PENDING' ? 'bg-aliseus-800 text-white border-aliseus-800' : 'bg-white border-aliseus-200 text-aliseus-500 hover:border-aliseus-400'}`}>
                                Pendiente
                            </button>
                            <button type="button" onClick={() => setIStatus('DONE')}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${iStatus === 'DONE' ? 'text-white border-transparent' : 'bg-white border-aliseus-200 text-aliseus-500 hover:border-aliseus-400'}`}
                                style={iStatus === 'DONE' ? { backgroundColor: projectColor, borderColor: projectColor } : {}}>
                                Hecho ✓
                            </button>
                        </div>
                    </div>
                    <button type="submit"
                        className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-lg transition-all"
                        style={{ background: `linear-gradient(135deg, ${projectColor}, ${projectColor}bb)` }}>
                        {editId ? 'Guardar Cambios' : 'Añadir Partida'}
                    </button>
                </form>
            </div>
        </div>
    );
};
