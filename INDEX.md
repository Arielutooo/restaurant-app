# 📚 Índice de Documentación - Restaurant Digital

Guía rápida para navegar toda la documentación del proyecto.

## 🚀 Para Empezar

### ⚡ Si quieres probarlo YA (5 minutos)
→ **[QUICKSTART.md](QUICKSTART.md)**
- Instalación rápida
- Demo en 5 minutos
- Flujo de prueba completo

### 📖 Si quieres entender el proyecto primero
→ **[README.md](README.md)**
- Descripción completa del sistema
- Características principales
- Modelos de datos
- API endpoints

### 🎯 Si quieres un resumen ejecutivo
→ **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
- Qué es y para qué sirve
- Valor de negocio
- Métricas y KPIs
- ROI esperado

## 🔧 Instalación y Setup

### 💻 Setup Detallado Paso a Paso
→ **[SETUP.md](SETUP.md)**
- Prerequisitos
- Instalación local
- Instalación con Docker
- Troubleshooting

### 🐳 Usando Docker
→ **[docker-compose.yml](docker-compose.yml)**
- Configuración de servicios
- Orquestación completa
- Variables de entorno

## 🏗️ Arquitectura y Diseño

### 📐 Arquitectura Técnica
→ **[ARCHITECTURE.md](ARCHITECTURE.md)**
- Diagrama de componentes
- Flujo de datos
- Modelos y relaciones
- Decisiones de diseño
- Seguridad

### 🗂️ Estructura del Código

#### Backend
```
backend/
├── src/
│   ├── controllers/     # Lógica de endpoints
│   ├── models/          # Schemas MongoDB
│   ├── services/        # Lógica de negocio
│   ├── middlewares/     # Auth, validación
│   └── routes/          # Definición de rutas
└── Dockerfile
```

#### Frontend
```
frontend/
├── src/
│   ├── pages/           # Páginas de la app
│   ├── components/      # Componentes reusables
│   ├── context/         # Estado global
│   └── api/             # Cliente HTTP
└── Dockerfile
```

#### CRM
```
crm/
├── src/
│   ├── controllers/     # Analytics endpoints
│   └── models/          # Event storage
└── Dockerfile
```

## 🚀 Deployment

### 🌐 Despliegue a Producción
→ **[DEPLOYMENT.md](DEPLOYMENT.md)**
- Checklist pre-producción
- Opciones de hosting (Heroku, VPS, AWS)
- Configuración SSL/HTTPS
- CI/CD con GitHub Actions
- Monitoreo y backups

### 📦 Scripts de Automatización

#### Linux/Mac
- `start-dev.sh` - Inicia todos los servicios
- `stop-dev.sh` - Detiene todos los servicios

#### Windows
- `start-dev.bat` - Inicia todos los servicios

## 👥 Contribución

### 🤝 Guía para Contribuir
→ **[CONTRIBUTING.md](CONTRIBUTING.md)**
- Cómo reportar bugs
- Cómo sugerir features
- Proceso de Pull Requests
- Estándares de código
- Testing checklist

## 📖 Referencia API

### Backend API Endpoints

