import React, { useMemo } from 'react';
import { DashboardDataProps } from '../WidgetRegistry';
import { getUpcomingPayments, getTotalUpcomingPayments, getUrgentPayments } from '../../../utils/upcomingPayments';
import { Calendar, AlertTriangle, CreditCard, Repeat, DollarSign } from 'lucide-react';

const UpcomingPaymentsWidget: React.FC<DashboardDataProps> = ({
    transactions,
    accounts,
    debts
}) => {
    const upcomingPayments = useMemo(() =>
        getUpcomingPayments(transactions, debts, accounts, 30),
        [transactions, debts, accounts]
    );

    const totalAmount = getTotalUpcomingPayments(upcomingPayments);
    const urgentPayments = getUrgentPayments(upcomingPayments);
    const displayPayments = upcomingPayments.slice(0, 5); // Mostrar solo los próximos 5

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'RECURRING': return Repeat;
            case 'DEBT': return DollarSign;
            case 'CREDIT_CARD': return CreditCard;
            default: return Calendar;
        }
    };

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'RECURRING': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            case 'DEBT': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            case 'CREDIT_CARD': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <div className="bg-white dark:bg-onyx-900 rounded-[2rem] p-6 shadow-sm border border-onyx-100 dark:border-onyx-800 hover:shadow-lg transition-all h-full flex flex-col relative overflow-hidden group/widget">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover/widget:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-onyx-900 dark:text-white uppercase tracking-wide">
                            Próximos Pagos
                        </h3>
                        <p className="text-xs text-onyx-500 dark:text-onyx-400 font-bold">
                            {upcomingPayments.length} pagos pendientes
                        </p>
                    </div>
                </div>
                {urgentPayments.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                            {urgentPayments.length} urgente{urgentPayments.length > 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 mb-4 border border-orange-100 dark:border-orange-900/50 shrink-0">
                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">
                    Total a Pagar (30 días)
                </p>
                <p className="text-2xl font-black text-onyx-900 dark:text-white tracking-tight">
                    {totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
            </div>

            {/* Payments List */}
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {displayPayments.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-10 h-10 text-onyx-300 dark:text-onyx-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-onyx-500 dark:text-onyx-400">
                            No hay pagos próximos
                        </p>
                        <p className="text-xs text-onyx-400 dark:text-onyx-500 mt-1 font-bold">
                            ¡Todo al día!
                        </p>
                    </div>
                ) : (
                    displayPayments.map((payment) => {
                        const SourceIcon = getSourceIcon(payment.source);
                        const isUrgent = payment.daysUntilDue <= 3 && payment.daysUntilDue >= 0;
                        const isOverdue = payment.isOverdue;

                        return (
                            <div
                                key={payment.id}
                                className={`p-3 rounded-xl border transition-all hover:shadow-md ${isOverdue
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                                    : isUrgent
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50'
                                        : 'bg-onyx-50 dark:bg-onyx-800 border-onyx-200 dark:border-onyx-700 hover:bg-white dark:hover:bg-onyx-900'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getSourceColor(payment.source)}`}>
                                            <SourceIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-onyx-900 dark:text-white truncate">
                                                {payment.name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-onyx-500 dark:text-onyx-400 uppercase tracking-widest truncate">
                                                {payment.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-3 shrink-0">
                                        <p className="text-sm font-black text-onyx-900 dark:text-white">
                                            {payment.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-onyx-200 dark:border-onyx-700/50">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-onyx-400" />
                                        <span className="text-[10px] font-bold text-onyx-600 dark:text-onyx-400 uppercase">
                                            {new Date(payment.dueDate).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-wide uppercase ${isOverdue
                                        ? 'text-red-600 dark:text-red-400'
                                        : isUrgent
                                            ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-onyx-500 dark:text-onyx-400'
                                        }`}>
                                        {isOverdue
                                            ? `Vencido hace ${Math.abs(payment.daysUntilDue)} días`
                                            : payment.daysUntilDue === 0
                                                ? 'Hoy'
                                                : payment.daysUntilDue === 1
                                                    ? 'Mañana'
                                                    : `En ${payment.daysUntilDue} días`
                                        }
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Ver más */}
            {upcomingPayments.length > 5 && (
                <button className="w-full mt-3 py-1.5 text-xs font-bold text-onyx-400 hover:text-cyan-600 transition-colors shrink-0">
                    Ver todos ({upcomingPayments.length} pagos)
                </button>
            )}
        </div>
    );
};

export default UpcomingPaymentsWidget;
