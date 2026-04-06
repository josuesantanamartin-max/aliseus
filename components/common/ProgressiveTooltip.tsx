import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { X, Lightbulb } from 'lucide-react';

interface ProgressiveTooltipProps {
    id: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
    /** Delay in ms before showing (default 800) */
    delay?: number;
}

const POSITION_CLASSES: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
};

const ARROW_CLASSES: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
};

export const ProgressiveTooltip: React.FC<ProgressiveTooltipProps> = ({
    id, title, description, position = 'bottom', children, delay = 800,
}) => {
    const { seenTooltips, markTooltipSeen, hasCompletedOnboarding } = useUserStore();
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoHideRef = useRef<NodeJS.Timeout | null>(null);

    const alreadySeen = seenTooltips.includes(id);

    useEffect(() => {
        if (alreadySeen || !hasCompletedOnboarding) return;

        // Show with delay
        timerRef.current = setTimeout(() => setVisible(true), delay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [alreadySeen, hasCompletedOnboarding, delay]);

    // Auto-hide after 12s
    useEffect(() => {
        if (visible) {
            autoHideRef.current = setTimeout(() => dismiss(), 12000);
            return () => { if (autoHideRef.current) clearTimeout(autoHideRef.current); };
        }
    }, [visible]);

    const dismiss = () => {
        setVisible(false);
        markTooltipSeen(id);
    };

    if (alreadySeen || !hasCompletedOnboarding) {
        return <>{children}</>;
    }

    return (
        <div className="relative inline-flex">
            {children}

            {visible && (
                <div
                    className={`absolute z-[200] ${POSITION_CLASSES[position]} animate-fade-in`}
                    style={{ pointerEvents: 'auto' }}
                >
                    <div className="bg-gray-900 dark:bg-aliseus-800 text-white rounded-xl px-4 py-3 shadow-2xl border border-gray-700/50 max-w-[260px] min-w-[220px] relative">
                        {/* Arrow */}
                        <div className={`absolute w-0 h-0 border-[6px] border-transparent ${ARROW_CLASSES[position]}`} />

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white mb-0.5 leading-tight">{title}</p>
                                <p className="text-[11px] text-gray-300 leading-relaxed">{description}</p>
                            </div>
                            <button
                                onClick={dismiss}
                                className="p-1 text-gray-400 hover:text-white rounded transition-colors shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Dismiss hint */}
                        <button
                            onClick={dismiss}
                            className="mt-2 w-full text-center text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
