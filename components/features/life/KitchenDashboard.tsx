import React, { useState } from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { useUserStore } from '@/store/useUserStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { KitchenWidgetType, MealTime, Recipe, Transaction, Ingredient, DashboardWidget } from '@/types';
import { Edit, Eye, EyeOff, Flame, AlertTriangle, ShoppingCart, Activity, Clock, ArrowRight, Sparkles, ChefHat, Sunset, Moon, Coffee, ListChecks, Zap, CreditCard, Leaf } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MacroChart } from './dashboard/MacroChart';

// Import New Widgets
import ExpiringThisWeekWidget from './dashboard/widgets/ExpiringThisWeekWidget';
import SuggestedRecipeWidget from './dashboard/widgets/SuggestedRecipeWidget';
import LowStockProductsWidget from './dashboard/widgets/LowStockProductsWidget';
import VisualWeeklyMenuWidget from './dashboard/widgets/VisualWeeklyMenuWidget';
import MissingIngredientsWidget from './dashboard/widgets/MissingIngredientsWidget';
import UnplannedDaysWidget from './dashboard/widgets/UnplannedDaysWidget';
import CostPerMealWidget from './dashboard/widgets/CostPerMealWidget';
import NutritionalVarietyWidget from './dashboard/widgets/NutritionalVarietyWidget';
import GroceryHistoryWidget from './dashboard/widgets/GroceryHistoryWidget';
import AverageRecipeTimeWidget from './dashboard/widgets/AverageRecipeTimeWidget';
import AvoidedWasteWidget from './dashboard/widgets/AvoidedWasteWidget';

interface KitchenDashboardProps {
   onViewChange: (view: string) => void;
   onOpenAiPlanner: () => void;
   onOpenRecipe: (recipe: Recipe) => void;
}

const WIDGET_NAMES: Record<string, string> = {
    'KITCHEN_EXPIRING': 'Caduca esta Semana',
    'KITCHEN_SUGGESTED': 'Receta Sugerida',
    'KITCHEN_LOW_STOCK': 'Productos Bajo Mínimos',
    'KITCHEN_VISUAL_MENU': 'Menú Semanal Visual',
    'KITCHEN_MISSING_INGS': 'Ingredientes que Faltan',
    'KITCHEN_UNPLANNED': 'Días sin Planificar',
    'KITCHEN_COST_MEAL': 'Coste por Comida',
    'KITCHEN_NUTRI_VARIETY': 'Variedad Nutricional',
    'KITCHEN_GROCERY_HISTORY': 'Supermercados esta Semana',
    'KITCHEN_RECIPE_TIME': 'Tiempo Medio de Recetas',
    'KITCHEN_AVOIDED_WASTE': 'Desperdicio Evitado este Mes',
};

