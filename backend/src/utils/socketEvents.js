/**
 * Utilidad para emitir eventos de Socket.IO desde controladores
 */

let socketIO = null;

export const initSocket = (io) => {
  socketIO = io;
  console.log('✅ Socket.IO inicializado en utils');
};

export const getIO = () => {
  if (!socketIO) {
    throw new Error('Socket.IO no ha sido inicializado. Llama a initSocket primero.');
  }
  return socketIO;
};

/**
 * Eventos disponibles
 */

// Orden actualizada (estado, totales, servedAt)
export const emitOrderUpdated = (orderId, orderData) => {
  const io = getIO();
  io.to(`order:${orderId}`).emit('order:updated', {
    orderId,
    ...orderData
  });
  console.log(`📡 order:updated emitido para ${orderId}`);
};

// Item agregado a orden
export const emitItemAdded = (orderId, item) => {
  const io = getIO();
  io.to(`order:${orderId}`).emit('order:item_added', {
    orderId,
    item
  });
  console.log(`📡 order:item_added emitido para ${orderId}`);
};

// Estado de item actualizado
export const emitItemStatusUpdated = (orderId, itemId, status) => {
  const io = getIO();
  io.to(`order:${orderId}`).emit('order:item_status', {
    orderId,
    itemId,
    status
  });
  console.log(`📡 order:item_status emitido para ${orderId} - item ${itemId}`);
};

// Mesa actualizada (para garzón)
export const emitTableUpdated = (tableId, data) => {
  const io = getIO();
  io.to(`table:${tableId}`).emit('table:updated', {
    tableId,
    ...data
  });
  console.log(`📡 table:updated emitido para mesa ${tableId}`);
};

// Notificar a staff (cocina/garzón)
export const emitToStaff = (role, event, data) => {
  const io = getIO();
  io.to(`staff:${role}`).emit(event, data);
  console.log(`📡 ${event} emitido a staff:${role}`);
};

