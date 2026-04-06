import React from 'react';
import { Sparkles, Trash2, RotateCcw, Database } from 'lucide-react';
import { useSampleData } from '../../../hooks/useSampleData';

/**
 * Sample Data Management Section for Settings
 */
const SampleDataSection: React.FC = () => {
    const {
        isSampleDataLoaded,
        clearAllData,
        restoreSampleData,
        isLoading,
    } = useSampleData();

    const handleClearData = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar los datos de prueba? Esto limpiará tus finanzas y lista de la compra, pero mantendrá las recetas de ejemplo. Esta acción no se puede deshacer.')) {
            clearAllData(true); // true = keep recipes
        }
    };

    const handleRestoreData = () => {
        if (window.confirm('¿Quieres restaurar los datos de ejemplo? Esto no eliminará tus datos existentes, solo agregará los ejemplos.')) {
            restoreSampleData();
        }
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-aliseus-800">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                    <Database className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Datos de Ejemplo</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gestiona los datos de muestra de la aplicación</p>
                </div>
            </div>

            {/* Status Indicator */}
            <div className={`p-4 rounded-xl mb-4 ${isSampleDataLoaded
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800'
                    : 'bg-gray-50 dark:bg-aliseus-800 border border-gray-200 dark:border-aliseus-700'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className={`w-4 h-4 ${isSampleDataLoaded ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                    <span className={`text-sm font-bold ${isSampleDataLoaded ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                        {isSampleDataLoaded ? 'Datos de ejemplo activos' : 'Sin datos de ejemplo'}
                    </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isSampleDataLoaded
                        ? 'Actualmente estás viendo datos de muestra. Puedes eliminarlos cuando estés listo para usar tus propios datos.'
                        : 'No hay datos de ejemplo cargados. Puedes restaurarlos si quieres explorar las funcionalidades.'}
                </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    onClick={handleRestoreData}
                    disabled={isLoading}
                    className="
                        flex items-center justify-center gap-2 px-4 py-3
                        bg-indigo-600 hover:bg-indigo-700 text-white
                        rounded-xl font-bold text-sm
                        transition-all shadow-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar Datos de Ejemplo
                </button>

                <button
                    onClick={handleClearData}
                    disabled={isLoading || !isSampleDataLoaded}
                    className="
                        flex items-center justify-center gap-2 px-4 py-3
                        bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30
                        text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800
                        rounded-xl font-bold text-sm
                        transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <Trash2 className="w-4 h-4" />
                    Limpiar Datos de Prueba
                </button>
            </div>

            {/* Warning */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    <strong>Nota:</strong> Los datos de ejemplo se cargan solo en memoria. Para guardarlos permanentemente, crea o modifica elementos desde la aplicación.
                </p>
            </div>
        </div>
    );
};

export default SampleDataSection;
