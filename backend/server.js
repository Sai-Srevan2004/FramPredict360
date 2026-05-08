const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
require('express-async-errors');

const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const priceRoutes = require('./routes/priceRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const connectDB = require('./config/db');

const app = express();
const httpServer = createServer(app);

// Socket.IO for real-time alerts
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/disease', diseaseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'FarmPredict 360 Backend Running', timestamp: new Date() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe_price_alerts', (data) => {
    socket.join(`price_${data.crop}_${data.district}`);
    console.log(`Subscribed to price alerts for ${data.crop} in ${data.district}`);
  });

  socket.on('unsubscribe_price_alerts', (data) => {
    socket.leave(`price_${data.crop}_${data.district}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`✅ FarmPredict 360 Backend running on port ${PORT}`);
    console.log(`🚀 FastAPI service: ${process.env.FASTAPI_URL || 'http://localhost:8000'}`);
  });
});

module.exports = { app, io };
