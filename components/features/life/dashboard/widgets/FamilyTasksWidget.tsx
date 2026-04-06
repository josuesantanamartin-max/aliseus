import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { ListTodo, User, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FamilyTasksWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const FamilyTasksWidget: React.FC<FamilyTasksWidgetProps> = ({ onNavigate }) => {
    const { familyMembers = [] } = useLifeStore();

    // Calcular tareas por miembro (simulado - en producción vendría de un store de tareas)
    const tasksData = useMemo(() => {
        // Por ahora mostraremos un placeholder
        // En producción, esto vendría de un store de tareas familiares
        return familyMembers.map(member => ({
            member,
            tasks: [],
            completedToday: 0
        }));
    }, [familyMembers]);

    const totalTasks = tasksData.reduce((sum, data) => sum + data.tasks.length, 0);
    const completedToday = tasksData.reduce((sum, data) => sum + data.completedToday, 0);

    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-aliseus-800 hover:shadow-lg transition-all h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <ListTodo className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Tareas Familiares
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {completedToday} completadas hoy
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('life', 'family')}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                    Gestionar
                </button>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-4 border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                            Tareas Pendientes
                        </p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                            {totalTasks}
                        </p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-aliseus-900 flex items-center justify-center shadow-inner">
                        <ListTodo className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Family Members List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
                {familyMembers.length === 0 ? (
                    <div className="text-center py-8">
                        <User className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            No hay miembros familiares
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Añade miembros para asignar tareas
                        </p>
                    </div>
                ) : (
                    familyMembers.map((member) => {
                        const memberData = tasksData.find(d => d.member.id === member.id);
                        const pendingTasks = memberData?.tasks.length || 0;
                        const completedTasks = memberData?.completedToday || 0;

                        return (
                            <div
                                key={member.id}
                                onClick={() => onNavigate('life', 'family')}
                                className="p-4 rounded-xl border border-gray-200 dark:border-aliseus-700 bg-gray-50 dark:bg-aliseus-800 hover:bg-white dark:hover:bg-aliseus-700 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                                            <span className="text-sm font-black text-white">
                                                {member.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Member Info */}
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                {member.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {member.role}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tasks Count */}
                                    <div className="text-right">
                                        {pendingTasks > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                                                    {pendingTasks}
                                                </span>
                                            </div>
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        )}
                                        {completedTasks > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                +{completedTasks} hoy
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Placeholder Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/50">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 <strong>Próximamente:</strong> Sistema completo de tareas familiares con asignación y seguimiento
                </p>
            </div>
        </div>
    );
};

export default FamilyTasksWidget;
