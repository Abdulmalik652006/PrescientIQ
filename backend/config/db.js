const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    // Do not crash the whole process on boot failure; let server.js decide how to respond.
    throw err;
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[MongoDB] Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Runtime error:', err.message);
  });

  return mongoose.connection;
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };
