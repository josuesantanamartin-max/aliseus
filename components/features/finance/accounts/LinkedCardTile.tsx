import React from 'react';
import { Account } from '@/types';
import { Wifi, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { formatEUR } from './accountConstants';

interface LinkedCardTileProps {
    card: Account;
    onViewTransactions: (accountId: string) => void;
    onEdit: (account: Account) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onSettle: (e: React.MouseEvent, card: Account) => void;
}

export const LinkedCardTile: React.FC<LinkedCardTileProps> = ({
    card, onViewTransactions, onEdit, onDelete, onSettle,
}) => {
    const isCredit = card.type === 'CREDIT';
    const debt = isCredit ? Math.abs(card.balance) : 0;
    const util = isCredit && card.creditLimit ? (debt / card.creditLimit) * 100 : 0;

    return (
        <div
            onClick={() => onViewTransactions(card.id)}
            className={`relative overflow-hidden rounded-onyx shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer group h-40 flex flex-col justify-between p-6 ${isCredit ? 'bg-cyan-900 text-white border border-onyx-800' : 'bg-emerald-950 text-white border border-emerald-900'}`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-12 -mt-12 transition-all duration-700 group-hover:scale-150 ${isCredit ? 'bg-cyan-500' : 'bg-emerald-400'}`} />
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Wifi className="w-4 h-4 rotate-90 text-white/40" />
                    <div className="w-10 h-7 bg-white/10 rounded-lg border border-white/10 flex items-center justify-center"><div className="w-5 h-4 bg-white/20 rounded-md" /></div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">{card.cardNetwork || (isCredit ? 'CREDIT' : 'DEBIT')}</p>
                    {card.bankName && <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">{card.bankName}</p>}
                </div>
            </div>
            <div className="relative z-10">
                <h4 className="font-bold text-base tracking-wide text-white truncate mb-1">{card.name}</h4>
                <p className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">•••• •••• {card.id.substring(0, 4)}</p>
            </div>
            <div className="relative z-10 flex justify-between items-end">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1.5">{isCredit ? 'Deuda' : 'Saldo'}</p>
                    <p className={`text-2xl font-bold tracking-tight ${isCredit && debt > 0 ? 'text-red-300' : 'text-white'}`}>
                        {isCredit && debt > 0 ? '-' : ''}{formatEUR(isCredit ? debt : card.balance)}
                    </p>
                    {isCredit && card.creditLimit && <p className="text-[9px] text-white/30 mt-0.5">Límite: {formatEUR(card.creditLimit)}</p>}
                </div>
                <div className="flex items-center gap-3 -mb-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button onClick={e => { e.stopPropagation(); onEdit(card); }} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-md border border-white/10"><Pencil className="w-4 h-4" /></button>
                    {isCredit && debt > 0 && <button onClick={e => onSettle(e, card)} className="p-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors border border-cyan-400 shadow-lg shadow-cyan-500/20"><ArrowRightLeft className="w-4 h-4" /></button>}
                    <button onClick={e => onDelete(e, card.id)} className="p-2.5 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-colors border border-red-500/20"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>
            {isCredit && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-cyan-950/20"><div className={`h-full transition-all duration-1000 ${util > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`} style={{ width: `${Math.min(util, 100)}%` }} /></div>}
        </div>
    );
};
