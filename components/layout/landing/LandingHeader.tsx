import React, { useState } from 'react';
import { Logo } from '../Logo';
import { Globe, ChevronDown } from 'lucide-react';
import { Language } from '@/types';

interface LandingHeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    setShowLoginModal: (show: boolean) => void;
    onNavigate: (view: 'HOME' | 'FINANCE' | 'LIFE') => void;
    currentView: 'HOME' | 'FINANCE' | 'LIFE';
    t: any;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
    language,
    setLanguage,
    setShowLoginModal,
    onNavigate,
    currentView,
    t
}) => {
    const [showLangMenu, setShowLangMenu] = useState(false);

    return (
        <nav className="fixed top-0 w-full bg-white border-b border-gray-100 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => onNavigate('HOME')}>
                    <Logo className="h-10 w-auto group-hover:scale-105 transition-all duration-300 drop-shadow-md" />
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                    <button onClick={() => onNavigate('HOME')} className={`hover:text-cyan-600 transition-colors font-medium ${currentView === 'HOME' ? 'text-cyan-600' : ''}`}>Inicio</button>
                    <button onClick={() => onNavigate('FINANCE')} className={`hover:text-cyan-600 transition-colors font-medium ${currentView === 'FINANCE' ? 'text-cyan-600' : ''}`}>Finanzas</button>
                    <button onClick={() => onNavigate('LIFE')} className={`hover:text-cyan-600 transition-colors font-medium ${currentView === 'LIFE' ? 'text-cyan-600' : ''}`}>Vida</button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-black px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                            <Globe className="w-4 h-4" /> {language} <ChevronDown className="w-3 h-3" />
                        </button>
                        {showLangMenu && (
                            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50 flex flex-col">
                                {(['ES', 'EN', 'FR'] as Language[]).map(l => (
                                    <button key={l} onClick={() => { setLanguage(l); setShowLangMenu(false); }} className={`text-left px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 ${language === l ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}>
                                        {l === 'ES' ? 'Español' : l === 'EN' ? 'English' : 'Français'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setShowLoginModal(true)} className="text-sm font-bold text-gray-900 hover:text-gray-600 hidden md:block">{t.btnEnter}</button>
                    <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:from-cyan-400 hover:to-teal-500 transition-all active:scale-95 shadow-md shadow-cyan-500/20">{t.ctaStart}</button>
                </div>
            </div>
        </nav>
    );
};
