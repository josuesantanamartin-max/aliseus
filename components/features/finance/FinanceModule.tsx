import React, { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { analyzeFinances } from '@/services/geminiFinancial';
import { Wallet, Menu, CreditCard, PieChart, Target, ReceiptEuro, Sparkles, Loader2, X } from 'lucide-react';

import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../common/animations/PageTransition';
import ModuleLoader from '../../common/ui/ModuleLoader';

const Transactions = React.lazy(() => import('./transactions/Transactions'));
const Debts = React.lazy(() => import('./Debts'));
const Goals = React.lazy(() => import('./Goals'));
const Accounts = React.lazy(() => import('./Accounts'));
const Budgets = React.lazy(() => import('./Budgets'));
const Projects = React.lazy(() => import('./Projects'));
const RetirementSimulator = React.lazy(() => import('./RetirementSimulator').then(m => ({ default: m.RetirementSimulator })));
// <button onClick={() => setActiveTab('retirement')} ...>Jubilación</button>

// ... inside renderContent ...
// case 'retirement': return <RetirementSimulator />;

interface FinanceModuleProps {
    onMenuClick: () => void;
    onNavigate: (app: string, tab?: string) => void;
}

const FinanceModule: React.FC<FinanceModuleProps> = ({ onMenuClick }) => {

    const {
        financeActiveTab: activeTab,
        setFinanceActiveTab: setActiveTab,
        language, currency
    } = useUserStore();

    const { transactions, accounts, debts, budgets, goals } = useFinanceStore();

    // AI Analysis State
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);

    const handleGeminiAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);
        try {
            const result = await analyzeFinances(transactions, accounts, debts, budgets, goals, language, currency);
            setAnalysis(result);
            setIsAnalysisVisible(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderNav = () => (
        <div className="bg-white border-b border-onyx-100 px-10 py-3 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 relative z-10 shadow-sm">
            <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'transactions' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Movimientos</button>
            <button onClick={() => setActiveTab('accounts')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'accounts' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Cuentas</button>
            <button onClick={() => setActiveTab('budgets')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'budgets' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Presupuestos</button>
            <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'projects' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Proyectos</button>
            <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'goals' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Metas</button>
            <button onClick={() => setActiveTab('debts')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'debts' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Deudas</button>
            <button onClick={() => setActiveTab('retirement')} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'retirement' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/20 scale-105' : 'text-onyx-400 hover:text-onyx-900 hover:bg-onyx-50'}`}>Jubilación</button>
            <button onClick={handleGeminiAnalysis} disabled={isAnalyzing} className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700 shadow-lg shadow-cyan-900/20 ml-auto">
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-cyan-100" />}
                {isAnalyzing ? 'Analizando...' : 'Aliseus Insights'}
            </button>
        </div>
    );

    const renderContent = () => {
        let content;
        switch (activeTab) {
            case 'transactions': content = <Transactions />; break;
            case 'accounts': content = <Accounts onViewTransactions={(id) => { setActiveTab('transactions'); }} />; break;
            case 'budgets': content = <Budgets onViewTransactions={(c, s) => { setActiveTab('transactions'); }} />; break;
            case 'projects': content = <Projects onViewTransactions={() => { setActiveTab('transactions'); }} />; break;
            case 'goals': content = <Goals />; break;
            case 'debts': content = <Debts />; break;
            case 'retirement': content = <RetirementSimulator />; break;
            default: content = <Transactions />;
        }
        return (
            <AnimatePresence mode="wait">
                <PageTransition key={activeTab}>
                    <React.Suspense fallback={<ModuleLoader />}>
                        {content}
                    </React.Suspense>
                </PageTransition>
            </AnimatePresence>
        );
    };

    return (
        <div className="flex h-full flex-col bg-[#FAFAFA]">
            <header className="md:hidden bg-white border-b border-onyx-100 p-6 flex justify-between items-center z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
                        <Wallet className="text-white w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-cyan-900 text-base leading-none uppercase tracking-tight">Aliseus <span className="text-cyan-600">Finanzas</span></span>
                        <span className="text-[8px] font-bold text-onyx-300 uppercase tracking-[0.2em] mt-1">Management Suite</span>
                    </div>
                </div>
                <button onClick={onMenuClick} className="p-2 text-onyx-400 hover:text-onyx-900 transition-colors"><Menu className="w-6 h-6" /></button>
            </header>

            {renderNav()}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto py-10 px-6 md:px-10">
                    {renderContent()}
                </div>
            </div>

            {/* AI ANALYSIS MODAL */}
            {isAnalysisVisible && analysis && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cyan-950/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAnalysisVisible(false)}>
                    <div className="bg-white dark:bg-onyx-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-onyx-800 flex justify-between items-center bg-white dark:bg-onyx-900">
                            <h3 className="text-lg font-black text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-cyan-500" />
                                {language === 'ES' ? 'Aliseus Insights: Análisis Financiero' : 'Aliseus Insights: Financial Analysis'}
                            </h3>
                            <button onClick={() => setIsAnalysisVisible(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-onyx-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-cyan-900/50">
                            <div
                                className="prose prose-sm prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-white dark:bg-onyx-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-onyx-800"
                                dangerouslySetInnerHTML={{ __html: analysis }}
                            />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-onyx-800 border-t border-gray-100 dark:border-onyx-700 flex justify-end">
                            <button onClick={() => setIsAnalysisVisible(false)} className="px-5 py-2.5 bg-cyan-600 dark:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-colors">
                                {language === 'ES' ? 'Cerrar' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceModule;
