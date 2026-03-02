import React, { useState, useEffect } from 'react';
import { ShoppingItem, Account } from '../../../types';
import { estimateTotalPrice, formatPrice as estFormatPrice } from '../../../utils/priceEstimation';
import { X, ShoppingCart, Check, AlertCircle, CreditCard } from 'lucide-react';
import { useCurrency } from '../../../hooks/useCurrency';

interface PurchaseConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: ShoppingItem[];
    accounts: Account[];
    defaultAccountId: string | null;
    onConfirm: (totalPrice: number, accountId: string, saveAsDefault: boolean) => void;
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
    isOpen,
    onClose,
    items,
    accounts,
    defaultAccountId,
    onConfirm
}) => {
    const [totalPrice, setTotalPrice] = useState<string>('0.00');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [saveAsDefault, setSaveAsDefault] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const { symbol, formatPrice } = useCurrency();

    // Inicializar valores cuando se abre el modal
    useEffect(() => {
        if (isOpen && items.length > 0) {
            const estimated = estimateTotalPrice(items);
            setTotalPrice(estimated.toFixed(2));

            // Seleccionar cuenta predeterminada o la primera disponible
            if (defaultAccountId && accounts.find(a => a.id === defaultAccountId)) {
                setSelectedAccountId(defaultAccountId);
            } else if (accounts.length > 0) {
                setSelectedAccountId(accounts[0].id);
            }

            setError('');
            setIsProcessing(false);
        }
    }, [isOpen, items, accounts, defaultAccountId]);

    const handlePriceChange = (value: string) => {
        // Permitir solo números y un punto decimal
        const sanitized = value.replace(/[^\d.]/g, '');
        const parts = sanitized.split('.');
        if (parts.length > 2) return; // Evitar múltiples puntos

        setTotalPrice(sanitized);
        setError('');
    };

    const handleConfirm = () => {
        // Validaciones
        const price = parseFloat(totalPrice);

        if (!totalPrice || isNaN(price)) {
            setError('Por favor, ingresa un precio válido');
            return;
        }

        if (price <= 0) {
            setError(`El precio debe ser mayor a 0${symbol}`);
            return;
        }

        if (price > 10000) {
            setError('El precio parece demasiado alto. Verifica el monto.');
            return;
        }

        if (!selectedAccountId) {
            setError('Por favor, selecciona una cuenta');
            return;
        }

        setIsProcessing(true);

        // Llamar al callback de confirmación
        onConfirm(price, selectedAccountId, saveAsDefault);

        // El componente padre cerrará el modal
    };

    const handleClose = () => {
        if (!isProcessing) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-white dark:bg-onyx-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-onyx-800 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        Confirmar Compra
                    </h3>
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 transition-colors disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Items Summary */}
                    <div className="bg-gray-50 dark:bg-onyx-800/50 rounded-2xl p-5 border border-gray-100 dark:border-onyx-700">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Items Seleccionados ({items.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {index + 1}. {item.name}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                        {item.quantity} {item.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Input */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                            Precio Total
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={totalPrice}
                                onChange={(e) => handlePriceChange(e.target.value)}
                                disabled={isProcessing}
                                className="w-full p-5 pr-12 bg-white dark:bg-onyx-800 border-2 border-gray-200 dark:border-onyx-700 rounded-2xl font-bold text-2xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 transition-all disabled:opacity-50"
                                placeholder="0.00"
                                autoFocus
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">
                                {symbol}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 ml-1">
                            Precio estimado: {formatPrice(estimateTotalPrice(items))}
                        </p>
                    </div>

                    {/* Account Selector */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                            Cuenta de Pago
                        </label>
                        <div className="space-y-2">
                            {accounts.map((account) => (
                                <button
                                    key={account.id}
                                    onClick={() => setSelectedAccountId(account.id)}
                                    disabled={isProcessing}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between disabled:opacity-50 ${selectedAccountId === account.id
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-gray-200 dark:border-onyx-700 bg-white dark:bg-onyx-800 hover:border-emerald-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAccountId === account.id
                                            ? 'bg-emerald-500'
                                            : 'bg-gray-200 dark:bg-onyx-700'
                                            }`}>
                                            <CreditCard className={`w-5 h-5 ${selectedAccountId === account.id ? 'text-white' : 'text-gray-500'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{account.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {account.bankName || account.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 dark:text-white">
                                            {formatPrice(account.balance)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                            Disponible
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save as Default Checkbox */}
                    <label className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <input
                            type="checkbox"
                            checked={saveAsDefault}
                            onChange={(e) => setSaveAsDefault(e.target.checked)}
                            disabled={isProcessing}
                            className="w-5 h-5 rounded-lg border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                        />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Recordar esta cuenta para futuras compras
                        </span>
                    </label>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-onyx-800 border-t border-gray-100 dark:border-onyx-700 flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="flex-1 px-6 py-4 bg-white dark:bg-onyx-700 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-onyx-600 transition-all disabled:opacity-50 border border-gray-200 dark:border-onyx-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing || !selectedAccountId}
                        className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Confirmar Compra
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
