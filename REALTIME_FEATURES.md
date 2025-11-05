# 🔄 Características en Tiempo Real - Documentación

## 📋 Resumen de la Iteración

Esta iteración agrega tres funcionalidades principales al sistema de restaurant:

1. **Auto-habilitación del pago en tiempo real** mediante WebSocket
2. **Pedidos adicionales** - El cliente puede agregar más items a una orden existente
3. **Vista de mesas abiertas para el garzón** con actualización en vivo

---

## 🎯 Objetivos Completados

### ✅ 1. Fix Tiempo Real del Pago

**Problema:** El botón de pago del cliente no se habilitaba automáticamente cuando el garzón marcaba la orden como "servida".

**Solución Implementada:**
- WebSocket con Socket.IO para eventos en tiempo real
- El cliente se suscribe a eventos de su orden específica
- Cuando el garzón marca la orden como `served`, se emite evento `order:updated`
- El botón de pago se habilita automáticamente SIN refrescar la página
- Fallback con polling cada 10s si WebSocket falla

**Resultado:** 
- ✅ Habilitación instantánea (< 1 segundo)
- ✅ Sin necesidad de recargar página
- ✅ Backend sigue bloqueando el pago si `status !== 'served'` (409 error)

---

### ✅ 2. Pedidos Adicionales (Add-ons)

**Problema:** El cliente no podía agregar más items después de enviar su primer pedido.

**Solución Implementada:**
- Nuevo endpoint `POST /api/order/:orderId/items`
- El cliente puede agregar items mientras la orden NO esté pagada
- Los nuevos items van directo a cocina (o a aprobación si `requiresApproval=true`)
- Se recalcula el total automáticamente
- Si la orden estaba `served`, vuelve a `kitchen` (el pago se deshabilita hasta que todo esté servido)
- Eventos WebSocket notifican al cliente, cocina y garzón

**Resultado:**
- ✅ Cliente puede hacer pedidos incrementales
- ✅ Total se actualiza en tiempo real
- ✅ Botón de pago se deshabilita si hay items no servidos
- ✅ Cocina y garzón ven los nuevos items inmediatamente

---

### ✅ 3. Vista de Mesas Abiertas para Garzón

**Problema:** El garzón solo veía una "cola" lineal de pedidos listos, sin contexto de qué mesa tiene qué.

**Solución Implementada:**
- Nueva vista `/waiter/tables` con endpoint `GET /api/waiter/open-tables`
- Muestra todas las mesas con pedidos activos (no pagados)
- Para cada mesa:
  - Total acumulado de todas las órdenes
  - Cantidad de items por estado (pending, kitchen, ready, served)
  - Estado principal (kitchen, ready_to_serve, served)
  - Indicador de "items nuevos" (< 1 minuto)
  - Lista expandible de órdenes
- Actualización en tiempo real mediante WebSocket
- Botón para marcar orden como servida directamente

**Resultado:**
- ✅ Visión global de todas las mesas activas
- ✅ Priorización visual (listos en verde, nuevos en amarillo)
- ✅ Actualización en vivo cuando cocina marca items como listos
- ✅ Acción rápida para marcar servido

---

## 🔧 Arquitectura Técnica

### Backend

#### WebSocket Server (Socket.IO)

**Archivo:** `backend/src/server.js`

```javascript
// Configuración Socket.IO
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:3000', credentials: true }
});

// Salas (rooms):
// - order:{orderId} → Cliente escucha su orden
// - table:{tableId} → Garzón escucha una mesa
// - staff:kitchen → Notificaciones a cocina
// - staff:waiter → Notificaciones a garzones
// - open_tables → Actualiz. de mesas abiertas
```

**Eventos Emitidos:**

| Evento | Cuándo | Datos | Quién Escucha |
|--------|--------|-------|---------------|
| `order:updated` | Cambio de estado de orden | `{orderId, status, servedAt, canPay}` | Cliente, Garzón |
| `order:item_added` | Se agregan items | `{orderId, item}` | Cliente, Cocina, Garzón |
| `order:item_status` | Cambio de estado de item | `{orderId, itemId, status}` | Cliente, Garzón |
| `order:item_ready` | Item listo para servir | `{orderId, itemId, tableNumber}` | Garzón |
| `order:all_ready` | Todos los items listos | `{orderId, tableNumber}` | Garzón |
| `order:new_items` | Items nuevos agregados | `{orderId, tableNumber, itemCount}` | Cocina |

