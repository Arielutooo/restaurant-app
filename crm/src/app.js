import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'restaurant-crm' });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ CRM conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 CRM escuchando en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
  });

export default app;

