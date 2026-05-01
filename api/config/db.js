const mongoose = require('mongoose');

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    const mongoUri =
      process.env.MONGO_URI ||
      (process.env.NODE_ENV !== 'production'
        ? 'mongodb://localhost:27017/mini-keep'
        : null);

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in production environment variables.');
    }

    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    const conn = await connectionPromise;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    global.dbConnected = true;
    isConnected = true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.warn('WARNING: Could not connect to MongoDB in production. Ensure MONGO_URI is set and MongoDB network access allows Vercel.');
    }
    console.log('Running in No-Database Mode (In-Memory)');
    global.dbConnected = false;
    isConnected = false;
  } finally {
    connectionPromise = null;
  }
};

module.exports = connectDB;

