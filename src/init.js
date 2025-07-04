import mongoose from 'mongoose';
import { connectRedis } from './redis-setup.js';
import startBirthdayProcessor from './worker/birthdayProcessor.js';

export const initApp = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI environment variable");
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  if (process.env.NODE_ENV !== 'test') {
    connectRedis();
    // scheduleBirthday.scheduleAllBirthdays();
    startBirthdayProcessor(); 
  }
};
