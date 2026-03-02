import { useUserStore } from '../store/useUserStore';

export const CURRENCY_SYMBOLS: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    MXN: '$',
    COP: '$',
    ARS: '$',
    CLP: '$',
    CAD: '$',
    AUD: '$',
    CHF: 'CHF',
    INR: '₹'
};

export function useCurrency() {
    const currency = useUserStore((state) => state.currency);
    const symbol = CURRENCY_SYMBOLS[currency] || '€';

    const formatPrice = (price: number, fractionDigits: number = 2) => {
        // Formato para Europa si es EUR/CHF/GBP, formato americano si es USD/MXN/etc, o simplemente estandarizado:
        // Por consistencia, usamos toLocaleString
        let locale = 'es-ES'; // Default
        if (['USD', 'CAD', 'AUD'].includes(currency)) locale = 'en-US';
        if (currency === 'GBP') locale = 'en-GB';

        const formatted = price.toLocaleString(locale, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });

        // Add symbol
        if (['EUR', 'CHF'].includes(currency)) {
            return `${formatted}${symbol}`;
        }
        return `${symbol}${formatted}`;
    };

    return { currency, symbol, formatPrice };
}
