import { 
    Wallet, Utensils, Plane, Users, TrendingUp, Sparkles, Plus, LayoutDashboard
} from 'lucide-react';

export const DASHBOARD_TEXTS = {
    ES: {
        themeBar: {
            finances: 'Mi Economía',
            kitchen: 'Mi Cocina',
            travel: 'Mis Viajes',
            family: 'Mi Familia',
            investments: 'Mis Inversiones',
        },
        finance: {
            title: 'Resumen Financiero',
            liquidity: 'Liquidez Actual',
            operatingCeiling: 'Techo Operativo',
            fixedPayments: 'Pagos Fijos (30d)',
            netWorth: 'Patrimonio Neto',
            emptyState: {
                title: 'Bienvenido a la Beta de Aliseus',
                subtitle: 'Parece que aún no tienes cuentas configuradas. Aliseus brilla más cuando tiene datos reales que analizar.',
                primaryAction: 'Configurar mi cuenta',
                secondaryAction: 'Explorar con datos demo',
                benefitTitle: 'Lo que ganarás hoy:',
                benefits: [
                    'Anticipación de falta de liquidez',
                    'Control automático de suscripciones',
                    'Asistente de ahorro inteligente'
                ]
            }
        },
        feedback: {
            button: 'Beta Feedback',
            modalTitle: 'Tu voz da forma a Aliseus',
            modalSubtitle: '¿Has encontrado un error o tienes una idea para mejorar la plataforma?',
            labelType: '¿Qué quieres decirnos?',
            labelMessage: 'Tu mensaje',
            placeholder: 'Escribe aquí tu experiencia...',
            send: 'Enviar reporte',
            thanks: '¡Gracias por ayudarnos!',
            typeBug: 'Reportar un error 🐞',
            typeIdea: 'Sugerir una mejora 💡',
            typeQuestion: 'Tengo una duda ❓'
        }
    },
    EN: {
        themeBar: {
            finances: 'My Finances',
            kitchen: 'My Kitchen',
            travel: 'My Travels',
            family: 'My Family',
            investments: 'My Investments',
        },
        finance: {
            title: 'Financial Overview',
            liquidity: 'Current Liquidity',
            operatingCeiling: 'Operational Ceiling',
            fixedPayments: 'Fixed Payments (30d)',
            netWorth: 'Net Worth',
            emptyState: {
                title: 'Welcome to Aliseus Beta',
                subtitle: "It looks like you don't have any accounts set up yet. Aliseus shines brighter with real data to analyze.",
                primaryAction: 'Set up my account',
                secondaryAction: 'Explore with demo data',
                benefitTitle: 'What you will gain today:',
                benefits: [
                    'Anticipate liquidity shortfalls',
                    'Automatic subscription control',
                    'Smart savings assistant'
                ]
            }
        },
        feedback: {
            button: 'Beta Feedback',
            modalTitle: 'Your voice shapes Aliseus',
            modalSubtitle: 'Found a bug or have an idea to improve the platform?',
            labelType: 'What would you like to tell us?',
            labelMessage: 'Your message',
            placeholder: 'Tell us about your experience...',
            send: 'Send report',
            thanks: 'Thanks for helping us!',
            typeBug: 'Report a bug 🐞',
            typeIdea: 'Suggest an improvement 💡',
            typeQuestion: 'I have a question ❓'
        }
    }
};

export type DashboardTexts = typeof DASHBOARD_TEXTS.ES;
