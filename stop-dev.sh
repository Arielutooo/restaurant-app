#!/bin/bash

# Script para detener todos los servicios
echo "🛑 Deteniendo Restaurant Digital System..."

if [ -f .pids ]; then
    PIDS=$(cat .pids)
    for PID in $PIDS; do
        if ps -p $PID > /dev/null; then
            echo "   Deteniendo proceso $PID..."
            kill $PID
        fi
    done
    rm .pids
    echo "✅ Servicios detenidos"
else
    echo "⚠️  No se encontró archivo .pids"
    echo "   Buscando procesos node..."
    pkill -f "node.*backend"
    pkill -f "node.*crm"
    pkill -f "vite"
    echo "✅ Intentos de detención completados"
fi

