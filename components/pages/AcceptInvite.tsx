import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { householdService } from '../../services/householdService';
import { useHouseholdStore } from '../../store/useHouseholdStore';

interface AcceptInviteProps {
    token: string;
}

const AcceptInvite: React.FC<AcceptInviteProps> = ({ token }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const accept = async () => {
            try {
                await householdService.acceptInvitation(token);
                // Refresh households
                await useHouseholdStore.getState().fetchHouseholds();
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setErrorMsg(err.message || 'Error desconocido.');
            }
        };
        accept();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-gray-100"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Procesando Invitación</h2>
                        <p className="text-gray-500 font-medium text-sm">Validando tu acceso seguro al hogar...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">¡Invitación Aceptada!</h2>
                        <p className="text-gray-500 font-medium text-sm mb-8">
                            Te has unido correctamente al hogar. Ahora podrás colaborar y compartir datos financieros.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                            Ir a mi panel <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Error en la Invitación</h2>
                        <p className="text-rose-500 font-medium text-sm mb-2">{errorMsg}</p>
                        <p className="text-gray-500 text-xs mb-8">
                            Asegúrate de que estás iniciando sesión con el email exacto al que te enviaron la invitación, y de que ésta no haya caducado.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
                        >
                            Volver al inicio
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AcceptInvite;
