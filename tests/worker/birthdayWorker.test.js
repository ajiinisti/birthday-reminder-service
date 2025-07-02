import cron from 'node-cron';
import { DateTime } from 'luxon';
import startBirthdayWorker from '../../src/worker/birthdayWorker.js';
import User from '../../src/models/user.models.js'; 
import { describe, jest } from '@jest/globals';

jest.mock('node-cron'); // this will now use __mocks__/node-cron.js

describe('Birthday Worker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should log birthday message for matching user', async () => {
        const localNow = DateTime.fromObject(
            { hour: 9, minute: 0 },
            { zone: 'Asia/Jakarta' }
        );
        const fixedUtcNow = localNow.setZone('UTC');

        jest.spyOn(DateTime, 'utc').mockReturnValue(fixedUtcNow);
        const birthday = DateTime.fromObject(
        {
            year: localNow.year,
            month: localNow.month,
            day: localNow.day,
        },
        { zone: 'Asia/Jakarta' }
        ).toJSDate();

        const user = {
        name: 'John',
        email: 'john@example.com',
        birthday,
        timezone: 'Asia/Jakarta',
        };

        jest.spyOn(User, 'find').mockResolvedValue([user]);
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        let scheduledFn;
        jest.spyOn(cron, 'schedule').mockImplementation((_cronTime, callback) => {
        scheduledFn = callback;
        });

        startBirthdayWorker();
        await scheduledFn();

        expect(logSpy).toHaveBeenCalledWith(`🎉 Happy Birthday, ${user.name}! (${user.email})`);
    });


    it('should not log if no birthdays match', async () => {
        const user = {
        name: 'Jane',
        email: 'jane@example.com',
        birthday: new Date('2000-12-31'),
        timezone: 'Asia/Jakarta',
        };

        jest.spyOn(User, 'find').mockResolvedValue([user]);

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        let scheduledFn;
        jest.spyOn(cron, 'schedule').mockImplementation((_cronTime, callback) => {
        scheduledFn = callback;
        });

        startBirthdayWorker();
        await scheduledFn();

        expect(logSpy).not.toHaveBeenCalled();
    });
});
