import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useSampleData } from '@/hooks/useSampleData';
import { Info, X, Sparkles } from 'lucide-react';

const SECTION_TEXTS: Record<string, { emoji: string; text: string }> = {
    FINANCE: {
        emoji: '💰',
        text: 'Estos son datos de ejemplo para que explores. Tus transacciones reales aparecerán al importar o registrar.',
    },
    KITCHEN: {
        emoji: '🍳',
        text: 'Estas recetas y despensa son de ejemplo. Puedes editarlas, borrarlas o añadir las tuyas propias.',
    },
    LIFE: {
        emoji: '🏠',
        text: 'La agenda y tareas mostradas son de ejemplo. Empieza a crear las tuyas para personalizar tu hogar.',
    },
    TRAVEL: {
        emoji: '✈️',
        text: 'Los viajes mostrados son de ejemplo. Crea el tuyo para empezar a planificar tu próxima escapada.',
    },
    DEFAULT: {
        emoji: '✨',
        text: 'Estás viendo datos de ejemplo. Explora con confianza: puedes eliminarlos cuando quieras desde Ajustes.',
    },
};

interface SampleDataExplainerProps {
    section?: string;
}

const SampleDataExplainer: React.FC<SampleDataExplainerProps> = ({ section }) => {
    const { sampleDataContext, setSampleDataContext } = useUserStore();
    const { isSampleDataLoaded } = useSampleData();

    if (!sampleDataContext || !isSampleDataLoaded) return null;

    const content = SECTION_TEXTS[section || 'DEFAULT'] || SECTION_TEXTS.DEFAULT;

    return (
        <div className="relative bg-gradient-to-r from-cyan-50 via-white to-teal-50 dark:from-cyan-950/40 dark:via-aliseus-900/60 dark:to-teal-950/40 border border-cyan-200/60 dark:border-cyan-800/40 rounded-2xl px-5 py-3.5 flex items-center gap-4 animate-fade-in shadow-sm group">
            {/* Subtle glow */}
            <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 dark:bg-cyan-400/10 blur-xl pointer-events-none" />

            <div className="relative flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-xs font-medium text-cyan-800 dark:text-cyan-300 leading-relaxed">
                    <span className="mr-1">{content.emoji}</span> {content.text}
                </p>
            </div>

            <button
                onClick={() => setSampleDataContext(false)}
                className="relative p-1.5 text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-lg transition-colors shrink-0"
                aria-label="Cerrar"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default SampleDataExplainer;
