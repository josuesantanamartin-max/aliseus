import React from 'react';
import { Wand2, Check } from 'lucide-react';

export interface SmartSuggestion {
    category: string;
    subCategory?: string;
    avgSpend: number;
    incomeShare: number; // percentage 0-100
    suggestedLimit: number;
    suggestedPercentage: number;
    isSelected: boolean;
    mode: 'FIXED' | 'PERCENTAGE';
}

interface BudgetAISuggestionModalProps {
    isAutoModalOpen: boolean;
    setIsAutoModalOpen: (open: boolean) => void;
    aiSensitivity: 'STRICT' | 'MODERATE' | 'COMFORT';
    setAiSensitivity: (s: 'STRICT' | 'MODERATE' | 'COMFORT') => void;
    smartSuggestions: SmartSuggestion[];
    setSmartSuggestions: (s: SmartSuggestion[]) => void;
    handleApplySuggestions: () => void;
    formatEUR: (amount: number) => string;
}

export const BudgetAISuggestionModal: React.FC<BudgetAISuggestionModalProps> = ({
    isAutoModalOpen,
    setIsAutoModalOpen,
    aiSensitivity,
    setAiSensitivity,
    smartSuggestions,
    setSmartSuggestions,
    handleApplySuggestions,
    formatEUR
}) => {
    if (!isAutoModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-cyan-900/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-onyx shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-cyan-600 p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <h3 className="text-2xl font-black tracking-tight relative z-10 flex items-center gap-3">
                        <Wand2 className="w-6 h-6" /> Asistente de Presupuestos
                    </h3>
                    <p className="text-cyan-100 font-medium text-sm mt-3 relative z-10 max-w-md leading-relaxed">
                        He analizado tus patrones de gasto por subcategoría. Detecto qué gastos son regulares (Mensuales) y cuáles son esporádicos (Anuales).
                    </p>

                    {/* SENSITIVITY TOGGLE */}
                    <div className="relative z-10 mt-6 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-cyan-200">Sensibilidad del Límite</span>
                        <div className="flex bg-cyan-900/30 p-1 rounded-lg backdrop-blur-sm">
                            {(['STRICT', 'MODERATE', 'COMFORT'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setAiSensitivity(mode)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${aiSensitivity === mode ? 'bg-white text-cyan-600 shadow-sm' : 'text-cyan-200 hover:text-white hover:bg-white/10'}`}
                                >
                                    {mode === 'STRICT' && 'Estricto (0%)'}
                                    {mode === 'MODERATE' && 'Moderado (+10%)'}
                                    {mode === 'COMFORT' && 'Holgado (+20%)'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-onyx-50/50">
                    {smartSuggestions.length > 0 ? (
                        <div className="space-y-4">
                            {smartSuggestions.map((suggestion, idx) => {
                                const period = (suggestion as any).period || 'MONTHLY';
                                return (
                                    <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${suggestion.isSelected ? 'bg-white border-cyan-500 shadow-md ring-1 ring-cyan-500' : 'bg-white border-onyx-100 hover:border-cyan-200'}`} onClick={() => {
                                        const newSugg = [...smartSuggestions];
                                        newSugg[idx].isSelected = !newSugg[idx].isSelected;
                                        setSmartSuggestions(newSugg);
                                    }}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${suggestion.isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-onyx-200 bg-white'}`}>
                                                {suggestion.isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-cyan-900">{suggestion.category}</h4>
                                                    {suggestion.subCategory && (
                                                        <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md">{suggestion.subCategory}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${period === 'MONTHLY' ? 'bg-onyx-100 text-onyx-600' : 'bg-onyx-900 text-white'}`}>
                                                        {period === 'MONTHLY' ? 'Mensual' : 'Anual'}
                                                    </span>
                                                    <p className="text-xs text-onyx-500">
                                                        Media: <span className="font-bold">{formatEUR(suggestion.avgSpend)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-onyx-400 uppercase tracking-widest mb-1">Sugerido</div>
                                            <div className="text-xl font-black text-cyan-900">{formatEUR(suggestion.suggestedLimit)}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-onyx-400 font-bold">No tengo suficientes datos históricos para generar sugerencias.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-onyx-100 flex justify-end gap-4 z-20 shrink-0">
                    <button onClick={() => setIsAutoModalOpen(false)} className="px-6 py-3 text-onyx-400 font-bold text-xs uppercase tracking-widest hover:text-onyx-800 transition-colors">Cancelar</button>
                    <button onClick={handleApplySuggestions} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all active:scale-95">
                        Aplicar {smartSuggestions.filter(s => s.isSelected).length} Límites
                    </button>
                </div>
            </div>
        </div>
    );
};