const GREETINGS = {
   morning: { text: 'Buenos días, Chef', sub: 'El desayuno es la comida más importante.', icon: Coffee },
   afternoon: { text: 'Buenas tardes', sub: '¿Qué tal algo ligero para comer?', icon: Sunset },
   evening: { text: 'Buenas noches', sub: 'Hora de preparar una cena deliciosa.', icon: Moon },
};

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ onOpenAiPlanner, onViewChange, onOpenRecipe }) => {
   const { weeklyPlans, pantryItems, shoppingList, widgets, setWidgets } = useLifeStore();
   const { transactions } = useFinanceStore();
   const { setLifeActiveTab } = useUserStore();

   const [isEditingLayout, setIsEditingLayout] = useState(false);




   const toggleWidget = (id: KitchenWidgetType) => {
      setWidgets((prev: DashboardWidget[]) => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
   };

   const isVisible = (id: KitchenWidgetType) => widgets?.find((w: DashboardWidget) => w.id === id)?.visible ?? true;

   const lowStockItems = pantryItems.filter((item: Ingredient) => item.lowStockThreshold && item.quantity <= item.lowStockThreshold);

   // --- NEW CALCULATIONS ---
   // 1. Food Spending
   const currentMonthISO = new Date().toISOString().slice(0, 7);
   const foodSpending = transactions
      .filter((t: Transaction) => t.type === 'EXPENSE' && (t.category === 'Alimentación' || t.category === 'Food') && t.date.startsWith(currentMonthISO))
      .reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);

   // 2. Stock Health %
   const totalPantryItems = pantryItems.length;
   const goodStockItems = pantryItems.filter((item: Ingredient) => !item.lowStockThreshold || item.quantity > item.lowStockThreshold).length;
   const stockHealth = totalPantryItems > 0 ? Math.round((goodStockItems / totalPantryItems) * 100) : 0;

   // 3. Freshness Score
   const expiredCount = pantryItems.filter((item: Ingredient) => item.expiryDate && new Date(item.expiryDate) < new Date()).length;
   const expiringSoonCount = pantryItems.filter((item: Ingredient) => {
      if (!item.expiryDate) return false;
      const exp = new Date(item.expiryDate);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return exp >= new Date() && exp < nextWeek;
   }).length;

   // Formula: Start at 100. Deduct 10 for expired, 5 for expiring soon.
   const freshnessScore = Math.max(0, 100 - (expiredCount * 10) - (expiringSoonCount * 5));

   const hour = new Date().getHours();
   const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
   const greeting = GREETINGS[timeOfDay];

   // Missing variable needed for the Meal Planner card
   const todayStr = new Date().toISOString().split('T')[0];
   const todayMealsObj = weeklyPlans
      .flatMap((p: any) => p.meals) // TODO: Define WeeklyPlan type if needed, but currently it's a bit complex in store
      .filter((m: any) => m.date === todayStr)
      .reduce((acc: Record<string, any[]>, meal: any) => {
         if (!acc[meal.type]) acc[meal.type] = [];
         acc[meal.type].push({ ...meal, id: meal.recipeId, name: meal.recipeName }); // Adapt structure
         return acc;
      }, {} as Record<string, any[]>);

   const todayMeals = {
      breakfast: (todayMealsObj as any).breakfast || [],
      lunch: (todayMealsObj as any).lunch || [],
      dinner: (todayMealsObj as any).dinner || []
   };

   const todayMacros = Object.values(todayMeals).flat().reduce((acc: any, recipe: any) => {
      if (recipe.macros) {
         acc.protein += recipe.protein || recipe.macros.protein || 0;
         acc.carbs += recipe.carbs || recipe.macros.carbs || 0;
         acc.fat += recipe.fat || recipe.macros.fat || 0;
      }
      return acc;
   }, { protein: 0, carbs: 0, fat: 0 });

   return (
      <div className="space-y-8 animate-fade-in custom-scrollbar overflow-y-auto h-full pb-20 pr-1 relative">

         <div className="relative group/header pt-4">
            <div className="flex justify-between items-end relative z-10">
               <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-[10px] uppercase tracking-[0.3em] mb-2 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100/50 shadow-sm">
                     <greeting.icon className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter transition-all group-hover/header:-translate-y-1">
                     {greeting.text}
                  </h1>
                  <p className="text-gray-400 font-bold mt-1 text-sm">{greeting.sub}</p>
               </div>

               <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end mr-4">
                     <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Aliseus Kitchen v3.0</span>
                     <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-100/50 px-2 py-0.5 rounded-md">Aliseus Premium</span>
                     </div>
                  </div>
                  <button onClick={() => setIsEditingLayout(!isEditingLayout)} className={`p-3 border rounded-2xl transition-all shadow-sm active:scale-90 ${isEditingLayout ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                     <Edit className="w-5 h-5" />
                  </button>
               </div>
            </div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-400/5 blur-[100px] rounded-full pointer-events-none"></div>
         </div>

         {isEditingLayout && (
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md p-4 rounded-3xl mb-6 text-white animate-fade-in-up shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Configurar Resumen</h3>
                  <button onClick={() => setIsEditingLayout(false)} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200">Terminar</button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {(widgets || []).map((w: any) => (
                     <button
                        key={w.id}
                        onClick={() => toggleWidget(w.id as KitchenWidgetType)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${w.visible ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-gray-600 text-gray-400'}`}
                     >
                        {w.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {WIDGET_NAMES[w.id as KitchenWidgetType] || w.id}
                     </button>
                  ))}
               </div>
            </div>
         )}

         {isEditingLayout && (
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md p-4 rounded-3xl mb-6 text-white animate-fade-in-up shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-white">Personalizar Dashboard de Cocina</h3>
                  <button onClick={() => setIsEditingLayout(false)} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Terminar</button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {Object.entries(WIDGET_NAMES).map(([id, name]) => (
                     <button
                        key={id}
                        onClick={() => toggleWidget(id as any)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isVisible(id as any) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}
                     >
                        {isVisible(id as any) ? <Eye className="w-3 h-3 text-white" /> : <EyeOff className="w-3 h-3" />}
                        {name}
                     </button>
                  ))}
               </div>
            </div>
         )}

         {/* 🔴 SECCIÓN: ALERTAS / ACCIÓN INMEDIATA */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isVisible('KITCHEN_EXPIRING') && <ExpiringThisWeekWidget onNavigate={() => {}} />}
            {isVisible('KITCHEN_LOW_STOCK') && <LowStockProductsWidget onNavigate={() => {}} />}
            {isVisible('KITCHEN_SUGGESTED') && <SuggestedRecipeWidget onNavigate={() => {}} />}
         </div>

         {/* 🟡 SECCIÓN: PLANIFICACIÓN SEMANAL */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {isVisible('KITCHEN_VISUAL_MENU') && (
               <div className="lg:col-span-8">
                  <VisualWeeklyMenuWidget onNavigate={() => {}} />
               </div>
            )}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
               {isVisible('KITCHEN_MISSING_INGS') && <MissingIngredientsWidget onNavigate={() => {}} />}
               {isVisible('KITCHEN_UNPLANNED') && <UnplannedDaysWidget onNavigate={() => {}} />}
            </div>
         </div>

         {/* 🔵 SECCIÓN: ANÁLISIS Y HÁBITOS */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isVisible('KITCHEN_COST_MEAL') && <CostPerMealWidget onNavigate={() => {}} />}
            {isVisible('KITCHEN_NUTRI_VARIETY') && <NutritionalVarietyWidget onNavigate={() => {}} />}
            {isVisible('KITCHEN_GROCERY_HISTORY') && <GroceryHistoryWidget onNavigate={() => {}} />}
            {isVisible('KITCHEN_RECIPE_TIME') && <AverageRecipeTimeWidget onNavigate={() => {}} />}
         </div>

         {/* ✨ SECCIÓN PREMIUM: IMPACTO */}
         {isVisible('KITCHEN_AVOIDED_WASTE') && (
            <div className="w-full h-[320px]">
               <AvoidedWasteWidget onNavigate={() => {}} />
            </div>
         )}
      </div>
   );
};
