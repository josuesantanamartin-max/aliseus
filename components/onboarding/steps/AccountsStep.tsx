import React, { useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useCurrency } from '../../../hooks/useCurrency';
import {
    Wallet, Landmark, Plus, Trash2, CreditCard, ArrowRight, PiggyBank,
    TrendingUp, Layers, Banknote, X, ChevronLeft, ShieldCheck
} from 'lucide-react';
import { Account } from '../../../types';

const ACCOUNT_TYPES = [
    { value: 'BANK', label: 'Corriente', sub: 'Cuenta bancaria estándar', icon: Landmark, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
    { value: 'SAVINGS', label: 'Ahorro', sub: 'Remunerada / intereses', icon: PiggyBank, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { value: 'CASH', label: 'Efectivo', sub: 'Dinero en mano', icon: Banknote, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { value: 'CREDIT', label: 'Crédito', sub: 'Pago diferido, límite', icon: CreditCard, color: 'bg-rose-50 text-rose-600 border-rose-200' },
    { value: 'DEBIT', label: 'Débito', sub: 'Cargo directo', icon: CreditCard, color: 'bg-violet-50 text-violet-600 border-violet-200' },
    { value: 'INVESTMENT', label: 'Inversión', sub: 'Fondos, ETFs', icon: TrendingUp, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { value: 'ASSET', label: 'Activo', sub: 'Inmuebles, bienes', icon: Layers, color: 'bg-stone-50 text-stone-600 border-stone-200' },
    { value: 'WALLET', label: 'Digital', sub: 'PayPal, Revolut…', icon: Wallet, color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' },
] as const;

const CARD_NETWORKS = [
    { value: 'VISA', label: 'Visa' },
    { value: 'MASTERCARD', label: 'Mastercard' },
    { value: 'AMEX', label: 'Amex' },
    { value: 'OTHER', label: 'Otra' },
];

const INITIAL_ACCOUNTS: Partial<Account>[] = [
    { name: 'Efectivo', type: 'CASH', balance: 0, currency: 'EUR' },
    { name: 'Cuenta Principal', type: 'BANK', balance: 0, currency: 'EUR' },
];

const blankForm = (type: Account['type']) => ({
    name: '', bankName: '', balance: '0', currency: 'EUR',
    iban: '', tae: '', creditLimit: '', cutoffDay: '', paymentDay: '',
    paymentMode: 'END_OF_MONTH' as const,
    cardNetwork: 'VISA' as Account['cardNetwork'],
    linkedAccountId: '',
    isRemunerated: false,
});

const AccountsStep: React.FC = () => {
    const { setOnboardingStep } = useUserStore();
    const { addAccount } = useFinanceStore();
    const { symbol } = useCurrency();

    const [accountsToCreate, setAccountsToCreate] = useState<Partial<Account>[]>(INITIAL_ACCOUNTS);

    // Form mode
    const [isAdding, setIsAdding] = useState(false);
    const [formStep, setFormStep] = useState<1 | 2>(1);
    const [selectedType, setSelectedType] = useState<Account['type']>('BANK');
    const [form, setForm] = useState(blankForm('BANK'));
    const setF = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

    // Linked cards
    const [linkedCards, setLinkedCards] = useState<Array<{ name: string; cardNetwork: Account['cardNetwork']; type: 'CREDIT' | 'DEBIT'; creditLimit: string }>>([]);
    const addLinkedCard = () => setLinkedCards(p => [...p, { name: '', cardNetwork: 'VISA', type: 'CREDIT', creditLimit: '' }]);
    const removeLinkedCard = (i: number) => setLinkedCards(p => p.filter((_, idx) => idx !== i));
    const updateLinkedCard = (i: number, k: string, v: any) => setLinkedCards(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));

    const isBankLike = selectedType === 'BANK' || selectedType === 'SAVINGS';
    const isCard = selectedType === 'CREDIT' || selectedType === 'DEBIT';

    const handleAddToList = () => {
        if (!form.name.trim()) return;
        const mainId = Math.random().toString(36).substr(2, 9);
        const newAcc: Partial<Account> = {
            id: mainId, name: form.name, bankName: form.bankName || undefined,
            type: selectedType, balance: parseFloat(form.balance) || 0, currency: form.currency as any,
            iban: form.iban || undefined,
        };
        if (isBankLike) {
            newAcc.isRemunerated = form.isRemunerated || selectedType === 'SAVINGS';
            if (newAcc.isRemunerated && form.tae) newAcc.tae = parseFloat(form.tae);
        }
        if (isCard) {
            newAcc.cardNetwork = form.cardNetwork;
            newAcc.linkedAccountId = form.linkedAccountId || undefined;
            if (selectedType === 'CREDIT') {
                if (form.creditLimit) newAcc.creditLimit = parseFloat(form.creditLimit);
                if (form.cutoffDay) newAcc.cutoffDay = parseInt(form.cutoffDay);
                if (form.paymentDay) newAcc.paymentDay = parseInt(form.paymentDay);
                newAcc.paymentMode = form.paymentMode;
            }
        }

        const toAdd: Partial<Account>[] = [newAcc];
        for (const card of linkedCards) {
            if (!card.name.trim()) continue;
            toAdd.push({
                name: card.name, bankName: form.bankName || undefined,
                type: card.type, balance: 0, currency: form.currency as any,
                cardNetwork: card.cardNetwork,
                linkedAccountId: mainId,
                creditLimit: card.creditLimit ? parseFloat(card.creditLimit) : undefined,
                paymentMode: 'END_OF_MONTH',
            });
        }

        setAccountsToCreate(p => [...p, ...toAdd]);
        setForm(blankForm(selectedType));
        setLinkedCards([]);
        setIsAdding(false);
        setFormStep(1);
    };

    const handleRemove = (i: number) => setAccountsToCreate(p => p.filter((_, idx) => idx !== i));

    const handleContinue = () => {
        accountsToCreate.forEach(acc => {
            const a: Account = {
                id: Math.random().toString(36).substr(2, 9),
                name: acc.name || 'Cuenta',
                type: acc.type || 'BANK',
                balance: acc.balance || 0,
                currency: acc.currency || 'EUR',
                ...acc,
            };
            addAccount(a);
        });
        setOnboardingStep(6);
    };

    const bankAccounts = accountsToCreate.filter(a => a.type === 'BANK' || a.type === 'SAVINGS');

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">Tus Cuentas</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-lg text-sm">
                Configura tus cuentas y tarjetas. Puedes añadir más o modificarlas después.
            </p>

            {/* Account list */}
            <div className="w-full space-y-2 mb-6">
                {accountsToCreate.map((acc, idx) => {
                    const cfg = ACCOUNT_TYPES.find(t => t.value === acc.type) || ACCOUNT_TYPES[0];
                    const Icon = cfg.icon;
                    return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-onyx-800 rounded-xl border border-gray-100 dark:border-onyx-700 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.color}`}><Icon className="w-4 h-4" /></div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{acc.name}</h4>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{cfg.label} {acc.bankName ? `· ${acc.bankName}` : ''}</p>
                                </div>
                            </div>
                            <button onClick={() => handleRemove(idx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    );
                })}
            </div>

            {/* Add form */}
            {isAdding ? (
                <div className="w-full bg-gray-50 dark:bg-onyx-800/50 p-6 rounded-2xl mb-6 border border-cyan-100 dark:border-cyan-900/30 space-y-5 animate-scale-in">
                    {/* Step 1 — type selector */}
                    {formStep === 1 && (
                        <>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo de cuenta</p>
                            <div className="grid grid-cols-4 gap-2">
                                {ACCOUNT_TYPES.map(t => {
                                    const Icon = t.icon;
                                    return (
                                        <button key={t.value} type="button"
                                            onClick={() => { setSelectedType(t.value as Account['type']); setFormStep(2); }}
                                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-gray-100 hover:border-cyan-300 hover:bg-white transition-all group">
                                            <div className={`p-2 rounded-lg ${t.color} group-hover:scale-110 transition-transform`}><Icon className="w-4 h-4" /></div>
                                            <span className="text-[10px] font-bold text-gray-700 leading-tight text-center">{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => setIsAdding(false)} className="px-5 py-2 text-gray-400 hover:text-gray-700 text-sm font-bold transition-colors">Cancelar</button>
                            </div>
                        </>
                    )}

                    {/* Step 2 — fields */}
                    {formStep === 2 && (
                        <>
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                <button type="button" onClick={() => setFormStep(1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                                <div>
                                    {(() => { const cfg = ACCOUNT_TYPES.find(t => t.value === selectedType)!; const Icon = cfg.icon; return <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${cfg.color}`}><Icon className="w-3 h-3" />{cfg.label}</span>; })()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="label-xs">Nombre</label>
                                    <input value={form.name} onChange={e => setF('name', e.target.value)} className="input-ob" placeholder={isCard ? 'Ej: Visa BBVA' : 'Ej: Cuenta Ahorro'} autoFocus />
                                </div>
                                <div>
                                    <label className="label-xs">Banco / Entidad</label>
                                    <input value={form.bankName} onChange={e => setF('bankName', e.target.value)} className="input-ob" placeholder="BBVA, Santander…" />
                                </div>
                                {!isCard && (
                                    <div>
                                        <label className="label-xs">Saldo Inicial</label>
                                        <div className="relative">
                                            <input type="number" value={form.balance} onChange={e => setF('balance', e.target.value)} className="input-ob pr-10" placeholder="0.00" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{symbol}</span>
                                        </div>
                                    </div>
                                )}
                                {isBankLike && (
                                    <div>
                                        <label className="label-xs">IBAN <span className="normal-case font-normal text-gray-300">(opc.)</span></label>
                                        <input value={form.iban} onChange={e => setF('iban', e.target.value)} className="input-ob font-mono" placeholder="ES00 …" />
                                    </div>
                                )}
                            </div>

                            {/* Savings toggle */}
                            {isBankLike && (
                                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div onClick={() => setF('isRemunerated', !form.isRemunerated)}
                                            className={`w-10 h-5 rounded-full transition-colors ${form.isRemunerated || selectedType === 'SAVINGS' ? 'bg-emerald-500' : 'bg-gray-200'} flex items-center`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-transform ${form.isRemunerated || selectedType === 'SAVINGS' ? 'translate-x-5' : ''}`} />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-800">Cuenta remunerada (genera intereses)</span>
                                    </label>
                                    {(form.isRemunerated || selectedType === 'SAVINGS') && (
                                        <div className="flex items-center gap-3">
                                            <label className="label-xs">TAE %</label>
                                            <input type="number" step="0.01" value={form.tae} onChange={e => setF('tae', e.target.value)} className="w-24 input-ob" placeholder="2.50" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Card fields */}
                            {isCard && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="label-xs">Red</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {CARD_NETWORKS.map(n => (
                                                <button key={n.value} type="button" onClick={() => setF('cardNetwork', n.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.cardNetwork === n.value ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-500 border-gray-200'}`}>
                                                    {n.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {bankAccounts.length > 0 && (
                                        <div className="p-4 bg-cyan-50/60 rounded-xl border border-cyan-100 space-y-2">
                                            <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Cuenta de cargo</p>
                                            <select value={form.linkedAccountId} onChange={e => setF('linkedAccountId', e.target.value)} className="input-ob">
                                                <option value="">Sin cuenta vinculada</option>
                                                {bankAccounts.map((a, i) => <option key={i} value={a.id || i.toString()}>{a.name}{a.bankName ? ` · ${a.bankName}` : ''}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    {selectedType === 'CREDIT' && (
                                        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="label-xs">Saldo actual (deuda)</label>
                                                <input type="number" value={form.balance} onChange={e => setF('balance', e.target.value)} className="input-ob" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="label-xs">Límite</label>
                                                <input type="number" value={form.creditLimit} onChange={e => setF('creditLimit', e.target.value)} className="input-ob" placeholder="3000" />
                                            </div>
                                            <div>
                                                <label className="label-xs">Día corte</label>
                                                <input type="number" min="1" max="31" value={form.cutoffDay} onChange={e => setF('cutoffDay', e.target.value)} className="input-ob" placeholder="25" />
                                            </div>
                                            <div>
                                                <label className="label-xs">Día pago</label>
                                                <input type="number" min="1" max="31" value={form.paymentDay} onChange={e => setF('paymentDay', e.target.value)} className="input-ob" placeholder="5" />
                                            </div>
                                            <div>
                                                <label className="label-xs">Modo pago</label>
                                                <select value={form.paymentMode} onChange={e => setF('paymentMode', e.target.value)} className="input-ob">
                                                    <option value="END_OF_MONTH">Saldo total</option>
                                                    <option value="REVOLVING">Cuotas (revolving)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Linked cards for bank */}
                            {isBankLike && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="label-xs">Tarjetas vinculadas</p>
                                        <button type="button" onClick={addLinkedCard} className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir tarjeta</button>
                                    </div>
                                    {linkedCards.map((card, i) => (
                                        <div key={i} className="p-3 bg-white rounded-xl border border-gray-100 grid grid-cols-2 gap-2">
                                            <div className="col-span-2 flex justify-between items-center">
                                                <p className="text-[10px] font-bold text-gray-400">Tarjeta {i + 1}</p>
                                                <button type="button" onClick={() => removeLinkedCard(i)} className="text-gray-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                            <div className="col-span-2">
                                                <input value={card.name} onChange={e => updateLinkedCard(i, 'name', e.target.value)} className="input-ob" placeholder="Nombre tarjeta" />
                                            </div>
                                            <select value={card.type} onChange={e => updateLinkedCard(i, 'type', e.target.value)} className="input-ob">
                                                <option value="CREDIT">Crédito</option>
                                                <option value="DEBIT">Débito</option>
                                            </select>
                                            <select value={card.cardNetwork} onChange={e => updateLinkedCard(i, 'cardNetwork', e.target.value)} className="input-ob">
                                                {CARD_NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                                            </select>
                                            {card.type === 'CREDIT' && (
                                                <div className="col-span-2">
                                                    <input type="number" value={card.creditLimit} onChange={e => updateLinkedCard(i, 'creditLimit', e.target.value)} className="input-ob" placeholder="Límite" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => { setIsAdding(false); setFormStep(1); }} className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-all text-sm">Cancelar</button>
                                <button onClick={handleAddToList} disabled={!form.name.trim()}
                                    className="px-7 py-2.5 bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all disabled:opacity-50 text-sm">
                                    Añadir {linkedCards.filter(c => c.name.trim()).length > 0 ? `+ ${linkedCards.filter(c => c.name.trim()).length} tarjeta(s)` : ''}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <button onClick={() => { setIsAdding(true); setFormStep(1); }}
                    className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-10 hover:underline">
                    <Plus className="w-4 h-4" /> Añadir otra cuenta / tarjeta
                </button>
            )}

            <div className="flex justify-between w-full max-w-md">
                <button onClick={() => setOnboardingStep(4)} className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Atrás</button>
                <button onClick={handleContinue}
                    className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700 hover:scale-105 transition-all flex items-center gap-2">
                    {accountsToCreate.length > 0 ? 'Crear Cuentas' : 'Saltar paso'} <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <style>{`
        .label-xs { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 0.4rem; }
        .input-ob { width: 100%; padding: 0.75rem 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; font-weight: 600; color: #0e4f6e; outline: none; transition: all 0.15s; font-size: 0.875rem; }
        .input-ob:focus { box-shadow: 0 0 0 3px rgba(6,182,212,0.1); border-color: #06b6d4; }
      `}</style>
        </div>
    );
};

export default AccountsStep;
