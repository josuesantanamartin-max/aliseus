# ðŸš€ GuÃ­a RÃ¡pida - Aliseus

## âš¡ Inicio RÃ¡pido (3 pasos)

### 1ï¸âƒ£ Instalar Node.js (si no lo tienes)

**Descarga e instala Node.js desde:**
- ðŸŒ https://nodejs.org/
- **Recomendado:** VersiÃ³n LTS (Long Term Support)

**âš ï¸ IMPORTANTE despuÃ©s de instalar:**

**OpciÃ³n A - Reiniciar PowerShell (Recomendado):**
1. Cierra todas las ventanas de PowerShell abiertas
2. Abre una nueva ventana de PowerShell
3. Navega al directorio del proyecto: `cd "ruta\a\Aliseus-Suite-main\Aliseus-Suite-main"`

**OpciÃ³n B - Recargar PATH sin cerrar:**
Ejecuta el script: `.\RECARGAR-PATH.ps1`

**Verificar instalaciÃ³n:**
```powershell
node --version
npm --version
```

### 2ï¸âƒ£ Instalar Dependencias

Abre PowerShell en el directorio del proyecto y ejecuta:

```powershell
npm install
```

### 3ï¸âƒ£ Ejecutar la AplicaciÃ³n

**OpciÃ³n A - Script AutomÃ¡tico:**
```powershell
.\EJECUTAR-APP.ps1
```

**OpciÃ³n B - Manual:**
```powershell
npm run dev
```

### 4ï¸âƒ£ Abrir en el Navegador

La aplicaciÃ³n estarÃ¡ disponible en:
- ðŸ”— **http://localhost:3000**

---

## ðŸŽ¯ Funcionalidades de Aliseus

### ðŸ“Š Dashboard Global
- Vista 360Â° de tu vida financiera y personal
- Widgets personalizables
- SincronizaciÃ³n en tiempo real

### ðŸ’° MÃ³dulo de Finanzas
- **Transacciones:** Ingresos, gastos, transferencias
- **Cuentas:** MÃºltiples cuentas bancarias
- **Presupuestos:** Control de gastos por categorÃ­a
- **Metas:** Ahorro para objetivos especÃ­ficos
- **Deudas:** Seguimiento de prÃ©stamos y tarjetas

### ðŸ  MÃ³dulo de Vida
- **Cocina:** Despensa, recetas, planificador de comidas
- **Lista de Compras:** OrganizaciÃ³n inteligente
- **Viajes:** PlanificaciÃ³n y presupuestos de viaje
- **Familia:** GestiÃ³n de miembros y tareas

### âš™ï¸ ConfiguraciÃ³n
- PersonalizaciÃ³n de categorÃ­as
- Reglas de automatizaciÃ³n
- Multi-idioma (ES, EN, FR)
- Multi-moneda (EUR, USD, GBP)

---

## ðŸ”‘ ConfiguraciÃ³n de API Keys (Opcional)

Para funcionalidades avanzadas con IA:

1. Crea un archivo `.env.local` en la raÃ­z del proyecto
2. AÃ±ade tus API keys:

```env
VITE_GEMINI_API_KEY=tu-api-key-de-gemini
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-key-de-supabase
```

**Nota:** La aplicaciÃ³n funciona en **modo demo** sin estas keys.

---

## ðŸ› ï¸ Comandos Disponibles

```powershell
npm run dev        # Servidor de desarrollo
npm run build      # Build de producciÃ³n
npm run preview    # Preview del build
npm run lint       # Verificar cÃ³digo
npm run test       # Ejecutar tests
```

---

## â“ SoluciÃ³n de Problemas

### Error: "npm no se reconoce"
**SoluciÃ³n:** Node.js no estÃ¡ instalado o no estÃ¡ en el PATH
- Instala Node.js desde nodejs.org
- Reinicia PowerShell despuÃ©s de instalar

### Error: "Puerto 3000 en uso"
**SoluciÃ³n:** Cambia el puerto en `vite.config.ts` o cierra la aplicaciÃ³n que usa el puerto

### Error: "Dependencias no instaladas"
**SoluciÃ³n:** Ejecuta `npm install` nuevamente

---

## ðŸ“± Modo Demo

Aliseus incluye un **modo demo** que funciona sin configuraciÃ³n:
- No requiere cuenta
- Datos almacenados localmente
- Funcionalidad completa disponible

Al iniciar la app, selecciona **"Probar Demo (Sin Cuenta)"**

---

## ðŸŽ¨ CaracterÃ­sticas Destacadas

âœ¨ **Interfaz Moderna:** DiseÃ±o limpio y profesional  
ðŸš€ **RÃ¡pido:** Optimizado para rendimiento  
ðŸ”’ **Privado:** Datos locales por defecto  
ðŸŒ **Multi-idioma:** EspaÃ±ol, InglÃ©s, FrancÃ©s  
ðŸ“± **Responsive:** Funciona en mÃ³vil y desktop  
ðŸ¤– **IA Integrada:** AnÃ¡lisis inteligente con Gemini  

---

**Â¿Necesitas ayuda?** Revisa el archivo `README.md` o `DEPLOYMENT.md` para mÃ¡s informaciÃ³n.

