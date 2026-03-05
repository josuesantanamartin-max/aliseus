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
                                placeholder="Correo electrónico"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="flex gap-2">
                            {(['ADMIN', 'MEMBER', 'VIEWER'] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setInviteRole(role)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${inviteRole === role ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        {!generatedLink ? (
                            <button
                                onClick={handleInvite}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Generar Enlace de Invitación
                            </button>
                        ) : (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                                    <Link className="w-3 h-3" /> Enlace Generado
                                </h4>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                                    Copia este enlace y envíaselo a tu familiar por WhatsApp o email:
                                </p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={generatedLink}
                                        className="flex-1 text-xs px-2 py-1.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded outline-none text-gray-600 dark:text-gray-300"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                {copied && <span className="text-[10px] text-emerald-500 font-bold mt-1 block">¡Copiado al portapapeles!</span>}

                                <button
                                    onClick={() => { setGeneratedLink(''); setShowInviteForm(false); }}
                                    className="w-full mt-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition"
                                >
                                    Cerrar
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
