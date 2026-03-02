import React, { useState, useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';
import { Ingredient } from '../../../types';
import { Search, Clock, Plus, Minus, X, ChevronLeft, ChevronRight, Wand2, Coffee, Sunset, Moon, Loader2, BookOpen, GripVertical, ChefHat, MoreHorizontal, Package, AlertTriangle, ScanLine } from 'lucide-react';
import { ReceiptScannerModal } from './ReceiptScannerModal';

interface PantryProps {
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

const PANTRY_UNITS = [
   { value: 'pcs', label: 'Piezas / Unidades' },
   { value: 'g', label: 'Gramos (g)' },
   { value: 'kg', label: 'Kilogramos (kg)' },
   { value: 'l', label: 'Litros (l)' },
   { value: 'ml', label: 'Mililitros (ml)' },
   { value: 'can', label: 'Latas' },
   { value: 'pack', label: 'Paquetes' },
   { value: 'jar', label: 'Botes / Tarros' },
   { value: 'box', label: 'Cajas' },
   { value: 'bottle', label: 'Botellas' },
   { value: 'slice', label: 'Rebanadas / Lonchas' },
];

export const Pantry: React.FC<PantryProps> = () => {
   const { pantryItems, setPantryItems } = useLifeStore();
   const { quickAction, setQuickAction } = useUserStore();

   const [searchTerm, setSearchTerm] = useState('');
   const [pantrySort, setPantrySort] = useState<'NAME' | 'EXPIRY' | 'QTY'>('EXPIRY'); // This state is no longer used for sorting in the new UI
   const [isAddPantryItemOpen, setIsAddPantryItemOpen] = useState(false);
   const [isScannerOpen, setIsScannerOpen] = useState(false);
   const [pantryItemName, setPantryItemName] = useState('');
   const [pantryItemQty, setPantryItemQty] = useState<string>('');
   const [pantryItemUnit, setPantryItemUnit] = useState('pcs');
   const [pantryItemCat, setPantryItemCat] = useState('Pantry');
   const [pantryItemExpiry, setPantryItemExpiry] = useState('');
   const [filter, setFilter] = useState<'all' | string>('all'); // New state for category filter

   useEffect(() => {
      if (quickAction) {
         if (quickAction.type === 'SCAN_RECEIPT') {
            setIsScannerOpen(true);
            setQuickAction(null);
         } else if (quickAction.type === 'ADD_INGREDIENT') {
            setIsAddPantryItemOpen(true);
            resetForm();
            setQuickAction(null);
         }
      }
   }, [quickAction, setQuickAction]);

   const calculateDaysRemaining = (expiryDate?: string) => {
      if (!expiryDate) return null;
      const today = new Date();
      const expiry = new Date(expiryDate);
      if (isNaN(expiry.getTime())) return null;
      const diffTime = expiry.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   };

   const handleAdjustPantryQty = (id: string, delta: number) => {
      setPantryItems((prev: Ingredient[]) => prev.map(item => {
         if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
         }
         return item;
      }));
   };

   const handleSavePantryItem = () => {
      if (!pantryItemName) return;
      const newItem: Ingredient = {
         id: Math.random().toString(36).substr(2, 9),
         name: pantryItemName,
         quantity: parseFloat(pantryItemQty) || 1,
         unit: pantryItemUnit as any,
         category: pantryItemCat as any,
         expiryDate: pantryItemExpiry || undefined,
         lowStockThreshold: 2 // Default low stock threshold
      };
      setPantryItems((prev: Ingredient[]) => [...prev, newItem]);
      setIsAddPantryItemOpen(false);
      resetForm();
   };

   const resetForm = () => {
      setPantryItemName(''); setPantryItemQty(''); setPantryItemExpiry('');
   };

   const handleSaveScannedItems = (items: Ingredient[]) => {
      setPantryItems((prev: Ingredient[]) => [...prev, ...items]);
      setIsScannerOpen(false);
   };

   // New functions for the refactored UI
   const handleUpdateQuantity = (id: string, delta: number) => {
      setPantryItems((prev: Ingredient[]) => prev.map(item => {
         if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
         }
         return item;
      }));
   };

   const handleRemoveItem = (id: string) => {
      setPantryItems((prev: Ingredient[]) => prev.filter(item => item.id !== id));
   };

   const filteredItems = pantryItems
      .filter(item => {
         const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesCategory = filter === 'all' || item.category === filter;
         return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
         // Default sort by expiry, then name if expiry is same or missing
         if (!a.expiryDate && !b.expiryDate) return a.name.localeCompare(b.name);
         if (!a.expiryDate) return 1;
         if (!b.expiryDate) return -1;
         const expiryDiff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
         if (expiryDiff === 0) return a.name.localeCompare(b.name);
         return expiryDiff;
      });

   const CATEGORY_TRANSLATIONS: Record<string, string> = {
      'Vegetables': 'Verduras',
      'Fruits': 'Frutas',
      'Dairy': 'Lácteos',
      'Meat': 'Carnes',
      'Pantry': 'Despensa',
      'Spices': 'Especias',
      'Frozen': 'Congelados',
      'Other': 'Otros'
   };

   return (
      <div className="space-y-6 animate-fade-in h-full flex flex-col relative pb-20">
         <div className="flex justify-between items-center shrink-0">
            {/* Search and Categories */}
            <div className="flex flex-col md:flex-row gap-4">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                     type="text"
                     placeholder="Buscar en tu despensa..."
                     className="w-full bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all shadow-sm"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                  {['Todos', 'Vegetables', 'Fruits', 'Dairy', 'Meat', 'Pantry', 'Spices', 'Frozen', 'Other'].map(cat => (
                     <button
                        key={cat}
                        onClick={() => setFilter(cat === 'Todos' ? 'all' : cat as any)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${(cat === 'Todos' && filter === 'all') || filter === cat
                           ? 'bg-emerald-600 text-white shadow-lg'
                           : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                           }`}
                     >
                        {cat === 'Todos' ? 'Todos' : CATEGORY_TRANSLATIONS[cat] || cat}
                     </button>
                  ))}
               </div>
            </div>
            <button onClick={() => { setIsAddPantryItemOpen(true); resetForm(); }} className="bg-emerald-950 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-emerald-900 transition-all">
               <Plus className="w-4 h-4" /> Añadir a Despensa
            </button>
         </div>

         {/* Pantry Grid */}
         <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
               {filteredItems.map((item) => {
                  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                  const isLowStock = item.lowStockThreshold && item.quantity <= item.lowStockThreshold;

                  return (
                     <div
                        key={item.id}
                        className={`bg-white rounded-[2.5rem] border p-6 flex flex-col gap-4 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden ${isExpired ? 'border-red-100' : isLowStock ? 'border-orange-100' : 'border-gray-100 hover:border-emerald-100'}`}
                     >
                        {isExpired && (
                           <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 animate-pulse" />
                        )}

                        <div className="flex justify-between items-start">
                           <div className={`p-4 rounded-2xl shadow-sm ${item.category === 'Meat' ? 'bg-red-50 text-red-600' :
                              item.category === 'Vegetables' ? 'bg-emerald-50 text-emerald-600' :
                                 item.category === 'Dairy' ? 'bg-blue-50 text-blue-600' :
                                    'bg-orange-50 text-orange-600'
                              }`}>
                              <Package className="w-6 h-6" />
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase leading-none mb-1">{CATEGORY_TRANSLATIONS[item.category] || item.category}</p>
                              {item.expiryDate && (
                                 <div className={`flex items-center gap-1 justify-end ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">{new Date(item.expiryDate).toLocaleDateString()}</span>
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="flex-1">
                           <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors uppercase tracking-tight line-clamp-2">{item.name}</h4>
                           <div className="flex items-baseline gap-1.5 mt-2">
                              <span className={`text-2xl font-black ${isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>{item.quantity}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.unit}</span>
                           </div>
                        </div>

                        <div className="flex gap-2">
                           <button
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="flex-1 p-3.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-red-600 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-red-100"
                           >
                              <Minus className="w-4 h-4" />
                           </button>
                           <button
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="flex-1 p-3.5 bg-gray-900 hover:bg-emerald-600 text-white rounded-2xl transition-all active:scale-90 shadow-lg"
                           >
                              <Plus className="w-4 h-4" />
                           </button>
                           <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-3.5 text-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                           >
                              <X className="w-4.5 h-4.5" />
                           </button>
                        </div>

                        {isLowStock && !isExpired && (
                           <div className="absolute -bottom-4 -right-4 text-orange-500/10 rotate-12 group-hover:rotate-0 transition-transform">
                              <AlertTriangle className="w-24 h-24" />
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>
         {isAddPantryItemOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-fade-in">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Añadir a Despensa</h3>
                  <div className="space-y-4">
                     <input type="text" value={pantryItemName} onChange={(e) => setPantryItemName(e.target.value)} placeholder="Nombre" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" value={pantryItemQty} onChange={(e) => setPantryItemQty(e.target.value)} placeholder="Cantidad" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                        <select value={pantryItemUnit} onChange={(e) => setPantryItemUnit(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                           {PANTRY_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                     </div>
                     <select value={pantryItemCat} onChange={(e) => setPantryItemCat(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold">
                        {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{CATEGORY_TRANSLATIONS[cat] || cat}</option>)}
                     </select>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha de Caducidad</label>
                        <input type="date" value={pantryItemExpiry} onChange={(e) => setPantryItemExpiry(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold" />
                     </div>
                     <div className="flex gap-2 pt-2">
                        <button onClick={() => setIsAddPantryItemOpen(false)} className="flex-1 py-3 text-gray-400 font-bold text-xs uppercase">Cancelar</button>
                        <button onClick={handleSavePantryItem} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-lg">Guardar Item</button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {isScannerOpen && (
            <ReceiptScannerModal
               onClose={() => setIsScannerOpen(false)}
               onSaveToPantry={handleSaveScannedItems}
               onOpenManualEntry={() => setIsAddPantryItemOpen(true)}
            />
         )}
      </div>
   );
};
