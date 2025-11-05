# 📖 Guía del Sistema Owner - Nueva Iteración

## 🎉 Nuevas Funcionalidades Implementadas

Esta iteración agrega capacidades completas de gestión para el dueño del restaurante, flujo mejorado para garzones y cocina, y analytics en tiempo real.

---

## 🔐 Acceso Owner

### Login

**URL**: `http://localhost:3000/owner/login`

**Credenciales de Demo**:
- Email: `owner@restaurant.com`
- Contraseña: `admin123`

### Roles Disponibles
- **Owner**: Acceso total al sistema
- **Admin**: Acceso total administrativo
- **Waiter**: Aprobación y servicio de pedidos
- **Kitchen**: Gestión de cocina

---

## 🍽️ Gestión de Menú

### URL: `/owner/menu`

#### Funcionalidades

**1. Crear Nuevo Item**
- Click en "Nuevo Item"
- Completar formulario:
  - Nombre * (requerido)
  - Descripción
  - Precio * (requerido)
  - Costo (opcional, para calcular margen)
  - Categoría * (entrada, plato principal, postre, bebida, otro)
  - Stock (default: 999)
  - Tags (separados por coma, ej: "vegano, sin gluten")
  - Badges (separados por coma, ej: "nuevo, recomendado, chef")
- Click "Crear"

**2. Editar Item Existente**
- Click en botón de edición (lápiz)
- Modificar campos deseados
- Click "Actualizar"

**3. Activar/Desactivar Item**
- Click en botón de ojo/ojo tachado
- Items desactivados NO aparecen en la carta pública
- Útil para items temporalmente no disponibles

**4. Gestión de Stock**
- Editar item y cambiar campo "Stock"
- Si stock = 0, automáticamente se marca como `outOfStock`
- Items sin stock NO aparecen en la carta pública

**5. Eliminar Item**
- Click en botón de basura
- Eliminación suave por defecto (soft delete)
- El item se oculta pero permanece en la base de datos
- Para eliminar permanentemente: agregar `?permanent=true` (vía API)

**6. Filtros**
- **Todos**: Muestra todos los items
- **Activos**: Solo items activos
- **Inactivos**: Solo items desactivados
- **Sin Stock**: Items con stock agotado

### Reglas Importantes

✅ **Items visibles en carta pública deben cumplir**:
- `active = true`
- `outOfStock = false`
- `softDelete = false`
- `stock > 0`

---

## 📊 Analytics Dashboard

### URL: `/owner/analytics`

#### Selectores de Rango
- **Hoy**: Métricas del día actual
- **7 días**: Última semana
- **30 días**: Último mes

#### KPIs Principales

**1. Ventas Totales**
- Suma de todos los pagos exitosos en el rango
- Muestra cantidad de órdenes

**2. Ticket Promedio**
- Venta promedio por orden
- Calculado: total ventas / número de órdenes

**3. Propinas**
- Total de propinas recibidas
- Promedio de propina por orden

**4. Pagos Digitales**
- Porcentaje de pagos digitales vs POS/Efectivo
- Métodos digitales: Apple Pay, Google Pay, WebPay

#### Top 5 Productos
- Los 5 items más vendidos (por cantidad)
- Muestra unidades vendidas y revenue generado
- Ordenados por cantidad

#### Tendencias (7d vs 30d)
- Compara ventas de últimos 7 días vs últimos 30 días
- Muestra cambio porcentual
- Iconos:
  - 🔺 **Trending Up**: Cambio > +20%
  - 🔻 **Trending Down**: Cambio < -20%
  - ➡️ **Stable**: Cambio entre -20% y +20%

#### Baja Rotación
- Items con menos ventas
- Útil para identificar productos a mejorar o remover

#### Otras Métricas
- **Items sin stock**: Porcentaje de items agotados
- **Tasa de venta**: Porcentaje de items que se vendieron al menos una vez
- **Órdenes completadas**: Total de órdenes pagadas

