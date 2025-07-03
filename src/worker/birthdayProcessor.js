import { Worker } from 'bullmq';
import { bullmqConnection } from '../redis-setup.js'; // ✅ change this
import BirthdayLog from '../models/birthdaylog.models.js';
import { scheduleNextBirthdayJob } from './scheduleBirthday.js';
import User from '../models/user.models.js';
import { DateTime } from 'luxon';

export default function startBirthdayProcessor() {
    const birthdayWorker = new Worker(
        'birthdayQueue',
        async (job) => {
            const { userId, name, email, timezone } = job.data;
            const today = DateTime.now().setZone(timezone).toISODate();

            const alreadySent = await BirthdayLog.findOne({ userId, date: today });
            if (alreadySent) {
                console.log(`⚠️ Already sent birthday message to ${email} today.`);
                return;
            }

            try {
                console.log(`🎉 Happy Birthday, ${name}! (${email})`);
                await BirthdayLog.create({ userId, date: today });

                const user = await User.findById(userId);
                if (user) {
                    await scheduleNextBirthdayJob(user); // next year
                }
            } catch (err) {
                console.error(`❌ Error sending birthday to ${email}:`, err.message);
                throw err;
            }
        },
        {
            connection: bullmqConnection,
            concurrency: 5,
        }
    );

    birthdayWorker.on('failed', (job, err) => {
        if (job.attemptsMade >= job.opts.attempts) {
        console.error(
            `💥 Final failure for ${job.data.email} after ${job.attemptsMade} attempts: ${err.message}`
        );
        }
    });

    console.log('🎯 Birthday worker is running with BullMQ + Redis');
}
