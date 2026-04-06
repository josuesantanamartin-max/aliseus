import React, { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUserStore } from '@/store/useUserStore';
import { useLifeStore } from '@/store/useLifeStore';
import { Transaction, Budget, Account, Goal, CategoryStructure, Debt } from '@/types';
import { Moon, Sunset, Settings, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/Button';

import { DashboardDataProps } from '@/types/dashboard';
import IntelligenceHeader from './zones/IntelligenceHeader';
import AuraThemeBar, { AuraTheme } from './zones/AuraThemeBar';
import AuraCommandBar from './zones/AuraCommandBar';
import AuraFinanceOverview from './zones/AuraFinanceOverview';
import AuraKitchenOverview from './zones/AuraKitchenOverview';
import AuraTravelOverview from './zones/AuraTravelOverview';
import AuraFamilyOverview from './zones/AuraFamilyOverview';
import AuraInvestmentsOverview from './zones/AuraInvestmentsOverview';
import BetaFeedbackWidget from './BetaFeedbackWidget';
import { DASHBOARD_TEXTS } from '@/i18n/dashboardTexts';



// Utility for formatting currency
const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const AuraDashboard: React.FC = () => {
    const { 
        theme, setTheme, setActiveApp, setFinanceActiveTab, setLifeActiveTab,
        language
    } = useUserStore();


    const {
        transactions = [], accounts = [], debts = [], categories = [], goals = [], budgets = []
    } = useFinanceStore();

    const monthlyIncome = useMemo(() => {
        const now = new Date();
        return transactions
            .filter((t: Transaction) => new Date(t.date).getMonth() === now.getMonth() && t.type === 'INCOME' && t.category !== 'Transferencia')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    }, [transactions]);

    const monthlyExpenses = useMemo(() => {
        const now = new Date();
        return transactions
            .filter((t: Transaction) => new Date(t.date).getMonth() === now.getMonth() && t.type === 'EXPENSE' && t.category !== 'Transferencia')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    }, [transactions]);

    const {
        pantryItems = [], shoppingList = [], trips = [], weeklyPlans = [], recipes = [], familyMembers = [], vaultDocuments = [], homeAssets = []
    } = useLifeStore();

    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const hour = currentTime.getHours();

    // Aura Thematic View State
    const [activeTheme, setActiveTheme] = useState<AuraTheme>(() => {
        const saved = localStorage.getItem('aura_active_theme');
        return (saved as AuraTheme) || 'finances';
    });

    useEffect(() => {
        localStorage.setItem('aura_active_theme', activeTheme);
    }, [activeTheme]);

    const handleNavigate = (app: string, tab?: string) => {
        setActiveApp(app);
        if (app === 'finance' && tab) setFinanceActiveTab(tab);
        if (app === 'life' && tab) setLifeActiveTab(tab);
    };

    const widgetProps: DashboardDataProps = {
        transactions,
        accounts,
        debts,
        goals,
        categories,
        budgets,
        monthlyIncome,
        monthlyExpenses,
        onNavigate: handleNavigate,
        selectedDate: currentTime,
        timeMode: 'MONTH',
    };

    return (
        <div
            className="h-full bg-aliseus-50 dark:bg-aliseus-950 overflow-y-auto custom-scrollbar relative flex flex-col pb-12"
        >
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">
                {/* --- HEADER --- */}
                <IntelligenceHeader
                    selectedDate={activeTheme === 'finances' ? selectedDate : undefined}
                    onDateChange={activeTheme === 'finances' ? setSelectedDate : undefined}
                    onNavigate={handleNavigate}
                    activeModule={activeTheme}
                />

                {/* --- THEME NAVIGATION --- */}
                <AuraThemeBar activeTheme={activeTheme} onThemeChange={setActiveTheme} />



                {/* --- DYNAMIC VIEWS --- */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <React.Suspense fallback={<div className="flex items-center justify-center p-12 text-aliseus-400 font-bold m-auto">Loading...</div>}>

                        {activeTheme === 'finances' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraFinanceOverview selectedDate={selectedDate} />
                            </div>
                        )}

                        {activeTheme === 'kitchen' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraKitchenOverview selectedDate={selectedDate} />
                            </div>
                        )}

                        {activeTheme === 'travel' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraTravelOverview selectedDate={selectedDate} onNavigate={handleNavigate} />
                            </div>
                        )}

                        {activeTheme === 'family' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraFamilyOverview />
                            </div>
                        )}

                        {activeTheme === 'investments' && (
                            <div className="mx-auto w-full space-y-8 pb-12">
                                <AuraInvestmentsOverview selectedDate={selectedDate} onNavigate={handleNavigate} />
                            </div>
                        )}
                    </React.Suspense>
                </div>
            </div>



        </div>
    );
};


export default AuraDashboard;
