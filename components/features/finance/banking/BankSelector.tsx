
import React, { useState, useEffect, useCallback } from 'react';
import { bankingService } from '@/services/bankingService';
import { monitoringService } from '@/services/monitoringService';
import { Loader2, ShieldCheck, Landmark, ArrowRight } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface BankSelectorProps {
  onClose: () => void;
}

declare global {
  interface Window {
    Plaid: any;
  }
}

export const BankSelector: React.FC<BankSelectorProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [plaidReady, setPlaidReady] = useState(false);
  const [linking, setLinking] = useState(false);
  const { showError } = useErrorHandler();

  // 1. Cargar el script de Plaid Link
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => setPlaidReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2. Obtener el link_token del backend
  useEffect(() => {
    const initPlaid = async () => {
      try {
        const token = await bankingService.createLinkToken();
        setLinkToken(token);
      } catch (error) {
        showError(error);
      } finally {
        setLoading(false);
      }
    };
    initPlaid();
  }, [showError]);
  const handleOpenPlaid = useCallback(() => {
    if (!window.Plaid || !linkToken) return;

    monitoringService.addBreadcrumb('Opening Plaid Link', 'banking', { linkToken: linkToken.substring(0, 10) + '...' });

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token: string, metadata: any) => {
        monitoringService.addBreadcrumb('Plaid Link Success', 'banking', { 
          institution: metadata.institution?.name,
          institutionId: metadata.institution?.institution_id
        });
        try {
          setLinking(true);
          await bankingService.exchangePublicToken(public_token, metadata.institution);
          onClose();
        } catch (error) {
          showError(error);
          setLinking(false);
        }
      },
      onExit: (err: any, metadata: any) => {
        monitoringService.addBreadcrumb('Plaid Link Exit', 'banking', { 
          status: metadata.status,
          error: err ? err.message : 'User cancelled' 
        });
        if (err != null) {
          console.error(err);
        }
      },
    });

    handler.open();
  }, [linkToken, onClose, showError]);

  return (
    <div className="bg-white/90 backdrop-blur-2xl border border-blue-100 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 max-w-lg w-full mx-auto">
      <div className="p-10 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-blue-50/50">
          <Landmark className="w-10 h-10 text-blue-500" />
        </div>
        
        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
          Conexión Bancaria
        </h3>
        <p className="text-slate-500 font-medium px-4 mb-10 leading-relaxed">
          Aliseus utiliza <span className="text-blue-600 font-bold">Plaid</span> para conectar tus cuentas de forma segura y privada.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Cifrado de grado bancario</p>
              <p className="text-xs text-slate-400 font-medium">Tus credenciales nunca pasan por Aliseus.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <button
            onClick={handleOpenPlaid}
            disabled={!plaidReady || !linkToken || linking}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center group"
          >
            {linking ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Vincular mi Banco
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        )}

        <button 
          onClick={onClose}
          className="mt-6 text-slate-400 hover:text-slate-600 font-bold text-sm tracking-wide uppercase transition-colors"
        >
          Quizás más tarde
        </button>
      </div>

      <div className="px-10 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-center space-x-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Desarrollado con tecnología de Open Banking segura
        </p>
      </div>
    </div>
  );
};
