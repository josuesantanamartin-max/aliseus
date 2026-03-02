import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Layers, Trash2 } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { AutomationRule } from '../../../../types';

export const AutomationPanel = () => {
    const { automationRules, setAutomationRules, language, currency } = useUserStore();
    const isSpanish = language === 'ES';

    const [newRuleTrigger, setNewRuleTrigger] = useState<AutomationRule['trigger']>('TRANSACTION_OVER_AMOUNT');
    const [newRuleThreshold, setNewRuleThreshold] = useState('100');

    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();

        let name = '';
        if (newRuleTrigger === 'TRANSACTION_OVER_AMOUNT') name = isSpanish ? `Alerta gasto > ${newRuleThreshold}${currency}` : `Alert expense > ${newRuleThreshold}${currency}`;
        if (newRuleTrigger === 'TRIP_CREATED') name = isSpanish ? `Auto-categoría Viajes` : `Auto-category Trips`;

        const newRule: AutomationRule = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            trigger: newRuleTrigger,
            threshold: parseFloat(newRuleThreshold),
            action: 'SEND_ALERT',
            isActive: true
        };

        setAutomationRules([...automationRules, newRule]);
    };

    const handleToggleRule = (id: string) => {
        setAutomationRules(automationRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    };

    const handleDeleteRule = (id: string) => {
        setAutomationRules(automationRules.filter(r => r.id !== id));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-8 pb-12"
        >
            <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {isSpanish ? 'Automatización' : 'Automation'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Crea reglas para automatizar alertas y categorización.' : 'Create rules to automate alerts and categorization.'}
                </p>
            </div>

            {/* New Rule Form */}
            <form onSubmit={handleAddRule} className="bg-gray-900 dark:bg-onyx-950 border border-gray-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
                <h4 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3 mb-8 relative z-10">
                    <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-inner border border-indigo-500/30">
                        <Zap className="w-6 h-6" />
                    </div>
                    {isSpanish ? 'Nueva Regla Automática' : 'New Automation Rule'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 ml-1">
                            {isSpanish ? 'Disparador' : 'Trigger'}
                        </label>
                        <select
                            value={newRuleTrigger}
                            onChange={(e) => setNewRuleTrigger(e.target.value as any)}
                            className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-2xl font-black text-white outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 hover:bg-gray-800 transition-colors shadow-inner appearance-none custom-scrollbar"
                        >
                            <option value="TRANSACTION_OVER_AMOUNT">{isSpanish ? 'Transacción mayor de...' : 'Transaction over...'}</option>
                            {/* Additional triggers possible later */}
                            <option value="TRIP_CREATED">{isSpanish ? 'Nuevo viaje creado' : 'New trip created'}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 ml-1">
                            {isSpanish ? 'Valor Límite' : 'Threshold'}
                        </label>
                        <input
                            type="number"
                            value={newRuleThreshold}
                            onChange={(e) => setNewRuleThreshold(e.target.value)}
                            className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-2xl font-black text-white outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 hover:bg-gray-800 transition-colors shadow-inner"
                            placeholder="100.00"
                            disabled={newRuleTrigger !== 'TRANSACTION_OVER_AMOUNT'}
                        />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full h-[58px] bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-400 transition-all active:scale-95 flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" /> {isSpanish ? 'Crear' : 'Create'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-1 gap-4 pt-4">
                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-onyx-800 pb-4 mb-2 flex items-center gap-3">
                    <Layers className="w-6 h-6 text-indigo-500" /> {isSpanish ? 'Mis Reglas Activas' : 'My Active Rules'}
                </h4>
                {automationRules.map((rule) => (
                    <div key={rule.id} className={`p-6 rounded-[2.5rem] border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group ${rule.isActive
                            ? 'bg-white dark:bg-onyx-900 border-indigo-100 dark:border-indigo-900/50 shadow-xl shadow-gray-200/40 dark:shadow-none hover:-translate-y-1'
                            : 'bg-gray-50 dark:bg-onyx-950 border-gray-200 dark:border-onyx-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                        }`}>
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-inner ${rule.isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-onyx-800 text-gray-400'
                                }`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{rule.name}</h5>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-[0.75rem] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                        {rule.trigger}
                                    </span>
                                    {rule.threshold && <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-onyx-800 px-3 py-1.5 rounded-[0.75rem] shadow-inner"> {'>'} {rule.threshold}{currency}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 bg-gray-50 dark:bg-onyx-950 p-2.5 rounded-2xl border border-gray-200 dark:border-onyx-800 shadow-inner">
                            <button
                                onClick={() => handleToggleRule(rule.id)}
                                className={`relative w-16 h-8 rounded-xl transition-all duration-300 shadow-inner ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-onyx-700'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-lg transition-transform duration-300 shadow-sm ${rule.isActive ? 'left-9' : 'left-1'}`} />
                            </button>
                            <div className="w-px h-8 bg-gray-200 dark:bg-onyx-800"></div>
                            <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {automationRules.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-onyx-900 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-onyx-950 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-onyx-800 shadow-inner">
                            <Zap className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                            {isSpanish ? 'Sin reglas automáticas' : 'No automation rules'}
                        </h4>
                        <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                            {isSpanish ? 'Automatiza tus finanzas creando tu primera regla inteligente para alertas y categorización.' : 'Automate your finances by creating your first smart rule for alerts and categorization.'}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
