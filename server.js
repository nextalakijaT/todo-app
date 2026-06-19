const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cronJobs');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server);

// Store connected users: { userId: socketId }
const connectedUsers = {};

// Authenticate WebSocket connections using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId.toString();
    next();
  } catch (err) {
    console.error('[SOCKET] Invalid token:', err.message);
    next(new Error('Invalid token'));
  }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.userId}`);

  // Store this user's socket id
  connectedUsers[socket.userId] = socket.id;
  const startCronJobs = require('./utils/cronJobs');

  // When user disconnects, remove them
  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.userId}`);
    delete connectedUsers[socket.userId];
  });
});

// Export io and connectedUsers so other files can use them
app.set('io', io);
app.set('connectedUsers', connectedUsers);
startCronJobs(io, connectedUsers);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
  });
};

start();
