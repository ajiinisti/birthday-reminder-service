import mongoose from 'mongoose';

const birthdayLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
});

// Prevent duplicate logs per user per day
birthdayLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('BirthdayLog', birthdayLogSchema);
