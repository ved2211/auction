const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { db } = require('./src/firebase');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

const userRoutes = require('./src/routes/userRoutes');
const auctionRoutes = require('./src/routes/auctionRoutes');
const bidRoutes = require('./src/routes/bidRoutes');

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartBid API is running' });
});

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// Socket.io injection block (so controllers could potentially use it, but we'll broadcast directly from here for simplicity if needed, or pass `io` to routes)
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user views an auction page, they join a room for that specific auction
  socket.on('join_auction', (auctionId) => {
    socket.join(auctionId);
    console.log(`User ${socket.id} joined auction room: ${auctionId}`);
  });

  socket.on('leave_auction', (auctionId) => {
    socket.leave(auctionId);
    console.log(`User ${socket.id} left auction room: ${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
