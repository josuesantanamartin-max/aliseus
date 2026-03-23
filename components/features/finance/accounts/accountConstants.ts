import React from 'react';
import { Account } from '@/types';
import {
    Wallet, CreditCard, Banknote, Landmark,
    TrendingUp, Layers, PiggyBank
} from 'lucide-react';

// ─── Account type config ────────────────────────────────────────────────────
export const ACCOUNT_TYPES = [
    { value: 'BANK', label: 'Cuenta Corriente', sub: 'Cuenta bancaria estándar', icon: Landmark, color: 'cyan' },
    { value: 'SAVINGS', label: 'Cuenta de Ahorro', sub: 'Con interés / remunerada', icon: PiggyBank, color: 'emerald' },
    { value: 'CASH', label: 'Efectivo', sub: 'Dinero en mano', icon: Banknote, color: 'amber' },
    { value: 'CREDIT', label: 'Tarjeta Crédito', sub: 'Pago diferido / límite', icon: CreditCard, color: 'rose' },
    { value: 'DEBIT', label: 'Tarjeta Débito', sub: 'Cargo directo a cuenta', icon: CreditCard, color: 'violet' },
    { value: 'INVESTMENT', label: 'Inversión', sub: 'Fondos, ETFs, acciones', icon: TrendingUp, color: 'blue' },
    { value: 'ASSET', label: 'Activo', sub: 'Inmuebles, bienes', icon: Layers, color: 'stone' },
    { value: 'WALLET', label: 'Billetera Digital', sub: 'PayPal, Bizum, Revolut…', icon: Wallet, color: 'fuchsia' },
] as const;

export const CARD_NETWORKS = [
    { value: 'VISA', label: 'Visa' },
    { value: 'MASTERCARD', label: 'Mastercard' },
    { value: 'AMEX', label: 'American Express' },
    { value: 'OTHER', label: 'Otra red' },
];

export const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 ring-cyan-500',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 ring-amber-500',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 ring-rose-500',
    violet: 'bg-violet-50 text-violet-600 border-violet-200 ring-violet-500',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 ring-blue-500',
    stone: 'bg-stone-50 text-stone-600 border-stone-200 ring-stone-500',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 ring-fuchsia-500',
};

// ─── Blank form state ─────────────────────────────────────────────────────── 
export const blankForm = () => ({
    name: '', bankName: '', balance: '', currency: 'EUR',
    iban: '', description: '', tae: '', creditLimit: '', cutoffDay: '', paymentDay: '',
    paymentMode: 'END_OF_MONTH' as 'END_OF_MONTH' | 'REVOLVING',
    cardNetwork: 'VISA' as Account['cardNetwork'],
    linkedAccountId: '',
    isRemunerated: false,
    cadastralReference: '',
});

export type AccountFormState = ReturnType<typeof blankForm>;

// ─── Helpers ────────────────────────────────────────────────────────────────
export const getTypeConfig = (type: string) => ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[0];
export const getTypeLabel = (type: string) => getTypeConfig(type).label;

export const formatEUR = (n: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n);
