import Order from '../models/Order.js';
import Table from '../models/Table.js';

/**
 * GET /api/waiter/open-tables
 * Obtener todas las mesas con órdenes activas (no pagadas ni canceladas)
 */
export const getOpenTables = async (req, res) => {
  try {
    // Buscar órdenes activas agrupadas por mesa
    const activeOrders = await Order.find({
      status: { $in: ['pending', 'awaiting_approval', 'kitchen', 'ready_to_serve', 'served'] }
    })
      .populate('tableId')
      .populate('items.itemId')
      .sort({ createdAt: -1 });

    // Agrupar por mesa
    const tableMap = new Map();

    for (const order of activeOrders) {
      if (!order.tableId) continue;

      const tableId = order.tableId._id.toString();

      if (!tableMap.has(tableId)) {
        tableMap.set(tableId, {
          table: order.tableId,
          orders: [],
          totalAmount: 0,
          itemsCount: 0,
          hasNewItems: false,
          status: 'pending' // pending, kitchen, ready_to_serve, served
        });
      }

      const tableData = tableMap.get(tableId);
      tableData.orders.push(order);
      tableData.totalAmount += order.total || 0;
      tableData.itemsCount += order.items.length;

      // Detectar items nuevos (creados en los últimos 5 minutos)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const hasRecent = order.items.some(item => 
        item.createdAt && new Date(item.createdAt) > fiveMinutesAgo
      );
      if (hasRecent) {
        tableData.hasNewItems = true;
      }

      // Determinar el estado más avanzado
      const statusPriority = {
        'served': 4,
        'ready_to_serve': 3,
        'kitchen': 2,
        'awaiting_approval': 1,
        'pending': 0
      };

      if (statusPriority[order.status] > statusPriority[tableData.status]) {
        tableData.status = order.status;
      }
    }

    // Convertir Map a array
    const openTables = Array.from(tableMap.values()).sort((a, b) => {
      // Priorizar mesas con items listos para servir
      if (a.status === 'ready_to_serve' && b.status !== 'ready_to_serve') return -1;
      if (b.status === 'ready_to_serve' && a.status !== 'ready_to_serve') return 1;
      
      // Luego por número de mesa
      return a.table.number - b.table.number;
    });

    res.json({
      success: true,
      tables: openTables,
      count: openTables.length
    });
  } catch (error) {
    console.error('Error obteniendo mesas abiertas:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/waiter/orders?tableId=...
 * Obtener detalle de órdenes de una mesa específica
 */
export const getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.query;

    if (!tableId) {
      return res.status(400).json({ error: 'Se requiere tableId' });
    }

    const orders = await Order.find({
      tableId,
      status: { $nin: ['paid', 'cancelled'] }
    })
      .populate('tableId')
      .populate('items.itemId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error obteniendo órdenes de mesa:', error);
    res.status(500).json({ error: error.message });
  }
};

