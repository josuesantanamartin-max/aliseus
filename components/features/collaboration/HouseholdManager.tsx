import React, { useState, useEffect } from 'react';
import { useHouseholdStore } from '../../../store/useHouseholdStore';
import { Plus, Home, Users, Check, LogOut } from 'lucide-react';

export const HouseholdManager: React.FC = () => {
    const { households, activeHouseholdId, fetchHouseholds, createHousehold, setActiveHousehold } = useHouseholdStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'CHF' | 'CAD' | 'AUD' | 'INR'>('EUR');

    useEffect(() => {
        fetchHouseholds();
    }, []);

    const handleCreate = async () => {
        if (!newHouseholdName.trim()) return;
        await createHousehold(newHouseholdName, currency);
        setNewHouseholdName('');
        setIsCreating(false);
    };

    const activeHousehold = households.find(h => h.id === activeHouseholdId);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Home className="w-5 h-5 text-aliseus-500" />
                    Mis Hogares
                </h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4 animate-fadeIn">
                    <input
                        type="text"
                        placeholder="Nombre del Hogar (ej. Familia Smith)"
                        value={newHouseholdName}
                        onChange={(e) => setNewHouseholdName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-aliseus-500"
                    />
                    <div className="flex flex-wrap gap-2">
                        {['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR'].map((curr) => (
                            <button
                                key={curr}
                                onClick={() => setCurrency(curr as any)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${currency === curr ? 'bg-aliseus-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={!newHouseholdName.trim()}
                        className="w-full py-2 bg-aliseus-600 hover:bg-aliseus-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Crear Hogar
                    </button>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {households.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No perteneces a ningún hogar aún.</p>
                ) : (
                    households.map(h => (
                        <div
                            key={h.id}
                            onClick={() => setActiveHousehold(h.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${activeHouseholdId === h.id ? 'border-aliseus-500 bg-aliseus-50 dark:bg-aliseus-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                        >
                            <div>
                                <h3 className={`font-semibold ${activeHouseholdId === h.id ? 'text-aliseus-700 dark:text-aliseus-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {h.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{h.currency}</span>
                                    <span>• {h.members?.length || 1} Miembros</span>
                                </div>
                            </div>

                            {activeHouseholdId === h.id ? (
                                <div className="bg-aliseus-600 text-white p-1 rounded-full">
                                    <Check className="w-4 h-4" />
                                </div>
                            ) : (
                                <div className="opacity-0 group-hover:opacity-100 text-gray-400">
                                    <LogOut className="w-4 h-4" /> {/* Placeholder for 'Switch' concept visually */}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
