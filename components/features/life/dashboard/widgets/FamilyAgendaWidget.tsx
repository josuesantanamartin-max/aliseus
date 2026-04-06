import React from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

interface FamilyAgendaWidgetProps {
    onNavigate: (app: string, tab: string) => void;
}

const FamilyAgendaWidget: React.FC<FamilyAgendaWidgetProps> = ({ onNavigate }) => {
    const { familyMembers } = useLifeStore();

    return (
        <div
            className="bg-white dark:bg-aliseus-900 p-6 rounded-[2.5rem] border border-aliseus-100 dark:border-aliseus-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-all h-full"
            onClick={() => onNavigate('life', 'kitchen-inventory')} // Redirects to inventory/calendar for now as per original code
        >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                    <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-black text-aliseus-950 dark:text-white text-sm">Agenda Familiar</h4>
                    <p className="text-[10px] font-bold text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest">{familyMembers.length} miembros activos</p>
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-aliseus-200 group-hover:text-indigo-primary group-hover:translate-x-1 transition-all" />
        </div>
    );
};

export default FamilyAgendaWidget;
