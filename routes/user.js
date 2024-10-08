import express from 'express';
import { registerUser, loginUser, verifyOtp, signIn } from '../controller/user.js';

const router = express.Router();

router.post('/register', registerUser); 
router.post('/login', signIn); 
// router.post('/login', loginUser); 
router.post('/verify-otp', verifyOtp); 

export default router;
