import React, { useState, useRef, useCallback } from 'react';
import {
    Camera, Upload, Loader2, Sparkles, CheckCircle2, X, Plus,
    ScanLine, ShoppingBag, RefrigeratorIcon, AlertCircle, Edit3, Trash2
} from 'lucide-react';
import { Ingredient } from '../../../types';
import { parseReceiptImage, parsePantryPhotoImage, ScannedData, ScannedProduct } from '../../../services/geminiLife';

// ── Tipos ────────────────────────────────────────────────────────────────────

type ScanMode = 'RECEIPT' | 'PANTRY';
type Step = 'MODE_SELECT' | 'CAPTURE' | 'PROCESSING' | 'REVIEW' | 'ERROR';

interface ReceiptScannerModalProps {
    onClose: () => void;
    onSaveToPantry: (items: Ingredient[]) => void;
    onOpenManualEntry: () => void;
    initialMode?: ScanMode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
    Vegetables: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Fruits:     'bg-orange-50  text-orange-700  border-orange-200',
    Dairy:      'bg-blue-50    text-blue-700    border-blue-200',
    Meat:       'bg-red-50     text-red-700     border-red-200',
    Pantry:     'bg-amber-50   text-amber-700   border-amber-200',
    Spices:     'bg-rose-50    text-rose-700    border-rose-200',
    Frozen:     'bg-cyan-50    text-cyan-700    border-cyan-200',
    Other:      'bg-gray-50    text-gray-700    border-gray-200',
};

const CATEGORY_LABELS: Record<string, string> = {
    Vegetables: 'Verduras', Fruits: 'Frutas', Dairy: 'Lácteos',
    Meat: 'Carnes', Pantry: 'Despensa', Spices: 'Especias',
    Frozen: 'Congelados', Other: 'Otros',
};

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ── Sub-componente: Selector de modo ────────────────────────────────────────

const ModeSelectView: React.FC<{
    onSelect: (mode: ScanMode) => void;
    onManual: () => void;
}> = ({ onSelect, onManual }) => (
    <div className="flex flex-col items-center text-center px-2">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <Sparkles className="w-9 h-9 text-cyan-500" />
        </div>
        <h4 className="text-xl font-black text-gray-900 mb-1">¿Qué quieres escanear?</h4>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
            Aliseus Brain identificará los productos automáticamente con IA.
        </p>

        <div className="w-full space-y-3">
            <button
                onClick={() => onSelect('RECEIPT')}
                className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl text-left hover:border-cyan-300 hover:bg-cyan-50/30 hover:shadow-md transition-all group"
            >
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                    <p className="font-black text-gray-900 text-sm">Ticket de compra</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Foto o PDF del ticket → extrae productos, precios y caducidades
                    </p>
                </div>
            </button>

            <button
                onClick={() => onSelect('PANTRY')}
                className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl text-left hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md transition-all group"
            >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <RefrigeratorIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <p className="font-black text-gray-900 text-sm">Foto de la nevera / despensa</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Haz una foto a tu nevera o armario → la IA detecta lo que hay
                    </p>
                </div>
            </button>

            <div className="relative py-1 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-gray-100" />
                <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">o</span>
            </div>

            <button
                onClick={onManual}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
            >
                <Plus className="w-4 h-4" /> Entrada manual
            </button>
        </div>
    </div>
);

// ── Sub-componente: Captura ──────────────────────────────────────────────────

const CaptureView: React.FC<{
    mode: ScanMode;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onBack: () => void;
}> = ({ mode, fileInputRef, onBack }) => {
    const isReceipt = mode === 'RECEIPT';
    const accentClass = isReceipt ? 'text-cyan-600 bg-cyan-100' : 'text-emerald-600 bg-emerald-100';
    const btnClass = isReceipt
        ? 'bg-gray-900 hover:bg-black shadow-gray-200'
        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';

    return (
        <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${accentClass}`}>
                {isReceipt
                    ? <ShoppingBag className="w-10 h-10" />
                    : <RefrigeratorIcon className="w-10 h-10" />
                }
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">
                {isReceipt ? 'Escanear Ticket' : 'Foto de Despensa / Nevera'}
            </h4>
            <p className="text-sm text-gray-500 mb-8 max-w-sm text-balance">
                {isReceipt
                    ? 'Haz una foto clara al ticket o sube una imagen. La IA extraerá productos, precios y estimará caducidades.'
                    : 'Haz una foto amplia de tu nevera o despensa abierta. Cuanto más visible esté el contenido, mejor.'}
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-4 text-white rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${btnClass}`}
                >
                    <Camera className="w-5 h-5" />
                    {isReceipt ? 'Hacer foto / subir imagen' : 'Hacer foto'}
                </button>

                <button
                    onClick={onBack}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
                >
                    ← Cambiar modo
                </button>
            </div>
        </div>
    );
};

// ── Sub-componente: Procesando ───────────────────────────────────────────────

