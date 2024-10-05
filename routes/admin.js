import express from 'express';
import {  signIn, signUp } from '../controller/admin.js'; // Adjust the path as per your folder structure

const router = express.Router();

// Route for registering a new admin
router.post('/signup', signUp);

// Route for admin login
router.post('/signin', signIn);

export default router;
