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
            className="max-w-4xl space-y-8 pb-12"
        >
            <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {isSpanish ? 'Categorías' : 'Categories'}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {isSpanish ? 'Personaliza tu estructura de ingresos y gastos.' : 'Customize your income and expense structure.'}
                </p>
            </div>

            {/* Category Form */}
            <form
                ref={categoryFormRef}
                onSubmit={handleSaveCategory}
                className="bg-white dark:bg-onyx-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-onyx-800 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-6"
            >
                <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        {editingCatId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                    {editingCatId
                        ? (isSpanish ? 'Editar Categoría' : 'Edit Category')
                        : (isSpanish ? 'Nueva Categoría' : 'New Category')
                    }
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                            {isSpanish ? 'Nombre' : 'Name'}
                        </label>
                        <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-onyx-950 border border-gray-200 dark:border-onyx-700 rounded-2xl font-black focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white transition-all shadow-inner"
                            placeholder={isSpanish ? "Ej: Transporte" : "e.g. Transport"}
                            required
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                            {isSpanish ? 'Tipo' : 'Type'}
                        </label>
                        <div className="flex bg-gray-50 dark:bg-onyx-950 p-1.5 rounded-2xl border border-gray-200 dark:border-onyx-700 shadow-inner h-[58px]">
                            <button
                                type="button"
                                onClick={() => setNewCatType('EXPENSE')}
                                className={`flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all h-full flex items-center justify-center ${newCatType === 'EXPENSE'
                                        ? 'bg-white dark:bg-onyx-800 shadow-sm text-rose-500'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {isSpanish ? 'Gasto' : 'Expense'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewCatType('INCOME')}
                                className={`flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all h-full flex items-center justify-center ${newCatType === 'INCOME'
                                        ? 'bg-white dark:bg-onyx-800 shadow-sm text-emerald-500'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {isSpanish ? 'Ingreso' : 'Income'}
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                            {isSpanish ? 'Subcategorías (CSV)' : 'Subcategories (CSV)'}
                        </label>
                        <input
                            type="text"
                            value={newSubCat}
                            onChange={(e) => setNewSubCat(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-onyx-950 border border-gray-200 dark:border-onyx-700 rounded-2xl font-medium focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white transition-all shadow-inner"
                            placeholder={isSpanish ? "Gasolina, Metro, Taxi..." : "Gas, Metro, Taxi..."}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-onyx-800">
                    {editingCatId && (
                        <button
                            type="button"
                            onClick={resetCategoryForm}
                            className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-onyx-950 hover:bg-gray-100 dark:hover:bg-onyx-800 rounded-2xl transition-all"
                        >
                            {isSpanish ? 'Cancelar' : 'Cancel'}
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200/50 dark:shadow-none hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Check className="w-5 h-5" />
                        {editingCatId
                            ? (isSpanish ? 'Actualizar Categoría' : 'Update Category')
                            : (isSpanish ? 'Guardar Categoría' : 'Save Category')
                        }
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* EXPENSE CATEGORIES */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-200 dark:border-onyx-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center shadow-inner">
                            <Coins className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            {isSpanish ? 'Gastos' : 'Expenses'}
                        </h4>
                    </div>
                    <div className="space-y-4">
                        {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                            <div key={cat.id} className="group bg-white dark:bg-onyx-900 p-6 rounded-[2rem] border border-gray-100 dark:border-onyx-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all shadow-sm hover:shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h5 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{cat.name}</h5>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                            {cat.subCategories.length} {isSpanish ? 'subcategorías' : 'subcategories'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditCategoryClick(cat)}
                                            className="p-3 text-gray-400 bg-gray-50 dark:bg-onyx-950 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors shadow-sm"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-3 text-gray-400 bg-gray-50 dark:bg-onyx-950 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cat.subCategories.map((sub, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-gray-50 dark:bg-onyx-950 shadow-inner text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-200 dark:border-onyx-800">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INCOME CATEGORIES */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-200 dark:border-onyx-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shadow-inner">
                            <Coins className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            {isSpanish ? 'Ingresos' : 'Income'}
                        </h4>
                    </div>
                    <div className="space-y-4">
                        {categories.filter(c => c.type === 'INCOME').map(cat => (
                            <div key={cat.id} className="group bg-white dark:bg-onyx-900 p-6 rounded-[2rem] border border-gray-100 dark:border-onyx-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all shadow-sm hover:shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h5 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{cat.name}</h5>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                            {cat.subCategories.length} {isSpanish ? 'subcategorías' : 'subcategories'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditCategoryClick(cat)}
                                            className="p-3 text-gray-400 bg-gray-50 dark:bg-onyx-950 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors shadow-sm"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-3 text-gray-400 bg-gray-50 dark:bg-onyx-950 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cat.subCategories.map((sub, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-gray-50 dark:bg-onyx-950 shadow-inner text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-200 dark:border-onyx-800">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
