import React from 'react';
import { ProjectBudget, Transaction } from '../../../../../types';
import { Home, CheckCircle, Activity, Calendar } from 'lucide-react';
import { useCurrency } from '../../../../../hooks/useCurrency';

interface ActiveProjectsWidgetProps {
    projects: ProjectBudget[];
    transactions: Transaction[];
    onViewProject: (id: string) => void;
}

const ActiveProjectsWidget: React.FC<ActiveProjectsWidgetProps> = ({ projects, transactions, onViewProject }) => {
    const { formatPrice: formatEUR } = useCurrency();

    const activeProjects = projects.filter(p => p.status === 'ACTIVE');

    if (activeProjects.length === 0) {
        return null;
    }

    const getSpentAmount = (projectId: string) => {
        return transactions
            .filter(t => t.type === 'EXPENSE' && t.projectId === projectId)
            .reduce((sum, t) => sum + t.amount, 0);
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-onyx-100 shadow-sm hover:shadow-lg transition-all flex flex-col relative overflow-hidden group/widget">
            <div className="flex justify-between items-center mb-4 shrink-0 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl shadow-inner group-hover/widget:scale-110 transition-transform">
                            <Home className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-cyan-900 tracking-tight">Proyectos Activos</h3>
                    </div>
                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest">
                        Reformas, Eventos y Más
                    </p>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 mt-2">
                {activeProjects.map(project => {
                    const spent = getSpentAmount(project.id);
                    const percentage = project.limit > 0 ? (spent / project.limit) * 100 : 0;
                    const isExceeded = project.limit > 0 && spent > project.limit;

                    return (
                        <div
                            key={project.id}
                            onClick={() => onViewProject(project.id)}
                            className="p-4 bg-onyx-50/50 rounded-2xl border border-onyx-100 hover:bg-white hover:border-cyan-200 hover:shadow-md cursor-pointer transition-all flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" style={{ backgroundColor: project.color || '#06b6d4' }}></div>

                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm text-cyan-900">{project.name}</h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-cyan-50 text-cyan-600">En Curso</span>
                            </div>

                            <div className="flex justify-between items-end mt-2">
                                <div>
                                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Gastado</p>
                                    <p className="text-lg font-black text-cyan-900 tracking-tighter">{formatEUR(spent)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-onyx-400 uppercase tracking-widest mb-1">Presupuesto</p>
                                    <p className="text-xs font-bold text-onyx-500">{project.limit > 0 ? formatEUR(project.limit) : 'Sin límite'}</p>
                                </div>
                            </div>

                            {project.limit > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className={isExceeded ? 'text-red-500' : 'text-cyan-600'}>{percentage.toFixed(1)}%</span>
                                        <span className="text-onyx-400">Restante: {formatEUR(Math.max(0, project.limit - spent))}</span>
                                    </div>
                                    <div className="w-full bg-onyx-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isExceeded ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-cyan-500'}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActiveProjectsWidget;
