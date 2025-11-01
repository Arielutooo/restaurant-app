import axios from 'axios';

class CRMService {
  constructor() {
    this.crmUrl = process.env.CRM_URL || 'http://localhost:4001';
  }

  async sendEvent(type, payload) {
    try {
      await axios.post(`${this.crmUrl}/crm/events`, {
        type,
        payload,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error enviando evento al CRM:', error.message);
    }
  }

  async trackOrderCreated(order) {
    await this.sendEvent('order_created', {
      orderId: order._id,
      tableId: order.tableId,
      total: order.total,
      itemsCount: order.items.length
    });
  }

  async trackOrderApproved(order, staffId) {
    await this.sendEvent('order_approved', {
      orderId: order._id,
      staffId,
      approvalTime: new Date()
    });
  }

  async trackPaymentCreated(payment) {
    await this.sendEvent('payment_created', {
      paymentId: payment._id,
      orderId: payment.orderId,
      method: payment.method,
      amount: payment.amount,
      tip: payment.tip
    });
  }

  async trackPaymentSuccess(payment) {
    await this.sendEvent('payment_success', {
      paymentId: payment._id,
      orderId: payment.orderId,
      method: payment.method,
      transactionId: payment.transactionId
    });
  }

  async trackOrderStatusChange(orderId, oldStatus, newStatus) {
    await this.sendEvent('order_status_changed', {
      orderId,
      oldStatus,
      newStatus,
      timestamp: new Date()
    });
  }
}

export default new CRMService();

