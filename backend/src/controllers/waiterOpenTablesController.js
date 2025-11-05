import Order from '../models/Order.js';
import Table from '../models/Table.js';

/**
 * GET /api/waiter/open-tables
 * Listar mesas con órdenes activas (no pagadas)
 */
export const getOpenTables = async (req, res) => {
  try {
    // Buscar todas las órdenes activas (no pagadas ni canceladas)
    const activeOrders = await Order.find({
      status: { $in: ['pending', 'awaiting_approval', 'kitchen', 'ready_to_serve', 'served'] }
    })
      .populate('tableId')
      .populate('items.itemId', 'name price category')
      .sort({ createdAt: -1 });

    // Agrupar por mesa
    const tableMap = new Map();

    activeOrders.forEach(order => {
      const tableId = order.tableId?._id?.toString();
      if (!tableId) return;

      if (!tableMap.has(tableId)) {
        tableMap.set(tableId, {
          table: order.tableId,
          orders: [],
          totalItems: 0,
          totalAmount: 0,
          newestItemTime: null,
          statuses: new Set()
        });
      }

      const tableData = tableMap.get(tableId);
      tableData.orders.push(order);
      tableData.totalItems += order.items.length;
      tableData.totalAmount += order.total || 0;
      tableData.statuses.add(order.status);

      // Encontrar el item más nuevo
      order.items.forEach(item => {
        const itemTime = item.createdAt || order.createdAt;
        if (!tableData.newestItemTime || itemTime > tableData.newestItemTime) {
          tableData.newestItemTime = itemTime;
        }
      });
    });

    // Convertir a array y formatear
    const openTables = Array.from(tableMap.values()).map(tableData => {
      // Determinar el estado "principal" de la mesa
      let mainStatus = 'pending';
      if (tableData.statuses.has('ready_to_serve')) mainStatus = 'ready_to_serve';
      else if (tableData.statuses.has('kitchen')) mainStatus = 'kitchen';
      else if (tableData.statuses.has('served')) mainStatus = 'served';
      else if (tableData.statuses.has('awaiting_approval')) mainStatus = 'awaiting_approval';

      // Contar items por estado
      const itemsByStatus = {
        pending: 0,
        kitchen: 0,
        ready_to_serve: 0,
        served: 0
      };

      tableData.orders.forEach(order => {
        order.items.forEach(item => {
          const status = item.status || 'pending';
          if (itemsByStatus.hasOwnProperty(status)) {
            itemsByStatus[status]++;
          }
        });
      });

      return {
        tableId: tableData.table._id,
        tableNumber: tableData.table.number,
        area: tableData.table.area,
        mainStatus,
        orderCount: tableData.orders.length,
        totalItems: tableData.totalItems,
        itemsByStatus,
        totalAmount: tableData.totalAmount,
        newestItemTime: tableData.newestItemTime,
        hasNewItems: tableData.newestItemTime && (Date.now() - new Date(tableData.newestItemTime)) < 60000, // < 1 min
        orders: tableData.orders.map(o => ({
          _id: o._id,
          status: o.status,
          itemCount: o.items.length,
          total: o.total,
          createdAt: o.createdAt
        }))
      };
    });

    // Ordenar por tiempo del item más nuevo (más recientes primero)
    openTables.sort((a, b) => {
      return new Date(b.newestItemTime) - new Date(a.newestItemTime);
    });

    res.json({
      success: true,
      openTables,
      totalTables: openTables.length,
      summary: {
        totalOrders: activeOrders.length,
        totalItems: openTables.reduce((sum, t) => sum + t.totalItems, 0),
        totalAmount: openTables.reduce((sum, t) => sum + t.totalAmount, 0)
      }
    });

  } catch (error) {
    console.error('Error al obtener mesas abiertas:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/waiter/table/:tableId/orders
 * Obtener todas las órdenes activas de una mesa específica
 */
export const getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.params;

    const orders = await Order.find({
      tableId,
      status: { $in: ['pending', 'awaiting_approval', 'kitchen', 'ready_to_serve', 'served'] }
    })
      .populate('tableId')
      .populate('items.itemId', 'name price category imageUrl')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.json({
        success: true,
        orders: [],
        message: 'No hay órdenes activas en esta mesa'
      });
    }

    res.json({
      success: true,
      orders,
      table: orders[0].tableId,
      summary: {
        orderCount: orders.length,
        totalItems: orders.reduce((sum, o) => sum + o.items.length, 0),
        totalAmount: orders.reduce((sum, o) => sum + (o.total || 0), 0)
      }
    });

  } catch (error) {
    console.error('Error al obtener órdenes de mesa:', error);
    res.status(500).json({ error: error.message });
  }
};