#### Utilidades de Orden

**Archivo:** `backend/src/utils/orderUtils.js`

```javascript
// Funciones clave:
- recomputeOrderStatus(order) 
  // Calcula estado global basado en items

- recomputeOrderTotals(order)
  // Recalcula subtotal, tax, tip, grandTotal

- areAllItemsServed(order)
  // Verifica si todos los items están servidos

- canAddItemsToOrder(order)
  // Valida si se pueden agregar items (no pagada/cancelada)

- getOrderSummary(order)
  // Resumen completo para cliente
```

#### Nuevos Endpoints

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| `GET` | `/api/order/:orderId` | Obtener detalles completos de una orden | Pública |
| `POST` | `/api/order/:orderId/items` | Agregar items a orden existente | Pública |
| `GET` | `/api/waiter/open-tables` | Listar mesas con órdenes activas | requireAuth + waiter |
| `GET` | `/api/waiter/table/:tableId/orders` | Órdenes de una mesa específica | requireAuth + waiter |

**Validaciones Importantes:**

```javascript
// POST /api/order/:orderId/items
// ✅ Valida que la orden exista
// ✅ Valida que NO esté pagada o cancelada
// ✅ Valida stock de cada item
// ✅ Reduce stock automáticamente
// ✅ Recalcula totales
// ✅ Recalcula estado (puede volver de 'served' a 'kitchen')
// ✅ Emite eventos WebSocket

// POST /api/payment/create
// ✅ Valida que order.status === 'served'
// ✅ Devuelve 409 si NO está servida
// ✅ Solo procede si TODOS los items están servidos
```

---

### Frontend

#### Hook de WebSocket

**Archivo:** `frontend/src/hooks/useSocket.js`

**Hooks Disponibles:**

```javascript
// 1. Para clientes - escuchar su orden
const { socket, isConnected } = useOrderChannel(
  orderId,
  onOrderUpdated,
  onItemAdded,
  onItemStatusUpdated
);

// 2. Para staff - escuchar eventos generales
const { socket, isConnected } = useStaffChannel(
  role, // 'kitchen' | 'waiter'
  onEvent
);

// 3. Para garzón - escuchar mesas abiertas
const { socket, isConnected } = useOpenTablesChannel(
  onTableUpdated
);
```

**Características:**
- Auto-reconexión si se pierde la conexión
- Fallback a polling si WebSocket falla
- Logs detallados en consola
- Estado de conexión (`isConnected`)

#### Componentes Actualizados

**1. OrderStatus (`frontend/src/pages/OrderStatus.jsx`)**

- Conecta WebSocket con `useOrderChannel`
- Escucha `order:updated` para cambios de estado
- Escucha `order:item_added` para items nuevos
- Auto-habilita botón "Proceder al Pago" cuando `status === 'served'`
- Indicador visual de conexión WebSocket (verde/rojo)
- Botón "Agregar más items" cuando la orden no está pagada
- Fallback con fetch cada 10s si WebSocket no conecta

**2. WaiterOpenTables (`frontend/src/pages/WaiterOpenTables.jsx`)**

- Nueva vista en `/waiter/tables`
- Lista todas las mesas con órdenes activas
- Agrupa órdenes por mesa
- Muestra estado agregado de items (pending/kitchen/ready/served)
- Total acumulado por mesa
- Indicador de "items nuevos" (badge amarillo)
- Conexión WebSocket para actualización en tiempo real
- Botón para marcar orden completa como servida
- Expandible para ver detalle de cada orden por mesa

**3. API Client (`frontend/src/api/api.js`)**

Nuevos endpoints agregados:

```javascript
export const getOrderDetails = (orderId) =>
  api.get(`/order/${orderId}`);

export const addItemsToOrder = (orderId, items, requiresApproval = false) =>
  api.post(`/order/${orderId}/items`, { items, requiresApproval });

export const getOpenTables = () =>
  api.get('/waiter/open-tables');

export const getTableOrders = (tableId) =>
  api.get(`/waiter/table/${tableId}/orders`);
```

