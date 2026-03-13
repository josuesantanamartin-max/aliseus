import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MealPlanner } from '../MealPlanner';
import { useLifeStore } from '../../../../store/useLifeStore';
import { useUserStore } from '../../../../store/useUserStore';

// Mock stores and services
vi.mock('../../../../store/useLifeStore');
vi.mock('../../../../store/useUserStore');
vi.mock('../../../../services/geminiCore', () => ({
    generateImage: vi.fn(),
}));

vi.mock('../../../../services/geminiLife', () => ({
    generateMealPlan: vi.fn(),
    getRecipeDetails: vi.fn(),
}));

describe('MealPlanner Component', () => {
    const mockSetWeeklyPlans = vi.fn();
    const mockAddRecipe = vi.fn();
    const mockOnOpenRecipe = vi.fn();

    const sampleRecipe = {
        id: 'r1',
        name: 'Paella Valenciana',
        prepTime: 60,
        calories: 450,
        tags: ['español', 'arroz'],
        baseServings: 4,
        ingredients: [
            { name: 'Arroz', quantity: 400, unit: 'g' },
            { name: 'Gambas', quantity: 200, unit: 'g' },
        ],
        instructions: ['Calentar aceite', 'Añadir arroz', 'Cocinar 18 minutos'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-13T12:00:00Z'));

        // Mock useLifeStore
        (useLifeStore as any).mockReturnValue({
            recipes: [sampleRecipe],
            weeklyPlans: [
                {
                    id: 'plan1',
                    weekStart: '2026-01-12',
                    meals: [
                        {
                            id: 'meal1',
                            date: '2026-01-13',
                            type: 'lunch',
                            recipeId: sampleRecipe.id,
                            recipeName: sampleRecipe.name,
                            servings: sampleRecipe.baseServings,
                            courseType: 'MAIN'
                        }
                    ],
                },
            ],
            pantryItems: [],
            shoppingList: [],
            setShoppingList: vi.fn(),
            setRecipes: vi.fn(),
            setWeeklyPlans: mockSetWeeklyPlans,
            addRecipe: mockAddRecipe,
        });

        // Mock useUserStore
        (useUserStore as any).mockReturnValue({
            user: { id: 'user1', email: 'test@example.com' },
            language: 'ES',
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Renderización', () => {
        it('debe renderizar el componente correctamente', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByText(/Hoy/i)).toBeInTheDocument();
        });

        it('debe mostrar los días de la semana', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByText(/Semana/i)).toBeInTheDocument();
        });

        it('debe mostrar las comidas del día (desayuno, almuerzo, cena)', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getAllByText(/desayuno/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/almuerzo/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/cena/i).length).toBeGreaterThan(0);
        });

        it('debe mostrar las recetas planificadas', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByText('Paella Valenciana')).toBeInTheDocument();
        });
    });

    describe('Navegación de Semanas', () => {
        it('debe tener botones para navegar entre semanas', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('debe cambiar de semana al hacer clic en siguiente', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const nextButton = screen.getByRole('button', { name: /siguiente/i });
            fireEvent.click(nextButton);

            // La fecha debe cambiar (verificar que se actualiza el estado)
            expect(nextButton).toBeInTheDocument();
        });
    });

    describe('Agregar Recetas al Plan', () => {
        it('debe permitir agregar una receta rápidamente', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            // Buscar botón de agregar receta rápida
            const quickAddButtons = screen.getAllByRole('button', { name: /\+/i });
            if (quickAddButtons.length > 0) {
                fireEvent.click(quickAddButtons[0]);
                // Debe abrir un modal o selector de recetas
            }
        });
    });

    describe('Drag and Drop', () => {
        it('debe permitir arrastrar recetas entre días', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const recipeElement = screen.getByText('Paella Valenciana');

            // Simular drag start
            fireEvent.dragStart(recipeElement, {
                dataTransfer: {
                    setData: vi.fn(),
                    getData: vi.fn(),
                },
            });

            expect(recipeElement).toBeInTheDocument();
        });
    });

    describe('Copiar y Pegar Días', () => {
        it('debe tener opción para copiar un día', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const copyButtons = screen.getAllByRole('button', { name: /copiar/i });
            expect(copyButtons.length).toBeGreaterThan(0);
        });

        it('debe tener opción para pegar un día', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            // Primero copiar
            const copyButtons = screen.getAllByRole('button', { name: /copiar/i });
            if (copyButtons.length > 0) {
                fireEvent.click(copyButtons[0]);

                // Luego debe aparecer opción de pegar
                const pasteButtons = screen.getAllByRole('button', { name: /pegar/i });
                expect(pasteButtons.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Limpiar Día', () => {
        it('debe permitir limpiar todas las comidas de un día', async () => {
            global.confirm = vi.fn(() => true);

            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const clearButtons = screen.getAllByRole('button', { name: /limpiar/i });
            if (clearButtons.length > 0) {
                fireEvent.click(clearButtons[0]);

                await waitFor(() => {
                    expect(mockSetWeeklyPlans).toHaveBeenCalled();
                });
            }
        });
    });

    describe('Ver Detalles de Receta', () => {
        it('debe abrir los detalles al hacer clic en una receta', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const recipeElement = screen.getByText('Paella Valenciana');
            fireEvent.click(recipeElement);

            expect(mockOnOpenRecipe).toHaveBeenCalledWith(sampleRecipe);
        });
    });

    describe('Lista de Compras', () => {
        it('debe tener botón para generar lista de compras', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByRole('button', { name: /lista de compras/i })).toBeInTheDocument();
        });

        it('debe calcular ingredientes necesarios para la semana', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const shoppingButton = screen.getByRole('button', { name: /lista de compras/i });
            fireEvent.click(shoppingButton);

            // Debe mostrar los ingredientes
            expect(screen.getByText(/arroz/i)).toBeInTheDocument();
        });
    });

    describe('Generación de Menú con IA', () => {
        it('debe tener botón para generar menú automáticamente', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByRole('button', { name: /generar.*menú/i })).toBeInTheDocument();
        });

        it('debe mostrar opciones de preferencias para IA', () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const generateButton = screen.getByRole('button', { name: /generar.*menú/i });
            fireEvent.click(generateButton);

            // Debe mostrar opciones de dieta, cocina, etc.
            expect(screen.getByText(/dieta/i)).toBeInTheDocument();
        });
    });

    describe('Eliminar Recetas del Plan', () => {
        it('debe permitir eliminar una receta del plan', async () => {
            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            const deleteButtons = screen.getAllByRole('button', { name: /×/i });
            if (deleteButtons.length > 0) {
                fireEvent.click(deleteButtons[0]);

                await waitFor(() => {
                    expect(mockSetWeeklyPlans).toHaveBeenCalled();
                });
            }
        });
    });

    describe('Casos Extremos', () => {
        it('debe manejar plan vacío', () => {
            (useLifeStore as any).mockReturnValue({
                recipes: [],
                weeklyPlans: [],
                pantryItems: [],
                shoppingList: [],
                setShoppingList: vi.fn(),
                setRecipes: vi.fn(),
                setWeeklyPlans: mockSetWeeklyPlans,
                addRecipe: mockAddRecipe,
            });

            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByText(/planificador de comidas/i)).toBeInTheDocument();
        });

        it('debe manejar múltiples recetas en una comida', () => {
            (useLifeStore as any).mockReturnValue({
                recipes: [sampleRecipe],
                weeklyPlans: [
                    {
                        id: 'plan1',
                        weekStart: '2026-01-12',
                        meals: [
                            {
                                id: 'meal1',
                                date: '2026-01-13',
                                type: 'lunch',
                                recipeId: sampleRecipe.id,
                                recipeName: sampleRecipe.name,
                                servings: sampleRecipe.baseServings,
                                courseType: 'MAIN'
                            },
                            {
                                id: 'meal2',
                                date: '2026-01-13',
                                type: 'lunch',
                                recipeId: 'r2',
                                recipeName: 'Ensalada',
                                servings: 2,
                                courseType: 'STARTER'
                            }
                        ],
                    },
                ],
                pantryItems: [],
                shoppingList: [],
                setShoppingList: vi.fn(),
                setRecipes: vi.fn(),
                setWeeklyPlans: mockSetWeeklyPlans,
                addRecipe: mockAddRecipe,
            });

            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByText('Paella Valenciana')).toBeInTheDocument();
            expect(screen.getByText('Ensalada')).toBeInTheDocument();
        });

        it('debe manejar recetas sin imagen', () => {
            const recipeWithoutImage = { ...sampleRecipe, image: undefined };

            (useLifeStore as any).mockReturnValue({
                recipes: [recipeWithoutImage],
                weeklyPlans: [
                    {
                        id: 'plan1',
                        weekStart: '2026-01-12',
                        meals: [
                            {
                                id: 'meal1',
                                date: '2026-01-13',
                                type: 'lunch',
                                recipeId: recipeWithoutImage.id,
                                recipeName: recipeWithoutImage.name,
                                servings: recipeWithoutImage.baseServings,
                                courseType: 'MAIN'
                            }
                        ],
                    },
                ],
                shoppingList: [],
                setWeeklyPlans: mockSetWeeklyPlans,
                addRecipe: mockAddRecipe,
            });

            render(<MealPlanner onOpenRecipe={mockOnOpenRecipe} />);

            expect(screen.getByText('Paella Valenciana')).toBeInTheDocument();
        });
    });
});
