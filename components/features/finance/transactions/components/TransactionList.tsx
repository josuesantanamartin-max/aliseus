
import React from 'react';
import { Transaction, Account } from '../../../../../types';
import { Pencil, Trash2, Repeat, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Search, PlusCircle } from 'lucide-react';
import { AnimatedList, AnimatedListItem } from '../../../../common/animations/AnimatedList';
import { useUserStore } from '../../../../../store/useUserStore';
import { useCurrency } from '../../../../../hooks/useCurrency';

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (t: Transaction) => void;
    onDelete: (id: string) => void;
    // We need to know account names for transfer display if needed, but for now we have accountId
    accounts: Account[];
}


const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, accounts }) => {
    const { setQuickAction } = useUserStore();
    const { formatPrice } = useCurrency();

    // Group by date
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const date = transaction.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <AnimatedList className="space-y-12" staggerDelay={0.1}>
            {sortedDates.map(date => (
                <AnimatedListItem key={date}>
                    <div className="animate-fade-in group/day">
                        <div className="flex items-center gap-6 mb-8 px-2">
                            <div className="h-[1px] flex-1 bg-onyx-100/50"></div>
                            <h4 className="text-[11px] font-bold text-onyx-400 uppercase tracking-[0.3em] whitespace-nowrap bg-white px-6 py-2 rounded-full border border-onyx-100 shadow-sm transition-all group-hover/day:border-cyan-100 group-hover/day:text-cyan-600 group-hover/day:scale-105">
                                {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h4>
                            <div className="h-[1px] flex-1 bg-onyx-100/50"></div>
                        </div>

                        <div className="bg-white rounded-onyx shadow-sm border border-onyx-100 overflow-hidden divide-y divide-onyx-50 relative">
                            {groupedTransactions[date].map((t: Transaction) => (
                                <div key={t.id} onClick={() => onEdit(t)} className="p-8 hover:bg-onyx-50/50 transition-all duration-300 group/item flex flex-col sm:flex-row items-center gap-8 cursor-pointer border-l-4 border-l-transparent hover:border-l-cyan-600">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover/item:scale-110 shadow-sm border ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                        t.category === 'Transferencia' ? 'bg-cyan-50 text-cyan-600 border-cyan-100/50' :
                                            'bg-red-50 text-red-600 border-red-100/50'
                                        }`}>
                                        {t.category === 'Transferencia' ? <ArrowRightLeft className="w-7 h-7" /> : t.type === 'INCOME' ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-4 mb-3">
                                            <span className="font-bold text-cyan-900 text-xl tracking-tight group-hover/item:text-cyan-600 transition-colors">{t.description}</span>
                                            {t.isRecurring && (
                                                <div className="flex items-center gap-2 px-2.5 py-1 bg-cyan-50 text-cyan-600 rounded-lg border border-cyan-100 self-center sm:self-auto">
                                                    <Repeat className="w-3 h-3 animate-reverse-spin" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Recurrente</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-onyx-50 border border-onyx-100 rounded-xl font-bold text-[10px] text-onyx-500 uppercase tracking-widest group-hover/item:bg-white transition-colors">
                                                {t.category}
                                                {t.subCategory && <span className="opacity-40">/</span>}
                                                {t.subCategory && <span>{t.subCategory}</span>}
                                            </div>
                                            <div className="text-onyx-400 font-bold text-[11px] flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-onyx-100/50 group-hover/item:border-cyan-100 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-cyan-500/30 group-hover/item:bg-cyan-500 transition-colors animate-pulse"></div>
                                                {accounts.find(a => a.id === t.accountId)?.name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount & Actions */}
                                    <div className="flex items-center gap-10 pr-2">
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-cyan-900'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'}{formatPrice(t.amount, 2)}
                                            </p>
                                            <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity">Ver Detalle</p>
                                        </div>
                                        <div className="flex gap-3 opacity-0 group-hover/item:opacity-100 translate-x-4 group-hover/item:translate-x-0 transition-all duration-500">
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="p-3.5 bg-white hover:bg-red-50 rounded-xl text-onyx-400 hover:text-red-500 border border-onyx-100 hover:border-red-100 transition-all shadow-sm active:scale-95"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedListItem>
            ))}
            {sortedDates.length === 0 && (
                <div className="text-center py-40 bg-white rounded-onyx border border-onyx-100 border-dashed group/empty">
                    <div className="w-24 h-24 bg-onyx-50 rounded-full flex items-center justify-center mx-auto mb-8 text-onyx-300 group-hover/empty:scale-110 group-hover/empty:bg-cyan-50 group-hover/empty:text-cyan-600 transition-all duration-500">
                        <Search className="w-10 h-10" />
                    </div>
                    <p className="text-2xl font-bold text-cyan-900 tracking-tight">No se encontraron movimientos</p>
                    <p className="text-xs font-bold text-onyx-400 mt-4 mb-8 uppercase tracking-[0.2em]">Intenta ajustar los filtros o el periodo de búsqueda</p>
                    <button
                        onClick={() => setQuickAction({ type: 'ADD_EXPENSE', timestamp: Date.now() })}
                        className="px-8 py-4 bg-cyan-900 hover:bg-cyan-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
                    >
                        <PlusCircle className="w-5 h-5 text-cyan-400" />
                        Añadir Transacción
                    </button>
                </div>
            )}
        </AnimatedList>
    );
};


export default TransactionList;
