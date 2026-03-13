import React, { useState } from 'react';
import { Language } from '../../types';
import { Logo } from './Logo';
import { LANDING_TEXTS } from './landing/landingData';
import { LandingHeader } from './landing/LandingHeader';
import { LandingFooter } from './landing/LandingFooter';
import { LandingHome } from './landing/LandingHome';
import { LandingFinance } from './landing/LandingFinance';
import { LandingLife } from './landing/LandingLife';
import { LegalPage } from '../legal/LegalPage';

interface AliseusLandingProps {
  onLogin: (method: 'DEMO' | 'GOOGLE' | 'EMAIL' | 'NOTION', data?: { email: string, password: string, isRegister: boolean }) => void | Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AliseusLanding: React.FC<AliseusLandingProps> = ({ onLogin, language, setLanguage }) => {
  const [currentView, setCurrentView] = useState<'HOME' | 'FINANCE' | 'LIFE'>('HOME');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [betaCode, setBetaCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const t = LANDING_TEXTS[language];

  // Logic for Login Modal (Copied from original)
  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowLoginModal(false)}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mx-auto mb-6">
          <Logo className="h-20 w-auto drop-shadow-md" />
        </div>
        <h3 className="text-2xl font-black text-cyan-700 mb-2">Bienvenido a Aliseus</h3>
        <p className="text-gray-500 text-sm mb-8">Selecciona tu método de acceso</p>

        <div className="space-y-3">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => {
                setIsRegister(false);
                setAcceptedTerms(false);
                setIsAgeVerified(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isRegister ? 'bg-white shadow-sm text-cyan-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              INICIAR SESIÓN
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setAcceptedTerms(false);
                setIsAgeVerified(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isRegister ? 'bg-white shadow-sm text-cyan-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              REGISTRARSE
            </button>
          </div>

          <div className="space-y-2 text-left mb-6">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Beta Code Input - Only shown during registration */}
            {isRegister && (
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Código de Acceso Beta"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 transition-all text-sm uppercase tracking-widest font-bold text-center"
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                />
              </div>
            )}

            {/* Terms Acceptance & Age Verification - Only shown during registration */}
            {isRegister && (
              <div className="space-y-2 py-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-gray-600 leading-tight cursor-pointer">
                    Acepto los{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLegalModal('terms');
                      }}
                      className="text-cyan-700 font-semibold hover:underline"
                    >
                      Términos de Servicio
                    </button>
                    {' '}y la{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLegalModal('privacy');
                      }}
                      className="text-cyan-700 font-semibold hover:underline"
                    >
                      Política de Privacidad
                    </button>
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="age-checkbox"
                    checked={isAgeVerified}
                    onChange={(e) => setIsAgeVerified(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="age-checkbox" className="text-xs text-gray-600 leading-tight cursor-pointer">
                    Confirmo que tengo 16 años o más.
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={async () => {
                if (isRegister) {
                  const validCodes = ['ONYX2026', 'BETA2026', 'FAMILIA'];
                  if (!validCodes.includes(betaCode)) {
                    alert('Código de acceso inválido. Por favor, contacta con nosotros para obtener una invitación.');
                    return;
                  }
                }
                setAuthLoading(true);
                await onLogin('EMAIL', { email, password, isRegister });
                setAuthLoading(false);
              }}
              disabled={authLoading || !email || !password || (isRegister && (!acceptedTerms || !betaCode || !isAgeVerified))}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-teal-500 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Entrar con Email')}
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-2 text-gray-400">Otras opciones</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onLogin('GOOGLE')} className="py-3 rounded-xl border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
            </button>
            <button onClick={() => onLogin('NOTION')} className="py-3 rounded-xl border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-4 h-4" alt="Notion" />
            </button>
          </div>

          <div className="pt-2">
            <button onClick={() => onLogin('DEMO')} className="w-full py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all">
              {t.ctaDemo}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const navigateTo = (view: 'HOME' | 'FINANCE' | 'LIFE') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-cyan-600 selection:text-white">
      {showLegalModal && (
        <LegalPage
          document={showLegalModal}
          onClose={() => setShowLegalModal(null)}
        />
      )}
      {showLoginModal && renderLoginModal()}

      <LandingHeader
        language={language}
        setLanguage={setLanguage}
        setShowLoginModal={setShowLoginModal}
        onNavigate={navigateTo}
        currentView={currentView}
        t={t}
      />

      <main>
        {currentView === 'HOME' && (
          <LandingHome
            t={t}
            language={language}
            setShowLoginModal={setShowLoginModal}
            onNavigate={navigateTo}
          />
        )}
        {currentView === 'FINANCE' && (
          <LandingFinance
            t={t}
            language={language}
            setShowLoginModal={setShowLoginModal}
          />
        )}
        {currentView === 'LIFE' && (
          <LandingLife
            t={t}
            language={language}
            setShowLoginModal={setShowLoginModal}
          />
        )}
      </main>

      <LandingFooter onNavigate={navigateTo} t={t} />
    </div>
  );
};

export default AliseusLanding;
