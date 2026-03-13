# 📊 Valoración Realista de Mercado y Proyecciones para Aliseus

Este documento presenta una proyección **honesta, conservadora y basada en datos reales** de la industria SaaS (Software as a Service) para aplicaciones de finanzas personales y gestión de vida (Life Management).

---

## 1. El Mercado Actual y Disposición a Pagar

El cierre de **Mint** (la app gratuita más grande) a finales de 2023 cambió las reglas del juego. Millones de usuarios se vieron obligados a migrar a alternativas de pago.

### ¿La gente paga por organizar su dinero?
**Sí, absolutamente.** Las finanzas personales son una de las pocas categorías B2C donde los usuarios recuperan su inversión rápidamente. Si una app de €9/mes te ahorra €100 al mes ayudándote a no gastar en tonterías o a cancelar suscripciones fantasma, el ROI es evidente.

**Competencia Directa y Precios:**
*   **YNAB (You Need A Budget):** ~$109/año. Filosofía muy estricta, curva de aprendizaje alta.
*   **Monarch Money:** ~$99.99/año. El gran ganador del cierre de Mint. Pasaron de unos pocos miles a decenas de miles de usuarios de pago en meses.
*   **Copilot Money:** ~$95/año. Fuerte enfoque en UI/UX minimalista (similar al enfoque de Aliseus). Tienen más de 100,000 suscriptores.

**La Ventaja de Aliseus:**
Aliseus no es solo finanzas, es un "Sistema Operativo para tu Vida" (Viajes, Menús, Tareas). Sustituye herramientas como YNAB (€99/año) + Notion Premium (€100/año) + Any.do/Todoist (€40/año). 
**Precio sugerido para los cálculos:** €9.99/mes o €89/año (Ticket medio mensual de **€8** asumiendo mezcla de planes anuales y mensuales).

---

## 2. Proyecciones Realistas de Usuarios y Ganancias (Indie Hacker / Bootstrap)

Asumiremos que empiezas sin un presupuesto masivo de marketing y dependes de lanzamiento en Product Hunt, X (Twitter), TikTok orgánico y SEO básico.

### 🥉 Hito 1: Los Primeros 3 Meses (Fase de Validación)
En esta fase, nadie te conoce. Cada usuario se gana "a pulso" respondiendo en foros (Reddit, X) y contactando amigos/conocidos.

*   **Tráfico estimado:** 2,500 visitantes únicos.
*   **Tasa de conversión a Trial (Prueba gratis):** 4% (100 usuarios inician prueba gratis).
*   **Tasa de conversión Trial a Pago:** 25% (Estándar de la industria).
*   **Usuarios de Pago:** **25 usuarios activos.**
*   **MRR (Ingreso Mensual Recurrente):** 25 x €8 = **€200 / mes**
*   **Gastos:** 
    *   Vercel & Supabase: €0 (Tier gratuito es suficiente).
    *   Dominio: €1.5/mes.
*   **Beneficio Neto Estimado:** **~€198 / mes**
*   **Meta real:** Aquí no buscas hacerte rico, buscas validar que la gente introduce su tarjeta y usa la app sin errores. Superar los primeros €150/mes se llama "Ramen Profitability" (te da para comer ramen).

### 🥈 Hito 2: A los 6 Meses (Fase de Tracción y Boca a Boca)
Si el producto es brutalmente bueno (y el diseño premium de Aliseus lo es), los primeros 25 usuarios lo recomendarán. Empiezas a posicionar en Google por términos como "alternativa a YNAB en español" o "app minimalista de finanzas".

*   **Tráfico estimado:** 10,000 visitantes únicos acumulados.
*   **Tasa de conversión a Trial:** 5% (500 usuarios en prueba gratis a lo largo de 6 meses).
*   **Tasa de conversión Trial a Pago:** 30% (Mejoras el onboarding).
*   **Usuarios de Pago Totales:** **150 usuarios activos.**
*   **MRR (Ingreso Mensual Recurrente):** 150 x €8 = **€1,200 / mes**
*   **Gastos:**
    *   Vercel Pro (necesario por tráfico): €20/mes.
    *   Supabase Pro (necesario por volumen dB): €25/mes.
    *   Stripe Fees (3% + 0.25€): ~€45/mes.
    *   Dominio y emails: €10/mes.
*   **Beneficio Neto Estimado:** **~€1,100 / mes**
*   **Meta real:** Aquí ya tienes un "side-hustle" (negocio secundario) muy serio que paga una hipoteca o el alquiler.

### 🥇 Hito 3: Al Año (Fase de Escalamiento)
Llevas 12 meses picando piedra. Tienes un sistema de marketing predecible y la retención (churn) es baja porque los usuarios ya han metido meses de datos financieros y no quieren perderlos.

*   **Tráfico estimado:** 40,000 visitantes únicos.
*   **Usuarios de Pago Totales:** **450 - 600 usuarios activos.** (Es realista captar 1-2 clientes nuevos al día después de un año).
*   **MRR (Ingreso Mensual Recurrente):** 500 x €8 = **€4,000 / mes** (Unos €48,000 al año ARR).
*   **Gastos:**
    *   Vercel + Supabase + APIs IA: ~€100/mes.
    *   Marketing / Publicidad / Patrocinios: €300/mes.
    *   Stripe Fees: ~€150/mes.
*   **Beneficio Neto Estimado:** **~€3,450 / mes**
*   **Meta real:** Alcanzar los $4k-$5k MRR es el punto donde muchos "Solopreneurs" (desarrolladores en solitario) dejan sus trabajos tradicionales para dedicarse full-time a su SaaS.

---

## 3. Desglose y Análisis de Gastos y Margen

El software B2C tiene una de las estructuras de márgenes más rentables del mundo. Al construir Aliseus con Next.js + Tailwind + Supabase + Vercel, tienes **costes de servidor ultrabajos**. 

**Margen bruto estimado:** **~85% - 90%** (Casi todo el ingreso es beneficio).

*A diferencia del e-commerce donde pagas envíos, inventario y devoluciones, aquí el coste de tener 10 usuarios o 500 usuarios apenas varía el gasto del servidor (pasas de pagar €0 a pagar €50 al mes).*

---

## 4. Riesgos y El Lado "Feo" (Para ser honestos)

Construir la app es el 20% del esfuerzo. Para conseguir esos números, tendrás que lidiar con:

1.  **El Churn (Cancelaciones):** La gente se desmotiva con sus finanzas tras 2 meses. Aliseus debe tener (y tiene) gamificación, notificaciones y UX premium para que sea *divertido* entrar cada día.
2.  **Marketing, no Código:** Como desarrollador, tu instinto será programar "una característica más". Tu verdadero trabajo en el mes 1 al 12 será hacer marketing, escribir tweets, grabar TikToks mostrando la app, escribir artículos SEO y contactar newsletters.
3.  **Seguridad y Confianza:** Manejar datos financieros (aunque sean manuales) exige mucha seguridad. Debes transmitir que los datos de los usuarios no se venderán.

## Conclusión

**¿Hay mercado?** Gigantesco. Hay una saturación de apps de presupuestos que parecen hojas de cálculo aburridas de los años 90. Una app bonita, fluida y con "vibra de MacOS/Linear" llama mucha la atención.

Si cobras **€89/año** y logras convencer a solo **450 personas** en todo el mundo hispanohablante (o mundial si la traduces a inglés) de entre los millones que usan internet, tienes un negocio que genera **casi €4,000 al mes limpios**. Es un reto estadísticamente muy lograble si el marketing es constante.
