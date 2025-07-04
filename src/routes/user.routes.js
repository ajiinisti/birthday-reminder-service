import express from 'express';
import { createUser, getUser, getAllUsers, updateUser, deleteUser, syncBirthdayJobs } from '../controllers/user.controller.js';

const router = express.Router();
router.post('/', createUser);
router.get('/', getAllUsers)
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/jobs/sync-birthdays', syncBirthdayJobs);

export default router;