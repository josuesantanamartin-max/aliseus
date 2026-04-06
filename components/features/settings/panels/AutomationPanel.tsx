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
            className="max-w-4xl space-y-12 pb-12"
        >
            {/* New Rule Form */}
            <section className="bg-white/40 dark:bg-aliseus-950 p-10 md:p-14 rounded-[50px] border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-2xl relative overflow-hidden group ring-1 ring-slate-200/50 dark:ring-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/40 to-white/80 dark:from-[#0c0c1e] dark:via-indigo-950/20 dark:to-aliseus-950" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-indigo-400 rounded-2xl border border-blue-500/20 shadow-inner">
                            <Zap className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {isSpanish ? 'Nueva Regla Inteligente' : 'New Smart Rule'}
                            </h4>
                            <p className="text-[10px] font-black text-blue-600/60 dark:text-indigo-400/60 uppercase tracking-widest mt-1">Automatización Proactiva</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-indigo-300/50 uppercase tracking-[0.2em] mb-3 ml-1">
                                {isSpanish ? 'Evento Disparador' : 'Trigger Event'}
                            </label>
                            <div className="relative">
                                <select
                                    value={newRuleTrigger}
                                    onChange={(e) => setNewRuleTrigger(e.target.value as any)}
                                    className="w-full p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    <option value="TRANSACTION_OVER_AMOUNT" className="bg-white dark:bg-aliseus-950 text-slate-900 dark:text-white">{isSpanish ? 'Gasto superior a...' : 'Expense over...'}</option>
                                    <option value="TRIP_CREATED" className="bg-white dark:bg-aliseus-950 text-slate-900 dark:text-white">{isSpanish ? 'Nuevo viaje detectado' : 'New trip detected'}</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                    <Plus className="w-4 h-4 text-slate-900 dark:text-white rotate-45" />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-indigo-300/50 uppercase tracking-[0.2em] mb-3 ml-1">
                                {isSpanish ? 'Umbral de Acción' : 'Action Threshold'}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={newRuleThreshold}
                                    onChange={(e) => setNewRuleThreshold(e.target.value)}
                                    className="w-full p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
                                    placeholder="0.00"
                                    disabled={newRuleTrigger !== 'TRANSACTION_OVER_AMOUNT'}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 dark:text-white/20">{currency}</div>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full h-[66px] bg-blue-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-3">
                                {isSpanish ? 'Activar' : 'Activate'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Rules List */}
            <section className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isSpanish ? 'Reglas en Ejecución' : 'Running Rules'}
                        </h4>
                    </div>
                    <span className="px-4 py-2 bg-slate-50 dark:bg-aliseus-900 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5">
                        {automationRules.length} Total
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {automationRules.map((rule) => (
                        <motion.div 
                            key={rule.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-8 rounded-[40px] border transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8 group relative overflow-hidden ${
                                rule.isActive
                                    ? 'bg-white/80 dark:bg-aliseus-900 border-blue-100 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 ring-1 ring-blue-500/5'
                                    : 'bg-slate-50 dark:bg-[#0c0c1e] border-slate-200 dark:border-white/5 opacity-60 grayscale'
                            }`}
                        >
                            {rule.isActive && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            )}
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner ${
                                    rule.isActive 
                                        ? 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20' 
                                        : 'bg-slate-200 dark:bg-aliseus-800 text-slate-400'
                                }`}>
                                    <Zap className={`w-7 h-7 ${rule.isActive ? 'animate-pulse' : ''}`} />
                                </div>
                                <div>
                                    <h5 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{rule.name}</h5>
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-black/40 text-slate-400 dark:text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 dark:border-none">
                                            Trigger: {rule.trigger}
                                        </div>
                                        {rule.threshold && (
                                            <div className="px-3 py-1.5 bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-indigo-500/20">
                                                Limit: {rule.threshold}{currency}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 relative z-10">
                                <button
                                    onClick={() => handleToggleRule(rule.id)}
                                    className={`relative w-20 h-10 rounded-2xl transition-all duration-500 flex items-center px-1.5 ${
                                        rule.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300 dark:bg-aliseus-800'
                                    }`}
                                >
                                    <motion.div 
                                        animate={{ x: rule.isActive ? 40 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="w-7 h-7 bg-white rounded-xl shadow-md" 
                                    />
                                </button>
                                
                                <button
                                    onClick={() => handleDeleteRule(rule.id)}
                                    className="p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-2xl transition-all duration-300 active:scale-90"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {automationRules.length === 0 && (
                        <div className="text-center py-24 bg-white/60 dark:bg-aliseus-900 rounded-[50px] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-black/20" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-blue-50 dark:bg-indigo-900/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-blue-100 dark:border-indigo-900/50 shadow-inner">
                                    <Zap className="w-10 h-10 text-blue-300 dark:text-indigo-600 opacity-40" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">
                                    {isSpanish ? 'Cero Automatización' : 'Zero Automation'}
                                </h4>
                                <p className="text-base text-slate-400 dark:text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                                    {isSpanish 
                                        ? 'Deja que Aura se encargue de lo repetitivo. Crea tu primera regla inteligente.' 
                                        : 'Let Aura handle the repetition. Create your first smart rule today.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );
};
