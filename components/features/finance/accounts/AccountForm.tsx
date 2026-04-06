import React from 'react';
import { Account, CadastralData } from '@/types';
import { ChevronLeft, X, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import {
    ACCOUNT_TYPES, CARD_NETWORKS, colorMap,
    getTypeConfig, getTypeLabel, AccountFormState,
} from './accountConstants';

interface LinkedCardFormData {
    name: string;
    cardNetwork: Account['cardNetwork'];
    type: 'CREDIT' | 'DEBIT';
    creditLimit: string;
}

interface AccountFormProps {
    isOpen: boolean;
    editingId: string | null;
    step: 1 | 2;
    setStep: (s: 1 | 2) => void;
    selectedType: Account['type'];
    setSelectedType: (t: Account['type']) => void;
    form: AccountFormState;
    setF: (k: keyof AccountFormState, v: any) => void;
    // Cadastral
    cadastralData: CadastralData | null;
    cadastralError: string;
    isFetchingCadastral: boolean;
    onFetchCadastral: () => void;
    // Linked cards
    linkedCards: LinkedCardFormData[];
    onAddLinkedCard: () => void;
    onRemoveLinkedCard: (i: number) => void;
    onUpdateLinkedCard: (i: number, key: string, val: any) => void;
    // Accounts for linked account select
    accounts: Account[];
    // Actions
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    validationErrors?: Record<string, string>;
}

export const AccountForm: React.FC<AccountFormProps> = ({
    isOpen, editingId, step, setStep, selectedType, setSelectedType,
    form, setF,
    cadastralData, cadastralError, isFetchingCadastral, onFetchCadastral,
    linkedCards, onAddLinkedCard, onRemoveLinkedCard, onUpdateLinkedCard,
    accounts, onClose, onSubmit, validationErrors = {},
}) => {
    if (!isOpen) return null;

    const isCardType = selectedType === 'CREDIT' || selectedType === 'DEBIT';
    const isBankLike = selectedType === 'BANK' || selectedType === 'SAVINGS';

    return (
        <div className="bg-white p-8 rounded-Aliseus shadow-xl border border-aliseus-100 animate-fade-in relative overflow-hidden w-full">
            {/* Modal header */}
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-aliseus-50">
                <div className="flex items-center gap-3">
                    {step === 2 && !editingId && (
                        <button type="button" onClick={() => setStep(1)} className="p-2 hover:bg-aliseus-50 rounded-full transition-colors text-aliseus-400 hover:text-aliseus-700">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h4 className="text-2xl font-bold tracking-tight text-cyan-900">{editingId ? 'Editar' : (step === 1 ? 'Nueva cuenta' : getTypeLabel(selectedType))}</h4>
                        <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest mt-1">
                            {editingId ? 'Actualizar información' : (step === 1 ? 'Elige el tipo' : 'Paso 2 · Información')}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-aliseus-50 rounded-full transition-colors"><X className="w-5 h-5 text-aliseus-400" /></button>
            </div>

            {/* STEP 1: Type selector */}
            {step === 1 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ACCOUNT_TYPES.map(t => {
                        const Icon = t.icon;
                        const cls = colorMap[t.color];
                        return (
                            <button key={t.value} type="button"
                                onClick={() => { setSelectedType(t.value as Account['type']); setStep(2); }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-aliseus-100 hover:border-cyan-300 hover:shadow-md transition-all group text-left">
                                <div className={`p-3 rounded-xl ${cls.split(' ').slice(0, 2).join(' ')} group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-cyan-900 text-center leading-tight">{t.label}</p>
                                    <p className="text-[10px] text-aliseus-400 text-center leading-tight mt-0.5">{t.sub}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                /* STEP 2: Form */
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Type badge */}
                    {!editingId && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${colorMap[getTypeConfig(selectedType).color].split(' ').slice(0, 3).join(' ')}`}>
                            {React.createElement(getTypeConfig(selectedType).icon, { className: 'w-3.5 h-3.5' })}
                            {getTypeLabel(selectedType)}
                        </div>
                    )}

                    {/* ── Form fields ── */}
                    <div className="space-y-6">
                        {/* Basic info — always */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="label-xs">Nombre de la cuenta</label>
                                <input required value={form.name} onChange={e => setF('name', e.target.value)} className={`input-field ${validationErrors.name ? 'border-red-300 ring-2 ring-red-500/20' : ''}`} placeholder={isCardType ? 'Ej: Visa Santander' : 'Ej: Cuenta Principal'} />
                                {validationErrors.name && <p className="text-red-500 text-[10px] mt-1.5 font-bold px-2">{validationErrors.name}</p>}
                            </div>
                            <div>
                                <label className="label-xs">{isCardType ? 'Banco emisor' : 'Banco / Entidad'}</label>
                                <input value={form.bankName} onChange={e => setF('bankName', e.target.value)} className={`input-field ${validationErrors.bankName ? 'border-red-300 ring-2 ring-red-500/20' : ''}`} placeholder="Ej: BBVA, Santander…" />
                                {validationErrors.bankName && <p className="text-red-500 text-[10px] mt-1.5 font-bold px-2">{validationErrors.bankName}</p>}
                            </div>
                            {!isCardType && (
                                <div>
                                    <label className="label-xs">Saldo Actual</label>
                                    <input required type="number" step="0.01" value={form.balance} onChange={e => setF('balance', e.target.value)} className={`input-field text-xl font-bold ${validationErrors.balance ? 'border-red-300 ring-2 ring-red-500/20' : ''}`} placeholder="0.00" />
                                    {validationErrors.balance && <p className="text-red-500 text-[10px] mt-1.5 font-bold px-2">{validationErrors.balance}</p>}
                                </div>
                            )}
                            {!isCardType && (
                                <div>
                                    <label className="label-xs">Moneda</label>
                                    <select value={form.currency} onChange={e => setF('currency', e.target.value)} className="input-field">
                                        {['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR'].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}
                            {(selectedType === 'BANK' || selectedType === 'SAVINGS') && (
                                <div>
                                    <label className="label-xs">IBAN <span className="text-aliseus-300 normal-case font-normal">(opcional)</span></label>
                                    <input value={form.iban} onChange={e => setF('iban', e.target.value)} className="input-field font-mono tracking-widest" placeholder="ES00 0000 0000 00 …" />
                                </div>
                            )}
                            <div className={isCardType ? 'col-span-2' : ''}>
                                <label className="label-xs">Descripción <span className="text-aliseus-300 normal-case font-normal">(opcional)</span></label>
                                <input value={form.description} onChange={e => setF('description', e.target.value)} className="input-field" placeholder="Notas sobre esta cuenta…" />
                            </div>
                        </div>

                        {/* ── BANK / SAVINGS extras ── */}
                        {isBankLike && (
                            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-4">
                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Opciones de rentabilidad</p>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div onClick={() => setF('isRemunerated', !form.isRemunerated)}
                                        className={`w-11 h-6 rounded-full transition-colors ${form.isRemunerated || selectedType === 'SAVINGS' ? 'bg-emerald-500' : 'bg-aliseus-200'} flex items-center`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isRemunerated || selectedType === 'SAVINGS' ? 'translate-x-5' : ''}`} />
                                    </div>
                                    <span className="text-sm font-semibold text-cyan-900">Cuenta remunerada / genera intereses</span>
                                </label>
                                {(form.isRemunerated || selectedType === 'SAVINGS') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-xs">TAE / Interés Anual (%)</label>
                                            <input type="number" step="0.01" value={form.tae} onChange={e => setF('tae', e.target.value)} className={`input-field ${validationErrors.tae ? 'border-red-300 ring-2 ring-red-500/20' : ''}`} placeholder="2.50" />
                                            {validationErrors.tae && <p className="text-red-500 text-[10px] mt-1.5 font-bold px-2">{validationErrors.tae}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── CREDIT / DEBIT extras ── */}
                        {isCardType && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="label-xs">Red de la tarjeta</label>
                                        <div className="flex gap-2 flex-wrap mt-1">
                                            {CARD_NETWORKS.map(n => (
                                                <button key={n.value} type="button" onClick={() => setF('cardNetwork', n.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.cardNetwork === n.value ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-aliseus-500 border-aliseus-200 hover:border-cyan-300'}`}>
                                                    {n.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-xs">Moneda</label>
                                        <select value={form.currency} onChange={e => setF('currency', e.target.value)} className="input-field">
                                            {['EUR', 'USD', 'GBP', 'MXN', 'COP', 'ARS', 'CLP', 'CHF', 'CAD', 'AUD', 'INR'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="p-5 bg-cyan-50/60 rounded-2xl border border-cyan-100 space-y-3">
                                    <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Cuenta de cargo (liquidación)
                                    </p>
                                    <p className="text-xs text-aliseus-400">Selecciona la cuenta desde la que se carga el pago al finalizar el mes. Puede ser de cualquier banco.</p>
                                    <select value={form.linkedAccountId} onChange={e => setF('linkedAccountId', e.target.value)} className="input-field">
                                        <option value="">Sin cuenta vinculada</option>
                                        {accounts.filter(a => a.type === 'BANK' || a.type === 'SAVINGS').map(a => (
                                            <option key={a.id} value={a.id}>{a.name}{a.bankName ? ` · ${a.bankName}` : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedType === 'CREDIT' && (
                                    <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-4">
                                        <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">Configuración de crédito</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="label-xs">Saldo actual (deuda)</label>
                                                <input type="number" step="0.01" value={form.balance} onChange={e => setF('balance', e.target.value)} className="input-field" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="label-xs">Límite de crédito</label>
                                                <input type="number" step="0.01" value={form.creditLimit} onChange={e => setF('creditLimit', e.target.value)} className={`input-field ${validationErrors.creditLimit ? 'border-red-300 ring-2 ring-red-500/20' : ''}`} placeholder="3000" />
                                                {validationErrors.creditLimit && <p className="text-red-500 text-[10px] mt-1.5 font-bold px-2">{validationErrors.creditLimit}</p>}
                                            </div>
                                            <div>
                                                <label className="label-xs">Día de corte</label>
                                                <input type="number" min="1" max="31" value={form.cutoffDay} onChange={e => setF('cutoffDay', e.target.value)} className={`input-field ${validationErrors.cutoffDay ? 'border-red-300 ring-2 ring-red-500/20' : ''}`} placeholder="25" />
                                                {validationErrors.cutoffDay && <p className="text-red-500 text-[10px] mt-1.5 font-bold px-2">{validationErrors.cutoffDay}</p>}
                                            </div>
                                            <div>
                                                <label className="label-xs">Día de pago</label>
                                                <input type="number" min="1" max="31" value={form.paymentDay} onChange={e => setF('paymentDay', e.target.value)} className={`input-field ${validationErrors.paymentDay ? 'border-red-300 ring-2 ring-red-500/20' : ''}`} placeholder="5" />
                                                {validationErrors.paymentDay && <p className="text-red-500 text-[10px] mt-1.5 font-bold px-2">{validationErrors.paymentDay}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label-xs">Modo de pago mensual</label>
                                            <div className="flex gap-3 mt-1">
                                                {[{ val: 'END_OF_MONTH', label: 'Saldo total' }, { val: 'REVOLVING', label: 'En cuotas (revolving)' }].map(m => (
                                                    <button key={m.val} type="button" onClick={() => setF('paymentMode', m.val)}
                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.paymentMode === m.val ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-aliseus-500 border-aliseus-200 hover:border-rose-300'}`}>
                                                        {m.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── ASSET fields ── */}
                        {selectedType === 'ASSET' && (
                            <div className="p-5 bg-stone-50/60 rounded-2xl border border-stone-100 space-y-3">
                                <p className="text-[10px] font-bold text-stone-700 uppercase tracking-widest">Referencia Catastral</p>
                                <div className="flex gap-2">
                                    <input value={form.cadastralReference} onChange={e => setF('cadastralReference', e.target.value)} className="flex-1 input-field font-mono" placeholder="20 caracteres" />
                                    <button type="button" onClick={onFetchCadastral} disabled={isFetchingCadastral}
                                        className="px-4 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition disabled:opacity-50">
                                        {isFetchingCadastral ? '…' : 'Consultar'}
                                    </button>
                                </div>
                                {cadastralError && <p className="text-xs text-red-500">{cadastralError}</p>}
                                {cadastralData && <div className="p-3 bg-white rounded-xl text-xs text-cyan-900 border border-cyan-100">{cadastralData.uso} — {cadastralData.superficie} m²</div>}
                            </div>
                        )}

                        {/* ── Linked cards (new account) ── */}
                        {isBankLike && !editingId && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest">Tarjetas vinculadas a esta cuenta</p>
                                    <button type="button" onClick={onAddLinkedCard} className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Añadir tarjeta
                                    </button>
                                </div>
                                {linkedCards.length === 0 && (
                                    <p className="text-xs text-aliseus-300 italic">Puedes añadir tarjetas de débito o crédito que se carguen a esta cuenta (del mismo banco o de otro).</p>
                                )}
                                {linkedCards.map((card, i) => (
                                    <div key={i} className="p-4 bg-aliseus-50/50 rounded-2xl border border-aliseus-100 grid grid-cols-2 gap-3">
                                        <div className="col-span-2 flex justify-between items-center">
                                            <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest">Tarjeta {i + 1}</p>
                                            <button type="button" onClick={() => onRemoveLinkedCard(i)} className="text-aliseus-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-xs">Nombre</label>
                                            <input value={card.name} onChange={e => onUpdateLinkedCard(i, 'name', e.target.value)} className="input-field" placeholder="Ej: Visa Santander" />
                                        </div>
                                        <div>
                                            <label className="label-xs">Tipo</label>
                                            <select value={card.type} onChange={e => onUpdateLinkedCard(i, 'type', e.target.value)} className="input-field">
                                                <option value="CREDIT">Crédito</option>
                                                <option value="DEBIT">Débito</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-xs">Red</label>
                                            <select value={card.cardNetwork} onChange={e => onUpdateLinkedCard(i, 'cardNetwork', e.target.value)} className="input-field">
                                                {CARD_NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                                            </select>
                                        </div>
                                        {card.type === 'CREDIT' && (
                                            <div className="col-span-2">
                                                <label className="label-xs">Límite de crédito</label>
                                                <input type="number" value={card.creditLimit} onChange={e => onUpdateLinkedCard(i, 'creditLimit', e.target.value)} className="input-field" placeholder="3000" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-aliseus-50">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-aliseus-500 hover:bg-aliseus-50 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-[2] bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-cyan-900/20 transition-all active:scale-95">
                            {editingId ? 'Guardar cambios' : `Crear ${linkedCards.filter(c => c.name.trim()).length > 0 ? `+ ${linkedCards.filter(c => c.name.trim()).length} tarjeta(s)` : ''}`}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
