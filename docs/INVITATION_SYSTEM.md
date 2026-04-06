# Sistema de Invitaciones - Socio Fundador

## Descripción

Sistema completo de códigos de invitación para controlar el acceso a la beta de Aliseus.

---

## Archivos Creados

### 1. Base de Datos
**`supabase/migrations/20260205_beta_invitations.sql`**
- Tabla `beta_invitations` con RLS
- Función `use_invitation_code()` para validar y usar códigos
- Función `generate_invitation_code()` para generar códigos aleatorios
- Índices para optimización
- Políticas de seguridad

### 2. Servicio
**`services/invitationService.ts`**
- `validateCode()` - Validar código de invitación
- `useCode()` - Marcar código como usado
- `generateCode()` - Generar código individual
- `generateBatch()` - Generar múltiples códigos
- `getAll()` - Obtener todos los códigos (admin)
- `getStats()` - Estadísticas de uso
- `deactivate()` - Desactivar código
- `delete()` - Eliminar código

### 3. Componentes UI
**`components/auth/InvitationInput.tsx`**
- Input con formato automático (XXXX-XXXX-XXXX)
- Validación en tiempo real
- Estados visuales (válido/inválido)
- Mensajes de error

**`components/features/settings/InvitationManager.tsx`**
- Panel de administración
- Estadísticas (total, activos, usados, expirados)
- Tabla de códigos
- Crear códigos individuales o en lote
- Copiar, desactivar, eliminar códigos

---

## Implementación

### Paso 1: Ejecutar Migración

```bash
# Conectar a Supabase
supabase db push

# O ejecutar manualmente en SQL Editor
```

### Paso 2: Integrar en Registro

Modificar `components/auth/AuthGate.tsx` o componente de registro:

```tsx
import { InvitationInput } from './InvitationInput';
import { invitationService } from '../../services/invitationService';

// En el componente de registro
const [invitationCode, setInvitationCode] = useState('');
const [isCodeValid, setIsCodeValid] = useState(false);

// Después del registro exitoso
const handleSignup = async () => {
    // ... registro normal ...
    
    if (isCodeValid && invitationCode) {
        await invitationService.useCode(invitationCode, userId);
    }
};

// En el JSX
<InvitationInput
    onValidCode={(code) => {
        setInvitationCode(code);
        setIsCodeValid(true);
    }}
    onInvalidCode={() => {
        setIsCodeValid(false);
    }}
/>
```

### Paso 3: Añadir Panel Admin

En `components/features/settings/SettingsModule.tsx`:

```tsx
import InvitationManager from './InvitationManager';

// Añadir pestaña
{userRole === 'admin' && (
    <InvitationManager />
)}
```

---

## Uso

### Generar Códigos (Admin)

1. Ir a **Configuración → Invitaciones**
2. Click en **Crear Código**
3. Configurar:
   - Email (opcional)
   - Usos máximos (1-100)
   - Expiración (días, 0 = nunca)
   - Cantidad (1-100 códigos)
4. Click en **Crear**

### Validar Código (Usuario)

1. En registro, introducir código: `ABCD-EFGH-IJKL`
2. Click en **Validar Código**
3. Si es válido, continuar con registro
4. El código se marca como usado automáticamente

---

## Formato de Código

- **Longitud:** 12 caracteres
- **Formato:** XXXX-XXXX-XXXX
- **Caracteres:** A-Z, 2-9 (excluye 0, 1, O, I para evitar confusión)
- **Ejemplo:** `A3K9-M7P2-Q4R8`

---

## Características

### Validación
- ✅ Código existe
- ✅ Código activo
- ✅ No expirado
- ✅ Usos disponibles

### Seguridad
- ✅ RLS habilitado
- ✅ Solo admins pueden crear/gestionar
- ✅ Cualquiera puede validar (para registro)
- ✅ Función SECURITY DEFINER para usar código

### Flexibilidad
- ✅ Códigos de un solo uso
- ✅ Códigos multi-uso (1-100)
- ✅ Expiración configurable
- ✅ Generación en lote
- ✅ Asociar a email específico

---

## Estadísticas

El panel muestra:
- **Total:** Códigos creados
- **Activos:** Códigos válidos disponibles
- **Usados:** Códigos agotados
- **Expirados:** Códigos vencidos

---

## Casos de Uso

### 1. Beta Privada Limitada
```typescript
// 50 códigos de un solo uso, expiran en 7 días
await invitationService.generateBatch(50, {
    max_uses: 1,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
});
```

### 2. Invitación Personal
```typescript
// Código para email específico, 1 uso, 30 días
await invitationService.generateCode({
    email: 'usuario@ejemplo.com',
    max_uses: 1,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});
```

### 3. Código Compartible
```typescript
// Código para compartir en redes, 100 usos, sin expiración
await invitationService.generateCode({
    max_uses: 100
});
```

---

## Testing

```typescript
// Validar código
const result = await invitationService.validateCode('ABCD-EFGH-IJKL');
console.log(result); // { valid: true } o { valid: false, message: '...' }

// Usar código
const success = await invitationService.useCode('ABCD-EFGH-IJKL', userId);
console.log(success); // true o false

// Obtener estadísticas
const stats = await invitationService.getStats();
console.log(stats); // { total: 10, active: 5, used: 3, expired: 2 }
```

---

## Próximos Pasos

1. ✅ Ejecutar migración en Supabase
2. ✅ Integrar `InvitationInput` en registro
3. ✅ Añadir `InvitationManager` a settings (solo admin)
4. ✅ Generar códigos iniciales
5. ✅ Probar flujo completo
6. ✅ Distribuir códigos a beta testers

---

**Sistema listo para controlar acceso a beta** ✅
