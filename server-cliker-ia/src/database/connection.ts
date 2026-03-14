import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/clicker-game?authSource=admin';
const MONGODB_DB = process.env.MONGODB_DB || 'clicker-game';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
    });
    
    isConnected = db.connections[0].readyState === 1;
    
    console.log(`MongoDB connected: ${db.connection.host}`);
    console.log(`Database: ${MONGODB_DB}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnect error:', error);
  }
}

export function isConnectedToDB(): boolean {
  return isConnected;
}
