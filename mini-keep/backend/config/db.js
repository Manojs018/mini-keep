const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mini-keep', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.dbConnected = true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('Running in No-Database Mode (In-Memory)');
    global.dbConnected = false;
    // process.exit(1); // Don't exit, fall back to memory
  }
};

module.exports = connectDB;
