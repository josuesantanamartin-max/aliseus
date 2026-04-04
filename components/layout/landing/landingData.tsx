import {
    PiggyBank, Utensils, Heart, Calendar, ArrowRight, Check,
    Zap, Shield, Play, Home, Plane, Lock, Sparkles,
    Layers, ArrowLeft, ChevronRight, Globe, Users, ChevronDown, TrendingDown, CreditCard, LayoutDashboard,
    Smartphone, BarChart3, Fingerprint, Cloud, LogIn
} from 'lucide-react';
import React from 'react';
import { Language } from '../../../types';

type ProductKey = 'finance' | 'vida' | 'dashboard';

// Helper components
export const WalletIconMock = ({ className }: { className?: string }) => <CreditCard className={className} />;

export const LANDING_TEXTS = {
    ES: {
        heroBadge: "Aliseus: La app definitiva para familias",
        heroStarBadge: "BENEFICIO ESTRELLA",
        heroStarBenefit: "Anticipa cuándo te va a faltar dinero antes de que pase",
        heroTitle: "Aliseus",
        heroSubtitle: "Tu panel diario con saldo, facturas, menú y tareas en una sola vista.\nDeja de usar 10 apps diferentes. Pásate al sistema que lo conecta todo.",
        ctaStart: "Solicitar Acceso (Beta Privada)",
        ctaDemo: "Probar Demo (Sin Cuenta)",
        pillarsTitle: "El Ecosistema Aliseus",
        pillarsSubtitle: "No son apps sueltas. Son módulos conectados por un cerebro central.",
        ecosystemTag: "Sincronización Total",
        ecosystemTitle: "Tu centro de mando\nhiper-conectado.",
        ecosystemDesc: "Imagina que tu calendario de cenas sabe tu presupuesto de supermercado. Aliseus lo hace posible. Una visión 360° de tu vida en tiempo real.",
        benefitsTitle: "Diseñado para la Tranquilidad Mental",
        benefitsSubtitle: "Recupera el control de tu tiempo y tu dinero con una herramienta profesional.",
        pricingTitle: "Planes transparentes y éticos",
        pricingSubtitle: "Nacimos para ayudar a las familias a ahorrar, por eso ofrecemos precios radicalmente accesibles comparados con otras apps.",
        pricingMissionTitle: "Precios pensados para familias reales",
        pricingMissionDesc: "La mayoría de apps de finanzas o menús cuestan tanto que acaban siendo otro gasto más. Aliseus nació con una idea clara: que mejorar tus finanzas no signifique recortar en tus hijos ni en vuestra vida diaria. Por eso estos son nuestros precios estándar, diseñados para ser sostenibles y honestos.",
        pricingFairPrice: "Precios éticos para siempre",
        pricingStableConditions: "Estas son nuestras tarifas estándar: honestas, sostenibles y pensadas para no subir nunca.",
        pricingSavingsConnection: "Si Aliseus no te ayuda a ahorrar mucho más de lo que cuesta al año, no tiene sentido que exista.",
        pricingBetaAdvantage: "Ventaja Beta: Los usuarios de la beta cerrada recibiréis beneficios exclusivos adicionales por ayudarnos a pulir la herramienta.",
        pricingGoal: "Nuestro objetivo es que cada euro que inviertas en Aliseus vuelva multiplicado en tranquilidad y ahorro.",
        promoBadge: "🔥 Beta Privada: 14 días gratuitos con acceso completo",

        // Magic Connection (AI Optimization Moat)
        magicTitle: "La Magia de la Conexión",
        magicSubtitle: "El único sistema que une tu nevera, tu menú y tu bolsillo.",
        magicExample: "Aliseus detectó que tu leche y el salmón caducan mañana, generó 3 recetas para aprovecharlos y ahorró 12€ en tu próxima compra.",
        magicTag: "Ahorro Automático",

        // Billing Toggles
        billingMonthly: "Mensual",
        billingAnnual: "Anual",
        savePercent: "Pago Anual Seguro",

        // TIER 1: TRIAL
        trialPlan: "Beta Privada",
        trialPrice: "0€",
        trialPeriod: "14 días",
        trialDesc: "Acceso total para probar la herramienta en profundidad.",
        trialCta: "Entrar a la Beta",

        // TIER 2: PERSONAL
        personalPlan: "Personal",
        personalPriceMonthly: "2,99€",
        personalPriceAnnual: "19,99€",
        personalDesc: "Poder de organización total para un solo usuario.",
        personalCta: "Reservar Personal",

        // TIER 3: FAMILY
        familyPlan: "Familia",
        familyPriceMonthly: "3,99€",
        familyPriceAnnual: "24,99€",
        familyDesc: "Hasta 5 miembros con entorno colaborativo completo.",
        familyCta: "Reservar Familia",

        // Features
        featUser1: "1 Usuario",
        featUser5: "Hasta 5 Usuarios",
        featAccess: "Acceso Total",
        featVault: "Bóveda Segura",
        featShared: "Espacios Compartidos",
        featJunior: "Modo Junior",
        featPriority: "Soporte Prioritario",

        btnEnter: "Entrar",
        backToSuite: "Volver al Sistema",
        startWith: "Explorar",
        navPillars: "Módulos",
        navEco: "Dashboard",
        navPricing: "Precios",
        perYear: "/ año",
        perMonth: "/ mes",
        singlePayment: "Pago Anual Único",
        loginGoogle: "Continuar con Google",
        loginApple: "Continuar con Apple",
        footerPrivacy: "Privacidad",
        footerTerms: "Términos",
        footerTwitter: "Twitter",

        // Target Audience Section
        audienceTitle: "¿Para quién es Aliseus?",
        audienceSubtitle: "Tres perfiles, una misma búsqueda: la tranquilidad.",
        audienceProfiles: [
            {
                id: "pareja",
                title: "Pareja Joven",
                tagline: "Sincronía total",
                desc: "Gestionad vuestros gastos compartidos y planes de futuro sin discusiones. Aliseus conecta vuestras metas y vuestra nevera.",
                features: ["Gastos compartidos 50/50 o proporcional", "Menús para dos sin desperdicio", "Ahorro para vuestro primer gran viaje"]
            },
            {
                id: "familia",
                title: "Familia con Hijos",
                tagline: "Control absoluto",
                desc: "Desde el presupuesto escolar hasta el menú semanal para cinco. Mantén el caos a raya con el modo familiar colaborativo.",
                features: ["Gestión de hasta 5 miembros", "Calendario y despensa compartida", "Educación financiera para los niños"]
            },
            {
                id: "autonomo",
                title: "Autónomo / Freelance",
                tagline: "Claridad profesional",
                desc: "Separa de una vez tus gastos personales de los profesionales. Aliseus te ayuda a proyectar tus impuestos y tus ahorros.",
                features: ["Separación de flujos de caja", "Provisión para impuestos", "Análisis de rentabilidad personal"]
            },
        ],

        // AI Magic Savings
        magicSavingsTitle: "Ahorro Estimado",
        magicSavingsValue: "Hasta 400€/mes",
        magicSavingsDetail: "Optimización integral de facturas + desperdicio cero",

        // Life Module (LandingLife)
        lifeTitle: "Vida",
        lifeHeroSub: "Automatiza tu hogar y diseña experiencias memorables",
        lifeHeroDesc: "Porque la vida es para vivirla, no para gestionarla. Aliseus se encarga de la logística para que tú disfrutes de los momentos.",
        lifeStats: ["Características", "Menos Desperdicio", "Ahorradas/Semana", "Planificación Inteligente"],
        kitchenLabel: "Cocina Inteligente",
        kitchenTitle: "Del caos culinario a la organización total",
        kitchenSub: "Planificación de menús con IA, gestión de despensa, listas automáticas y mucho más.",
        kitchenFeatures: [
            { title: "Planificador IA de Menús", desc: "Genera menús semanales completos basados en tus preferencias, restricciones dietéticas y presupuesto. En segundos." },
            { title: "Biblioteca de Recetas", desc: "Una biblioteca en crecimiento con búsqueda avanzada por ingredientes, tiempo de preparación, dificultad y tipo de cocina." },
            { title: "Inventario de Despensa", desc: "Registra lo que tienes en casa. Aliseus te sugiere recetas basadas en ingredientes disponibles." },
            { title: "Lista de Compra Automática", desc: "Añade una receta al menú y los ingredientes faltantes se agregan a tu lista." },
            { title: "Alertas de Caducidad", desc: "Notificaciones cuando los productos están próximos a caducar. Sugerencias para aprovecharlos." },
            { title: "Información Nutricional", desc: "Calorías, macros y micronutrientes calculados automáticamente para cada receta." },
            { title: "Programación de Meal Prep", desc: "Organiza sesiones de preparación de comidas. Optimiza tu tiempo cocinando en lotes." },
            { title: "Preferencias Familiares", desc: "Gestiona alergias, intolerancias y preferencias. Menús personalizados para todos." },
            { title: "Coste por Comida", desc: "Calcula el precio real de cada receta basándose en ingredientes. Optimiza tu presupuesto." },
            { title: "Gestión de Sobras", desc: "Registra sobras y recibe sugerencias creativas para reutilizarlas. Reduce el desperdicio." }
        ],
        lifeLabel: "Gestión de Vida",
        lifeSectionTitle: "Organiza todo lo que importa",
        lifeSectionSub: "Viajes, documentos importantes, calendario familiar y más. Todo centralizado y seguro.",
        lifeFeatures: [
            { title: "Viajes con IA", desc: "Itinerarios completos con presupuesto y documentos integrados." },
            { title: "Bóveda Encriptada", desc: "Tus contratos y pasaportes, seguros y a mano." },
            { icon: Calendar, title: "Calendario Familiar", desc: "Eventos, cumpleaños y citas de toda la familia." },
            { title: "Dashboard Aura", desc: "Tu día resumido: saldo, próximas facturas y menú de hoy." }
        ],
        lifeCta: "Simplificar mi Día a Día",
        useCasesTitle: "Historias de Transformación",
        useCasesSub: "Descubre cómo Aliseus ha simplificado la rutina diaria de personas como tú.",
        workflowTitle: "De Nevera Vacía a Menú Completo en 3 Clics",
        workflowSub: "El flujo de trabajo más simple que hayas visto",
        lifeFooterTitle: "Diseña la vida que quieres vivir",
        lifeFooterSub: "Aliseus se encarga del caos logístico para que tú disfrutes de los momentos que realmente importan.",
        lifeFooterPrice: "Después, desde 2,99€/mes • Cancela cuando quieras"
    },
    EN: {
        heroBadge: "Aliseus: The ultimate app for families",
        heroStarBadge: "STAR BENEFIT",
        heroStarBenefit: "Anticipate when you will run out of money before it happens",
        heroTitle: "Aliseus",
        heroSubtitle: "Your daily dashboard with balance, bills, menu, and tasks in one view.\nStop using 10 different apps. Switch to the system that connects it all.",
        ctaStart: "Request Access (Private Beta)",
        ctaDemo: "Try Demo (No Account)",
        pillarsTitle: "The Aliseus Ecosystem",
        pillarsSubtitle: "Not just standalone apps. They are modules connected by a central brain.",
        ecosystemTag: "Total Sync",
        ecosystemTitle: "Your hyper-connected\ncommand center.",
        ecosystemDesc: "Imagine your dinner calendar knowing your grocery budget. Aliseus makes it possible. A 360° view of your life in real-time.",
        benefitsTitle: "Designed for Peace of Mind",
        benefitsSubtitle: "Reclaim control of your time and money with a professional tool.",
        pricingTitle: "Transparent and Ethical Plans",
        pricingSubtitle: "We were born to help families save, which is why we offer radically accessible prices compared to other apps.",
        pricingMissionTitle: "Pricing designed for real families",
        pricingMissionDesc: "Most finance or menu apps cost so much they end up being just another expense. Aliseus was born with a clear idea: that improving your finances shouldn't mean cutting back on your children or your daily life. That's why these are our standard prices, designed to be sustainable and honest.",
        pricingFairPrice: "Ethical pricing forever",
        pricingStableConditions: "These are our standard rates: honest, sustainable, and designed to never increase.",
        pricingSavingsConnection: "If Aliseus doesn't help you save much more than it costs per year, it shouldn't exist.",
        pricingBetaAdvantage: "Beta Advantage: Join now to receive additional exclusive benefits as a founding user.",
        pricingGoal: "Our goal is that every euro you invest in Aliseus returns multiplied in peace and savings.",
        promoBadge: "🔥 Private Beta: 14 days free with full access",

        // Magic Connection (AI Optimization Moat)
        magicTitle: "The Magic of Connection",
        magicSubtitle: "The only system that unites your fridge, your menu, and your wallet.",
        magicExample: "Aliseus detected that your milk and salmon expire tomorrow, generated 3 recipes to use them, and saved you €12 on your next purchase.",
        magicTag: "Auto-Savings",

        // Billing Toggles
        billingMonthly: "Monthly",
        billingAnnual: "Annual",
        savePercent: "Secure Annual Payment",

        // TIER 1: TRIAL
        trialPlan: "Private Beta",
        trialPrice: "0€",
        trialPeriod: "14 days",
        trialDesc: "Full access to test the tool extensively.",
        trialCta: "Enter Beta",

        // TIER 2: PERSONAL
        personalPlan: "Personal",
        personalPriceMonthly: "2.99€",
        personalPriceAnnual: "19.99€",
        personalDesc: "Total organization power for a single user.",
        personalCta: "Pre-order Personal",

        // TIER 3: FAMILY
        familyPlan: "Family",
        familyPriceMonthly: "3.99€",
        familyPriceAnnual: "24.99€",
        familyDesc: "Up to 5 members with full collaborative environment.",
        familyCta: "Pre-order Family",

        // Features
        featUser1: "1 User",
        featUser5: "Up to 5 Users",
        featAccess: "Full Access",
        featVault: "Secure Vault",
        featShared: "Shared Spaces",
        featJunior: "Junior Mode",
        featPriority: "Priority Support",

        btnEnter: "Enter",
        backToSuite: "Back to System",
        startWith: "Explore",
        navPillars: "Modules",
        navEco: "Dashboard",
        navPricing: "Pricing",
        perYear: "/ year",
        perMonth: "/ month",
        singlePayment: "Single Annual Payment",
        loginGoogle: "Continue with Google",
        loginApple: "Continue with Apple",
        footerPrivacy: "Privacy",
        footerTerms: "Terms",
        footerTwitter: "Twitter",

        // Target Audience Section
        audienceTitle: "Who is Aliseus for?",
        audienceSubtitle: "Three profiles, one search: peace of mind.",
        audienceProfiles: [
            {
                id: "couple",
                title: "Young Couple",
                tagline: "Total Sync",
                desc: "Manage your shared expenses and future plans without arguments. Aliseus connects your goals and your fridge.",
                features: ["50/50 or proportional shared expenses", "Waste-free menus for two", "Savings for your first big trip"]
            },
            {
                id: "family",
                title: "Family with Kids",
                tagline: "Absolute Control",
                desc: "From school budgets to weekly menus for five. Keep chaos at bay with collaborative family mode.",
                features: ["Management for up to 5 members", "Shared calendar and pantry", "Financial education for children"]
            },
            {
                id: "autonomo",
                title: "Self-employed / Freelance",
                tagline: "Professional Clarity",
                desc: "Separate your personal from professional expenses once and for all. Aliseus helps you project taxes and savings.",
                features: ["Cash flow separation", "Tax provisioning", "Personal profitability analysis"]
            },
        ],

        // AI Magic Savings
        magicSavingsTitle: "Estimated Savings",
        magicSavingsValue: "Up to 400€/month",
        magicSavingsDetail: "Integral bill optimization + zero waste",

        // Life Module (LandingLife)
        lifeTitle: "Life",
        lifeHeroSub: "Automate your home and design memorable experiences",
        lifeHeroDesc: "Because life is for living, not for managing. Aliseus takes care of the logistics so you can enjoy the moments.",
        lifeStats: ["Features", "Less Waste", "Saved/Week", "Smart Planning"],
        kitchenLabel: "Smart Kitchen",
        kitchenTitle: "From culinary chaos to total organization",
        kitchenSub: "AI menu planning, pantry management, automatic lists and more.",
        kitchenFeatures: [
            { title: "AI Menu Planner", desc: "Generate complete weekly menus based on your preferences, dietary restrictions and budget. In seconds." },
            { title: "Recipe Library", desc: "A growing library with search by ingredients, time, difficulty and cuisine." },
            { title: "Pantry Inventory", desc: "Track your inventory. Aliseus suggests recipes based on available items." },
            { title: "Auto Shopping List", desc: "Add recipes to your menu and missing items are automatically listed." },
            { title: "Expiry Alerts", desc: "Notifications when items are near expiry. Usage suggestions included." },
            { title: "Nutritional Info", desc: "Calories, macros and micronutrients calculated automatically." },
            { title: "Meal Prep Scheduling", desc: "Organize meal prep sessions and optimize batch cooking." },
            { title: "Family Preferences", desc: "Manage allergies and preferences. Custom menus for everyone." },
            { title: "Cost per Meal", desc: "Real price per recipe based on ingredients. Budget optimization." },
            { title: "Leftover Management", desc: "Track leftovers and get creative reuse suggestions. Zero waste." }
        ],
        lifeLabel: "Life Management",
        lifeSectionTitle: "Organize everything that matters",
        lifeSectionSub: "Travel, documents, family calendar and more. Centralized and secure.",
        lifeFeatures: [
            { title: "AI Travel", desc: "Full itineraries with budget and integrated documents." },
            { title: "Encrypted Vault", desc: "Contracts and passports, secure and handy." },
            { icon: Calendar, title: "Family Calendar", desc: "Events, birthdays and appointments." },
            { title: "Aura Dashboard", desc: "Your day: balance, upcoming bills and today's menu." }
        ],
        lifeCta: "Simplify My Daily Routine",
        useCasesTitle: "Transformation Stories",
        useCasesSub: "Discover how Aliseus has simplified day-to-day for people like you.",
        workflowTitle: "Empty Fridge to Full Menu in 3 Clicks",
        workflowSub: "The simplest workflow you've ever seen",
        lifeFooterTitle: "Design the life you want to live",
        lifeFooterSub: "Aliseus handles the chaos so you can enjoy what matters.",
        lifeFooterPrice: "Afterwards, from 2.99€/month • Cancel anytime"
    },
    FR: {
        heroBadge: "Aliseus : L'app ultime pour les familles",
        heroStarBadge: "BÉNÉFICE STAR",
        heroStarBenefit: "Anticipez les manques de liquidités avant qu'ils n'arrivent",
        heroTitle: "Aliseus",
        heroSubtitle: "Votre tableau de bord quotidien : solde, factures, menu et tâches en une vue.\nArrêtez d'utiliser 10 apps. Passez au système qui connecte tout.",
        ctaStart: "Demander l'Accès (Bêta Privée)",
        ctaDemo: "Tester la Démo (Sans Compte)",
        pillarsTitle: "L'Écosystème Aliseus",
        pillarsSubtitle: "Pas seulement des apps séparées. Des modules connectés par un cerveau central.",
        ecosystemTag: "Sincronisation Totale",
        ecosystemTitle: "Votre centre de commande\nhyper-connecté.",
        ecosystemDesc: "Imaginez que votre calendrier de repas connaisse votre budget courses. Aliseus le rend possible. Une vision à 360° de votre vie en temps réel.",
        benefitsTitle: "Conçu pour la Sérénité Mentale",
        benefitsSubtitle: "Reprenez le contrôle de votre temps et de votre argent avec un outil professionnel.",
        pricingTitle: "Plans transparents et éthiques",
        pricingSubtitle: "Nous sommes nés pour aider les familles à économiser, c'est pourquoi nous offrons des prix radicalement accessibles.",
        pricingMissionTitle: "Des prix pensés pour les vraies familles",
        pricingMissionDesc: "La plupart des apps coûtent si cher qu'elles deviennent une dépense de plus. Aliseus est né avec une idée claire : que vos finances ne signifient pas couper dans le budget de vos enfants. Voici nos prix standard, durables et honnêtes.",
        pricingFairPrice: "Prix éthiques pour toujours",
        pricingStableConditions: "Voici nos tarifs standard : honnêtes, durables et conçus pour ne jamais augmenter.",
        pricingBetaAdvantage: "Avantage Bêta : Les utilisateurs de la bêta recevront des bénéfices exclusifs supplémentaires pour nous aider à polir l'outil.",
        pricingGoal: "Notre objectif est que chaque euro investi revienne multiplié en sérénité et économies.",
        promoBadge: "🔥 Bêta Privée : 14 jours gratuits avec accès complet",

        // Magic Connection (AI Optimization Moat)
        magicTitle: "La Magie de la Connexion",
        magicSubtitle: "Le seul système qui unit votre frigo, votre menu et votre poche.",
        magicExample: "Aliseus a détecté que votre lait périme demain, a généré 3 recettes et vous a fait économiser 12€.",
        magicTag: "Économies Automatiques",

        // Billing Toggles
        billingMonthly: "Mensuel",
        billingAnnual: "Annuel",
        savePercent: "Paiement Annuel Sécurisé",

        // TIER 1: TRIAL
        trialPlan: "Bêta Privada",
        trialPrice: "0€",
        trialPeriod: "14 jours",
        trialDesc: "Accès total pour tester l'outil en profondeur.",
        trialCta: "Entrer en Bêta",

        // TIER 2: PERSONAL
        personalPlan: "Personnel",
        personalPriceMonthly: "2,99€",
        personalPriceAnnual: "19,99€",
        personalDesc: "Puissance d'organisation totale pour un seul utilisateur.",
        personalCta: "Réserver Personnel",

        // TIER 3: FAMILY
        familyPlan: "Famille",
        familyPriceMonthly: "3,99€",
        familyPriceAnnual: "24,99€",
        familyDesc: "Jusqu'à 5 membres avec environnement collaboratif.",
        familyCta: "Réserver Famille",

        // Features
        featUser1: "1 Utilisateur",
        featUser5: "Jusqu'à 5 Utilisateurs",
        featAccess: "Accès Total",
        featVault: "Coffre Sécurisé",
        featShared: "Espaces Partagés",
        featJunior: "Mode Junior",
        featPriority: "Support Prioritaire",

        btnEnter: "Entrer",
        backToSuite: "Retour au Système",
        startWith: "Explorer",
        navPillars: "Modules",
        navEco: "Dashboard",
        navPricing: "Tarifs",
        perYear: "/ an",
        perMonth: "/ mois",
        singlePayment: "Paiement Annuel Unique",
        loginGoogle: "Continuer avec Google",
        loginApple: "Continuer avec Apple",
        footerPrivacy: "Confidentialité",
        footerTerms: "Conditions",
        footerTwitter: "Twitter",

        // Target Audience Section
        audienceTitle: "Pour qui est Aliseus ?",
        audienceSubtitle: "Trois profils, une seule quête : la sérénité.",
        audienceProfiles: [
            {
                id: "pareja",
                title: "Jeune Couple",
                tagline: "Synchronie totale",
                desc: "Gérez vos dépenses partagées sans disputes. Aliseus connecte vos objectifs et votre frigo.",
                features: ["Dépenses partagées 50/50", "Menus sans gaspillage", "Épargne voyage"]
            },
            {
                id: "familia",
                title: "Famille avec Enfants",
                tagline: "Contrôle absolu",
                desc: "Du budget scolaire au menu pour cinq. Gardez le chaos à distance.",
                features: ["Jusqu'à 5 membres", "Calendrier partagé", "Éducation financière"]
            },
            {
                id: "autonomo",
                title: "Indépendant / Freelance",
                tagline: "Clarté professionnelle",
                desc: "Séparez vos dépenses perso et pro. Aliseus projette vos impôts.",
                features: ["Séparation des flux", "Provision impôts", "Analyse rentabilité"]
            },
        ],

        // AI Magic Savings
        magicSavingsTitle: "Économies Estimées",
        magicSavingsValue: "Jusqu'à 400€/mois",
        magicSavingsDetail: "Optimisation des factures + zéro gaspillage",

        // Life Module (LandingLife)
        lifeTitle: "Vie",
        lifeHeroSub: "Automatisez votre foyer",
        lifeHeroDesc: "Aliseus s'occupe de la logistique pour que vous profitiez des moments.",
        lifeStats: ["Fonctions", "Zéro Gaspi", "Heures/Semaine", "Planif Intelligente"],
        kitchenLabel: "Cuisine Intelligente",
        kitchenTitle: "Organisation totale",
        kitchenSub: "Menus IA, gestion de garde-manger et plus.",
        kitchenFeatures: [
            { title: "Menus IA", desc: "Menus complets basés sur vos goûts et budget." },
            { title: "Recettes", desc: "Bibliothèque avec filtres intelligents." },
            { title: "Garde-manger", desc: "Suggestions basées sur ce que vous avez." },
            { title: "Courses", desc: "Listes auto générées." },
            { title: "Alertes", desc: "Notifications de caducité." },
            { title: "Nutrition", desc: "Macros calculés auto." },
            { title: "Meal Prep", desc: "Gagnez du temps en cuisinant par lots." },
            { title: "Famille", desc: "Préférences et allergies gérées." },
            { title: "Coût", desc: "Prix réel par recette." },
            { title: "Restes", desc: "Réutilisez vos restes de manière créative." }
        ],
        lifeLabel: "Gestion de Vie",
        lifeSectionTitle: "Organisez l'essentiel",
        lifeSectionSub: "Voyages, documents, calendrier.",
        lifeFeatures: [
            { title: "Voyages IA", desc: "Itinéraires complets." },
            { title: "Coffre", desc: "Documents sécurisés." },
            { title: "Calendrier", desc: "Événements familiaux." },
            { title: "Aura", desc: "Votre résumé quotidien." }
        ],
        lifeCta: "Simplifier ma vie",
        useCasesTitle: "Témoignages",
        useCasesSub: "Découvrez Aliseus à travers nos utilisateurs.",
        workflowTitle: "3 clics",
        workflowSub: "Simple et efficace",
        lifeFooterTitle: "Vivez la vie que vous voulez",
        lifeFooterSub: "On gère le chaos.",
        lifeFooterPrice: "Dès 2,99€/mois • Sans engagement"
    }
};

