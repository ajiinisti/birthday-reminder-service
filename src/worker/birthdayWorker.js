import cron from 'node-cron';
import { DateTime } from 'luxon';
import User from '../models/user.models.js';

const startBirthdayWorker = () => {
  cron.schedule('0 * * * *', async () => {
    const now = DateTime.utc();
    const users = await User.find();

    users.forEach(user => {
      const local = now.setZone(user.timezone);
      const birthday = DateTime.fromJSDate(user.birthday).setZone(user.timezone);
      if (
        local.hour === 9 &&
        birthday.month === local.month &&
        birthday.day === local.day
      ) {
        console.log(`🎉 Happy Birthday, ${user.name}! (${user.email})`);
      }
    });
  });
};

export default startBirthdayWorker;