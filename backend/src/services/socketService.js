let io;
const onlineCounts = new Map();
const socketUsers = new Map();

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', ({ userId }) => {
      if (!userId) return;
      socketUsers.set(socket.id, userId);
      const current = onlineCounts.get(userId) || 0;
      onlineCounts.set(userId, current + 1);
      io.emit('presence:update', { userId, online: true });
      socket.join(`user:${userId}`);
    });

    socket.on('join-group', ({ groupId }) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('disconnect', () => {
      const userId = socketUsers.get(socket.id);
      if (!userId) return;
      socketUsers.delete(socket.id);
      const current = onlineCounts.get(userId) || 0;
      if (current <= 1) {
        onlineCounts.delete(userId);
        io.emit('presence:update', { userId, online: false });
      } else {
        onlineCounts.set(userId, current - 1);
      }
    });
  });

  return io;
};

const getIo = () => io;
const getOnlineUserIds = () => Array.from(onlineCounts.keys());

module.exports = { initSocket, getIo, getOnlineUserIds };
