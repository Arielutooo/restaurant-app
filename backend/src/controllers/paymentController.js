import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import paymentService from '../services/paymentService.js';
import crmService from '../services/crmService.js';

export const createPayment = async (req, res) => {
  try {
    const { orderId, method, tip } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Orden ya pagada' });
    }

    // VALIDACIÓN CRÍTICA: Solo se puede pagar si la orden está servida
    if (order.status !== 'served') {
      return res.status(409).json({ 
        error: 'ORDER_NOT_SERVED',
        message: 'No puedes pagar hasta que tu pedido esté servido',
        currentStatus: order.status
      });
    }

    const totalAmount = order.total + (tip || 0);

    // Crear registro de pago
    const payment = new Payment({
      orderId,
      method,
      amount: order.total,
      tip: tip || 0,
      status: 'pending'
    });

    await payment.save();

    // Generar intento de pago según método
    let paymentData = {};

    if (method === 'applepay' || method === 'googlepay') {
      const stripeData = await paymentService.createStripePaymentIntent(
        totalAmount, 
        orderId
      );
      payment.paymentIntentId = stripeData.paymentIntentId;
      await payment.save();
      
      paymentData = {
        clientSecret: stripeData.clientSecret,
        paymentIntentId: stripeData.paymentIntentId
      };
    } else if (method === 'webpay') {
      const webpayData = await paymentService.createWebPayTransaction(
        totalAmount,
        orderId,
        `${process.env.FRONTEND_URL}/payment/callback`
      );
      payment.transactionId = webpayData.token;
      await payment.save();
      
      paymentData = {
        url: webpayData.url,
        token: webpayData.token
      };
    }

    // Enviar evento al CRM
    await crmService.trackPaymentCreated(payment);

    res.json({
      success: true,
      payment,
      paymentData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;

    const payment = await Payment.findById(paymentId).populate('orderId');
    
    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar pago según método
    let verificationResult;
    
    if (payment.method === 'applepay' || payment.method === 'googlepay') {
      verificationResult = await paymentService.verifyStripePayment(
        payment.paymentIntentId
      );
    } else if (payment.method === 'webpay') {
      verificationResult = await paymentService.verifyWebPayPayment(
        transactionId || payment.transactionId
      );
    }

    if (verificationResult.status === 'success') {
      payment.status = 'success';
      payment.confirmedAt = new Date();
      payment.transactionId = verificationResult.transactionId;
      await payment.save();

      // Actualizar orden
      const order = await Order.findById(payment.orderId);
      order.status = 'paid';
      order.paymentMethod = payment.method;
      order.tip = payment.tip;
      order.paidAt = new Date();
      await order.save();

      // Enviar evento al CRM
      await crmService.trackPaymentSuccess(payment);

      res.json({
        success: true,
        payment,
        order
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        error: 'Pago no confirmado'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const webhookStripe = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      const payment = await Payment.findOne({ 
        paymentIntentId: paymentIntent.id 
      });

      if (payment) {
        payment.status = 'success';
        payment.confirmedAt = new Date();
        payment.transactionId = paymentIntent.id;
        await payment.save();

        const order = await Order.findById(orderId);
        order.status = 'paid';
        order.paymentMethod = payment.method;
        order.tip = payment.tip;
        order.paidAt = new Date();
        await order.save();

        await crmService.trackPaymentSuccess(payment);
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

