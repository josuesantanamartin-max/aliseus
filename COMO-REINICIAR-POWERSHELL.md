# ðŸ”„ CÃ³mo Reiniciar PowerShell - GuÃ­a Visual

## Â¿Por quÃ© necesitas reiniciar PowerShell?

Cuando instalas Node.js, se aÃ±ade automÃ¡ticamente al **PATH** del sistema. Sin embargo, las ventanas de PowerShell que ya estaban abiertas **no detectan estos cambios automÃ¡ticamente**.

---

## âœ… MÃ©todo 1: Cerrar y Abrir (MÃS FÃCIL)

### Paso a Paso:

1. **Cierra la ventana de PowerShell actual**
   - Haz clic en la **X** en la esquina superior derecha
   - O presiona `Alt + F4`
   - O escribe `exit` y presiona Enter

2. **Abre una nueva ventana de PowerShell**
   
   **OpciÃ³n A - Desde el MenÃº Inicio:**
   - Presiona `Windows + S`
   - Escribe "PowerShell"
   - Haz clic en "Windows PowerShell" o "PowerShell"

   **OpciÃ³n B - Desde el Explorador de Archivos:**
   - Navega al directorio del proyecto
   - Haz clic derecho en el espacio vacÃ­o
   - Selecciona "Abrir en Terminal" o "Abrir PowerShell aquÃ­"

   **OpciÃ³n C - Desde la Barra de Tareas:**
   - Si tienes PowerShell anclado, haz clic en el icono

3. **Navega al directorio del proyecto:**
   ```powershell
   cd "D:\Users\JosuÃ©\Desktop\Aliseus-Suite-main\Aliseus-Suite-main"
   ```

4. **Verifica que Node.js funciona:**
   ```powershell
   node --version
   npm --version
   ```

   Si ves nÃºmeros de versiÃ³n (ej: `v20.10.0`), Â¡estÃ¡ funcionando! âœ…

---

## ðŸ”„ MÃ©todo 2: Recargar PATH sin Cerrar

Si no quieres cerrar PowerShell, puedes recargar las variables de entorno:

### OpciÃ³n A - Usar el Script Incluido:

```powershell
.\RECARGAR-PATH.ps1
```

### OpciÃ³n B - Comando Manual:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Luego verifica:
```powershell
node --version
```

**Nota:** Este mÃ©todo a veces no funciona si Node.js se instalÃ³ mientras PowerShell estaba abierto. En ese caso, usa el MÃ©todo 1.

---

## ðŸŽ¯ VerificaciÃ³n RÃ¡pida

DespuÃ©s de reiniciar, ejecuta estos comandos para verificar:

```powershell
# Verificar Node.js
node --version
# DeberÃ­a mostrar algo como: v20.10.0

# Verificar npm
npm --version
# DeberÃ­a mostrar algo como: 10.2.3

# Verificar que estÃ¡s en el directorio correcto
Get-Location
# DeberÃ­a mostrar la ruta a Aliseus-Suite-main
```

---

## â“ Problemas Comunes

### "node no se reconoce" despuÃ©s de reiniciar

**Posibles causas:**
1. Node.js no se instalÃ³ correctamente
2. No reiniciaste PowerShell
3. Node.js no se aÃ±adiÃ³ al PATH

**SoluciÃ³n:**
1. Verifica que Node.js estÃ© instalado:
   - Abre "Agregar o quitar programas" en Windows
   - Busca "Node.js"
   - Si no aparece, reinstala desde nodejs.org

2. Verifica el PATH manualmente:
   ```powershell
   $env:Path -split ';' | Select-String "node"
   ```
   DeberÃ­a mostrar una ruta como: `C:\Program Files\nodejs\`

3. Si no aparece, reinstala Node.js y marca la opciÃ³n "Add to PATH" durante la instalaciÃ³n

### PowerShell se abre en otro directorio

**SoluciÃ³n:**
```powershell
# Navega al directorio del proyecto
cd "D:\Users\JosuÃ©\Desktop\Aliseus-Suite-main\Aliseus-Suite-main"

# O usa la ruta corta si hay problemas con caracteres especiales
cd D:\Users\Josu*\Desktop\Aliseus-Suite-main\Aliseus-Suite-main
```

---

## ðŸ’¡ Consejos

- **Siempre reinicia PowerShell** despuÃ©s de instalar programas que modifican el PATH
- Si tienes mÃºltiples ventanas de PowerShell abiertas, ciÃ©rralas todas
- Usa el script `EJECUTAR-APP.ps1` que verifica automÃ¡ticamente si Node.js estÃ¡ disponible

---

## ðŸš€ Siguiente Paso

Una vez que Node.js estÃ© funcionando, ejecuta:

```powershell
.\EJECUTAR-APP.ps1
```

O manualmente:
```powershell
npm install
npm run dev
```

Â¡Y listo! Aliseus estarÃ¡ corriendo en http://localhost:3000 ðŸŽ‰


