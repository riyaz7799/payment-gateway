const express = require('express');
const app = express();
const cors=require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000', // dashboard
    'http://localhost:3001'  // checkout
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const healthRoutes = require('./routes/health.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const testRoutes = require('./routes/test.routes');
const publicRoutes = require('./routes/public.routes');

app.use('/', healthRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/', testRoutes);
app.use('/', publicRoutes);

module.exports = app;
