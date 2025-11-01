# 🚀 Guía de Despliegue a Producción

## 📋 Checklist Pre-Producción

### Seguridad

- [ ] Cambiar `JWT_SECRET` a valor aleatorio seguro
- [ ] Usar `STRIPE_SECRET_KEY` de producción (sk_live_...)
- [ ] Configurar WebPay con credenciales de producción
- [ ] Habilitar HTTPS/SSL en todos los servicios
- [ ] Configurar CORS con dominios específicos
- [ ] Verificar que `.env` no esté en repositorio
- [ ] Implementar rate limiting
- [ ] Configurar validación de webhooks

### Base de Datos

- [ ] MongoDB Atlas o servidor MongoDB dedicado
- [ ] Backups automáticos configurados
- [ ] Índices optimizados creados
- [ ] String de conexión con autenticación
- [ ] Límites de conexión configurados

### Performance

- [ ] Compilar frontend en modo producción
- [ ] Habilitar compresión gzip
- [ ] Configurar CDN para assets estáticos
- [ ] Implementar caché de menú
- [ ] Optimizar imágenes de productos

## 🌐 Opciones de Despliegue

### Opción 1: Heroku (Fácil)

#### Backend

```bash
# Instalar Heroku CLI
# Crear app
heroku create restaurant-api

# Agregar MongoDB
heroku addons:create mongolab:sandbox

# Configurar variables
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set CRM_URL=https://restaurant-crm.herokuapp.com
heroku config:set FRONTEND_URL=https://restaurant-app.netlify.app

# Deploy
cd backend
git init
heroku git:remote -a restaurant-api
git add .
git commit -m "Initial deploy"
git push heroku main
```

#### CRM

```bash
heroku create restaurant-crm
heroku addons:create mongolab:sandbox
heroku config:set MONGO_URI=mongodb+srv://...
cd crm
git init
heroku git:remote -a restaurant-crm
git add .
git commit -m "Initial deploy"
git push heroku main
```

#### Frontend

```bash
# Usar Netlify o Vercel
# Configurar build:
#   Build command: npm run build
#   Publish directory: dist
#   Environment variable: VITE_API_URL=https://restaurant-api.herokuapp.com/api
```

### Opción 2: VPS con Docker (Control Total)

#### Requisitos del Servidor

- Ubuntu 20.04 LTS o superior
- 2 GB RAM mínimo (4 GB recomendado)
- 20 GB disco
- Docker y Docker Compose instalados

#### Setup Inicial

```bash
# Conectar al servidor
ssh root@your-server-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Clonar repositorio
git clone https://github.com/tu-usuario/restaurant-app.git
cd restaurant-app
```

#### Configurar Variables de Entorno

```bash
# Crear .env en backend
cat > backend/.env << EOF
PORT=4000
MONGO_URI=mongodb://mongo:27017/restaurant
JWT_SECRET=$(openssl rand -base64 32)
STRIPE_SECRET_KEY=sk_live_your_key
CRM_URL=http://crm:4001
FRONTEND_URL=https://your-domain.com
EOF

# Crear .env en frontend
cat > frontend/.env << EOF
VITE_API_URL=https://api.your-domain.com/api
EOF
```

#### Docker Compose para Producción

Crear `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6
    restart: always
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "4000:4000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongo

  crm:
    build:
      context: ./crm
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "4001:4001"
    env_file:
      - ./crm/.env
    depends_on:
      - mongo

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
      - crm

volumes:
  mongo-data:
```

#### Dockerfile de Producción

Backend (`backend/Dockerfile.prod`):

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/app.js"]
```

Frontend (`frontend/Dockerfile.prod`):

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Frontend nginx config (`frontend/nginx.conf`):

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Iniciar Servicios

```bash
# Build y start
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Inicializar DB
docker-compose -f docker-compose.prod.yml exec backend node src/scripts/seedData.js
```

### Opción 3: AWS (Escalable)

#### Servicios Recomendados

- **EC2**: Servidor de aplicación
- **RDS MongoDB** o **DocumentDB**: Base de datos
- **S3 + CloudFront**: Assets estáticos
- **Elastic Beanstalk**: Deploy simplificado
- **Route 53**: DNS
- **Certificate Manager**: SSL/TLS

#### Arquitectura

```
Internet
    ↓
CloudFront (CDN)
    ↓
Application Load Balancer
    ↓
    ├─ EC2 (Backend 1)
    ├─ EC2 (Backend 2)
    └─ EC2 (CRM)
    ↓
DocumentDB (MongoDB)
```

## 🔒 SSL/HTTPS

### Con Let's Encrypt (Gratis)

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado
certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renovación
certbot renew --dry-run
```

### Nginx como Reverse Proxy

```nginx
# /etc/nginx/sites-available/restaurant

# Frontend
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend API
server {
    listen 443 ssl;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoreo

### PM2 (Process Manager)

```bash
npm install -g pm2

# Backend
cd backend
pm2 start src/app.js --name restaurant-backend

# CRM
cd ../crm
pm2 start src/app.js --name restaurant-crm

# Ver procesos
pm2 list

# Logs
pm2 logs

# Auto-start en reboot
pm2 startup
pm2 save
```

### Monitoreo con PM2 Plus

```bash
pm2 link your-secret-key your-public-key
```

## 🔄 CI/CD

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd restaurant-app
            git pull
            docker-compose -f docker-compose.prod.yml up -d --build
```

## 📈 Escalado

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3
    
  nginx:
    image: nginx
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 🗄️ Backups

### MongoDB Backup Automático

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/restaurant" --out="/backups/restaurant_$DATE"

# Mantener solo últimos 7 días
find /backups -type d -mtime +7 -exec rm -rf {} \;
```

Agregar a crontab:
```bash
crontab -e
# Agregar:
0 2 * * * /path/to/backup.sh
```

## 🔍 Troubleshooting Producción

### Ver logs de containers
```bash
docker-compose logs -f --tail=100 backend
```

### Reiniciar servicio
```bash
docker-compose restart backend
```

### Verificar salud del sistema
```bash
# Uso de recursos
docker stats

# Estado de servicios
docker-compose ps
```

## ✅ Post-Deploy Checklist

- [ ] Todos los servicios corriendo
- [ ] HTTPS funcionando
- [ ] Base de datos accesible
- [ ] Backups configurados
- [ ] Monitoreo activo
- [ ] Logs centralizados
- [ ] Alertas configuradas
- [ ] Documentación actualizada
- [ ] DNS configurado
- [ ] Firewall configurado

---

**¡Éxito en tu despliegue! 🚀**

