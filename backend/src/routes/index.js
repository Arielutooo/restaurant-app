import express from 'express';
import * as sessionController from '../controllers/sessionController.js';
import * as menuController from '../controllers/menuController.js';
import * as orderController from '../controllers/orderController.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Session routes
router.post('/session/from-qr', sessionController.createSessionFromQR);
router.get('/qr/generate/:tableNumber', sessionController.generateTableQR);

// Menu routes
router.get('/menu', menuController.getMenu);
router.get('/menu/:id', menuController.getMenuItem);
router.post('/cart/validate', menuController.validateCart);

// Order routes
router.post('/order', orderController.createOrder);
router.post('/order/approve', orderController.approveOrder);
router.put('/order/status', orderController.updateOrderStatus);
router.get('/kds/orders', orderController.getKitchenOrders);
router.get('/orders/pending', orderController.getPendingOrders);

// Payment routes
router.post('/payment/create', paymentController.createPayment);
router.post('/payment/confirm', paymentController.confirmPayment);
router.post('/payment/webhook', paymentController.webhookStripe);

export default router;

