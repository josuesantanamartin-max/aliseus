import React from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, ShieldAlert, Clock } from 'lucide-react';
import type { ConsentUrgency } from '@/hooks/useBankingConsent';

interface BankingConsentBannerProps {
  daysRemaining: number | null;
  urgency: ConsentUrgency;
  expiresAt: Date | null;
  onReconnect: () => void;
}

const configs = {
  safe: {
    bg: 'bg-emerald-50 border-emerald-100',
    icon: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    barColor: 'bg-emerald-400',
    textColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    label: 'Conexión activa',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: <Clock className="w-4 h-4 text-amber-500 shrink-0" />,
    barColor: 'bg-amber-400',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700',
    label: 'Renueva pronto',
  },
  critical: {
    bg: 'bg-red-50 border-red-200',
    icon: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
    barColor: 'bg-red-500',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700',
    label: 'Expira en breve',
  },
  expired: {
    bg: 'bg-slate-100 border-slate-200',
    icon: <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />,
    barColor: 'bg-slate-400',
    textColor: 'text-slate-700',
    badgeColor: 'bg-slate-200 text-slate-700',
    label: 'Conexión expirada',
  },
};

export const BankingConsentBanner: React.FC<BankingConsentBannerProps> = ({
  daysRemaining,
  urgency,
  expiresAt,
  onReconnect,
}) => {
  const c = configs[urgency];
  // Clamp progress: 0% on day 0, 100% on day 180
  const progress = daysRemaining !== null ? Math.min(Math.max((daysRemaining / 180) * 100, 0), 100) : 100;

  const expiryLabel = expiresAt
    ? expiresAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 ${c.bg}`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {c.icon}
          <span className={`text-xs font-bold uppercase tracking-widest ${c.textColor}`}>
            {c.label}
          </span>
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${c.badgeColor}`}>
          PSD2
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${c.barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Days count + action */}
      <div className="flex items-end justify-between gap-2">
        <div>
          {daysRemaining !== null && daysRemaining > 0 ? (
            <>
              <p className={`text-2xl font-black tracking-tight ${c.textColor}`}>
                {daysRemaining}
                <span className={`text-xs font-bold ml-1 ${c.textColor} opacity-70`}>días restantes</span>
              </p>
              {expiryLabel && (
                <p className={`text-[10px] font-semibold mt-0.5 opacity-60 ${c.textColor}`}>
                  Expira el {expiryLabel}
                </p>
              )}
            </>
          ) : (
            <p className={`text-sm font-bold ${c.textColor}`}>
              Tu conexión bancaria ha caducado. Vuelve a vincular tu banco para seguir sincronizando.
            </p>
          )}
        </div>

        {(urgency === 'warning' || urgency === 'critical' || urgency === 'expired') && (
          <button
            onClick={onReconnect}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl shrink-0 transition-all duration-200 active:scale-95 ${
              urgency === 'expired'
                ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm'
                : 'bg-white/80 hover:bg-white text-cyan-700 border border-cyan-200'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            {urgency === 'expired' ? 'Reconectar ahora' : 'Renovar acceso'}
          </button>
        )}
      </div>
    </div>
  );
};
