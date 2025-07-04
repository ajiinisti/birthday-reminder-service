import { DateTime } from 'luxon';
import birthdaylogModels from '../models/birthdaylog.models.js';
import User from '../models/user.models.js';
import { validateUserInput, validateUserUpdate } from '../validators/userValidator.js';
import { birthdayQueue } from '../worker/birthdayQueue.js';
import scheduleBirthday from '../worker/scheduleBirthday.js';

export const createUser = async (req, res) => {
  const errors = validateUserInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.create(req.body);
    await scheduleBirthday.scheduleNextBirthdayJob(user); 
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // page, limit/offsite
    // page > 1, page*offsite -> start, offsite -> start+offisite
    // find({'name': 'Aji'}).
    const users = await User.find(); 
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  const errors = validateUserUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ error: 'User not found' });

    const birthdayChanged =
      req.body.birthday &&
      new Date(req.body.birthday).toISOString().slice(0, 10) !==
        existingUser.birthday.toISOString().slice(0, 10);
    const timezoneChanged = req.body.timezone && req.body.timezone !== existingUser.timezone;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Only reschedule if birthday or timezone changed
    if (birthdayChanged || timezoneChanged) {
      const birthdayDate = getBirthdayDate(existingUser);
      const job = await birthdayQueue.getJob(`birthday-${existingUser._id}-${birthdayDate}`);
      if (job) {
        await job.remove();
        console.log(`🔁 Rescheduled birthday job for ${updatedUser.email}`);
      }
      await scheduleBirthday.scheduleNextBirthdayJob(updatedUser);
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const birthdayDate = getBirthdayDate(user);
    const job = await birthdayQueue.getJob(`birthday-${user._id}-${birthdayDate}`);
    
    if (job) {
      await job.remove();
      console.log(`⚠️ Removed scheduled job after deleting user ${user.email}`);
    }else{
      console.log(` Failed to remove the job`)
    }

    const result = await birthdaylogModels.deleteMany({ userId: user._id });
    console.log(`🗑 Deleted ${result.deletedCount} birthday logs for ${user.email}`);

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBirthdayDate = (user) => {
  const now = DateTime.now().setZone(user.timezone);
  let birthday = DateTime.fromJSDate(user.birthday)
    .setZone(user.timezone)
    .set({
      year: now.year,
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  return birthday
}

export const syncBirthdayJobs = async (req, res) => {
  try {
    const BATCH_SIZE = 100;
    let offset = 0;
    let totalProcessed = 0;
    let rescheduled = 0;
    let existing = 0;

    while (true) {
      const users = await User.find().skip(offset).limit(BATCH_SIZE);

      if (users.length === 0) break;

      for (const user of users) {
        const birthdayDate = getBirthdayDate(user);
        const jobId = `birthday-${user._id}-${birthdayDate}`;
        const job = await birthdayQueue.getJob(jobId);
        if (!job) {
          await scheduleBirthday.scheduleNextBirthdayJob(user);
          rescheduled++;
        } else {
          existing++;
        }
      }

      totalProcessed += users.length;
      offset += BATCH_SIZE;
    }

    res.json({
      message: 'Birthday jobs sync complete',
      rescheduled,
      existing,
      totalProcessed,
      batchSize: BATCH_SIZE
    });
  } catch (err) {
    console.error('Error in syncBirthdayJobs:', err);
    res.status(500).json({ error: 'Birthday job sync failed' });
  }
};
