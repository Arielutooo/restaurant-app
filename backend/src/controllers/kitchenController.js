import Order from '../models/Order.js';
import crmService from '../services/crmService.js';

export const getKitchenOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      status: status || { $in: ['kitchen', 'ready_to_serve'] }
    };

    const orders = await Order.find(filter)
      .populate('tableId')
      .populate('items.itemId')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markItemReady = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Encontrar el item
    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado en la orden' });
    }

    // Actualizar estado del item
    item.status = 'ready_to_serve';

    // Verificar si todos los items están listos
    const allReady = order.items.every(i => i.status === 'ready_to_serve');

    if (allReady) {
      order.status = 'ready_to_serve';
    }

    await order.save();

    // Enviar evento al CRM
    await crmService.trackOrderStatusChange(orderId, 'kitchen', 'ready_to_serve');

    res.json({
      success: true,
      order,
      message: allReady ? 'Todos los items listos' : 'Item marcado como listo'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markOrderReady = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Marcar todos los items como listos
    order.items.forEach(item => {
      item.status = 'ready_to_serve';
    });

    order.status = 'ready_to_serve';
    await order.save();

    // Enviar evento al CRM
    await crmService.trackOrderStatusChange(orderId, 'kitchen', 'ready_to_serve');

    res.json({
      success: true,
      order,
      message: 'Orden completa lista para servir'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

