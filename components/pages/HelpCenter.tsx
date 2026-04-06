import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Search, Book, HelpCircle, FileText, MessageCircle, ChevronRight, BookOpen } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { helpArticlesData, HelpArticle } from '../../data/helpArticlesData';
import FAQSection from './FAQSection';
import ArticleImageGallery from './ArticleImageGallery';
import { getArticleImages, hasImages } from '../../data/helpArticleImages';

const helpArticles = helpArticlesData;

// Legacy data removed - now using helpArticlesData
const legacyArticles: any[] = [
    // Getting Started
    {
        id: 'getting-started',
        title: 'Primeros Pasos con Aliseus',
        category: 'Inicio',
        content: `
# Bienvenido a Aliseus

## ¿Qué es Aliseus?
Aliseus es tu asistente personal integral que combina gestión financiera, planificación de vida y organización del hogar en una sola aplicación potenciada por IA.

## Configuración Inicial
1. **Crea tu cuenta** - Regístrate con email o Google
2. **Completa tu perfil** - Añade información básica
3. **Conecta tus datos** - Importa transacciones o empieza desde cero
4. **Explora los módulos** - Finanzas, Vida, Dashboard

## Módulos Principales
- **💰 Finanzas**: Cuentas, transacciones, presupuestos, metas
- **🏠 Vida**: Recetas, despensa, lista de compras, viajes
- **📊 Dashboard**: Vista general personalizable
- **🎯 Metas**: Objetivos financieros y de vida
        `,
        tags: ['inicio', 'configuración', 'tutorial']
    },
    {
        id: 'import-transactions',
        title: 'Cómo Importar Transacciones desde CSV',
        category: 'Finanzas',
        content: `
# Importar Transacciones desde CSV

## Formatos Soportados
Aliseus acepta archivos CSV de la mayoría de bancos españoles.

## Pasos para Importar
1. Ve a **Finanzas → Transacciones**
2. Click en **Importar CSV**
3. Selecciona tu archivo
4. Revisa la vista previa
5. Confirma la importación

## Formato Recomendado
\`\`\`csv
Fecha,Concepto,Importe,Categoría
2026-02-01,Supermercado,45.50,Comida
2026-02-02,Gasolina,60.00,Transporte
\`\`\`

## Mapeo Automático
El sistema detecta automáticamente:
- Fechas en múltiples formatos
- Categorías basadas en conceptos
- Importes positivos/negativos
        `,
        tags: ['csv', 'importar', 'transacciones', 'banco']
    },
    {
        id: 'create-budget',
        title: 'Crear y Gestionar Presupuestos',
        category: 'Finanzas',
        content: `
# Gestión de Presupuestos

## Crear un Presupuesto
1. Ve a **Finanzas → Presupuestos**
2. Click en **Nuevo Presupuesto**
3. Selecciona categoría (Comida, Transporte, etc.)
4. Define límite mensual
5. Guarda

## Tipos de Presupuesto
- **Mensual**: Se reinicia cada mes
- **Anual**: Límite para todo el año

## Seguimiento
- **Barra de progreso**: Visual del gasto actual
- **Alertas**: Notificaciones al 80% y 100%
- **Histórico**: Comparación con meses anteriores

## Consejos
- Empieza con categorías grandes
- Ajusta según tu historial
- Usa la IA para sugerencias
        `,
        tags: ['presupuesto', 'límites', 'categorías']
    },
    {
        id: 'meal-planning',
        title: 'Planificación de Comidas',
        category: 'Vida',
        content: `
# Planificación de Comidas

## Crear un Plan Semanal
1. Ve a **Vida → Cocina**
2. Click en **Plan Semanal**
3. Arrastra recetas a cada día
4. Genera lista de compras automática

## Generar Recetas con IA
1. Click en **Generar Receta**
2. Describe lo que quieres
3. La IA crea la receta completa
4. Guarda en tu colección

## Gestión de Despensa
- Añade ingredientes que tienes
- Marca cuando se acaben
- Recibe sugerencias de recetas

## Lista de Compras
- Generada automáticamente del plan
- Agrupa por categorías
- Calcula precios estimados
        `,
        tags: ['recetas', 'cocina', 'despensa', 'ia']
    },
    {
        id: 'retirement-planning',
        title: 'Planificador de Jubilación',
        category: 'Finanzas',
        content: `
# Planificador de Jubilación

## Configurar tu Plan
1. Ve a **Finanzas → Jubilación**
2. Ingresa datos:
   - Edad actual
   - Edad de retiro deseada
   - Ahorros actuales
   - Aportación mensual
3. Ajusta retorno esperado e inflación

## Interpretación de Resultados
- **Capital Acumulado**: Total al retirarte
- **Ingreso Mensual**: Sostenible sin tocar capital
- **Años de Cobertura**: Duración de tus ahorros

## Recomendaciones
El sistema te sugiere:
- Aumentar aportaciones
- Ajustar edad de retiro
- Optimizar inversiones
        `,
        tags: ['jubilación', 'ahorro', 'planificación']
    },
    {
        id: 'privacy-settings',
        title: 'Configuración de Privacidad',
        category: 'Configuración',
        content: `
# Privacidad y Datos

## Gestión de Cookies
1. Ve a **Configuración → Privacidad**
2. Ajusta preferencias:
   - Cookies esenciales (siempre activas)
   - Analytics (opcional)
   - Marketing (opcional)

## Exportar tus Datos
1. **Configuración → Privacidad**
2. Click en **Exportar Datos**
3. Descarga archivo JSON
4. Incluye todas tus transacciones, recetas, etc.

## Eliminar Cuenta
1. **Configuración → Privacidad**
2. **Eliminar Cuenta**
3. Período de gracia de 30 días
4. Cancelable durante ese tiempo

## Tus Derechos GDPR
- Acceso a tus datos
- Rectificación
- Eliminación
- Portabilidad
- Oposición al procesamiento
        `,
        tags: ['privacidad', 'gdpr', 'datos', 'cookies']
    },
    {
        id: 'dashboard-customization',
        title: 'Personalizar tu Dashboard',
        category: 'Dashboard',
        content: `
# Personalización del Dashboard

## Modo Edición
1. Click en **Editar Dashboard**
2. Arrastra widgets para reordenar
3. Redimensiona widgets
4. Guarda cambios

## Añadir Widgets
1. Click en **Galería de Widgets**
2. Explora widgets disponibles:
   - Resumen Financiero
   - Salud Financiera
   - Próximos Pagos
   - Metas Activas
   - Plan Semanal
3. Click para añadir

## Layouts Predefinidos
- **Finanzas**: Enfocado en dinero
- **Vida**: Recetas y hogar
- **Balanceado**: Mix de todo

## Guardar Layouts
- Guarda múltiples configuraciones
- Cambia entre layouts fácilmente
- Comparte con familia (próximamente)
        `,
        tags: ['dashboard', 'widgets', 'personalización']
    },
    {
        id: 'troubleshooting',
        title: 'Solución de Problemas Comunes',
        category: 'Ayuda',
        content: `
# Solución de Problemas

## La app no carga
1. Limpia caché del navegador
2. Verifica conexión a internet
3. Intenta en modo incógnito
4. Contacta soporte si persiste

## No puedo importar CSV
- Verifica formato del archivo
- Asegúrate que sea .csv
- Revisa que tenga columnas: Fecha, Concepto, Importe
- Prueba con archivo de ejemplo

## Mis datos no se guardan
- Verifica que estés autenticado
- Revisa conexión a internet
- Espera a que aparezca confirmación
- Recarga la página

## La IA no responde
- Verifica que tengas créditos
- Revisa tu conexión
- Intenta con prompt más simple
- Contacta soporte

## Contacto
- Email: support@aliseus.com
- Chat en vivo (próximamente)
        `,
        tags: ['problemas', 'errores', 'ayuda', 'soporte']
    }
];

