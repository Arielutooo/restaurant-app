import express from 'express';
import * as sessionController from '../controllers/sessionController.js';
import * as menuController from '../controllers/menuController.js';
import * as orderController from '../controllers/orderController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as authController from '../controllers/authController.js';
import * as ownerMenuController from '../controllers/ownerMenuController.js';
import * as ownerAnalyticsController from '../controllers/ownerAnalyticsController.js';
import * as kitchenController from '../controllers/kitchenController.js';
import * as waiterController from '../controllers/waiterController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// =============== PUBLIC ROUTES ===============

// Auth routes
router.post('/auth/login', authController.login);

// Session routes
router.post('/session/from-qr', sessionController.createSessionFromQR);
router.get('/qr/generate/:tableNumber', sessionController.generateTableQR);

// Menu routes (public)
router.get('/menu', menuController.getMenu);
router.get('/menu/:id', menuController.getMenuItem);
router.post('/cart/validate', menuController.validateCart);

// Order routes (public/client)
router.post('/order', orderController.createOrder);
router.post('/order/approve', orderController.approveOrder);

// Payment routes
router.post('/payment/create', paymentController.createPayment);
router.post('/payment/confirm', paymentController.confirmPayment);
router.post('/payment/webhook', paymentController.webhookStripe);

// =============== AUTHENTICATED ROUTES ===============

// Get current user info
router.get('/auth/me', requireAuth, authController.getMe);

// =============== OWNER ROUTES ===============

// Owner - Menu Management
router.get('/owner/menu-items', requireAuth, requireRole(['owner', 'admin']), ownerMenuController.getAllItems);
router.post('/owner/menu-items', requireAuth, requireRole(['owner', 'admin']), ownerMenuController.createItem);
router.put('/owner/menu-items/:id', requireAuth, requireRole(['owner', 'admin']), ownerMenuController.updateItem);
router.patch('/owner/menu-items/:id/toggle-active', requireAuth, requireRole(['owner', 'admin']), ownerMenuController.toggleActive);
router.patch('/owner/menu-items/:id/stock', requireAuth, requireRole(['owner', 'admin']), ownerMenuController.updateStock);
router.delete('/owner/menu-items/:id', requireAuth, requireRole(['owner', 'admin']), ownerMenuController.deleteItem);

// Owner - Analytics
router.get('/owner/analytics/summary', requireAuth, requireRole(['owner', 'admin']), ownerAnalyticsController.getSummary);
router.get('/owner/analytics/trends', requireAuth, requireRole(['owner', 'admin']), ownerAnalyticsController.getTrends);

// =============== KITCHEN ROUTES ===============

router.get('/kitchen/orders', requireAuth, requireRole(['kitchen', 'admin']), kitchenController.getKitchenOrders);
router.patch('/kitchen/orders/:orderId/items/:itemId/ready', requireAuth, requireRole(['kitchen', 'admin']), kitchenController.markItemReady);
router.patch('/kitchen/orders/:orderId/ready', requireAuth, requireRole(['kitchen', 'admin']), kitchenController.markOrderReady);

// =============== WAITER ROUTES ===============

router.get('/waiter/queue', requireAuth, requireRole(['waiter', 'admin']), waiterController.getQueue);
router.patch('/waiter/orders/:orderId/items/:itemId/served', requireAuth, requireRole(['waiter', 'admin']), waiterController.markItemServed);
router.patch('/waiter/orders/:orderId/served', requireAuth, requireRole(['waiter', 'admin']), waiterController.markOrderServed);

// =============== LEGACY/COMPATIBILITY ROUTES ===============

router.put('/order/status', orderController.updateOrderStatus);
router.get('/kds/orders', orderController.getKitchenOrders);
router.get('/orders/pending', orderController.getPendingOrders);

export default router;

