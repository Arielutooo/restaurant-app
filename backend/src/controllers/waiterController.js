import Order from '../models/Order.js';
import crmService from '../services/crmService.js';

export const getQueue = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      status: status || 'ready_to_serve'
    };

    const orders = await Order.find(filter)
      .populate('tableId')
      .populate('items.itemId')
      .sort({ updatedAt: 1 }); // Los más antiguos primero

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markItemServed = async (req, res) => {
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
    item.status = 'served';

    // Verificar si todos los items están servidos
    const allServed = order.items.every(i => i.status === 'served');

    if (allServed) {
      order.status = 'served';
      order.servedAt = new Date();
    }

    await order.save();

    // Enviar evento al CRM
    if (allServed) {
      await crmService.trackOrderStatusChange(orderId, 'ready_to_serve', 'served');
    }

    res.json({
      success: true,
      order,
      message: allServed ? 'Orden completamente servida' : 'Item marcado como servido'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markOrderServed = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Marcar todos los items como servidos
    order.items.forEach(item => {
      item.status = 'served';
    });

    order.status = 'served';
    order.servedAt = new Date();
    await order.save();

    // Enviar evento al CRM
    await crmService.trackOrderStatusChange(orderId, order.status, 'served');

    res.json({
      success: true,
      order,
      message: 'Orden completa servida'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

