
import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { bankingService } from '@/services/bankingService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const BankCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finalizando conexión con tu banco...');
  const { showError } = useErrorHandler();

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const requisitionId = params.get('ref'); // GoCardless suele usar 'ref' si se configuró así

      if (!requisitionId) {
        setStatus('error');
        setMessage('No se encontró la referencia de la conexión bancaria.');
        return;
      }

      try {
        await bankingService.finalizeConnection(requisitionId);
        setStatus('success');
        setMessage('¡Banco conectado correctamente! Ahora puedes sincronizar tus transacciones.');
      } catch (error) {
        showError(error);
        setStatus('error');
        setMessage('Hubo un problema al finalizar la conexión con tu banco.');
      }
    };

    processCallback();
  }, [showError]);

  const handleGoBack = () => {
    window.location.href = '/finance'; // Redirección simple para volver al estado normal
  };

  return (
    <div className="min-h-screen bg-aliseus-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
            {status === 'loading' && <Loader2 className="w-10 h-10 text-white animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-10 h-10 text-white" />}
            {status === 'error' && <XCircle className="w-10 h-10 text-white" />}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-cyan-900">
            {status === 'loading' && 'Procesando...'}
            {status === 'success' && '¡Éxito!'}
            {status === 'error' && 'Ups, algo falló'}
          </h2>
          <p className="text-cyan-600 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {(status === 'success' || status === 'error') && (
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-2xl font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/20"
          >
            Volver a Aliseus <ArrowRight className="w-5 h-5" />
          </button>
        )}

        <div className="pt-4 border-t border-cyan-50">
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em]">
            Aliseus Secure Banking
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankCallback;
