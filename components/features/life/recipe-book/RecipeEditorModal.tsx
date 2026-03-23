import React from 'react';
import { RecipeIngredient } from '@/types';
import { ChefHat, X, Loader2, Sparkles, Users, Plus, Trash2 } from 'lucide-react';

interface RecipeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingRecipeId: string | null;
    // Form state
    newRecipeName: string;
    setNewRecipeName: (v: string) => void;
    newRecipeImage: string | null;
    newRecipeServings: number;
    setNewRecipeServings: (v: number) => void;
    newRecipeTime: number;
    setNewRecipeTime: (v: number) => void;
    newRecipeCalories: number;
    setNewRecipeCalories: (v: number) => void;
    newIngredients: RecipeIngredient[];
    setNewIngredients: (v: RecipeIngredient[]) => void;
    newSteps: string[];
    setNewSteps: (v: string[]) => void;
    // Actions
    onSave: (e?: React.MouseEvent) => void;
    onGenerateImage: (e: React.MouseEvent) => void;
    isGeneratingImage: boolean;
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
    isOpen, onClose, editingRecipeId,
    newRecipeName, setNewRecipeName,
    newRecipeImage,
    newRecipeServings, setNewRecipeServings,
    newRecipeTime, setNewRecipeTime,
    newRecipeCalories, setNewRecipeCalories,
    newIngredients, setNewIngredients,
    newSteps, setNewSteps,
    onSave, onGenerateImage, isGeneratingImage,
}) => {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <ChefHat className="w-6 h-6 text-emerald-600" /> {editingRecipeId ? 'Editar Receta' : 'Crear Nueva Receta'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex gap-6">
                        <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center relative overflow-hidden border border-gray-200">
                            {newRecipeImage ? <img src={newRecipeImage} className="w-full h-full object-cover" /> : <ChefHat className="w-8 h-8 text-gray-300" />}
                            <button
                                type="button"
                                onClick={onGenerateImage}
                                disabled={!newRecipeName || isGeneratingImage}
                                className="absolute bottom-0 w-full bg-black/50 backdrop-blur-md text-white text-[9px] font-bold py-2 uppercase tracking-widest hover:bg-black/70 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                                {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Generar con IA
                            </button>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre del plato</label>
                                <input type="text" value={newRecipeName} onKeyDown={handleKeyDown} onChange={(e) => setNewRecipeName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none" placeholder="Ej: Pollo al Curry" />
                            </div>
                            <div className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-xl border border-blue-100 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Al cambiar las raciones, los ingredientes se ajustan automáticamente.
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Raciones</label>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            onKeyDown={handleKeyDown}
                                            value={newRecipeServings}
                                            onChange={(e) => {
                                                const newVal = parseInt(e.target.value) || 1;
                                                if (newIngredients.length > 0 && newRecipeServings > 0) {
                                                    const ratio = newVal / newRecipeServings;
                                                    const scaledIngredients = newIngredients.map(ing => ({
                                                        ...ing,
                                                        quantity: parseFloat((ing.quantity * ratio).toFixed(2))
                                                    }));
                                                    setNewIngredients(scaledIngredients);
                                                }
                                                setNewRecipeServings(newVal);
                                            }}
                                            className="w-full p-3 bg-gray-50 rounded-2xl font-bold text-center border border-gray-100"
                                        />
                                    </div>
                                </div>
                                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tiempo (m)</label><input type="number" onKeyDown={handleKeyDown} value={newRecipeTime} onChange={(e) => setNewRecipeTime(parseInt(e.target.value))} className="w-full p-3 bg-gray-50 rounded-2xl font-bold text-center border border-gray-100" /></div>
                                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kcal</label><input type="number" onKeyDown={handleKeyDown} value={newRecipeCalories} onChange={(e) => setNewRecipeCalories(parseInt(e.target.value))} className="w-full p-3 bg-gray-50 rounded-2xl font-bold text-center border border-gray-100" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Ingredientes</h4>
                        {newIngredients.map((ing, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input type="text" onKeyDown={handleKeyDown} value={ing.name} onChange={(e) => { const list = [...newIngredients]; list[idx].name = e.target.value; setNewIngredients(list); }} className="flex-1 p-3 bg-gray-50 rounded-xl text-sm font-medium border border-gray-100" placeholder="Nombre" />
                                <input type="number" onKeyDown={handleKeyDown} value={ing.quantity} onChange={(e) => { const list = [...newIngredients]; list[idx].quantity = parseFloat(e.target.value); setNewIngredients(list); }} className="w-20 p-3 bg-gray-50 rounded-xl text-sm font-medium text-center border border-gray-100" placeholder="Cant" />
                                <input type="text" onKeyDown={handleKeyDown} value={ing.unit} onChange={(e) => { const list = [...newIngredients]; list[idx].unit = e.target.value; setNewIngredients(list); }} className="w-20 p-3 bg-gray-50 rounded-xl text-sm font-medium text-center border border-gray-100" placeholder="Und" />
                                <button type="button" onClick={() => { const list = [...newIngredients]; list.splice(idx, 1); setNewIngredients(list); }} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setNewIngredients([...newIngredients, { name: '', quantity: 0, unit: 'g' }])} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Ingrediente</button>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Pasos de preparación</h4>
                        {newSteps.map((step, idx) => (
                            <div key={idx} className="flex gap-2">
                                <span className="w-8 h-10 flex items-center justify-center font-black text-gray-300 text-xs">{idx + 1}</span>
                                <textarea value={step} onKeyDown={handleKeyDown} onChange={(e) => { const list = [...newSteps]; list[idx] = e.target.value; setNewSteps(list); }} className="flex-1 p-3 bg-gray-50 rounded-xl text-sm font-medium border border-gray-100 resize-none" rows={2} placeholder="Ej: Cortar la cebolla..." />
                                <button type="button" onClick={() => { const list = [...newSteps]; list.splice(idx, 1); setNewSteps(list); }} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-fit"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setNewSteps([...newSteps, ''])} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Paso</button>
                    </div>

                    <button type="button" onClick={onSave} className="w-full bg-emerald-950 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">Guardar Receta</button>
                </div>
            </div>
        </div>
    );
};
