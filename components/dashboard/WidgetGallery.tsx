import React, { useState } from 'react';
import { Plus, Search, X, LayoutGrid } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { WIDGET_CONFIG } from './WidgetRegistry';
import { getWidgetCategory } from './widgetCategories';

interface WidgetGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onDragStart?: (id: string, source: 'gallery') => void;
    onDragEnd?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    ALL: 'Todos',
    FINANCE: 'Finanzas',
    KITCHEN: 'Cocina',
    LIFE: 'Vida',
};

const WidgetGallery: React.FC<WidgetGalleryProps> = ({ isOpen, onClose, onDragStart, onDragEnd }) => {
    const { dashboardLayouts = [], activeLayoutId, activeDashboardView, addWidgetToLayout } = useUserStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(activeDashboardView || 'ALL');
    const [isDraggingLocal, setIsDraggingLocal] = useState(false);

    // Update category when gallery opens to match current view
    React.useEffect(() => {
        if (isOpen && activeDashboardView) {
            setSelectedCategory(activeDashboardView);
        }
    }, [isOpen, activeDashboardView]);

    const activeLayout = dashboardLayouts.find(l => l.id === activeLayoutId);

    // Function to check if a widget is already added to its "home" dashboard
    const isWidgetAdded = (id: string) => {
        const category = getWidgetCategory(id);
        let targetLayoutId = 'default'; // Default for FINANCE
        if (category === 'KITCHEN') targetLayoutId = 'kitchen';
        else if (category === 'LIFE') targetLayoutId = 'life';

        const targetLayout = dashboardLayouts.find(l => l.id === targetLayoutId);
        return targetLayout?.widgets.some(w => w.i === id) || false;
    };

    const allWidgets = Object.entries(WIDGET_CONFIG);

    const filteredWidgets = allWidgets.filter(([id, config]) => {
        const matchesSearch = config.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || getWidgetCategory(id) === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const availableWidgetsCount = allWidgets.filter(([id]) => !isWidgetAdded(id)).length;

    const handleAdd = (id: string) => {
        addWidgetToLayout(id);
        // Don't close so user can add multiple widgets
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className={`fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-all duration-300 ${isDraggingLocal ? 'pointer-events-none opacity-0' : 'opacity-100'
                        }`}
                    onClick={onClose}
                />
            )}

            {/* Sliding Panel */}
            <div className={`fixed top-0 right-0 h-full w-80 z-50 flex flex-col bg-white dark:bg-onyx-900 border-l border-onyx-100 dark:border-onyx-800 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-onyx-100 dark:border-onyx-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-50 dark:bg-cyan-900/40 rounded-xl flex items-center justify-center">
                            <LayoutGrid className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-onyx-900 dark:text-white">Añadir Widget</h3>
                            <p className="text-xs text-onyx-400">
                                {availableWidgetsCount} disponibles
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-onyx-100 dark:hover:bg-onyx-800 text-onyx-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onyx-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar widget..."
                            className="w-full pl-9 pr-4 py-2.5 bg-onyx-50 dark:bg-onyx-800 border border-onyx-200 dark:border-onyx-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="px-4 pb-3 shrink-0">
                    <div className="flex gap-1 bg-onyx-50 dark:bg-onyx-800 rounded-xl p-1">
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === key
                                    ? 'bg-cyan-600 text-white shadow-sm'
                                    : 'text-onyx-400 hover:text-onyx-700 dark:hover:text-onyx-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Widget List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-2">
                    {filteredWidgets.map(([id, config]) => (
                        <button
                            key={id}
                            onClick={() => !isWidgetAdded(id) && handleAdd(id)}
                            disabled={isWidgetAdded(id)}
                            draggable={!isWidgetAdded(id)}
                            onDragStart={(e) => {
                                if (isWidgetAdded(id)) return;
                                setIsDraggingLocal(true);
                                e.dataTransfer.setData('application/json', JSON.stringify({ source: 'gallery', widgetId: id }));
                                e.dataTransfer.effectAllowed = 'copy';
                                if (onDragStart) onDragStart(id, 'gallery');
                            }}
                            onDragEnd={() => {
                                setIsDraggingLocal(false);
                                if (onDragEnd) onDragEnd();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${isWidgetAdded(id)
                                ? 'bg-onyx-50/50 dark:bg-onyx-800/50 opacity-60 cursor-not-allowed'
                                : 'bg-onyx-50 dark:bg-onyx-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800'
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-colors ${isWidgetAdded(id)
                                ? 'bg-onyx-100 dark:bg-onyx-700 text-onyx-300'
                                : 'bg-white dark:bg-onyx-700 text-cyan-600 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50'
                                }`}>
                                {isWidgetAdded(id) ? (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate transition-colors ${isWidgetAdded(id)
                                    ? 'text-onyx-400'
                                    : 'text-onyx-800 dark:text-onyx-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                                    }`}>
                                    {config.label}
                                </p>
                                <p className="text-xs text-onyx-400 capitalize mt-0.5">
                                    {CATEGORY_LABELS[getWidgetCategory(id)] ?? 'General'}
                                </p>
                            </div>
                            <div className="shrink-0 transition-all">
                                {isWidgetAdded(id) ? (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                                        Añadido
                                    </span>
                                ) : (
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-cyan-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                        <Plus className="w-3 h-3" />
                                        Añadir
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}

                    {filteredWidgets.length === 0 && (
                        <div className="text-center py-12">
                            <LayoutGrid className="w-10 h-10 text-onyx-200 dark:text-onyx-700 mx-auto mb-3" />
                            <p className="text-sm text-onyx-400">
                                {searchQuery
                                    ? 'No se encontraron widgets'
                                    : allWidgets.filter(([id]) => !isWidgetAdded(id)).length === 0
                                        ? 'Todos los widgets están en uso'
                                        : 'Ningún widget en esta categoría'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WidgetGallery;

