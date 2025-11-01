# 🍽️ Restaurant Digital - Sistema Completo de Pedidos y Pagos

Sistema MVP completo para restaurantes que incluye carta digital vía QR, gestión de pedidos en tiempo real, pagos digitales integrados (Apple Pay / Google Pay / WebPay) y CRM propio con métricas operacionales.

## 🎯 Características Principales

### Para Clientes
- ✅ Escaneo de QR único por mesa
- ✅ Carta digital interactiva con stock en tiempo real
- ✅ Carrito de compras persistente
- ✅ Notas personalizadas en cada item
- ✅ Múltiples métodos de pago (Apple Pay, Google Pay, WebPay)
- ✅ Propina personalizable
- ✅ Confirmación visual de pedido y pago

### Para Staff
- ✅ Panel de aprobación de pedidos con PIN
- ✅ Sistema de cocina (KDS) con estados de preparación
- ✅ Alertas de pedidos retrasados
- ✅ Actualización en tiempo real

### CRM y Analytics
- ✅ Registro de todos los eventos del sistema
- ✅ Métricas operacionales en tiempo real
- ✅ Dashboard de analytics
- ✅ Productos más vendidos
- ✅ Tiempos promedio de servicio
- ✅ Análisis de métodos de pago

## 🏗️ Arquitectura del Sistema

```
/restaurant-app
├── /backend          # API REST principal (Node.js + Express + MongoDB)
├── /frontend         # PWA Cliente (React + Vite)
├── /crm             # Backend CRM y Analytics
└── docker-compose.yml
```

### Stack Tecnológico

**Backend:**
- Node.js 18+ con Express
- MongoDB con Mongoose
- JWT para autenticación
- Stripe para pagos digitales
- QRCode para generación de códigos

**Frontend:**
- React 18
- Vite
- PWA (Progressive Web App)
- React Router
- Context API para estado global

**CRM:**
- Node.js + Express
- MongoDB para almacenamiento de eventos
- Analytics en tiempo real

## 🚀 Instalación y Despliegue

### Opción 1: Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd restaurant-app
```

2. **Iniciar con Docker Compose**
```bash
docker-compose up -d
```

3. **Verificar que los servicios estén corriendo**
```bash
docker-compose ps
```

Los servicios estarán disponibles en:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- CRM: http://localhost:4001
- MongoDB: localhost:27017

4. **Inicializar la base de datos con datos de prueba**
```bash
cd backend
npm run seed
```

### Opción 2: Instalación Local

1. **Requisitos previos**
- Node.js 18+
- MongoDB 6+
- npm o yarn

2. **Instalar dependencias de todos los módulos**
```bash
npm run install:all
```

3. **Configurar variables de entorno**

Crear `.env` en `/backend`:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/restaurant
JWT_SECRET=your_jwt_secret_key_change_in_production
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CRM_URL=http://localhost:4001
FRONTEND_URL=http://localhost:3000
```

Crear `.env` en `/frontend`:
```env
VITE_API_URL=http://localhost:4000/api
```

4. **Inicializar base de datos**
```bash
npm run seed
```

5. **Iniciar servicios en terminales separadas**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - CRM:
```bash
npm run dev:crm
```

Terminal 3 - Frontend:
```bash
npm run dev:frontend
```

## 📱 Uso del Sistema

### Flujo Cliente

1. **Escanear QR de la mesa** → Accede a `/table/{numero_mesa}`
2. **Ver menú digital** → Carta actualizada con stock real
3. **Agregar items al carrito** → Persistente en localStorage
4. **Confirmar pedido** → Opción de requerir aprobación del garzón
5. **Pagar digitalmente** → Seleccionar método y monto de propina
6. **Recibir confirmación** → Pantalla de éxito con código de orden

### Panel Garzón

- URL: `/waiter`
- PIN de demo: `1234`
- Funciones:
  - Aprobar pedidos pendientes
  - Ver detalle de cada orden
  - Validación con PIN de seguridad

### Panel Cocina (KDS)

- URL: `/kitchen`
- Funciones:
  - Ver pedidos en preparación
  - Marcar como "Listo"
  - Marcar como "Servido"
  - Alertas de pedidos retrasados (>15 min)

### Generador de QR

- URL: `/admin/qr`
- Generar códigos QR únicos para cada mesa
- Descargar para imprimir

## 🔐 Seguridad

- ✅ Tokens JWT firmados para cada sesión de mesa
- ✅ Validación de stock antes de confirmar pedidos
- ✅ PIN requerido para aprobación de pedidos
- ✅ Webhooks verificados con secret
- ✅ Prevención de doble pago
- ✅ HTTPS en producción (recomendado)

## 📊 API Endpoints

### Backend Principal (`/api`)

