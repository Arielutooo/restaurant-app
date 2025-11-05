# 🔐 Guía de Autenticación para Staff

## 📋 Resumen

Todos los paneles de staff (Cocina, Garzón, Owner) ahora requieren autenticación mediante email y contraseña. Esto garantiza:

- ✅ Seguridad: Solo personal autorizado accede a las funciones
- ✅ Auditoría: Registro de quién realiza cada acción
- ✅ Control de roles: Permisos específicos por tipo de usuario

---

## 🔑 Credenciales de Prueba

### Owner / Administrador
```
Email: owner@restaurant.com
Contraseña: admin123
Roles: Acceso completo a todas las funciones
```

### Cocina
```
Email: kitchen@restaurant.com
Contraseña: admin123
Roles: Solo panel de cocina (KDS)
```

### Garzón
```
Email: waiter@restaurant.com
Contraseña: admin123
Roles: Solo panel de garzón (aprobar, servir)
```

### Admin (acceso total)
```
Email: admin@restaurant.com
Contraseña: admin123
Roles: Acceso a todos los paneles
```

---

## 🚀 Flujos de Autenticación

### 1. Acceso a Cocina (`/kitchen`)

**Flujo:**
```
1. Navega a http://localhost:3000/kitchen
2. Sistema verifica autenticación
3. Si NO autenticado → redirige a /staff/login
4. Ingresa credenciales de cocina
5. Sistema valida credenciales y rol
6. Si rol = 'kitchen' o 'admin' → acceso concedido
7. Redirige automáticamente a /kitchen
```

**Pantalla de Login:**
- Pre-rellena email: `kitchen@restaurant.com`
- Solicita contraseña
- Muestra credenciales de prueba como ayuda

**Sesión:**
- Token JWT guardado en `localStorage`
- Sesión persiste al recargar página
- Botón "Cerrar Sesión" (ícono logout) en header

---

### 2. Acceso a Garzón (`/waiter`)

**Flujo:**
```
1. Navega a http://localhost:3000/waiter
2. Sistema verifica autenticación
3. Si NO autenticado → redirige a /staff/login
4. Ingresa credenciales de garzón
5. Sistema valida credenciales y rol
6. Si rol = 'waiter' o 'admin' → acceso concedido
7. Redirige automáticamente a /waiter
```

**Funcionalidades:**
- Ver pedidos pendientes de aprobación
- Ver pedidos listos para servir
- Marcar pedidos como servidos
- Sesión persistente

---

### 3. Acceso a Owner (`/owner/*`)

**Flujo:**
```
1. Navega a http://localhost:3000/owner/login
2. Ingresa credenciales de owner
3. Sistema valida credenciales y rol
4. Si rol = 'owner' o 'admin' → acceso concedido
5. Redirige a /owner/dashboard
```

**Funcionalidades:**
- Dashboard con analytics en tiempo real
- Gestión de menú (CRUD)
- Métricas de ventas
- Reportes y tendencias

---

## 🛠️ Implementación Técnica

### Backend: Middleware de Autenticación

**`requireAuth`** - Verifica que el usuario esté autenticado
```javascript
// backend/src/middlewares/auth.js
- Extrae token JWT del header Authorization
- Verifica validez del token
- Adjunta user info a req.staff y req.role
- Si falla → 401 Unauthorized
```

**`requireRole(['roles'])`** - Verifica roles específicos
```javascript
// backend/src/middlewares/auth.js
- Recibe array de roles permitidos
- Verifica que req.role esté en el array
- Si no coincide → 403 Forbidden
```

**Rutas Protegidas:**
```javascript
// /kitchen/* → requireAuth + requireRole(['kitchen', 'admin'])
// /waiter/* → requireAuth + requireRole(['waiter', 'admin'])
// /owner/* → requireAuth + requireRole(['owner', 'admin'])
```

---

### Frontend: AuthContext

**Ubicación:** `frontend/src/context/AuthContext.jsx`

**Funciones:**
```javascript
{
  user,              // Objeto con datos del staff autenticado
  token,             // JWT token
  loading,           // Estado de carga
  isAuthenticated,   // Boolean: si hay usuario autenticado
  hasRole(roles),    // Función: verifica si user tiene uno de los roles
  login(email, pw),  // Función: iniciar sesión
  logout()           // Función: cerrar sesión
}
```

