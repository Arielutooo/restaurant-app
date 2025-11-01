# ⚡ Quick Start - 5 Minutos

La forma más rápida de ver el sistema funcionando.

## 🎯 Objetivo

Tener el sistema completo corriendo en tu máquina local en menos de 5 minutos.

## 📋 Prerequisitos

Asegúrate de tener instalado:

✅ **Node.js 18+**  
```bash
node --version  # debe ser v18 o superior
```

✅ **MongoDB**  
```bash
mongosh --version  # o mongod --version
```

Si no tienes MongoDB, la forma más rápida:
```bash
docker run -d -p 27017:27017 --name restaurant-mongo mongo:6
```

## 🚀 Instalación Ultra-Rápida

### 1. Clonar e Instalar (2 min)

```bash
# Clonar
git clone <repository-url>
cd restaurant-app

# Instalar todo
npm run install:all
```

### 2. Inicializar Base de Datos (30 seg)

```bash
npm run seed
```

Esto crea:
- 🍽️ 11 platos en el menú
- 👥 3 usuarios de staff
- 🪑 20 mesas
- 🔑 PIN de prueba: **1234**

### 3. Iniciar Servicios (1 min)

**Opción A - Windows:**
```bash
start-dev.bat
```

**Opción B - Linux/Mac:**
```bash
./start-dev.sh
```

**Opción C - Manual:**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd crm && npm run dev
```

Terminal 3:
```bash
cd frontend && npm run dev
```

### 4. Abrir Aplicación (10 seg)

Abre tu navegador en:
```
http://localhost:3000
```

## 🎮 Probar el Sistema

### Flujo Cliente → Garzón → Cocina → Pago

#### 1️⃣ Cliente (Como si fueras un comensal)

```
1. Ir a http://localhost:3000
2. Click en "Cliente" (simula escanear QR Mesa 1)
3. Explorar el menú
4. Agregar items al carrito (ej: Lomo a lo Pobre + Coca Cola)
5. Ir al carrito
6. Marcar "Requiere aprobación del garzón"
7. Click "Confirmar pedido"
```

#### 2️⃣ Garzón (Como si fueras el mesero)

```
1. Abrir nueva pestaña: http://localhost:3000/waiter
2. Ver el pedido pendiente
3. Click "Aprobar pedido"
4. Ingresar PIN: 1234
5. Click "Confirmar"
```

#### 3️⃣ Cocina (Como si fueras el chef)

```
1. Abrir nueva pestaña: http://localhost:3000/kitchen
2. Ver el pedido "EN PREPARACIÓN"
3. Esperar unos segundos (simular cocina)
4. Click "Marcar como listo"
```

#### 4️⃣ Pago (Volver como cliente)

```
1. Volver a la pestaña del cliente
2. Click "Pagar"
3. Seleccionar método (ej: Apple Pay)
4. Agregar propina (opcional, ej: 10%)
5. Click "Pagar ahora"
6. ¡Ver confirmación de pago exitoso! ✅
```

## 🎯 Extras Rápidos

### Ver Métricas CRM

```
http://localhost:4001/crm/metrics
```

Verás JSON con:
- Total de ventas
- Ticket promedio
- Propina media
- % pagos digitales
- Tiempo medio pedido→pago

### Generar QR para Mesa

```
1. Ir a http://localhost:3000/admin/qr
2. Ingresar número de mesa (ej: 5)
3. Click "Generar QR"
4. Click "Descargar QR"
5. ¡Imprimirlo y colocarlo en la mesa!
```

### Ver Todos los Pedidos

Backend API:
```bash
curl http://localhost:4000/api/kds/orders
```

## 🛑 Detener Servicios

**Windows:**
- Cerrar las ventanas de comandos

**Linux/Mac:**
```bash
./stop-dev.sh
```

**Manual:**
```bash
# Encontrar procesos
ps aux | grep node

# Matar procesos
pkill -f "node.*backend"
pkill -f "node.*crm"
pkill -f "vite"
```

## 🐛 Problemas Comunes

### "MongoDB no está corriendo"

```bash
# Iniciar MongoDB
sudo systemctl start mongod

# O con Docker
docker start restaurant-mongo
```

### "Puerto 3000 en uso"

```bash
# Matar proceso en puerto 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <número> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### "Error al instalar dependencias"

```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar
rm -rf node_modules */node_modules
npm run install:all
```

### "Base de datos vacía / sin menú"

```bash
cd backend
node src/scripts/seedData.js
```

## 📱 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Interfaz principal |
| Backend | http://localhost:4000 | API REST |
| CRM | http://localhost:4001 | Analytics |
| MongoDB | localhost:27017 | Base de datos |

## 🎓 Siguientes Pasos

Una vez que el sistema esté funcionando:

1. ✅ Lee el [README.md](README.md) completo
2. ✅ Explora la [Arquitectura](ARCHITECTURE.md)
3. ✅ Personaliza el menú en `backend/src/scripts/seedData.js`
4. ✅ Configura pagos reales (Stripe/WebPay)
5. ✅ Despliega a producción siguiendo [DEPLOYMENT.md](DEPLOYMENT.md)

## 💡 Tips

- El PIN de prueba para garzones es **1234**
- Los datos se resetean ejecutando `npm run seed`
- El carrito se guarda en localStorage del navegador
- Los pagos están en modo sandbox/simulación

## 🆘 Ayuda

Si tienes problemas:

1. Verifica que todos los prerequisitos estén instalados
2. Revisa los logs en consola
3. Asegúrate que MongoDB esté corriendo
4. Verifica que los puertos 3000, 4000, 4001 estén libres

---

**¡Listo! Ahora tienes un sistema completo de restaurant funcionando 🎉**

Cualquier duda, revisa la documentación completa o abre un Issue.

