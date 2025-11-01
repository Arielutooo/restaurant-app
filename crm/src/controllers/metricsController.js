import CRMEvent from '../models/CRMEvent.js';

export const getMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total de ventas
    const paymentSuccessEvents = await CRMEvent.find({
      type: 'payment_success',
      ...dateFilter
    });

    const totalVentas = paymentSuccessEvents.reduce((sum, event) => {
      return sum + (event.payload.amount || 0);
    }, 0);

    const totalPropinas = paymentSuccessEvents.reduce((sum, event) => {
      return sum + (event.payload.tip || 0);
    }, 0);

    // Ticket promedio
    const ticketPromedio = paymentSuccessEvents.length > 0
      ? totalVentas / paymentSuccessEvents.length
      : 0;

    // Propina media
    const propinaMedia = paymentSuccessEvents.length > 0
      ? totalPropinas / paymentSuccessEvents.length
      : 0;

    // Distribución de métodos de pago
    const metodosPago = {};
    paymentSuccessEvents.forEach(event => {
      const method = event.payload.method || 'desconocido';
      metodosPago[method] = (metodosPago[method] || 0) + 1;
    });

    const totalPagos = paymentSuccessEvents.length;
    const porcentajePagosDigitales = totalPagos > 0
      ? ((metodosPago.applepay || 0) + (metodosPago.googlepay || 0) + (metodosPago.webpay || 0)) / totalPagos * 100
      : 0;

    // Tiempo promedio pedido -> pago
    const orderCreatedEvents = await CRMEvent.find({
      type: 'order_created',
      ...dateFilter
    });

    let tiemposTotal = 0;
    let tiemposCount = 0;

    for (const orderEvent of orderCreatedEvents) {
      const orderId = orderEvent.payload.orderId;
      const paymentEvent = paymentSuccessEvents.find(
        p => p.payload.orderId?.toString() === orderId?.toString()
      );

      if (paymentEvent) {
        const tiempoDiff = new Date(paymentEvent.createdAt) - new Date(orderEvent.createdAt);
        tiemposTotal += tiempoDiff;
        tiemposCount++;
      }
    }

    const tiempoMedioPedidoAPago = tiemposCount > 0
      ? Math.round(tiemposTotal / tiemposCount / 1000 / 60) // en minutos
      : 0;

    // Órdenes totales
    const totalOrdenes = orderCreatedEvents.length;

    // Órdenes canceladas
    const cancelledOrders = await CRMEvent.countDocuments({
      type: 'order_status_changed',
      'payload.newStatus': 'cancelled',
      ...dateFilter
    });

    res.json({
      success: true,
      metrics: {
        total_ventas_periodo: totalVentas,
        total_propinas: totalPropinas,
        ticket_promedio: Math.round(ticketPromedio),
        propina_media: Math.round(propinaMedia),
        porcentaje_pagos_digitales: Math.round(porcentajePagosDigitales),
        tiempo_medio_pedido_a_pago_minutos: tiempoMedioPedidoAPago,
        total_ordenes: totalOrdenes,
        ordenes_completadas: paymentSuccessEvents.length,
        ordenes_canceladas: cancelledOrders,
        metodos_pago: metodosPago
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Agregar todos los items de todas las órdenes
    const orderEvents = await CRMEvent.find({ type: 'order_created' });

    const productStats = {};

    orderEvents.forEach(event => {
      const items = event.payload.items || [];
      items.forEach(item => {
        const itemId = item.itemId?.toString() || 'unknown';
        if (!productStats[itemId]) {
          productStats[itemId] = {
            itemId,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        productStats[itemId].totalQuantity += item.quantity || 0;
        productStats[itemId].totalRevenue += (item.price || 0) * (item.quantity || 0);
        productStats[itemId].orderCount += 1;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

