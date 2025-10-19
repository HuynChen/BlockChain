import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import shipmentRoutes from './routes/shipmentRoutes';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});


// User routes
app.use('/api/users', userRoutes);

// Shipment routes
app.use('/api/shipments', shipmentRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);