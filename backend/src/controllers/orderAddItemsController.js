import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { 
  recomputeOrderStatus, 
  recomputeOrderTotals, 
  canAddItemsToOrder 
} from '../utils/orderUtils.js';
import {
  emitOrderUpdated,
  emitItemAdded,
  emitToStaff
} from '../utils/socketEvents.js';

/**
 * POST /api/order/:orderId/items
 * Agregar items adicionales a una orden existente no pagada
 */
export const addItemsToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, requiresApproval } = req.body; // items = [{itemId, quantity, notes}]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de items' });
    }

    // Buscar la orden
    const order = await Order.findById(orderId).populate('tableId');
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar que la orden puede recibir items adicionales
    if (!canAddItemsToOrder(order)) {
      return res.status(409).json({ 
        error: 'ORDER_ALREADY_COMPLETED',
        message: `No se pueden agregar items a una orden con estado: ${order.status}` 
      });
    }

    // Validar y preparar items
    const newItems = [];
    
    for (const itemRequest of items) {
      const menuItem = await MenuItem.findById(itemRequest.itemId);
      
      if (!menuItem || !menuItem.available || menuItem.stock < itemRequest.quantity) {
        return res.status(400).json({ 
          error: `Item ${menuItem?.name || 'desconocido'} no disponible o sin stock suficiente` 
        });
      }

      // Reducir stock
      menuItem.stock -= itemRequest.quantity;
      await menuItem.save();

      // Preparar nuevo item con snapshot de datos
      const newItem = {
        itemId: itemRequest.itemId,
        name: menuItem.name, // Snapshot
        price: menuItem.price, // Snapshot
        quantity: itemRequest.quantity,
        notes: itemRequest.notes || '',
        status: requiresApproval !== false ? 'pending' : 'kitchen',
        createdAt: new Date()
      };

      newItems.push(newItem);
    }

    // Agregar items a la orden
    order.items.push(...newItems);

    // Recalcular totales
    const totals = recomputeOrderTotals(order);
    order.total = totals.grandTotal;

    // Recalcular estado (si estaba 'served' y se agregan items, vuelve a 'kitchen' o 'awaiting_approval')
    const oldStatus = order.status;
    const newStatus = recomputeOrderStatus(order);
    
    // Si la orden estaba served y ahora vuelve atrás, limpiar servedAt
    if (oldStatus === 'served' && newStatus !== 'served') {
      order.servedAt = null;
    }

    // Si necesita aprobación, setear el estado
    if (requiresApproval !== false && newStatus === 'pending') {
      order.status = 'awaiting_approval';
    } else {
      order.status = newStatus;
    }

    await order.save();

    // Emitir eventos WebSocket
    // 1. A la orden/cliente
    emitOrderUpdated(order._id.toString(), {
      status: order.status,
      total: order.total,
      itemCount: order.items.length,
      servedAt: order.servedAt
    });

    // 2. Notificar cada item nuevo
    newItems.forEach(item => {
      emitItemAdded(order._id.toString(), item);
    });

    // 3. Notificar a staff (cocina si va directo, o garzón si necesita aprobación)
    if (order.status === 'kitchen') {
      emitToStaff('kitchen', 'order:new_items', {
        orderId: order._id,
        tableNumber: order.tableId?.number,
        itemCount: newItems.length
      });
    } else if (order.status === 'awaiting_approval') {
      emitToStaff('waiter', 'order:needs_approval', {
        orderId: order._id,
        tableNumber: order.tableId?.number,
        itemCount: newItems.length
      });
    }

    // Responder
    res.json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        total: order.total,
        itemCount: order.items.length,
        newItemsCount: newItems.length
      },
      message: `${newItems.length} item(s) agregado(s) exitosamente`
    });

  } catch (error) {
    console.error('Error al agregar items a la orden:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/order/:orderId
 * Obtener orden completa con items poblados
 */
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('tableId')
      .populate('items.itemId')
      .populate('approvedBy', 'name role');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Calcular totales actualizados
    const totals = recomputeOrderTotals(order);

    res.json({
      success: true,
      order: {
        ...order.toObject(),
        totals,
        canPay: order.status === 'served',
        canAddItems: canAddItemsToOrder(order)
      }
    });

  } catch (error) {
    console.error('Error al obtener detalles de orden:', error);
    res.status(500).json({ error: error.message });
  }
};
