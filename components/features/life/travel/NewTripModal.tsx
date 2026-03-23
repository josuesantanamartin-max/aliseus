import React, { useState } from 'react';
import { Plane, DollarSign, X, Sparkles, Loader2, Wand2, CalendarDays } from 'lucide-react';
import { Trip, Flight, Accommodation, ItineraryItem, Language } from '../../../../types';
import { generateImage } from '../../../../services/geminiCore';
import { planTripWithAI, extractTravelParams } from '../../../../services/geminiLife';
import { searchFlights } from '../../../../services/duffelService';

interface NewTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveDialog: (trip: Trip, createLinkedGoal: boolean) => void;
    language: Language;
    currency: string;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({ isOpen, onClose, onSaveDialog, language, currency }) => {
    // Creation Mode State
    const [createMode, setCreateMode] = useState<'MANUAL' | 'AI'>('MANUAL');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiPlanning, setIsAiPlanning] = useState(false);

    // New Trip Form State 
    const [newDestination, setNewDestination] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');
    const [newBudget, setNewBudget] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [isGeneratingImg, setIsGeneratingImg] = useState(false);
    const [createLinkedGoal, setCreateLinkedGoal] = useState(true);

    // AI Generated Content Buffers
    const [generatedFlights, setGeneratedFlights] = useState<Flight[]>([]);
    const [generatedAccommodations, setGeneratedAccommodations] = useState<Accommodation[]>([]);
    const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryItem[]>([]);

    const handleGenerateImage = async () => {
        if (!newDestination) return;
        setIsGeneratingImg(true);
        const prompt = `Beautiful travel photo of ${newDestination}, ${newCountry}. Landmarks, sunny weather.`;
        const result = await generateImage(prompt, "16:9", 'travel');
        if (result.imageUrl) {
            setNewImage(result.imageUrl);
        } else {
            alert("No se pudo generar la imagen. Inténtalo de nuevo.");
        }
        setIsGeneratingImg(false);
    };

    const handleAiPlan = async () => {
        if (!aiPrompt) return;
        setIsAiPlanning(true);

        try {
            // 1. Extraer parámetros del viaje con Gemini
            const params = await extractTravelParams(aiPrompt, language);

            let realFlights: Flight[] = [];
            let realAccommodations: Accommodation[] = [];

            // 2. Si Gemini encontró origen, destino y fecha, buscar en Duffel
            if (params && params.origin && params.destination && params.departureDate) {
                realFlights = await searchFlights({
                    origin: params.origin,
                    destination: params.destination,
                    departureDate: params.departureDate,
                    returnDate: params.returnDate || undefined,
                    adults: params.adults
                });
            }

            // 3. Crear el Itinerario final pasando los datos reales
            const tripPlan = await planTripWithAI(aiPrompt, realFlights, realAccommodations, language);

            if (tripPlan) {
                setNewDestination(tripPlan.destination || '');
                setNewCountry(tripPlan.country || '');
                setNewStartDate(tripPlan.startDate || '');
                setNewEndDate(tripPlan.endDate || '');
                setNewBudget(tripPlan.budget?.toString() || '');

                if (tripPlan.flights) setGeneratedFlights(tripPlan.flights.map(f => ({ ...f, id: Math.random().toString(36).substr(2, 9) } as Flight)));
                if (tripPlan.accommodations) setGeneratedAccommodations(tripPlan.accommodations.map(a => ({ ...a, id: Math.random().toString(36).substr(2, 9) } as Accommodation)));
                if (tripPlan.itinerary) setGeneratedItinerary(tripPlan.itinerary.map(i => ({ ...i, id: Math.random().toString(36).substr(2, 9) } as ItineraryItem)));

                setCreateMode('MANUAL');

                if (tripPlan.destination) {
                    setIsGeneratingImg(true);
                    const prompt = tripPlan.imagePrompt || `Travel photo of ${tripPlan.destination}`;
                    generateImage(prompt, "16:9", 'travel').then(res => {
                        if (res.imageUrl) setNewImage(res.imageUrl);
                        setIsGeneratingImg(false);
                    });
                }
            } else {
                alert("La IA no pudo generar el plan. Intenta ser más específico.");
            }
        } catch (error) {
            console.error("Error en la planificación con IA:", error);
            alert("Ocurrió un error inesperado al conectar con los servicios de viaje.");
        } finally {
            setIsAiPlanning(false);
        }
    };

    const handleCreateTrip = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDestination || !newStartDate) return;

        const newTrip: Trip = {
            id: Math.random().toString(36).substr(2, 9),
            destination: newDestination,
            country: newCountry,
            startDate: newStartDate,
            endDate: newEndDate,
            budget: parseFloat(newBudget) || 0,
            spent: 0,
            status: 'UPCOMING',
            image: newImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
            flights: generatedFlights,
            accommodations: generatedAccommodations,
            itinerary: generatedItinerary,
            checklist: []
        };

        onSaveDialog(newTrip, createLinkedGoal);
        resetForm();
    };

    const resetForm = () => {
        onClose();
        setNewDestination(''); setNewCountry(''); setNewStartDate(''); setNewEndDate(''); setNewBudget(''); setNewImage(null);
        setGeneratedFlights([]); setGeneratedAccommodations([]); setGeneratedItinerary([]);
        setCreateMode('MANUAL'); setAiPrompt('');
        setCreateLinkedGoal(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Nueva Aventura</h3>
                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 p-2"><X className="w-6 h-6" /></button>
                </div>

                {/* Mode Switcher */}
                <div className="px-8 pt-6 pb-2">
                    <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button onClick={() => setCreateMode('MANUAL')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${createMode === 'MANUAL' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Manual</button>
                        <button onClick={() => setCreateMode('AI')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${createMode === 'AI' ? 'bg-white shadow-md text-cyan-600' : 'text-gray-400 hover:text-gray-600'}`}><Wand2 className="w-3 h-3" /> Aliseus Insights</button>
                    </div>
                </div>

                {createMode === 'AI' ? (
                    <div className="p-8 space-y-6">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-cyan-600" /></div>
                            <h4 className="text-lg font-black text-gray-900">Aliseus Insights: Diseñador de Experiencias</h4>
                            <p className="text-sm text-gray-500 mt-2">Describe tu viaje ideal y la IA se encargará de buscar vuelos reales, hoteles y crear tu agenda.</p>
                        </div>
                        <div>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Ej: Quiero ir a la costa amalfitana en mayo, 5 días, con un presupuesto de 2000€. Me gusta la comida italiana y los paseos en barco."
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm focus:bg-white focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all h-32 resize-none"
                            />
                        </div>
                        <button
                            onClick={handleAiPlan}
                            disabled={isAiPlanning || !aiPrompt}
                            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isAiPlanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            {isAiPlanning ? 'Buscando opciones reales...' : 'Generar Viaje Completo'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleCreateTrip} className="p-8 space-y-6">
                        <div className="w-full h-40 rounded-2xl bg-gray-100 relative overflow-hidden group border border-gray-200 flex items-center justify-center">
                            {newImage ? (
                                <>
                                    <img src={newImage} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                </>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Plane className="w-8 h-8 mb-2 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sin imagen</span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImg || !newDestination}
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                            >
                                {isGeneratingImg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-cyan-600" />}
                                {isGeneratingImg ? 'Generando...' : 'Autogenerar Foto'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Destino</label>
                                <input type="text" value={newDestination} onChange={(e) => setNewDestination(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="Ej: París" required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">País</label>
                                <input type="text" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="Ej: Francia" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inicio</label>
                                <div className="relative group">
                                    <input 
                                        type="date" 
                                        value={newStartDate} 
                                        onChange={(e) => setNewStartDate(e.target.value)} 
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-gray-900/5 outline-none transition-all appearance-none relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer" 
                                        required 
                                    />
                                    <CalendarDays className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 z-0 group-hover:text-gray-900 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fin</label>
                                <div className="relative group">
                                    <input 
                                        type="date" 
                                        value={newEndDate} 
                                        onChange={(e) => setNewEndDate(e.target.value)} 
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-gray-900/5 outline-none transition-all appearance-none relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer" 
                                    />
                                    <CalendarDays className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 z-0 group-hover:text-gray-900 transition-colors" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Presupuesto Estimado ({currency})</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg" placeholder="0.00" />
                            </div>
                            {(generatedFlights.length > 0 || generatedAccommodations.length > 0) && (
                                <div className="mt-4 bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
                                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Wand2 className="w-3 h-3" /> Contenido Generado por IA</p>
                                    <div className="flex gap-2">
                                        {generatedFlights.length > 0 && <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">{generatedFlights.length} Vuelos</span>}
                                        {generatedAccommodations.length > 0 && <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">{generatedAccommodations.length} Alojamientos</span>}
                                        {generatedItinerary.length > 0 && <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">{generatedItinerary.length} Actividades</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100">
                            <input 
                                type="checkbox" 
                                id="createLinkedGoal"
                                checked={createLinkedGoal}
                                onChange={(e) => setCreateLinkedGoal(e.target.checked)}
                                className="w-5 h-5 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500 bg-white"
                            />
                            <label htmlFor="createLinkedGoal" className="text-xs font-bold text-gray-700 cursor-pointer">
                                Crear Meta de Ahorro y sincronizar con Finanzas
                            </label>
                        </div>
                        
                        <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">
                            {generatedFlights.length > 0 ? 'Guardar Viaje Generado' : 'Crear Viaje & Sincronizar'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
