# 🚀 Guía Rápida de Setup

Esta guía te llevará paso a paso desde cero hasta tener el sistema funcionando.

## ⚡ Setup Rápido (5 minutos)

### Prerequisitos
- Node.js 18+ instalado
- MongoDB instalado y corriendo
- Git instalado

### Pasos

1. **Clonar e instalar**
```bash
git clone <repository-url>
cd restaurant-app
npm run install:all
```

2. **Configurar variables de entorno**

Crear `backend/.env`:
```bash
cd backend
cp .env.example .env
# Editar con tus valores (o dejar los defaults para desarrollo)
```

Crear `frontend/.env`:
```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:4000/api" > .env
```

3. **Inicializar base de datos**
```bash
cd ../backend
node src/scripts/seedData.js
```

Esto creará:
- ✅ 11 items en el menú
- ✅ 3 miembros del staff (PIN: 1234)
- ✅ 20 mesas

4. **Iniciar servicios**

**Terminal 1** - Backend:
```bash
cd backend
npm run dev
```

**Terminal 2** - CRM:
```bash
cd crm
npm run dev
```

**Terminal 3** - Frontend:
```bash
cd frontend
npm run dev
```

5. **Abrir aplicación**
```
http://localhost:3000
```

## 🐳 Setup con Docker (Alternativa)

Si prefieres usar Docker:

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Inicializar base de datos
docker-compose exec backend node src/scripts/seedData.js
```

Servicios:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- CRM: http://localhost:4001

## 🧪 Verificar Instalación

1. Abrir http://localhost:3000
2. Deberías ver el menú principal con 4 opciones
3. Click en "Cliente" → deberías ver el menú digital
4. Click en "Panel Garzón" → ingresar PIN `1234`

## 🔧 Solución de Problemas

### MongoDB no está corriendo
```bash
# En macOS/Linux
sudo systemctl start mongod

# Con Docker
docker run -d -p 27017:27017 mongo:6
```

### Puerto en uso
Cambiar puertos en los archivos `.env`:
```env
# backend/.env
PORT=5000  # en lugar de 4000

# Actualizar también en frontend/.env
VITE_API_URL=http://localhost:5000/api
```

### Limpiar e reiniciar
```bash
# Detener servicios
# Limpiar node_modules
rm -rf backend/node_modules crm/node_modules frontend/node_modules

# Reinstalar
npm run install:all

# Limpiar base de datos
mongosh restaurant --eval "db.dropDatabase()"
mongosh crm --eval "db.dropDatabase()"

# Reinicializar
cd backend && node src/scripts/seedData.js
```

## 📱 Probar Flujo Completo

1. **Cliente** - http://localhost:3000/table/1
   - Agregar items al carrito
   - Confirmar pedido
   
2. **Garzón** - http://localhost:3000/waiter
   - Aprobar pedido con PIN `1234`
   
3. **Cocina** - http://localhost:3000/kitchen
   - Ver pedido en preparación
   - Marcar como listo
   
4. **Pago** - Volver a cliente
   - Proceder a pagar
   - Seleccionar método de pago
   - Confirmar

## 🎯 Siguientes Pasos

- Revisar el README.md para documentación completa
- Personalizar el menú en `backend/src/scripts/seedData.js`
- Configurar Stripe para pagos reales
- Generar QR para tus mesas en http://localhost:3000/admin/qr

¡Listo para usar! 🎉

