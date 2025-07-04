import { DateTime } from 'luxon';
import { birthdayQueue } from './birthdayQueue.js';
import userModels from '../models/user.models.js';

async function scheduleNextBirthdayJob(user) {
  const now = DateTime.now().setZone(user.timezone)
  let nextBirthday = DateTime.fromJSDate(user.birthday)
    .setZone(user.timezone)
    .set({
      year: now.year,
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

  if (nextBirthday < now) {
    nextBirthday = nextBirthday.plus({ years: 1 });
  }

  const jobId = `birthday-${user._id}-${nextBirthday}`;
  const existingJob = await birthdayQueue.getJob(jobId);

  if (existingJob) {
    console.log(`⚠️ Job already scheduled for ${user.email}`);
    return;
  } 

  const delay = nextBirthday.toUTC().toMillis() - Date.now();

  await birthdayQueue.add(
    'send-birthday-message',
    {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      timezone: user.timezone,
    },
    {
      delay,
      jobId: jobId, 
      attempts: 3, // retry on failure
      backoff: {
        type: 'exponential',
        delay: 60000, // 1 minute
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  console.log(`📅 Scheduled birthday message for ${user.email} at ${nextBirthday.toFormat('yyyy-MM-dd HH:mm ZZZZ')}`);
}

async function scheduleAllBirthdays() {
  const users = await userModels.find();
  console.log(`⏳ Checking & scheduling birthdays for ${users.length} users...`);

  for (const user of users) {
    const jobId = `birthday-${user._id}`;
    const existingJob = await birthdayQueue.getJob(jobId);

    if (!existingJob) {
      await scheduleNextBirthdayJob(user);
    } else {
      console.log(`⚠️ Job already scheduled for ${user.email}`);
    }
  }

  console.log(`✅ Finished checking all birthday jobs`);
}

async function cleanupStaleJobs() {
  const jobs = await birthdayQueue.getJobs(['delayed', 'waiting', 'active', 'completed', 'failed']);
  const validUserIds = new Set((await userModels.find({}, '_id')).map(u => u._id.toString()));

  for (const job of jobs) {
    if (!validUserIds.has(job.data.userId)) {
      await job.remove();
      console.log(`🗑 Removed stale job for deleted userId: ${job.data.userId}`);
    }
  }
}

export default {
  scheduleAllBirthdays,
  scheduleNextBirthdayJob,
  cleanupStaleJobs,
}
