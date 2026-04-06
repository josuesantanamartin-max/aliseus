import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Plane, Calendar, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

interface UpcomingTripsWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const UpcomingTripsWidget: React.FC<UpcomingTripsWidgetProps> = ({ onNavigate }) => {
    const { trips = [] } = useLifeStore();

    // Obtener próximos 3 viajes
    const upcomingTrips = useMemo(() => {
        const today = new Date();
        return trips
            .filter(trip => new Date(trip.startDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 3);
    }, [trips]);

    const getDaysUntil = (dateString: string) => {
        const today = new Date();
        const tripDate = new Date(dateString);
        const diffTime = tripDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getBudgetStatus = (budget: number, spent: number) => {
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        if (percentage > 100) return { color: 'text-red-600 bg-red-100 dark:bg-red-900/30', status: 'Excedido' };
        if (percentage > 80) return { color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', status: 'Alto' };
        return { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', status: 'OK' };
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-aliseus-800 hover:shadow-lg transition-all h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Plane className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Próximos Viajes
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {upcomingTrips.length} viajes planificados
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('life', 'trips')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Ver todos
                </button>
            </div>

            {/* Trips List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
                {upcomingTrips.length === 0 ? (
                    <div className="text-center py-8">
                        <Plane className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            No hay viajes próximos
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Planifica tu próxima aventura
                        </p>
                    </div>
                ) : (
                    upcomingTrips.map((trip) => {
                        const daysUntil = getDaysUntil(trip.startDate);
                        const budgetStatus = getBudgetStatus(trip.budget, trip.spent);
                        const isUrgent = daysUntil <= 7;

                        return (
                            <div
                                key={trip.id}
                                onClick={() => onNavigate('life', 'trips')}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${isUrgent
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50'
                                        : 'bg-gray-50 dark:bg-aliseus-800 border-gray-200 dark:border-aliseus-700'
                                    } hover:shadow-md`}
                            >
                                {/* Trip Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {trip.destination}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {new Date(trip.startDate).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg ${isUrgent ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-aliseus-700'
                                        }`}>
                                        <span className={`text-xs font-black ${isUrgent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil}d`}
                                        </span>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="flex items-center justify-between p-2 bg-white dark:bg-aliseus-900 rounded-lg border border-gray-200 dark:border-aliseus-700">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {trip.spent.toFixed(0)}€ / {trip.budget.toFixed(0)}€
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${budgetStatus.color}`}>
                                        {budgetStatus.status}
                                    </span>
                                </div>

                                {/* Checklist Progress */}
                                {trip.checklist && trip.checklist.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    Preparación
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                {trip.checklist.filter(item => item.completed).length}/{trip.checklist.length}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 bg-gray-200 dark:bg-aliseus-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all"
                                                style={{
                                                    width: `${(trip.checklist.filter(item => item.completed).length / trip.checklist.length) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default UpcomingTripsWidget;