**Uso en componentes:**
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/staff/login');
      return;
    }

    if (!hasRole(['kitchen', 'admin'])) {
      alert('Sin permisos');
      navigate('/');
      return;
    }
  }, [isAuthenticated, hasRole]);

  return (
    <div>
      <p>Hola {user.name}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

---

### API Client: Interceptor de Token

**Ubicación:** `frontend/src/api/api.js`

**Implementación:**
```javascript
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Resultado:**
- Todas las peticiones autenticadas incluyen el token automáticamente
- No necesitas agregar el header manualmente en cada llamada

---

## 🔄 Ciclo de Vida de la Sesión

### 1. Login Exitoso
```
1. Usuario ingresa email/password
2. POST /api/auth/login
3. Backend valida y genera JWT
4. Frontend guarda:
   - localStorage.setItem('authToken', token)
   - localStorage.setItem('authUser', JSON.stringify(staff))
5. AuthContext actualiza estado
6. Redirige a pantalla solicitada
```

### 2. Recarga de Página
```
1. AuthProvider se monta
2. Lee localStorage.getItem('authToken')
3. Si existe token:
   - Actualiza estado inmediatamente (loading = false)
   - Llama GET /api/auth/me en background para validar
4. Si token inválido → logout automático
```

### 3. Navegación Protegida
```
1. Usuario navega a /kitchen o /waiter
2. useEffect verifica isAuthenticated
3. Si NO autenticado → navigate('/staff/login')
4. Si autenticado pero sin rol → alert + navigate('/')
5. Si todo OK → muestra contenido
```

### 4. Logout
```
1. Usuario click en botón logout
2. Confirm de confirmación
3. Si acepta:
   - localStorage.removeItem('authToken')
   - localStorage.removeItem('authUser')
   - AuthContext actualiza estado (user = null)
   - navigate('/staff/login')
```

---

## 🐛 Resolución de Problemas

### Error 401: No autorizado

**Síntoma:**
```
GET /api/kitchen/orders 401 (Unauthorized)
error: "No autorizado: token requerido"
```

**Causa:**
- No hay token en localStorage
- Token expirado o inválido
- Usuario no ha iniciado sesión

**Solución:**
1. Verifica que hayas iniciado sesión en `/staff/login`
2. Si persiste, borra localStorage y vuelve a iniciar sesión:
   ```javascript
   localStorage.clear();
   window.location.href = '/staff/login';
   ```

---

### Error 403: Prohibido

**Síntoma:**
```
GET /api/kitchen/orders 403 (Forbidden)
error: "Acceso denegado"
```

**Causa:**
- Usuario autenticado pero sin el rol requerido
- Ej: usuario 'waiter' intentando acceder a /kitchen

**Solución:**
1. Verifica que estás usando las credenciales correctas
2. Cocina: `kitchen@restaurant.com`
3. Garzón: `waiter@restaurant.com`
4. O usa `admin@restaurant.com` (acceso total)

---

### Sesión No Persiste

**Síntoma:**
- Cada recarga pide login nuevamente
- Token no se guarda

**Causa:**
- localStorage bloqueado (modo incógnito)
- Cookies deshabilitadas

**Solución:**
1. Usa navegador normal (no incógnito)
2. Habilita almacenamiento local en configuración del navegador
3. Verifica en DevTools → Application → Local Storage

---

### Token Expirado

**Síntoma:**
- Login exitoso pero 401 después de tiempo

**Causa:**
- JWT tiene expiración (actualmente 7 días)

**Solución:**
1. Vuelve a iniciar sesión
2. (Futuro) Implementar refresh token automático

---

## 📊 Monitoreo

### Ver Token Actual
```javascript
// En DevTools Console
localStorage.getItem('authToken')
```

### Ver Usuario Actual
```javascript
JSON.parse(localStorage.getItem('authUser'))
```

### Decodificar JWT (sin verificar)
```javascript
// En https://jwt.io
// Pega el token de localStorage
// Verás el payload: { staffId, role, iat, exp }
```

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas

✅ **Tokens JWT**: No se guardan contraseñas, solo tokens firmados
✅ **HTTPS**: En producción, SIEMPRE usar HTTPS
✅ **Expiración**: Tokens expiran después de 7 días
✅ **HttpOnly** (futuro): Mover token a cookies HttpOnly
✅ **CORS**: Configurado para permitir solo orígenes autorizados
✅ **Bcrypt**: Contraseñas hasheadas en BD (nunca en texto plano)

### Para Producción

⚠️ **Cambiar contraseñas por defecto**
⚠️ **Usar HTTPS obligatorio**
⚠️ **Implementar refresh tokens**
⚠️ **Rate limiting en /auth/login**
⚠️ **2FA para owner**
⚠️ **Logs de auditoría**

---

## 🎯 Resumen Rápido

| Ruta | Requiere Auth | Roles Permitidos | Credenciales |
|------|---------------|------------------|--------------|
| `/kitchen` | ✅ Sí | kitchen, admin | kitchen@restaurant.com |
| `/waiter` | ✅ Sí | waiter, admin | waiter@restaurant.com |
| `/owner/*` | ✅ Sí | owner, admin | owner@restaurant.com |
| `/menu` | ❌ No | - | - |
| `/table/:id` | ❌ No | - | - |
| `/payment` | ❌ No | - | - |

**Contraseña universal de prueba:** `admin123`

---

## 📞 Contacto

Si encuentras problemas con la autenticación, revisa:
1. Esta guía
2. Console del navegador (F12)
3. Network tab para ver requests
4. Application → Local Storage

¡Listo! Ahora tienes autenticación completa en todo el sistema. 🚀

