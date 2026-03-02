import React, { useState, useEffect } from 'react';
import { Search, Command, X, Mic, Navigation, Zap, MessageSquare, ArrowRight, TrendingUp, Plane } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AuraCommandBarProps {
    onNavigate?: (app: string, tab?: string) => void;
}

export default function AuraCommandBar({ onNavigate }: AuraCommandBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Handle K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const placeholders = [
        "¿Cuánto he gastado este mes?",
        "Buscar vuelos a Roma",
        "¿Qué caduca esta semana?",
        "Añadir gasto 45€",
        "¿Cómo va mi fondo de emergencia?"
    ];

    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleExecute = () => {
        if (!query.trim()) return;
        setIsExecuting(true);
        setShowResult(false);

        // Simulate AI processing
        setTimeout(() => {
            setIsExecuting(false);
            setShowResult(true);
        }, 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleExecute();
        }
    };

    const handleNavigateResult = () => {
        if (!onNavigate) return;

        const q = query.toLowerCase();
        if (q.includes('viaje') || q.includes('vuelo') || q.includes('roma')) {
            onNavigate('life', 'viajes');
        } else if (q.includes('gasto') || q.includes('presupuesto') || q.includes('dinero') || q.includes('cuánto')) {
            onNavigate('finance', 'dashboard');
        } else if (q.includes('caduca') || q.includes('despensa') || q.includes('receta') || q.includes('cocina')) {
            onNavigate('life', 'cocina');
        } else {
            onNavigate('finance', 'dashboard');
        }
        setIsOpen(false);
        setQuery('');
        setShowResult(false);
    };

    return (
        <div className="w-full relative">
            {/* Main Search Trigger */}
            <div className="relative group rounded-[2rem] p-[1px] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20">
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out" />

                <div
                    onClick={() => setIsOpen(true)}
                    className="relative w-full bg-white/80 dark:bg-onyx-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-onyx-700/50 rounded-[2rem] h-16 flex items-center px-6 gap-4 cursor-text transition-colors shadow-sm"
                >
                    <Search className="w-5 h-5 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg flex-1 truncate select-none">
                        {placeholders[placeholderIdx]}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-onyx-800 border-b-2 border-slate-200 dark:border-onyx-950 shadow-sm transition-transform group-hover:scale-105">
                        <Command className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">K</span>
                    </div>
                    <button className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-onyx-800 transition-colors ml-1 text-slate-400 hover:text-indigo-500">
                        <Mic className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-6">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="w-full max-w-2xl bg-white dark:bg-onyx-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-onyx-700 overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center px-6 h-18 border-b border-slate-100 dark:border-onyx-800">
                            <Search className="w-6 h-6 text-brand-500" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setShowResult(false);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribe tu pregunta o acción..."
                                className="flex-1 bg-transparent border-none outline-none px-4 py-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-onyx-800 text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {isExecuting ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                                    <p className="text-sm font-medium text-slate-500 animate-pulse">Consultando a Aura AI...</p>
                                </div>
                            ) : query.length === 0 ? (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Sugerencias Inteligentes</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {[
                                                { text: 'Optimizar menú con ingredientes próximos', icon: Zap, color: 'text-amber-500' },
                                                { text: 'Hipoteca vence en 4 días — 850€', icon: Navigation, color: 'text-brand-500' },
                                                { text: 'Ocio al 92% del presupuesto', icon: TrendingUp, color: 'text-red-500' },
                                                { text: 'Costa Amalfitana — buscar vuelos', icon: Plane, color: 'text-sky-500' }
                                            ].map((sug, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setQuery(sug.text);
                                                        handleExecute();
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-onyx-800 text-left transition-colors border border-transparent hover:border-slate-100 dark:hover:border-onyx-700"
                                                >
                                                    <sug.icon className={cn("w-4 h-4", sug.color)} />
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{sug.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Historial Reciente</h4>
                                        <div className="flex flex-col gap-1">
                                            {['¿Cuánto he gastado este mes?', 'Recetas con salmón', 'Añadir gasto 12€ Ocio'].map((h, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setQuery(h);
                                                        handleExecute();
                                                    }}
                                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-onyx-800 text-left transition-colors text-slate-500"
                                                >
                                                    <Command className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">{h}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : showResult ? (
                                <div className="flex flex-col gap-4 py-2">
                                    <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-4 h-4 text-brand-500" />
                                            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Aura AI</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            He analizado tu petición: <span className="font-bold">"{query}"</span>.
                                            Parece que necesitas información detallada sobre este tema. He preparado un resumen de tus datos actuales.
                                        </p>
                                        <button
                                            onClick={handleNavigateResult}
                                            className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
                                        >
                                            Ver detalle completo <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center gap-2 animate-in fade-in">
                                    <Command className="w-8 h-8 text-slate-200 dark:text-onyx-800" />
                                    <p className="text-sm font-medium text-slate-400">Pulsa Enter para preguntar a Aura</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 dark:bg-onyx-950 border-t border-slate-100 dark:border-onyx-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700 font-sans shadow-sm">Enter</kbd> Ejecutar
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-onyx-800 border border-slate-200 dark:border-onyx-700 font-sans shadow-sm">Tab</kbd> Navegar
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Powered by Gemini AI</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
