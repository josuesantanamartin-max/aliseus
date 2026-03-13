/**
 * Screenshot/Image Support for Help Articles
 * This file extends the help article structure to support images
 */

import { HelpArticle } from './helpArticlesData';

export interface ArticleImage {
    src: string; // Path to image file
    alt: {
        ES: string;
        EN: string;
        FR: string;
    };
    caption?: {
        ES: string;
        EN: string;
        FR: string;
    };
}

export interface HelpArticleWithImages extends HelpArticle {
    images?: ArticleImage[];
    featuredImage?: ArticleImage;
}

// Placeholder images - Replace these with actual screenshots from your app
export const articleImages: Record<string, ArticleImage[]> = {
    'import-transactions': [
        {
            src: '/help-screenshots/csv-import-step1.png',
            alt: {
                ES: 'Interfaz de importación CSV mostrando zona de arrastre de archivos',
                EN: 'CSV import interface showing file drag-and-drop zone',
                FR: 'Interface d\'importation CSV montrant la zone de glisser-déposer'
            },
            caption: {
                ES: 'Paso 1: Arrastra tu archivo CSV o haz click para seleccionar',
                EN: 'Step 1: Drag your CSV file or click to select',
                FR: 'Ã‰tape 1: Glissez votre fichier CSV ou cliquez pour sélectionner'
            }
        },
        {
            src: '/help-screenshots/csv-import-step2.png',
            alt: {
                ES: 'Vista previa de datos CSV con mapeo de columnas',
                EN: 'CSV data preview with column mapping',
                FR: 'AperÃ§u des données CSV avec mappage des colonnes'
            },
            caption: {
                ES: 'Paso 2: Revisa la vista previa y mapea las columnas correctamente',
                EN: 'Step 2: Review preview and map columns correctly',
                FR: 'Ã‰tape 2: Examinez l\'aperÃ§u et mappez correctement les colonnes'
            }
        },
        {
            src: '/help-screenshots/csv-import-step3.png',
            alt: {
                ES: 'Confirmación de importación exitosa',
                EN: 'Successful import confirmation',
                FR: 'Confirmation d\'importation réussie'
            },
            caption: {
                ES: 'Paso 3: Confirmación de transacciones importadas',
                EN: 'Step 3: Confirmation of imported transactions',
                FR: 'Ã‰tape 3: Confirmation des transactions importées'
            }
        }
    ],
    'create-budget': [
        {
            src: '/help-screenshots/budget-form.png',
            alt: {
                ES: 'Formulario de creación de presupuesto',
                EN: 'Budget creation form',
                FR: 'Formulaire de création de budget'
            },
            caption: {
                ES: 'Formulario para crear un nuevo presupuesto con categoría y límite',
                EN: 'Form to create a new budget with category and limit',
                FR: 'Formulaire pour créer un nouveau budget avec catégorie et limite'
            }
        },
        {
            src: '/help-screenshots/budget-progress.png',
            alt: {
                ES: 'Vista de progreso de presupuestos',
                EN: 'Budget progress view',
                FR: 'Vue de progression du budget'
            },
            caption: {
                ES: 'Seguimiento visual del gasto actual vs límite del presupuesto',
                EN: 'Visual tracking of current spending vs budget limit',
                FR: 'Suivi visuel des dépenses actuelles vs limite du budget'
            }
        }
    ],
    'meal-planning': [
        {
            src: '/help-screenshots/weekly-planner.png',
            alt: {
                ES: 'Planificador semanal de comidas',
                EN: 'Weekly meal planner',
                FR: 'Planificateur de repas hebdomadaire'
            },
            caption: {
                ES: 'Arrastra recetas al calendario semanal para planificar tus comidas',
                EN: 'Drag recipes to the weekly calendar to plan your meals',
                FR: 'Glissez les recettes vers le calendrier hebdomadaire pour planifier vos repas'
            }
        },
        {
            src: '/help-screenshots/ai-recipe-generator.png',
            alt: {
                ES: 'Generador de recetas con IA',
                EN: 'AI recipe generator',
                FR: 'Générateur de recettes IA'
            },
            caption: {
                ES: 'Describe lo que quieres cocinar y la IA creará una receta completa',
                EN: 'Describe what you want to cook and AI will create a complete recipe',
                FR: 'Décrivez ce que vous voulez cuisiner et l\'IA créera une recette complÃ¨te'
            }
        }
    ],
    'dashboard-customization': [
        {
            src: '/help-screenshots/dashboard-edit-mode.png',
            alt: {
                ES: 'Modo de edición del dashboard',
                EN: 'Dashboard edit mode',
                FR: 'Mode d\'édition du tableau de bord'
            },
            caption: {
                ES: 'Arrastra y redimensiona widgets en modo edición',
                EN: 'Drag and resize widgets in edit mode',
                FR: 'Glissez et redimensionnez les widgets en mode édition'
            }
        },
        {
            src: '/help-screenshots/widget-gallery.png',
            alt: {
                ES: 'Galería de widgets disponibles',
                EN: 'Available widget gallery',
                FR: 'Galerie de widgets disponibles'
            },
            caption: {
                ES: 'Explora y añade widgets desde la galería',
                EN: 'Explore and add widgets from the gallery',
                FR: 'Explorez et ajoutez des widgets depuis la galerie'
            }
        }
    ],
    'privacy-settings': [
        {
            src: '/help-screenshots/privacy-panel.png',
            alt: {
                ES: 'Panel de configuración de privacidad',
                EN: 'Privacy settings panel',
                FR: 'Panneau de paramÃ¨tres de confidentialité'
            },
            caption: {
                ES: 'Gestiona cookies, exporta datos y controla tu privacidad',
                EN: 'Manage cookies, export data and control your privacy',
                FR: 'Gérez les cookies, exportez les données et contrÃ´lez votre confidentialité'
            }
        }
    ],
    'getting-started': [
        {
            src: '/help-screenshots/onboarding-welcome.png',
            alt: {
                ES: 'Pantalla de bienvenida del onboarding',
                EN: 'Onboarding welcome screen',
                FR: 'Ã‰cran de bienvenue de l\'intégration'
            },
            caption: {
                ES: 'El proceso de onboarding te guía paso a paso',
                EN: 'The onboarding process guides you step by step',
                FR: 'Le processus d\'intégration vous guide étape par étape'
            }
        },
        {
            src: '/help-screenshots/dashboard-overview.png',
            alt: {
                ES: 'Vista general de Aliseus Central',
                EN: 'Aliseus Central overview',
                FR: 'Vue d\'ensemble d\'Aliseus Central'
            },
            caption: {
                ES: 'Aliseus Central con widgets personalizables',
                EN: 'Aliseus Central with customizable widgets',
                FR: 'Aliseus Central avec widgets personnalisables'
            }
        }
    ]
};

// Helper function to get images for an article
export const getArticleImages = (articleId: string): ArticleImage[] => {
    return articleImages[articleId] || [];
};

// Helper to check if article has images
export const hasImages = (articleId: string): boolean => {
    return articleImages[articleId] && articleImages[articleId].length > 0;
};
