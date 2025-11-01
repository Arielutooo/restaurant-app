# 🏗️ Arquitectura del Sistema

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (PWA)                        │
│  React + Vite + Context API + React Router             │
│  - Escaneo QR                                           │
│  - Menú Digital                                         │
│  - Carrito                                              │
│  - Pagos                                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP/REST
                 │
┌────────────────▼────────────────────────────────────────┐
│              BACKEND API (Node.js)                      │
│  Express + MongoDB + JWT + Stripe                       │
│  ┌──────────────────────────────────────────┐          │
│  │ Controllers                               │          │
│  │ - Session, Menu, Order, Payment          │          │
│  └──────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────┐          │
│  │ Services                                  │          │
│  │ - QR, Payment, CRM Integration           │          │
│  └──────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────┐          │
│  │ Models                                    │          │
│  │ - Table, MenuItem, Order, Payment, Staff │          │
│  └──────────────────────────────────────────┘          │
└────────────────┬───────────┬────────────────────────────┘
                 │           │
        ┌────────┘           └────────┐
        │                              │
        ▼                              ▼
┌───────────────┐              ┌──────────────┐
│   MongoDB     │              │   CRM API    │
│  Restaurant   │              │  Analytics   │
│   Database    │              └──────┬───────┘
└───────────────┘                     │
                                      ▼
                              ┌──────────────┐
                              │   MongoDB    │
                              │  CRM Events  │
                              └──────────────┘
```

## Flujo de Datos Principal

### 1. Flujo de Sesión (QR)

```
Cliente escanea QR
    ↓
Frontend obtiene token del QR
    ↓
POST /api/session/from-qr
    ↓
Backend valida JWT del token
    ↓
Abre mesa (status: 'open')
    ↓
Devuelve sesión con tableId y sessionId
    ↓
Cliente guarda en localStorage
```

### 2. Flujo de Pedido

```
Cliente selecciona items
    ↓
Guarda en carrito (localStorage)
    ↓
POST /api/cart/validate
    ↓
Backend verifica stock disponible
    ↓
POST /api/order
    ↓
Backend:
  - Reduce stock
  - Crea orden (status: 'awaiting_approval')
  - Envía evento a CRM
    ↓
Garzón ve pedido pendiente
    ↓
POST /api/order/approve (con PIN)
    ↓
Backend:
  - Verifica PIN
  - Actualiza status → 'kitchen'
  - Envía evento a CRM
    ↓
Cocina ve pedido
    ↓
PUT /api/order/status (status: 'ready')
```

### 3. Flujo de Pago

```
Cliente selecciona método de pago
    ↓
POST /api/payment/create
    ↓
Backend:
  - Crea Payment (status: 'pending')
  - Genera PaymentIntent (Stripe) o Transaction (WebPay)
  - Envía evento a CRM
    ↓
Cliente completa pago en pasarela
    ↓
Webhook callback
    ↓
POST /api/payment/confirm
    ↓
Backend:
  - Actualiza Payment (status: 'success')
  - Actualiza Order (status: 'paid')
  - Envía evento a CRM
    ↓
Cliente ve confirmación
```

## Modelos de Datos

### Relaciones

```
Table (1) ──── (N) Orders
Order (N) ──── (1) Table
Order (1) ──── (N) OrderItems
OrderItem (N) ──── (1) MenuItem
Order (1) ──── (1) Payment
Staff (1) ──── (N) Orders (approvedBy)
```

### Estados de Orden

```
pending
    ↓
awaiting_approval (si requiresApproval = true)
    ↓
kitchen (aprobado por garzón o automático)
    ↓
ready (cocina terminó)
    ↓
served (garzón confirmó entrega)
    ↓
paid (pago confirmado)
```

## Seguridad

### Autenticación

1. **QR Token (JWT)**
```javascript
{
  tableId: ObjectId,
  tableNumber: Number,
  sessionId: String,
  type: 'table_session',
  exp: timestamp (8 horas)
}
```

2. **Staff PIN**
- Hash bcrypt almacenado en BD
- Verificación en cada aprobación
- No se almacena en frontend

### Validaciones

1. **Stock**: Verificado antes de crear orden
2. **Doble pago**: Check de orden.status !== 'paid'
3. **Sesión**: Token válido y no expirado
4. **Webhooks**: Signature verification (producción)

## Escalabilidad

### Optimizaciones Implementadas

1. **Índices MongoDB**
```javascript
// CRMEvent
{ type: 1, createdAt: -1 }
{ 'payload.orderId': 1 }
```

2. **Carrito persistente** en localStorage
3. **Auto-refresh** en paneles de staff (polling)

### Mejoras Futuras

1. **WebSockets** para updates en tiempo real
2. **Redis** para caché de menú
3. **CDN** para imágenes de productos
4. **Horizontal scaling** con load balancer
5. **Microservicios** separados por dominio

## Integración de Pagos

### Stripe (Apple Pay / Google Pay)

```javascript
// Crear PaymentIntent
const intent = await stripe.paymentIntents.create({
  amount: amount * 100,
  currency: 'clp',
  metadata: { orderId }
});

// Frontend confirma con Stripe Elements
```

### WebPay (Transbank)

```javascript
// Crear transacción
const transaction = await webpay.create({
  buyOrder: orderId,
  amount: amount,
  returnUrl: callbackUrl
});

// Redirigir a pasarela
// Webhook confirma resultado
```

## CRM y Analytics

### Eventos Rastreados

```javascript
- order_created
- order_approved
- order_status_changed
- payment_created
- payment_success
- payment_failed
- table_opened
- table_closed
```

### Métricas Calculadas

```javascript
{
  total_ventas_periodo,
  ticket_promedio,
  propina_media,
  porcentaje_pagos_digitales,
  tiempo_medio_pedido_a_pago,
  total_ordenes,
  ordenes_completadas,
  ordenes_canceladas,
  metodos_pago: {}
}
```

## Deployment

### Docker Compose

```yaml
services:
  - mongo (base de datos)
  - backend (API principal)
  - crm (analytics)
  - frontend (PWA)
```

### Variables de Entorno Críticas

```env
# Producción
JWT_SECRET=<secret-fuerte-aleatorio>
STRIPE_SECRET_KEY=sk_live_...
MONGO_URI=mongodb+srv://...
NODE_ENV=production
```

## Testing

### Niveles de Testing Recomendados

1. **Unitarios**: Servicios y utilidades
2. **Integración**: Endpoints API
3. **E2E**: Flujos completos de usuario
4. **Carga**: Performance bajo tráfico

### Herramientas Sugeridas

- Jest (unit/integration)
- Supertest (API)
- Playwright (E2E)
- k6 (load testing)

---

**Última actualización**: Octubre 2025

