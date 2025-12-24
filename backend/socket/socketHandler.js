const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const initializeSocket = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.error('Socket auth: No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.error('Socket auth: User not found');
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      console.log(`Socket auth successful for user: ${user.username}`);
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.userId})`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { 
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user's personal room
    socket.join(socket.userId);

    // Notify others that user is online
    socket.broadcast.emit('user-online', {
      userId: socket.userId,
      username: socket.username
    });

    // Send online users list
    const onlineUsers = await User.find({ isOnline: true })
      .select('_id username avatar')
      .lean();
    
    socket.emit('online-users', onlineUsers);

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content } = data;

        if (!receiverId || !content) {
          return socket.emit('error', { message: 'Receiver ID and content are required' });
        }

        // Create message in database
        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim()
        });

        await message.save();

        // Populate sender and receiver
        await message.populate('sender', 'username avatar');
        await message.populate('receiver', 'username avatar');

        // Send to receiver
        io.to(receiverId).emit('receive-message', message);

        // Send confirmation to sender
        socket.emit('message-sent', message);

        // Mark as read if receiver is online
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.isOnline) {
          message.isRead = true;
          message.readAt = new Date();
          await message.save();
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      socket.to(receiverId).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.username} (${socket.userId})`);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify others that user is offline
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        username: socket.username
      });
    });
  });
};

module.exports = { initializeSocket };

