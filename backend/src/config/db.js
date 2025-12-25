const mongoose = require('mongoose');

const connectDb = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  return mongoose.connection;
};

module.exports = { connectDb };
