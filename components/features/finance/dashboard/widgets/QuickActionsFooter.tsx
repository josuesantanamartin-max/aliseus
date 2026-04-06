
import React from 'react';
import { CreditCard, Utensils, Lock, Baby, Home, LayoutPanelLeft } from 'lucide-react';

interface QuickActionsFooterProps {
    onNavigate: (app: string, tab?: string) => void;
}

const Luggage = ({ className }: { className: string }) => <LayoutPanelLeft className={className} />;

const QuickActionsFooter: React.FC<QuickActionsFooterProps> = ({ onNavigate }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 pb-20 mt-10">
            {[
                { label: 'Gasto', icon: CreditCard, color: 'text-red-500', bg: 'bg-red-50', action: () => onNavigate('finance', 'transactions') },
                { label: 'Menú', icon: Utensils, color: 'text-emerald-500', bg: 'bg-emerald-50', action: () => onNavigate('life', 'kitchen-planner') },
                { label: 'Viaje', icon: Luggage, color: 'text-rose-500', bg: 'bg-rose-50', action: () => onNavigate('life', 'travel') },
                { label: 'Bóveda', icon: Lock, color: 'text-aliseus-600', bg: 'bg-aliseus-100', action: () => onNavigate('life', 'vault') },
                { label: 'Familia', icon: Baby, color: 'text-cyan-primary', bg: 'bg-cyan-50', action: () => onNavigate('life', 'family') },
                { label: 'Espacios', icon: Home, color: 'text-cyan-500', bg: 'bg-cyan-50', action: () => onNavigate('life', 'spaces') },
            ].map((btn, i) => (
                <button
                    key={i}
                    onClick={btn.action}
                    className="bg-white border border-aliseus-100 p-6 rounded-Aliseus shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center gap-4 group"
                >
                    <div className={`p-4 rounded-2xl ${btn.bg} ${btn.color} group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-md`}>
                        <btn.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-aliseus-400 uppercase tracking-[0.2em] group-hover:text-cyan-900 transition-colors">{btn.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActionsFooter;
