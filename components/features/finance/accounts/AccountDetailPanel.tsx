import React from 'react';
import { Account } from '@/types';
import { Pencil, Trash2, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight, CreditCard, Plus, Landmark } from 'lucide-react';
import { getTypeLabel, formatEUR } from './accountConstants';
import { LinkedCardTile } from './LinkedCardTile';

interface AccountStats {
    monthDiff: number;
    yearDiff: number;
    isMonthUp: boolean;
    isYearUp: boolean;
    prevMonthBalance: number;
    yearStartBalance: number;
}

interface AccountDetailPanelProps {
    account: Account | undefined;
    stats: AccountStats | null;
    linkedCards: Account[];
    onEdit: (account: Account) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onViewTransactions: (accountId: string) => void;
    onSettle: (e: React.MouseEvent, card: Account) => void;
    onOpenNew: () => void;
}

export const AccountDetailPanel: React.FC<AccountDetailPanelProps> = ({
    account, stats, linkedCards,
    onEdit, onDelete, onViewTransactions, onSettle, onOpenNew,
}) => {
    if (!account) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-onyx-300 min-h-[400px]">
                <Landmark className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-sm">Selecciona una cuenta para ver detalles</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-onyx-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <p className="text-xs font-bold text-onyx-400 uppercase tracking-[0.2em] mb-1">{account.bankName || getTypeLabel(account.type)}</p>
                        <h3 className="text-3xl lg:text-4xl font-black text-cyan-900 tracking-tight mb-2">{account.name}</h3>
                        {account.isRemunerated && account.tae && (
                            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                <TrendingUp className="w-3 h-3" /> Remunerada {account.tae}% TAE
                            </div>
                        )}
                        {(account as any).iban && <p className="text-xs font-mono text-onyx-300 mt-2">{(account as any).iban}</p>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => onEdit(account)} className="p-3 bg-onyx-50 hover:bg-onyx-100 rounded-xl text-onyx-500 hover:text-cyan-900 transition-colors"><Pencil className="w-5 h-5" /></button>
                        <button onClick={e => onDelete(e, account.id)} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </div>
                {stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative z-10">
                        {[
                            { label: 'Vs Mes Pasado', diff: stats.monthDiff, up: stats.isMonthUp, prev: stats.prevMonthBalance, prevLabel: 'Final Mes Pasado' },
                            { label: 'Vs Año Anterior', diff: stats.yearDiff, up: stats.isYearUp, prev: stats.yearStartBalance, prevLabel: 'Inicio de Año' },
                        ].map(s => (
                            <div key={s.label} className="bg-onyx-50/50 p-4 md:p-6 rounded-2xl border border-onyx-100/50">
                                <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-3">{s.label}</p>
                                <div className="flex items-end justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold text-onyx-400 mb-1">{s.prevLabel}</p>
                                        <p className="text-base md:text-lg font-bold text-onyx-600">{formatEUR(s.prev)}</p>
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs md:text-sm font-black px-3 py-1.5 rounded-lg shrink-0 ${s.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {s.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {formatEUR(Math.abs(s.diff))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-between items-end mt-8 pt-8 border-t border-onyx-100 relative z-10">
                    <div>
                        <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-2">Saldo Actual</p>
                        <h2 className={`text-4xl lg:text-6xl font-black tracking-tighter ${account.type === 'CREDIT' && account.balance < 0 ? 'text-red-500' : 'text-cyan-900'}`}>{formatEUR(account.balance)}</h2>
                    </div>
                    <button onClick={() => onViewTransactions(account.id)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-primary hover:text-cyan-700 transition-colors">
                        Ver Movimientos <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            </div>

            {/* Associated cards */}
            {linkedCards.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-onyx-400 uppercase tracking-widest">Tarjetas vinculadas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {linkedCards.map(card => (
                            <LinkedCardTile
                                key={card.id}
                                card={card}
                                onViewTransactions={onViewTransactions}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onSettle={onSettle}
                            />
                        ))}
                    </div>
                </div>
            )}
            {linkedCards.length === 0 && account.type !== 'CREDIT' && account.type !== 'DEBIT' && (
                <div className="bg-onyx-50/30 p-8 rounded-3xl border border-dashed border-onyx-100 flex flex-col items-center justify-center text-center">
                    <CreditCard className="w-10 h-10 text-onyx-200 mb-3" />
                    <p className="text-xs font-bold text-onyx-400 uppercase tracking-widest">No hay tarjetas asociadas</p>
                    <button onClick={onOpenNew} className="mt-3 text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Añadir tarjeta
                    </button>
                </div>
            )}
        </div>
    );
};
