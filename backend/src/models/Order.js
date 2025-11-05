import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'kitchen', 'ready_to_serve', 'served'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'awaiting_approval', 'kitchen', 'ready_to_serve', 'served', 'paid', 'cancelled'],
    default: 'pending'
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['webpay', 'applepay', 'googlepay', 'pos', 'cash', null],
    default: null
  },
  tip: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  servedAt: {
    type: Date,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ tableId: 1, status: 1 });

export default mongoose.model('Order', orderSchema);

