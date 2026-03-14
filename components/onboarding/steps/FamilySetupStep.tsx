import React, { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { FamilyMember } from '@/types';
import { Plus, Trash2, User, UserPlus, ArrowRight } from 'lucide-react';

// Simple ID generator if uuid is not available or to avoid dependency if not installed
const generateId = () => Math.random().toString(36).substr(2, 9);

const RELATIONSHIPS = ['Pareja', 'Hijo/a', 'Padre', 'Madre', 'Otro'];
const ROLES = [
    { value: 'PARENT', label: 'Administrador (Padre/Madre)' },
    { value: 'CHILD', label: 'Hijo/a (Con asignación)' },
    { value: 'MEMBER', label: 'Miembro (Sin gestión)' }
];

const FamilySetupStep: React.FC = () => {
    const { setOnboardingStep, setUserProfile, userProfile } = useUserStore();
    const [members, setMembers] = useState<FamilyMember[]>(userProfile?.familyMembers || []);

    // Form state
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
    const [role, setRole] = useState<'PARENT' | 'CHILD' | 'MEMBER'>('MEMBER');

    const handleAddMember = () => {
        if (!name.trim()) return;

        const newMember: FamilyMember = {
            id: generateId(),
            name,
            relationship,
            role,
            avatar: '', // TODO: Default avatar or generation
            balance: 0,
            weeklyAllowance: 0,
            growthHistory: []
        };

        setMembers([...members, newMember]);
        setName('');
        setRelationship(RELATIONSHIPS[0]);
        setRole('MEMBER');
    };

    const removeMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleContinue = () => {
        setUserProfile({
            ...userProfile,
            familyMembers: members
        });
        setOnboardingStep(4); // Go to Currency
    };

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
                Configura tu Familia
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                Añade a los miembros de tu familia para gestionar gastos y asignaciones.
            </p>

            {/* List of Members */}
            <div className="w-full mb-8 space-y-3">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-white dark:bg-onyx-800 rounded-xl border border-gray-100 dark:border-onyx-700 shadow-sm animate-fade-in-up">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{member.name}</h4>
                                <p className="text-xs text-gray-500">{member.relationship} • {member.role === 'PARENT' ? 'Administrador' : member.role === 'CHILD' ? 'Hijo/a' : 'Miembro'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeMember(member.id)}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {members.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-onyx-700 rounded-xl text-gray-400">
                        No has añadido ningún miembro aún.
                    </div>
                )}
            </div>

            {/* Add Member Form */}
            <div className="w-full bg-gray-50 dark:bg-onyx-800/50 p-6 rounded-2xl mb-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Añadir Miembro
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 rounded-lg border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="p-3 rounded-lg border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                        {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="p-3 rounded-lg border border-gray-200 dark:border-onyx-600 bg-white dark:bg-onyx-900 focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleAddMember}
                    disabled={!name.trim()}
                    className="w-full py-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 font-bold rounded-xl hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Añadir a la Familia
                </button>
            </div>

            <div className="flex justify-between w-full max-w-md">
                <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Atrás
                </button>

                <button
                    onClick={handleContinue}
                    className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700 hover:scale-105 transition-all flex items-center gap-2"
                >
                    Continuar <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FamilySetupStep;
