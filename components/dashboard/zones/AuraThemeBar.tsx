import React from 'react';
import { Wallet, Utensils, Plane, Users, TrendingUp } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useUserStore } from '../../../store/useUserStore';
import { DASHBOARD_TEXTS } from '../../../i18n/dashboardTexts';


export type AuraTheme = 'finances' | 'kitchen' | 'travel' | 'family' | 'investments';

interface AuraThemeBarProps {
    activeTheme: AuraTheme;
    onThemeChange: (theme: AuraTheme) => void;
}

const THEMES = [
    { id: 'finances' as const, icon: Wallet, color: 'brand' },
    { id: 'kitchen' as const, icon: Utensils, color: 'orange' },
    { id: 'travel' as const, icon: Plane, color: 'sky' },
    { id: 'family' as const, icon: Users, color: 'rose' },
    { id: 'investments' as const, icon: TrendingUp, color: 'emerald' },
];


export default function AuraThemeBar({ activeTheme, onThemeChange }: AuraThemeBarProps) {
    const { language } = useUserStore();
    const t = (DASHBOARD_TEXTS as any)[language || 'ES']?.themeBar || DASHBOARD_TEXTS.ES.themeBar;

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
                                    ? "bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-600 dark:to-blue-800 text-white border-transparent shadow-[0_8px_16px_-6px_rgba(29,78,216,0.5)] scale-105"
                                    : "bg-white/60 dark:bg-onyx-900/60 backdrop-blur-md text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-onyx-700/50 hover:bg-white dark:hover:bg-onyx-800 hover:border-blue-400/50 dark:hover:border-blue-600/50 hover:shadow-lg hover:-translate-y-0.5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 blur-md rounded-full -z-10 animate-pulse transition-opacity duration-1000" />
                            )}
                            <Icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "text-white scale-110" : "text-slate-400 group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400")} />
                            <span className="text-sm tracking-wide relative z-10">{t[theme.id]}</span>
                        </button>

                    );
                })}
            </div>
        </div>
    );
}
