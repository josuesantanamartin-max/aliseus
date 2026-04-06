
import React, { useState, useMemo } from 'react';
import { Transaction, CategoryStructure } from '../../../../../types';
import { Search, ChevronLeft, ChevronRight, Filter, ChevronDown, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionExplorerProps {
    transactions: Transaction[];
    categories: CategoryStructure[];
    onNavigate: (app: string, tab?: string) => void;
    compact?: boolean;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ transactions, categories, onNavigate, compact = false }) => {
    const [exploreType, setExploreType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [exploreMonth, setExploreMonth] = useState<number>(new Date().getMonth());
    const [exploreYear, setExploreYear] = useState<number>(new Date().getFullYear());
    const [exploreScope, setExploreScope] = useState<'MONTH' | 'YEAR'>('MONTH');
    const [exploreCategory, setExploreCategory] = useState<string>('');
    const [exploreSubCategory, setExploreSubCategory] = useState<string>('');

    const availableCategories = categories.filter(c => c.type === exploreType);
    const availableSubCategories = availableCategories.find(c => c.name === exploreCategory)?.subCategories || [];

    const handlePrevDate = () => {
        if (exploreScope === 'MONTH') {
            if (exploreMonth === 0) {
                setExploreMonth(11);
                setExploreYear(prev => prev - 1);
            } else {
                setExploreMonth(prev => prev - 1);
            }
        } else {
            setExploreYear(prev => prev - 1);
        }
    };

    const handleNextDate = () => {
        if (exploreScope === 'MONTH') {
            if (exploreMonth === 11) {
                setExploreMonth(0);
                setExploreYear(prev => prev + 1);
            } else {
                setExploreMonth(prev => prev + 1);
            }
        } else {
            setExploreYear(prev => prev + 1);
        }
    };

    const explorerData = useMemo(() => {
        const periodTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            if (t.type !== exploreType) return false;
            if (t.category === 'Transferencia') return false;

            if (exploreScope === 'YEAR') {
                return d.getFullYear() === exploreYear;
            } else {
                return d.getFullYear() === exploreYear && d.getMonth() === exploreMonth;
            }
        });

        const totalPeriodAmount = periodTransactions.reduce((sum, t) => sum + t.amount, 0);

        let categoryTotalAmount = 0;
        if (exploreCategory) {
            categoryTotalAmount = periodTransactions
                .filter(t => t.category === exploreCategory)
                .reduce((sum, t) => sum + t.amount, 0);
        }

        const filteredTransactions = periodTransactions.filter(t => {
            if (exploreCategory && t.category !== exploreCategory) return false;
            if (exploreSubCategory && t.subCategory !== exploreSubCategory) return false;
            return true;
        });

        const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
        const percentageOfTotal = totalPeriodAmount > 0 ? (filteredTotal / totalPeriodAmount) * 100 : 0;
        const percentageOfCategory = categoryTotalAmount > 0 ? (filteredTotal / categoryTotalAmount) * 100 : 0;

        const topSpecific = [...filteredTransactions]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        return {
            totalPeriodAmount,
            categoryTotalAmount,
            filteredTotal,
            percentageOfTotal,
            percentageOfCategory,
            topSpecific
        };
    }, [transactions, exploreType, exploreMonth, exploreYear, exploreScope, exploreCategory, exploreSubCategory]);

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const currentPeriodLabel = exploreScope === 'MONTH'
        ? `${monthNames[exploreMonth]} ${exploreYear}`
        : `Año ${exploreYear}`;

    // COMPACT MODE: Just show recent transactions
    if (compact) {
        const recentTransactions = [...transactions]
            .filter(t => t.category !== 'Transferencia')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        return (
            <div className="bg-white p-8 rounded-Aliseus border border-aliseus-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-bold text-cyan-900 uppercase tracking-widest">Movimientos Recientes</h4>
                    <span className="text-[10px] font-semibold text-aliseus-400 uppercase tracking-widest">{recentTransactions.length} últimos</span>
                </div>
                <div className="space-y-3">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-aliseus-50/50 rounded-2xl hover:bg-aliseus-100/50 transition-all cursor-pointer group/item" onClick={() => onNavigate('finance', 'transactions')}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {t.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-aliseus-900 line-clamp-1">{t.description}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-semibold text-aliseus-400 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                            <span className="w-1 h-1 bg-aliseus-200 rounded-full"></span>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-400'}`}>{t.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-aliseus-900'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}{formatEUR(t.amount)}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-aliseus-400">
                            <Search className="w-8 h-8 opacity-20 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40">Sin movimientos</p>
                        </div>
                    )}
                </div>
                <button onClick={() => onNavigate('finance', 'transactions')} className="w-full mt-6 text-[10px] font-bold text-aliseus-600 bg-aliseus-50 border border-aliseus-100 rounded-xl uppercase tracking-widest hover:bg-cyan-900 hover:text-white hover:border-cyan-900 py-3 transition-all">
                    Ver todos los movimientos
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-10 rounded-Aliseus border border-aliseus-100 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-cyan-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-cyan-50 text-cyan-primary rounded-lg"><Search className="w-5 h-5" /></div>
                        Explorador de Movimientos
                    </h3>
                    <p className="text-xs font-semibold text-aliseus-400 mt-2 uppercase tracking-[0.15em]">Analítica detallada por categoría y fecha</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                    {/* Date Picker & Navigation */}
                    <div className="flex items-center gap-1 bg-aliseus-50 p-1 rounded-xl border border-aliseus-100 min-w-[200px] justify-between">
                        <button onClick={handlePrevDate} className="p-2 hover:bg-white rounded-lg transition-all text-aliseus-400 hover:text-aliseus-900"><ChevronLeft className="w-4 h-4" /></button>
                        <div className="flex-1 px-4 flex justify-center">
                            {exploreScope === 'MONTH' ? (
                                <input
                                    type="month"
                                    value={`${exploreYear}-${String(exploreMonth + 1).padStart(2, '0')}`}
                                    onChange={(e) => {
                                        const [y, m] = e.target.value.split('-');
                                        setExploreYear(parseInt(y));
                                        setExploreMonth(parseInt(m) - 1);
                                    }}
                                    className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest text-aliseus-600 outline-none cursor-pointer text-center w-full"
                                />
                            ) : (
                                <select
                                    value={exploreYear}
                                    onChange={(e) => setExploreYear(parseInt(e.target.value))}
                                    className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest text-aliseus-600 outline-none cursor-pointer text-center w-full appearance-none px-2"
                                >
                                    {[...new Set([new Date().getFullYear(), ...transactions.map(t => new Date(t.date).getFullYear()).filter(y => !isNaN(y))])].sort((a, b) => b - a).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <button onClick={handleNextDate} className="p-2 hover:bg-white rounded-lg transition-all text-aliseus-400 hover:text-aliseus-900"><ChevronRight className="w-4 h-4" /></button>
                    </div>

                    {/* Scope Selector */}
                    <div className="flex bg-aliseus-50 p-1 rounded-xl border border-aliseus-100">
                        <button onClick={() => setExploreScope('MONTH')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${exploreScope === 'MONTH' ? 'bg-white shadow-sm text-cyan-900' : 'text-aliseus-400 hover:text-aliseus-600'}`}>Mes</button>
                        <button onClick={() => setExploreScope('YEAR')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${exploreScope === 'YEAR' ? 'bg-white shadow-sm text-cyan-900' : 'text-aliseus-400 hover:text-aliseus-600'}`}>Año</button>
                    </div>

                    {/* Type Selector */}
                    <div className="flex bg-aliseus-50 p-1 rounded-xl border border-aliseus-100">
                        <button onClick={() => { setExploreType('EXPENSE'); setExploreCategory(''); setExploreSubCategory(''); }} className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${exploreType === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-aliseus-400 hover:text-aliseus-600'}`}>Gastos</button>
                        <button onClick={() => { setExploreType('INCOME'); setExploreCategory(''); setExploreSubCategory(''); }} className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${exploreType === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-aliseus-400 hover:text-aliseus-600'}`}>Ingresos</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-3">
                        <div className="relative">
                            <select
                                value={exploreCategory}
                                onChange={(e) => { setExploreCategory(e.target.value); setExploreSubCategory(''); }}
                                className="w-full p-4 pl-12 bg-aliseus-50/50 border border-aliseus-100 rounded-2xl font-semibold text-[13px] text-aliseus-700 appearance-none outline-none focus:ring-2 focus:ring-cyan-primary/10 hover:bg-aliseus-50 transition-all"
                            >
                                <option value="">Todas las categorías</option>
                                {availableCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aliseus-400 pointer-events-none" />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aliseus-400 pointer-events-none" />
                        </div>
                        {exploreCategory && availableSubCategories.length > 0 && (
                            <div className="relative animate-slide-up">
                                <select
                                    value={exploreSubCategory}
                                    onChange={(e) => setExploreSubCategory(e.target.value)}
                                    className="w-full p-4 pl-12 bg-white border border-aliseus-100 rounded-2xl font-semibold text-[13px] text-aliseus-700 appearance-none outline-none focus:ring-2 focus:ring-cyan-primary/10 transition-all shadow-sm"
                                >
                                    <option value="">Todas las subcategorías</option>
                                    {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-aliseus-300 rounded-full pointer-events-none"></div>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aliseus-400 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    <div className={`p-8 rounded-3xl border transition-all duration-700 ${exploreType === 'INCOME' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-red-50/30 border-red-100'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${exploreType === 'INCOME' ? 'text-emerald-700' : 'text-red-700'}`}>
                            {exploreCategory ? exploreCategory : 'Total Periodo'} {exploreSubCategory ? `> ${exploreSubCategory}` : ''}
                        </p>
                        <div className="flex items-baseline gap-2 mb-8">
                            <h4 className={`text-4xl font-bold tracking-tighter ${exploreType === 'INCOME' ? 'text-emerald-950' : 'text-red-950'}`}>
                                {formatEUR(explorerData.filteredTotal)}
                            </h4>
                            <span className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest">
                                de {formatEUR(explorerData.totalPeriodAmount)}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-aliseus-400 mb-2">
                                    <span>Impacto Periodo ({explorerData.percentageOfTotal.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-aliseus-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${exploreType === 'INCOME' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(explorerData.percentageOfTotal, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {exploreCategory && (
                                <div className="animate-fade-in">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-aliseus-400 mb-2">
                                        <span>Cuota Categoría ({explorerData.percentageOfCategory.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-aliseus-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 delay-200 ease-out ${exploreType === 'INCOME' ? 'bg-emerald-300' : 'bg-red-300'}`}
                                            style={{ width: `${Math.min(explorerData.percentageOfCategory, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-aliseus-50/50 rounded-3xl p-8 border border-aliseus-100 flex flex-col">
                    <div className="flex justify-between items-center mb-8 px-2">
                        <h4 className="text-[11px] font-bold text-cyan-900 uppercase tracking-[0.2em] flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-cyan-primary" /> Movimientos Destacados
                        </h4>
                        <span className="text-[10px] font-semibold text-aliseus-400 uppercase tracking-widest">{explorerData.topSpecific.length} registros</span>
                    </div>

                    <div className="flex-1 space-y-3">
                        {explorerData.topSpecific.length > 0 ? (
                            explorerData.topSpecific.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-aliseus-100 shadow-sm hover:shadow-md hover:border-cyan-primary/20 transition-all cursor-pointer group/item" onClick={() => onNavigate('finance', 'transactions')}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-transform group-hover/item:scale-110 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-aliseus-900 line-clamp-1 mb-0.5">{t.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-semibold text-aliseus-400 uppercase tracking-widest">{new Date(t.date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-aliseus-200 rounded-full"></span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-400'}`}>{t.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-base font-bold tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-aliseus-900'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'}{formatEUR(t.amount)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-aliseus-400 py-16">
                                <Search className="w-12 h-12 opacity-10 mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Sin resultados</p>
                                <p className="text-[10px] font-semibold opacity-30 mt-1 max-w-[200px] text-center">Prueba a cambiar el periodo o los filtros</p>
                            </div>
                        )}
                    </div>

                    {explorerData.topSpecific.length > 0 && (
                        <button onClick={() => onNavigate('finance', 'transactions')} className="w-full mt-8 text-[11px] font-bold text-aliseus-600 bg-white border border-aliseus-200 rounded-xl uppercase tracking-widest hover:bg-cyan-900 hover:text-white hover:border-cyan-900 py-4 transition-all shadow-sm">
                            Ver historial completo
                        </button>
                    )}
                </div>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-soft/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
};

export default TransactionExplorer;
