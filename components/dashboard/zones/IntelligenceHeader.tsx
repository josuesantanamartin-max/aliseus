import React from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { Settings, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function IntelligenceHeader() {
    const { userProfile } = useUserStore();

    const firstName = userProfile?.full_name?.split(' ')[0] || 'Usuario';

    return (
        <section className="w-full flex items-center justify-between pb-4 pt-2">
            <div>
                <span className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 tracking-tight">
                    Hola, <span className="font-semibold">{firstName}</span>
                </span>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-onyx-800 dark:hover:bg-onyx-700 transition-colors">
                    <Bell className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-onyx-800 dark:hover:bg-onyx-700 transition-colors">
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </section>
    );
}
