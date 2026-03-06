import React from 'react';
import { Wallet, Utensils, Plane, Users, TrendingUp } from 'lucide-react';
import { cn } from '../../../utils/cn';

export type AuraTheme = 'finances' | 'kitchen' | 'travel' | 'family' | 'investments';

interface AuraThemeBarProps {
    activeTheme: AuraTheme;
    onThemeChange: (theme: AuraTheme) => void;
}

const THEMES = [
    { id: 'finances' as const, label: 'Finanzas', icon: Wallet, color: 'brand' },
    { id: 'kitchen' as const, label: 'Cocina', icon: Utensils, color: 'orange' },
    { id: 'travel' as const, label: 'Viajes', icon: Plane, color: 'sky' },
    { id: 'family' as const, label: 'Familia', icon: Users, color: 'rose' },
    { id: 'investments' as const, label: 'Inversión', icon: TrendingUp, color: 'emerald' },
];

export default function AuraThemeBar({ activeTheme, onThemeChange }: AuraThemeBarProps) {
    return (
        <div className="w-full overflow-x-auto hide-scrollbar pb-2">
            <div className="flex items-center gap-2 min-w-max">
                {THEMES.map((theme) => {
                    const Icon = theme.icon;
                    const isActive = activeTheme === theme.id;

                    return (
                        <button
                            key={theme.id}
                            onClick={() => onThemeChange(theme.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500 border relative overflow-hidden group font-medium",
                                isActive
                                    ? "bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white border-transparent shadow-[0_8px_16px_-6px_rgba(30,41,59,0.5)] scale-105"
                                    : "bg-white/60 dark:bg-onyx-900/60 backdrop-blur-md text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-onyx-700/50 hover:bg-white dark:hover:bg-onyx-800 hover:border-slate-400/50 dark:hover:border-slate-600/50 hover:shadow-lg hover:-translate-y-0.5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 blur-md rounded-full -z-10 animate-pulse transition-opacity duration-1000" />
                            )}
                            <Icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "text-white scale-110" : "text-slate-400 group-hover:scale-110 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                            <span className="text-sm tracking-wide relative z-10">{theme.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
