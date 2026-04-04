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
        pricingBetaAdvantage: "Sorteo de acceso exclusivo: Contrata el plan anual ahora y obtén 18 meses por el precio de 12 (6 meses extra gratis).",
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
            { title: "Planificador IA de Menús", desc: "Genera menús semanales equilibrados basados en tus gustos, presupuesto y los ingredientes que ya tienes en casa." },
            { title: "Salud de Despensa", desc: "Un indicador visual en tiempo real del estado de tu stock. Nunca más te quedes sin lo esencial." },
            { title: "Índice de Frescura", desc: "Control inteligente de caducidades. Aliseus prioriza recetas con ingredientes próximos a vencer." },
            { title: "Lista de Compra Automática", desc: "Sincronizada con tu menú y tu stock. Solo compras lo que realmente necesitas." },
            { title: "Coste Real por Receta", desc: "Calcula cuánto cuesta realmente cada plato basándose en los precios de tu supermercado habitual." },
            { title: "Gestión de Sobras", desc: "Recetas creativas para reutilizar lo que sobró ayer y reducir el desperdicio a cero." },
            { title: "Preferencias y Alergias", desc: "Perfiles personalizados para cada miembro de la familia, asegurando menús seguros para todos." },
            { title: "Biblioteca de Recetas", desc: "Cientos de opciones optimizadas para el ahorro y la nutrición familiar." }
        ],
        lifeLabel: "Gestión de Vida",
        lifeSectionTitle: "Tu centro de mando familiar",
        lifeSectionSub: "Viajes, documentos y la inteligencia de Aura siempre a tu lado.",
        lifeFeatures: [
            { title: "Radar de Viajes con IA", desc: "Monitorización de precios, itinerarios inteligentes y gestión de documentos para toda la familia." },
            { title: "Bóveda Encriptada", desc: "Tus contratos, pasaportes y documentos críticos protegidos con seguridad de grado bancario." },
            { icon: Calendar, title: "Calendario Familiar", desc: "La agenda única que conecta eventos, citas médicas y recordatorios del hogar." },
            { title: "Dashboard Aura (Panel Real)", desc: "Tu día resumido en capas fijas: finanzas por la mañana, menú por la tarde, sin distracciones." }
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

        // Finance Module
        moduleFinTitle: 'Finance Module: Intelligence & Control',
        moduleFinDesc: 'Manage your family finances with a technical approach. Aliseus doesn\'t just track tags; it projects your real savings capacity.',
        moduleFinFeat1: 'Cashflow Intelligence & Net Worth Analysis',
        moduleFinFeat2: 'Proactive Operational Ceiling (Techo Operativo)',
        moduleFinFeat3: 'Automated Fixed Payments Control (Todo al día)',

        // Life Module
        moduleVidaTitle: 'Life Module: Household & Exploration',
        moduleVidaDesc: 'Your home is a living organism. Aliseus connects your pantry, trips, and family in a unified command center.',
        moduleVidaFeat1: 'Pantry Health Score & Freshness Index',
        moduleVidaFeat2: 'Smart Meal Planning & Auto-Shopping List',
        moduleVidaFeat3: 'Travel Pricing Radar & Destination Countdown',

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

        // Finance Module
        moduleFinTitle: 'Module Finances : Intelligence et Contrôle',
        moduleFinDesc: 'Gérez vos finances familiales avec une approche opérationnelle. Aliseus ne se contente pas de suivre les dépenses, il projette votre capacité réelle d\'épargne.',
        moduleFinFeat1: 'Flux de trésorerie et intelligence de liquidité',
        moduleFinFeat2: 'Plafond opérationnel et contrôle des paiements fixes',
        moduleFinFeat3: 'Suivi de l\'évolution du patrimoine net',

        // Life Module
        moduleVidaTitle: 'Module Vie : Maison et Exploration',
        moduleVidaDesc: 'Votre maison est un organisme vivant. Aliseus connecte votre garde-manger, vos voyages et votre famille dans un tableau de bord unifié.',
        moduleVidaFeat1: 'Score de santé du stock et indice de fraîcheur',
        moduleVidaFeat2: 'Planification intelligente et liste de courses automatique',
        moduleVidaFeat3: 'Radar de voyage et suivi des destinations',

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
            subtitle: "Patrimonio e Inteligencia Operativa",
            description: "No es solo un control de gastos. Es tu sistema de mando financiero.",
            features: [
                { title: "Techo Operativo Proactivo", desc: "El presupuesto dinámico que te avisa al 90% y 100% de tu capacidad de gasto diaria." },
                { title: "Control de Pagos Fijos", desc: "Monitorización automática de recibos y facturas recurrentes para el modo 'Todo al día'." },
                { title: "Inteligencia de Caja", desc: "Cabecera inteligente que sintetiza tu estado financiero diario en segundos." },
                { title: "Evolución de Patrimonio", desc: "Gráficos detallados de liquidez y net worth desde 1 mes hasta 5 años." },
                { title: "Deuda Zero / Snowball", desc: "Estrategias personalizadas para eliminar pasivos de forma eficiente." },
                { title: "Simulador de Futuro", desc: "Proyecta el impacto de tus inversiones y ahorros a largo plazo." },
                { title: "Categorización IA", desc: "Clasificación automática de movimientos bancarios con total precisión." }
            ],
            integrations: ["Sincronización con el coste real de tu despensa", "Impacto de planes de viaje en tu liquidez inmediata", "Alertas de desvío de presupuesto"]
        },
        vida: {
            title: "Módulo Vida",
            subtitle: "Tu Hogar en Piloto Automático",
            description: "Elimina la carga mental de la logística doméstica con un panel de control real.",
            features: [
                { title: "Salud de Despensa", desc: "Métrica en tiempo real del estado de tu stock (Pantry Health Score)." },
                { title: "Índice de Frescura", desc: "Control automático de caducidades para minimizar el desperdicio alimentario." },
                { title: "Menú Inteligente", desc: "Planificador semanal conectado directamente a lo que ya tienes en casa." },
                { title: "Lista Auto-generada", desc: "Aliseus sabe qué te falta para tus recetas y lo añade a tu lista de compra." },
                { title: "Radar de Viajes", desc: "Seguimiento de precios de destinos y cuenta atrás operativa para tu próxima salida." },
                { title: "Checklist de Viaje", desc: "Listas preparadas por IA según el destino, clima y duración del viaje." },
                { title: "Bóveda Documental", desc: "Tus contratos, pasaportes y pólizas, siempre seguros y accesibles." }
            ],
            integrations: ["Sincronización entre alimentación y presupuesto", "Gestión de tareas familiares compartidas", "Alertas de compras urgentes"]
        },
        dashboard: {
            title: "Panel Aura",
            subtitle: "Tu interfaz unificada por capas fijas",
            description: "Aura organiza tu vida en capas temáticas inteligentes: Finanzas, Cocina, Viajes y Familia, conectadas entre sí para darte una visión total sin distracciones.",
            features: [
                { title: "Consola de Inteligencia", desc: "Interfaz dinámica que muestra lo que necesitas saber según el momento del día." },
                { title: "Capas Temáticas Fijas", desc: "Olvídate de configurar widgets. Aura ya sabe dónde vive cada dato importante." },
                { title: "Aliseus Insights", desc: "Motor de IA que predice tus necesidades de compra y flujos de caja antes de que ocurran." },
                { title: "Navegación Fluida", desc: "Alterna entre finanzas, cocina y viajes manteniendo el contexto familiar unificado." },
                { title: "Seguridad de Grado Bancario", desc: "Encriptación AES-256 para tus datos financieros y documentos más sensibles." },
                { title: "Modo Beta Privada", desc: "Acceso temprano con soporte directo del equipo de desarrollo para pulir tu experiencia." }
            ],
            integrations: ["Unificación total del Módulo Finanzas y el Módulo Vida", "Conexión en tiempo real con todos tus activos"]
        }
    },
    EN: {
        finance: {
            title: "Finance Module",
            subtitle: "Wealth & Operational Intelligence",
            description: "More than just expense tracking. It's your financial command system.",
            features: [
                { title: "Proactive Operational Ceiling", desc: "A dynamic budget that alerts you at 90% and 100% of your daily spending capacity." },
                { title: "Fixed Payments Control", desc: "Automatic monitoring of recurring bills and invoices for 'Everything Up to Date' mode." },
                { title: "Cashflow Intelligence", desc: "Intelligent header synthesizing your daily financial status in seconds." },
                { title: "Wealth Evolution", desc: "Detailed liquidity and net worth charts from 1 month to 5 years." },
                { title: "Zero Debt / Snowball", desc: "Personalized strategies to efficiently eliminate liabilities." },
                { title: "Future Simulator", desc: "Project the impact of your investments and savings over the long term." },
                { title: "AI Categorization", desc: "Automatic classification of bank transactions with total precision." }
            ],
            integrations: ["Sync with real pantry costs", "Impact of travel plans on immediate liquidity", "Budget deviation alerts"]
        },
        vida: {
            title: "Life Module",
            subtitle: "Your Home on Autopilot",
            description: "Remove the mental load of domestic logistics with a real control panel.",
            features: [
                { title: "Pantry Health Score", desc: "Real-time metric of your stock status (Pantry Health Score)." },
                { title: "Freshness Index", desc: "Automatic expiry tracking to minimize food waste." },
                { title: "Smart Menu", desc: "Weekly planner connected directly to what you already have at home." },
                { title: "Auto-generated List", desc: "Aliseus knows what you're missing for your recipes and adds it to your shopping list." },
                { title: "Travel Radar", desc: "Price monitoring for destinations and operational countdown for your next trip." },
                { title: "Travel Checklist", desc: "AI-prepared lists based on destination, weather, and trip duration." },
                { title: "Document Vault", desc: "Your contracts, passports, and policies, always secure and accessible." }
            ],
            integrations: ["Sync between food and budget", "Shared family task management", "Urgent shopping alerts"]
        },
        dashboard: {
            title: "Aura Panel",
            subtitle: "Your unified interface via fixed layers",
            description: "Aura organizes your life into intelligent thematic layers: Finance, Kitchen, Travel, and Family, connected to give you total vision without distractions.",
            features: [
                { title: "Intelligence Console", desc: "Dynamic interface showing what you need to know based on the time of day." },
                { title: "Fixed Thematic Layers", desc: "Forget about configuring widgets. Aura already knows where every important data point lives." },
                { title: "Aliseus Insights", desc: "AI engine that predicts your shopping needs and cash flows before they happen." },
                { title: "Seamless Navigation", desc: "Toggle between finance, kitchen, and travel while maintaining unified family context." },
                { title: "Bank-Grade Security", desc: "AES-256 encryption for your financial data and most sensitive documents." },
                { title: "Private Beta Mode", desc: "Early access with direct support from the development team to polish your experience." }
            ],
            integrations: ["Total unification of Finance and Life Modules", "Real-time connection with all your assets"]
        }
    },
    FR: {
        finance: {
            title: "Module Finances",
            subtitle: "Patrimoine et Intelligence Opérationnelle",
            description: "Plus qu'un suivi de dépenses. C'est votre système de commande financière.",
            features: [
                { title: "Plafond Opérationnel Proactif", desc: "Le budget dynamique qui vous alerte à 90% et 100% de votre capacité de dépense quotidienne." },
                { title: "Contrôle des Paiements Fixes", desc: "Suivi automatique des factures et abonnements pour le mode 'Tout à jour'." },
                { title: "Intelligence de Trésorerie", desc: "Un en-tête intelligent qui synthétise votre état financier quotidien en quelques secondes." },
                { title: "Évolution du Patrimoine", desc: "Graphiques détaillés de liquidité et capital net de 1 mois à 5 ans." },
                { title: "Dette Zéro / Snowball", desc: "Stratégies personnalisées pour éliminer les passifs de manière efficace." },
                { title: "Simulateur de Futur", desc: "Projetez l'impact de vos investissements et de votre épargne à long terme." },
                { title: "Catégorisation IA", desc: "Classification automatique de vos transactions bancaires avec une précision totale." }
            ],
            integrations: ["Synchronisation avec le coût réel de votre stock", "Impact des voyages sur votre liquidité immédiate", "Alertes de dérive budgétaire"]
        },
        vida: {
            title: "Module Vie",
            subtitle: "Votre Foyer en Pilote Automatique",
            description: "Éliminez la charge mentale de la logistique domestique avec un véritable panneau de contrôle.",
            features: [
                { title: "Score de Santé du Stock", desc: "Mesure en temps réel de l'état de votre garde-manger (Pantry Health Score)." },
                { title: "Indice de Fraîcheur", desc: "Suivi intelligent des dates de péremption pour minimiser le gaspillage alimentaire." },
                { title: "Menus Intelligents", desc: "Planificateur hebdomadaire connecté directement à ce que vous avez déjà chez vous." },
                { title: "Liste Auto-générée", desc: "Aliseus sait ce qu'il vous manque pour vos recettes et l'ajoute à votre liste de courses." },
                { title: "Radar de Voyages", desc: "Suivi des prix des destinations et compte à rebours opérationnel pour votre prochain départ." },
                { title: "Checklist de Voyage", desc: "Listes préparées par l'IA selon la destination, la météo et la durée du voyage." },
                { title: "Coffre Documentaire", desc: "Vos contrats, passeports et polices d'assurance, toujours sécurisés et accessibles." }
            ],
            integrations: ["Synchronisation entre alimentation et budget", "Gestion des tâches familiales partagées", "Alertes de courses urgentes"]
        },
        dashboard: {
            title: "Panneau Aura",
            subtitle: "Votre interface unifiée par couches fixes",
            description: "Aura organise votre vie en couches thématiques intelligentes : Finances, Cuisine, Voyages et Famille, connectées entre elles pour une vision totale.",
            features: [
                { title: "Console d'Intelligence", desc: "Interface dynamique qui affiche ce que vous devez savoir selon le moment de la journée." },
                { title: "Couches Thématiques Fixes", desc: "Oubliez la configuration de widgets. Aura sait déjà où se trouve chaque donnée importante." },
                { title: "Aliseus Insights", desc: "Moteur d'IA qui prédit vos besoins d'achat et vos flux de trésorerie avant qu'ils ne surviennent." },
                { title: "Navigation Fluide", desc: "Passez des finances à la cuisine ou aux voyages en gardant un contexte familial unifié." },
                { title: "Sécurité de Grade Bancaire", desc: "Chiffrement AES-256 pour vos données financières et vos documents les plus sensibles." },
                { title: "Mode Bêta Privée", desc: "Accès anticipé avec support direct de l'équipe pour polir votre expérience." }
            ],
            integrations: ["Unification totale du Module Finances et du Module Vie", "Connexion en temps réel avec tous vos actifs"]
        }
    }
};
