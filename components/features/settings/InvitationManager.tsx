import React, { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Ban, Mail, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { invitationService, BetaInvitation } from '../../../services/invitationService';
import { useToastStore } from '../../../store/toastStore';

export const InvitationManager: React.FC = () => {
    const [invitations, setInvitations] = useState<BetaInvitation[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, used: 0, expired: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { addToast } = useToastStore();

    // Form state
    const [email, setEmail] = useState('');
    const [maxUses, setMaxUses] = useState(1);
    const [expiresIn, setExpiresIn] = useState(30); // days
    const [batchCount, setBatchCount] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [invitationsData, statsData] = await Promise.all([
            invitationService.getAll(),
            invitationService.getStats()
        ]);
        setInvitations(invitationsData);
        setStats(statsData);
        setIsLoading(false);
    };

    const handleCreate = async () => {
        const expiresAt = expiresIn > 0
            ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
            : undefined;

        if (batchCount === 1) {
            const code = await invitationService.generateCode({
                email: email || undefined,
                max_uses: maxUses,
                expires_at: expiresAt
            });

            if (code) {
                addToast({ message: 'Código creado: ' + code, type: 'success' });
                loadData();
                setShowCreateModal(false);
                resetForm();
            } else {
                addToast({ message: 'Error al crear código', type: 'error' });
            }
        } else {
            const codes = await invitationService.generateBatch(batchCount, {
                max_uses: maxUses,
                expires_at: expiresAt
            });

            if (codes.length > 0) {
                addToast({ message: `${codes.length} códigos creados`, type: 'success' });
                loadData();
                setShowCreateModal(false);
                resetForm();
            } else {
                addToast({ message: 'Error al crear códigos', type: 'error' });
            }
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        addToast({ message: 'Código copiado', type: 'success' });
    };

    const handleDeactivate = async (id: string) => {
        const success = await invitationService.deactivate(id);
        if (success) {
            addToast({ message: 'Código desactivado', type: 'success' });
            loadData();
        } else {
            addToast({ message: 'Error al desactivar código', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este código de invitación?')) return;

        const success = await invitationService.delete(id);
        if (success) {
            addToast({ message: 'Código eliminado', type: 'success' });
            loadData();
        } else {
            addToast({ message: 'Error al eliminar código', type: 'error' });
        }
    };

    const resetForm = () => {
        setEmail('');
        setMaxUses(1);
        setExpiresIn(30);
        setBatchCount(1);
    };

    const getStatusBadge = (invitation: BetaInvitation) => {
        const now = new Date();
        const isExpired = invitation.expires_at && new Date(invitation.expires_at) < now;
        const isUsed = invitation.uses_count >= invitation.max_uses;

        if (!invitation.is_active) {
            return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1"><Ban className="w-3 h-3" /> Desactivado</span>;
        }
        if (isExpired) {
            return <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Expirado</span>;
        }
        if (isUsed) {
            return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Usado</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Activo</span>;
    };

    if (isLoading) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Códigos de Invitación Beta</h2>
                    <p className="text-gray-600 dark:text-gray-400">Gestiona el acceso a la beta</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-aliseus-600 hover:bg-aliseus-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Crear Código
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-gray-400" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.used}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Usados</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-orange-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expired}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Expirados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invitations Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Código</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usos</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expira</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {invitations.map(invitation => (
                            <tr key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="px-4 py-3">
                                    <code className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                        {invitation.code}
                                    </code>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {invitation.email || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {invitation.uses_count} / {invitation.max_uses}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {invitation.expires_at
                                        ? new Date(invitation.expires_at).toLocaleDateString()
                                        : 'Nunca'}
                                </td>
                                <td className="px-4 py-3">
                                    {getStatusBadge(invitation)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCopy(invitation.code)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            title="Copiar código"
                                        >
                                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        {invitation.is_active && (
                                            <button
                                                onClick={() => handleDeactivate(invitation.id)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                                title="Desactivar"
                                            >
                                                <Ban className="w-4 h-4 text-orange-600" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(invitation.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Crear Código de Invitación</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email (opcional)
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Usos máximos
                                </label>
                                <input
                                    type="number"
                                    value={maxUses}
                                    onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                                    min={1}
                                    max={100}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Expira en (días)
                                </label>
                                <input
                                    type="number"
                                    value={expiresIn}
                                    onChange={(e) => setExpiresIn(parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={365}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                    placeholder="0 = nunca"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Cantidad de códigos
                                </label>
                                <input
                                    type="number"
                                    value={batchCount}
                                    onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                                    min={1}
                                    max={100}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-2 bg-aliseus-600 text-white rounded-lg hover:bg-aliseus-700"
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvitationManager;
