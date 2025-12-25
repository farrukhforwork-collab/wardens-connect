let io;

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
      socket.join(`user:${userId}`);
    });

    socket.on('join-group', ({ groupId }) => {
      socket.join(`group:${groupId}`);
    });
  });

  return io;
};

const getIo = () => io;

module.exports = { initSocket, getIo };
