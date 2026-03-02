import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Sparkles, CheckCircle2, X, Plus } from 'lucide-react';
import { Ingredient } from '../../../types';

interface ScannedProduct {
    nombre: string;
    cantidad: number;
    unidad: string;
    precio_unitario: number;
    categoria_despensa: string;
    dias_caducidad_estimados: number;
}

interface ScannedData {
    establecimiento: string;
    fecha: string;
    total: number;
    productos: ScannedProduct[];
}

interface ReceiptScannerModalProps {
    onClose: () => void;
    onSaveToPantry: (items: Ingredient[]) => void;
    onOpenManualEntry: () => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({ onClose, onSaveToPantry, onOpenManualEntry }) => {
    const [step, setStep] = useState<'CAPTURE' | 'PROCESSING' | 'REVIEW'>('CAPTURE');
    const [scannedData, setScannedData] = useState<ScannedData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            startProcessing();
        }
    };

    const startProcessing = () => {
        setStep('PROCESSING');
        // Simulate AI Processing delay
        setTimeout(() => {
            const mockData: ScannedData = {
                establecimiento: "Mercadona",
                fecha: new Date().toISOString().split('T')[0],
                total: 45.30,
                productos: [
                    {
                        nombre: "Leche Entera Pascual",
                        cantidad: 6,
                        unidad: "l",
                        precio_unitario: 0.95,
                        categoria_despensa: "Dairy",
                        dias_caducidad_estimados: 14
                    },
                    {
                        nombre: "Salmón Fresco Noruego",
                        cantidad: 2,
                        unidad: "pcs",
                        precio_unitario: 6.50,
                        categoria_despensa: "Meat",
                        dias_caducidad_estimados: 3
                    },
                    {
                        nombre: "Manzanas Fuji",
                        cantidad: 1,
                        unidad: "kg",
                        precio_unitario: 2.10,
                        categoria_despensa: "Fruits",
                        dias_caducidad_estimados: 10
                    },
                    {
                        nombre: "Huevos Camperos",
                        cantidad: 12,
                        unidad: "pcs",
                        precio_unitario: 0.25,
                        categoria_despensa: "Dairy",
                        dias_caducidad_estimados: 21
                    }
                ]
            };
            setScannedData(mockData);
            setStep('REVIEW');
        }, 3000);
    };

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
                expiryDate: expiryDate.toISOString().split('T')[0],
                lowStockThreshold: 2
            };
        });
        onSaveToPantry(ingredients);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 leading-none">Aliseus Brain</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Escáner de Tickets Inteligente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-white rounded-full shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">

                    {step === 'CAPTURE' && (
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-full flex items-center justify-center mb-6">
                                <Camera className="w-10 h-10 text-cyan-600" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Escanea tu Ticket de Compra</h4>
                            <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                La IA identificará los productos, los normalizará y estimará sus fechas de caducidad automáticamente.
                            </p>

                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Camera className="w-5 h-5" />
                                    Hacer Foto o Subir
                                </button>

                                <div className="relative py-2 flex items-center justify-center">
                                    <div className="absolute inset-x-0 h-px bg-gray-200"></div>
                                    <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase">O bien</span>
                                </div>

                                <button
                                    onClick={() => {
                                        onClose();
                                        onOpenManualEntry();
                                    }}
                                    className="w-full py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl font-bold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Entrada Manual
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'PROCESSING' && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-8 h-8 text-cyan-500" />
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Analizando Ticket...</h4>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Normalizando nombres, infiriendo categorías y estimando caducidades.
                            </p>
                        </div>
                    )}

                    {step === 'REVIEW' && scannedData && (
                        <div className="animate-fade-in">
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">{scannedData.establecimiento}</p>
                                    <p className="font-medium text-gray-900 text-sm mt-0.5">{new Date(scannedData.fecha).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Total Ticket</p>
                                    <p className="font-black text-emerald-600 text-lg">{scannedData.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                                </div>
                            </div>

                            <h5 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                                {scannedData.productos.length} Productos Identificados
                            </h5>

                            <div className="space-y-3">
                                {scannedData.productos.map((prod, idx) => (
                                    <div key={idx} className="bg-white border text-left border-gray-200 rounded-xl p-3 flex justify-between items-center hover:border-cyan-200 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{prod.nombre}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded font-bold uppercase">{prod.categoria_despensa}</span>
                                                <span className={prod.dias_caducidad_estimados <= 5 ? "text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold" : "text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold"}>
                                                    Caduca: {prod.dias_caducidad_estimados} días
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900">{prod.cantidad} <span className="text-xs text-gray-500 font-bold uppercase">{prod.unidad}</span></p>
                                            <p className="text-[10px] text-gray-400 font-medium">@ {(prod.precio_unitario).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {step === 'REVIEW' && (
                    <div className="p-6 border-t border-gray-100 bg-white shrink-0">
                        <button
                            onClick={handleConfirm}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                        >
                            Confirmar y Añadir a Despensa
                        </button>
                        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">Puedes ajustar las cantidades o fechas manualmente más tarde.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
