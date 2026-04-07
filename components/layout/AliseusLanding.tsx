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
import { Eye, EyeOff, Users, Home, Check } from 'lucide-react';
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

        <div className="space-y-4">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-2">
            <button
              onClick={() => {
                setIsRegister(false);
                setAcceptedTerms(false);
                setIsAgeVerified(false);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${!isRegister ? 'bg-white shadow-md text-aliseus-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              INICIAR SESIÓN
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setAcceptedTerms(false);
                setIsAgeVerified(false);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${isRegister ? 'bg-white shadow-md text-aliseus-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              REGISTRARSE
            </button>
          </div>

          {/* Botón de Google Principal y Gigante */}
          <div className="pt-4">
            <button 
              onClick={() => onLogin('GOOGLE')} 
              className="w-full py-5 rounded-[1.5rem] border-2 border-aliseus-100 bg-white shadow-xl hover:shadow-aliseus-500/10 hover:border-aliseus-300 flex items-center justify-center gap-4 transition-all duration-300 group active:scale-95"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-8 h-8 group-hover:rotate-12 transition-transform" alt="Google" />
              <span className="font-black text-gray-800 text-lg tracking-tight">
                {isRegister ? 'Crear cuenta con Google' : 'Entrar con Google'}
              </span>
            </button>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[11px] text-gray-400 text-center uppercase tracking-[0.2em] font-black">Acceso seguro con Google</p>
            </div>
          </div>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="bg-white px-6 text-gray-300">o método tradicional</span></div>
          </div>

          <div className="space-y-3 text-left">
            <div className="relative">
              <input
                type="email"
                placeholder="Tu email principal"
                className="w-full px-5 py-4 rounded-[1.2rem] border-2 border-gray-50 focus:border-aliseus-500 focus:bg-white bg-gray-50/50 transition-all text-sm outline-none font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña secreta"
                className="w-full px-5 pr-14 py-4 rounded-[1.2rem] border-2 border-gray-50 focus:border-aliseus-500 focus:bg-white bg-gray-50/50 transition-all text-sm outline-none font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-aliseus-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Beta Code Input */}
            {isRegister && !inviteToken && (
              <div className="relative animate-fadeIn">
                <input
                  type="text"
                  placeholder="Código Fundador"
                  className="w-full px-5 py-4 rounded-[1.2rem] border-2 border-gray-50 focus:border-black bg-gray-50/50 transition-all text-sm uppercase font-black text-center tracking-widest"
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                />
              </div>
            )}

            {isRegister && (
              <div className="space-y-4 py-4 px-2">
                <div className="flex items-start gap-3 group cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                  <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-aliseus-600 border-aliseus-600' : 'border-gray-200 bg-white'}`}>
                    {acceptedTerms && <Check className="w-3 h-3 text-white stroke-[4]" />}
                  </div>
                  <label className="text-xs text-gray-500 font-medium leading-relaxed pointer-events-none">
                    Acepto los <span className="text-aliseus-700 font-bold underline">Términos</span> y la <span className="text-aliseus-700 font-bold underline">Privacidad</span>
                  </label>
                </div>

                <div className="flex items-start gap-3 group cursor-pointer" onClick={() => setIsAgeVerified(!isAgeVerified)}>
                  <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isAgeVerified ? 'bg-aliseus-600 border-aliseus-600' : 'border-gray-200 bg-white'}`}>
                    {isAgeVerified && <Check className="w-3 h-3 text-white stroke-[4]" />}
                  </div>
                  <label className="text-xs text-gray-500 font-medium leading-relaxed pointer-events-none">
                    Confirmo mi mayoría de edad (+16)
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
                await onLogin('EMAIL', { email, password, isRegister, invitationCode: inviteToken || betaCode });
                setAuthLoading(false);
              }}
              disabled={authLoading || !email || !password || (isRegister && (!acceptedTerms || (!betaCode && !inviteToken) || !isAgeVerified))}
              className="w-full py-5 rounded-[1.5rem] bg-gray-900 text-white font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transform active:scale-95"
            >
              {authLoading ? 'CONECTANDO...' : (isRegister ? 'CREAR CUENTA' : 'ENTRAR')}
            </button>
          </div>

          <div className="pt-6">
            <button onClick={() => onLogin('DEMO')} className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] hover:text-aliseus-600 transition-all">
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
