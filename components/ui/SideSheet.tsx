import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SideSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const SideSheet: React.FC<SideSheetProps> = ({ isOpen, onClose, title, children }) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            // Prevenir scroll en el body cuando el sheet está abierto
            document.body.style.overflow = 'hidden';
        } else {
            // Dar tiempo a la animación de cierre antes de desmontar (300ms)
            const timeout = setTimeout(() => setIsRendered(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!isRendered) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay background (Glass effect) */}
            <div
                className={`fixed inset-0 bg-aliseus-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar content */}
            <div
                className={`relative w-full max-w-2xl h-full bg-white dark:bg-aliseus-900 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-aliseus-100 dark:border-aliseus-800 shrink-0">
                    <h2 className="text-xl font-bold tracking-tight text-aliseus-900 dark:text-white">
                        {title || 'Detalles'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-aliseus-100 dark:hover:bg-aliseus-800 text-aliseus-500 transition-colors"
                        aria-label="Cerrar panel lateral"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable content area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SideSheet;
