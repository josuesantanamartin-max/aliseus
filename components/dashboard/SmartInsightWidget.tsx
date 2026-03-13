import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useLifeStore } from '../../store/useLifeStore';
import { generateSmartInsight } from '../../services/geminiCore';
import { analyzePredictive } from '../../services/geminiFinancial';
import { Lightbulb, ArrowRight, Sparkles, ChefHat, AlertTriangle, TrendingUp, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SmartInsightWidgetProps {
    onNavigate?: (app: 'LIFE' | 'FINANCE', tab?: string, filter?: any) => void;
}

const SmartInsightWidget: React.FC<SmartInsightWidgetProps> = ({ onNavigate }) => {
    const { language } = useUserStore();
    const { transactions, currency } = useFinanceStore();
    const { pantryItems } = useLifeStore();

    const [insight, setInsight] = useState<{
        title: string;
        insight: string;
        savingsEstimate?: string;
        actionableRecipe?: { name: string; matchReason: string };
        severity?: 'HIGH' | 'MEDIUM' | 'LOW';
        type?: 'ANOMALY' | 'SAVINGS' | 'RECIPE_MATCH';
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);

        try {
            // Strategy: 
            // 1. Check for Financial Anomalies (High Priority)
            // 2. If none, check for Smart Cross-Module Insights (Recipe + Finance)

            // 1. predictive Analysis
            const anomalies = await analyzePredictive(transactions, 'ANOMALY', language as 'ES' | 'EN' | 'FR');

            if (anomalies && anomalies.length > 0) {
                // Find the most severe anomaly
                const severe = anomalies.find((a: any) => a.severity === 'HIGH') || anomalies[0];
                if (severe) {
                    setInsight({
                        title: language === 'ES' ? 'Alerta de Gasto Detectada' : 'Spending Alert Detected',
                        insight: severe.reason || severe.description, // "Detectamos que gastas mucho en Uber"
                        severity: severe.severity,
                        type: 'ANOMALY',
                        savingsEstimate: `${currency}${severe.amount}`
                    });
                    setLoading(false);
                    return;
                }
            }

            // 2. Cross-Module Smart Insight (Fallback)
            // simple heuristic for top categories
            const expensesByCategory: Record<string, number> = {};
            transactions
                .filter(t => t.type === 'EXPENSE')
                .forEach(t => {
                    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
                });

            const topCategories = Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([cat]) => cat);

            const totalSpend = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
            const pantryNames = pantryItems.map(i => i.name);

            const result = await generateSmartInsight(
                { topCategories, monthlySpending: totalSpend, currency },
                pantryNames,
                language as 'ES' | 'EN' | 'FR'
            );

            if (result) {
                setInsight({
                    ...result,
                    type: 'SAVINGS'
                });
            }
        } catch (error) {
            console.error("Error generating insight:", error);
        } finally {
            setLoading(false);
        }
    };

    if (dismissed) return null;

    if (!insight && !loading) {
        return (
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer" onClick={handleGenerate}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">IA Native</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">
                            {language === 'ES' ? 'Aliseus Insights' : 'Aliseus Insights'}
                        </h3>
                        <p className="text-white/80 text-sm max-w-sm">
                            {language === 'ES' ? 'Analizar mis finanzas y detectar patrones.' : 'Analyze my finances and detect patterns.'}
                        </p>
                    </div>
                    <div className="bg-white text-cyan-600 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6" />
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-onyx-900 border border-gray-100 dark:border-onyx-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[160px] animate-pulse">
                <Sparkles className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-500">
                    {language === 'ES' ? 'Analizando millones de puntos de datos...' : 'Analyzing millions of data points...'}
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-onyx-900 border ${insight?.type === 'ANOMALY' ? 'border-red-100 dark:border-red-900/30' : 'border-cyan-100 dark:border-cyan-900/30'} rounded-3xl p-6 shadow-xl shadow-cyan-500/5 relative overflow-hidden animate-fade-in ring-1 ring-cyan-500/10`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${insight?.type === 'ANOMALY' ? 'bg-red-500/5' : 'bg-cyan-500/5'} rounded-full blur-3xl -mr-10 -mt-10`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 ${insight?.type === 'ANOMALY' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600'} rounded-xl`}>
                            {insight?.type === 'ANOMALY' ? <AlertTriangle className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
                        </div>
                        <div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${insight?.type === 'ANOMALY' ? 'text-red-500' : 'text-cyan-500'}`}>Aliseus Insights</span>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{insight?.title}</h3>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => setDismissed(true)} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    {insight?.insight}
                </p>

                {insight?.actionableRecipe && (
                    <div className="bg-gray-50 dark:bg-onyx-800 rounded-2xl p-4 flex flex-col gap-2 mb-4">
                        <h3 className="text-sm font-black text-onyx-950 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Aliseus Insights
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white dark:bg-onyx-700 rounded-full shadow-sm">
                                <ChefHat className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{insight.actionableRecipe.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{insight.actionableRecipe.matchReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-onyx-800">
                    <div className="text-xs">
                        <span className="text-gray-400">{insight?.type === 'ANOMALY' ? (language === 'ES' ? 'Impacto' : 'Impact') : (language === 'ES' ? 'Ahorro est.' : 'Est. Savings')}</span>
                        <p className={`font-black ${insight?.type === 'ANOMALY' ? 'text-red-600' : 'text-emerald-600'} text-lg`}>{insight?.savingsEstimate || '-'}</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            // Smart navigation based on insight content
                            if (insight?.actionableRecipe && onNavigate) {
                                onNavigate('LIFE', 'kitchen-recipes');
                            } else if (onNavigate) {
                                onNavigate('FINANCE', 'transactions');
                            }
                        }}
                        className="px-4 py-2 rounded-lg text-xs flex items-center gap-2"
                    >
                        {language === 'ES' ? 'Ver Detalles' : 'View Details'} <ArrowRight className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SmartInsightWidget;
