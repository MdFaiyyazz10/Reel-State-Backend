import express from 'express';
import {
    requestForgetPassword,
    verifyResetOtp,
    resetPassword,
    resendOtp
} from '../controller/emailOTP.js'; 

const router = express.Router();


router.post('/forgot-password', requestForgetPassword);


router.post('/verify-otp', verifyResetOtp);


router.post('/reset-password', resetPassword);


router.post('/resend-otp', resendOtp);

export default router;
