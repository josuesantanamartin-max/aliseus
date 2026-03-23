import React, { useState } from 'react';
import { ProjectBudget } from '@/types';
import { Plus, Pencil, X, Layers, MapPin, Users, Sparkles } from 'lucide-react';

interface FamilyMember {
    id: string;
    name: string;
    role: string;
}

const PRESET_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

interface ProjectModalProps {
    isOpen: boolean;
    editId?: string;
    parentId?: string;
    initialData?: ProjectBudget;
    projectBudgets: ProjectBudget[];
    familyMembers: FamilyMember[];
    onClose: () => void;
    onSubmit: (data: any, editId?: string, parentId?: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
    isOpen, editId, parentId, initialData, projectBudgets, familyMembers,
    onClose, onSubmit,
}) => {
    const [pName, setPName] = useState(initialData?.name || '');
    const [pDesc, setPDesc] = useState(initialData?.description || '');
    const [pLimit, setPLimit] = useState(initialData?.limit && initialData.limit > 0 ? initialData.limit.toString() : '');
    const [pStart, setPStart] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
    const [pEnd, setPEnd] = useState(initialData?.endDate || '');
    const [pStatus, setPStatus] = useState<ProjectBudget['status']>(initialData?.status || 'ACTIVE');
    const [pColor, setPColor] = useState(initialData?.color || '#06b6d4');
    const [pType, setPType] = useState<ProjectBudget['projectType']>(initialData?.projectType || 'REFORMA');
    const [pKeyDate, setPKeyDate] = useState(initialData?.keyDate || '');
    const [pResponsible, setPResponsible] = useState(initialData?.primaryResponsibleId || '');
    const [pLocation, setPLocation] = useState(initialData?.location || '');
    const [pGuests, setPGuests] = useState(initialData?.estimatedGuests || '');
    const [pImportance, setPImportance] = useState<ProjectBudget['importance']>(initialData?.importance || 'MEDIA');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pName.trim()) return;
        onSubmit({
            name: pName,
            description: pDesc || undefined,
            limit: parseFloat(pLimit) || 0,
            startDate: pStart,
            endDate: pEnd || undefined,
            status: pStatus,
            color: pColor,
            projectType: pType,
            keyDate: pKeyDate || undefined,
            primaryResponsibleId: pResponsible || undefined,
            location: pLocation || undefined,
            estimatedGuests: pGuests || undefined,
            importance: pImportance
        }, editId, parentId);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-950/40 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-8 py-5 flex justify-between items-center border-b border-onyx-50 sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-cyan-900 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                            {editId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                        {editId ? 'Editar' : (parentId ? 'Nuevo Sub-Proyecto' : 'Nuevo Proyecto')}
                    </h3>
                    {parentId && !editId && (
                        <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {projectBudgets.find(p => p.id === parentId)?.name}
                        </span>
                    )}
                    <button onClick={onClose} className="text-onyx-400 hover:text-cyan-900 p-2 hover:bg-onyx-50 rounded-xl"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Nombre</label>
                        <input type="text" required value={pName} onChange={e => setPName(e.target.value)}
                            placeholder={parentId ? 'Ej. Baño Superior' : 'Ej. Reforma Casa'}
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
                            <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Tipo de Proyecto</label>
                            <select value={pType} onChange={e => setPType(e.target.value as any)}
                                className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors">
                                <option value="REFORMA">Residencial / Reforma</option>
                                <option value="VIAJE">Viaje / Escapada</option>
                                <option value="EVENTO_FAMILIAR">Evento Familiar</option>
                                <option value="OTROS">Otro / Varios</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Fecha Clave (Objetivo)</label>
                            <input type="date" value={pKeyDate} onChange={e => setPKeyDate(e.target.value)}
                                className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Responsable Principal</label>
                        <select value={pResponsible} onChange={e => setPResponsible(e.target.value)}
                            className="w-full p-4 bg-onyx-50 border border-onyx-100 rounded-2xl font-bold text-sm outline-none focus:border-cyan-300 focus:bg-white transition-colors">
                            <option value="">Seleccionar responsable...</option>
                            {familyMembers.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                            ))}
                        </select>
                    </div>

                    {pType === 'EVENTO_FAMILIAR' && (
                        <div className="p-5 bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-cyan-500" />
                                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Detalles del Evento</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-1.5 ml-1">Lugar</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-onyx-300" />
                                        <input type="text" value={pLocation} onChange={e => setPLocation(e.target.value)} placeholder="Ej. Restaurante..."
                                            className="w-full pl-9 pr-4 py-3 bg-white border border-onyx-100 rounded-xl text-xs font-bold outline-none focus:border-cyan-300 transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-1.5 ml-1">Invitados</label>
                                    <div className="relative">
                                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-onyx-300" />
                                        <input type="text" value={pGuests} onChange={e => setPGuests(e.target.value)} placeholder="Ej. 20-25..."
                                            className="w-full pl-9 pr-4 py-3 bg-white border border-onyx-100 rounded-xl text-xs font-bold outline-none focus:border-cyan-300 transition-colors" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-onyx-400 uppercase tracking-widest mb-1.5 ml-1">Importancia / Urgencia</label>
                                <div className="flex gap-2">
                                    {(['BAJA', 'MEDIA', 'ALTA'] as const).map(imp => (
                                        <button key={imp} type="button" onClick={() => setPImportance(imp)}
                                            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${pImportance === imp ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm' : 'bg-white border-onyx-100 text-onyx-400 hover:border-cyan-200'}`}>
                                            {imp}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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
                            <label className="block text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3 text-right">Acento Visual</label>
                            <div className="flex gap-1.5 flex-wrap justify-end">
                                {PRESET_COLORS.map(c => (
                                    <button key={c} type="button" onClick={() => setPColor(c)}
                                        className={`w-6 h-6 rounded-full transition-all ${pColor === c ? 'scale-110 ring-2 ring-offset-2 ring-onyx-800 shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                        style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-lg transition-all bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                        {editId ? 'Guardar Cambios' : (parentId ? 'Crear Sub-Proyecto' : 'Crear Proyecto')}
                    </button>
                </form>
            </div>
        </div>
    );
};
