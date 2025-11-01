import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  method: {
    type: String,
    enum: ['webpay', 'applepay', 'googlepay', 'pos', 'cash'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  tip: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);

