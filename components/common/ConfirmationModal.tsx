import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    isDanger = true
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/40 overflow-hidden"
                    >
                        <div className="p-8 pb-4 flex flex-col items-center text-center">
                            {/* Icon Container */}
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500 shadow-blue-100/50'}`}>
                                <AlertCircle className="w-10 h-10" />
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-500 font-bold leading-relaxed">{message}</p>
                        </div>

                        {/* Actions */}
                        <div className="p-8 pt-6 flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all
                                    ${isDanger ? 'bg-red-600 text-white shadow-red-200' : 'bg-blue-600 text-white shadow-blue-200'}`}
                            >
                                {confirmLabel}
                            </button>
                            <button
                                onClick={onCancel}
                                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all"
                            >
                                {cancelLabel}
                            </button>
                        </div>

                        {/* Top Close Button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
