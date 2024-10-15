import express from 'express';
import { registerUser, signIn, requestForgetPassword, verifyResetOtp, resetPassword, resendOtp } from '../controller/user.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', signIn);
router.post('/request-forget-password', requestForgetPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp); // New route for resending OTP

export default router;
