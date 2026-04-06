import React, { useMemo } from 'react';
import { useLifeStore } from '../../../../../store/useLifeStore';
import { ChefHat, Clock, Star, TrendingUp } from 'lucide-react';

interface RecipeFavoritesWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const RecipeFavoritesWidget: React.FC<RecipeFavoritesWidgetProps> = ({ onNavigate }) => {
    const { recipes = [] } = useLifeStore();

    // Calcular recetas más usadas (basado en timesUsed)
    const topRecipes = useMemo(() => {
        return [...recipes]
            .sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0))
            .slice(0, 5);
    }, [recipes]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Fácil': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'Media': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            case 'Difícil': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <div className="bg-white dark:bg-aliseus-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-aliseus-800 hover:shadow-lg transition-all h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <ChefHat className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                            Recetas Favoritas
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Más cocinadas
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('life', 'recipes')}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                    Ver todas
                </button>
            </div>

            {/* Recipes List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
                {topRecipes.length === 0 ? (
                    <div className="text-center py-8">
                        <ChefHat className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            No hay recetas guardadas
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Añade recetas para verlas aquí
                        </p>
                    </div>
                ) : (
                    topRecipes.map((recipe, index) => (
                        <div
                            key={recipe.id}
                            onClick={() => onNavigate('life', 'recipes')}
                            className="p-4 rounded-xl border border-gray-200 dark:border-aliseus-700 bg-gray-50 dark:bg-aliseus-800 hover:bg-white dark:hover:bg-aliseus-700 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-3">
                                {/* Ranking Badge */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                        index === 1 ? 'bg-gray-100 dark:bg-gray-800' :
                                            index === 2 ? 'bg-orange-100 dark:bg-orange-900/30' :
                                                'bg-gray-50 dark:bg-aliseus-900'
                                    }`}>
                                    <span className={`text-sm font-black ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' :
                                            index === 1 ? 'text-gray-600 dark:text-gray-400' :
                                                index === 2 ? 'text-orange-600 dark:text-orange-400' :
                                                    'text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Recipe Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        {recipe.name}
                                    </h4>

                                    <div className="flex items-center gap-3 mt-2">
                                        {/* Difficulty */}
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${getDifficultyColor(recipe.difficulty)}`}>
                                            {recipe.difficulty}
                                        </span>

                                        {/* Time */}
                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-xs font-bold">{recipe.prepTime + recipe.cookTime} min</span>
                                        </div>

                                        {/* Times Used */}
                                        {recipe.timesUsed && recipe.timesUsed > 0 && (
                                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                                <TrendingUp className="w-3 h-3" />
                                                <span className="text-xs font-bold">{recipe.timesUsed}x</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    {recipe.rating && recipe.rating > 0 && (
                                        <div className="flex items-center gap-1 mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < recipe.rating!
                                                            ? 'text-yellow-500 fill-yellow-500'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecipeFavoritesWidget;
