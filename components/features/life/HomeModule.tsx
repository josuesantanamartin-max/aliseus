
import React, { useState } from 'react';
import { Home, Menu, Wrench, Box, Lock, Baby, ShieldCheck, Star, Trophy, FileText, CheckCircle } from 'lucide-react';
import { Language } from '@/types';

interface HomeModuleProps {
  onMenuClick?: () => void;
  language: Language;
}

const HOME_TEXTS = {
  ES: {
    spaces: 'Espacios',
    vault: 'Vault',
    family: 'Familia',
    subtitle: 'Espacios & Familia',
    spacesTitle: 'Mis Espacios y Activos',
    spacesDesc: 'Gestiona el inventario de tu hogar, programa mantenimientos y vincula garantías.',
    vaultTitle: 'Bóveda de Seguridad',
    vaultDesc: 'Almacenamiento encriptado para escrituras, pasaportes y contratos importantes.',
    familyTitle: 'Gestión Familiar (Junior)',
    familyDesc: 'Tareas del hogar gamificadas para niños y control parental de actividades.',
    demo: 'Explorar Demo',
    inventory: 'Inventario',
    maintenance: 'Mantenimiento',
    docs: 'Documentos',
    passwords: 'Contraseñas',
    tasks: 'Tareas',
    rewards: 'Recompensas'
  },
  EN: {
    spaces: 'Spaces',
    vault: 'Vault',
    family: 'Family',
    subtitle: 'Spaces & Family',
    spacesTitle: 'My Spaces & Assets',
    spacesDesc: 'Manage your home inventory, schedule maintenance, and link warranties.',
    vaultTitle: 'Secure Vault',
    vaultDesc: 'Encrypted storage for deeds, passports, and important contracts.',
    familyTitle: 'Family Management (Junior)',
    familyDesc: 'Gamified chores for kids and parental control of activities.',
    demo: 'Explore Demo',
    inventory: 'Inventory',
    maintenance: 'Maintenance',
    docs: 'Documents',
    passwords: 'Passwords',
    tasks: 'Chores',
    rewards: 'Rewards'
  },
  FR: {
    spaces: 'Espaces',
    vault: 'Vault',
    family: 'Famille',
    subtitle: 'Espaces & Famille',
    spacesTitle: 'Mes Espaces et Actifs',
    spacesDesc: 'Gérez l\'inventaire de votre maison, planifiez l\'entretien et liez les garanties.',
    vaultTitle: 'Coffre-fort Sécurisé',
    vaultDesc: 'Stockage crypté pour les actes, passeports et contrats importants.',
    familyTitle: 'Gestion Familiale (Junior)',
    familyDesc: 'Tâches ménagères ludiques pour les enfants et contrôle parental.',
    demo: 'Explorer Démo',
    inventory: 'Inventaire',
    maintenance: 'Maintenance',
    docs: 'Documents',
    passwords: 'Mots de passe',
    tasks: 'Tâches',
    rewards: 'Récompenses'
  }
};

const HomeModule: React.FC<HomeModuleProps> = ({ onMenuClick, language }) => {
  const [activeTab, setActiveTab] = useState<'SPACES' | 'VAULT' | 'FAMILY'>('SPACES');
  const t = HOME_TEXTS[language];

  return (
    <div className="flex h-full flex-col relative bg-cyan-50/30">
      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-md">
            <Home className="text-white w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-gray-900 block leading-none text-lg">Home</span>
            <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-widest">{t.subtitle}</span>
          </div>
        </div>
        <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* --- TABS NAVIGATION --- */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex p-1 bg-white border border-gray-200 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('SPACES')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'SPACES' ? 'bg-cyan-50 text-cyan-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Home className="w-4 h-4" /> {t.spaces}
          </button>
          <button
            onClick={() => setActiveTab('VAULT')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'VAULT' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Lock className="w-4 h-4" /> {t.vault}
          </button>
          <button
            onClick={() => setActiveTab('FAMILY')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'FAMILY' ? 'bg-yellow-50 text-yellow-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Baby className="w-4 h-4" /> {t.family}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 animate-fade-in">

        {/* CONTENT BASED ON TABS */}
        {activeTab === 'SPACES' && (
          <>
            <div className="bg-white p-6 rounded-full shadow-sm mb-4 relative">
              <Home className="w-12 h-12 text-cyan-500" />
              <div className="absolute -bottom-2 -right-2 bg-cyan-100 p-2 rounded-full border-2 border-white">
                <Wrench className="w-5 h-5 text-cyan-700" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.spacesTitle}</h2>
            <p className="max-w-md mx-auto mb-6">
              {t.spacesDesc}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                <Box className="w-5 h-5 text-cyan-600 mb-2" />
                <h4 className="font-bold text-sm text-gray-900">{t.inventory}</h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                <CheckCircle className="w-5 h-5 text-cyan-600 mb-2" />
                <h4 className="font-bold text-sm text-gray-900">{t.maintenance}</h4>
              </div>
            </div>
          </>
        )}

        {activeTab === 'VAULT' && (
          <>
            <div className="bg-white p-6 rounded-full shadow-sm mb-4 relative">
              <Lock className="w-12 h-12 text-slate-600" />
              <div className="absolute -bottom-2 -right-2 bg-slate-200 p-2 rounded-full border-2 border-white">
                <ShieldCheck className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.vaultTitle}</h2>
            <p className="max-w-md mx-auto mb-6">
              {t.vaultDesc}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                <FileText className="w-5 h-5 text-slate-600 mb-2" />
                <h4 className="font-bold text-sm text-gray-900">{t.docs}</h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                <ShieldCheck className="w-5 h-5 text-slate-600 mb-2" />
                <h4 className="font-bold text-sm text-gray-900">{t.passwords}</h4>
              </div>
            </div>
          </>
        )}

        {activeTab === 'FAMILY' && (
          <>
            <div className="bg-white p-6 rounded-full shadow-sm mb-4 relative">
              <Baby className="w-12 h-12 text-yellow-500" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-100 p-2 rounded-full border-2 border-white">
                <Star className="w-5 h-5 text-yellow-700" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.familyTitle}</h2>
            <p className="max-w-md mx-auto mb-6">
              {t.familyDesc}
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                <Trophy className="w-5 h-5 text-yellow-600 mb-2" />
                <h4 className="font-bold text-sm text-gray-900">{t.tasks}</h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
                <Star className="w-5 h-5 text-yellow-600 mb-2" />
                <h4 className="font-bold text-sm text-gray-900">{t.rewards}</h4>
              </div>
            </div>
          </>
        )}

        <button className={`px-6 py-2 text-white rounded-lg font-bold transition-colors ${activeTab === 'SPACES' ? 'bg-cyan-600 hover:bg-cyan-700' :
            activeTab === 'VAULT' ? 'bg-slate-700 hover:bg-slate-800' :
              'bg-yellow-500 hover:bg-yellow-600'
          }`}>
          {t.demo}
        </button>
      </div>
    </div>
  );
};

export default HomeModule;