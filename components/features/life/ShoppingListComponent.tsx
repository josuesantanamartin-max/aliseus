import React, { useState, useMemo, useEffect } from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { useUserStore } from '@/store/useUserStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useFinanceControllers } from '@/hooks/useFinanceControllers';
import { ShoppingItem, Ingredient, Recipe } from '@/types';
import { ShoppingCart, Copy, Plus, Check, ChefHat, Minus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';

interface ShoppingListProps {
   // All state managed via stores
}

const CATEGORY_COLORS: Record<string, string> = {
   'Vegetables': 'bg-emerald-100 text-emerald-700 border-emerald-200',
   'Fruits': 'bg-orange-100 text-orange-700 border-orange-200',
   'Dairy': 'bg-blue-100 text-blue-700 border-blue-200',
   'Meat': 'bg-red-100 text-red-700 border-red-200',
   'Pantry': 'bg-amber-100 text-amber-700 border-amber-200',
   'Spices': 'bg-rose-100 text-rose-700 border-rose-200',
   'Frozen': 'bg-cyan-100 text-cyan-700 border-cyan-200',
   'Other': 'bg-gray-100 text-gray-700 border-gray-200'
};

const CATEGORY_DISPLAY_NAMES: Record<string, Record<string, string>> = {
   ES: {
      'Vegetables': 'Verduras',
      'Fruits': 'Frutas',
      'Dairy': 'Lácteos',
      'Meat': 'Carne y Pescado',
      'Pantry': 'Despensa',
      'Spices': 'Especias',
      'Frozen': 'Congelados',
      'Other': 'Otros'
   },
   EN: {
      'Vegetables': 'Vegetables',
      'Fruits': 'Fruits',
      'Dairy': 'Dairy',
      'Meat': 'Meat & Fish',
      'Pantry': 'Pantry',
      'Spices': 'Spices',
      'Frozen': 'Frozen',
      'Other': 'Other'
   },
   FR: {
      'Vegetables': 'Légumes',
      'Fruits': 'Fruits',
      'Dairy': 'Produits Laitiers',
      'Meat': 'Viande et Poisson',
      'Pantry': 'Garde-manger',
      'Spices': 'Épices',
      'Frozen': 'Surgelés',
      'Other': 'Autres'
   }
};

import { getIngredientCategory } from '@/utils/foodUtils';

export const ShoppingListComponent: React.FC<ShoppingListProps> = () => {
   const { shoppingList, setShoppingList, setPantryItems } = useLifeStore();
   const { language, quickAction, setQuickAction } = useUserStore();
   const { accounts } = useFinanceStore();
   const { addTransaction } = useFinanceControllers();

   const [shoppingViewMode, setShoppingViewMode] = useState<'CATEGORY' | 'RECIPE' | 'LIST'>('CATEGORY');
   const [isAddShoppingItemOpen, setIsAddShoppingItemOpen] = useState(false);
   const [shoppingItemName, setShoppingItemName] = useState('');
   const [shoppingItemQty, setShoppingItemQty] = useState('1');
   const [shoppingItemUnit, setShoppingItemUnit] = useState('pcs');
   const [isPurchasedSectionExpanded, setIsPurchasedSectionExpanded] = useState(false);
   const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

   const { defaultShoppingAccount, setDefaultShoppingAccount } = useUserStore();

   useEffect(() => {
      if (quickAction?.type === 'ADD_SHOPPING_ITEM') {
         setIsAddShoppingItemOpen(true);
         setShoppingItemName('');
         setQuickAction(null);
      }
   }, [quickAction, setQuickAction]);

   const groupedShoppingItems = useMemo(() => {
      const activeGroups: Record<string, ShoppingItem[]> = {};
      const purchasedItems: ShoppingItem[] = [];

      shoppingList.forEach((item: ShoppingItem) => {
         if (item.checked) {
            // Purchased items go to a separate array
            purchasedItems.push(item);
         } else {
            // Active items are grouped normally
            if (shoppingViewMode === 'CATEGORY') {
               const key = item.category || getIngredientCategory(item.name);
               if (!activeGroups[key]) activeGroups[key] = [];
               activeGroups[key].push(item);
            } else if (shoppingViewMode === 'RECIPE') {
               const recipeNames = item.source?.recipeName ? item.source.recipeName.split(', ') : [language === 'ES' ? 'Extra (Manual)' : 'Extra (Manual)'];
               recipeNames.forEach(recipeName => {
                  const key = recipeName.trim();
                  if (!activeGroups[key]) activeGroups[key] = [];
                  activeGroups[key].push(item);
               });
            } else {
               const key = language === 'ES' ? 'Lista Completa' : 'Full List';
               if (!activeGroups[key]) activeGroups[key] = [];
               activeGroups[key].push(item);
            }
         }
      });

      return { activeGroups, purchasedItems };
   }, [shoppingList, shoppingViewMode]);

   const handleToggleShoppingItem = (id: string) => {
      setShoppingList((prev: ShoppingItem[]) => {
         const item = prev.find(i => i.id === id);
         if (!item) return prev;

         const isChecking = !item.checked;

         // If we are checking it off (bought it), we should also ADD it to the pantry
         // so the calculation knows we have it now.
         if (isChecking && item.source?.type === 'SMART_PLAN') {
            setPantryItems((prevPantry: Ingredient[]) => {
               const existing = prevPantry.find(p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim());
               if (existing) {
                  return prevPantry.map(p => p.id === existing.id ? { ...p, quantity: p.quantity + item.quantity } : p);
               } else {
                  return [...prevPantry, {
                     id: Math.random().toString(36).substr(2, 9),
                     name: item.name,
                     quantity: item.quantity,
                     unit: item.unit,
                     category: (item.category as any) || 'Other'
                  }];
               }
            });
         }

         return prev.map((i: ShoppingItem) => i.id === id ? { ...i, checked: isChecking } : i);
      });
   };

   const handleUpdateShoppingItemQuantity = (id: string, delta: number) => {
      setShoppingList((prev: ShoppingItem[]) => prev.map(item => {
         if (item.id === id) {
            const newQty = Math.max(0.1, parseFloat((item.quantity + delta).toFixed(2)));
            return { ...item, quantity: newQty };
         }
         return item;
      }));
   };

   const handlePartialPurchase = (id: string, recipeName: string) => {
      const item = shoppingList.find(i => i.id === id);
      if (!item || !item.source?.recipeBreakdown?.[recipeName]) return;

      const recipeQty = item.source.recipeBreakdown[recipeName];

      // 1. ADD TO PANTRY (Back-end source of truth)
      setPantryItems((prevPantry: Ingredient[]) => {
         const existing = prevPantry.find(p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim());
         if (existing) {
            return prevPantry.map(p => p.id === existing.id ? { ...p, quantity: p.quantity + recipeQty } : p);
         } else {
            return [...prevPantry, {
               id: Math.random().toString(36).substr(2, 9),
               name: item.name,
               quantity: recipeQty,
               unit: item.unit,
               category: (item.category as any) || 'Other'
            }];
         }
      });

      // 2. REMOVE LOCALLY FROM UI BREAKDOWN (Instant Feedback)
      setShoppingList((prev: ShoppingItem[]) => prev.map(i => {
         if (i.id === id && i.source?.recipeBreakdown?.[recipeName]) {
            const newBreakdown = { ...i.source.recipeBreakdown };
            delete newBreakdown[recipeName];
            const newQty = Math.max(0, parseFloat((i.quantity - recipeQty).toFixed(2)));

            return {
               ...i,
               quantity: newQty,
               checked: newQty <= 0,
               source: {
                  ...i.source,
                  recipeName: Object.keys(newBreakdown).join(', '),
                  recipeBreakdown: newBreakdown
               }
            };
         }
         return i;
      }));
   };
   const handleAddToShoppingList = (itemName: string, quantity: number, unit: string) => {
      const category = getIngredientCategory(itemName);
      setShoppingList((prev: ShoppingItem[]) => [...prev, {
         id: Math.random().toString(36).substr(2, 9),
         name: itemName,
         quantity,
         unit,
         checked: false,
         category: category,
         source: { type: 'MANUAL', recipeName: 'Extra (Manual)' }
      }]);
   };

   const handleSaveShoppingItem = () => {
      if (!shoppingItemName) return;
      handleAddToShoppingList(shoppingItemName, parseFloat(shoppingItemQty) || 1, shoppingItemUnit);
      setIsAddShoppingItemOpen(false);
      setShoppingItemName('');
   };

   const handleOpenPurchaseModal = () => {
      const itemsToBuy = shoppingList.filter(i => i.checked);
      if (itemsToBuy.length === 0) {
         alert('Por favor, selecciona al menos un item para comprar');
         return;
      }
      setIsPurchaseModalOpen(true);
   };

   const handleConfirmPurchase = (totalPrice: number, accountId: string, saveAsDefault: boolean) => {
      const itemsToBuy = shoppingList.filter(i => i.checked);
      if (itemsToBuy.length === 0) return;

      // Añadir items a la despensa
      setPantryItems((prevPantry: Ingredient[]) => {
         const newPantry = [...prevPantry];
         itemsToBuy.forEach(boughtItem => {
            const pantryIndex = newPantry.findIndex(p => p.name.toLowerCase() === boughtItem.name.toLowerCase());
            if (pantryIndex > -1) {
               newPantry[pantryIndex] = {
                  ...newPantry[pantryIndex],
                  quantity: newPantry[pantryIndex].quantity + boughtItem.quantity
               };
            } else {
               newPantry.push({
                  id: Math.random().toString(36).substr(2, 9),
                  name: boughtItem.name,
                  quantity: boughtItem.quantity,
                  unit: boughtItem.unit as any,
                  category: (boughtItem.category as any) || 'Pantry',
                  lowStockThreshold: 1
               });
            }
         });
         return newPantry;
      });

      // Crear transacción financiera
      addTransaction({
         type: 'EXPENSE',
         amount: totalPrice,
         date: new Date().toISOString().split('T')[0],
         category: 'Alimentación',
         subCategory: 'Supermercado',
         accountId: accountId,
         description: `Compra: ${itemsToBuy.length} items de cocina`
      });

      // Guardar cuenta predeterminada si el usuario lo solicita
      if (saveAsDefault) {
         setDefaultShoppingAccount(accountId);
      }

      // Eliminar items comprados de la lista
      setShoppingList((prev: ShoppingItem[]) => prev.filter(i => !i.checked));

      // Cerrar modal
      setIsPurchaseModalOpen(false);
   };

   const handleCopyShoppingList = () => {
      const listText = shoppingList.map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n');
      navigator.clipboard.writeText(listText).then(() => alert("Lista copiada"));
   };

   return (
      <div className="h-full flex flex-col animate-fade-in pb-20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shrink-0">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
               <div className="flex bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-1.5 shadow-sm overflow-x-auto no-scrollbar w-full md:w-auto">
                  {[
                     { id: 'CATEGORY', label: 'Categoría' },
                     { id: 'RECIPE', label: 'Receta' },
                     { id: 'LIST', label: 'Lista' }
                  ].map(mode => (
                     <button
                        key={mode.id}
                        onClick={() => setShoppingViewMode(mode.id as any)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${shoppingViewMode === mode.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                     >
                        {mode.label}
                     </button>
                  ))}
               </div>
               <button
                  onClick={handleCopyShoppingList}
                  className="p-4 text-gray-400 hover:text-emerald-600 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm transition-all active:scale-95 group"
                  title="Copiar Lista"
               >
                  <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
               </button>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button
                  onClick={handleOpenPurchaseModal}
                  className="flex-1 md:flex-none bg-[#0D0D12] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95 border border-white/10"
               >
                  <Check className="w-5 h-5 text-emerald-500" /> Confirmar Compra
               </button>
               <button
                  onClick={() => { setIsAddShoppingItemOpen(true); setShoppingItemName(''); }}
                  className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95 transform hover:rotate-90 duration-500"
               >
                  <Plus className="w-6 h-6" />
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            {shoppingList.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-16 h-16 opacity-20 mb-4" />
                  <p className="font-bold mb-6">Todo en orden. No necesitas comprar nada.</p>
                  <button onClick={() => { setIsAddShoppingItemOpen(true); setShoppingItemName(''); }} className="px-6 py-3 bg-[#0D0D12] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
                     <Plus className="w-4 h-4 text-emerald-500" /> Añadir Producto
                  </button>
               </div>
            ) : (
               <div className="space-y-8">
                  {Object.entries(groupedShoppingItems.activeGroups).map(([group, items]: [string, ShoppingItem[]]) => (group !== 'null' && group !== 'undefined' && (
                     <div key={group} className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pb-3 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center gap-3">
                           {shoppingViewMode === 'CATEGORY' ? (
                              <div className={`w-4 h-1 rounded-full ${CATEGORY_COLORS[group as keyof typeof CATEGORY_COLORS] || 'bg-gray-200'}`}></div>
                           ) : <ChefHat className="w-4 h-4 text-emerald-500" />}
                           {shoppingViewMode === 'CATEGORY' ? (CATEGORY_DISPLAY_NAMES[language as string]?.[group] || group) : group}
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                           {items.map(item => (
                              <div
                                 key={`${group}-${item.id}`}
                                 onClick={() => handleToggleShoppingItem(item.id)}
                                 className="flex items-center justify-between p-6 rounded-[2rem] border bg-white border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
                              >
                                 <div className="flex items-center gap-5">
                                    <div className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 group-hover:border-emerald-400 text-transparent'}`}>
                                       <Check className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <p className={`font-black text-lg uppercase tracking-tight transition-all ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-emerald-800'}`}>{item.name}</p>
                                       <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-gray-300 mt-1">
                                          {(item.source?.type === 'RECIPE' || item.source?.type === 'SMART_PLAN') && <span className="text-purple-400 flex items-center gap-1.5"><ChefHat className="w-3.5 h-3.5" /> {language === 'ES' ? 'Receta' : 'Recipe'}</span>}
                                          {shoppingViewMode === 'RECIPE' && item.source?.recipeName?.includes(',') && <span className="text-amber-500 flex items-center gap-1.5"><Copy className="w-3 h-3" /> {language === 'ES' ? 'Compartido' : 'Shared'}</span>}
                                          {item.category && <span className="flex items-center gap-1.5 opacity-60"><ShoppingCart className="w-3.5 h-3.5" /> {CATEGORY_DISPLAY_NAMES[language as string]?.[item.category] || item.category}</span>}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-6">
                                    <div className="text-right flex flex-col items-end">
                                       <div className="flex items-baseline gap-1">
                                          <p className="text-2xl font-black text-gray-900 leading-none">
                                             {shoppingViewMode === 'RECIPE' && item.source?.recipeBreakdown?.[group]
                                                ? item.source.recipeBreakdown[group]
                                                : item.quantity}
                                          </p>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.unit}</p>
                                       </div>

                                       {shoppingViewMode === 'RECIPE' && item.source?.recipeBreakdown?.[group] && item.source.recipeBreakdown[group] !== item.quantity && (
                                          <div className="mt-2 text-right">
                                             <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                                                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                                   {language === 'ES' ? `Global: ${item.quantity} ${item.unit}` : `Total: ${item.quantity} ${item.unit}`}
                                                </span>
                                             </div>
                                          </div>
                                       )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 relative z-20">
                                       {shoppingViewMode === 'RECIPE' && item.source?.recipeBreakdown?.[group] && item.source.recipeBreakdown[group] !== item.quantity && (
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handlePartialPurchase(item.id, group);
                                             }}
                                             title={language === 'ES' ? 'Marcar solo para esta receta' : 'Mark only for this recipe'}
                                             className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn relative z-30 cursor-pointer pointer-events-auto"
                                          >
                                             <ChefHat className="w-4 h-4" />
                                          </button>
                                       )}
                                       <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                          <button
                                             onClick={() => handleUpdateShoppingItemQuantity(item.id, 1)}
                                             className="p-1 px-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                          >
                                             <Plus className="w-4 h-4" />
                                          </button>
                                          <button
                                             onClick={() => handleUpdateShoppingItemQuantity(item.id, -1)}
                                             className="p-1 px-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                          >
                                             <Minus className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )))}

                  {/* Purchased Items Section */}
                  {groupedShoppingItems.purchasedItems.length > 0 && (
                     <>
                        {/* Separator */}
                        {Object.keys(groupedShoppingItems.activeGroups).length > 0 && (
                           <div className="flex items-center gap-4 my-8">
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                              <Check className="w-5 h-5 text-emerald-500" />
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                           </div>
                        )}

                        <div className="space-y-4">
                           <button
                              onClick={() => setIsPurchasedSectionExpanded(!isPurchasedSectionExpanded)}
                              className="w-full text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] pb-3 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between gap-3 hover:text-emerald-700 transition-colors group cursor-pointer"
                           >
                              <div className="flex items-center gap-3">
                                 <Check className="w-4 h-4" />
                                 Productos Comprados ({groupedShoppingItems.purchasedItems.length})
                              </div>
                              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isPurchasedSectionExpanded ? 'rotate-180' : ''}`} />
                           </button>
                           {isPurchasedSectionExpanded && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
                                 {groupedShoppingItems.purchasedItems.map(item => (
                                    <div
                                       key={item.id}
                                       onClick={() => handleToggleShoppingItem(item.id)}
                                       className="flex items-center justify-between p-6 rounded-[2rem] border bg-emerald-50/50 border-emerald-200 shadow-inner transition-all duration-300 group cursor-pointer hover:bg-emerald-50"
                                    >
                                       <div className="flex items-center gap-5">
                                          <div className="w-8 h-8 rounded-2xl border-2 bg-emerald-500 border-emerald-500 flex items-center justify-center transition-all duration-500 rotate-[360deg] scale-110 shadow-lg">
                                             <Check className="w-5 h-5 text-white" />
                                          </div>
                                          <div>
                                             <p className="font-black text-lg line-through text-gray-400 italic uppercase tracking-tight transition-all">{item.name}</p>
                                             <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-gray-300 mt-1">
                                                {item.source?.type === 'RECIPE' && <span className="text-purple-400 flex items-center gap-1.5"><ChefHat className="w-3.5 h-3.5" /> Receta</span>}
                                                {item.category && <span className="flex items-center gap-1.5 opacity-60"><ShoppingCart className="w-3.5 h-3.5" /> {CATEGORY_DISPLAY_NAMES[language as string]?.[item.category] || item.category}</span>}
                                             </div>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          <div className="text-right">
                                             <p className="text-2xl font-black text-gray-300 leading-none">{item.quantity}</p>
                                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.unit}</p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </>
                  )}
               </div>
            )}
         </div>

         {isAddShoppingItemOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" /> Añadir a Cesta
                     </h3>
                     <button onClick={() => setIsAddShoppingItemOpen(false)} className="text-gray-400 hover:text-gray-900 p-2"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre</label><input type="text" autoFocus value={shoppingItemName} onChange={(e) => setShoppingItemName(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="Ej: Leche" /></div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cantidad</label><input type="number" value={shoppingItemQty} onChange={(e) => setShoppingItemQty(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="1" /></div>
                        <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unidad</label><select value={shoppingItemUnit} onChange={(e) => setShoppingItemUnit(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"><option value="pcs">pcs</option><option value="kg">kg</option><option value="g">g</option><option value="l">l</option></select></div>
                     </div>
                     <button onClick={handleSaveShoppingItem} className="w-full bg-emerald-950 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">Guardar</button>
                  </div>
               </div>
            </div>
         )}
         {/* Purchase Confirmation Modal */}
         <PurchaseConfirmationModal
            isOpen={isPurchaseModalOpen}
            onClose={() => setIsPurchaseModalOpen(false)}
            items={shoppingList.filter(i => i.checked)}
            accounts={accounts}
            defaultAccountId={defaultShoppingAccount}
            onConfirm={handleConfirmPurchase}
         />
      </div>
   );
};

