import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startDashboardTour = () => {
    const driverObj = driver({
        showProgress: true,
        animate: true,
        doneBtnText: "¡Listo!",
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        allowClose: true,
        steps: [
            {
                element: '#header-title',
                popover: {
                    title: 'Bienvenido a Aliseus',
                    description: 'Este es tu centro de control financiero y personal totalmente privado.'
                }
            },
            {
                element: '#widget-filters',
                popover: {
                    title: 'Cambia de Vista',
                    description: 'Alterna entre Finanzas, Cocina y Vida. Cada vista tiene sus propios widgets personalizados.'
                }
            },
            {
                element: '#edit-mode-btn',
                popover: {
                    title: 'Personaliza Todo',
                    description: 'Activa el modo edición para mover, redimensionar o añadir nuevos widgets. Tu dashboard, tu forma.'
                }
            },
            {
                element: '#smart-insight-widget',
                popover: {
                    title: 'Tu Cerebro de IA',
                    description: 'Aliseus Brain analiza tus patrones y genera alertas, resúmenes y recomendaciones automáticas.'
                }
            },
            {
                popover: {
                    title: '📊 Widgets Interactivos',
                    description: 'Haz clic en cualquier widget KPI para expandirlo y ver detalles completos. Doble-clic para ir directo a la sección.'
                }
            },
            {
                popover: {
                    title: '🍳 También gestiona tu Cocina',
                    description: 'Cambia a la vista "Cocina" para ver recetas, despensa, menú semanal y lista de compra — todo conectado a tu presupuesto.'
                }
            },
            {
                popover: {
                    title: '🔍 Busca Cualquier Cosa',
                    description: 'Pulsa Ctrl+K o el icono de búsqueda para encontrar transacciones, recetas, cuentas o viajes al instante.'
                }
            },
            {
                element: '#theme-toggle',
                popover: {
                    title: 'Modo Oscuro',
                    description: 'Alterna entre modo claro y oscuro según tu preferencia. Tu vista se recordará.'
                }
            }
        ]
    });

    driverObj.drive();
};
