import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Staff from '../models/Staff.js';
import crmService from '../services/crmService.js';
import bcrypt from 'bcryptjs';

export const createOrder = async (req, res) => {
  try {
    const { tableId, sessionId, items, requiresApproval } = req.body;

    // Validar stock y calcular total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      
      if (!menuItem || !menuItem.available || menuItem.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Item ${menuItem?.name || 'desconocido'} no disponible` 
        });
      }

      total += menuItem.price * item.quantity;
      validatedItems.push({
        itemId: item.itemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || ''
      });

      // Reducir stock
      menuItem.stock -= item.quantity;
      await menuItem.save();
    }

    // Crear orden
    const order = new Order({
      tableId,
      sessionId,
      items: validatedItems,
      total,
      status: requiresApproval ? 'awaiting_approval' : 'kitchen'
    });

    await order.save();

    // Enviar evento al CRM
    await crmService.trackOrderCreated(order);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveOrder = async (req, res) => {
  try {
    const { orderId, waiterPin } = req.body;

    // Verificar PIN del garzón
    const staff = await Staff.findOne({ role: 'waiter', active: true });
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff no encontrado' });
    }

    const isPinValid = await bcrypt.compare(waiterPin, staff.pinHash);
    
    if (!isPinValid) {
      return res.status(401).json({ error: 'PIN incorrecto' });
    }

    // Aprobar orden
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    order.status = 'kitchen';
    order.approvedBy = staff._id;
    await order.save();

    // Enviar evento al CRM
    await crmService.trackOrderApproved(order, staff._id);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Enviar evento al CRM
    await crmService.trackOrderStatusChange(orderId, oldStatus, status);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['kitchen', 'ready'] }
    })
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

export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: 'awaiting_approval'
    })
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