#### Ventas por Hora
- Gráfico de barras mostrando ventas por franja horaria
- Útil para identificar horas pico
- Solo muestra horas con ventas

#### Auto-Refresh
- Los datos se actualizan automáticamente cada 30 segundos
- Click en botón de refresh para actualización manual

---

## 🔄 Nuevo Flujo de Estados (Máquina de Estados)

### Estados de Orden

```
pending → awaiting_approval → kitchen → ready_to_serve → served → paid
```

**pending**: Orden creada
**awaiting_approval**: Esperando aprobación del garzón (si requiresApproval=true)
**kitchen**: En preparación en cocina
**ready_to_serve**: Cocina terminó, listo para servir
**served**: Garzón entregó al cliente (✅ PUEDE PAGAR)
**paid**: Pagado exitosamente

### Estados de Item

Cada item dentro de una orden también tiene su propio estado:

```
pending → kitchen → ready_to_serve → served
```

Esto permite rastrear el progreso individual de cada plato.

---

## 👨‍🍳 Flujo de Cocina (KDS)

### URL: `/kitchen`

**Requiere autenticación con rol kitchen o admin**

**Cambios**:
- Botón anterior "Marcar como listo" ahora es **"Listo para servir"**
- Cambia estado de orden a `ready_to_serve`
- La orden pasa a la cola del garzón

---

## 👔 Flujo de Garzón (Actualizado)

### URL: `/waiter`

#### Tab 1: Aprobar
- Pedidos pendientes de aprobación
- Requiere PIN (demo: `1234`)
- Al aprobar, envía a cocina

#### Tab 2: Para Servir (NUEVO)
- Muestra pedidos con estado `ready_to_serve`
- Items marcados como listos por cocina
- Botón: **"Marcar como Servido"**
- Al marcar:
  - Cambia estado a `served`
  - Registra timestamp `servedAt`
  - **Cliente ahora puede pagar** ✅

**Workflow completo**:
1. Cliente hace pedido → `pending`
2. Garzón aprueba → `kitchen`
3. Cocina prepara y marca listo → `ready_to_serve`
4. Garzón sirve y confirma → `served`
5. Cliente paga → `paid`

---

## 🔒 Gate de Pago (Regla Crítica)

### Validación Implementada

**El cliente SOLO puede pagar cuando `order.status === 'served'`**

#### Interfaz de Usuario

**Antes de servir**:
- Botón de pago deshabilitado
- Muestra: "Esperando servicio..."
- Advertencia visible: "⏳ Pago no disponible aún"
- Tooltip explicativo

**Después de servir**:
- Botón de pago habilitado
- Muestra: "Pagar ahora"
- Color normal

#### Validación Backend

**Endpoint**: `POST /api/payment/create`

**Si `order.status !== 'served'`**:
```json
{
  "error": "ORDER_NOT_SERVED",
  "message": "No puedes pagar hasta que tu pedido esté servido",
  "currentStatus": "ready_to_serve"
}
```

**HTTP Status**: `409 Conflict`

#### Flujo Error en Frontend

Si el cliente intenta pagar antes de tiempo:
1. Backend retorna 409
2. Frontend detecta `ORDER_NOT_SERVED`
3. Muestra mensaje: "⏳ Tu pedido aún no ha sido servido..."
4. Mantiene botón deshabilitado

---

## 🧪 Testing del Sistema Completo

### Escenario E2E Completo

**1. Owner - Gestionar Menú** (3 min)
```
1. Login: owner@restaurant.com / admin123
2. Ir a /owner/menu
3. Crear item: "Pizza Margarita", precio 8500, stock 10
4. Desactivar un item existente
5. Verificar filtros funcionan
```

**2. Cliente - Hacer Pedido** (3 min)
```
1. Ir a /table/1
2. Agregar items al carrito
3. Confirmar pedido (marcar "requiere aprobación")
4. Intentar pagar → BLOQUEADO ❌
5. Ver mensaje: "Esperando servicio..."
```

