import Stripe from 'stripe';

class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Stripe Payment Intent (Apple Pay / Google Pay)
  async createStripePaymentIntent(amount, orderId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convertir a centavos
        currency: 'clp',
        metadata: {
          orderId: orderId.toString()
        },
        payment_method_types: ['card']
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      throw new Error(`Error creando PaymentIntent: ${error.message}`);
    }
  }

  // WebPay (Transbank) - Simulación
  async createWebPayTransaction(amount, orderId, returnUrl) {
    // En producción, aquí irían las credenciales reales de Transbank
    // y la creación de la transacción usando su SDK
    
    // Para el MVP, simulamos la respuesta
    const transactionId = `WP_${Date.now()}_${orderId}`;
    const token = Buffer.from(JSON.stringify({ 
      transactionId, 
      amount, 
      orderId 
    })).toString('base64');

    return {
      url: `${process.env.FRONTEND_URL}/payment/webpay?token=${token}`,
      token: transactionId
    };
  }

  // Verificar estado de pago Stripe
  async verifyStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        status: paymentIntent.status === 'succeeded' ? 'success' : 'pending',
        transactionId: paymentIntent.id
      };
    } catch (error) {
      throw new Error(`Error verificando pago: ${error.message}`);
    }
  }

  // Verificar estado de pago WebPay (simulado)
  async verifyWebPayPayment(token) {
    // En producción, aquí se verificaría con Transbank
    // Para el MVP, simulamos una verificación exitosa
    return {
      status: 'success',
      transactionId: token
    };
  }
}

export default new PaymentService();

