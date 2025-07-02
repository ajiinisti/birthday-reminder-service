import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/users', userRoutes);

export default app;
