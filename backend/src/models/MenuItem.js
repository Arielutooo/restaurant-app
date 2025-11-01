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
  available: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 999
  },
  badges: [{
    type: String,
    enum: ['más pedido', 'nuevo', 'recomendado', 'chef']
  }],
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('MenuItem', menuItemSchema);