**3. Garzón - Aprobar** (2 min)
```
1. Ir a /waiter
2. Tab "Aprobar"
3. Ver pedido pendiente
4. Click "Aprobar pedido"
5. Ingresar PIN: 1234
6. Confirmar
```

**4. Cocina - Preparar** (2 min)
```
1. Ir a /kitchen (o login como kitchen@restaurant.com / admin123)
2. Ver pedido "EN PREPARACIÓN"
3. Click "Listo para servir"
4. Pedido desaparece de cocina
```

**5. Garzón - Servir** (2 min)
```
1. Volver a /waiter
2. Tab "Para Servir"
3. Ver pedido listo
4. Click "Marcar como Servido"
5. Confirmar
```

**6. Cliente - Pagar** (2 min)
```
1. Volver a vista de cliente
2. Botón "Pagar" ahora HABILITADO ✅
3. Seleccionar método de pago
4. Agregar propina (opcional)
5. Click "Pagar ahora"
6. Ver confirmación de éxito
```

**7. Owner - Ver Analytics** (3 min)
```
1. Ir a /owner/analytics
2. Ver KPIs actualizados
3. Verificar el pedido aparece en ventas
4. Ver tendencias
5. Cambiar rango a "30 días"
```

---

## 📊 Datos Históricos

El seed data ahora incluye:
- **50 órdenes** de los últimos 30 días
- Distribuidas aleatoriamente por fecha y hora
- Con diferentes métodos de pago
- Propinas variables (0%, 10%, 15%, 20%)
- 2-5 items por orden

Esto permite probar analytics con datos realistas.

### Regenerar Datos

```bash
cd backend
npm run seed
```

Esto:
1. Limpia todas las colecciones
2. Crea 11 items de menú
3. Crea 4 usuarios staff (owner, admin, waiter, kitchen)
4. Crea 20 mesas
5. Genera 50 órdenes históricas
6. Crea pagos correspondientes

---

## 🔧 Configuración de Roles

### Crear Usuario Owner Adicional

```javascript
// En seedData.js o vía API
{
  name: "Nuevo Propietario",
  email: "nuevo@restaurant.com",
  role: "owner",
  pinHash: await bcrypt.hash("1234", 10),
  passwordHash: await bcrypt.hash("contraseña123", 10),
  active: true
}
```

### Cambiar Rol de Usuario Existente

```bash
# Vía mongo shell
mongosh restaurant
db.staff.updateOne(
  { email: "usuario@restaurant.com" },
  { $set: { role: "owner" } }
)
```

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ Configurar Stripe con API key real
2. ✅ Implementar WebPay con SDK oficial de Transbank
3. ✅ Agregar imágenes a items del menú
4. ✅ Implementar WebSockets para updates en tiempo real
5. ✅ Dashboard visual con gráficos (Chart.js o Recharts)
6. ✅ Exportar reportes a Excel/PDF
7. ✅ Multi-tenancy (múltiples restaurantes)
8. ✅ Programa de fidelización

---

## 🐛 Troubleshooting

### Error: "Token inválido"
- Cerrar sesión y volver a hacer login
- Verificar que JWT_SECRET sea el mismo en backend

### Items no aparecen en carta
- Verificar que item esté `active: true`
- Verificar que `stock > 0`
- Verificar que `outOfStock: false`

### No puedo pagar
- Verificar que orden esté en estado `served`
- Verificar en /waiter que se marcó como servido
- Ver consola del navegador para errores

### Analytics sin datos
- Ejecutar `npm run seed` para generar datos históricos
- Cambiar rango a "30 días"
- Verificar que hay órdenes con status `paid`

---

## 📞 Contacto y Soporte

Para problemas o dudas:
- Revisar logs del backend: `npm run dev:backend`
- Revisar consola del navegador (F12)
- Ver documentación principal: README.md

---

**¡Sistema completo y funcional! 🎉**

Ahora tienes control total sobre tu restaurante digital con analytics en tiempo real y flujos optimizados para cada rol.

