/**
 * Utilidades para gestionar estados y totales de órdenes
 */

/**
 * Recalcula el estado global de una orden basado en sus items
 * @param {Object} order - Documento de orden de Mongoose
 * @returns {string} - Nuevo estado de la orden
 */
export const recomputeOrderStatus = (order) => {
  const items = order.items || [];
  
  if (items.length === 0) {
    return order.status || 'pending';
  }

  // Si ya está pagada o cancelada, no cambiar
  if (order.status === 'paid' || order.status === 'cancelled') {
    return order.status;
  }

  // Contar items por estado
  const statusCounts = {
    pending: 0,
    kitchen: 0,
    ready_to_serve: 0,
    served: 0
  };

  items.forEach(item => {
    const itemStatus = item.status || 'pending';
    if (statusCounts.hasOwnProperty(itemStatus)) {
      statusCounts[itemStatus]++;
    }
  });

  const totalItems = items.length;

  // TODOS los items están servidos → orden served
  if (statusCounts.served === totalItems) {
    return 'served';
  }

  // Al menos un item está ready_to_serve → orden ready_to_serve
  if (statusCounts.ready_to_serve > 0) {
    return 'ready_to_serve';
  }

  // Al menos un item está en kitchen → orden kitchen
  if (statusCounts.kitchen > 0) {
    return 'kitchen';
  }

  // Items pendientes → verificar si necesita aprobación
  if (statusCounts.pending > 0) {
    // Si la orden requiere aprobación, mantener awaiting_approval
    if (order.requiresApproval !== false && order.status === 'awaiting_approval') {
      return 'awaiting_approval';
    }
    return 'pending';
  }

  // Default: mantener estado actual
  return order.status;
};

/**
 * Recalcula los totales de una orden
 * @param {Object} order - Documento de orden de Mongoose
 * @returns {Object} - { subtotal, tax, tip, grandTotal }
 */
export const recomputeOrderTotals = (order) => {
  const items = order.items || [];
  
  // Calcular subtotal
  let subtotal = 0;
  items.forEach(item => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 0;
    subtotal += itemPrice * itemQuantity;
  });

  // Calcular impuesto (si aplica, ej: 19% IVA en Chile)
  const taxRate = order.taxRate || 0; // 0.19 para 19%
  const tax = Math.round(subtotal * taxRate);

  // Propina (ya debería estar en order.tip si el cliente la agregó)
  const tip = order.tip || 0;

  // Total final
  const grandTotal = subtotal + tax + tip;

  return {
    subtotal,
    tax,
    tip,
    grandTotal
  };
};

/**
 * Verifica si todos los items de una orden están servidos
 * @param {Object} order - Documento de orden
 * @returns {boolean}
 */
export const areAllItemsServed = (order) => {
  const items = order.items || [];
  if (items.length === 0) return false;
  return items.every(item => item.status === 'served');
};

/**
 * Verifica si una orden puede aceptar nuevos items
 * @param {Object} order - Documento de orden
 * @returns {boolean}
 */
export const canAddItemsToOrder = (order) => {
  // No se pueden agregar items si ya está pagada o cancelada
  if (order.status === 'paid' || order.status === 'cancelled') {
    return false;
  }
  return true;
};

/**
 * Obtiene un resumen del estado de una orden para cliente
 * @param {Object} order - Documento de orden
 * @returns {Object}
 */
export const getOrderSummary = (order) => {
  const items = order.items || [];
  
  const summary = {
    orderId: order._id,
    tableId: order.tableId,
    status: order.status,
    itemCount: items.length,
    itemsByStatus: {
      pending: items.filter(i => i.status === 'pending').length,
      kitchen: items.filter(i => i.status === 'kitchen').length,
      ready_to_serve: items.filter(i => i.status === 'ready_to_serve').length,
      served: items.filter(i => i.status === 'served').length
    },
    totals: recomputeOrderTotals(order),
    canPay: order.status === 'served',
    canAddItems: canAddItemsToOrder(order),
    servedAt: order.servedAt,
    paidAt: order.paidAt,
    createdAt: order.createdAt
  };

  return summary;
};