---

## 🧪 Pruebas E2E

### Test 1: Auto-habilitación del Pago

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Navegador 1: Cliente (http://localhost:3000/table/1)
1. Agregar items al carrito
2. Confirmar pedido
3. Redirige a /order-status
4. Estado: "En Preparación" 🧑‍🍳
5. Botón de pago DESHABILITADO
6. Indicador WebSocket: verde "Tiempo real"

# Navegador 2: Cocina (http://localhost:3000/kitchen)
7. Login: kitchen@restaurant.com / admin123
8. Ver pedido de Mesa 1
9. Click "Listo para servir"

# Navegador 3: Garzón (http://localhost:3000/waiter/tables)
10. Login: waiter@restaurant.com / admin123
11. Ver Mesa 1 con badge verde "Listo para Servir"
12. Click "Marcar Servido"

# Navegador 1 (Cliente) - automático
13. ✅ Estado cambia a "¡Pedido Servido!" (SIN recargar)
14. ✅ Botón "Proceder al Pago" se HABILITA automáticamente
15. ✅ En < 1 segundo desde que el garzón marcó
16. Click "Proceder al Pago"
17. ✅ Payment funciona correctamente
```

**Resultado Esperado:** ✅ PASADO

---

### Test 2: Pedidos Adicionales

```bash
# Continuando del Test 1, ANTES de pagar:

# Navegador 1: Cliente en /order-status
1. Estado actual: "¡Pedido Servido!"
2. Botón "Agregar más items" visible
3. Click "Agregar más items"
4. Redirige a /menu

# En /menu:
5. Agregar 1-2 items nuevos al carrito
6. Confirmar
7. ✅ Items se agregan a la orden existente
8. ✅ Redirige a /order-status
9. ✅ Estado vuelve a "En Preparación" (automático)
10. ✅ Botón de pago se DESHABILITA (automático)
11. ✅ Total actualizado con nuevos items

# Navegador 2: Cocina
12. ✅ Los nuevos items aparecen en el pedido de Mesa 1
13. Click "Listo para servir"

# Navegador 3: Garzón
14. ✅ Mesa 1 vuelve a aparecer con badge verde
15. Click "Marcar Servido"

# Navegador 1: Cliente
16. ✅ Estado cambia a "Servido" (SIN recargar)
17. ✅ Botón de pago se REHABILITA automáticamente
18. ✅ Total incluye items originales + nuevos
19. Pagar exitosamente
```

**Resultado Esperado:** ✅ PASADO

---

### Test 3: Vista de Mesas Abiertas

```bash
# Setup: Crear 3 pedidos en mesas diferentes

# Mesa 1: 2 items en cocina
# Mesa 2: 3 items listos para servir
# Mesa 3: 1 item servido, 2 en cocina

# Navegador: Garzón en /waiter/tables
# Login: waiter@restaurant.com / admin123

1. ✅ Ve 3 mesas en la lista
2. ✅ Indicador WebSocket verde "Live"
3. ✅ Stats globales:
   - 3 Mesas Activas
   - 8 Items Totales
   - 1 Mesa con badge verde (Mesa 2)

4. Mesa 2 tiene:
   - Badge verde "Listo para Servir"
   - 3 items en estado "Listos"
   - Botón "Marcar Servido" visible

5. Click "Marcar Servido" en Mesa 2
6. ✅ Orden marcada como servida
7. ✅ Mesa 2 desaparece de la lista (ya está servida)
8. ✅ Stats se actualizan: 2 Mesas Activas, 5 Items Totales

# Mientras tanto, en Cocina:
9. Marcar item de Mesa 3 como listo

# En Garzón (automático):
10. ✅ Mesa 3 cambia badge a verde "Listo para Servir" (SIN recargar)
11. ✅ Contador de items listos aumenta
12. ✅ En < 1 segundo desde que cocina marcó
```

**Resultado Esperado:** ✅ PASADO

---

## 🚀 Cómo Usar las Nuevas Funcionalidades

### Para el Cliente

#### 1. Agregar Items Adicionales

```
1. Hacer pedido inicial desde /menu
2. Confirmar pedido → Redirige a /order-status
3. Ver estado del pedido en tiempo real
4. Si quieres agregar más:
   - Click botón "➕ Agregar más items"
   - Seleccionar nuevos items en /menu
   - Confirmar
   - Los items se agregan a la orden existente
   - El total se actualiza automáticamente
5. Esperar a que TODO esté servido
6. Botón de pago se habilitará automáticamente
7. Proceder al pago
```

**Nota:** No puedes agregar items después de haber pagado.

#### 2. Monitorear Estado en Tiempo Real

```
- Indicador verde "✅ Tiempo real" = Conectado a WebSocket
- Indicador rojo "Reconectando..." = Sin conexión (usa polling)
- Los cambios aparecen automáticamente:
  - "En Preparación" → Cocina está cocinando
  - "Listo para Servir" → Cocina terminó
  - "¡Pedido Servido!" → Garzón entregó → PUEDES PAGAR
```

---

### Para el Garzón

#### 1. Vista de Mesas Abiertas

```bash
# Acceso
http://localhost:3000/waiter/tables

# Login
waiter@restaurant.com / admin123

# Vista:
- Lista de todas las mesas con pedidos activos
- Badges de color por estado:
  * Verde = Listo para servir
  * Amarillo = Items nuevos (< 1 min)
  * Blanco = En cocina
- Stats globales arriba
- Click "Ver Órdenes" para expandir detalles
- Click "Marcar Servido" cuando entregas

# Actualización automática:
- Items nuevos → Badge amarillo aparece
- Cocina marca listo → Badge cambia a verde
- < 1 segundo de latencia
```

#### 2. Cola Tradicional (sigue disponible)

```bash
# Acceso
http://localhost:3000/waiter

# Vista original:
- Tab "Para Servir": Pedidos listos
- Marcar items o pedidos como servidos
- Sigue funcionando igual
```

---

### Para la Cocina

```bash
# Sin cambios en UI
http://localhost:3000/kitchen

# Funcionalidad nueva:
- Al marcar "Listo para servir":
  * Evento WebSocket emitido
  * Garzón ve el pedido en < 1 seg
  * Cliente ve cambio de estado
  
- Nuevos items agregados:
  * Aparecen automáticamente en tu vista
  * Sin necesidad de refrescar
```

---

## 📊 Métricas y Monitoreo

### Logs del Backend

```bash
# WebSocket
✅ Socket.IO inicializado en utils
🔌 Cliente conectado: {socketId}
📦 Cliente {socketId} unido a order:{orderId}
🪑 Cliente {socketId} unido a table:{tableId}
👤 Staff {socketId} unido a staff:{role}
🔌 Cliente desconectado: {socketId}

# Eventos emitidos
📡 order:updated emitido para {orderId}
📡 order:item_added emitido para {orderId}
📡 order:item_status emitido para {orderId}
📡 order_ready emitido a staff:waiter
📡 order:new_items emitido a staff:kitchen
```

### Logs del Frontend (Console)

```bash
# Conexión
🔌 WebSocket conectado
📦 Cliente {socketId} unido a order:{orderId}

# Eventos recibidos
📡 order:updated recibido: { orderId, status, servedAt, canPay }
📡 order:item_added recibido: { orderId, item }
🔄 Orden actualizada en tiempo real: { ... }

# Estado
✅ ¡Tu pedido ha sido servido! Ya puedes pagar.
➕ Item agregado: { ... }

# Desconexión
🔌 Cerrando WebSocket
```

---

## 🔒 Seguridad

### Validaciones Backend

```javascript
// POST /api/order/:orderId/items
✅ Validar que la orden exista
✅ Validar que NO esté pagada/cancelada
✅ Validar stock disponible de cada item
✅ Reducir stock atómicamente
✅ Recalcular totales server-side
✅ Recalcular estado con lógica server-side
✅ Emitir eventos solo a salas correctas

// POST /api/payment/create
✅ Gate crítico: Solo si status === 'served'
✅ Verificar que TODOS los items estén servidos
✅ No confiar en estado del frontend
✅ Devolver 409 si no cumple
```

### WebSocket Security

```javascript
// Socket.IO CORS
cors: {
  origin: 'http://localhost:3000', // Solo origen permitido
  credentials: true
}

// Salas (Rooms)
// - Cliente solo escucha SU orden
// - Staff escucha eventos de su rol
// - No hay cross-contamination
```

---

## ⚡ Performance

### Optimizaciones

- **WebSocket** en lugar de polling constante → Reduce latencia y carga del servidor
- **Fallback polling** cada 10-15s → Garantiza actualización si WebSocket falla
- **Rooms de Socket.IO** → Solo notifica a suscriptores relevantes
- **Recálculo eficiente** → Funciones puras en `orderUtils.js`
- **Índices MongoDB** → Queries rápidas en `Order.find()`

### Métricas Esperadas

| Métrica | Valor |
|---------|-------|
| Latencia WebSocket | < 500ms |
| Tiempo auto-habilitar pago | < 1 segundo |
| Tiempo ver item nuevo (cocina) | < 1 segundo |
| Tiempo ver mesa actualizada (garzón) | < 1 segundo |
| Overhead WebSocket | ~ 5KB por conexión |
| Reconexión automática | < 3 segundos |

---

## 🐛 Troubleshooting

### Problema: WebSocket no conecta

**Síntomas:**
- Indicador rojo "Reconectando..."
- Console: "WebSocket connection failed"

**Solución:**
```bash
1. Verificar que backend esté corriendo en puerto 4000
2. Verificar CORS en backend/src/server.js
3. Verificar firewall no bloquea WebSocket
4. Fallback: El sistema usa polling automáticamente
```

### Problema: Botón de pago no se habilita

**Síntomas:**
- Garzón marcó servido
- Cliente sigue viendo botón deshabilitado

**Diagnóstico:**
```bash
# Console del Cliente:
1. Verificar indicador WebSocket: verde o rojo?
2. Buscar log: "📡 order:updated recibido"
3. Si NO aparece:
   - WebSocket desconectado
   - Esperar 10s (fallback polling)
4. Si SÍ aparece pero botón no cambia:
   - Verificar estado en log: debe ser "served"
   - Si no es "served", revisar items no servidos
```

**Solución:**
```bash
# Opción 1: Recargar página cliente (F5)
# Opción 2: Verificar en backend:
curl http://localhost:4000/api/order/{orderId}
# Debe retornar: status: "served", canPay: true

# Opción 3: Verificar que TODOS los items estén servidos
# items[].status debe ser "served" para todos
```

### Problema: Items adicionales no aparecen en cocina

**Síntomas:**
- Cliente agrega items
- Cocina no los ve

**Diagnóstico:**
```bash
# Backend logs:
1. Buscar: "📡 order:new_items emitido a staff:kitchen"
2. Si NO aparece: Evento no se emitió
3. Si SÍ aparece: Cocina no está suscrita

# Cocina console:
1. Verificar: "🔌 Staff WebSocket conectado (kitchen)"
2. Si NO: Problema de autenticación o conexión
```

**Solución:**
```bash
# Cocina:
1. Refrescar página (F5)
2. Verificar login correcto
3. Esperar 3s (auto-refresh de órdenes)

# Si persiste:
curl http://localhost:4000/api/kitchen/orders
# Debe incluir los nuevos items
```

---

## 📦 Dependencias Nuevas

### Backend

```json
{
  "socket.io": "^4.6.0" // Ya estaba instalado
}
```

### Frontend

```json
{
  "socket.io-client": "^4.6.0" // Instalado en esta iteración
}
```

---

## 🔄 Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────┐
│                      1. PEDIDO INICIAL                       │
└─────────────────────────────────────────────────────────────┘
  Cliente (Mesa 1) → POST /api/order
  ↓
  Backend crea Order { status: 'kitchen', items: [...] }
  ↓
  WebSocket emit 'order:updated' → Cliente
  ↓
  Cliente va a /order-status (estado: "En Preparación")

┌─────────────────────────────────────────────────────────────┐
│                  2. AGREGAR ITEMS ADICIONALES                │
└─────────────────────────────────────────────────────────────┘
  Cliente → Click "Agregar más items"
  ↓
  Cliente → POST /api/order/{orderId}/items
  ↓
  Backend:
    - Agrega items a order.items[]
    - Recalcula totales
    - Recalcula estado (vuelve a 'kitchen')
    - order.servedAt = null
  ↓
  WebSocket emit:
    - 'order:updated' → Cliente (status: 'kitchen')
    - 'order:item_added' → Cliente, Cocina
    - 'order:new_items' → staff:kitchen
  ↓
  Cliente automáticamente:
    - Estado → "En Preparación"
    - Botón pago → DESHABILITADO

┌─────────────────────────────────────────────────────────────┐
│                   3. COCINA MARCA LISTO                      │
└─────────────────────────────────────────────────────────────┘
  Cocina → PATCH /api/kitchen/orders/{orderId}/ready
  ↓
  Backend:
    - order.items[].status = 'ready_to_serve'
    - order.status = 'ready_to_serve'
  ↓
  WebSocket emit:
    - 'order:updated' → Cliente (status: 'ready_to_serve')
    - 'order:all_ready' → staff:waiter
  ↓
  Cliente automáticamente:
    - Estado → "Listo para Servir"
  ↓
  Garzón /waiter/tables:
    - Mesa 1 badge → VERDE "Listo para Servir"

┌─────────────────────────────────────────────────────────────┐
│                  4. GARZÓN MARCA SERVIDO                     │
└─────────────────────────────────────────────────────────────┘
  Garzón → PATCH /waiter/orders/{orderId}/served
  ↓
  Backend:
    - order.items[].status = 'served'
    - order.status = 'served'
    - order.servedAt = now()
  ↓
  WebSocket emit:
    - 'order:updated' → Cliente (status: 'served', canPay: true)
  ↓
  Cliente automáticamente (< 1 segundo):
    - Estado → "¡Pedido Servido!" ✅
    - Botón pago → HABILITADO ✅
  ↓
  Garzón /waiter/tables:
    - Mesa 1 desaparece (ya está servida)

┌─────────────────────────────────────────────────────────────┐
│                      5. CLIENTE PAGA                         │
└─────────────────────────────────────────────────────────────┘
  Cliente → Click "Proceder al Pago"
  ↓
  Cliente → POST /api/payment/create
  ↓
  Backend:
    - Valida: order.status === 'served' ✅
    - Crea Payment
    - order.status = 'paid'
  ↓
  Cliente → Pago exitoso
  ↓
  Mesa 1 ya no aparece en /waiter/tables (pagada)
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Socket.IO instalado y configurado
- [x] Utilidades `orderUtils.js` creadas
- [x] Controladores emiten eventos WebSocket
- [x] Endpoint `POST /order/:orderId/items`
- [x] Endpoint `GET /waiter/open-tables`
- [x] Gate de pago validando `served`
- [x] Tests manuales pasados

### Frontend
- [x] socket.io-client instalado
- [x] Hook `useOrderChannel` creado
- [x] Hook `useOpenTablesChannel` creado
- [x] OrderStatus con WebSocket
- [x] OrderStatus auto-habilita pago
- [x] OrderStatus botón "Agregar más"
- [x] WaiterOpenTables creada
- [x] API client actualizado
- [x] Rutas agregadas a App.jsx
- [x] Tests E2E pasados

### Documentación
- [x] REALTIME_FEATURES.md completo
- [x] Ejemplos de uso
- [x] Troubleshooting guide
- [x] Flujo de datos documentado

---

## 🎉 Resultado Final

✅ **Sistema completamente funcional con características en tiempo real**

- Auto-habilitación del pago en < 1 segundo
- Pedidos incrementales sin límite
- Vista de mesas abiertas para garzón
- Actualización en vivo en todos los paneles
- Fallback robusto si WebSocket falla
- Gate de seguridad en el pago intacto

**¡Listo para usar en producción (con ajustes de seguridad y escalabilidad)!**

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de backend y frontend console
2. Verifica el estado de conexión WebSocket
3. Consulta la sección de Troubleshooting
4. Verifica que todos los servicios estén corriendo
5. Prueba el fallback de polling esperando 10-15s

Para preguntas sobre la implementación, revisa el código fuente con comentarios detallados en:
- `backend/src/utils/orderUtils.js`
- `backend/src/utils/socketEvents.js`
- `frontend/src/hooks/useSocket.js`
- `frontend/src/pages/OrderStatus.jsx`
- `frontend/src/pages/WaiterOpenTables.jsx`

