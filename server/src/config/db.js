import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB: ${uri.split('@').pop()}`);
      await mongoose.connect(uri);
      console.log('✅ [DB] Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`⚠️ [DB] Failed to connect to configured URI (${err.message}).`);
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
      console.log('🔄 [DB] Falling back to local MongoMemoryServer for development...');
    }
  }

  // Development / Test in-memory fallback
  try {
    console.log('🚀 [DB] Starting MongoMemoryServer for seamless local development...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`✅ [DB] Connected to in-memory MongoDB at ${memoryUri}`);
  } catch (memErr) {
    console.error('❌ [DB] Error starting in-memory MongoDB:', memErr);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[DB] Disconnected from MongoDB');
  } catch (err) {
    console.error('[DB] Disconnect error:', err);
  }
};
