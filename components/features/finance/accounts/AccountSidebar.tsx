import React from 'react';
import { Account } from '@/types';
import { GripVertical, TrendingUp } from 'lucide-react';
import { getTypeConfig, colorMap, formatEUR } from './accountConstants';
import { ProgressiveTooltip } from '@/components/common/ProgressiveTooltip';

interface AccountSidebarProps {
    accounts: Account[];
    selectedAccountId: string | null;
    onSelectAccount: (id: string) => void;
    // Drag
    dragIndex: number | null;
    dragOverIndex: number | null;
    onDragStart: (e: React.DragEvent, i: number) => void;
    onDragOver: (e: React.DragEvent, i: number) => void;
    onDrop: (e: React.DragEvent, i: number) => void;
    onDragEnd: () => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
    accounts, selectedAccountId, onSelectAccount,
    dragIndex, dragOverIndex,
    onDragStart, onDragOver, onDrop, onDragEnd,
}) => (
    <div className="md:col-span-4 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-aliseus-100">
            <h3 className="font-bold text-cyan-900 text-lg">Tus Cuentas</h3>
            <span className="text-xs font-bold bg-aliseus-100 px-2 py-1 rounded-lg text-aliseus-500">{accounts.length} Activas</span>
        </div>
        <div className="space-y-3">
            {accounts.map((account, index) => {
                const isSelected = selectedAccountId === account.id;
                const isDraggedOver = dragOverIndex === index && dragIndex !== index;
                const cfg = getTypeConfig(account.type);
                const Icon = cfg.icon;
                
                const cardContent = (
                    <div key={account.id} draggable
                        onDragStart={e => onDragStart(e, index)} onDragOver={e => onDragOver(e, index)}
                        onDrop={e => onDrop(e, index)} onDragEnd={onDragEnd}
                        onClick={() => onSelectAccount(account.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden select-none
                            ${isSelected ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white text-cyan-900 border-aliseus-100 hover:border-cyan-200 hover:bg-slate-50'}
                            ${isDraggedOver ? 'border-cyan-400 border-2 scale-[1.01] shadow-md shadow-cyan-200' : ''}
                            ${dragIndex === index ? 'opacity-50' : ''}`}>
                        <div className={`absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ${isSelected ? 'text-white/30' : 'text-aliseus-300'}`}>
                            <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex justify-between items-center mb-1 pl-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : `${colorMap[cfg.color].split(' ').slice(0, 2).join(' ')}`}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    {account.bankName && <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/50' : 'text-aliseus-400'}`}>{account.bankName}</p>}
                                    <p className="font-semibold text-sm leading-tight line-clamp-1">{account.name}</p>
                                    <p className={`text-[10px] ${isSelected ? 'text-white/40' : 'text-aliseus-300'}`}>{cfg.label}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right mt-2 pl-3">
                            <p className="font-bold text-lg leading-none">{formatEUR(account.balance)}</p>
                            {account.isRemunerated && account.tae && <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>{account.tae}% TAE</p>}
                        </div>
                        {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />}
                    </div>
                );

                let finalContent = cardContent;
                if (index === 0) {
                    finalContent = (
                        <ProgressiveTooltip
                            key={account.id}
                            id="tooltip-accounts-sidebar"
                            title="Gestiona tus Cuentas"
                            description="Selecciona una cuenta para ver sus transacciones, o arrástrala para reordenarla."
                            position="right"
                        >
                            {cardContent}
                        </ProgressiveTooltip>
                    );
                }
                return cardContent;
            })}
        </div>
    </div>
);
