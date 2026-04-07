import React, { useState } from 'react';
import { Language } from '@/types';
import { Logo } from './Logo';
import { invitationService } from '../../services/invitationService';
import { LANDING_TEXTS } from './landing/landingData';
import { LandingHeader } from './landing/LandingHeader';
import { LandingFooter } from './landing/LandingFooter';
import { LandingHome } from './landing/LandingHome';
import { LandingFinance } from './landing/LandingFinance';
import { LandingLife } from './landing/LandingLife';
import { LegalPage } from '../legal/LegalPage';
import { Eye, EyeOff, Users, Home } from 'lucide-react';
import { householdService } from '../../services/householdService';

interface AliseusLandingProps {
  onLogin: (method: 'DEMO' | 'GOOGLE' | 'EMAIL' | 'NOTION', data?: { email: string, password: string, isRegister: boolean, invitationCode?: string }) => void | Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  inviteToken?: string | null;
}

const AliseusLanding: React.FC<AliseusLandingProps> = ({ onLogin, language, setLanguage, inviteToken }) => {
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
  const [showPassword, setShowPassword] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{ householdName: string } | null>(null);

  React.useEffect(() => {
    if (inviteToken && inviteToken.length > 20) { // Likely a family UUID invite
      householdService.getInviteDetails(inviteToken).then(details => {
        if (details) {
          setInviteInfo({ householdName: details.householdName });
        }
      });
    }
  }, [inviteToken]);

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

          {/* Botón de Google Principal */}
          <div className="mb-6">
            <button 
              onClick={() => onLogin('GOOGLE')} 
              className="w-full py-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 flex items-center justify-center gap-3 transition-all group"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
              <span className="font-bold text-gray-700 text-sm">
                {isRegister ? 'Registrarse con Google' : 'Continuar con Google'}
              </span>
            </button>
            <p className="mt-2 text-[10px] text-gray-400 text-center uppercase tracking-widest font-medium">Recomendado para socios fundadores</p>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-gray-300">o con tu email</span></div>
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
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                className="w-full px-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Beta Code Input - Only shown during registration if no invite token exists */}
            {isRegister && !inviteToken && (
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
                  const isFamilyInvite = inviteToken && inviteToken.length > 20;
                  const codeToValidate = isFamilyInvite ? null : (inviteToken || betaCode);

                  if (!isFamilyInvite && !codeToValidate) {
                    alert('Se requiere un código de invitación para registrarse.');
                    return;
                  }
                  
                  if (codeToValidate) {
                    setAuthLoading(true);
                    try {
                      const validation = await invitationService.validateCode(codeToValidate);
                      if (!validation.valid) {
                        alert(validation.message || 'Código de invitación inválido.');
                        setAuthLoading(false);
                        return;
                      }
                    } catch (error) {
                      console.error('[AliseusLanding] Validation error:', error);
                      alert('Error al validar el código. Por favor, inténtalo de nuevo.');
                      setAuthLoading(false);
                      return;
                    }
                  }
                }

                setAuthLoading(true);
                await onLogin('EMAIL', { 
                  email, 
                  password, 
                  isRegister, 
                  invitationCode: inviteToken || betaCode 
                });
                setAuthLoading(false);
              }}
              disabled={authLoading || !email || !password || (isRegister && (!acceptedTerms || (!betaCode && !inviteToken) || !isAgeVerified))}
              className="w-full py-4 rounded-xl bg-gradient-to-base from-gray-800 to-black text-white font-bold text-sm hover:from-black hover:to-gray-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Procesando...' : (isRegister ? 'Crear Cuenta Fundadora' : 'Entrar con Email')}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button onClick={() => onLogin('DEMO')} className="w-full py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-cyan-600 transition-all">
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
      {inviteInfo && (
        <div className="fixed top-0 left-0 right-0 z-[110] animate-slide-down">
          <div className="bg-white/80 backdrop-blur-md border-b border-cyan-100 px-4 py-3 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Invitación Familiar</p>
                  <p className="text-sm text-gray-600">
                    Has sido invitado a unirte al hogar <span className="font-bold text-cyan-700">"{inviteInfo.householdName}"</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-800 transition-all shadow-lg shadow-cyan-700/20"
              >
                ACEPTAR Y ENTRAR
              </button>
            </div>
          </div>
        </div>
      )}
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
