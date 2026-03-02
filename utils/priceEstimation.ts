import { ShoppingItem } from '../types';
import { useUserStore } from '../store/useUserStore';

// Precios promedio por categoría en EUR (basados en precios de supermercado español)
const CATEGORY_PRICES: Record<string, number> = {
    'Vegetables': 2.5,   // €/kg promedio
    'Fruits': 3.0,       // €/kg promedio
    'Dairy': 1.8,        // €/unidad promedio
    'Meat': 8.0,         // €/kg promedio
    'Pantry': 2.0,       // €/unidad promedio
    'Spices': 4.0,       // €/unidad promedio
    'Frozen': 3.5,       // €/kg promedio
    'Other': 2.5         // €/unidad promedio
};

// Factores de conversión de unidades a unidad base
const UNIT_CONVERSION: Record<string, number> = {
    'kg': 1,
    'g': 0.001,
    'l': 1,
    'ml': 0.001,
    'pcs': 1,
    'cda': 0.015,      // cucharada ≈ 15ml
    'cdta': 0.005,     // cucharadita ≈ 5ml
    'pizca': 0.001,    // pizca ≈ 1g
    'manojo': 0.1,     // manojo ≈ 100g
    'rebanada': 0.03,  // rebanada ≈ 30g
    'loncha': 0.02,    // loncha ≈ 20g
    'dientes': 0.005   // diente de ajo ≈ 5g
};

/**
 * Estima el precio de un item individual basado en su categoría y cantidad
 * @param item - Item de la lista de compra
 * @returns Precio estimado en EUR
 */
export function estimateItemPrice(item: ShoppingItem): number {
    // Si el item ya tiene un precio estimado, usarlo
    if (item.estimatedPrice !== undefined && item.estimatedPrice > 0) {
        return item.estimatedPrice;
    }

    // Obtener precio base por categoría
    const category = item.category || 'Other';
    const basePrice = CATEGORY_PRICES[category] || CATEGORY_PRICES['Other'];

    // Convertir cantidad a unidad base
    const unit = item.unit.toLowerCase();
    const conversionFactor = UNIT_CONVERSION[unit] || 1;
    const normalizedQuantity = item.quantity * conversionFactor;

    // Calcular precio estimado
    const estimatedPrice = basePrice * normalizedQuantity;

    // Redondear a 2 decimales y asegurar mínimo de 0.10€
    return Math.max(0.10, parseFloat(estimatedPrice.toFixed(2)));
}

/**
 * Estima el precio total de una lista de items
 * @param items - Array de items de la lista de compra
 * @returns Precio total estimado en EUR
 */
export function estimateTotalPrice(items: ShoppingItem[]): number {
    const total = items.reduce((sum, item) => sum + estimateItemPrice(item), 0);
    return parseFloat(total.toFixed(2));
}

/**
 * Formatea un precio para mostrar con símbolo de moneda
 * @param price - Precio en EUR
 * @param currency - Código de moneda (default: EUR)
 * @returns Precio formateado como string
 */
export function formatPrice(price: number, currency?: string): string {
    const activeCurrency = currency || useUserStore.getState().currency;
    const symbols: Record<string, string> = {
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

    const symbol = symbols[activeCurrency] || '$';
    return `${price.toFixed(2)}${symbol}`;
}

/**
 * Actualiza el precio estimado de un item
 * @param item - Item a actualizar
 * @param customPrice - Precio personalizado (opcional)
 * @returns Item con precio estimado actualizado
 */
export function updateItemPrice(item: ShoppingItem, customPrice?: number): ShoppingItem {
    return {
        ...item,
        estimatedPrice: customPrice !== undefined ? customPrice : estimateItemPrice(item)
    };
}
