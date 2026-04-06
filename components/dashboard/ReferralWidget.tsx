import React, { useEffect, useState } from 'react';
import { Gift, Copy, Check, Users, Sparkles, Share2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export const ReferralWidget: React.FC = () => {
    const { referral, generateReferralCode, userProfile } = useUserStore();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!referral.code) {
            generateReferralCode();
        }
    }, [referral.code, generateReferralCode]);

    const handleCopy = () => {
        if (referral.code) {
            navigator.clipboard.writeText(referral.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (navigator.share && referral.code) {
            try {
                await navigator.share({
                    title: 'Únete a la Beta de Aliseus',
                    text: `¡Hola! Prueba Aliseus con mi código: ${referral.code} y obtén meses extra gratis.`,
                    url: 'https://aliseus.com/beta',
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 p-6 border border-white/20 backdrop-blur-sm">
            {/* Background elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-indigo-500/20 blur-3xl rounded-full" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 bg-pink-500/20 blur-3xl rounded-full" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                        <Gift size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Plan Amigos</h3>
                        <p className="text-xs text-slate-500">Gana 3 meses por cada amigo</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-2xl bg-white/50 p-3 border border-white/40">
                        <div className="flex items-center gap-2 mb-1">
                            <Users size={14} className="text-indigo-500" />
                            <span className="text-xs font-medium text-slate-600">Amigos</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800">{referral.count}</p>
                    </div>
                    <div className="rounded-2xl bg-white/50 p-3 border border-white/40">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-purple-500" />
                            <span className="text-xs font-medium text-slate-600">Meses +</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800">{referral.rewardMonths}</p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 ml-1">Tu Código Amigo</label>
                    <div className="group relative flex items-center gap-2 rounded-2xl bg-white/80 p-1.5 border border-slate-200 focus-within:border-indigo-300 transition-all">
                        <input
                            type="text"
                            readOnly
                            value={referral.code || 'Generando...'}
                            className="w-full bg-transparent px-3 text-sm font-mono font-medium text-slate-700 outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all ${
                                copied 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copiado' : 'Copiar'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleShare}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] mt-2 shadow-lg shadow-slate-900/10"
                >
                    <Share2 size={16} />
                    Compartir Invitación
                </button>
            </div>
        </div>
    );
};
