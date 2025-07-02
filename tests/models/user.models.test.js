import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../../src/models/user.models.js';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('User Model', () => {
  afterEach(async () => {
    await User.deleteMany();
  });

  it('should create a user with valid fields', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      birthday: new Date('1990-01-01'),
      timezone: 'Asia/Jakarta',
    });

    expect(user._id).toBeDefined();
    expect(user.name).toBe('Test User');
    expect(user.birthday).toEqual(new Date('1990-01-01'))
    expect(user.timezone).toBe("Asia/Jakarta")
  });

  it('should fail without required fields', async () => {
    try {
      await User.create({}); // missing all fields
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.birthday).toBeDefined();
      expect(err.errors.timezone).toBeDefined();
    }
  });

  it('should enforce unique email constraint', async () => {
    const userData = {
      name: 'User 1',
      email: 'duplicate@example.com',
      birthday: new Date('1990-01-01'),
      timezone: 'Asia/Jakarta',
    };

    await User.create(userData);
    let error = null;

    try {
      await User.create(userData);
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.code).toBe(11000); // MongoDB duplicate key error
  });

  it('should fail if birthday is not a Date', async () => {
    try {
      await User.create({
        name: 'Invalid Date',
        email: 'invalid@example.com',
        birthday: 'not-a-date',
        timezone: 'Asia/Jakarta',
      });
    } catch (err) {
      expect(err.errors.birthday).toBeDefined();
    }
  });
});
