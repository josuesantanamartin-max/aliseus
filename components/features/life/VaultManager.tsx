import React, { useState } from 'react';
import {
   Lock, FileText, ShieldCheck, Search, Plus, Trash2, Download, Eye,
   ExternalLink, FileWarning, Clock, Filter, MoreVertical, Key, Fingerprint
} from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { useUserStore } from '../../../store/useUserStore';

interface Document {
   id: string;
   name: string;
   category: 'Personal' | 'Hogar' | 'Salud' | 'Finanzas' | 'Vehículos';
   expiryDate?: string;
   status: 'SECURE' | 'EXPIRING' | 'EXPIRED';
   fileSize: string;
   uploadedAt: string;
}

const MOCK_DOCS: Document[] = [
   { id: '1', name: 'Escritura Vivienda Principal.pdf', category: 'Hogar', status: 'SECURE', fileSize: '4.2 MB', uploadedAt: '2024-01-15' },
   { id: '2', name: 'DNI_Renovacion_2025.jpg', category: 'Personal', expiryDate: '2025-03-20', status: 'EXPIRING', fileSize: '1.1 MB', uploadedAt: '2024-05-10' },
   { id: '3', name: 'Poliza_Seguro_Vida.pdf', category: 'Finanzas', status: 'SECURE', fileSize: '2.8 MB', uploadedAt: '2024-02-01' },
];

export const VaultManager: React.FC = () => {
   const { vaultDocuments, setVaultDocuments } = useLifeStore();
   const { language } = useUserStore();

   // Use MOCK_DOCS if vaultDocuments is empty for now, to show something
   const displayDocs = vaultDocuments.length > 0 ? vaultDocuments : MOCK_DOCS;
   const [searchTerm, setSearchTerm] = useState('');

   const getStatusBadge = (status: string) => {
      switch (status) {
         case 'SECURE': return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-emerald-100 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Seguro</span>;
         case 'EXPIRING': return <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-orange-100 flex items-center gap-1"><Clock className="w-3 h-3" /> Próxima Caducidad</span>;
         default: return <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-red-100 flex items-center gap-1"><FileWarning className="w-3 h-3" /> Caducado</span>;
      }
   };

   return (
      <div className="h-full flex flex-col space-y-6 animate-fade-in pb-20 p-8 overflow-y-auto custom-scrollbar">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Aliseus Vault</h2>
               <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Bóveda Documental Encriptada</p>
            </div>
            <div className="flex gap-3">
               <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all">
                  <Plus className="w-4 h-4" /> Subir Documento
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Key className="w-6 h-6" /></div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nivel de Seguridad</p>
                  <h4 className="text-xl font-black text-gray-900">Militar AES-256</h4>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Fingerprint className="w-6 h-6" /></div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Autenticación</p>
                  <h4 className="text-xl font-black text-gray-900">Biométrica Activa</h4>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl"><Lock className="w-6 h-6" /></div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Espacio Usado</p>
                  <h4 className="text-xl font-black text-gray-900">12.4 MB <span className="text-xs text-gray-400">/ 5 GB</span></h4>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 flex gap-4 items-center">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                     type="text"
                     placeholder="Buscar por nombre o categoría..."
                     className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-900/5 outline-none font-bold text-sm transition-all"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100"><Filter className="w-5 h-5" /></button>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <th className="p-6">Documento</th>
                        <th className="p-6">Categoría</th>
                        <th className="p-6">Estado</th>
                        <th className="p-6">Tamaño</th>
                        <th className="p-6 text-right">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {displayDocs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-slate-400 shadow-sm group-hover:text-blue-600 transition-colors">
                                    <FileText className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-900 text-sm">{doc.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Subido el {doc.uploadedAt}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-lg uppercase tracking-tighter">{doc.category}</span>
                           </td>
                           <td className="p-6">{getStatusBadge(doc.status)}</td>
                           <td className="p-6 text-sm font-bold text-gray-400">{doc.fileSize}</td>
                           <td className="p-6 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                                 <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Download className="w-4 h-4" /></button>
                                 <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};
