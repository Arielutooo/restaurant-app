/**
 * Utilidades para recalcular estados y totales de órdenes
 */

/**
 * Recalcula el total de una orden basándose en sus items
 * @param {Object} order - Orden de Mongoose
 * @returns {Object} - { subtotal, tip, tax, grandTotal }
 */
export const recomputeOrderTotals = (order) => {
  const subtotal = order.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const tip = order.tip || 0;
  const tax = Math.round(subtotal * 0.19); // IVA 19%
  const grandTotal = subtotal + tip + tax;

  return {
    subtotal,
    tip,
    tax,
    grandTotal
  };
};

/**
 * Recalcula el estado global de una orden basándose en el estado de sus items
 * @param {Object} order - Orden de Mongoose
 * @returns {Object} - { status, servedAt }
 */
export const recomputeOrderStatus = (order) => {
  const items = order.items;

  // Si no hay items, mantener estado actual
  if (!items || items.length === 0) {
    return { status: order.status, servedAt: order.servedAt };
  }

  // Contar items por estado
  const statusCounts = {
    pending: 0,
    kitchen: 0,
    ready_to_serve: 0,
    served: 0
  };

  items.forEach(item => {
    if (statusCounts.hasOwnProperty(item.status)) {
      statusCounts[item.status]++;
    }
  });

  const totalItems = items.length;

  // Si todos están servidos → served
  if (statusCounts.served === totalItems) {
    return {
      status: 'served',
      servedAt: order.servedAt || new Date()
    };
  }

  // Si al menos uno está listo para servir → ready_to_serve
  if (statusCounts.ready_to_serve > 0) {
    return {
      status: 'ready_to_serve',
      servedAt: null
    };
  }

  // Si al menos uno está en cocina → kitchen
  if (statusCounts.kitchen > 0) {
    return {
      status: 'kitchen',
      servedAt: null
    };
  }

  // Si al menos uno está pendiente → awaiting_approval o pending
  if (statusCounts.pending > 0) {
    // Mantener el estado actual si es awaiting_approval
    if (order.status === 'awaiting_approval') {
      return { status: 'awaiting_approval', servedAt: null };
    }
    return { status: 'pending', servedAt: null };
  }

  // Por defecto, mantener estado actual
  return { status: order.status, servedAt: order.servedAt };
};

/**
 * Verifica si una orden puede ser pagada
 * @param {Object} order - Orden de Mongoose
 * @returns {Boolean}
 */
export const canPayOrder = (order) => {
  return order.status === 'served';
};

/**
 * Verifica si una orden puede recibir items adicionales
 * @param {Object} order - Orden de Mongoose
 * @returns {Boolean}
 */
export const canAddItemsToOrder = (order) => {
  return order.status !== 'paid' && order.status !== 'cancelled';
};

