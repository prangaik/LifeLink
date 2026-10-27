import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('[DB] Connecting to configured MongoDB database...');
      // Ensure we target the 'lifelink' database if not explicitly included in the URI path
      await mongoose.connect(uri, {
        dbName: 'lifelink',
      });
      console.log(`✅ [DB] Connected to MongoDB database: "${mongoose.connection.name}"`);
      return;
    } catch (err) {
      console.error(`❌ [DB] Failed to connect to configured MongoDB URI: ${err.message}`);
      throw new Error(`Database connection failed: ${err.message}`);
    }
  }

  // Development / Test in-memory fallback when no URI is configured
  try {
    console.log('🚀 [DB] No MONGODB_URI configured. Starting local MongoMemoryServer for development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri, { dbName: 'lifelink' });
    console.log(`✅ [DB] Connected to in-memory MongoDB database: "${mongoose.connection.name}"`);
  } catch (memErr) {
    console.error('❌ [DB] Error starting in-memory MongoDB:', memErr.message);
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
    console.error('[DB] Disconnect error:', err.message);
  }
};
