import React from 'react';
import { Coffee, Sunset, Moon } from 'lucide-react';
import { MealTime } from '@/types';

export const DEFAULT_FOOD_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

export const COURSE_LABELS: Record<string, string> = {
    'STARTER': '1er Plato',
    'MAIN': '2º Plato',
    'DESSERT': 'Postre',
    'SIDE': 'Acomp.',
    'DRINK': 'Bebida'
};

export const COURSE_ORDER = ['STARTER', 'MAIN', 'SIDE', 'DESSERT', 'DRINK'];

export type ViewMode = 'week' | 'biweek' | 'month';

export const MEAL_CONFIG: Record<MealTime, { label: string; accent: string; icon: React.ReactElement }> = {
    breakfast: { label: 'Desayuno', accent: 'amber', icon: React.createElement(Coffee, { className: 'w-3 h-3' }) },
    lunch: { label: 'Almuerzo', accent: 'emerald', icon: React.createElement(Sunset, { className: 'w-3 h-3' }) },
    dinner: { label: 'Cena', accent: 'indigo', icon: React.createElement(Moon, { className: 'w-3 h-3' }) },
};

export const MEAL_COLORS: Record<string, { bg: string; text: string; border: string; dropBg: string; dropBorder: string }> = {
    breakfast: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dropBg: 'bg-amber-50/80', dropBorder: 'border-amber-400' },
    lunch: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dropBg: 'bg-emerald-50/80', dropBorder: 'border-emerald-400' },
    dinner: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dropBg: 'bg-indigo-50/80', dropBorder: 'border-indigo-400' },
};

export const generatePlanDates = (startDate: Date, mode: ViewMode): Date[] => {
    const start = new Date(startDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    if (mode === 'month') {
        const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const firstDayOfWeek = firstDay.getDay();
        const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        start.setTime(firstDay.getTime() - (offset * 24 * 60 * 60 * 1000));
    }

    const count = mode === 'week' ? 7 : mode === 'biweek' ? 14 : 35;
    const range = [];
    for (let i = 0; i < count; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        range.push(d);
    }
    return range;
};
