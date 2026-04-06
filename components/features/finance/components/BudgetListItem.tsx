import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface BudgetListItemProps {
    item: any;
    onEdit: (budget: any) => void;
    onDelete: (id: string) => void;
}

export const BudgetListItem: React.FC<BudgetListItemProps> = ({ item, onEdit, onDelete }) => (
    <div className="bg-white p-5 rounded-2xl border border-aliseus-100 hover:shadow-md transition-all duration-300 group flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {item.subCategory ? (
                        <span className="font-bold text-base text-cyan-900">{item.subCategory}</span>
                    ) : (
                        <span className="font-bold text-base text-cyan-900 italic opacity-50">Presupuesto General</span>
                    )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-2 hover:bg-aliseus-50 rounded-lg text-aliseus-400 hover:text-cyan-900"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-aliseus-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-aliseus-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${item.isExceeded ? 'bg-red-500' : 'bg-cyan-500'}`}
                        style={{ width: `${Math.min(item.percentageUsed, 100)}%` }}
                    />
                </div>
                <span className={`text-xs font-bold w-12 text-right ${item.isExceeded ? 'text-red-600' : 'text-aliseus-500'}`}>{item.percentageUsed.toFixed(0)}%</span>
            </div>
        </div>

        <div className="flex items-center gap-8 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-aliseus-50 pt-4 sm:pt-0 sm:pl-6 justify-between sm:justify-end">
            <div>
                <p className="text-[9px] font-bold text-aliseus-400 uppercase tracking-widest text-right">Gastado</p>
                <p className="text-lg font-bold text-cyan-900">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.spent)}</p>
            </div>
            <div>
                <p className="text-[9px] font-bold text-aliseus-400 uppercase tracking-widest text-right">Límite</p>
                <p className="text-lg font-bold text-cyan-900">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.effectiveLimit)}</p>
            </div>
        </div>
    </div>
);
