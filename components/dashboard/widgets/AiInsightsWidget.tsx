import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUserStore } from '@/store/useUserStore';
import { analyzePredictive } from '@/services/geminiFinancial';

type InsightTab = 'FORECAST' | 'ANOMALY' | 'SAVINGS';

export const AiInsightsWidget: React.FC = () => {
    const [activeTab, setActiveTab] = useState<InsightTab>('FORECAST');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    const { transactions } = useFinanceStore();
    const { language } = useUserStore();

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await analyzePredictive(transactions, activeTab, language);
                if (isMounted) setData(result);
            } catch (error) {
                console.error("AI Insights error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const timer = setTimeout(fetchData, 500);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [activeTab, transactions, language]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-indigo-400 h-full">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-bold animate-pulse">Analizando tus finanzas con Gemini...</p>
                </div>
            );
        }

        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-gray-400 h-full text-center">
                    <p className="text-sm">Explora más la app y añade datos o espera a que la IA genere observaciones detalladas.</p>
                </div>
            );
        }

        return (
            <div className="animate-fadeIn relative z-10 text-sm text-gray-700 dark:text-gray-300">
                {Array.isArray(data) ? (
                    <ul className="space-y-3">
                        {data.map((item, i) => (
                            <li key={i} className="flex gap-3 items-start bg-white/50 dark:bg-onyx-900/50 p-4 rounded-2xl shadow-sm border border-white/50 dark:border-onyx-800">
                                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shrink-0 mt-0.5">
                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="leading-relaxed font-medium">
                                    {typeof item === 'string' ? item : item.message || JSON.stringify(item)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="bg-white/50 dark:bg-onyx-900/50 p-5 rounded-2xl leading-relaxed whitespace-pre-wrap font-medium border border-white/50 dark:border-onyx-800 shadow-sm">
                        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 dark:from-indigo-950/30 dark:via-onyx-900 dark:to-violet-950/20 rounded-[32px] p-6 lg:p-8 border border-indigo-100/50 dark:border-indigo-900/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden mb-8 ring-1 ring-white/50 dark:ring-white/5">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-stretch">
                
                <div className="shrink-0 lg:w-72 flex flex-col">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">AI Insights</h2>
                        </div>
                        <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full inline-block">
                            Gemini 2.0 Flash
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-auto">
                        <button
                            onClick={() => setActiveTab('FORECAST')}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                                activeTab === 'FORECAST' 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]' 
                                : 'bg-white/60 dark:bg-onyx-800/60 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-onyx-800 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <TrendingUp className="w-4.5 h-4.5" />
                            Pronóstico a 3 Meses
                        </button>
                        <button
                            onClick={() => setActiveTab('ANOMALY')}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                                activeTab === 'ANOMALY' 
                                ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]' 
                                : 'bg-white/60 dark:bg-onyx-800/60 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-onyx-800 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <AlertTriangle className="w-4.5 h-4.5" />
                            Detectar Anomalías
                        </button>
                        <button
                            onClick={() => setActiveTab('SAVINGS')}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                                activeTab === 'SAVINGS' 
                                ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-[1.02]' 
                                : 'bg-white/60 dark:bg-onyx-800/60 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-onyx-800 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Lightbulb className="w-4.5 h-4.5" />
                            Ahorro Inteligente
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white/60 dark:bg-onyx-950/60 rounded-[28px] border border-white dark:border-onyx-800 p-6 lg:p-8 min-h-[300px] backdrop-blur-md relative shadow-inner">
                    {renderContent()}
                </div>

            </div>
        </div>
    );
};
