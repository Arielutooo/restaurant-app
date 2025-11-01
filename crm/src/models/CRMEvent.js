import mongoose from 'mongoose';

const crmEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'order_created',
      'order_approved',
      'order_status_changed',
      'payment_created',
      'payment_success',
      'payment_failed',
      'table_opened',
      'table_closed'
    ]
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para consultas rápidas
crmEventSchema.index({ type: 1, createdAt: -1 });
crmEventSchema.index({ 'payload.orderId': 1 });

export default mongoose.model('CRMEvent', crmEventSchema);

