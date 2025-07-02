import mongoose from 'mongoose';
import startBirthdayWorker from './worker/birthdayWorker.js';

export const initApp = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI environment variable");
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  if (process.env.NODE_ENV !== 'test') {
    startBirthdayWorker();
  }
};
