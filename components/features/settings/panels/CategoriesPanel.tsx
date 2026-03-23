import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Pencil, Check, Coins, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../../../store/useFinanceStore';
import { CategoryStructure } from '../../../../types';
import { useUserStore } from '../../../../store/useUserStore';

export const CategoriesPanel = () => {
    const { categories, setCategories } = useFinanceStore();
    const { language } = useUserStore();
    const isSpanish = language === 'ES';

    const categoryFormRef = useRef<HTMLFormElement>(null);

    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [newSubCat, setNewSubCat] = useState('');

    const handleEditCategoryClick = (cat: CategoryStructure) => {
        setEditingCatId(cat.id);
        setNewCatName(cat.name);
        setNewCatType(cat.type);
        setNewSubCat(cat.subCategories.join(', '));
        categoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName) return;

        const subCategoriesList = newSubCat
            ? newSubCat.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : [];

        if (editingCatId) {
            setCategories(categories.map(c => c.id === editingCatId ? {
                ...c,
                name: newCatName,
                type: newCatType,
                subCategories: subCategoriesList
            } : c));
        } else {
            const newCat: CategoryStructure = {
                id: Math.random().toString(36).substr(2, 9),
                name: newCatName,
                type: newCatType,
                subCategories: subCategoriesList
            };
            setCategories([...categories, newCat]);
        }
        resetCategoryForm();
    };

    const resetCategoryForm = () => {
        setEditingCatId(null);
        setNewCatName('');
        setNewSubCat('');
        setNewCatType('EXPENSE');
    };

    const handleDeleteCategory = (id: string) => {
        const confirmationWord = isSpanish ? 'ELIMINAR' : 'DELETE';
        const confirmText = window.prompt(
            isSpanish
                ? `Escribe ${confirmationWord} para borrar esta categoría.`
                : `Type ${confirmationWord} to delete this category.`
        );
        if (confirmText === confirmationWord) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-12 pb-12"
        >
            {/* Category Form - Top Section */}
            <section className="bg-white/40 dark:bg-onyx-950 p-10 md:p-14 rounded-[50px] border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-2xl relative overflow-hidden group ring-1 ring-slate-200/50 dark:ring-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/40 to-white/80 dark:from-[#0c0c1e] dark:via-indigo-950/20 dark:to-onyx-950" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-indigo-400 rounded-2xl border border-blue-500/20 shadow-inner">
                            {editingCatId ? <Pencil className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {editingCatId 
                                    ? (isSpanish ? 'Refinar Categoría' : 'Refine Category')
                                    : (isSpanish ? 'Nueva Categoría Maestra' : 'New Master Category')
                                }
                            </h4>
                            <p className="text-[10px] font-black text-blue-600/60 dark:text-indigo-400/60 uppercase tracking-widest mt-1">Estructura Financiera Aura</p>
                        </div>
                    </div>

                    <form ref={categoryFormRef} onSubmit={handleSaveCategory} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-indigo-300/50 uppercase tracking-[0.2em] mb-3 ml-1">
                                    {isSpanish ? 'Identificador' : 'Identifier'}
                                </label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="w-full p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
                                    placeholder={isSpanish ? "Transporte, Hogar..." : "Transport, Home..."}
                                    required
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-indigo-300/50 uppercase tracking-[0.2em] mb-3 ml-1">
                                    {isSpanish ? 'Naturaleza' : 'Nature'}
                                </label>
                                <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm h-[66px]">
                                    <button
                                        type="button"
                                        onClick={() => setNewCatType('EXPENSE')}
                                        className={`flex-1 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all h-full flex items-center justify-center ${newCatType === 'EXPENSE'
                                                ? 'bg-rose-500 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {isSpanish ? 'Gasto' : 'Expense'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCatType('INCOME')}
                                        className={`flex-1 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all h-full flex items-center justify-center ${newCatType === 'INCOME'
                                                ? 'bg-emerald-500 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {isSpanish ? 'Ingreso' : 'Income'}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-indigo-300/50 uppercase tracking-[0.2em] mb-3 ml-1">
                                    {isSpanish ? 'Subcategorías' : 'Subcategories'}
                                </label>
                                <input
                                    type="text"
                                    value={newSubCat}
                                    onChange={(e) => setNewSubCat(e.target.value)}
                                    className="w-full p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm font-mono text-xs"
                                    placeholder="Sub 1, Sub 2..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-5 pt-4">
                            {editingCatId && (
                                <button
                                    type="button"
                                    onClick={resetCategoryForm}
                                    className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white rounded-3xl transition-all"
                                >
                                    {isSpanish ? 'Cancelar' : 'Cancel'}
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                <Check className="w-5 h-5" />
                                {editingCatId ? (isSpanish ? 'Actualizar' : 'Update') : (isSpanish ? 'Crear Categoría' : 'Create Category')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Expenses Section */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl ring-1 ring-rose-500/20">
                        <Coins className="w-7 h-7" />
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {isSpanish ? 'Flujos de Gastos' : 'Expense Streams'}
                    </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                        <motion.div 
                            key={cat.id}
                            whileHover={{ y: -5 }}
                            className="group bg-white dark:bg-onyx-900 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden ring-1 ring-black/5"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h5 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:text-rose-600 transition-colors">{cat.name}</h5>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block opacity-60">
                                        {cat.subCategories.length} {isSpanish ? 'Elementos' : 'Elements'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditCategoryClick(cat)} className="p-3 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                                {cat.subCategories.map((sub, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-gray-50 dark:bg-black/40 text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-[0.1em] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                                        {sub}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Income Section */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl ring-1 ring-emerald-500/20">
                        <Coins className="w-7 h-7" />
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {isSpanish ? 'Fuentes de Ingresos' : 'Income Sources'}
                    </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {categories.filter(c => c.type === 'INCOME').map(cat => (
                        <motion.div 
                            key={cat.id}
                            whileHover={{ y: -5 }}
                            className="group bg-white dark:bg-onyx-900 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden ring-1 ring-black/5"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h5 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:text-emerald-600 transition-colors">{cat.name}</h5>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block opacity-60">
                                        {cat.subCategories.length} {isSpanish ? 'Elementos' : 'Elements'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditCategoryClick(cat)} className="p-3 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                                {cat.subCategories.map((sub, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-gray-50 dark:bg-black/40 text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-[0.1em] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                                        {sub}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </motion.div>
    );
};
