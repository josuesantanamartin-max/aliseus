import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Mic, Command, ArrowRight, Clock, Star } from 'lucide-react';
import { useGlobalSearch, SearchResult } from '../../hooks/useGlobalSearch';
import { useUserStore } from '../../store/useUserStore';
import { Button } from './Button';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const { query, setQuery, results, handleSelect } = useGlobalSearch(isOpen, onClose);
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { recentSearches, addSavedFilter } = useUserStore();
    const [isListening, setIsListening] = useState(false);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, handleSelect, onClose]);

    // Web Speech API
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
            };

            recognition.start();
        } else {
            alert('Tu navegador no soporta búsqueda por voz.');
        }
    };

    const handleSaveFilter = () => {
        if (!query) return;
        const name = prompt('Nombre para este filtro:');
        if (name) {
            addSavedFilter({
                id: Math.random().toString(36).substr(2, 9),
                name,
                query,
                type: 'GENERAL',
                createdAt: new Date().toISOString()
            });
            alert('Filtro guardado');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-aliseus-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-aliseus-800 flex flex-col max-h-[70vh]">

                {/* Search Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-aliseus-800">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar transacciones, navegar, comandos..."
                        className="flex-1 bg-transparent text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                    />

                    {query && (
                        <Button
                            variant="ghost"
                            onClick={handleSaveFilter}
                            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Guardar búsqueda"
                        >
                            <Star className="w-4 h-4" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        onClick={startListening}
                        className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 animate-pulse' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-aliseus-800'
                            }`}
                        title="Búsqueda por voz"
                    >
                        <Mic className="w-5 h-5" />
                    </Button>

                    <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-aliseus-800 px-2 py-1 rounded border border-gray-200 dark:border-aliseus-700">
                        <span>ESC</span>
                    </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                    {/* Recent Searches Header if query is empty */}
                    {!query && recentSearches.length > 0 && (
                        <div className="mb-2">
                            <h4 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Recientes</h4>
                            {recentSearches.map((term, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQuery(term)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-aliseus-800 rounded-lg transition-colors text-left"
                                >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {term}
                                </button>
                            ))}
                        </div>
                    )}

                    {results.map((result, index) => (
                        <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group ${index === selectedIndex
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-aliseus-800'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'bg-gray-100 dark:bg-aliseus-800 text-gray-500'
                                }`}>
                                <result.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate">{result.title}</div>
                                {result.subtitle && (
                                    <div className={`text-xs truncate ${index === selectedIndex ? 'text-indigo-600/70' : 'text-gray-400'
                                        }`}>
                                        {result.subtitle}
                                    </div>
                                )}
                            </div>
                            {index === selectedIndex && (
                                <ArrowRight className="w-4 h-4 text-indigo-500" />
                            )}
                        </button>
                    ))}

                    {results.length === 0 && query && (
                        <div className="p-8 text-center text-gray-400">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron resultados para "{query}"</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 dark:bg-aliseus-950 border-t border-gray-100 dark:border-aliseus-800 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><Command className="w-3 h-3" /> <span>Navegar</span></span>
                        <span className="flex items-center gap-1"><span>↵</span> <span>Seleccionar</span></span>
                    </div>
                    <div>
                        Aliseus
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
