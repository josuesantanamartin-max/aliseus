import { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useLifeStore } from '../store/useLifeStore';
import { useUserStore } from '../store/useUserStore';
import {
    LayoutDashboard, CreditCard, Receipt, Layers, Users, Utensils,
    Calendar, Settings, HelpCircle, Search, Zap
} from 'lucide-react';


export type SearchResultType = 'NAVIGATION' | 'TRANSACTION' | 'ACTION' | 'MEMBER' | 'RECIPE' | 'SAVED_FILTER' | 'INGREDIENT';

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle?: string;
    icon?: any;
    action: () => void;
    keywords?: string[];
}

export const useGlobalSearch = (isOpen: boolean, onClose: () => void) => {
    const [query, setQuery] = useState('');
    const {
        setActiveApp,
        setFinanceActiveTab,
        setLifeActiveTab,
        recentSearches,
        addRecentSearch,
        savedFilters
    } = useUserStore();

    const { transactions, accounts } = useFinanceStore();
    const { familyMembers, weeklyPlans, recipes, pantryItems, shoppingList, setRecipeToOpen, setShoppingList } = useLifeStore();

    // 1. NAVIGATION RESULTS
    const navigationResults: SearchResult[] = [
        {
            id: 'nav-dashboard',
            type: 'NAVIGATION',
            title: 'Aliseus Central',
            subtitle: 'Ir al inicio',
            icon: LayoutDashboard,
            action: () => setActiveApp('dashboard'),
            keywords: ['home', 'inicio', 'main']
        },
        {
            id: 'nav-transactions',
            type: 'NAVIGATION',
            title: 'Transacciones',
            subtitle: 'Ver movimientos',
            icon: Receipt,
            action: () => { setActiveApp('finance'); setFinanceActiveTab('transactions'); },
            keywords: ['gastos', 'ingresos', 'movimientos']
        },
        {
            id: 'nav-accounts',
            type: 'NAVIGATION',
            title: 'Cuentas',
            subtitle: 'Gestión de bancos y efectivo',
            icon: CreditCard,
            action: () => { setActiveApp('finance'); setFinanceActiveTab('accounts'); },
            keywords: ['bancos', 'tarjetas', 'saldos']
        },
        {
            id: 'nav-kitchen',
            type: 'NAVIGATION',
            title: 'Cocina y Recetas',
            subtitle: 'Gestión de comidas',
            icon: Utensils,
            action: () => { setActiveApp('life'); setLifeActiveTab('kitchen-dashboard'); },
            keywords: ['comida', 'recetas', 'menú']
        },
    ];

    // 2. ACTION RESULTS
    const actionResults: SearchResult[] = [
        {
            id: 'act-new-transaction',
            type: 'ACTION',
            title: 'Nueva Transacción',
            subtitle: 'Registrar gasto o ingreso',
            icon: Zap,
            action: () => { setActiveApp('finance'); setFinanceActiveTab('transactions'); /* TODO: Open modal */ },
            keywords: ['crear', 'añadir', 'gasto', 'ingreso']
        },
        {
            id: 'act-settings',
            type: 'ACTION',
            title: 'Ajustes',
            subtitle: 'Configuración global',
            icon: Settings,
            action: () => { setActiveApp('settings'); }, // Assuming 'settings' app state exists or handled otherwise
            keywords: ['configuración', 'perfil', 'tema']
        }
    ];

    // 3. TRANSACTION SEARCH
    const transactionResults: SearchResult[] = useMemo(() => {
        if (!query || query.length < 2) return [];
        return transactions
            .filter(t =>
                t.description.toLowerCase().includes(query.toLowerCase()) ||
                t.category.toLowerCase().includes(query.toLowerCase()) ||
                t.amount.toString().includes(query)
            )
            .slice(0, 5)
            .map(t => ({
                id: `tx-${t.id}`,
                type: 'TRANSACTION' as SearchResultType,
                title: t.description,
                subtitle: `${t.amount}â‚¬ - ${new Date(t.date).toLocaleDateString()}`,
                icon: Receipt,
                action: () => {
                    setActiveApp('finance');
                    setFinanceActiveTab('transactions');
                    // In a real app we would highlight this transaction
                }
            }));
    }, [query, transactions]);

    // 4. MEMBER SEARCH
    const memberResults: SearchResult[] = useMemo(() => {
        if (!query) return [];
        return familyMembers
            .filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
            .map(m => ({
                id: `mem-${m.id}`,
                type: 'MEMBER' as SearchResultType,
                title: m.name,
                subtitle: m.role,
                icon: Users,
                action: () => { setActiveApp('settings'); /* Open family tab */ }
            }));
    }, [query, familyMembers]);

    // 5. SAVED FILTERS
    const savedFilterResults: SearchResult[] = useMemo(() => {
        if (!query) return savedFilters.map(f => ({
            id: `filter-${f.id}`,
            type: 'SAVED_FILTER' as SearchResultType,
            title: f.name,
            subtitle: 'Filtro guardado',
            icon: Search,
            action: () => {
                setQuery(f.query);
                // In future: Apply complex filter logic
            }
        }));

        return savedFilters
            .filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
            .map(f => ({
                id: `filter-${f.id}`,
                type: 'SAVED_FILTER' as SearchResultType,
                title: f.name,
                subtitle: 'Filtro guardado',
                icon: Search,
                action: () => setQuery(f.query)
            }));
    }, [query, savedFilters]);

    // 6. RECIPES SEARCH
    const recipeResults: SearchResult[] = useMemo(() => {
        if (!query || query.length < 2) return [];
        return recipes
            .filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
            .map(r => ({
                id: `recipe-${r.id}`,
                type: 'RECIPE' as SearchResultType,
                title: r.name,
                subtitle: `Receta â€¢ ${r.ingredients.length} ingredientes`,
                icon: Utensils,
                action: () => {
                    setRecipeToOpen(r);
                    setActiveApp('life');
                    setLifeActiveTab('kitchen-recipes');
                },
                keywords: ['receta', 'cocina', 'plato', ...(r.tags || [])]
            }));
    }, [query, recipes, setRecipeToOpen]);

    // 7. INGREDIENTS SEARCH
    const ingredientResults: SearchResult[] = useMemo(() => {
        if (!query || query.length < 2) return [];

        // Aggregate unique ingredients from recipes for search candidates
        const allIngredientNames = Array.from(new Set(recipes.flatMap(r => r.ingredients.map(i => i.name))));

        return allIngredientNames
            .filter(name => name.toLowerCase().includes(query.toLowerCase()))
            .map(name => {
                const inPantry = pantryItems.find(i => i.name.toLowerCase() === name.toLowerCase());
                const inShoppingList = shoppingList.find(i => i.name.toLowerCase() === name.toLowerCase() && !i.checked);

                let subtitle = 'No disponible';
                let icon = Search; // Default
                let action = () => { /* Add to shopping list logic future */ };

                if (inPantry) {
                    subtitle = `En despensa: ${inPantry.quantity} ${inPantry.unit}`;
                    icon = Layers; // Use specific icon
                    action = () => { setActiveApp('life'); setLifeActiveTab('kitchen-pantry'); };
                } else if (inShoppingList) {
                    subtitle = 'En lista de la compra';
                    icon = CreditCard; // Cart icon preferable
                    action = () => { setActiveApp('life'); setLifeActiveTab('kitchen-shopping'); };
                } else {
                    subtitle = 'No está en lista ni despensa';
                }

                return {
                    id: `ing-${name}`,
                    type: 'INGREDIENT' as SearchResultType,
                    title: name,
                    subtitle,
                    icon,
                    action,
                    keywords: ['ingrediente', 'comida', inPantry ? 'despensa' : '', inShoppingList ? 'lista' : '']
                };
            });
    }, [query, recipes, pantryItems, shoppingList]);


    // COMBINE RESULTS
    const results = useMemo(() => {
        if (!query) return [...savedFilterResults, ...navigationResults.slice(0, 3)]; // Show defaults if empty

        const all = [
            ...navigationResults,
            ...actionResults,
            ...memberResults,
            ...transactionResults,
            ...savedFilterResults,
            ...recipeResults,
            ...ingredientResults
        ];

        return all.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
            item.keywords?.some(k => k.includes(query.toLowerCase()))
        );
    }, [query, navigationResults, actionResults, memberResults, transactionResults, savedFilterResults, recipeResults, ingredientResults]);

    const handleSelect = (result: SearchResult) => {
        addRecentSearch(query);
        result.action();
        onClose();
        setQuery('');
    };

    return {
        query,
        setQuery,
        results,
        handleSelect
    };
};
