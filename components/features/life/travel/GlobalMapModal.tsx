import React, { useEffect, useRef } from 'react';
import { Globe, X, MapPin } from 'lucide-react';
import createGlobe from 'cobe';
import { Trip } from '../../../../../types';

const CobeInteractiveGlobe = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        let width = 0;

        const onResize = () => {
            if (canvasRef.current) {
                width = canvasRef.current.offsetWidth;
            }
        };
        window.addEventListener('resize', onResize);
        onResize();

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 0,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [1, 1, 1],
            markerColor: [59 / 255, 130 / 255, 246 / 255], // blue-500
            glowColor: [1, 1, 1],
            markers: [],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
                state.width = width * 2;
                state.height = width * 2;
            }
        });

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div className="w-full h-full relative" style={{ width: '100%', aspectRatio: '1/1', maxWidth: '300px', margin: 'auto' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', contain: 'layout paint size', opacity: 0.9, transition: 'opacity 1s ease' }}
            />
        </div>
    );
};

interface GlobalMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    trips: Trip[];
}

export const GlobalMapModal: React.FC<GlobalMapModalProps> = ({ isOpen, onClose, trips }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden relative">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" /> Pasaporte Global
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 bg-gray-50 flex flex-col md:flex-row gap-8 items-center border-t border-white">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center relative shrink-0">
                        <CobeInteractiveGlobe />
                    </div>
                    <div className="flex-1 space-y-4">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Activo</span>
                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">Tus Territorios Conquistados</h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Has visitado <strong>{new Set(trips.map(t => t.country)).size} países</strong> a través de <strong>{trips.length} expediciones</strong>.
                            Gira el globo interactivo 3D para planear tu próxima aventura.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                            {Array.from(new Set(trips.map(t => t.country))).filter(Boolean).map(country => (
                                <span key={country} className="bg-white border border-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 hover:border-gray-300 transition-colors">
                                    <MapPin className="w-4 h-4 text-emerald-500" /> {country}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
