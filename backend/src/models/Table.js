import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  area: {
    type: String,
    default: 'main'
  },
  activeToken: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'closed'
  },
  currentSessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Table', tableSchema);

