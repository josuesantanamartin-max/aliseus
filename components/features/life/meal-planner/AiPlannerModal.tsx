import React from 'react';
import { Wand2, X, Coffee, Sunset, Moon, Loader2 } from 'lucide-react';
import { Recipe, Language } from '../../../../types';

const AI_OPTIONS: Record<string, Record<string, Record<Language, string>>> = {
    diet: {
        'Omnivore': { ES: 'Omnívoro', EN: 'Omnivore', FR: 'Omnivore' },
        'Vegetarian': { ES: 'Vegetariano', EN: 'Vegetarian', FR: 'Végétarien' },
        'Vegan': { ES: 'Vegano', EN: 'Vegan', FR: 'Végétalien' },
        'Keto': { ES: 'Keto', EN: 'Keto', FR: 'Céto' },
        'Paleo': { ES: 'Paleo', EN: 'Paleo', FR: 'Paléo' },
    },
    goal: {
        'Balanced': { ES: 'Balanceado', EN: 'Balanced', FR: 'Équilibré' },
        'LowCarb': { ES: 'Bajo en Carbohidratos', EN: 'Low Carb', FR: 'Faible en glucides' },
        'HighProtein': { ES: 'Alto en Proteína', EN: 'High Protein', FR: 'Riche en protéines' },
        'BudgetFriendly': { ES: 'Económico', EN: 'Budget Friendly', FR: 'Économique' },
        'QuickEasy': { ES: 'Rápido y Fácil', EN: 'Quick & Easy', FR: 'Rapide & Facile' },
    },
    difficulty: {
        'Any': { ES: 'Cualquiera', EN: 'Any', FR: 'Peu importe' },
        'Beginner': { ES: 'Principiante (< 30 min)', EN: 'Beginner (< 30 min)', FR: 'Débutant (< 30 min)' },
        'Intermediate': { ES: 'Intermedio (30-60 min)', EN: 'Intermediate (30-60 min)', FR: 'Intermédiaire (30-60 min)' },
        'Advanced': { ES: 'Avanzado (> 60 min)', EN: 'Advanced (> 60 min)', FR: 'Avancé (> 60 min)' },
    }
};

interface AiPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    aiCourses: { lunch: number, dinner: number };
    setAiCourses: React.Dispatch<React.SetStateAction<{ lunch: number, dinner: number }>>;
    aiCriteria: { days: number, diet: string, goal: string, difficulty: string, exclusions: string };
    setAiCriteria: React.Dispatch<React.SetStateAction<{ days: number, diet: string, goal: string, difficulty: string, exclusions: string }>>;
    aiMealTypes: { breakfast: boolean, lunch: boolean, dinner: boolean };
    setAiMealTypes: React.Dispatch<React.SetStateAction<{ breakfast: boolean, lunch: boolean, dinner: boolean }>>;
    handleGenerateMenu: () => void;
    aiGenerating: boolean;
    aiStatus: string;
    language: Language;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
    isOpen, onClose, aiCourses, setAiCourses, aiCriteria, setAiCriteria, aiMealTypes, setAiMealTypes, handleGenerateMenu, aiGenerating, aiStatus, language
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <Wand2 className="w-6 h-6 text-purple-600" /> Planificador IA
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 space-y-6">
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">Crea un plan personalizado basado en tus objetivos y despensa.</p>

                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <label className="block text-[10px] font-black text-purple-700 uppercase tracking-[0.2em] mb-3">Estilo de Menú</label>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-700">Platos en Almuerzo</span>
                                <div className="flex bg-white rounded-lg border border-purple-200 p-0.5">
                                    {[1, 2].map(n => (
                                        <button key={n} onClick={() => setAiCourses(prev => ({ ...prev, lunch: n }))} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${aiCourses.lunch === n ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-purple-600'}`}>
                                            {n === 1 ? 'Único' : '1º y 2º'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-700">Platos en Cena</span>
                                <div className="flex bg-white rounded-lg border border-purple-200 p-0.5">
                                    {[1, 2].map(n => (
                                        <button key={n} onClick={() => setAiCourses(prev => ({ ...prev, dinner: n }))} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${aiCourses.dinner === n ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-purple-600'}`}>
                                            {n === 1 ? 'Único' : '1º y 2º'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Duración</label>
                        <div className="flex gap-2">
                            {[3, 7, 30].map(days => (
                                <button key={days} onClick={() => setAiCriteria({ ...aiCriteria, days })} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${aiCriteria.days === days ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-purple-50'}`}>{days} Días</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Comidas a incluir</label>
                        <div className="flex gap-2">
                            <button onClick={() => setAiMealTypes(prev => ({ ...prev, breakfast: !prev.breakfast }))} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 flex flex-col items-center justify-center gap-2 transition-all ${aiMealTypes.breakfast ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}><Coffee className="w-5 h-5" /> Desayuno</button>
                            <button onClick={() => setAiMealTypes(prev => ({ ...prev, lunch: !prev.lunch }))} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 flex flex-col items-center justify-center gap-2 transition-all ${aiMealTypes.lunch ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}><Sunset className="w-5 h-5" /> Almuerzo</button>
                            <button onClick={() => setAiMealTypes(prev => ({ ...prev, dinner: !prev.dinner }))} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 flex flex-col items-center justify-center gap-2 transition-all ${aiMealTypes.dinner ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}><Moon className="w-5 h-5" /> Cena</button>
                        </div>
                    </div>

                    {(['diet', 'goal', 'difficulty'] as const).map((optionKey) => {
                        const options = AI_OPTIONS[optionKey] || {};
                        return (
                            <div key={optionKey}>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                    {optionKey === 'diet' ? 'Dieta' : optionKey === 'goal' ? 'Objetivo' : 'Dificultad'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(options).map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setAiCriteria({ ...aiCriteria, [optionKey]: opt })}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${(aiCriteria as any)[optionKey] === opt ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:bg-purple-50'}`}
                                        >
                                            {options[opt][language as Language] || options[opt]['EN']}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    <button
                        type="button"
                        onClick={handleGenerateMenu}
                        disabled={aiGenerating || (!aiMealTypes.breakfast && !aiMealTypes.lunch && !aiMealTypes.dinner)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {aiGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {aiGenerating ? aiStatus : 'Generar Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
};
