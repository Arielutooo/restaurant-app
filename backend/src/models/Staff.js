import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'waiter', 'kitchen'],
    required: true
  },
  pinHash: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
staffSchema.index({ email: 1 });
staffSchema.index({ role: 1, active: 1 });

export default mongoose.model('Staff', staffSchema);

