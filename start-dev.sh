#!/bin/bash

# Script para iniciar todos los servicios en desarrollo
# Uso: ./start-dev.sh

echo "🚀 Iniciando Restaurant Digital System..."
echo ""

# Verificar si MongoDB está corriendo
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB no está corriendo. Por favor inícialo primero."
    echo "   macOS/Linux: sudo systemctl start mongod"
    echo "   Docker: docker run -d -p 27017:27017 mongo:6"
    exit 1
fi

echo "✅ MongoDB detectado"
echo ""

# Verificar si las dependencias están instaladas
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "crm/node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm run install:all
    echo ""
fi

# Verificar si la base de datos está inicializada
echo "🗄️  Verificando base de datos..."
cd backend
if ! node -e "require('mongoose').connect('$MONGO_URI').then(() => require('./src/models/MenuItem.js').default.countDocuments().then(count => { console.log(count > 0 ? 'DB OK' : 'DB EMPTY'); process.exit(count > 0 ? 0 : 1); }));" 2>/dev/null; then
    echo "📊 Inicializando base de datos con datos de prueba..."
    node src/scripts/seedData.js
    echo ""
fi
cd ..

# Crear logs directory
mkdir -p logs

echo "🎬 Iniciando servicios..."
echo ""

# Iniciar Backend
echo "▶️  Backend (puerto 4000)..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar 2 segundos
sleep 2

# Iniciar CRM
echo "▶️  CRM (puerto 4001)..."
cd crm
npm run dev > ../logs/crm.log 2>&1 &
CRM_PID=$!
cd ..

# Esperar 2 segundos
sleep 2

# Iniciar Frontend
echo "▶️  Frontend (puerto 3000)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Todos los servicios iniciados!"
echo ""
echo "📍 URLs disponibles:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:4000"
echo "   CRM:       http://localhost:4001"
echo ""
echo "📋 PIDs de procesos:"
echo "   Backend: $BACKEND_PID"
echo "   CRM:     $CRM_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs en: ./logs/"
echo ""
echo "Para detener todos los servicios:"
echo "   kill $BACKEND_PID $CRM_PID $FRONTEND_PID"
echo ""
echo "🎯 PIN de prueba para garzón: 1234"
echo ""

# Guardar PIDs para poder detener después
echo "$BACKEND_PID $CRM_PID $FRONTEND_PID" > .pids

echo "Presiona Ctrl+C para ver los logs en tiempo real o cierra esta terminal"
echo ""

# Seguir logs
tail -f logs/*.log

