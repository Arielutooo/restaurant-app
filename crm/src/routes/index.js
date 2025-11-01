import express from 'express';
import * as eventController from '../controllers/eventController.js';
import * as metricsController from '../controllers/metricsController.js';

const router = express.Router();

// Event routes
router.post('/crm/events', eventController.createEvent);
router.get('/crm/events', eventController.getEvents);

// Metrics routes
router.get('/crm/metrics', metricsController.getMetrics);
router.get('/crm/products/top', metricsController.getTopProducts);

export default router;

