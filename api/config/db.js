const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mini-keep', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.dbConnected = true;
    isConnected = true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ WARNING: Could not connect to MongoDB in production. Ensure MONGO_URI is set in Vercel settings.');
    }
    console.log('Running in No-Database Mode (In-Memory)');
    global.dbConnected = false;
    isConnected = false;
  }
};

module.exports = connectDB;

