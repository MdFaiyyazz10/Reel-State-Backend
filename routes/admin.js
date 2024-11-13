import express from 'express';
import { getReferredUsers, logout, signIn, signUp } from '../controller/admin.js'; 
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/signup', signUp);

router.post('/signin', signIn);

router.delete('/logout', logout);

router.get('/referred-users', adminAuth, getReferredUsers);

export default router;
