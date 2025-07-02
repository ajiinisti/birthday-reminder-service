import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../../src/app.js';
import User from '../../src/models/user.models.js';
import { describe, jest } from '@jest/globals';

dotenv.config({ path: '.env.test' });
let userId;

beforeAll(async () => {
await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
await mongoose.connection.close();
});

beforeEach(async () => {
await User.deleteMany();
});

const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    birthday: '1990-01-01',
    timezone: 'Asia/Jakarta'
};

const mockUser2 = {
    name: 'Test User2',
    email: 'test2@example.com',
    birthday: '1990-01-01',
    timezone: 'Asia/Jakarta'
};

describe('Create User', ()=> {
    it('should create a user', async () => {
        const res = await request(app).post('/users').send(mockUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe(mockUser.name);
        expect(res.body.email).toBe(mockUser.email);
        expect(res.body.birthday).toBe(new Date(mockUser.birthday).toISOString());
        expect(res.body.timezone).toBe(mockUser.timezone);
        userId = res.body._id;
    });

    it('should return validation error for function validator', async () => {
        const res = await request(app).post('/users').send({
            ...mockUser,
            timezone: 'Invalid/Zone'
        });
        expect(res.statusCode).toBe(400);
    });

    it('should return error model validator', async () => {
        const res = await request(app).post('/users').send(mockUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe(mockUser.name);
        userId = res.body._id;

        const res2 = await request(app).post('/users').send(mockUser);
        expect(res2.statusCode).toBe(400);
        expect(res2.body.error).toContain('duplicate key error');
    });

    it('should fail when required fields are missing', async () => {
        const res = await request(app).post('/users').send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors.length).toBe(4);
    });
})

describe('Get All Users', ()=> {
    it('should get all users', async () => {
        await User.create(mockUser);
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toMatchObject({
            name: mockUser.name,
            email: mockUser.email,
            timezone: mockUser.timezone,
            birthday: new Date(mockUser.birthday).toISOString(),
        });
    });

    it('should return error db if User.find throws an error', async () => {
        jest.spyOn(User, 'find').mockImplementationOnce(() => {
            throw new Error('Database failure');
        });

        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Database failure' });
    });
})

describe('Get User by ID', ()=> {
    it('should get a single user by ID', async () => {
        const user = await User.create(mockUser);
        const res = await request(app).get(`/users/${user._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(mockUser.email);
        
        expect(res.body).toMatchObject({
            name: mockUser.name,
            email: mockUser.email,
            timezone: mockUser.timezone,
            birthday: new Date(mockUser.birthday).toISOString(),
        });
    });

    it('should return error db when get a single user by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        jest.spyOn(User, 'findById').mockImplementationOnce(() => {
            throw new Error('Database failure');
        });
        const res = await request(app).get(`/users/${fakeId}`);
        expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent user on get', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        let res = await request(app).get(`/users/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });
})

describe('Update User', ()=> {
    it('should update a user', async () => {
        const user = await User.create(mockUser);
        const res = await request(app).put(`/users/${user._id}`).send({ name: 'Updated' });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated');
    });
    
    it('should return error on update a user function validator', async () => {
        const user = await User.create(mockUser);
        const res = await request(app).put(`/users/${user._id}`).send({ email: 'aaaaaaaaa' });
        expect(res.statusCode).toBe(400);
    });

    it('should return error on update a user model validator', async () => {
        const user = await User.create(mockUser);
        const user2 = await User.create(mockUser2);
        const res = await request(app).put(`/users/${user2._id}`).send({ email: 'test@example.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('duplicate key error');
    });

    it('should return 404 for non-existent user on update', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        let res = await request(app).put(`/users/${fakeId}`).send({ name: 'X' });
        expect(res.statusCode).toBe(404);
    });

})

describe('Delete User', () => {
    it('should delete a user', async () => {
        const user = await User.create(mockUser);
        const res = await request(app).delete(`/users/${user._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User deleted');
    });

    it('should return error db on delete a user', async () => {
        jest.spyOn(User, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error('Database failure');
        });
        const user = await User.create(mockUser);
        const res = await request(app).delete(`/users/${user._id}`);
        expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent user on delete', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        let res = await request(app).delete(`/users/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });
});