export const HelpCenter: React.FC = () => {
    const { language } = useUserStore();
    const lang = language as 'ES' | 'EN' | 'FR';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
    const [activeTab, setActiveTab] = useState<'articles' | 'faq'>('articles');

    const filteredArticles = helpArticles.filter(article => {
        const matchesSearch =
            article.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'Todos' || article.category[lang] === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories from articles
    const categories = ['Todos', ...Array.from(new Set(helpArticles.map(a => a.category[lang])))];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-aliseus-600 to-aliseus-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <HelpCircle className="w-10 h-10" />
                        <h1 className="text-4xl font-bold">Centro de Ayuda</h1>
                    </div>
                    <p className="text-aliseus-100 text-lg mb-6">
                        Encuentra respuestas, guías y tutoriales para aprovechar al máximo Aliseus
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar artículos, guías, tutoriales..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-aliseus-300 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => {
                            setActiveTab('articles');
                            setSelectedArticle(null);
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'articles'
                            ? 'bg-aliseus-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Book className="w-5 h-5" />
                            {lang === 'ES' ? 'Artículos' : lang === 'EN' ? 'Articles' : 'Articles'}
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('faq');
                            setSelectedArticle(null);
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'faq'
                            ? 'bg-aliseus-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" />
                            FAQ
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categorías</h3>
                            <div className="space-y-1">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setSelectedArticle(null);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category
                                            ? 'bg-aliseus-100 dark:bg-aliseus-900 text-aliseus-700 dark:text-aliseus-300 font-medium'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            {/* Quick Links */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Enlaces Rápidos</h3>
                                <div className="space-y-2">
                                    <a href="/legal/privacy" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-aliseus-600 dark:hover:text-aliseus-400">
                                        <FileText className="w-4 h-4" />
                                        Política de Privacidad
                                    </a>
                                    <a href="/legal/terms" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-aliseus-600 dark:hover:text-aliseus-400">
                                        <FileText className="w-4 h-4" />
                                        Términos de Servicio
                                    </a>
                                    <a href="mailto:support@aliseus.com" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-aliseus-600 dark:hover:text-aliseus-400">
                                        <MessageCircle className="w-4 h-4" />
                                        Contactar Soporte
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {selectedArticle ? (
                            // Article View
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-aliseus-600 dark:text-aliseus-400 hover:underline mb-4 flex items-center gap-1"
                                >
                                    ← Volver a artículos
                                </button>
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 bg-aliseus-100 dark:bg-aliseus-900 text-aliseus-700 dark:text-aliseus-300 rounded-full text-sm font-medium mb-2">
                                        {selectedArticle.category[lang]}
                                    </span>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {selectedArticle.title[lang]}
                                    </h2>
                                </div>

                                {/* Article Images */}
                                {hasImages(selectedArticle.id) && (
                                    <ArticleImageGallery
                                        images={getArticleImages(selectedArticle.id)}
                                        language={lang}
                                    />
                                )}

                                <div className="prose dark:prose-invert max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedArticle.content[lang].replace(/\n/g, '<br/>')) }} />
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        ¿Te resultó útil este artículo? <a href="mailto:support@aliseus.com" className="text-aliseus-600 dark:text-aliseus-400 hover:underline">Envíanos tu feedback</a>
                                    </p>
                                </div>
                            </div>
                        ) : activeTab === 'faq' ? (
                            // FAQ Section
                            <FAQSection />
                        ) : (
                            // Articles List
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {selectedCategory === 'Todos' ? 'Todos los Artículos' : selectedCategory}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {filteredArticles.length} artículo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    {filteredArticles.map(article => (
                                        <button
                                            key={article.id}
                                            onClick={() => setSelectedArticle(article)}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow text-left group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Book className="w-5 h-5 text-aliseus-600 dark:text-aliseus-400" />
                                                        <span className="text-sm font-medium text-aliseus-600 dark:text-aliseus-400">
                                                            {article.category[lang]}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-aliseus-600 dark:group-hover:text-aliseus-400 transition-colors">
                                                        {article.title[lang]}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {article.tags.map(tag => (
                                                            <span
                                                                key={tag}
                                                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-aliseus-600 dark:group-hover:text-aliseus-400 transition-colors flex-shrink-0 ml-4" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {filteredArticles.length === 0 && (
                                    <div className="text-center py-12">
                                        <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            No se encontraron artículos
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Intenta con otros términos de búsqueda o categoría
                                        </p>
                                        <a
                                            href="mailto:support@aliseus.com"
                                            className="inline-flex items-center gap-2 text-aliseus-600 dark:text-aliseus-400 hover:underline"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Contactar Soporte
                                        </a>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
