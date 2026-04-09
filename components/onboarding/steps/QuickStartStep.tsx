import React, { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Landmark, ScanLine, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { bankingService } from '@/services/bankingService';

// ── Plaid Link SDK (nativo, sin react-plaid-link) ────────────────────────────
const loadPlaidScript = (): Promise<void> => {
    if (window.Plaid) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar Plaid Link'));
        document.head.appendChild(script);
    });
};

const ConnectBankAction: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartLink = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadPlaidScript();
      const token = await bankingService.createLinkToken();

      const handler = window.Plaid!.create({
        token,
        onSuccess: async (public_token: string, metadata: any) => {
          try {
            await bankingService.exchangePublicToken(public_token, metadata.institution);
            setDone(true);
            onDone();
          } catch {
            setError('Error al conectar el banco. Podrás hacerlo desde Cuentas.');
          }
          handler.destroy();
        },
        onExit: () => {
          setLoading(false);
          handler.destroy();
        },
      });
      handler.open();
      setLoading(false);
    } catch (e) {
      setError('No se pudo iniciar la conexión bancaria.');
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
        <CheckCircle2 className="w-5 h-5" /> ¡Banco conectado! Las transacciones se importarán automáticamente.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleStartLink}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 hover:from-cyan-700 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-60 text-sm"
      >
        <Landmark className="w-4 h-4" />
        {loading ? 'Preparando conexión segura...' : 'Conectar mi banco ahora'}
      </button>
    </div>
  );
};

// ── Tarjeta de acción ─────────────────────────────────────────────────────────
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  isDone: boolean;
  children: React.ReactNode;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, subtitle, tag, tagColor, isDone, children }) => (
  <div className={`relative bg-white rounded-3xl p-6 border transition-all duration-300 ${isDone ? 'border-emerald-200 shadow-emerald-50 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
    {isDone && (
      <div className="absolute top-4 right-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      </div>
    )}
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ${tagColor}`}>
          {tag}
        </div>
        <h3 className="font-black text-gray-900 leading-tight">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {!isDone && children}
  </div>
);

// ── Paso principal ────────────────────────────────────────────────────────────
const QuickStartStep: React.FC = () => {
  const { setOnboardingStep, completeOnboarding, setSubscription } = useUserStore();
  const [bankDone, setBankDone] = useState(false);
  const [pantryDone] = useState(false); // Se completa al entrar en la app

  const handleComplete = async () => {
    completeOnboarding();
    setSubscription({
      plan: 'FAMILIA',
      status: 'ACTIVE',
      isBetaExtraApplied: true,
    });
    try {
      const { supabase } = await import('@/services/supabaseClient');
      if (supabase) {
        await supabase.auth.updateUser({
          data: { hasCompletedOnboarding: true, betaPlanApplied: 'FAMILIA' },
        });
      }
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const bothDone = bankDone && pantryDone;

  return (
    <div className="flex flex-col items-center animate-fade-in-up w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100 px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Últimos pasos</span>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Activa tu Aliseus</h2>
        <p className="text-gray-500 text-sm max-w-sm text-balance">
          Dos acciones que transforman Aliseus en tu asistente financiero real. Ambas son opcionales, pero cuanto antes las hagas, antes verás magia.
        </p>
      </div>

      {/* Action cards */}
      <div className="w-full space-y-4 mb-8">
        <ActionCard
          icon={<Landmark className="w-6 h-6 text-cyan-600" />}
          title="Conecta tu banco"
          subtitle="Tus transacciones se importarán y categorizarán automáticamente con IA."
          tag="Recomendado · 2 min"
          tagColor="bg-cyan-100 text-cyan-700"
          isDone={bankDone}
        >
          <ConnectBankAction onDone={() => setBankDone(true)} />
          <button
            onClick={() => setBankDone(true)} // Saltar cuenta como hecho para avanzar
            className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            Prefiero conectarlo más tarde desde Cuentas →
          </button>
        </ActionCard>

        <ActionCard
          icon={<ScanLine className="w-6 h-6 text-emerald-600" />}
          title="Registra tu despensa"
          subtitle="La IA sugerirá recetas con lo que hay en casa y te avisará antes de que caduque nada."
          tag="La feature favorita de los usuarios"
          tagColor="bg-emerald-100 text-emerald-700"
          isDone={pantryDone}
        >
          <p className="text-xs text-gray-400 italic">
            Podrás escanear tickets y añadir productos desde <b>Mi Cocina → Despensa</b> en cuanto entres.
          </p>
        </ActionCard>
      </div>

      {/* CTA */}
      <button
        onClick={handleComplete}
        className={`w-full max-w-md px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-95 ${
          bothDone
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200 hover:shadow-emerald-300'
            : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-gray-200 hover:shadow-gray-300'
        }`}
      >
        {bothDone ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        {bothDone ? '¡Todo listo! Entrar a Aliseus' : 'Entrar a Aliseus'}
      </button>

      <button
        onClick={() => setOnboardingStep(6)}
        className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← Atrás
      </button>
    </div>
  );
};

export default QuickStartStep;
