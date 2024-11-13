import express from 'express';
import {  signIn, registerAgent, updateAgent } from '../controller/user.js';

const router = express.Router();

router.post('/register', registerAgent);
router.post('/login', signIn);
router.put('/update/:id', updateAgent);

export default router;

