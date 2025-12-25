const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDb } = require('./config/db');
const { initSocket } = require('./services/socketService');

const start = async () => {
  await connectDb(env.mongoUri);
  const server = http.createServer(app);
  initSocket(server);
  server.listen(env.port, () => {
    console.log(`API running on :${env.port}`);
  });
};

start();
