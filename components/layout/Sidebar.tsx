import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, Heart, Settings, LogOut, HelpCircle, Mic, MicOff } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Logo } from './Logo';
import NotificationBadge from '../common/notifications/NotificationBadge';
import NotificationCenter from '../common/notifications/NotificationCenter';
import { ProgressiveTooltip } from '@/components/common/ProgressiveTooltip';
import BetaFeedbackWidget from '../dashboard/BetaFeedbackWidget';

interface SidebarProps {
  onLogout?: () => void;
}

const SIDEBAR_TEXTS = {
  ES: {
    dashboard: 'Aura Dashboard',
    finance: 'Control Financiero',
    life: 'Gestión Vida',
    settings: 'Ajustes',
    help: 'Ayuda',
    logout: 'Salir',
    suite: 'Aliseus'
  },
  EN: {
    dashboard: 'Aura Dashboard',
    finance: 'Finance Control',
    life: 'Life Management',
    settings: 'Settings',
    help: 'Help',
    logout: 'Log Out',
    suite: 'Aliseus'
  },
  FR: {
    dashboard: 'Aura Dashboard',
    finance: 'Gestion Finances',
    life: 'Gestion Vie',
    settings: 'Paramètres',
    help: 'Aide',
    logout: 'Quitter',
    suite: 'Aliseus'
  }
};

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const {
    activeApp, setActiveApp,
    isSidebarOpen: isOpen, setSidebarOpen: setIsOpen,
    language,
    userProfile,
    subscription
  } = useUserStore();
  const { isListening, listen, stop } = useVoiceAssistant();

  const t = SIDEBAR_TEXTS[language];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'finance', label: t.finance, icon: Wallet },
    { id: 'life', label: t.life, icon: Heart },
  ];

  const handleLinkClick = (app: string) => {
    setActiveApp(app);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-aliseus-950/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen && setIsOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 h-screen flex flex-col transition-all duration-500 ease-in-out z-30 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="p-10 pb-6 flex-1 flex flex-col">
          <div
            className="flex items-center gap-3.5 mb-14 cursor-pointer group"
            onClick={() => handleLinkClick('dashboard')}
          >
            <img
              src="/logo.png"
              alt="Aliseus"
              className="h-12 w-auto object-contain drop-shadow-lg transition-all duration-500 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-cyan-600 uppercase leading-none">Aliseus</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1.5">La tranquilidad de tu familia.</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeApp === item.id;
              
              const buttonContent = (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                    ? 'text-cyan-600 font-bold bg-transparent'
                    : 'text-aliseus-500 hover:text-cyan-600 bg-transparent'
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {isActive && (
                    <motion.div layoutId="activeScreenIndicator" className="absolute left-0 w-1 h-6 bg-cyan-600 rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-cyan-600 scale-110' : 'text-aliseus-400 group-hover:text-cyan-600 group-hover:scale-110'}`} />
                  <span className="text-[13px] tracking-tight">{item.label}</span>
                </motion.button>
              );

              if (index === 1) { // Put it on Finance (index 1) to make it obvious
                  return (
                      <ProgressiveTooltip
                          key={item.id}
                          id="tooltip-sidebar-nav"
                          title="Navegación Principal"
                          description="Cambia entre tu Dashboard, Finanzas y Vida desde aquí. Cada módulo tiene herramientas específicas."
                          position="right"
                      >
                          {buttonContent}
                      </ProgressiveTooltip>
                  );
              }
              return buttonContent;
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <BetaFeedbackWidget variant="sidebar" />
            
            <NotificationBadge
              onClick={() => setIsNotifOpen((prev) => !prev)}
              isActive={isNotifOpen}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleLinkClick('settings')}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${activeApp === 'settings' ? 'text-cyan-600 font-bold bg-transparent' : 'text-aliseus-500 hover:text-cyan-600 bg-transparent'}`}
            >
              <Settings className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-90 ${activeApp === 'settings' ? 'text-cyan-600' : 'text-aliseus-400'}`} />
              <span className="text-[13px] tracking-tight">{t.settings}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleLinkClick('help')}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${activeApp === 'help' ? 'text-cyan-600 font-bold bg-transparent' : 'text-aliseus-500 hover:text-cyan-600 bg-transparent'}`}
            >
              <HelpCircle className={`w-5 h-5 transition-all duration-300 ${activeApp === 'help' ? 'text-indigo-primary' : 'text-aliseus-400 group-hover:text-aliseus-600'}`} />
              <span className="text-[13px] tracking-tight">{t.help}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-aliseus-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="text-[13px] tracking-tight">{t.logout}</span>
            </motion.button>
          </div>
        </div>

        <div className="p-10 pt-0">
          <div className="h-px bg-gray-100 w-full mb-8"></div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-4 px-2 cursor-pointer group hover:bg-gray-50 p-2 rounded-xl transition-all"
            onClick={() => handleLinkClick('settings')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {(userProfile?.full_name || userProfile?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={`flex flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              <span className="text-sm font-bold text-gray-900 truncate max-w-[140px] group-hover:text-cyan-600 transition-colors">
                {userProfile?.full_name || 'Usuario'}
              </span>
              <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">
                {subscription?.plan === 'FAMILIA' ? 'Premium' :
                  subscription?.plan === 'PERSONAL' ? 'Pro' : 'Aliseus Basic'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Notification Center panel */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </>
  );
};

export default Sidebar;