export const PRODUCT_DETAILS_BY_LANG: Record<Language, Record<ProductKey, any>> = {
    ES: {
        finance: {
            title: "Módulo Finanzas",
            subtitle: "Patrimonio Inteligente",
            description: "No es solo un control de gastos. Es tu CFO personal.",
            features: [
                { title: "Smart Categorization", desc: "La IA entiende si es 'Ocio' o 'Necesidad' automáticamente." },
                { title: "Deuda Zero", desc: "Estrategias Avalancha y Bola de Nieve para eliminar pasivos." },
                { title: "Simulador de Futuro", desc: "¿Qué pasa si invierto 100€ más al mes? Aliseus te lo dice." },
                { title: "Límites Reales", desc: "Presupuestos con IA que se adaptan a tu día a día." },
                { title: "Importación CSV", desc: "Importa extractos bancarios y vincúlalos a tus cuentas." },
                { title: "Análisis Predictivo", desc: "Proyecciones a 3, 6 y 12 meses de tu flujo de caja." },
                { title: "Simulador de Jubilación", desc: "Calcula cuánto necesitas ahorrar para tu retiro." }
            ],
            integrations: ["Proyecta impacto de viajes en tu ahorro", "Sincroniza tickets de compra de cocina", "Calcula coste real de cada receta"]
        },
        vida: {
            title: "Módulo Vida",
            subtitle: "Tu Hogar en Autopilot",
            description: "Recupera 5 horas a la semana automatizando las tareas invisibles.",
            features: [
                { title: "Chef IA", desc: "Genera menús semanales basados en lo que tienes en la nevera." },
                { title: "Despensa Inteligente", desc: "Inventario con alertas de caducidad y sugerencias de recetas." },
                { title: "Lista de Compra", desc: "Se genera automáticamente al añadir recetas al menú." },
                { title: "Viajes con IA", desc: "Itinerarios completos con presupuesto y documentos integrados." },
                { title: "Bóveda Encriptada", desc: "Tus contratos y pasaportes, seguros y a mano." },
                { title: "Calendario Familiar", desc: "Eventos, cumpleaños y citas de toda la familia." },
                { title: "Academia Junior", desc: "Enseña a tus hijos el valor del dinero jugando." }
            ],
            integrations: ["Descuenta ingredientes comprados del presupuesto", "Planifica comidas según eventos de agenda", "Gestiona sobras para reducir desperdicio"]
        },
        dashboard: {
            title: "Panel Aura",
            subtitle: "Tu interfaz unificada por capas",
            description: "No es solo un dashboard, es un organismo vivo. Aura organiza tu vida en capas temáticas: Finanzas, Cocina, Viajes y Familia, conectadas entre sí para darte una visión total en una sola pantalla.",
            features: [
                { title: "Consola de Inteligencia", desc: "Un resumen dinámico que cambia según la hora del día: facturas por la mañana, recetas por la tarde." },
                { title: "Capas Temáticas", desc: "Navega entre tus finanzas, menús y viajes sin cambiar de aplicación ni perder el contexto." },
                { title: "Aliseus Insights", desc: "Motor de IA que detecta patrones y alertas críticas antes de que ocurran." },
                { title: "Dashboard Unificado", desc: "Toda la información relevante de tus módulos (vida y finanzas) condensada en una interfaz fija y coherente." },
                { title: "Navegación Fluida", desc: "Salta de revisar una inversión a planear un itinerario de viaje en un solo click." },
                { title: "IA Invisible", desc: "El motor de Aliseus trabaja en segundo plano para predecir tus flujos de caja y necesidades de compra." }
            ],
            integrations: ["El panel Aura unifica el Módulo Finanzas y el Módulo Vida", "Sincronización en tiempo real de todos tus datos"]
        }
    },
    EN: {
        finance: {
            title: "Finance Module",
            subtitle: "Intelligent Wealth",
            description: "Not just expense tracking. It's your personal CFO.",
            features: [
                { title: "Smart Categorization", desc: "AI understands if it's 'Leisure' or 'Necessity' automatically." },
                { title: "Zero Debt", desc: "Avalanche and Snowball strategies to eliminate liabilities." },
                { title: "Future Simulator", desc: "What if I invest €100 more? Aliseus tells you." },
                { title: "Real Limits", desc: "AI-powered budgets that adapt to your day." },
                { title: "CSV Import", desc: "Import bank statements and link them to your accounts." },
                { title: "Predictive Analysis", desc: "Cash flow projections at 3, 6 and 12 months." },
                { title: "Retirement Simulator", desc: "Calculate how much you need to save for retirement." }
            ],
            integrations: ["Projects travel impact on savings", "Syncs kitchen grocery receipts", "Calculates real cost per recipe"]
        },
        vida: {
            title: "Life Module",
            subtitle: "Home on Autopilot",
            description: "Reclaim 5 hours a week simply by automating invisible tasks.",
            features: [
                { title: "AI Chef", desc: "Generates weekly menus based on what's in your fridge." },
                { title: "Smart Pantry", desc: "Inventory with expiry alerts and recipe suggestions." },
                { title: "Shopping List", desc: "Auto-generated when you add recipes to your menu." },
                { title: "AI Travel Planner", desc: "Full itineraries with budget and integrated documents." },
                { title: "Encrypted Vault", desc: "Your contracts and passports, safe and handy." },
                { title: "Family Calendar", desc: "Events, birthdays and appointments for the whole family." },
                { title: "Junior Academy", desc: "Teach your kids the value of money through play." }
            ],
            integrations: ["Deducts ingredients from budget", "Plans meals based on calendar events", "Manages leftovers to reduce waste"]
        },
        dashboard: {
            title: "Aura Panel",
            subtitle: "Your unified layered interface",
            description: "Aura is your central command center. It organizes your life into intelligent thematic layers: Finance, Kitchen, Travel, and Family, all connected to give you a 360° view on a single screen.",
            features: [
                { title: "Intelligence Console", desc: "A dynamic summary that changes with the time of day: bills in the morning, recipes in the evening." },
                { title: "Thematic Layers", desc: "Navigate between your finances, menus, and travels without switching apps or losing context." },
                { title: "Aliseus Insights", desc: "AI engine that detects patterns and critical alerts before they happen." },
                { title: "Unified Dashboard", desc: "All relevant information from your life and finance modules condensed in a fixed, coherent interface." },
                { title: "Seamless Navigation", desc: "Jump from reviewing an investment to planning a travel itinerary in a single click." },
                { title: "Invisible AI", desc: "The Aliseus engine works in the background to predict your cash flows and shopping needs." }
            ],
            integrations: ["Aura Panel unifies the Finance Module and the Life Module", "Real-time sync for all your data"]
        }
    },
    FR: {
        finance: {
            title: "Module Finances",
            subtitle: "Patrimoine Intelligent",
            description: "Plus qu'un suivi de dépenses. Votre DAF personnel.",
            features: [
                { title: "Catégorisation IA", desc: "L'IA comprend si c'est 'Loisir' ou 'Nécessité'." },
                { title: "Dette Zéro", desc: "Stratégies Avalanche et Boule de Neige pour éliminer les passifs." },
                { title: "Simulateur Futur", desc: "Et si j'investis 100€ de plus ? Aliseus vous le dit." },
                { title: "Limites Réelles", desc: "Budgets IA adaptés à votre quotidien." },
                { title: "Import CSV", desc: "Importez des relevés bancaires et associez-les à vos comptes." },
                { title: "Analyse Prédictive", desc: "Projections de trésorerie à 3, 6 et 12 mois." },
                { title: "Simulateur Retraite", desc: "Calculez combien épargner pour votre retraite." }
            ],
            integrations: ["Projette l'impact voyage sur l'épargne", "Synchro tickets cuisine", "Calcule le coût réel par recette"]
        },
        vida: {
            title: "Module Vie",
            subtitle: "Maison en Autopilote",
            description: "Gagnez 5h par semaine en automatisant l'invisible.",
            features: [
                { title: "Chef IA", desc: "Menus hebdomadaires basés sur le contenu du frigo." },
                { title: "Garde-manger Intelligent", desc: "Inventaire avec alertes péremption et suggestions." },
                { title: "Liste de Courses", desc: "Générée automatiquement en ajoutant des recettes." },
                { title: "Planificateur Voyage IA", desc: "Itinéraires complets avec budget et documents." },
                { title: "Coffre Chiffré", desc: "Contrats et passeports, sûrs et à portée de main." },
                { title: "Calendrier Familial", desc: "Événements, anniversaires et rendez-vous." },
                { title: "Académie Junior", desc: "Apprenez la valeur de l'argent par le jeu." }
            ],
            integrations: ["Déduit ingrédients du budget", "Planifie repas selon agenda", "Gère les restes pour réduire le gaspillage"]
        },
        dashboard: {
            title: "Panneau Aura",
            subtitle: "Votre interface unifiée par couches",
            description: "Aura est votre centre de commande central. Il organise votre vie en couches thématiques intelligentes : Finances, Cuisine, Voyage et Famille, toutes connectées pour une vision à 360°.",
            features: [
                { title: "Console d'Intelligence", desc: "Un résumé dynamique : factures le matin, menus le soir, selon vos besoins réels." },
                { title: "Couches Thématiques", desc: "Naviguez entre vos finances, menus et voyages sans changer d'application ni perdre le fil." },
                { title: "Aliseus Insights", desc: "Moteur d'IA qui détecte les tendances et les alertes critiques de manière proactive." },
                { title: "Dashboard Unifié", desc: "Toute l'information pertinente condensée dans une interface fixe, claire et ultra-cohérente." },
                { title: "Navigation Fluide", desc: "Passez de la révision d'un investissement à la planification d'un voyage en un clic." },
                { title: "IA Invisible", desc: "Le moteur d'Aliseus travaille en arrière-plan pour prédire vos flux de trésorerie y besoins d'achat." }
            ],
            integrations: ["Le Panneau Aura unifie le Module Finances et le Module Vie", "Synchronisation en temps réel de toutes vos données"]
        }
    }
};
