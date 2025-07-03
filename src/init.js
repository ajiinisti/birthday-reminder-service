import mongoose from 'mongoose';
import { connectRedis } from './redis-setup.js';
import startBirthdayProcessor from './worker/birthdayProcessor.js';
import { cleanupStaleJobs, removeAllBirthdayJobs, scheduleAllBirthdays } from './worker/scheduleBirthday.js';

export const initApp = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI environment variable");
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  if (process.env.NODE_ENV !== 'test') {
    connectRedis();
    scheduleAllBirthdays();
    startBirthdayProcessor(); 
  }
};
