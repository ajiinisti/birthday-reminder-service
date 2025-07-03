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
    const users = await User.find(); // Retrieves all users
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
      const job = await birthdayQueue.getJob(`birthday-${updatedUser._id}`);
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
    
    const job = await birthdayQueue.getJob(`birthday-${user._id}`);
    if (job) {
      await job.remove();
      console.log(`⚠️ Removed scheduled job after deleting user ${user.email}`);
    }else{
      console.log(` Failed to remove the job`)
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
