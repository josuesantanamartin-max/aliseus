import React, { useState } from 'react';
import {
   Home, Box, Wrench, Plus, Search, Trash2, Pencil, Calendar,
   Info, AlertCircle, CheckCircle, Smartphone, Zap, Droplets, Thermometer, MoreHorizontal
} from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';

interface HomeAsset {
   id: string;
   name: string;
   location: string;
   purchaseDate?: string;
   warrantyUntil?: string;
   status: 'ACTIVE' | 'NEED_MAINTENANCE' | 'OFFLINE';
   category: 'Electro' | 'Muebles' | 'Tech' | 'Sistemas';
}

const MOCK_ASSETS: HomeAsset[] = [
   { id: '1', name: 'Smart TV 65" LG OLED', location: 'Salón', warrantyUntil: '2026-11-20', status: 'ACTIVE', category: 'Tech' },
   { id: '2', name: 'Caldera Gas Natural', location: 'Galería', status: 'NEED_MAINTENANCE', category: 'Sistemas' },
   { id: '3', name: 'Frigorífico Bosch', location: 'Cocina', warrantyUntil: '2025-05-10', status: 'ACTIVE', category: 'Electro' },
];

export const SpacesManager: React.FC = () => {
   const { homeAssets, setHomeAssets } = useLifeStore();
   const { language } = useUserStore();

   const displayAssets = homeAssets.length > 0 ? homeAssets : MOCK_ASSETS;
   const [view, setView] = useState<'INVENTORY' | 'MAINTENANCE'>('INVENTORY');

   return (
      <div className="h-full flex flex-col space-y-8 animate-fade-in pb-20 p-8 overflow-y-auto custom-scrollbar">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Aliseus Spaces</h2>
               <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Gestión de Activos y Mantenimiento</p>
            </div>
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
               <button onClick={() => setView('INVENTORY')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'INVENTORY' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400'}`}>Inventario</button>
               <button onClick={() => setView('MAINTENANCE')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'MAINTENANCE' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400'}`}>Mantenimiento</button>
            </div>
         </div>

         {view === 'INVENTORY' ? (
            <div className="space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Salón', 'Cocina', 'Dormitorio', 'Galería'].map(loc => (
                     <button key={loc} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left group">
                        <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Home className="w-6 h-6" /></div>
                        <h4 className="font-black text-gray-900">{loc}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">4 Objetos</p>
                     </button>
                  ))}
                  <button className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-600 transition-all">
                     <Plus className="w-8 h-8 mb-2 opacity-30" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Añadir Espacio</span>
                  </button>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3"><Box className="w-6 h-6 text-cyan-600" /> Inventario Global</h3>
                     <button className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest">+ Añadir Activo</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {displayAssets.map(asset => (
                        <div key={asset.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-2xl hover:border-cyan-100 transition-all group cursor-pointer relative overflow-hidden">
                           <div className="flex justify-between items-start mb-6">
                              <div className="p-3 bg-white rounded-2xl text-cyan-600 shadow-sm"><Smartphone className="w-6 h-6" /></div>
                              <button className="text-gray-300 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                           </div>
                           <h4 className="font-black text-gray-900 text-lg leading-tight truncate">{asset.name}</h4>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{asset.location} â€¢ {asset.category}</p>
                           <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                              {asset.status === 'NEED_MAINTENANCE' ?
                                 <span className="text-[9px] font-black text-red-500 flex items-center gap-1 uppercase tracking-tighter"><AlertCircle className="w-3 h-3" /> Revisión Requerida</span> :
                                 <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-tighter"><CheckCircle className="w-3 h-3" /> Funcionando</span>
                              }
                              {asset.warrantyUntil && <span className="text-[9px] font-bold text-gray-400">Garantía: {new Date(asset.warrantyUntil).getFullYear()}</span>}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Tareas de Mantenimiento</h3>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-3xl group">
                           <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-200"><Wrench className="w-6 h-6" /></div>
                           <div className="flex-1">
                              <h4 className="font-black text-gray-900">Revisión Caldera Gas</h4>
                              <p className="text-xs text-red-600 font-bold">Vencido hace 3 días</p>
                           </div>
                           <button className="bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-red-100">Agendar IA</button>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-3xl opacity-60">
                           <div className="p-3 bg-white text-gray-400 rounded-2xl border border-gray-200"><Droplets className="w-6 h-6" /></div>
                           <div className="flex-1">
                              <h4 className="font-black text-gray-900">Limpieza Filtros Aire</h4>
                              <p className="text-xs text-gray-500">Próximo: 12 de Julio</p>
                           </div>
                           <CheckCircle className="text-emerald-500 w-6 h-6" />
                        </div>
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="bg-cyan-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                     <div className="relative z-10">
                        <h3 className="text-xl font-black mb-4">Smart Home Sync</h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-xs font-bold opacity-80"><span>Temperatura</span><span>22.5Â°C</span></div>
                           <div className="w-full h-1 bg-white/20 rounded-full"><div className="w-[60%] h-full bg-cyan-400"></div></div>
                           <div className="flex justify-between items-center text-xs font-bold opacity-80"><span>Humedad</span><span>45%</span></div>
                           <div className="w-full h-1 bg-white/20 rounded-full"><div className="w-[45%] h-full bg-cyan-400"></div></div>
                        </div>
                        <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">Gestionar Dispositivos</button>
                     </div>
                     <Zap className="absolute -bottom-10 -right-10 w-48 h-48 text-cyan-800 opacity-20 pointer-events-none" />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