Documentados en **[README.md](README.md#-api-endpoints)**

**Categorías:**
- 🔐 Sesión (QR y tokens)
- 🍽️ Menú (items y validación)
- 📋 Pedidos (crear, aprobar, actualizar)
- 💳 Pagos (crear, confirmar, webhooks)
- 👨‍🍳 Cocina (KDS)
- 👔 Garzón (aprobaciones)

### CRM API Endpoints

**Eventos:**
- `POST /crm/events` - Registrar evento
- `GET /crm/events` - Obtener eventos

**Métricas:**
- `GET /crm/metrics` - Dashboard de métricas
- `GET /crm/products/top` - Top productos

## 🎓 Tutoriales y Ejemplos

### Flujo Cliente (End-to-End)

1. **Escanear QR** → `POST /api/session/from-qr`
2. **Ver Menú** → `GET /api/menu`
3. **Validar Carrito** → `POST /api/cart/validate`
4. **Crear Pedido** → `POST /api/order`
5. **Crear Pago** → `POST /api/payment/create`
6. **Confirmar Pago** → `POST /api/payment/confirm`

Código completo en: `frontend/src/pages/`

### Flujo Garzón

1. **Ver Pendientes** → `GET /api/orders/pending`
2. **Aprobar** → `POST /api/order/approve`

Código en: `frontend/src/pages/WaiterPanel.jsx`

### Flujo Cocina

1. **Ver Órdenes** → `GET /api/kds/orders`
2. **Actualizar Estado** → `PUT /api/order/status`

Código en: `frontend/src/pages/KitchenDisplay.jsx`

## 🔧 Configuración

### Variables de Entorno

#### Backend (`.env`)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/restaurant
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=sk_test_...
CRM_URL=http://localhost:4001
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:4000/api
```

#### CRM (`.env`)
```env
PORT=4001
MONGO_URI=mongodb://localhost:27017/crm
```

## 🧪 Testing

### Datos de Prueba

Generar con:
```bash
npm run seed
```

Crea:
- 11 items en menú
- 20 mesas
- 3 usuarios staff
- PIN: `1234`

### Manual Testing Checklist

Ver en **[CONTRIBUTING.md](CONTRIBUTING.md#-testing)**

## 🐛 Troubleshooting

### Problemas Comunes

| Problema | Solución | Documentación |
|----------|----------|---------------|
| MongoDB no conecta | Verificar que esté corriendo | [SETUP.md](SETUP.md#-solución-de-problemas) |
| Puerto en uso | Cambiar puerto en .env | [QUICKSTART.md](QUICKSTART.md#-problemas-comunes) |
| Menú vacío | Ejecutar seed script | [QUICKSTART.md](QUICKSTART.md#base-de-datos-vacía--sin-menú) |
| Error de CORS | Configurar FRONTEND_URL | [DEPLOYMENT.md](DEPLOYMENT.md#-checklist-pre-producción) |

## 📊 Recursos Adicionales

### Tecnologías Utilizadas

- **[Express.js](https://expressjs.com/)** - Framework backend
- **[React](https://react.dev/)** - UI library
- **[MongoDB](https://www.mongodb.com/)** - Base de datos
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Stripe](https://stripe.com/docs)** - Pagos
- **[JWT](https://jwt.io/)** - Autenticación

### Comunidad

- 💬 [GitHub Discussions](#) - Preguntas generales
- 🐛 [GitHub Issues](#) - Reportar bugs
- 📧 Email support
- 💼 LinkedIn

## 📋 Checklists Útiles

### Antes de Desarrollar
- [ ] Leer README completo
- [ ] Ejecutar QUICKSTART
- [ ] Entender ARCHITECTURE
- [ ] Probar flujo completo

### Antes de Desplegar
- [ ] Revisar DEPLOYMENT checklist
- [ ] Configurar variables de producción
- [ ] Testing completo
- [ ] Backups configurados
- [ ] Monitoreo activo

### Antes de Contribuir
- [ ] Leer CONTRIBUTING
- [ ] Fork y clonar repo
- [ ] Crear rama feature/
- [ ] Testing local
- [ ] Commit con convención

## 🎯 Objetivos del Proyecto

1. ✅ **Sistema funcional** - MVP completo y desplegable
2. ✅ **Código limpio** - Estructura clara y mantenible
3. ✅ **Documentación completa** - Todo está documentado
4. ✅ **Fácil de usar** - Setup en minutos
5. ✅ **Production-ready** - Listo para producción

## 📞 Contacto y Soporte

- 📚 **Documentación**: Este índice
- 🐛 **Bugs**: GitHub Issues
- 💡 **Ideas**: GitHub Discussions
- 📧 **Email**: [email]
- 💼 **Profesional**: [LinkedIn]

## 📄 Licencia

**MIT License** - Ver [LICENSE](LICENSE)

Uso libre para proyectos comerciales y personales.

---

## 🗺️ Mapa de Navegación Rápida

```
¿Quieres...?
│
├─ Probarlo rápido? → QUICKSTART.md
├─ Entenderlo? → README.md + PROJECT_SUMMARY.md
├─ Instalarlo? → SETUP.md
├─ Ver la arquitectura? → ARCHITECTURE.md
├─ Desplegarlo? → DEPLOYMENT.md
├─ Contribuir? → CONTRIBUTING.md
└─ Encontrar algo específico? → Estás aquí! (INDEX.md)
```

---

**¡Bienvenido a Restaurant Digital! 🍽️**

*Empieza con [QUICKSTART.md](QUICKSTART.md) para ver el sistema en acción*

