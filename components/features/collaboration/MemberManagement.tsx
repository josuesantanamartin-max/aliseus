import React, { useState, useEffect } from 'react';
import { useHouseholdStore } from '../../../store/useHouseholdStore';
import { UserPlus, Shield, X, Mail, Users, Star, Link, Copy } from 'lucide-react';
import Toast from '../../common/Toast';
import { useUserStore } from '../../../store/useUserStore';

export const MemberManagement: React.FC = () => {
    const { activeHouseholdId, members, fetchMembers, inviteMember } = useHouseholdStore();
    const { subscription } = useUserStore();
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    // Check if user has family plan
    const canInvite = subscription.plan === 'FAMILIA';

    useEffect(() => {
        if (activeHouseholdId) {
            fetchMembers(activeHouseholdId);
        }
    }, [activeHouseholdId]);

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !activeHouseholdId) return;
        try {
            const invite: any = await inviteMember(inviteEmail, inviteRole);

            if (invite?.token) {
                const link = `${window.location.origin}/invite/${invite.token}`;
                setGeneratedLink(link);
            }

            setInviteEmail('');
            // Optional: setShowInviteForm remain open to show the link
        } catch (e) {
            console.error("Failed to invite", e);
            alert("No se pudo crear la invitación. Revisa tus permisos.");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!activeHouseholdId) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Miembros
                </h2>
                {canInvite ? (
                    <button
                        onClick={() => setShowInviteForm(!showInviteForm)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invitar
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold">
                        <Star className="w-3 h-3" />
                        Requiere Premium
                    </div>
                )}
            </div>

            {/* Invite Form */}
            {showInviteForm && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Invitar Nuevo Miembro</h3>
                        <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Correo electrónico del familiar"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Seleccionar Rol</label>
                                <div className="flex gap-2">
                                    {(['ADMIN', 'MEMBER', 'VIEWER'] as const).map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setInviteRole(role)}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${inviteRole === role ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {role === 'ADMIN' ? 'Administrador' : role === 'MEMBER' ? 'Miembro' : 'Lector'}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed italic">
                                        {inviteRole === 'ADMIN' && "• Control total: Gestiona finanzas, miembros y toda la configuración del hogar."}
                                        {inviteRole === 'MEMBER' && "• Participación activa: Añade gastos, recetas y planes, pero no gestiona otros miembros."}
                                        {inviteRole === 'VIEWER' && "• Solo lectura: Puede ver la información pero no realizar cambios ni añadir datos."}
                                    </p>
                                </div>
                            </div>

                            {!generatedLink ? (
                                <button
                                    onClick={handleInvite}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                                >
                                    Generar Enlace de Invitación
                                </button>
                            ) : (
                                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1">
                                        <Link className="w-3 h-3" /> Enlace de Acceso Generado
                                    </h4>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mb-3 font-medium">
                                        Envía este enlace secreto a tu familiar. Solo podrá usarse una vez para este email:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={generatedLink}
                                            className="flex-1 text-[10px] px-2 py-2 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded outline-none text-gray-600 dark:text-gray-300 font-mono"
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {copied && <span className="text-[10px] text-emerald-500 font-black mt-2 block animate-pulse">¡ENLACE COPIADO!</span>}

                                    <button
                                        onClick={() => { setGeneratedLink(''); setShowInviteForm(false); }}
                                        className="w-full mt-4 py-2 border border-emerald-200 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white transition"
                                    >
                                        Finalizar
                                    </button>
                                </div>
                            )}
                        </div>
                </div>
            )}

            {/* Members List */}
            <div className="space-y-4">
                {members.map((member: any) => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {member.full_name?.[0].toUpperCase() || member.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                    {member.full_name || member.email || 'Usuario'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    {member.role === 'ADMIN' && <Shield className="w-3 h-3 text-amber-500" />}
                                    {member.role}
                                </p>
                            </div>
                        </div>

                        {/* Actions could go here (Remove, Change Role) if user is Admin */}
                    </div>
                ))}
            </div>
        </div>
    );
};
