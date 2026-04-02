import React from 'react';
import DOMPurify from 'dompurify';
import { useLifeStore } from '@/store/useLifeStore';
import { useUserStore } from '@/store/useUserStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useFinanceControllers } from '@/hooks/useFinanceControllers';
import { analyzeLife } from '@/services/geminiLife';

import {
  Menu, Utensils, Plane, Lock, Baby, Home, Heart, Sparkles, Loader2, X
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../common/animations/PageTransition';
import { Trip, Goal } from '@/types';
import ModuleLoader from '../../common/ui/ModuleLoader';

const KitchenManager = React.lazy(() => import('./KitchenManager').then(m => ({ default: m.KitchenManager })));
const TravelModule = React.lazy(() => import('./TravelModule'));
const FamilyManager = React.lazy(() => import('./FamilyManager').then(m => ({ default: m.FamilyManager })));
const VaultManager = React.lazy(() => import('./VaultManager').then(m => ({ default: m.VaultManager })));
const SpacesManager = React.lazy(() => import('./SpacesManager').then(m => ({ default: m.SpacesManager })));

interface LifeModuleProps {
  onMenuClick: () => void;
}

const LIFE_TEXTS: Record<string, any> = {
  ES: { nav: { overview: 'Resumen', kitchen: 'Cocina', travel: 'Viajes', vault: 'Bóveda', family: 'Familia', spaces: 'Espacios' } },
  EN: { nav: { overview: 'Overview', kitchen: 'Kitchen', travel: 'Travel', vault: 'Vault', family: 'Family', spaces: 'Spaces' } },
  FR: { nav: { overview: 'Aperçu', kitchen: 'Cuisine', travel: 'Voyages', vault: 'Coffre-fort', family: 'Famille', spaces: 'Espaces' } }
};

const LifeModule: React.FC<LifeModuleProps> = ({ onMenuClick }) => {
  // Store Hooks
  const { setTrips, pantryItems, shoppingList, trips } = useLifeStore();
  const {
    lifeActiveTab: activeTab,
    setLifeActiveTab: setActiveTab,
    language,
    addSyncLog, automationRules
  } = useUserStore();
  const { accounts, setGoals, categories, setCategories } = useFinanceStore();

  const t = LIFE_TEXTS[language as string] || LIFE_TEXTS['ES'];
  const currentMainTab = activeTab.split('-')[0];

  const handleCreateTrip = (newTripData: Trip) => {
    const tripToSave = { ...newTripData };

    // Automation: Create Category if rule active
    const rule = automationRules.find((r: any) => r.trigger === 'TRIP_CREATED' && r.isActive);
    if (rule && rule.action === 'CREATE_CATEGORY_FOR_TRIP') {
      const newCatName = `Viaje: ${tripToSave.destination}`;
      if (!categories.find((c: any) => c.name === newCatName)) {
        setCategories((prev: any[]) => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: newCatName,
          type: 'EXPENSE',
          subCategories: ['Vuelos', 'Hotel', 'Comida', 'Ocio']
        }]);
        addSyncLog({ message: `Automatización: Categoría "${newCatName}" creada.`, timestamp: Date.now(), type: 'SYSTEM' });
      }
    }

    // Automation: Create Goal
    if (newTripData.budget > 0) {
      const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        name: `✈️ Viaje a ${newTripData.destination}`,
        targetAmount: newTripData.budget,
        currentAmount: 0,
        deadline: newTripData.startDate,
        accountId: accounts[0]?.id || '1',
        linkedTripId: newTripData.id
      };
      setGoals((prev: any[]) => [newGoal, ...prev]);
      tripToSave.linkedGoalId = newGoal.id;
      addSyncLog({ message: `Meta financiera creada: ${newGoal.name}`, timestamp: Date.now(), type: "FINANCE" });
    }

    setTrips((prev: any[]) => [tripToSave, ...prev]);
    addSyncLog({ message: `Nuevo viaje creado: ${newTripData.destination}`, timestamp: Date.now(), type: "LIFE" });
  };

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isAnalysisVisible, setIsAnalysisVisible] = React.useState(false);

  const handleLifeAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      // Convert ShoppingItem[] to Ingredient[] format
      const shoppingAsIngredients = shoppingList.map((item: any) => ({
        ...item,
        category: 'Other' as const
      }));

      const result = await analyzeLife(
        pantryItems,
        [], // mealPlans - not yet in store
        shoppingAsIngredients,
        trips,
        language as 'ES' | 'EN' | 'FR'
      );
      setAnalysis(result);
      setIsAnalysisVisible(true);
    } catch (error: any) {
      console.error('Life Analysis Error:', error);
      setAnalysis('<strong>Error</strong><br>No se pudo generar el análisis. Por favor, intenta de nuevo.');
      setIsAnalysisVisible(true);
    } finally {
      setIsAnalyzing(false);
    }
  };
 
  interface NavItem {
    id: string;
    label: string;
    icon: any;
  }
 
  const NAV_ITEMS: NavItem[] = [
    { id: 'kitchen', label: t.nav.kitchen, icon: Utensils },
    { id: 'spaces', label: t.nav.spaces, icon: Home },
    { id: 'travel', label: t.nav.travel, icon: Plane },
    { id: 'vault', label: t.nav.vault, icon: Lock },
    { id: 'family', label: t.nav.family, icon: Baby },
  ];
 
  const renderNav = () => (
    <>
      {/* DESKTOP NAV */}
      <div className="hidden md:flex bg-white mx-6 mt-6 p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 items-center justify-between w-fit gap-1 sticky top-6 z-30">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === 'life-overview' ? activeTab === 'life-overview' : currentMainTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'life-overview' ? 'life-overview' : item.id === 'kitchen' ? 'kitchen-dashboard' : item.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden ${isActive ? 'text-white shadow-lg scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gray-900 z-0"></div>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                {item.label}
              </span>
            </button>
          )
        })}
        <button onClick={handleLifeAnalysis} disabled={isAnalyzing} className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-5 py-3 rounded-2xl transition-all shadow-lg font-bold text-sm ml-auto">
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
          {isAnalyzing ? 'Analizando...' : 'Análisis IA'}
        </button>
      </div>
 
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
            <Heart className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight">Aliseus Vida</span>
        </div>
        <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900">
          <Menu className="w-6 h-6" />
        </button>
      </header>
 
      {/* Mobile Segmented Control */}
      <div className="md:hidden px-4 py-4 overflow-x-auto no-scrollbar flex gap-2 snap-x">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === 'life-overview' ? activeTab === 'life-overview' : currentMainTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'life-overview' ? 'life-overview' : item.id === 'kitchen' ? 'kitchen-dashboard' : item.id)}
              className={`snap-start shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${isActive ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </>
  );
 
  return (
    <div className="flex h-full flex-col relative bg-[#FAFAFA]">
      {renderNav()}

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <PageTransition key={currentMainTab === 'kitchen' ? activeTab : activeTab}>
            <React.Suspense fallback={<ModuleLoader />}>
              {currentMainTab === 'kitchen' && (
                <KitchenManager
                  view={activeTab.replace('kitchen-', '').toUpperCase()}
                  onViewChange={(newView: string) => setActiveTab(`kitchen-${newView.toLowerCase()}`)}
                />
              )}
              {activeTab === 'spaces' && <SpacesManager />}
              {activeTab === 'travel' && <TravelModule />}
              {activeTab === 'vault' && <VaultManager />}
              {activeTab === 'family' && <FamilyManager />}
            </React.Suspense>
          </PageTransition>
        </AnimatePresence>
      </div>

      {/* AI ANALYSIS MODAL */}
      {isAnalysisVisible && analysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAnalysisVisible(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Análisis de Vida IA
              </h3>
              <button onClick={() => setIsAnalysisVisible(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
              <div
                className="prose prose-sm prose-gray max-w-none text-gray-600 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(analysis) }}
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setIsAnalysisVisible(false)} className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeModule;
