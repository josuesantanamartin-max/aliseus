
import React from 'react';
import { Goal } from '../../../../../types';
import { Target, Plane, Car, Home, Heart, Baby, PiggyBank, TrendingUp, Clock, ArrowRight } from 'lucide-react';

interface ActiveGoalsWidgetProps {
    goals: Goal[];
    onNavigate: (app: string, tab?: string) => void;
}

const formatEUR = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

const ActiveGoalsWidget: React.FC<ActiveGoalsWidgetProps> = ({ goals, onNavigate }) => {
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).sort((a, b) => {
        const pA = a.currentAmount / a.targetAmount;
        const pB = b.currentAmount / b.targetAmount;
        return pB - pA;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold text-cyan-900 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Target className="w-5 h-5" /></div>
                    Metas de Ahorro
                </h3>
                <button onClick={() => onNavigate('finance', 'goals')} className="text-xs font-bold text-onyx-400 hover:text-cyan-900 flex items-center gap-2 transition-colors group">
                    Ver todo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {activeGoals.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {activeGoals.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const remaining = goal.targetAmount - goal.currentAmount;

                        let GoalIcon = Target;
                        const lowerName = goal.name.toLowerCase();
                        if (lowerName.includes('viaje')) GoalIcon = Plane;
                        else if (lowerName.includes('coche')) GoalIcon = Car;
                        else if (lowerName.includes('casa')) GoalIcon = Home;
                        else if (lowerName.includes('boda')) GoalIcon = Heart;
                        else if (lowerName.includes('bebé')) GoalIcon = Baby;
                        else if (lowerName.includes('fondo') || lowerName.includes('ahorro')) GoalIcon = PiggyBank;

                        let monthlyNeeded = 0;
                        if (goal.deadline) {
                            const today = new Date();
                            const d = new Date(goal.deadline);
                            const months = (d.getFullYear() - today.getFullYear()) * 12 + (d.getMonth() - today.getMonth());

                            if (months > 0 && remaining > 0) {
                                monthlyNeeded = remaining / months;
                            } else if (remaining > 0) {
                                monthlyNeeded = remaining;
                            }
                        }

                        return (
                            <div key={goal.id} onClick={() => onNavigate('finance', 'goals')} className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-onyx-100 dark:border-onyx-800 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 min-h-[160px] h-full flex flex-col">
                                <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-purple-50/20 dark:from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center gap-5 md:w-1/3">
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                                        <GoalIcon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-cyan-900 dark:text-white leading-none mb-1.5">{goal.name}</h4>
                                        <div className="flex items-center gap-2">
                                            {goal.deadline ? (
                                                <p className="text-xs font-bold text-onyx-400 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(goal.deadline).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).toUpperCase()}
                                                </p>
                                            ) : (
                                                <p className="text-xs font-bold text-onyx-300 flex items-center gap-1.5 italic">
                                                    <Clock className="w-3.5 h-3.5" /> Sin fecha
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-onyx-400 dark:text-onyx-500 uppercase tracking-widest mb-1">Ahorrado</p>
                                                <p className="text-3xl font-black text-cyan-900 dark:text-white tracking-tighter">{formatEUR(goal.currentAmount)}</p>
                                            </div>
                                            <div className="h-10 w-px bg-onyx-100 self-end mb-1"></div>
                                            <div>
                                                <p className="text-[10px] font-black text-onyx-400 uppercase tracking-widest mb-1">Objetivo</p>
                                                <p className="text-xl font-bold text-onyx-400 tracking-tight">{formatEUR(goal.targetAmount)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800">{progress.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-onyx-50 dark:bg-onyx-700 h-3 rounded-full overflow-hidden border border-onyx-100/50 dark:border-onyx-600/50 relative">
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.3)]" style={{ width: `${progress}%` }}></div>
                                    </div>

                                    {monthlyNeeded > 0 && (
                                        <p className="text-[11px] font-bold text-purple-600 flex items-center gap-1.5 bg-purple-50/30 w-fit px-2 py-0.5 rounded-md">
                                            <TrendingUp className="w-3 h-3" /> Faltan {formatEUR(remaining)} • Necesitas {formatEUR(monthlyNeeded)}/mes
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-onyx border border-onyx-100 text-center shadow-sm">
                    <div className="w-16 h-16 bg-onyx-50 text-onyx-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-onyx-900 mb-2">No tienes metas activas</h4>
                    <p className="text-sm text-onyx-400 mb-8 max-w-[280px] mx-auto">Comienza a ahorrar para tus sueños definiendo tu primer objetivo financiero.</p>
                    <button onClick={() => onNavigate('finance', 'goals')} className="bg-cyan-900 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-cyan-950 transition-all">Crear meta</button>
                </div>
            )}
        </div>
    );
};

export default ActiveGoalsWidget;
