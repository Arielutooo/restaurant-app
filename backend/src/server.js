import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import { initSocket } from './utils/socketEvents.js';

const PORT = process.env.PORT || 4000;

// Crear servidor HTTP
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

// Inicializar Socket.IO en utils
initSocket(io);

// Gestión de conexiones WebSocket
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Unirse a sala de una orden específica
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`📦 Cliente ${socket.id} unido a order:${orderId}`);
  });

  // Unirse a sala de una mesa específica
  socket.on('join:table', (tableId) => {
    socket.join(`table:${tableId}`);
    console.log(`🪑 Cliente ${socket.id} unido a table:${tableId}`);
  });

  // Unirse a sala de staff (cocina/garzón)
  socket.on('join:staff', (role) => {
    socket.join(`staff:${role}`);
    console.log(`👤 Staff ${socket.id} unido a staff:${role}`);
  });

  // Unirse a sala de todas las mesas abiertas (para garzón)
  socket.on('join:open_tables', () => {
    socket.join('open_tables');
    console.log(`🪑 Staff ${socket.id} unido a open_tables`);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// Exportar io para usarlo en controladores
export { io };

// Conectar a MongoDB e iniciar servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Backend escuchando en puerto ${PORT}`);
      console.log(`🔌 WebSocket listo en ws://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

