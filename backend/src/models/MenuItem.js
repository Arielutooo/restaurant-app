import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['entrada', 'plato_principal', 'postre', 'bebida', 'otro']
  },
  active: {
    type: Boolean,
    default: true
  },
  available: {
    type: Boolean,
    default: true
  },
  outOfStock: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 999
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  badges: [{
    type: String,
    enum: ['más pedido', 'nuevo', 'recomendado', 'chef']
  }],
  tags: [{
    type: String
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  softDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices
menuItemSchema.index({ active: 1, available: 1 });
menuItemSchema.index({ category: 1 });

export default mongoose.model('MenuItem', menuItemSchema);

