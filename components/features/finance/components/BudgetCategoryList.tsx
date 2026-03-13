import React from 'react';
import { Home, Utensils, Car, Zap, Coffee, HeartPulse, ShoppingBag, HelpCircle, AlertCircle } from 'lucide-react';

interface CategoryStat {
    name: string;
    totalLimit: number;
    totalSpent: number;
    isExceeded: boolean;
    percentage: number;
    budgetCount: number;
    hasMonthlyLimit: boolean;
    hasBudgets: boolean;
}

interface BudgetCategoryListProps {
    categoryStats: CategoryStat[];
    selectedCategoryName: string | null;
    setSelectedCategoryName: (name: string) => void;
    formatEUR: (amount: number) => string;
}

export const getCategoryIcon = (catName: string) => {
    switch (catName) {
        case 'Vivienda': return <Home className="w-5 h-5" />;
        case 'Alimentación': return <Utensils className="w-5 h-5" />;
        case 'Transporte': return <Car className="w-5 h-5" />;
        case 'Servicios': return <Zap className="w-5 h-5" />;
        case 'Ocio': return <Coffee className="w-5 h-5" />;
        case 'Salud': return <HeartPulse className="w-5 h-5" />;
        case 'Compras': return <ShoppingBag className="w-5 h-5" />;
        default: return <HelpCircle className="w-5 h-5" />;
    }
};

export const BudgetCategoryList: React.FC<BudgetCategoryListProps> = ({
    categoryStats,
    selectedCategoryName,
    setSelectedCategoryName,
    formatEUR
}) => {
    return (
        <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-onyx-100">
                <h3 className="font-bold text-cyan-900 text-lg">Categorías</h3>
                <span className="text-xs font-bold bg-onyx-100 px-2 py-1 rounded-lg text-onyx-500">
                    {categoryStats.filter(c => c.hasBudgets).length} Activas
                </span>
            </div>

            <div className="space-y-3 h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {categoryStats.map(stat => {
                    const isSelected = selectedCategoryName === stat.name;
                    return (
                        <div
                            key={stat.name}
                            onClick={() => setSelectedCategoryName(stat.name)}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden ${isSelected ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white text-cyan-900 border-onyx-100 hover:border-cyan-200 hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-onyx-50 text-onyx-500'}`}>
                                        {getCategoryIcon(stat.name)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm leading-tight">{stat.name}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/50' : 'text-onyx-400'}`}>
                                            {stat.budgetCount} {stat.budgetCount === 1 ? 'Límite' : 'Límites'}
                                        </p>
                                    </div>
                                </div>
                                {stat.isExceeded && (
                                    <div className="p-1.5 bg-red-500/20 rounded-full animate-pulse">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-end text-xs font-bold">
                                    <span className={isSelected ? 'text-white/80' : 'text-onyx-600'}>{formatEUR(stat.totalSpent)}</span>
                                    {stat.hasMonthlyLimit ? (
                                        <span className={isSelected ? 'text-white/40' : 'text-onyx-300'}>/ {formatEUR(stat.totalLimit)}</span>
                                    ) : (
                                        <span className={isSelected ? 'text-white/30' : 'text-onyx-300'}>Mes Actual</span>
                                    )}
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${stat.isExceeded ? 'bg-red-500' : isSelected ? 'bg-cyan-400' : 'bg-cyan-900'}`}
                                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
