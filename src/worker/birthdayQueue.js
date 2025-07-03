import { Queue } from 'bullmq';
import { bullmqConnection } from '../redis-setup.js';

export const birthdayQueue = new Queue('birthdayQueue', {
  connection: bullmqConnection,
});