#### Sesión
- `POST /session/from-qr` - Crear sesión desde QR
- `GET /qr/generate/:tableNumber` - Generar QR para mesa

#### Menú
- `GET /menu` - Obtener carta completa
- `GET /menu/:id` - Obtener item específico
- `POST /cart/validate` - Validar disponibilidad del carrito

#### Pedidos
- `POST /order` - Crear nuevo pedido
- `POST /order/approve` - Aprobar pedido (requiere PIN)
- `PUT /order/status` - Actualizar estado de pedido
- `GET /kds/orders` - Obtener pedidos para cocina
- `GET /orders/pending` - Obtener pedidos pendientes

#### Pagos
- `POST /payment/create` - Crear intento de pago
- `POST /payment/confirm` - Confirmar pago
- `POST /payment/webhook` - Webhook de confirmación

### CRM (`/crm`)

- `POST /crm/events` - Registrar evento
- `GET /crm/events` - Obtener eventos
- `GET /crm/metrics` - Obtener métricas analíticas
- `GET /crm/products/top` - Productos más vendidos

## 📈 Métricas del CRM

El sistema registra y analiza:

- **Ventas**: Total de ventas, ticket promedio
- **Propinas**: Propina media
- **Pagos**: % pagos digitales vs efectivo/POS
- **Tiempos**: Tiempo medio pedido → pago
- **Productos**: Top productos, rotación de stock
- **Órdenes**: Completadas, canceladas

## 🎨 Personalización

### Agregar Items al Menú

Editar `/backend/src/scripts/seedData.js` o usar la API:

```javascript
{
  name: 'Nombre del plato',
  description: 'Descripción',
  price: 12500,
  category: 'plato_principal', // entrada, plato_principal, postre, bebida, otro
  badges: ['nuevo', 'más pedido', 'recomendado', 'chef'],
  stock: 30
}
```

### Configurar Pagos Reales

1. **Stripe** (Apple Pay / Google Pay):
```env
STRIPE_SECRET_KEY=sk_live_your_real_key
```

2. **WebPay (Transbank)**:
- Implementar SDK oficial de Transbank en `/backend/src/services/paymentService.js`
- Configurar credenciales de producción

## 🧪 Testing

### Datos de Prueba

Después de ejecutar `npm run seed`:

- **Mesas**: 20 mesas (1-10 área principal, 11-20 terraza)
- **Staff**: 3 usuarios (garzón, cocina, admin)
- **PIN**: `1234` para todos
- **Menu**: 11 items de muestra

### Flujo de Prueba Completo

1. Ir a http://localhost:3000
2. Click en "Cliente" (simula Mesa 1)
3. Agregar items al carrito
4. Confirmar pedido (marcar "Requiere aprobación")
5. Abrir http://localhost:3000/waiter en otra pestaña
6. Aprobar con PIN `1234`
7. Abrir http://localhost:3000/kitchen
8. Marcar como "Listo"
9. Volver al flujo de cliente y proceder a pagar
10. Seleccionar método de pago y confirmar

## 📦 Modelos de Datos

### Table
```javascript
{
  number: Number,
  area: String,
  activeToken: String,
  status: 'open' | 'closed'
}
```

### MenuItem
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  available: Boolean,
  stock: Number,
  badges: [String]
}
```

### Order
```javascript
{
  tableId: ObjectId,
  sessionId: String,
  items: [{itemId, quantity, price, notes}],
  status: 'pending' | 'awaiting_approval' | 'kitchen' | 'ready' | 'served' | 'paid',
  total: Number,
  paymentMethod: String,
  tip: Number
}
```

### Payment
```javascript
{
  orderId: ObjectId,
  method: 'webpay' | 'applepay' | 'googlepay' | 'pos',
  amount: Number,
  tip: Number,
  status: 'pending' | 'success' | 'failed',
  transactionId: String
}
```

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
docker-compose ps
# o
mongosh --eval "db.adminCommand('ping')"
```

### Puerto en uso
```bash
# Cambiar puertos en docker-compose.yml o .env
# Por ejemplo: 4000 → 5000
```

### Limpiar y reiniciar
```bash
docker-compose down -v
docker-compose up -d
npm run seed
```

## 🚀 Próximas Mejoras (MVP 2)

- [ ] Autenticación de staff con roles granulares
- [ ] Dashboard de métricas visual
- [ ] Notificaciones push para garzones
- [ ] Integración WebPay real
- [ ] Sistema de reservas
- [ ] Programa de fidelización
- [ ] Facturación electrónica
- [ ] Multi-idioma
- [ ] Modo offline

## 📄 Licencia

MIT

## 👨‍💻 Contribuciones

Este es un MVP educativo. Las contribuciones son bienvenidas.

---

**Desarrollado con ❤️ para modernizar la experiencia gastronómica**