const messages = [
    'Leyendo imagen...',
    'Identificando productos...',
    'Normalizando nombres...',
    'Estimando caducidades...',
    'Categorizando...',
    'Casi listo...',
];

const ProcessingView: React.FC<{ mode: ScanMode }> = ({ mode }) => {
    const [msgIdx, setMsgIdx] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMsgIdx(prev => (prev + 1) % messages.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative w-28 h-28 mb-8">
                <div className="absolute inset-0 border-4 border-cyan-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-3 border-4 border-teal-500/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-9 h-9 text-cyan-500 animate-pulse" />
                </div>
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Aliseus Brain</h4>
            <p className="text-sm text-gray-500 animate-pulse">{messages[msgIdx]}</p>
            <p className="text-xs text-gray-300 mt-3 max-w-xs">
                {mode === 'RECEIPT' ? 'Analizando tu ticket de compra' : 'Analizando el contenido de tu despensa'}
            </p>
        </div>
    );
};

// ── Sub-componente: Revisión de resultados ───────────────────────────────────

const ReviewView: React.FC<{
    data: ScannedData;
    mode: ScanMode;
    onChange: (updated: ScannedData) => void;
}> = ({ data, mode, onChange }) => {
    const updateQty = (idx: number, delta: number) => {
        const updated = { ...data };
        updated.productos = updated.productos.map((p, i) =>
            i === idx ? { ...p, cantidad: Math.max(0.1, +(p.cantidad + delta).toFixed(1)) } : p
        );
        onChange(updated);
    };

    const removeProduct = (idx: number) => {
        onChange({ ...data, productos: data.productos.filter((_, i) => i !== idx) });
    };

    const isReceipt = mode === 'RECEIPT';

    return (
        <div className="animate-fade-in space-y-4">
            {/* Summary card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl p-4 border border-gray-100 flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {isReceipt ? data.establecimiento : '📷 Foto de despensa'}
                    </p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">
                        {new Date(data.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {isReceipt ? 'Total ticket' : 'Productos'}
                    </p>
                    <p className="font-black text-lg text-emerald-600">
                        {isReceipt && data.total > 0
                            ? data.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
                            : `${data.productos.length} ítems`}
                    </p>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                <h5 className="text-sm font-black text-gray-900">
                    {data.productos.length} productos identificados
                </h5>
                <span className="text-[10px] text-gray-400 ml-auto font-medium">Puedes ajustar antes de guardar</span>
            </div>

            {/* Product list */}
            <div className="space-y-2">
                {data.productos.map((prod, idx) => {
                    const isUrgent = prod.dias_caducidad_estimados <= 5;
                    const isFresh = prod.dias_caducidad_estimados <= 14;
                    const catColor = CATEGORY_COLORS[prod.categoria_despensa] || CATEGORY_COLORS.Other;

                    return (
                        <div
                            key={idx}
                            className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 hover:border-cyan-100 hover:shadow-sm transition-all group"
                        >
                            {/* Category dot */}
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                                prod.categoria_despensa === 'Meat' ? 'bg-red-400' :
                                prod.categoria_despensa === 'Dairy' ? 'bg-blue-400' :
                                prod.categoria_despensa === 'Vegetables' ? 'bg-emerald-400' :
                                prod.categoria_despensa === 'Fruits' ? 'bg-orange-400' :
                                prod.categoria_despensa === 'Frozen' ? 'bg-cyan-400' : 'bg-amber-400'
                            }`} />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate">{prod.nombre}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className={`text-[9px] border px-1.5 py-0.5 rounded font-bold uppercase ${catColor}`}>
                                        {CATEGORY_LABELS[prod.categoria_despensa] || prod.categoria_despensa}
                                    </span>
                                    {prod.dias_caducidad_estimados < 9999 && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                            isUrgent ? 'bg-red-50 text-red-600' :
                                            isFresh ? 'bg-amber-50 text-amber-700' :
                                            'bg-gray-50 text-gray-500'
                                        }`}>
                                            {isUrgent ? '⚠️ ' : ''}Caduca ~{prod.dias_caducidad_estimados}d
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => updateQty(idx, -1)}
                                    className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center text-lg font-bold transition-colors leading-none"
                                >−</button>
                                <span className="text-sm font-black text-gray-900 w-8 text-center">
                                    {prod.cantidad}<span className="text-[9px] text-gray-400 font-bold ml-0.5">{prod.unidad}</span>
                                </span>
                                <button
                                    onClick={() => updateQty(idx, 1)}
                                    className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center text-lg font-bold transition-colors leading-none"
                                >+</button>
                            </div>

                            {/* Remove */}
                            <button
                                onClick={() => removeProduct(idx)}
                                className="p-1.5 text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Sub-componente: Error ────────────────────────────────────────────────────

const ErrorView: React.FC<{ message: string; onRetry: () => void; onManual: () => void }> = ({
    message, onRetry, onManual
}) => (
    <div className="flex flex-col items-center text-center py-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-9 h-9 text-red-400" />
        </div>
        <h4 className="text-lg font-black text-gray-900 mb-2">No pudimos leer la imagen</h4>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">{message}</p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
            <button onClick={onRetry} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all">
                Intentar con otra imagen
            </button>
            <button onClick={onManual} className="w-full py-2.5 text-gray-400 hover:text-gray-700 font-medium text-sm">
                Añadir manualmente
            </button>
        </div>
    </div>
);

// ── Modal principal ──────────────────────────────────────────────────────────

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
    onClose,
    onSaveToPantry,
    onOpenManualEntry,
    initialMode,
}) => {
    const [step, setStep] = useState<Step>(initialMode ? 'CAPTURE' : 'MODE_SELECT');
    const [mode, setMode] = useState<ScanMode>(initialMode || 'RECEIPT');
    const [scannedData, setScannedData] = useState<ScannedData | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Accept both image/* for pantry and image/* + application/pdf for receipt
    const acceptAttr = mode === 'RECEIPT' ? 'image/*' : 'image/*';

    const handleSelectMode = (m: ScanMode) => {
        setMode(m);
        setStep('CAPTURE');
    };

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep('PROCESSING');
        try {
            const base64 = await fileToBase64(file);
            const result = mode === 'RECEIPT'
                ? await parseReceiptImage(base64)
                : await parsePantryPhotoImage(base64);

            if (!result || result.productos.length === 0) {
                setErrorMsg(
                    mode === 'RECEIPT'
                        ? 'No pudimos detectar productos en el ticket. Asegúrate de que la imagen sea nítida y muestre el texto completo.'
                        : 'No detectamos productos en la imagen. Intenta con una foto más abierta que muestre bien el contenido.'
                );
                setStep('ERROR');
                return;
            }

            setScannedData(result);
            setStep('REVIEW');
        } catch (err) {
            console.error('Scan error:', err);
            setErrorMsg('Ocurrió un error de conexión con la IA. Comprueba tu conexión e inténtalo de nuevo.');
            setStep('ERROR');
        }

        // Reset input so the same file can be re-selected after error
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [mode]);

    const handleConfirm = () => {
        if (!scannedData) return;
        const ingredients: Ingredient[] = scannedData.productos.map(p => {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + p.dias_caducidad_estimados);
            return {
                id: Math.random().toString(36).substr(2, 9),
                name: p.nombre,
                quantity: p.cantidad,
                unit: p.unidad as any,
                category: p.categoria_despensa as any,
                expiryDate: p.dias_caducidad_estimados < 9999
                    ? expiryDate.toISOString().split('T')[0]
                    : undefined,
                lowStockThreshold: 1,
            };
        });
        onSaveToPantry(ingredients);
    };

    const handleRetry = () => {
        setStep('CAPTURE');
        setErrorMsg('');
    };

    const handleManual = () => {
        onClose();
        onOpenManualEntry();
    };

    const isReceipt = mode === 'RECEIPT';
    const accentGradient = isReceipt
        ? 'from-cyan-500 to-teal-500'
        : 'from-emerald-500 to-teal-500';

    const titles: Record<Step, string> = {
        MODE_SELECT: 'Escáner Inteligente',
        CAPTURE: isReceipt ? 'Ticket de Compra' : 'Foto de Despensa',
        PROCESSING: 'Analizando...',
        REVIEW: `${scannedData?.productos.length || 0} productos detectados`,
        ERROR: 'Error de lectura',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[92dvh] animate-slide-up sm:animate-fade-in">

                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-gray-100 flex items-center gap-3 shrink-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-lg`}>
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black text-gray-900 leading-none">Aliseus Brain</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">{titles[step]}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    accept={acceptAttr}
                    capture={mode === 'PANTRY' ? 'environment' : undefined}
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {step === 'MODE_SELECT' && (
                        <ModeSelectView onSelect={handleSelectMode} onManual={handleManual} />
                    )}
                    {step === 'CAPTURE' && (
                        <CaptureView mode={mode} fileInputRef={fileInputRef} onBack={() => setStep('MODE_SELECT')} />
                    )}
                    {step === 'PROCESSING' && (
                        <ProcessingView mode={mode} />
                    )}
                    {step === 'REVIEW' && scannedData && (
                        <ReviewView
                            data={scannedData}
                            mode={mode}
                            onChange={setScannedData}
                        />
                    )}
                    {step === 'ERROR' && (
                        <ErrorView message={errorMsg} onRetry={handleRetry} onManual={handleManual} />
                    )}
                </div>

                {/* Footer */}
                {step === 'REVIEW' && scannedData && (
                    <div className="px-6 py-5 border-t border-gray-100 bg-white shrink-0 space-y-2">
                        <button
                            onClick={handleConfirm}
                            disabled={scannedData.productos.length === 0}
                            className={`w-full py-4 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 bg-gradient-to-r ${accentGradient} hover:opacity-90 active:scale-95`}
                        >
                            Añadir {scannedData.productos.length} productos a la Despensa
                        </button>
                        <button
                            onClick={handleRetry}
                            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Escanear otra imagen
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
